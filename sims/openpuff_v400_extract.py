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
from ctypes import create_unicode_buffer, sizeof

from filelock import FileLock
from pywinauto import Desktop
from pywinauto.application import Application
from pywinauto.keyboard import send_keys
from pywinauto.remote_memory_block import RemoteMemoryBlock


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
    """Record both native TreeView selection and optional state-image telemetry."""
    state = []
    for root in tree.roots():
        for child in root.children():
            state.append({
                "format": root.text(),
                "level": child.text(),
                "selected": bool(child.is_selected()),
                "checked": bool(child.is_checked()),
                "state": int(child.state()),
            })
    return state


def select_bit_level(window, format_name, level_name):
    """Choose the real single-selected OpenPuff TreeView level.

    OpenPuff's native options TreeView has no checkbox hit rectangle. The
    menu's active format/level is the selected tree item (TVIS_SELECTED);
    TVIS_STATEIMAGEMASK and pywinauto is_checked() are unrelated here.
    """
    tree = window.child_window(control_id=1049, class_name="SysTreeView32")
    root = next((item for item in tree.roots() if item.text() == format_name), None)
    if root is None:
        raise RuntimeError(f"Bit-selection format not found: {format_name}")
    root.expand()
    target = root.get_child(level_name, exact=True)
    target.ensure_visible()
    target.select()
    target.click_input(where="text")
    time.sleep(0.3)

    selected = [
        (item_root.text(), child.text())
        for item_root in tree.roots()
        for child in item_root.children()
        if child.is_selected()
    ]
    expected = [(format_name, level_name)]
    if selected != expected:
        raise RuntimeError(
            f"OpenPuff native TreeView selection mismatch: "
            f"wanted {expected!r}, observed {selected!r}"
        )
    print(f"Selected original OpenPuff bit level: {format_name} / {level_name}")
    return tree_state(tree)


def parse_capacity(readout):
    """Read native OpenPuff capacity under comma or dot thousands grouping.

    Original pinned 2014 Windows GUI emitted "1.088 bytes" in run
    43641015921. These group characters are not decimal fractions.
    """
    match = re.fullmatch(
        r"\s*((?:\d{1,3}(?:[.,]\d{3})+)|\d+)\s+bytes?\s*", readout
    )
    if match is None:
        raise RuntimeError(
            f"OpenPuff carrier-capacity readout was not numeric: {readout!r}"
        )
    return int(match.group(1).replace(",", "").replace(".", ""))


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


def wait_for_native_file_picker(previous_title, timeout_seconds=15):
    """Poll for the original common-file dialog after the UI's Add action."""
    deadline = time.monotonic() + timeout_seconds
    while True:
        candidates = []
        for candidate in Desktop(backend="win32").windows():
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
        if candidates:
            return candidates[-1]
        if time.monotonic() >= deadline:
            return None
        time.sleep(0.5)


def add_carrier(app, window, carrier, out_dir, stage="carrier"):
    previous_title = safe(window.window_text) or ""
    window.child_window(control_id=1046, class_name="Button").click_input()
    time.sleep(2)
    # The common file picker may be owned outside OpenPuff's process. Inspect
    # all desktop windows rather than assuming app.top_window() is the dialog.
    snapshot_desktop(out_dir, f"{stage}-dialog")
    picker = wait_for_native_file_picker(previous_title, timeout_seconds=15)
    if picker is None:
        snapshot_desktop(out_dir, f"{stage}-picker-timeout")
        raise RuntimeError(
            "OpenPuff did not expose a distinct editable file-picker window "
            "within 15 seconds; desktop window snapshots were saved"
        )
    dialog, edits = picker
    # A real 2014 MP3 positive-control run (43678314349) hung inside
    # set_focus() -> WaitGuiThreadIdle() on the native Windows file picker.
    # set_edit_text addresses the exact HWND directly and does not require
    # waiting for its GUI thread to become idle.
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
    # A multi-megabyte MP3 can leave the "Adding Carriers" progress
    # window open while the main window already reports nonzero bytes.
    # The modal overlay intercepts tree clicks until carrier parsing ends.
    # Allow the asynchronous file-picker-to-progress transition to begin
    # before judging the native modal absent.
    time.sleep(2)
    deadline = time.monotonic() + 300
    while True:
        pending = [
            candidate for candidate in Desktop(backend="win32").windows()
            if safe(candidate.is_visible)
            and "Adding Carriers" in (safe(candidate.window_text) or "")
        ]
        if not pending:
            break
        if time.monotonic() > deadline:
            snapshot_desktop(out_dir, f"{stage}-parse-timeout")
            raise RuntimeError("Historical carrier parsing modal exceeded 300 seconds")
        time.sleep(1)
    time.sleep(0.5)
    snapshot_desktop(out_dir, f"{stage}-after-selection")
    snapshot(app, out_dir, f"{stage}-after-selection-app")
    return app.top_window()



