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

from pathlib import Path

IMG_DIR = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
EXPECTED_RED = {
    0: [(13, 1424, 730)], 2: [(13, 1645, 2236)],
    3: [(13, 1578, 730), (13, 1375, 1671), (13, 953, 2158)],
    6: [(13, 762, 1294), (13, 1350, 1782)],
    7: [(13, 742, 2515), (13, 1652, 2515)],
    14: [(13, 1016, 1859)],
    15: [(13, 936, 730), (13, 1459, 730), (13, 1299, 1792)],
    22: [(13, 1650, 1742)], 23: [(13, 1552, 1217)],
    26: [(13, 1654, 2801)], 27: [(13, 1702, 974)],
    32: [(13, 948, 1671)],
    33: [(13, 1287, 730), (13, 1466, 1482), (13, 1160, 1970)],
    39: [(13, 856, 1671), (13, 963, 1914), (13, 1559, 2856)],
    53: [(13, 842, 2307)], 54: [(13, 1212, 974)],
    55: [(13, 1053, 1294)],
    56: [(13, 983, 730), (13, 1577, 2134)],
    57: [(13, 1159, 974)],
}
EXPECTED_BLACK = {7: [(13, 1707, 2271)]}


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
