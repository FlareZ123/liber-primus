"""Native seven-carrier OpenPuff v4.00 Hide plant on source-size JPEGs.

All seven carriers are generated controls, not Liber Primus originals. The
payload is deliberately larger than the measured six-carrier capacity and
smaller than the measured seven-carrier capacity, so successful recovery
requires the complete native chain.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import tempfile
import time
import traceback
from pathlib import Path

from filelock import FileLock
from PIL import Image, ImageDraw
from pywinauto.application import Application
from pywinauto.keyboard import send_keys

import openpuff_v400_native_twocarrier_plant as shared
from openpuff_v400_extract import (
    acknowledge_completed_task,
    file_facts,
    save_dialog_if_present,
    safe,
    snapshot,
    snapshot_desktop,
    verify_carrier_chain,
    write_json_atomic,
)


WIDTH = 2400
HEIGHT = 3600
CARRIER_COUNT = 7


# Original seven source JPEGs (50.jpg through 56.jpg) are all 2400x3600 RGB,
# 400 dpi, with file sizes in the 500-575 kB range. Those source bytes are
# immutable; synthetic art is generated rather than editing original pages.
ORIGINAL_SEVEN_SIZES = (525652, 555050, 574580, 511099, 503830, 519224, 541379)


def atomic_source_size_cover(path: Path, seed: int) -> None:
    """Generate a benign 2400x3600 RGB scan-profile JPEG near the LP2 byte size.

    Prior random full-frame RGB covers consumed ~250 MB across seven images,
    while the original seven files total only ~3.7 MB. This deterministic
    sparse-ink control retains dimensions/DPI/encoding and avoids the huge
    high-entropy mismatch that may have caused the native Unhide timeout.
    """
    rng = random.Random(seed)
    image = Image.new("RGB", (WIDTH, HEIGHT), (250, 250, 248))
    drawing = ImageDraw.Draw(image)
    for _ in range(1800):
        x = rng.randrange(120, WIDTH - 120)
        y = rng.randrange(100, HEIGHT - 100)
        length = rng.randrange(3, 30)
        drawing.line((x, y, x + length, y + 3), fill=(30, 30, 30), width=2)
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            dir=path.parent, prefix=path.stem + "-", suffix=".jpg", delete=False
        ) as temporary:
            temporary_path = Path(temporary.name)
        try:
            image.save(
                temporary_path,
                "JPEG",
                quality=92,
                subsampling=0,
                optimize=False,
                progressive=False,
                dpi=(400, 400),
            )
            os.replace(temporary_path, path)
        finally:
            temporary_path.unlink(missing_ok=True)
            image.close()


def set_synthetic_a_only_password(window, password: str) -> dict:
    """Disable B/C, then enter a long synthetic A password and record the meter."""
    controls = {
        control_id: window.child_window(control_id=control_id, class_name="Button")
        for control_id in (1012, 1013)
    }
    # C is dependent on B; disable C first, then B.
    for control_id in (1013, 1012):
        control = controls[control_id]
        if control.get_check_state():
            control.uncheck_by_click_input()
            time.sleep(0.3)
            shared.acknowledge_password_disable_warning()
        if control.get_check_state():
            control.uncheck()
            time.sleep(0.3)
            shared.acknowledge_password_disable_warning()
    shared.acknowledge_password_disable_warning()
    states = {str(k): int(v.get_check_state()) for k, v in controls.items()}
    if states != {"1012": 0, "1013": 0}:
        raise RuntimeError(f"Native Hide B/C checkboxes did not remain off: {states}")

    a = window.child_window(control_id=1009, class_name="Edit")
    a.set_edit_text("")
    a.set_edit_text(password)
    a.set_focus()
    # A focus transition makes the original password meter re-evaluate the
    # value entered through the native Edit HWND.
    send_keys("{TAB}")
    time.sleep(0.8)
    status = window.child_window(
        control_id=1014, class_name="Static"
    ).window_text()
    entered = safe(a.window_text)
    entered_length = len(entered) if isinstance(entered, str) else None
    static_labels = [
        {
            "id": safe(control.control_id),
            "text": safe(control.window_text),
        }
        for control in window.descendants()
        if safe(control.class_name) == "Static"
    ]
    print(
        "Native synthetic A-only password validation:",
        json.dumps({
            "password_length": len(password),
            "edit_reported_length": entered_length,
            "meter": status,
            "B_C_states": states,
            "static_labels": static_labels,
        }),
        flush=True,
    )
    if "too short" in status.lower() or "invalid" in status.lower():
        raise RuntimeError(f"Native Hide rejected synthetic A password: {status!r}")
    return {
        "B_C_states": states,
        "password_length": len(password),
        "password_sha256": hashlib.sha256(password.encode("utf-8")).hexdigest(),
        "edit_reported_length": entered_length,
        "password_meter": status,
        "static_labels": static_labels,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    exe = Path(args.exe).resolve()
    out = Path(args.out).resolve()
    covers = out / "covers"
    stego = out / "stego"
    for directory in (out, covers, stego):
        directory.mkdir(parents=True, exist_ok=True)

    carriers = [
        covers / f"source-size-carrier-{index:02d}.jpg"
        for index in range(1, CARRIER_COUNT + 1)
    ]
    for index, path in enumerate(carriers, start=1):
        atomic_source_size_cover(path, 0x33010000 + index)
    for reference_size, carrier in zip(ORIGINAL_SEVEN_SIZES, carriers):
        observed_size = carrier.stat().st_size
        if not 0.8 * reference_size <= observed_size <= 1.2 * reference_size:
            raise RuntimeError(
                f"Synthetic source-size profile mismatch for {carrier.name}: "
                f"{observed_size} bytes versus original {reference_size}"
            )

    record = {
        "source_executable": file_facts(exe),
        "cover_inputs": [file_facts(path) for path in carriers],
        "cover_dimensions": [WIDTH, HEIGHT],
        "cover_generator": "deterministic sparse-ink, non-original",
        "source_seven_original_sizes": list(ORIGINAL_SEVEN_SIZES),
        "cover_dpi": [400, 400],
        "jpeg_quality": 92,
        "jpeg_subsampling": 0,
        "password_A_only": True,
        "password_A_length": len(args.password),
        "password_A_sha256": hashlib.sha256(
            args.password.encode("utf-8")
        ).hexdigest(),
        "password_BC_enabled": False,
        "jpeg_level": "1/5 (20%) - Medium",
        "expected_carrier_count": CARRIER_COUNT,
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
        shared.click_named(window, "Hide")
        time.sleep(2)
        window = app.window(title_re=".*Data Hiding.*")
        window.wait("visible", timeout=15)
        window.set_focus()
        snapshot(app, out, "hiding-initial")

        record["password_control"] = set_synthetic_a_only_password(
            window, args.password
        )
        record["bit_tree"] = shared.set_medium(window)

        # OpenPuff's Hide UI requires selecting a data file before carriers.
        preliminary = out / "temporary-positive-target.bin"
        record["preliminary_sha256"] = shared.atomic_payload(preliminary, 256)
        window = shared.choose_hiding_target(
            app, window, preliminary, out, "preliminary-target"
        )

        capacities = []
        for index, carrier in enumerate(carriers, start=1):
            expected = [item.name.lower() for item in carriers[:index]]
            window = shared.add_hiding_carrier(
                app,
                window,
                carrier,
                expected,
                out,
                f"carrier-{index:02d}",
            )
            observed = shared.native_carrier_names(window)
            if observed != expected:
                raise RuntimeError(
                    f"Native Hide carrier order after {index}: "
                    f"expected {expected}, observed {observed}"
                )
            capacity = shared.native_total_capacity(window)
            capacities.append(capacity)
            print(
                f"Native Hide chain {index}/{CARRIER_COUNT}: "
                f"capacity={capacity} bytes; order={observed}",
                flush=True,
            )

        record["capacity_after_each_carrier"] = capacities
        record["native_chain"] = verify_carrier_chain(window, carriers)
        record["bit_tree_after_carriers"] = shared.set_medium(window)
        if len(capacities) != CARRIER_COUNT:
            raise RuntimeError("Native capacity was not measured after every carrier")
        six_capacity = capacities[-2]
        seven_capacity = capacities[-1]
        if six_capacity <= 0 or seven_capacity <= six_capacity + 1:
            raise RuntimeError(
                "Native cumulative capacity did not increase from six to seven "
                f"carriers: {six_capacity} -> {seven_capacity}"
            )

        # This exact payload size cannot fit in the first six native carriers.
        payload_size = six_capacity + (seven_capacity - six_capacity) // 2
        if not six_capacity < payload_size < seven_capacity:
            raise RuntimeError("Could not choose a payload requiring all seven carriers")
        payload = out / "seven-carrier-secret.bin"
        record["payload_sha256"] = shared.atomic_payload(payload, payload_size)
        record["payload_size"] = payload_size
        record["six_carrier_capacity"] = six_capacity
        record["seven_carrier_capacity"] = seven_capacity
        record["requires_seventh_carrier"] = payload_size > six_capacity

        window = shared.choose_hiding_target(
            app, window, payload, out, "seven-carrier-secret"
        )
        # Original OpenPuff can restore Enable(C) during native Browse/Add.
        # The first seven-carrier attempt (run 43687940512) showed C visibly
        # checked after the initial 0/0 toggle, and a native Invalid passwords
        # warning. Reapply A-only *after* all native carrier/target UI actions.
        record["password_control_before_hide"] = set_synthetic_a_only_password(
            window, args.password
        )
        snapshot(app, out, "configured")
        shared.click_named(window, "Hide Data")
        time.sleep(1)
        snapshot_desktop(out, "hide-post-click-desktop")
        warnings = [
            modal for modal in shared.native_modal_inventory()
            if "invalid passwords" in "\n".join(
                str(label) for label in modal.get("static", [])
            ).lower()
        ]
        if warnings:
            record["native_invalid_password_warnings"] = warnings
            raise RuntimeError(
                "Original OpenPuff Hide raised Step (1): Invalid passwords! "
                "after final A-only password revalidation"
            )

        completion = []
        dialogs = shared.DesktopDialogs()
        deadline = time.monotonic() + 300
        previous = None
        stable = 0
        while time.monotonic() < deadline:
            save_dialog_if_present(dialogs, stego / "unused.bin", stego)
            acknowledge_completed_task(dialogs, completion)
            actual = tuple(sorted(
                (path.name, path.stat().st_size)
                for path in stego.iterdir() if path.is_file()
            ))
            if len(actual) == CARRIER_COUNT and actual == previous:
                stable += 1
                if stable >= 4:
                    break
            else:
                stable = 0
            previous = actual
            time.sleep(1)

        record["completion_dialogs"] = completion
        record["actual_stego_files"] = [
            file_facts(path) for path in sorted(stego.iterdir()) if path.is_file()
        ]
        record["stego_paths"] = [
            str(stego / carrier.name) for carrier in carriers
        ]
        processed = [
            event for event in completion
            if __import__("re").search(
                r"7\s*/\s*7\s+carriers?\s+processed",
                event.get("message", ""),
                flags=__import__("re").IGNORECASE,
            )
        ]
        if not all((stego / carrier.name).is_file() for carrier in carriers):
            raise RuntimeError("Original OpenPuff Hide did not write all seven JPEGs")
        if len(record["actual_stego_files"]) != CARRIER_COUNT:
            raise RuntimeError("Hide output directory contains an unexpected file count")
        if not processed:
            raise RuntimeError(
                f"Original native Hide did not witness 7/7 completion: {completion}"
            )

        cover_hashes = [
            file_facts(path)["sha256"] for path in carriers
        ]
        stego_hashes = [
            file_facts(stego / carrier.name)["sha256"] for carrier in carriers
        ]
        if any(a == b for a, b in zip(cover_hashes, stego_hashes)):
            raise RuntimeError("At least one source-size JPEG was not modified by Hide")
        record["cover_sha256"] = cover_hashes
        record["stego_sha256"] = stego_hashes
        record["status"] = "hidden-seven-carriers"
        snapshot(app, out, "after-hide")
    except Exception:
        record["error"] = traceback.format_exc()
        raise
    finally:
        if app is not None:
            try:
                app.kill()
            except Exception:
                pass
        write_json_atomic(out / "hide-result.json", record)

    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
