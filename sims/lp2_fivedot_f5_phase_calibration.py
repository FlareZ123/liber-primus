"""Source-selected central five-dot F5 payload survival across authentic JPEG phases.

Requires official Go F5 v1.0.0 CLI, Pillow, NumPy, and filelock.
Synthetic payloads are controls, never asserted as LP2 plaintext.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

import numpy as np
from PIL import Image
from filelock import FileLock

SOURCE_HASHES = {
    24: "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c",
    40: "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
    73: "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
}
CROP = (740, 414, 1620, 874)
PASSWORD = "LP2-FIVEDOT-F5-PHASE-CONTROL-20261122"
LENGTHS = (32, 64)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def command(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, capture_output=True, text=True, timeout=240, check=False)


def atomic_json(path: Path, data: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent,
                                         delete=False) as stream:
            temp = Path(stream.name)
            json.dump(data, stream, indent=2, sort_keys=True)
            stream.write("\n")
        os.replace(temp, path)


def recode(image: np.ndarray, path: Path,
           qtables: dict[int, list[int]]) -> np.ndarray:
    Image.fromarray(image).save(path, format="JPEG", qtables=qtables,
                                subsampling=2, optimize=True)
    with Image.open(path) as source:
        return np.asarray(source.convert("RGB")).copy()


def extract(f5: str, jpeg: Path, payload: bytes, work: Path) -> dict[str, object]:
    output = work / (jpeg.stem + ".extracted")
    if output.exists():
        output.unlink()
    process = command([f5, "extract", str(jpeg), "-p", PASSWORD, "-o", str(output)])
    actual = output.read_bytes() if output.exists() else b""
    return {"exact": process.returncode == 0 and actual == payload,
            "returncode": process.returncode, "bytes": len(actual),
            "error_tail": process.stderr[-300:] if process.returncode else "",
            "jpeg_sha256": digest(jpeg.read_bytes())}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sources", type=Path, default=Path("resources/liber-primus"))
    parser.add_argument("--f5", default="f5")
    parser.add_argument("--output", type=Path,
                        default=Path("im-results/fivedot-f5-phase-probe.json"))
    parser.add_argument("--work", type=Path,
                        default=Path("im-results/fivedot-f5-phase-work"))
    arguments = parser.parse_args()
    arguments.work.mkdir(parents=True, exist_ok=True)
    for scan, expected in SOURCE_HASHES.items():
        assert digest((arguments.sources / f"{scan:02d}.jpg").read_bytes()) == expected
    with Image.open(arguments.sources / "40.jpg") as source:
        qtables = source.quantization
        crop = np.asarray(source.convert("RGB").crop(CROP)).copy()
    result: dict[str, object] = {
        "sources": SOURCE_HASHES, "crop_p23_original_scan40": CROP,
        "method": "Official F5 v1.0.0 extractor-positive 880x460 p23 five-dot crop; native, same-phase double-JPEG, and authentic 8x8-phase-residue transform-and-inverse controls.",
        "password_synthetic_only": PASSWORD, "payload_sizes": LENGTHS,
        "controls": [], "originals_screened": False,
    }
    cover = arguments.work / "motif_cover.jpg"
    recode(crop, cover, qtables)
    result["cover_sha256"] = digest(cover.read_bytes())
    for length in LENGTHS:
        payload = b"".join(
            hashlib.sha256(b"LP2-FIVEDOT-POSITIVE-" + index.to_bytes(4, "big")).digest()
            for index in range((length + 31) // 32)
        )[:length]
        payload_file = arguments.work / f"payload_{length}.bin"
        payload_file.write_bytes(payload)  # disposable sole-writer control fixture
        stego = arguments.work / f"positive_{length}.jpg"
        positive = None
        producer = None
        failures = []
        for operation in ("embed", "embed-x"):
            if stego.exists():
                stego.unlink()
            cmd = [arguments.f5, operation, str(cover), "-p", PASSWORD,
                   "-in", str(payload_file), "-o", str(stego)]
            if operation == "embed-x":
                cmd.extend(["-encoder", "libjpeg"])
            completed = command(cmd)
            if completed.returncode != 0 or not stego.exists():
                failures.append(operation + ":" + completed.stderr[-250:])
                continue
            checked = extract(arguments.f5, stego, payload, arguments.work)
            if checked["exact"]:
                positive = checked
                producer = operation
                break
            failures.append(operation + ":extraction_failed")
        if positive is None:
            result["controls"].append({
                "length": length, "native_positive": False, "failures": failures
            })
            continue
        with Image.open(stego) as image:
            pixels = np.asarray(image.convert("RGB")).copy()
        assert pixels.shape == crop.shape
        record: dict[str, object] = {
            "length": length, "native_positive": True, "native": positive,
            "producer": producer, "reencodings": {},
        }
        transforms = [
            ("phase0", lambda x: x, lambda x: x),
            ("p7_y2_flip", lambda x: np.roll(np.flip(x, axis=0), 2, axis=0),
             lambda x: np.flip(np.roll(x, -2, axis=0), axis=0)),
            ("p56_x1_y7_halfturn",
             lambda x: np.roll(np.flip(x, axis=(0, 1)), (7, 1), axis=(0, 1)),
             lambda x: np.flip(np.roll(x, (-7, -1), axis=(0, 1)), axis=(0, 1))),
        ]
        for name, forward, backward in transforms:
            first_path = arguments.work / f"{name}_{length}_1.jpg"
            second_path = arguments.work / f"{name}_{length}_2.jpg"
            after_forward = recode(forward(pixels), first_path, qtables)
            recode(backward(after_forward), second_path, qtables)
            record["reencodings"][name] = {
                "stage1": extract(arguments.f5, first_path, payload, arguments.work),
                "stage2": extract(arguments.f5, second_path, payload, arguments.work),
            }
        result["controls"].append(record)
        print("F5_PHASE", length, json.dumps(record["reencodings"], sort_keys=True),
              flush=True)
    result["calibrated_native_positive"] = all(
        item["native_positive"] for item in result["controls"])
    result["phase_inversion_extraction_sensitive"] = (
        result["calibrated_native_positive"] and all(
            item["reencodings"][name]["stage2"]["exact"]
            for item in result["controls"]
            for name in ("p7_y2_flip", "p56_x1_y7_halfturn")
        )
    )
    if not result["phase_inversion_extraction_sensitive"]:
        result["stop_reason"] = (
            "Cannot screen original transformed motifs by F5 known-cover extraction: "
            "an extractor-verified native positive does not survive the matching "
            "lossy JPEG transform and inverse."
        )
    atomic_json(arguments.output, result)
    print("GATE", json.dumps({
        key: result[key] for key in (
            "calibrated_native_positive", "phase_inversion_extraction_sensitive",
            "originals_screened"
        )
    }, sort_keys=True), flush=True)


if __name__ == "__main__":
    main()
