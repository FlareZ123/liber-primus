"""Native OpenPuff 4.00 two-JPEG carrier-chain positive plant.

This test calibrates original OpenPuff multicarrier extraction. It never alters
Liber Primus original scans or claims a Cicada plaintext result.
"""
import argparse
import hashlib
import json
import math
import os
import random
import re
import tempfile
import time
import traceback
from pathlib import Path

from filelock import FileLock
from PIL import Image
from pywinauto import Desktop
from pywinauto.application import Application
from pywinauto.keyboard import send_keys

from openpuff_v400_extract import (
    acknowledge_completed_task,
    file_facts,
    safe,
    save_dialog_if_present,
    snapshot,
    snapshot_desktop,
    tree_state,
    verify_carrier_chain,
    write_json_atomic,
)


def atomic_cover(path, seed):
    rng = random.Random(seed)
    image = Image.frombytes("RGB", (1200, 1200), rng.randbytes(1200 * 1200 * 3))
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            dir=path.parent, prefix=path.stem + "-", suffix=".jpg", delete=False
        ) as temporary:
            temporary_path = Path(temporary.name)
        try:
            image.save(temporary_path, "JPEG", quality=90)
            os.replace(temporary_path, path)
        finally:
            temporary_path.unlink(missing_ok=True)


def atomic_payload(path, size):
    rng = random.Random(33011033)
    data = b"LIBER PRIMUS OPENPUFF MULTICARRIER POSITIVE CONTROL\n"
    data += rng.randbytes(size - len(data))
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            dir=path.parent, prefix="plant-", suffix=".tmp", delete=False
        ) as temporary:
            temporary.write(data)
            temporary.flush()
            os.fsync(temporary.fileno())
            temporary_path = Path(temporary.name)
        os.replace(temporary_path, path)
    return hashlib.sha256(data).hexdigest()


def visible_controls(window, class_name):
    return [
        control for control in window.descendants()
        if safe(control.class_name) == class_name
        and safe(control.is_visible)
        and safe(control.is_enabled)
    ]


def click_named(window, token):
    matches = [
        control for control in visible_controls(window, "Button")
        if (safe(control.window_text) or "").strip().lower().replace("&", "").rstrip("!") == token.lower()
    ]
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected one enabled {token!r} button, found {len(matches)}"
        )
    matches[0].click_input()


def choose_file(app, window, button_token, path, out, stage):
    prior_windows = {w.handle for w in Desktop(backend="win32").windows()}
    click_named(window, button_token)
    time.sleep(1)
    snapshot_desktop(out, stage + "-picker")
    dialogs = []
    for dialog in Desktop(backend="win32").windows():
        if (not safe(dialog.is_visible) or safe(dialog.class_name) != "#32770"
                or dialog.handle in prior_windows
                or "Data Hiding" in (safe(dialog.window_text) or "")):
            continue
        edits = visible_controls(dialog, "Edit")
        if edits:
            dialogs.append((dialog, edits))
    if not dialogs:
        raise RuntimeError("No native file-picker dialog with editable file path")
    dialog, edits = dialogs[-1]
    dialog.set_focus()
    edits[-1].set_edit_text(str(path.resolve()))
    opens = [
        c for c in visible_controls(dialog, "Button")
        if (safe(c.window_text) or "").strip().lower().replace("&", "")
        in {"open", "select"}
    ]
    if opens:
        opens[-1].click_input()
    else:
        send_keys("{ENTER}")
    time.sleep(2)
    deadline = time.monotonic() + 180
    while any(
        safe(w.is_visible) and "Adding Carriers" in (safe(w.window_text) or "")
        for w in Desktop(backend="win32").windows()
    ):
        if time.monotonic() > deadline:
            raise RuntimeError("Native Add Carriers dialog exceeded 180 seconds")
        time.sleep(1)
    snapshot(app, out, stage + "-added")
    return app.window(title_re=".*Data Hiding.*")


def native_carrier_names(window):
    carrier_list = window.child_window(control_id=1018, class_name="SysListView32")
    return [
        Path(carrier_list.get_item(index).text().strip()).name.lower()
        for index in range(carrier_list.item_count())
    ]


