#!/usr/bin/env python3
"""Decoded-pixel identity test for the actual repeated LP2 page-border art.

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
    "sapling-right": {"scans": [26, 28, 30], "sides": ["right"]},
    "sapling-left-after-first": {"scans": [27, 29, 31], "sides": ["left"]},
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
    source_scans = sorted({scan for group in GROUPS.values() for scan in group["scans"]} | {25})
    findings = {}
    for title, group in GROUPS.items():
        scans = group["scans"]
        hashes = {}
        references = {}
        for scan in scans:
            pixels = image(scan)
            for side in group["sides"]:
                current = crop(pixels, side)
                if side not in references:
                    # Keep one small immutable decoded-pixel reference per side.
                    references[side] = current.copy()
                    hashes[side] = digest(current)
                    # Reject the old sapling bug: blank opposite margins also matched.
                    assert int(np.count_nonzero(cv2.cvtColor(current, cv2.COLOR_BGR2GRAY) < 120)) > 10000, (title, side)
                    changed = current.copy()
                    changed[0, 0, 0] ^= 1
                    assert not np.array_equal(changed, references[side])
                    assert digest(changed) != hashes[side]
                else:
                    if not np.array_equal(current, references[side]):
                        raise AssertionError(
                            f"{title}/{side}: scan {scan} differs from {scans[0]}"
                        )
                    assert digest(current) == hashes[side]

        findings[title] = {
            "original_scans": scans,
            "exactly_identical_decoded_sides": hashes,
            "number_of_scans": len(scans),
        }
    leading = crop(image(25), "left")
    later = crop(image(27), "left")
    assert not np.array_equal(leading, later)
    lead_ink = cv2.cvtColor(leading, cv2.COLOR_BGR2GRAY) < 120
    later_ink = cv2.cvtColor(later, cv2.COLOR_BGR2GRAY) < 120
    support = np.ones((5, 5), dtype=np.uint8)
    lead_coverage = float(np.sum(lead_ink & (cv2.dilate(later_ink.astype(np.uint8), support) > 0)) / np.sum(lead_ink))
    later_coverage = float(np.sum(later_ink & (cv2.dilate(lead_ink.astype(np.uint8), support) > 0)) / np.sum(later_ink))
    assert lead_coverage > 0.9999 and later_coverage > 0.9999
    return {
        "classification": "source-pixel identity on illustrated sides, no ciphertext decryption",
        "first_sapling_p8": {
            "scan": 25, "comparison_scan": 27, "side": "left",
            "RGB_exact": False, "support_radius_pixels": 2,
            "leading_ink_coverage": lead_coverage,
            "later_ink_coverage": later_coverage,
        },
        "image_pixels": [2400, 3600],
        "coordinate_convention": "x_left,y_top,x_right,y_bottom; end exclusive",
        "regions": RECTS,
        "read_scans": source_scans,
        "findings": findings,
        "result": "EXACT decoded-pixel equality in every stated group and side",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