def verify_carrier_chain(window, carriers):
    """Read the real OpenPuff ordered native list before clicking Unhide.

    A 58-file loop with a silently dropped/auto-reordered item is
    inconclusive. Never classify its lack of output as a negative.
    """
    expected = [item.name.lower() for item in carriers]
    for control in window.descendants():
        if safe(control.class_name) != "SysListView32":
            continue
        count = safe(control.item_count)
        if count != len(expected):
            continue
        labels = [control.get_item(index).text() for index in range(count)]
        observed = [Path(text.strip()).name.lower() for text in labels]
        if observed == expected:
            return labels
    raise RuntimeError(
        f"OpenPuff native carrier chain did not verify {len(expected)} "
        f"files in the submitted order; original window evidence retained"
    )

def save_dialog_if_present(app, output_path, output_dir):
    handled = False
    for window in app.windows():
        if not safe(window.is_visible):
            continue
        title = (safe(window.window_text) or "").lower()
        controls = safe(window.descendants) or []
        edits = [
            c for c in controls
            if safe(c.class_name) == "Edit"
            and safe(c.is_enabled)
            and safe(c.is_visible)
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
            # The old SHBrowseForFolder dialog can expose a TreeView and no
            # editable field. BFFM_SETSELECTIONW requires a path pointer in
            # the target process; WM_USER+103 is not system-marshalled.
            shell_tree = next(
                (c for c in controls if safe(c.class_name) == "SysTreeView32"),
                None,
            )
            if shell_tree is None:
                raise RuntimeError(
                    f"OpenPuff folder picker {title!r} has no native shell "
                    "TreeView; refusing to send a private window message."
                )
            folder = str(output_dir.resolve())
            folder_buffer = create_unicode_buffer(folder)
            remote_path = RemoteMemoryBlock(window, size=sizeof(folder_buffer))
            try:
                remote_path.Write(folder_buffer)
                window.send_message(0x0400 + 103, 1, remote_path.Address())
                time.sleep(0.5)
                # The extracted file's existence and CRC remain the final
                # acceptance test. This UI action is never its own proof.
                save_button.click_input()
            finally:
                del remote_path
            handled = True
            time.sleep(1.5)
            continue
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


def acknowledge_corrupted_stream_task(app, error_events):
    """Record and acknowledge the exact native OpenPuff corrupted-stream error."""
    for window in app.windows():
        if not safe(window.is_visible):
            continue
        title = (safe(window.window_text) or "").strip()
        if "task interrupted - error" not in title.lower():
            continue
        controls = safe(window.descendants) or []
        message = " ".join(
            (safe(c.window_text) or "").strip()
            for c in controls if safe(c.class_name) == "Static"
        )
        if "task stopped: corrupted stream" not in message.lower():
            continue
        confirm = next(
            (c for c in controls
             if safe(c.class_name) == "Button"
             and (safe(c.window_text) or "").strip().lower() == "ok"),
            None,
        )
        if confirm is None:
            raise RuntimeError("OpenPuff corrupted-stream dialog lacks an OK button")
        error_events.append({"title": title, "message": message})
        confirm.click_input()
        time.sleep(0.2)
        return True
    return False


def extracted_files(output_dir):
    return sorted(p for p in output_dir.iterdir() if p.is_file())


def wait_for_extraction(app, output_path, output_dir, timeout_seconds=30, completion_events=None, error_events=None):
    deadline = time.time() + timeout_seconds
    save_dialog_seen = False
    last_sizes = None
    stable_polls = 0
    if completion_events is None:
        completion_events = []
    if error_events is None:
        error_events = []
    while time.time() < deadline:
        if save_dialog_if_present(app, output_path, output_dir):
            save_dialog_seen = True
        acknowledge_completed_task(app, completion_events)
        if acknowledge_corrupted_stream_task(app, error_events):
            break
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


def openpuff_crc32(data: bytes) -> str:
    """OpenPuff/libObfuscate's MSB-first, no-final-XOR variant (not zlib CRC32).

    Verified against the original 745-byte Cicada magicsquares.txt:
    OpenPuff 6A8C41E3; ordinary reflected CRC32 5E547914.
    Reference: tweqx/LibrePuff librepuff/src/crc32.rs.
    """
    checksum = 0xFFFFFFFF
    for byte in data:
        for bit in range(7, -1, -1):
            if ((checksum >> 31) ^ ((byte >> bit) & 1)) != 0:
                checksum = (((checksum ^ 0x02608EDB) << 1) | 1) & 0xFFFFFFFF
            else:
                checksum = (checksum << 1) & 0xFFFFFFFF
    return f"{checksum:08X}"


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
        "openpuff_crc32": openpuff_crc32(data),
    }