def add_hiding_carrier(app, window, path, expected, out, stage):
    for attempt in range(1, 4):
        window = choose_file(app, window, "Add", path, out, f"{stage}-{attempt}")
        names = native_carrier_names(window)
        print("OpenPuff Hide appended carrier", path.name,
              "attempt", attempt, "native list", names, flush=True)
        if names == expected:
            return window
        if names != expected[:-1]:
            raise RuntimeError(
                f"Native carrier list is not a prefix of expected {expected}: {names}"
            )
    raise RuntimeError(f"Original Hide did not append source carrier {path.name}")


def set_medium(window):
    trees = visible_controls(window, "SysTreeView32")
    if len(trees) != 1:
        raise RuntimeError(f"Expected one native settings tree, got {len(trees)}")
    tree = trees[0]
    root = next((r for r in tree.roots() if r.text() == "Jpeg (Image)"), None)
    if root is None:
        raise RuntimeError("Original OpenPuff JPEG settings absent")
    root.expand()
    level = root.get_child("1/5 (20%) - Medium", exact=True)
    level.ensure_visible()
    level.select()
    level.click_input(where="text")
    time.sleep(0.5)
    selected = [
        (r.text(), c.text()) for r in tree.roots()
        for c in r.children() if c.is_selected()
    ]
    if selected != [("Jpeg (Image)", "1/5 (20%) - Medium")]:
        raise RuntimeError(f"Original OpenPuff JPEG Medium selected: {selected!r}")
    return tree_state(tree)


def native_total_capacity(window):
    candidates = []
    for control in window.descendants():
        if safe(control.class_name) != "Static":
            continue
        label = (safe(control.window_text) or "").strip()
        if "bytes" not in label.lower():
            continue
        numbers = re.findall(r"\d{1,3}(?:[.,]\d{3})+|\d+", label)
        values = [int(n.replace(".", "").replace(",", "")) for n in numbers]
        if values:
            candidates.append((label, max(values)))
    if not candidates:
        raise RuntimeError("OpenPuff hiding capacity labels not found")
    # Carrier capacity is the largest native byte count; target size is zero
    # until the payload is selected.
    return max(value for label, value in candidates)


