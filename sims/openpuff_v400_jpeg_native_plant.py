"""OpenPuff 4.00 native JPEG Hide/Unhide proof, using only a synthetic source image.

The first mode inventories original Data Hiding GUI controls to avoid guessed
Windows control IDs. It writes complete screenshots and machine-readable
records for subsequent exact native Hide/Unhide plant reconstruction.
"""
import argparse
import json
import random
import sys
import time
import traceback
from pathlib import Path

from PIL import Image
from pywinauto.application import Application

from openpuff_v400_extract import (
    safe, snapshot, snapshot_desktop, write_json_atomic, write_text_atomic
)


def generate_fixture(folder):
    """Make stable, non-LP2 JPEG and innocuous payload bytes."""
    folder.mkdir(parents=True, exist_ok=True)
    rng = random.Random(0x33011033)
    image = Image.frombytes("RGB", (1000, 1400), rng.randbytes(1000 * 1400 * 3))
    img_path = folder / "fixture-00.jpg"
    image.save(img_path, format="JPEG", quality=85)
    payload = folder / "fixture-message.txt"
    payload.write_bytes(b"OPENPUFF V4.00 NATIVE JPEG POSITIVE CONTROL\n" * 5)
    return img_path, payload


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--mode", choices=["probe"], default="probe")
    args = parser.parse_args()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    image, payload = generate_fixture(out / "input")
    result = {"attempted": False, "mode": args.mode, "image": str(image),
              "payload": str(payload), "window": None}
    app = None
    try:
        app = Application(backend="win32").start(str(Path(args.exe).resolve()),
                                                   work_dir=str(out))
        time.sleep(2.5)
        main_window = app.top_window()
        main_window.set_focus()
        snapshot(app, out, "original-main")
        snapshot_desktop(out, "original-main-desktop")
        buttons = [
            c for c in main_window.descendants()
            if (safe(c.class_name) or "") == "Button"
            and "hide" in (safe(c.window_text) or "").lower()
            and "unhide" not in (safe(c.window_text) or "").lower()
        ]
        if len(buttons) != 1:
            raise RuntimeError(f"Expected one Hide main button, got {len(buttons)}")
        buttons[0].click_input()
        time.sleep(1.5)
        window = app.top_window()
        window.set_focus()
        result["window"] = safe(window.window_text)
        result["attempted"] = True
        records = snapshot(app, out, "original-hide")
        snapshot_desktop(out, "original-hide-desktop")
        print("OPENPUFF ORIGINAL HIDING GUI INVENTORY")
        for item in records:
            print(json.dumps(item, ensure_ascii=False, sort_keys=True))
        if "Data Hiding" not in (result["window"] or ""):
            raise RuntimeError(f"Wrong original GUI: {result['window']!r}")
    finally:
        write_json_atomic(out / "result.json", result)
        if app:
            try:
                app.kill()
            except Exception:
                pass
    print("PASS: source-native hiding GUI controls captured; no original JPEG modified")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        out_arg = sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else "probe-output"
        folder = Path(out_arg)
        folder.mkdir(parents=True, exist_ok=True)
        write_text_atomic(folder / "error.txt", traceback.format_exc())
        raise
