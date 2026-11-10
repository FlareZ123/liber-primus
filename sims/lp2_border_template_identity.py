#!/usr/bin/env python3
"""Exact decoded-pixel identity test for repeated LP2 page-border artwork.

Read original JPEG scans without editing them. Coordinates are zero-based pixels
at the original 2400 x 3600 scan resolution, with exclusive upper bounds.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "resources" / "liber-primus"
RECTS = {
    "left": (0, 760, 570, 2900),
    "right": (1900, 760, 2400, 2900),
}
GROUPS = {
    "late-vines": {"scans": list(range(57, 73)), "sides": ["left", "right"]},
    "scrollwork": {"scans": [21, 22, 23, 24], "sides": ["left", "right"]},
    "sapling-even-left": {"scans": [26, 28, 30], "sides": ["left"]},
    "sapling-odd-right": {"scans": [25, 27, 29, 31], "sides": ["right"]},
}


def image(scan: int) -> np.ndarray:
    source = IMAGES / f"{scan:02d}.jpg"
    pixels = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if pixels is None or pixels.shape != (3600, 2400, 3):
        raise ValueError(f"Missing or wrong-sized original scan: {source}")
    return pixels


def crop(pixels: np.ndarray, side: str) -> np.ndarray:
    left, top, right, bottom = RECTS[side]
    return pixels[top:bottom, left:right, :]


def digest(pixels: np.ndarray) -> str:
    """SHA-256 of a contiguous decoded BGR byte array, row-first."""
    return hashlib.sha256(pixels.tobytes(order="C")).hexdigest()


def run() -> dict:
    cv2.setNumThreads(1)
    source_scans = sorted({scan for group in GROUPS.values() for scan in group["scans"]})
    originals = {scan: image(scan) for scan in source_scans}
    findings = {}
    for title, group in GROUPS.items():
        scans = group["scans"]
        hashes = {}
        for side in group["sides"]:
            reference = crop(originals[scans[0]], side)
            reference_hash = digest(reference)
            for scan in scans[1:]:
                current = crop(originals[scan], side)
                if not np.array_equal(current, reference):
                    raise AssertionError(
                        f"{title}/{side}: scan {scan} differs from {scans[0]}"
                    )
                assert digest(current) == reference_hash

            # A one-channel, one-pixel change is detected by the same check.
            changed = reference.copy()
            changed[0, 0, 0] ^= 1
            assert not np.array_equal(changed, reference)
            assert digest(changed) != reference_hash
            hashes[side] = reference_hash

        findings[title] = {
            "original_scans": scans,
            "exactly_identical_decoded_sides": hashes,
            "number_of_scans": len(scans),
        }
    return {
        "classification": "source-pixel identity, no ciphertext decryption",
        "image_pixels": [2400, 3600],
        "coordinate_convention": "x_left,y_top,x_right,y_bottom; end exclusive",
        "regions": RECTS,
        "read_scans": source_scans,
        "findings": findings,
        "result": "EXACT decoded-pixel equality in every stated group and side",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
