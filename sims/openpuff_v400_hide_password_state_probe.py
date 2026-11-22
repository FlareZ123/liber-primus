"""Isolated native OpenPuff 4.00 Hide password-state experiment.

Tests the effect of A-entry order on B/C-disabled password validation.
Works entirely on generated synthetic data; no LP2 carrier.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import tempfile
import time
import traceback
from pathlib import Path

from filelock import FileLock
from pywinauto import Desktop
from pywinauto.application import Application
from pywinauto.keyboard import send_keys

from openpuff_v400_extract import file_facts, snapshot, write_json_atomic
from openpuff_v400_native_twocarrier_plant import click_named, choose_file

PASSWORD = "N7wX4cP8rZ2gH6qT9vK3"
MODES = ("set-after", "type-after", "type-before", "set-before")


def _write_target(path: Path) -> None:
    data = b"Synthetic OpenPuff native GUI password-state probe\n" * 8
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temp:
            temp.write(data)
            temp.flush()
            os.fsync(temp.fileno())
            temp_path = Path(temp.name)
        os.replace(temp_path, path)


def _meter(window) -> dict:
    return {
        "status": window.child_window(control_id=1014, class_name="Static").window_text(),
        "B": int(window.child_window(control_id=1012, class_name="Button").get_check_state()),
        "C": int(window.child_window(control_id=1013, class_name="Button").get_check_state()),
    }


def _disable_optional(window) -> None:
    for control_id in (1013, 1012):
        control = window.child_window(control_id=control_id, class_name="Button")
        if control.get_check_state():
            control.uncheck_by_click_input()
            time.sleep(0.5)
            warnings = [
                w for w in Desktop(backend="win32").windows()
                if w.is_visible() and w.window_text().strip() == "Warning"
            ]
            if warnings:
                if len(warnings) != 1:
                    raise RuntimeError(f"Expected one native Warning, got {len(warnings)}")
                dialog = warnings[0]
                static_text = " ".join(
                    child.window_text() for child in dialog.descendants()
                    if child.class_name() == "Static"
                )
                if "Are you sure you want to disable it?" not in static_text:
                    raise RuntimeError(f"Unexpected native password warning: {static_text!r}")
                yes = [
                    child for child in dialog.descendants()
                    if child.class_name() == "Button"
                    and child.window_text().strip().replace("&", "").lower() == "yes"
                ]
                if len(yes) != 1:
                    raise RuntimeError("Native password warning has no unique Yes button")
                print("CONFIRMED_NATIVE_PASSWORD_DISABLE", control_id, static_text, flush=True)
                yes[0].click_input()
                time.sleep(0.6)
        if control.get_check_state():
            raise RuntimeError(f"Native optional checkbox {control_id} remained checked after Yes")


def _enter_a(window, method: str) -> None:
    a = window.child_window(control_id=1009, class_name="Edit")
    a.set_edit_text("")
    if method == "type":
        a.click_input()
        send_keys(PASSWORD, pause=0.02)
    else:
        a.set_edit_text(PASSWORD)
    a.set_focus()
    send_keys("{TAB}")
    time.sleep(0.5)


def _run_mode(exe: Path, out: Path, mode: str, target: Path) -> dict:
    app = None
    result = {"mode": mode, "source_executable": file_facts(exe),
              "password_length": len(PASSWORD),
              "password_sha256": hashlib.sha256(PASSWORD.encode()).hexdigest(),
              "status": "started", "stages": {}}
    try:
        app = Application(backend="win32").start(str(exe), work_dir=str(out))
        time.sleep(1.5)
        top = app.top_window()
        click_named(top, "Hide")
        window = app.window(title_re=".*Data Hiding.*")
        window.wait("visible", timeout=15)
        result["stages"]["initial"] = _meter(window)
        action, order = mode.split("-")
        if order == "before":
            _enter_a(window, action)
            result["stages"]["after-A"] = _meter(window)
            _disable_optional(window)
        else:
            _disable_optional(window)
            result["stages"]["after-B-C-off"] = _meter(window)
            _enter_a(window, action)
        result["stages"]["configured"] = _meter(window)
        window = choose_file(app, window, "Browse", target, out, mode)
        result["stages"]["post-Browse"] = _meter(window)
        snapshot(app, out, mode + "-final")
        result["status"] = "recorded"
    except Exception:
        result["error"] = traceback.format_exc()
        result["status"] = "exception"
    finally:
        if app:
            try:
                app.kill()
            except Exception:
                pass
        write_json_atomic(out / (mode + "-result.json"), result)
    print("PASSWORD_STATE_PROBE", json.dumps(result, sort_keys=True), flush=True)
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    exe = Path(args.exe).resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    target = out / "synthetic-target.bin"
    _write_target(target)
    results = [_run_mode(exe, out, mode, target) for mode in MODES]
    write_json_atomic(out / "summary.json", {"variants": results})
    if any(r["status"] != "recorded" for r in results):
        raise RuntimeError("At least one native password-state mode did not execute")
    print("PASSWORD_STATE_MATRIX", json.dumps([
        {"mode": r["mode"], "stages": r["stages"]} for r in results
    ], sort_keys=True), flush=True)


if __name__ == "__main__":
    main()
