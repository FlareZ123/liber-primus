#!/usr/bin/env python3
"""Source-fixed Otsu gate for the pre-2014 DeadTree.jpg -> LP2 p32/p55 route.

Uses the exact Commons photograph and the already-frozen source-to-page transforms
from dead_tree_commons_derivative_gate.py. No crop, threshold, scale, translation,
blur, or orientation is fitted on LP2.
"""
from __future__ import annotations

import json
import cv2

from dead_tree_commons_derivative_gate import (
    ASSETS, PAGE_HASHES, P32, P55, ROOT, decode, digest, fetch_asset, score_fixed
)


def run() -> dict:
    source_bytes = fetch_asset("original", ASSETS["original"])
    assert digest(source_bytes) == ASSETS["original"]["sha256"]
    source = decode(source_bytes, cv2.IMREAD_GRAYSCALE)

    threshold, otsu = cv2.threshold(
        source, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU
    )

    p32_bytes = (ROOT / "resources/liber-primus/49.jpg").read_bytes()
    p55_bytes = (ROOT / "resources/liber-primus/72.jpg").read_bytes()
    assert digest(p32_bytes) == PAGE_HASHES["49.jpg"]
    assert digest(p55_bytes) == PAGE_HASHES["72.jpg"]
    p32 = decode(p32_bytes, cv2.IMREAD_GRAYSCALE)
    p55 = decode(p55_bytes, cv2.IMREAD_GRAYSCALE)

    original_p55 = score_fixed(source, p55, P55, "original", True)
    otsu_p55 = score_fixed(otsu, p55, P55, "original", True)
    original_p32 = score_fixed(source, p32, P32, "original", True)
    otsu_p32 = score_fixed(otsu, p32, P32, "original", True)

    # Wrong-orientation controls use the same frozen mappings.
    otsu_p55_unref = score_fixed(otsu, p55, P55, "original", False)
    otsu_p32_unref = score_fixed(otsu, p32, P32, "original", False)

    return {
        "schema": "liber-primus-deadtree-otsu-source-gate-v1",
        "source": {
            "commons_sha256": ASSETS["original"]["sha256"],
            "operation": "OpenCV grayscale Otsu global threshold; THRESH_BINARY; no fitted threshold",
            "otsu_threshold": float(threshold),
        },
        "fixed_p55": {
            "original": original_p55,
            "otsu": otsu_p55,
            "otsu_unreflected_control": otsu_p55_unref,
            "delta_full": otsu_p55["full"] - original_p55["full"],
            "delta_upper_60": otsu_p55["upper_60"] - original_p55["upper_60"],
            "delta_lower_40": otsu_p55["lower_40"] - original_p55["lower_40"],
        },
        "fixed_p32_chained": {
            "original": original_p32,
            "otsu": otsu_p32,
            "otsu_unreflected_control": otsu_p32_unref,
            "delta_full": otsu_p32["full"] - original_p32["full"],
            "delta_upper_60": otsu_p32["upper_60"] - original_p32["upper_60"],
            "delta_lower_40": otsu_p32["lower_40"] - original_p32["lower_40"],
        },
        "limits": [
            "The historical 2006 thesis independently motivates Otsu, but this implementation is a standard replay on the exact Commons source, not a pixel-exact extraction of the thesis figure.",
            "The source-to-p55 and chained source-to-p32 transforms were selected earlier and are reused without refitting.",
            "A correlation gain would support Otsu-like source processing only; it cannot by itself select a rune traversal, key, or cipher receiver.",
        ],
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
