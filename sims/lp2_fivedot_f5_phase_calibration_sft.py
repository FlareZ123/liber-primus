#!/usr/bin/env python3
"""Calibrate authentic F5 extraction across JPEG re-encoding of LP2's five-dot stencil.

Windows 11 / Python3.12, Pillow 11.3, pinned 0verkilll/f5 v1.0.0.
Uses unmodified 2014 p7/p23/p56 original images and isolated synthetic payloads.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

from PIL import Image, ImageChops, ImageOps, ImageStat, JpegImagePlugin

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus"
EXPECTED = {
    24: "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c",
    40: "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
    73: "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
}
PASSWORD = "LP2-FIVEDOT-SYNTHETIC-F5-CONTROL-20261122"
PAYLOAD = hashlib.sha256(b"LP2-five-dot-original-positive-phase-calibration").digest()
REGISTER = [
    ("p7-to-p23", 40, (740, 2800, 1620, 3260), (740, 415, 1620, 875), "updown"),
    ("p7-to-p56", 73, (741, 2800, 1621, 3260), (781, 2381, 1661, 2841), "leftright"),
]


def cmd(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, capture_output=True, text=True, timeout=90, check=False)


def save_q92(image: Image.Image, path: Path, source: Image.Image) -> None:
    image.save(path, format="JPEG", qtables=source.quantization,
               subsampling=JpegImagePlugin.get_sampling(source), optimize=True)


def embed(cover: Path, out: Path, payload: Path) -> None:
    r = cmd(["f5", "embed", str(cover), "-p", PASSWORD,
             "-in", str(payload), "-o", str(out)])
    if r.returncode or not out.exists():
        raise RuntimeError("Authentic F5 control embed failed: " + (r.stderr or r.stdout)[-500:])


def extract(carrier: Path, output: Path) -> dict[str, object]:
    if output.exists():
        output.unlink()
    r = cmd(["f5", "extract", str(carrier), "-p", PASSWORD, "-o", str(output)])
    b = output.read_bytes() if output.exists() else b""
    return {"exit_code": r.returncode,
            "exact_payload": r.returncode == 0 and b == PAYLOAD,
            "extracted_bytes": len(b), "diagnostic": (r.stderr or r.stdout)[-150:]}


def main() -> None:
    version = cmd(["f5", "version"])
    if version.returncode:
        raise RuntimeError("F5 v1.0.0 binary missing: " + version.stderr)
    originals = {}
    for scan, digest in EXPECTED.items():
        path = SOURCE / f"{scan}.jpg"
        if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            raise AssertionError("Original JPEG changed: " + str(path))
        original = Image.open(path)
        assert original.size == (2400, 3600)
        originals[scan] = original
    records = []
    with tempfile.TemporaryDirectory(prefix="lp2-fivedot-F5-") as tmp:
        root = Path(tmp)
        payload = root / "control.bin"
        payload.write_bytes(PAYLOAD)
        for label, target_scan, src_rect, dst_rect, direction in REGISTER:
            source = originals[24]
            target = originals[target_scan]
            source_crop = source.crop(src_rect)
            target_crop = target.crop(dst_rect)
            assert source_crop.size == target_crop.size == (880, 460)
            reflect = ImageOps.flip if direction == "updown" else ImageOps.mirror
            direct_mae = ImageStat.Stat(
                ImageChops.difference(reflect(source_crop).convert("L"),
                                      target_crop.convert("L"))).mean[0]
            cover = root / (label + "-clean.jpg")
            planted = root / (label + "-f5.jpg")
            save_q92(source_crop, cover, source)
            embed(cover, planted, payload)
            source_positive = extract(planted, root / (label + "-extract-source"))
            assert source_positive["exact_payload"], source_positive
            with Image.open(planted) as image:
                doubled = root / (label + "-reencode.jpg")
                reflected = root / (label + "-reflect-reencode.jpg")
                save_q92(image, doubled, source)
                save_q92(reflect(image), reflected, target)
            reencoded_result = extract(doubled, root / (label + "-extract-reencoded"))
            reflected_result = extract(reflected, root / (label + "-extract-reflected"))
            # Independent final-image F5 positive control: encoding after the
            # page-specific transform can indeed carry an extractable 32B message.
            final_cover = root / (label + "-final-cover.jpg")
            final_planted = root / (label + "-final-f5.jpg")
            save_q92(target_crop, final_cover, target)
            embed(final_cover, final_planted, payload)
            final_positive = extract(final_planted, root / (label + "-extract-final"))
            assert final_positive["exact_payload"], final_positive
            records.append({
                "source_to_target": label, "transform": direction,
                "original_grayscale_mae": round(direct_mae, 8),
                "source_F5_positive": source_positive,
                "same_orientation_JPEG_reencode": reencoded_result,
                "source_F5_then_reflect_and_JPEG_reencode": reflected_result,
                "posttransform_F5_positive": final_positive,
            })
    print(json.dumps({
        "pinned_f5_binary": (version.stdout or version.stderr).strip(),
        "original_scan_hashes": EXPECTED, "synthetic_payload_bytes": len(PAYLOAD),
        "results": records,
        "interpretation": ("Tests an original-motif pretransform F5 carrier only. "
            "If seeded F5 positives fail to extract after these actual geometric "
            "operations, a pixel-reflected reused stencil cannot by itself transfer "
            "the old JPEG-domain F5 message. Independent post-template F5 embedding "
            "or a previously shared source-plate payload remain unaddressed. "
            "No unknown LP2 plaintext or historical F5 key is inferred."),
    }, indent=2))


if __name__ == "__main__":
    main()
