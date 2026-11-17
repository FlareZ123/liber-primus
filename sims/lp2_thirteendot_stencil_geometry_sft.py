"""Compare all original LP2 13-dot punctuation stencil shapes, pixel by pixel.

SFT: python sims/lp2_thirteendot_stencil_geometry_sft.py
Uses only the original JPEG images and the independently audited centroid
locations in the existing physical punctuation census. Requires Pillow,
numpy and opencv-python. Read-only on original assets.
"""
from __future__ import annotations

from collections import Counter
import cv2
import numpy as np
from PIL import Image

from lp2_original_color_dots_census_sft import (
    EXPECTED_BLACK,
    EXPECTED_RED,
    IMG_DIR,
)


def centers(image: np.ndarray, x: int, y: int, black: bool) -> np.ndarray:
    """Get the thirteen separate ~9x9 circular ink components in one mark."""
    crop = image[y - 65:y + 66, x - 65:x + 66]
    r = crop[:, :, 0].astype(np.int16)
    g = crop[:, :, 1].astype(np.int16)
    b = crop[:, :, 2].astype(np.int16)
    mask = (
        ((r < 80) & (g < 80) & (b < 80)) if black else
        ((r > 75) & (r - g > 50) & (r - b > 50))
    ).astype(np.uint8)
    n, _, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)
    points = []
    for i in range(1, n):
        area = int(stats[i, cv2.CC_STAT_AREA])
        width = int(stats[i, cv2.CC_STAT_WIDTH])
        height = int(stats[i, cv2.CC_STAT_HEIGHT])
        if 55 <= area <= (175 if black else 150) and 8 <= width <= 12 and 8 <= height <= 12:
            points.append((centroids[i, 0] + x - 65,
                           centroids[i, 1] + y - 65))
    assert len(points) == 13, (x, y, black, len(points))
    return np.array(points, dtype=float)


def stencil(points: np.ndarray) -> np.ndarray:
    """Normalize translation; retain exact left/center/right column order."""
    cx = [float(np.min(points[:, 0])),
          float(np.median(points[:, 0])),
          float(np.max(points[:, 0]))]
    columns = [sorted((point for point in points if abs(point[0] - x) < 4),
                      key=lambda point: point[1]) for x in cx]
    assert tuple(map(len, columns)) == (4, 5, 4)
    ordered = np.array([point for column in columns for point in column])
    return np.round((ordered - np.mean(ordered, axis=0)) * 2) / 2


def main() -> None:
    marks = []
    for black, expectation in ((False, EXPECTED_RED), (True, EXPECTED_BLACK)):
        for page, instances in expectation.items():
            thirteen = [(x, y) for size, x, y in instances if size == 13]
            if not thirteen:
                continue
            with Image.open(IMG_DIR / f"{page + 17:02d}.jpg") as source:
                image = np.asarray(source.convert("RGB"))
            for x, y in thirteen:
                marks.append((page, x, y, black,
                              stencil(centers(image, x, y, black))))

    assert Counter(black for _, _, _, black, _ in marks) == Counter({False: 30, True: 1})
    first = next(mark for mark in marks if mark[:4] == (0, 1424, 730, False))
    reference = first[4]
    maxima = [
        (page, x, y, black, float(np.linalg.norm(shape - reference, axis=1).max()))
        for page, x, y, black, shape in marks
    ]
    assert max(error for *_, error in maxima) <= 1.5, maxima

    # Native-shape positive: moving one dot by four original pixels must fail.
    perturb = reference.copy()
    perturb[0, 1] += 4.0
    perturb -= np.mean(perturb, axis=0) - np.mean(reference, axis=0)
    assert float(np.linalg.norm(perturb - reference, axis=1).max()) > 3.0

    print(f"PASS: {len(marks)} original 13-dot groups, one source stencil, columns 4/5/4")
    print(f"maximum centroid displacement after translation: {max(v[-1] for v in maxima):.6f} pixels")
    print(f"black p07 punctuation displacement: {next(v[-1] for v in maxima if v[3]):.6f} pixels")
    print("changed-shape positive: one artificially shifted dot detected")


if __name__ == "__main__":
    main()
