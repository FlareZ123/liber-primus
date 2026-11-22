#!/usr/bin/env python3
"""Real, coefficient-preserving original five-dot JPEG F5 probe.

Precalibrates actual F5-positive payload extraction in source-selected ROIs,
then performs one blind F5 detection on each original crop and each positive.
No passwords are guessed, and the output is not plaintext evidence.
Uses Windows-compatible Python; the lossless JPEG ROI helper is C/libjpeg.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus"
CROPS = {
    24: (736, 2784, 896, 496),  # p7 lower stencil
    40: (736, 400, 896, 480),   # p23 top stencil
    73: (768, 2368, 896, 496), # solved p56 lower stencil
}
EXPECTED = {
    24: "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c",
    40: "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
    73: "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
}
PASSWORD = "LP2-FIVEDOT-LOSSLESS-ROI-POSITIVE-CONTROL-20261122"
PAYLOAD_BYTES = (32, 256)


def command(argv: list[str], timeout: int = 200) -> subprocess.CompletedProcess[str]:
    return subprocess.run(argv, capture_output=True, text=True,
                          timeout=timeout, check=False)


def detect(filename: Path) -> dict[str, object]:
    result = command(["f5", "detect", str(filename), "-json"], timeout=240)
    stdout = result.stdout.strip()
    parsed = None
    if stdout:
        try:
            parsed = json.loads(stdout)
        except json.JSONDecodeError:
            parsed = stdout
    if isinstance(parsed, (dict, list)):
        as_text = json.dumps(parsed, sort_keys=True)
    else:
        as_text = str(parsed)
    return {
        "exit": result.returncode, "output_sha256": hashlib.sha256(stdout.encode()).hexdigest(),
        "output_length": len(as_text), "output_excerpt": as_text[:1800],
        "stderr": result.stderr[-180:],
    }


def create_positive(cover: Path, payload: Path, stego: Path, recovered: Path) -> None:
    make = command(["f5", "embed", str(cover), "-p", PASSWORD,
                    "-in", str(payload), "-o", str(stego)])
    if make.returncode or not stego.exists():
        raise RuntimeError("F5 source-crop positive creation failed: " +
                           (make.stderr or make.stdout)[-400:])
    check = command(["f5", "extract", str(stego), "-p", PASSWORD,
                     "-o", str(recovered)])
    if check.returncode or not recovered.exists() or recovered.read_bytes() != payload.read_bytes():
        raise RuntimeError("F5 source-crop exact extraction failed: " +
                           (check.stderr or check.stdout)[-400:])


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python lp2_fivedot_f5_roi_screen_sft.py <lossless_roi_binary>")
    binary = sys.argv[1]
    ver = command(["f5", "version"])
    if ver.returncode:
        raise RuntimeError("Pinned F5 executable absent: " + ver.stderr)
    images: dict[int, dict[str, Path]] = {}
    with tempfile.TemporaryDirectory(prefix="LP2-dot-F5-ROI-") as temp:
        root = Path(temp)
        # All positive controls must be extractable before inspecting any original
        # F5 classification, to prevent interpreting an insensitive detector.
        for scan, (x, y, w, h) in CROPS.items():
            original = SOURCE / f"{scan}.jpg"
            if hashlib.sha256(original.read_bytes()).hexdigest() != EXPECTED[scan]:
                raise AssertionError(f"original source changed: scan{scan}")
            roi = root / f"{scan}-original-lossless.jpg"
            r = command([binary, str(original), str(roi),
                         str(x), str(y), str(w), str(h)])
            if r.returncode:
                raise RuntimeError("Lossless source crop failed: " + r.stderr)
            with Image.open(original) as full, Image.open(roi) as cropped:
                source_pixels = full.crop((x, y, x+w, y+h))
                assert cropped.size == (w, h)
                assert source_pixels.tobytes() == cropped.tobytes(), (
                    "JPEG original ROI was re-encoded instead of coefficient-preserving")
                assert full.quantization == cropped.quantization
            saved = {"original": roi}
            for length in PAYLOAD_BYTES:
                payload = root / f"payload-{length}.bin"
                if not payload.exists():
                    payload.write_bytes(
                        b"".join(hashlib.sha256(
                            b"LP2-CALIBRATED-F5-ROI" + j.to_bytes(4,"big")).digest()
                            for j in range((length+31)//32)
                        )[:length]
                    )
                stego = root / f"{scan}-F5-{length}.jpg"
                recovered = root / f"{scan}-recovered-{length}.bin"
                create_positive(roi, payload, stego, recovered)
                saved[f"planted_{length}"] = stego
            images[scan] = saved
        summary = {}
        for scan, carriers in images.items():
            summary[f"LP2-p{scan-17}"] = {
                "original_dct_roi": {
                    "jpeg": EXPECTED[scan],
                    "rectangle_xywh": CROPS[scan],
                    "pixel_exact_to_original": True,
                    "quantization_table_exact": True
                },
                "f5_screen": {
                    category: detect(filename)
                    for category, filename in carriers.items()
                },
            }
        print(json.dumps({
            "source": "2014 original JPEG quantized-DCT ROI, without recompression",
            "f5_binary": (ver.stdout or ver.stderr).strip(),
            "positive_payload_lengths": PAYLOAD_BYTES,
            "original_images": summary,
            "interpretation": (
                "A blind flag is not F5 plaintext. Compare the original outputs to "
                "the known 32/256B F5-positive and clean controls. If the detector "
                "does not separate those controls it has no sensitivity to certify "
                "the original. The source gives no independently chosen F5 password."
            ),
        }, indent=2))


if __name__ == "__main__":
    main()
