import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
import time
import traceback
import zlib
from pathlib import Path

from filelock import FileLock
from pywinauto import Desktop
from pywinauto.application import Application
from pywinauto.keyboard import send_keys


def safe(method):
    try:
        return method()
    except Exception:
        return None


def control_record(control):
    rect = safe(control.rectangle)
    rectangle = None if rect is None else [rect.left, rect.top, rect.right, rect.bottom]
    return {
        "text": safe(control.window_text),
        "class": safe(control.class_name),
        "friendly_class": safe(control.friendly_class_name),
        "control_id": safe(control.control_id),
        "rectangle": rectangle,
        "visible": safe(control.is_visible),
        "enabled": safe(control.is_enabled),
    }


def window_record(window):
    return {
        "title": safe(window.window_text),
        "class": safe(window.class_name),
        "visible": safe(window.is_visible),
        "controls": [control_record(c) for c in (safe(window.descendants) or [])],
    }


def write_text_atomic(path, content):
    """Publish complete evidence records under an inter-process file lock."""
    path = Path(path)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent,
            prefix=path.name + ".", suffix=".tmp", delete=False
        ) as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
            tmp = Path(handle.name)
        try:
            os.replace(tmp, path)
        finally:
            if tmp.exists():
                tmp.unlink()


def write_json_atomic(path, record):
    write_text_atomic(path, json.dumps(record, indent=2))


def snapshot(app, out_dir, stage):
    records = []
    for index, window in enumerate(app.windows()):
        record = window_record(window)
        record["index"] = index
        records.append(record)
    write_json_atomic(out_dir / f"{stage}-windows.json", records)
    return records


def snapshot_desktop(out_dir, stage):
    """Capture visible top-level windows across processes, including common dialogs."""
    desktop = Desktop(backend="win32")
    records = []
    for index, window in enumerate(desktop.windows()):
        if not safe(window.is_visible):
            continue
        record = window_record(window)
        record["index"] = index
        records.append(record)
        try:
            window.capture_as_image().save(out_dir / f"{stage}-window-{index}.png")
        except Exception:
            pass
    write_json_atomic(out_dir / f"{stage}-windows.json", records)
    return records


def tree_state(tree):
    state = []
    for root in tree.roots():
        for child in root.children():
            try:
                checked = bool(child.is_checked())
                error = None
            except Exception as exc:
                checked = None
                error = repr(exc)
            state.append({
                "format": root.text(),
                "level": child.text(),
                "checked": checked,
                "error": error,
            })
    return state


def select_bit_level(window, format_name, level_name):
    tree = window.child_window(control_id=1049, class_name="SysTreeView32")
    root = next((item for item in tree.roots() if item.text() == format_name), None)
    if root is None:
        raise RuntimeError(f"Bit-selection format not found: {format_name}")
    root.expand()
    target = root.get_child(level_name, exact=True)
    target.ensure_visible()

    # Native TreeView checkbox hit testing is exposed by pywinauto as where='check'.
    for item in root.children():
        if item.text() != level_name and item.is_checked():
            item.click_input(where="check")
    if not target.is_checked():
        target.click_input(where="check")
    time.sleep(0.3)

    selected = [item.text() for item in root.children() if item.is_checked()]
    if selected != [level_name]:
        raise RuntimeError(
            f"Bit-selection verification failed for {format_name}: {selected!r}"
        )
    return tree_state(tree)


def disable_optional_passwords(window):
    states = {}
    for control_id in (1042, 1043):
        toggle = window.child_window(control_id=control_id, class_name="Button")
        if toggle.get_check_state():
            toggle.click_input()
        states[str(control_id)] = int(toggle.get_check_state())
    if states != {"1042": 0, "1043": 0}:
        raise RuntimeError(f"Could not disable OpenPuff passwords B/C: {states}")
    return states


def add_carrier(app, window, carrier, out_dir):
    previous_title = safe(window.window_text) or ""
    window.child_window(control_id=1046, class_name="Button").click_input()
    time.sleep(2)
    # The common file picker may be owned outside OpenPuff's process. Inspect
    # all desktop windows rather than assuming app.top_window() is the dialog.
    snapshot_desktop(out_dir, "carrier-dialog")
    desktop = Desktop(backend="win32")
    candidates = []
    for candidate in desktop.windows():
        if not safe(candidate.is_visible):
            continue
        if safe(candidate.class_name) != "#32770":
            continue
        title = safe(candidate.window_text) or ""
        if title == previous_title or "Data Unhiding" in title:
            continue
        edits = [
            control for control in (safe(candidate.descendants) or [])
            if safe(control.class_name) == "Edit"
            and safe(control.is_visible)
            and safe(control.is_enabled)
        ]
        if edits:
            candidates.append((candidate, edits))
    if not candidates:
        raise RuntimeError(
            "OpenPuff did not expose a distinct editable file-picker window; "
            "desktop window snapshots were saved"
        )
    dialog, edits = candidates[-1]
    dialog.set_focus()
    edits[-1].set_edit_text(str(carrier.resolve()))
    open_buttons = [
        control for control in (safe(dialog.descendants) or [])
        if safe(control.class_name) == "Button"
        and (safe(control.window_text) or "").strip().lower().replace("&", "") in {"open", "select"}
        and safe(control.is_enabled)
    ]
    if open_buttons:
        open_buttons[-1].click_input()
    else:
        send_keys("{ENTER}")
    time.sleep(2)
    snapshot_desktop(out_dir, "carrier-after-selection")
    snapshot(app, out_dir, "carrier-after-selection-app")
    return app.top_window()


