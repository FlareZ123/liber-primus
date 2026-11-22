"""SFT: native-image five-dot geometry on LP2 physical pages 7, 23, 56.

Requires numpy, opencv-python and original 24.jpg, 40.jpg, 73.jpg in
resources/liber-primus/. Runs without hidden parameters or OCR.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "resources" / "liber-primus"
SCAN = {7: "24.jpg", 23: "40.jpg", 56: "73.jpg"}
SHA = {
    7: "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c",
    23: "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee",
    56: "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
}
REGIONS = {
    7: (700, 1700, 2750, 3300),
    23: (700, 1700, 350, 950),
    56: (700, 1750, 2350, 2850),
}


def centroids(image: np.ndarray, region: tuple[int, int, int, int]) -> np.ndarray:
    x0, x1, y0, y1 = region
    window = (image[y0:y1, x0:x1] < 160).astype(np.uint8)
    count, _, stats, centers = cv2.connectedComponentsWithStats(window, 8)
    found = []
    for i in range(1, count):
        _, _, width, height, area = stats[i]
        if 2000 <= area <= 6000 and 45 <= width <= 100 and 45 <= height <= 100:
            found.append((float(x0 + centers[i, 0]), float(y0 + centers[i, 1])))
    assert len(found) == 5, (region, found)
    return np.array(sorted(found), dtype=np.float64)


def best_translation(a: np.ndarray, b: np.ndarray, sx: int, sy: int):
    left = a * [sx, sy]
    right = b[::-1] if sx < 0 else b
    displacements = right - left
    shift = displacements.mean(axis=0)
    distances = np.sqrt(np.sum((displacements - shift) ** 2, axis=1))
    return shift, float(np.sqrt(np.mean(distances ** 2))), float(np.max(distances))


def run() -> None:
    images: dict[int, np.ndarray] = {}
    points: dict[int, np.ndarray] = {}
    for page, name in SCAN.items():
        f = SOURCES / name
        assert sha256(f.read_bytes()).hexdigest() == SHA[page], f
        image = cv2.imread(str(f), cv2.IMREAD_GRAYSCALE)
        assert image is not None and image.shape == (3600, 2400), f
        images[page] = image
        points[page] = centroids(image, REGIONS[page])
        print(f"p{page} original dots [x,y]: {np.round(points[page], 4).tolist()}")

    for first, second, want_x, want_y in ((7, 23, 1, -1), (7, 56, -1, 1), (23, 56, -1, -1)):
        alternatives = []
        for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
            shift, rms, max_error = best_translation(points[first], points[second], sx, sy)
            alternatives.append((sx, sy, rms, shift, max_error))
        winner = min(alternatives, key=lambda row: row[2])
        wrong = min(row[2] for row in alternatives if row[:2] != (want_x, want_y))
        assert winner[:2] == (want_x, want_y), (first, second, winner)
        assert winner[2] < 0.35 and wrong > 100, (winner, wrong)
        print(
            f"p{first}->p{second}: signs={want_x, want_y}; "
            f"translation={np.round(winner[3], 4).tolist()}; "
            f"centroid RMS={winner[2]:.6f}px; max={winner[4]:.6f}px; "
            f"best wrong-sign RMS={wrong:.6f}px"
        )

    p7 = (images[7] < 160)[2800:3240, 720:1660][:, ::-1]
    shift, _, _ = best_translation(points[7], points[56], -1, 1)
    shift_x = round(float(shift[0] - 2399))
    shift_y = round(float(shift[1]))
    p56 = (images[56] < 160)[
        2800 + shift_y : 3240 + shift_y,
        740 + shift_x : 1680 + shift_x,
    ]
    assert p7.shape == p56.shape == (440, 940)
    both = np.count_nonzero(p7 & p56)
    either = np.count_nonzero(p7 | p56)
    iou = both / either
    assert iou > 0.95, iou
    print(
        f"p7 horizontal ink reflection -> p56: (dx,dy)=({shift_x},{shift_y}); "
        f"IoU={iou:.9f}; mismatched pixels={np.count_nonzero(p7 != p56)}"
    )
    print("PASS: p7/p23 vertical mirror, p7/p56 horizontal mirror, p23/p56 rotation.")


if __name__ == "__main__":
    run()
