import argparse
import hashlib
import json
import os
import sys
import tempfile
import time
import traceback
import zlib
from pathlib import Path

from filelock import FileLock
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


def add_carrier(app, window, carrier):
    window.child_window(control_id=1046, class_name="Button").click_input()
    time.sleep(1.5)
    dialog = app.top_window()
    edits = [
        control for control in dialog.descendants()
        if control.class_name() == "Edit" and control.is_enabled()
    ]
    if not edits:
        raise RuntimeError(
            "OpenPuff carrier picker did not expose an editable filename field; "
            f"dialog={dialog.window_text()!r}"
        )
    edits[-1].set_edit_text(str(carrier.resolve()))
    send_keys("{ENTER}")
    time.sleep(1.5)
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


def extracted_files(output_dir):
    return sorted(p for p in output_dir.iterdir() if p.is_file())


def wait_for_extraction(app, output_path, output_dir, timeout_seconds=30):
    deadline = time.time() + timeout_seconds
    save_dialog_seen = False
    last_sizes = None
    stable_polls = 0
    while time.time() < deadline:
        if save_dialog_if_present(app, output_path, output_dir):
            save_dialog_seen = True
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
        "carrier_added": False,
        "password_A": args.password,
        "password_BC_states": None,
        "bit_format": args.bit_format,
        "bit_level": args.bit_level,
        "bit_selection_verified": False,
        "save_dialog_seen": False,
        "output": None,
        "outputs": [],
        "expected_crc32": args.expected_crc32,
        "expected_size": args.expected_size,
        "expected_match": False,
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

        window = add_carrier(app, window, carrier)
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
            app, output_path, output_dir, args.wait_seconds
        )
        result["outputs"] = [file_facts(p) for p in extracted_files(output_dir)]
        matches = [
            item for item in result["outputs"]
            if (args.expected_crc32 is None
                or item["crc32"].upper() == args.expected_crc32.upper())
            and (args.expected_size is None
                 or item["size"] == args.expected_size)
        ]
        result["output"] = (
            matches[0] if matches else
            result["outputs"][0] if result["outputs"] else None
        )
        result["expected_match"] = bool(matches)
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