def save_dialog_if_present(app, output_path, output_dir):
    handled = False
    for window in app.windows():
        if not safe(window.is_visible):
            continue
        title = (safe(window.window_text) or "").lower()
        controls = safe(window.descendants) or []
        edits = [
            c for c in controls
            if safe(c.class_name) == "Edit" and safe(c.is_enabled)
        ]
        buttons = [c for c in controls if safe(c.class_name) == "Button"]
        button_names = [(safe(c.window_text) or "").strip().lower() for c in buttons]
        save_button = next(
            (c for c in buttons
             if (safe(c.window_text) or "").strip().lower() in {"save", "ok"}),
            None,
        )
        looks_like_folder = "folder" in title or "browse" in title
        looks_like_save = (
            "save" in title or "hidden file" in title or "output" in title
            or "save" in button_names or looks_like_folder
        )
        if looks_like_folder and save_button is not None and not edits:
            raise RuntimeError(
                f"OpenPuff folder picker {title!r} has no editable path. "
                "No output-directory selection was performed; this is a UI "
                "automation failure, not a negative steganographic test."
            )
        if edits and save_button is not None and looks_like_save:
            # OpenPuff can ask for an output *directory* and restore its embedded
            # filename. Passing a filename to a folder picker would be invalid.
            choice = output_dir if looks_like_folder else output_path
            edits[-1].set_edit_text(str(choice.resolve()))
            save_button.click_input()
            handled = True
            time.sleep(1.5)
    return handled



def acknowledge_completed_task(app, events):
    """Acknowledge the documented OpenPuff completion modal only."""
    for window in app.windows():
        if not safe(window.is_visible):
            continue
        title = (safe(window.window_text) or "").strip()
        controls = safe(window.descendants) or []
        message = " ".join(
            (safe(c.window_text) or "").strip()
            for c in controls if safe(c.class_name) == "Static"
        )
        if "task completed" not in title.lower():
            continue
        if not re.search(r"\b\d+\s*/\s*\d+\s+carriers?\s+processed\b",
                         message, flags=re.IGNORECASE):
            continue
        confirm = next(
            (c for c in controls
             if safe(c.class_name) == "Button"
             and (safe(c.window_text) or "").strip().lower() == "ok"),
            None,
        )
        if confirm is None:
            raise RuntimeError("OpenPuff completion dialog lacks an OK button")
        events.append({"title": title, "message": message})
        confirm.click_input()
        time.sleep(0.2)
    return events


def extracted_files(output_dir):
    return sorted(p for p in output_dir.iterdir() if p.is_file())


def wait_for_extraction(app, output_path, output_dir, timeout_seconds=30, completion_events=None):
    deadline = time.time() + timeout_seconds
    save_dialog_seen = False
    last_sizes = None
    stable_polls = 0
    if completion_events is None:
        completion_events = []
    while time.time() < deadline:
        if save_dialog_if_present(app, output_path, output_dir):
            save_dialog_seen = True
        acknowledge_completed_task(app, completion_events)
        # The embedded record determines the filename. Only accept an output
        # after file sizes have stopped changing across several polls.
        sizes = tuple((p.name, p.stat().st_size) for p in extracted_files(output_dir))
        if sizes and sizes == last_sizes:
            stable_polls += 1
            if stable_polls >= 3:
                break
        else:
            stable_polls = 0
        last_sizes = sizes
        time.sleep(0.5)
    return save_dialog_seen


def file_facts(path):
    if not path.is_file():
        return None
    data = path.read_bytes()
    return {
        "path": str(path),
        "size": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "md5": hashlib.md5(data).hexdigest(),
        "crc32": f"{zlib.crc32(data) & 0xffffffff:08X}",
    }