def classify_outputs(files, expected_crc32=None, expected_size=None):
    """Keep unauthenticated LP2 candidates distinct from a known-output match."""
    outputs = [file_facts(path) for path in files]
    expectation_supplied = expected_crc32 is not None or expected_size is not None
    matches = [
        item for item in outputs
        if (expected_crc32 is None
            or item["openpuff_crc32"].upper() == expected_crc32.upper())
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
    parser.add_argument("--carrier", required=True, action="append",
                        help="Repeat once per carrier in exact chain order")
    parser.add_argument("--password", required=True)
    parser.add_argument("--password-b", default=None, help="Optional source-published password B")
    parser.add_argument("--password-c", default=None, help="Optional source-published password C")
    parser.add_argument("--bit-format", required=True)
    parser.add_argument("--bit-level", required=True)
    parser.add_argument("--extra-bit-selection", nargs=2, action="append",
                        metavar=("FORMAT", "LEVEL"), default=[],
                        help="Additional source-specified format and level for mixed carrier chains")
    parser.add_argument("--out", required=True, help="Directory for evidence and extracted output")
    parser.add_argument("--output-name", default="openpuff-extracted.bin")
    parser.add_argument("--wait-seconds", type=int, default=30)
    parser.add_argument("--expected-crc32", default=None)
    parser.add_argument("--expected-size", type=int, default=None)
    args = parser.parse_args()
    if (args.password_b is None) != (args.password_c is None):
        parser.error("The native optional password controls require B and C together")
    extra_levels = [tuple(pair) for pair in args.extra_bit_selection]

    exe = Path(args.exe).resolve()
    carriers = [Path(value).resolve() for value in args.carrier]
    carrier = carriers[0]
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
    for carrier_path in carriers:
        if not carrier_path.is_file():
            raise FileNotFoundError(carrier_path)

    write_json_atomic(out_dir / "input.json", {
        "exe": str(exe),
        "exe_size_bytes": exe.stat().st_size,
        "carrier": str(carrier),
        "carrier_facts": file_facts(carrier),
        "carrier_chain": [file_facts(item) for item in carriers],
        "password_A": args.password,
        "password_B_enabled": args.password_b is not None,
        "password_C_enabled": args.password_c is not None,
        "password_B": args.password_b,
        "password_C": args.password_c,
        "bit_format": args.bit_format,
        "bit_level": args.bit_level,
        "extra_bit_selection": extra_levels,
        "expected_crc32": args.expected_crc32,
        "expected_size": args.expected_size,
    })

    app = None
    result = {
        "attempted": False,
        "carrier": str(carrier),
        "carrier_basename": carrier.name,
        "carrier_chain_order": [item.name for item in carriers],
        "carrier_chain_verified": False,
        "carrier_count": len(carriers),
        "carrier_added": False,
        "password_A": args.password,
        "password_BC_states": None,
        "additional_bit_selections": extra_levels,
        "bit_format": args.bit_format,
        "bit_level": args.bit_level,
        "bit_selection_verified": False,
        "save_dialog_seen": False,
        "completion_dialogs": [],
        "error_dialogs": [],
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
        if args.password_b is None:
            result["password_BC_states"] = disable_optional_passwords(window)
        else:
            # Both optional passwords are source-fixed for this multicarrier
            # control. Keep native checkboxes enabled and address HWNDs exactly.
            for control_id, value in ((1040, args.password_b), (1041, args.password_c)):
                window.child_window(control_id=control_id, class_name="Edit").set_edit_text(value)
            result["password_BC_states"] = {
                str(control_id): int(window.child_window(
                    control_id=control_id, class_name="Button").get_check_state())
                for control_id in (1042, 1043)
            }
            if result["password_BC_states"] != {"1042": 1, "1043": 1}:
                raise RuntimeError("Published three-password control was not enabled in native GUI")
        password_status = window.child_window(
            control_id=1044, class_name="Static"
        ).window_text()
        result["password_status"] = password_status
        if "too short" in password_status.lower():
            raise RuntimeError(f"OpenPuff rejected password length: {password_status}")

        for index, item in enumerate(carriers):
            window = add_carrier(app, window, item, out_dir,
                                 f"carrier-{index:02d}")
            if "Data Unhiding" not in (safe(window.window_text) or ""):
                window = app.window(title_re=".*Data Unhiding.*")
                window.wait("visible", timeout=5)
        if len(carriers) > 1:
            result["carrier_chain_native"] = verify_carrier_chain(window, carriers)
            result["carrier_chain_verified"] = True
        selected_bytes = window.child_window(
            control_id=1048, class_name="Static"
        ).window_text()
        result["selected_carrier_bytes"] = selected_bytes
        if selected_bytes.strip().startswith("0 bytes"):
            raise RuntimeError("OpenPuff did not add the carrier")
        result["carrier_added"] = True

        try:
            result["bit_tree"] = select_bit_level(window, args.bit_format, args.bit_level)
            for format_name, level_name in extra_levels:
                result["bit_tree"] = select_bit_level(window, format_name, level_name)
        except Exception:
            tree = window.child_window(control_id=1049, class_name="SysTreeView32")
            write_json_atomic(out_dir / "bit-selection-failure-state.json", tree_state(tree))
            snapshot_desktop(out_dir, "bit-selection-failure")
            raise
        # Independently inspect OpenPuff's own carrier-capacity readout after
        # changing the bit-selection level. Selection highlighting alone is
        # not proof that enough carrier bits are available for the known control.
        after_label = window.child_window(
            control_id=1048, class_name="Static"
        ).window_text()
        result["selected_carrier_bytes_after_level"] = after_label
        capacity = parse_capacity(after_label)
        result["selected_capacity_bytes_after_level"] = capacity
        if args.expected_size is not None and capacity < args.expected_size:
            raise RuntimeError(
                f"Selected carrier capacity {capacity} bytes is smaller than "
                f"known historical output {args.expected_size} bytes; "
                "bit selection cannot yet validate this source control"
            )
        result["bit_selection_verified"] = True
        snapshot(app, out_dir, "configured")

        window.child_window(control_id=1051, class_name="Button").click_input()
        result["attempted"] = True
        result["save_dialog_seen"] = wait_for_extraction(
            app, output_path, output_dir, args.wait_seconds,
            result["completion_dialogs"], result["error_dialogs"]
        )
        result.update(classify_outputs(
            extracted_files(output_dir), args.expected_crc32, args.expected_size
        ))
        # Absence of a saved file at the polling deadline is not a native
        # negative when the application has never displayed completion.
        if result["output_present"]:
            result["native_probe_outcome"] = "output-file"
        elif result["error_dialogs"]:
            result["native_probe_outcome"] = "native-corrupted-stream"
        elif result["completion_dialogs"]:
            result["native_probe_outcome"] = "completed-without-file"
        else:
            result["native_probe_outcome"] = "inconclusive-timeout"
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