def set_password(window, password):
    edits = visible_controls(window, "Edit")
    left = sorted(
        ((c.rectangle().left, c.rectangle().top, c) for c in edits),
        key=lambda x: (x[0], x[1])
    )
    if len(left) < 1:
        raise RuntimeError("Data Hiding lacks the expected password/target edits")
    left[0][2].set_edit_text(password)
    buttons = visible_controls(window, "Button")
    layout = [
        {"id": safe(button.control_id), "text": safe(button.window_text),
         "style": safe(button.style), "checked": safe(button.get_check_state)}
        for button in buttons
    ]
    print("Original OpenPuff Hiding buttons:", json.dumps(layout), flush=True)
    checkboxes = [
        button for button in buttons
        if safe(button.style) is not None
        and (button.style() & 15) in (2, 3, 5, 6)
    ]
    # The hiding panel has exactly two Enable(B)/Enable(C) checkboxes;
    # Unhide uses different IDs (1042/1043), so do not reuse their IDs.
    checkboxes.sort(key=lambda button: button.rectangle().top)
    if len(checkboxes) != 2:
        raise RuntimeError(
            f"Expected exactly two native Enable B/C checkboxes: {layout!r}"
        )
    for checkbox in checkboxes:
        if checkbox.get_check_state():
            checkbox.uncheck_by_click_input()
            time.sleep(0.3)
        if checkbox.get_check_state():
            # Native button wrappers support direct WM_BM_SETCHECK.
            checkbox.uncheck()
            time.sleep(0.3)
        print("Disable optional password checkbox:",
              safe(checkbox.control_id), checkbox.get_check_state(), flush=True)
    states = [checkbox.get_check_state() for checkbox in checkboxes]
    if states != [0, 0]:
        raise RuntimeError(f"Optional passwords remain enabled: {states}")
    return states


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--password", default="33011033")
    args = parser.parse_args()
    exe = Path(args.exe).resolve()
    out = Path(args.out).resolve()
    covers = out / "covers"
    stego = out / "stego"
    for directory in (out, covers, stego):
        directory.mkdir(parents=True, exist_ok=True)
    carriers = [covers / "carrier-a.jpg", covers / "carrier-b.jpg"]
    for seed, path in zip((101, 202), carriers):
        atomic_cover(path, seed)
    record = {
        "source_executable": file_facts(exe),
        "cover_inputs": [file_facts(p) for p in carriers],
        "password_A": args.password,
        "password_BC_enabled": False,
        "jpeg_level": "1/5 (20%) - Medium",
        "status": "started",
    }
    write_json_atomic(out / "hide-result.json", record)
    app = None
    try:
        app = Application(backend="win32").start(str(exe), work_dir=str(out))
        time.sleep(3)
        window = app.top_window()
        window.set_focus()
        snapshot(app, out, "main")
        click_named(window, "Hide")
        time.sleep(2)
        window = app.window(title_re=".*Data Hiding.*")
        window.wait("visible", timeout=15)
        window.set_focus()
        snapshot(app, out, "hiding-initial")
        record["password_BC_states"] = set_password(window, args.password)
        record["bit_tree"] = set_medium(window)
        # Original OpenPuff Hide UI documents data-file selection before
        # adding carriers. Supply a real temporary small target first; the
        # final split target is selected only after both capacities are known.
        preliminary = out / "temporary-positive-target.bin"
        record["preliminary_sha256"] = atomic_payload(preliminary, 256)
        window = choose_file(
            app, window, "Browse", preliminary, out, "preliminary-target"
        )
        window = add_hiding_carrier(
            app, window, carriers[0], [carriers[0].name.lower()],
            out, "carrier-a"
        )
        first_capacity = native_total_capacity(window)
        window = add_hiding_carrier(
            app, window, carriers[1],
            [carrier.name.lower() for carrier in carriers], out, "carrier-b"
        )
        total_capacity = native_total_capacity(window)
        record["first_capacity"] = first_capacity
        record["total_capacity"] = total_capacity
        carrier_lists = []
        for list_control in window.descendants():
            if safe(list_control.class_name) != "SysListView32":
                continue
            count = safe(list_control.item_count)
            labels = [
                safe(list_control.get_item(index).text)
                for index in range(count or 0)
            ]
            carrier_lists.append({"id": safe(list_control.control_id),
                                  "count": count, "labels": labels})
        print("Original Hide native carrier lists:", json.dumps(carrier_lists),
              "capacity first", first_capacity, "total", total_capacity,
              flush=True)
        record["native_carrier_list_views"] = carrier_lists
        record["native_chain"] = verify_carrier_chain(window, carriers)
        record["bit_tree_after_carriers"] = set_medium(window)
        if first_capacity < 128 or total_capacity <= 1.12 * first_capacity:
            raise RuntimeError(
                f"Insufficient real two-carrier capacity: {first_capacity}, {total_capacity}"
            )
        # Enforce a payload larger than the first carrier's entire capacity.
        # The original application must use the second in an actual chain.
        payload_size = math.ceil(1.10 * first_capacity)
        if payload_size >= total_capacity:
            raise RuntimeError("Planned payload exceeds native two-carrier capacity")
        payload = out / "two-carrier-secret.bin"
        record["payload_sha256"] = atomic_payload(payload, payload_size)
        record["payload_size"] = payload_size
        window = choose_file(app, window, "Browse", payload, out, "secret")
        snapshot(app, out, "configured")
        click_named(window, "Hide Data")
        deadline = time.monotonic() + 240
        completion = []
        previous = None
        stable = 0
        while time.monotonic() < deadline:
            save_dialog_if_present(app, stego / "unused.bin", stego)
            acknowledge_completed_task(app, completion)
            actual = tuple(
                sorted(
                    (p.name, p.stat().st_size)
                    for p in stego.iterdir() if p.is_file()
                )
            )
            if actual and actual == previous:
                stable += 1
            else:
                stable = 0
            previous = actual
            if stable >= 4 and len(actual) >= 2:
                break
            time.sleep(1)
        outputs = [
            stego / carrier.name for carrier in carriers
        ]
        record["completion_dialogs"] = completion
        record["actual_stego_files"] = [
            file_facts(p) for p in stego.iterdir() if p.is_file()
        ]
        record["stego_paths"] = [str(path) for path in outputs]
        if not all(p.is_file() for p in outputs):
            raise RuntimeError("Original hide did not create both ordered JPEGs")
        if not all(
            hashlib.sha256(a.read_bytes()).digest()
            != hashlib.sha256(b.read_bytes()).digest()
            for a, b in zip(carriers, outputs)
        ):
            raise RuntimeError("OpenPuff failed to modify both ordered carriers")
        record["status"] = "hidden-two-carriers"
        snapshot(app, out, "after-hide")
    except Exception as exc:
        record["error"] = traceback.format_exc()
        raise
    finally:
        if app is not None:
            app.kill()
        write_json_atomic(out / "hide-result.json", record)
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
