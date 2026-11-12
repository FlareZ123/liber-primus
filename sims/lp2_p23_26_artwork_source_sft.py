"""Source-art single-file test for LP2 physical pages p23–p26.

Requires Pillow and NumPy, using the original JPEGs in resources/liber-primus.
Run from any working directory with Python.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "resources" / "liber-primus"
CROPS = {
    "left": (30, 1100, 530, 2400),
    "right": (1900, 1100, 2370, 2400),
}


def crop(page: int, box: tuple[int, int, int, int]) -> np.ndarray:
    """Return a stable decoded grayscale source-image crop for LP2 page."""
    with Image.open(IMAGES / f"{page + 17:02}.jpg") as im:
        return np.asarray(im.convert("L").crop(box), dtype=np.uint8)


def mean_absolute_displacement(
    a: np.ndarray, b: np.ndarray, dx: int, dy: int
) -> float:
    """Compare translated source art on a fixed interior crop."""
    h, w = a.shape
    aa = a[4 + dy : h - 4 + dy, 4 + dx : w - 4 + dx]
    bb = b[4 : h - 4, 4 : w - 4]
    return float(np.abs(aa.astype(np.int16) - bb.astype(np.int16)).mean())


for side, box in CROPS.items():
    p24, p25, p26 = [crop(p, box) for p in (24, 25, 26)]
    assert np.array_equal(p24, p26), f"{side} p24/p26 mismatch"
    shifts = [
        (mean_absolute_displacement(p24, p25, dx, dy), dx, dy)
        for dy in range(-3, 4)
        for dx in range(-3, 4)
    ]
    best = min(shifts)
    assert best[1:] == (1, 1), (side, best)
    print(
        f"{side}: p24=p26 exact decoded pixels; "
        f"sha256={sha256(p24.tobytes()).hexdigest()} "
        f"p25 shift=(+1,+1) MAE={best[0]:.9f}, "
        f"unaligned MAE={mean_absolute_displacement(p24,p25,0,0):.9f}"
    )

print("PASS: the p24/p26 illustrated borders are exactly repeated in both side crops.")
