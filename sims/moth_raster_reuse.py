"""Exact source-raster reuse in the moth-decorated LP2 terminal pages.

Original JPEGs 70, 71, 72 represent physical pages 53, 54, 55.
A repeated image does not establish plaintext, a key, or author intent.
Python 3, NumPy and OpenCV. Read-only reproduction.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]


def original(filename: str) -> tuple[np.ndarray, str]:
    data = (ROOT / "resources" / "liber-primus" / filename).read_bytes()
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400)
    return image, hashlib.sha256(data).hexdigest()


def moth(first: np.ndarray, final: np.ndarray, dx: int, dy: int) -> dict:
    """Alignment metrics over a 420x1050 pixel moth-specific crop."""
    y0, y1, x0, x1 = 2700, 3120, 650, 1700
    source = first[y0-dy:y1-dy, x0-dx:x1-dx].astype(np.int16)
    target = final[y0:y1, x0:x1].astype(np.int16)
    assert source.shape == target.shape == (420, 1050)
    delta = np.abs(source - target)
    dark1, dark2 = source < 200, target < 200
    return {
        "dx": dx,
        "dy": dy,
        "pixel_count": int(delta.size),
        "correlation": float(np.corrcoef(source.ravel(), target.ravel())[0, 1]),
        "ink_iou": float(np.count_nonzero(dark1 & dark2) /
                         np.count_nonzero(dark1 | dark2)),
        "maximum_abs_gray_difference": int(delta.max()),
        "fraction_abs_difference_le5": float(np.mean(delta <= 5)),
    }


def run() -> dict:
    p53, h53 = original("70.jpg")
    p54, h54 = original("71.jpg")
    p55, h55 = original("72.jpg")
    # The left/right vine panels are outside the independently printed text.
    border_windows = {
        "left": (slice(790, 2800), slice(0, 520)),
        "right": (slice(790, 2800), slice(1880, 2400)),
    }
    borders = {}
    for name, window in border_windows.items():
        target = p55[window]
        borders[name] = {
            "pixels": int(target.size),
            "page53_exact": bool(np.array_equal(target, p53[window])),
            "page54_exact": bool(np.array_equal(target, p54[window])),
        }
        assert borders[name]["page53_exact"] and borders[name]["page54_exact"]

    # Check a whole integer-translation neighborhood, avoiding subpixel fits.
    variants = [moth(p53, p55, dx, dy)
                for dy in range(65, 70) for dx in range(64, 69)]
    variants.sort(key=lambda item: item["correlation"], reverse=True)
    best = variants[0]
    assert (best["dx"], best["dy"]) == (66, 67)
    assert best["maximum_abs_gray_difference"] <= 10
    assert best["correlation"] > 0.9998
    return {
        "source_images": ["70.jpg", "71.jpg", "72.jpg"],
        "sha256": {"70.jpg": h53, "71.jpg": h54, "72.jpg": h55},
        "pixel_exact_vine_panels": borders,
        "moth_shift_page53_to_page55": best,
        "nearest_competing_translation": variants[1],
        "without_translation": moth(p53, p55, 0, 0),
        "status": "original-image duplicate artwork; no recovered key or plaintext",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