def classify_outputs(files, expected_crc32=None, expected_size=None):
    """Keep unauthenticated LP2 candidates distinct from a known-output match."""
    outputs = [file_facts(path) for path in files]
    expectation_supplied = expected_crc32 is not None or expected_size is not None
    matches = [
        item for item in outputs
        if (expected_crc32 is None
            or item["crc32"].upper() == expected_crc32.upper())
        and (expected_size is None or item["size"] == expected_size)
    ] if expectation_supplied else []
    return {
        "outputs": outputs,
        "output": matches[0] if matches else outputs[0] if outputs else None,
        "output_present": bool(outputs),
        "expected_match": bool(matches) if expectation_supplied else None,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Run a source-native OpenPuff v4.00 extraction with verified UI settings."
    )
    parser.add_argument("--exe", required=True)
    parser.add_argument("--carrier", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--bit-format", required=True)
    parser.add_argument("--bit-level", required=True)
    parser.add_argument("--out", required=True, help="Directory for evidence and extracted output")
    parser.add_argument("--output-name", default="openpuff-extracted.bin")
    parser.add_argument("--wait-seconds", type=int, default=30)
    parser.add_argument("--expected-crc32", default=None)
    parser.add_argument("--expected-size", type=int, default=None)
    args = parser.parse_args()

    exe = Path(args.exe).resolve()
    carrier = Path(args.carrier).resolve()
    out_dir = Path(args.out).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    output_name = Path(args.output_name).name
    if output_name in {"", ".", ".."}:
        raise ValueError("Invalid output filename")
    output_dir = out_dir / "extracted"
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / output_name
    # Reusing an evidence directory must never turn a previous extracted file
    # into a false positive for the current source carrier.
    for previous in extracted_files(output_dir):
        previous.unlink()
    if not exe.is_file():
        raise FileNotFoundError(exe)
    if not carrier.is_file():
        raise FileNotFoundError(carrier)

    write_json_atomic(out_dir / "input.json", {
        "exe": str(exe),
        "exe_size_bytes": exe.stat().st_size,
        "carrier": str(carrier),
        "carrier_facts": file_facts(carrier),
        "password_A": args.password,
        "password_B_enabled": False,
        "password_C_enabled": False,
        "bit_format": args.bit_format,
        "bit_level": args.bit_level,
        "expected_crc32": args.expected_crc32,
        "expected_size": args.expected_size,
    })

    app = None
    result = {
        "attempted": False,
        "carrier": str(carrier),
        "carrier_basename": carrier.name,
        "carrier_added": False,
        "password_A": args.password,
        "password_BC_states": None,
        "bit_format": args.bit_format,
        "bit_level": args.bit_level,
        "bit_selection_verified": False,
        "save_dialog_seen": False,
        "completion_dialogs": [],
        "output": None,
        "outputs": [],
        "output_present": False,
        "expected_crc32": args.expected_crc32,
        "expected_size": args.expected_size,
        "expected_match": None,
    }
    try:
        app = Application(backend="win32").start(str(exe), work_dir=str(out_dir))
        time.sleep(3)
        main_window = app.top_window()
        main_window.set_focus()
        snapshot(app, out_dir, "main")
        unhide_buttons = [
            c for c in main_window.descendants()
            if "unhide" in (safe(c.window_text) or "").lower()
        ]
        if not unhide_buttons:
            raise RuntimeError("OpenPuff main window has no Unhide button")
        unhide_buttons[0].click_input()
        time.sleep(1.5)
        window = app.top_window()
        window.set_focus()
        snapshot(app, out_dir, "unhide-before-settings")

        window.child_window(control_id=1039, class_name="Edit").set_edit_text(args.password)
        result["password_BC_states"] = disable_optional_passwords(window)
        password_status = window.child_window(
            control_id=1044, class_name="Static"
        ).window_text()
        result["password_status"] = password_status
        if "too short" in password_status.lower():
            raise RuntimeError(f"OpenPuff rejected password length: {password_status}")

        window = add_carrier(app, window, carrier, out_dir)
        if "Data Unhiding" not in (safe(window.window_text) or ""):
            window = app.window(title_re=".*Data Unhiding.*")
            window.wait("visible", timeout=5)
        selected_bytes = window.child_window(
            control_id=1048, class_name="Static"
        ).window_text()
        result["selected_carrier_bytes"] = selected_bytes
        if selected_bytes.strip().startswith("0 bytes"):
            raise RuntimeError("OpenPuff did not add the carrier")
        result["carrier_added"] = True

        result["bit_tree"] = select_bit_level(window, args.bit_format, args.bit_level)
        result["bit_selection_verified"] = True
        snapshot(app, out_dir, "configured")

        window.child_window(control_id=1051, class_name="Button").click_input()
        result["attempted"] = True
        result["save_dialog_seen"] = wait_for_extraction(
            app, output_path, output_dir, args.wait_seconds,
            result["completion_dialogs"]
        )
        result.update(classify_outputs(
            extracted_files(output_dir), args.expected_crc32, args.expected_size
        ))
        result["windows_after_unhide"] = snapshot(app, out_dir, "after-unhide")
    finally:
        if app is not None:
            try:
                app.kill()
            except Exception:
                pass
        write_json_atomic(out_dir / "result.json", result)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        # Preserve an error in the same per-carrier evidence directory that
        # the workflow uploads, including when processing the last LP2 page.
        out_arg = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else "probe-output"
        error_dir = Path(out_arg)
        error_dir.mkdir(parents=True, exist_ok=True)
        write_text_atomic(error_dir / "error.txt", traceback.format_exc())
        print(traceback.format_exc(), file=sys.stderr)
        sys.exit(1)
