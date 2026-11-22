"""Source-exact duplicated-moth check for original LP2 JPEGs 70 and 72.

Only a central crop containing the moth is compared, preserving original pixels.
The declared crop avoids neighboring text and border artwork.
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]


def register_moth(first: np.ndarray, last: np.ndarray) -> dict[str, float | int]:
    """Register physical page 53's moth onto page 55 by translation."""
    assert first.shape == last.shape == (3600, 2400, 3)
    x0, y0, w, h = 615, 2680, 1180, 580
    ref = first[y0:y0 + h, x0:x0 + w]
    sx, sy, sw, sh = 500, 2600, 1550, 800
    target = last[sy:sy + sh, sx:sx + sw]
    corr = cv2.matchTemplate(target, ref, cv2.TM_CCOEFF_NORMED)
    _, score, _, best = cv2.minMaxLoc(corr)
    tx, ty = sx + best[0], sy + best[1]
    obs = last[ty:ty + h, tx:tx + w]
    error = np.abs(ref.astype(np.int16) - obs.astype(np.int16))
    result = {
        "x_translation": tx - x0,
        "y_translation": ty - y0,
        "correlation": float(score),
        "mean_rgb_channel_error": float(error.mean()),
        "max_rgb_channel_error": int(error.max()),
        "pixels_over_10_channel_error": int(np.any(error > 10, axis=2).sum()),
        "exact_rgb_pixels": int(np.all(error == 0, axis=2).sum()),
        "tested_pixels": w * h,
    }
    assert (tx - x0, ty - y0) == (66, 67)
    assert score > 0.9998
    assert result["pixels_over_10_channel_error"] == 0
    assert result["max_rgb_channel_error"] <= 10
    return result


def main() -> None:
    path = ROOT / "resources/liber-primus"
    first = cv2.imread(str(path / "70.jpg"), cv2.IMREAD_COLOR)
    last = cv2.imread(str(path / "72.jpg"), cv2.IMREAD_COLOR)
    if first is None or last is None:
        raise FileNotFoundError("Original JPEG 70.jpg or 72.jpg missing")
    report = register_moth(first, last)
    print("Original moth geometry and pixel differences")
    for key, value in report.items():
        print(f"{key}={value}")
    changed = last.copy()
    changed[3100:3112, 1700:1712] = 0
    source = first[2680:3260, 615:1795]
    altered = changed[2747:3327, 681:1861]
    signal = np.any(np.abs(source.astype(np.int16) - altered.astype(np.int16)) > 10, axis=2)
    assert signal.sum() >= 140
    print(f"altered_source_control_pixels={int(signal.sum())}")
    print("PASS")


if __name__ == "__main__":
    main()
