"""Original-image D4 congruence of the 5-dot stencils on LP2 pp7,23,56.

Read-only SFT: run from repository root: python sims/lp2_fivedot_3page_d4.py
Requires OpenCV (cv2), NumPy and the 58 original LP2 scans.
"""
from itertools import permutations
from pathlib import Path
import math
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent / "resources" / "liber-primus"
IMAGES = {
    7: (24, (730, 2800, 1630, 3230)),
    23: (40, (700, 420, 1640, 880)),
    56: (73, (800, 2400, 1680, 2800)),
}
TRANSFORMS = {
    "identity": ((1, 0), (0, 1)),
    "left_right": ((-1, 0), (0, 1)),
    "up_down": ((1, 0), (0, -1)),
    "rotate_180": ((-1, 0), (0, -1)),
    "rotate_90": ((0, -1), (1, 0)),
    "rotate_270": ((0, 1), (-1, 0)),
    "diagonal": ((0, 1), (1, 0)),
    "antidiagonal": ((0, -1), (-1, 0)),
}


def original_stencil(page):
    image_number, (x0, y0, x1, y1) = IMAGES[page]
    image = cv2.imread(str(ROOT / f"{image_number:02d}.jpg"), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400), image_number
    roi = image[y0:y1, x0:x1]
    n, _, stat, centroids = cv2.connectedComponentsWithStats(
        (roi < 110).astype(np.uint8), connectivity=8
    )
    observations = []
    for i in range(1, n):
        _, _, width, height, area = [int(v) for v in stat[i]]
        if 3000 <= area < 4000 and 65 <= width <= 75 and 65 <= height <= 75:
            observations.append((centroids[i, 0] + x0, centroids[i, 1] + y0, area))
    assert len(observations) == 5, (page, observations)
    observations.sort()
    return np.array([(x, y) for x, y, _ in observations]), [a for _, _, a in observations]


def best_match(source, target, matrix):
    transformed = source @ np.asarray(matrix, dtype=float).T
    best = (float("inf"), (), ())
    for perm in permutations(range(5)):
        paired = target[list(perm)]
        translation = (paired - transformed).mean(axis=0)
        residual = paired - transformed - translation
        rms = math.sqrt(float((residual * residual).sum(axis=1).mean()))
        if rms < best[0]:
            best = (rms, perm, translation)
    return best


def main():
    points = {}
    for p in IMAGES:
        points[p], areas = original_stencil(p)
        print(f"p{p:02d} image={IMAGES[p][0]:02d}.jpg dot_areas={areas}")
    expectations = [(23, 7, "up_down"), (7, 56, "left_right"), (23, 56, "rotate_180")]
    for a, b, expected in expectations:
        scores = [(name, *best_match(points[a], points[b], matrix))
                  for name, matrix in TRANSFORMS.items()]
        scores.sort(key=lambda x: x[1])
        winner, runner = scores[0], scores[1]
        assert winner[0] == expected, (a, b, scores)
        assert winner[1] < 0.25, (a, b, winner)
        assert runner[1] > 20, (a, b, runner)
        print(f"p{a:02d}->p{b:02d} best={winner[0]} "
              f"rms={winner[1]:.6f}px translation={np.round(winner[3], 4).tolist()} "
              f"next_best={runner[0]}:{runner[1]:.3f}px")
    print("PASS: three original-page stencils establish independent vertical, "
          "horizontal and compositional 180-degree mappings")


if __name__ == "__main__":
    main()
