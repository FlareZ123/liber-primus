import argparse
import json
import sys
import time
import traceback
from pathlib import Path

from pywinauto.application import Application


def control_record(control):
    try:
        rect = control.rectangle()
        rectangle = [rect.left, rect.top, rect.right, rect.bottom]
    except Exception:
        rectangle = None
    def safe(method):
        try:
            return method()
        except Exception:
            return None
    return {
        "text": safe(control.window_text),
        "class": safe(control.class_name),
        "friendly_class": safe(control.friendly_class_name),
        "control_id": safe(control.control_id),
        "rectangle": rectangle,
        "visible": safe(control.is_visible),
        "enabled": safe(control.is_enabled),
    }


def snapshot(window, output_dir, label):
    output_dir.mkdir(parents=True, exist_ok=True)
    records = [control_record(c) for c in window.descendants()]
    (output_dir / f"{label}-controls.json").write_text(
        json.dumps(records, indent=2), encoding="utf-8"
    )
    try:
        window.capture_as_image().save(output_dir / f"{label}.png")
    except Exception as exc:
        (output_dir / f"{label}-screenshot-error.txt").write_text(
            repr(exc), encoding="utf-8"
        )
    return records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", required=True)
    parser.add_argument("--out", default="probe-output")
    parser.add_argument("--carrier", default=None)
    parser.add_argument("--password", default="33011103")
    args = parser.parse_args()

    exe = Path(args.exe).resolve()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    if not exe.is_file():
        raise FileNotFoundError(exe)

    (out / "binary-path.txt").write_text(str(exe), encoding="utf-8")
    app = Application(backend="win32").start(str(exe), work_dir=str(exe.parent))
    time.sleep(4)

    windows = app.windows()
    (out / "windows.json").write_text(
        json.dumps([control_record(w) for w in windows], indent=2),
        encoding="utf-8",
    )
    main_window = app.top_window()
    main_window.set_focus()
    main_controls = snapshot(main_window, out, "main")

    candidates = [
        c for c in main_window.descendants()
        if "unhide" in (c.window_text() or "").lower()
    ]
    if not candidates:
        raise RuntimeError(
            "No control containing 'Unhide' was found; inspect main-controls.json"
        )

    candidates[0].click_input()
    time.sleep(2)
    unhide_window = app.top_window()
    unhide_window.set_focus()
    unhide_controls = snapshot(unhide_window, out, "unhide")
    # Record the actual v4.00 defaults before changing any carrier settings.
    options = {}
    for control_id in (1042, 1043):
        toggle = unhide_window.child_window(control_id=control_id, class_name="Button")
        options[str(control_id)] = toggle.get_check_state()
    try:
        bit_tree = unhide_window.child_window(control_id=1049, class_name="SysTreeView32")
        items = []
        def record_item(item, depth):
            row = {"depth": depth, "text": item.text()}
            try:
                row["checked"] = item.is_checked()
            except Exception:
                pass
            try:
                row["selected"] = item.is_selected()
            except Exception:
                pass
            items.append(row)
            for child in item.children():
                record_item(child, depth + 1)
        for root in bit_tree.roots():
            record_item(root, 0)
        options["bit_tree"] = items
    except Exception as exc:
        options["bit_tree_error"] = repr(exc)
    (out / "unhide-original-defaults.json").write_text(
        json.dumps(options, indent=2), encoding="utf-8"
    )

    if args.carrier:
        unhide_window.child_window(control_id=1039, class_name="Edit").set_edit_text(args.password)
        states = {}
        for control_id in (1042, 1043):
            toggle = unhide_window.child_window(control_id=control_id, class_name="Button")
            if toggle.get_check_state():
                toggle.click_input()
            states[str(control_id)] = toggle.get_check_state()
        (out / "password-toggle-states.json").write_text(json.dumps(states, indent=2), encoding="utf-8")
        snapshot(unhide_window, out, "password-filled")
        unhide_window.child_window(control_id=1046, class_name="Button").click_input()
        time.sleep(2)
        add_dialog = app.top_window()
        snapshot(add_dialog, out, "carrier-dialog")
        (out / "carrier-dialog-title.txt").write_text(add_dialog.window_text(), encoding="utf-8")
        candidates = [x for x in add_dialog.descendants() if x.class_name() == "Edit" and x.is_enabled()]
        if not candidates:
            raise RuntimeError("File dialog has no editable filename field")
        candidates[-1].set_edit_text(str(Path(args.carrier).resolve()))
        from pywinauto.keyboard import send_keys
        send_keys("{ENTER}")
        time.sleep(2)
        after = app.top_window()
        snapshot(after, out, "carrier-added")
        if "Data Unhiding" in after.window_text():
            after.child_window(control_id=1051, class_name="Button").click_input()
            time.sleep(6)
            for i, child in enumerate(app.windows()):
                snapshot(child, out, f"after-unhide-{i}")

    (out / "probe-summary.json").write_text(
        json.dumps({
            "exe": str(exe),
            "main_control_count": len(main_controls),
            "unhide_control_count": len(unhide_controls),
            "unhide_window_title": unhide_window.window_text(),
            "unhide_window_class": unhide_window.class_name(),
        }, indent=2),
        encoding="utf-8",
    )
    app.kill()


if __name__ == "__main__":
    try:
        main()
    except Exception:
        Path("probe-output").mkdir(exist_ok=True)
        Path("probe-output/error.txt").write_text(
            traceback.format_exc(), encoding="utf-8"
        )
        print(traceback.format_exc(), file=sys.stderr)
        sys.exit(1)
