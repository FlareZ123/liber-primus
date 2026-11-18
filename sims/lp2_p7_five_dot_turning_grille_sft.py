"""SFT: test the p7 five-dot rank pattern as a 5x5 turning grille.

Requires numpy and opencv-python. Reads the immutable original 24.jpg.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "24.jpg"
IMAGE_SHA256 = "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c"
REGION = (700, 1700, 2750, 3300)
EXPECTED_XY = np.array(
    [
        [796.9461333333334, 3105.7397333333333],
        [992.4666666666667, 3166.6876494023904],
        [1296.9661822247067, 2866.7040245947455],
        [1479.3638392857142, 3127.5],
        [1527.2172085201794, 2936.204876681614],
    ],
    dtype=np.float64,
)
EXPECTED_ROTATIONS = [
    [(0, 2), (1, 4), (2, 0), (3, 3), (4, 1)],
    [(2, 0), (0, 1), (4, 2), (1, 3), (3, 4)],
    [(4, 2), (3, 0), (2, 4), (1, 1), (0, 3)],
    [(2, 4), (4, 3), (0, 2), (3, 1), (1, 0)],
]
EXPECTED_MISSING = [
    (0, 0), (4, 0), (2, 1), (1, 2), (2, 2),
    (3, 2), (2, 3), (0, 4), (4, 4),
]


def read_dot_centers() -> np.ndarray:
    assert sha256(IMAGE.read_bytes()).hexdigest() == IMAGE_SHA256, IMAGE
    image = cv2.imread(str(IMAGE), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400), IMAGE
    x0, x1, y0, y1 = REGION
    binary = (image[y0:y1, x0:x1] < 160).astype(np.uint8)
    count, _, stats, centers = cv2.connectedComponentsWithStats(binary, 8)
    found = []
    for i in range(1, count):
        _, _, width, height, area = stats[i]
        if 2000 <= area <= 6000 and 45 <= width <= 100 and 45 <= height <= 100:
            found.append((float(x0 + centers[i, 0]), float(y0 + centers[i, 1])))
    points = np.array(sorted(found), dtype=np.float64)
    assert points.shape == (5, 2), points
    assert np.allclose(points, EXPECTED_XY, atol=1e-6), points
    return points


def run() -> None:
    points = read_dot_centers()
    # The most direct 5x5 normalization: x-rank is column, y-rank is row.
    y_order = np.argsort(points[:, 1])
    y_rank = np.empty(5, dtype=int)
    y_rank[y_order] = np.arange(5)
    mask = [(column, int(y_rank[column])) for column in range(5)]
    assert mask == EXPECTED_ROTATIONS[0], mask
    print(f"p7 original x-sorted centers: {np.round(points, 6).tolist()}")
    print(f"rank-normalized 5x5 holes: {mask}")

    rotations = []
    current = list(mask)
    for turn in range(4):
        rotations.append(current)
        print(f"clockwise quarter-turn {turn}: {current}")
        current = [(4 - y, x) for x, y in current]
    assert rotations == EXPECTED_ROTATIONS, rotations

    counts: dict[tuple[int, int], int] = {}
    for orientation in rotations:
        for cell in orientation:
            counts[cell] = counts.get(cell, 0) + 1
    missing = sorted(
        ((x, y) for y in range(5) for x in range(5) if (x, y) not in counts),
        key=lambda p: (p[1], p[0]),
    )
    repeated = sorted((cell, n) for cell, n in counts.items() if n > 1)
    exposures = sum(counts.values())
    unique = len(counts)
    assert exposures == 20
    assert unique == 16
    assert len(repeated) == 4 and all(n == 2 for _, n in repeated)
    assert missing == EXPECTED_MISSING, missing
    assert (2, 2) not in counts
    assert 5 * 4 < 24

    print(f"total exposures={exposures}; unique cells={unique}/25")
    print(f"repeated cells={repeated}")
    print(f"unvisited cells={missing}")
    print("PASS: this rank-normalized five-hole mask is not a complete 5x5 turning grille.")


if __name__ == "__main__":
    run()
