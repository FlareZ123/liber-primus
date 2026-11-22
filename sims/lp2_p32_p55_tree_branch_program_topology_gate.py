"""Original p55 raster topology is not a uniquely readable branch-order key.

Run with Python 3, NumPy, Pillow, OpenCV, SciPy, scikit-image.
The crop, source SHA and image-size constraint are fixed independently of any
ciphertext or English-score result. This is an original-image graph gate.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes, convolve
from skimage.measure import euler_number
from skimage.morphology import skeletonize

REPO_ROOT = Path(__file__).resolve().parents[1]
IMAGE_PATH = REPO_ROOT / "resources" / "liber-primus" / "72.jpg"
EXPECTED_SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"


def extract_main_lines(grayscale: np.ndarray, threshold: int) -> np.ndarray:
    """Remove isolated dot specks smaller than 32 pixels, using 8-connectivity."""
    ink = (grayscale < threshold).astype(np.uint8)
    number, labels, stats, _centroids = cv2.connectedComponentsWithStats(ink, 8)
    selected = np.zeros(number, dtype=bool)
    selected[1:] = stats[1:, cv2.CC_STAT_AREA] >= 32
    return selected[labels]


def topology(mask: np.ndarray) -> tuple[int, int, int]:
    """Connected component, foreground loop and 8-neighbor skeleton-end counts."""
    connected = cv2.connectedComponents(mask.astype(np.uint8), 8)[0] - 1
    holes = connected - euler_number(mask, connectivity=2)
    skel = skeletonize(mask)
    neighbors = convolve(skel.astype(np.uint8), np.ones((3, 3), dtype=np.uint8), mode="constant")
    neighbors = neighbors - skel.astype(np.uint8)
    endpoints = int(np.count_nonzero(skel & (neighbors == 1)))
    return int(connected), int(holes), endpoints


def main() -> None:
    raw = IMAGE_PATH.read_bytes()
    assert sha256(raw).hexdigest() == EXPECTED_SHA256
    raster = np.asarray(Image.open(IMAGE_PATH).convert("L"), dtype=np.uint8)
    assert raster.shape == (3600, 2400)
    crop = raster[1430:2509, 625:1734]
    reduced = cv2.resize(crop, (440, 440), interpolation=cv2.INTER_AREA)
    values: list[tuple[int, int, int, int, int]] = []
    for threshold in (210, 225):
        outline = extract_main_lines(reduced, threshold)
        c, h, e = topology(outline)
        _fc, _fh, fe = topology(binary_fill_holes(outline))
        print(f"Original p55 72.jpg threshold={threshold}: components={c}, "
              f"unfilled-holes={h}, outline-endpoints={e}, "
              f"filled-branch-endpoints={fe}")
        values.append((threshold, c, h, e, fe))
    assert values[0][2] >= 50 and values[1][2] >= 50
    assert values[0][3] != values[1][3]
    assert values[0][4] != values[1][4]
    print("PASS: one source original has multiple incompatible unmarked graph readings")


if __name__ == "__main__":
    main()
