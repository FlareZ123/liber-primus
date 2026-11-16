"""Source-original five-dot/orthogonal-triangle test for LP2 p56.

From repository root run: python sims/lp2_p56_vespucci_3plus2_source_gate.py
Requires NumPy and OpenCV; reads original JPEG without modifying it.
"""
from __future__ import annotations

import itertools
from pathlib import Path

import cv2
import numpy as np

SOURCE = Path("resources/liber-primus/73.jpg")
SEED = 20261116
SAMPLES = 1_000_000
BATCH = 25_000
TOL_DEG = 3.0
MIN_SEP = 70.0


def angle_at(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> np.ndarray:
    v = b - a
    w = c - a
    cross = np.abs(v[..., 0] * w[..., 1] - v[..., 1] * w[..., 0])
    dot = np.sum(v * w, axis=-1)
    return np.degrees(np.arctan2(cross, dot))


def any_near_right(points: np.ndarray) -> np.ndarray:
    outcome = np.zeros(points.shape[0], dtype=bool)
    for i, j, k in itertools.combinations(range(5), 3):
        a, b, c = points[:, i], points[:, j], points[:, k]
        for angle in (angle_at(a, b, c), angle_at(b, a, c), angle_at(c, a, b)):
            outcome |= np.abs(angle - 90.0) <= TOL_DEG
    return outcome


def main() -> None:
    im = cv2.imread(str(SOURCE), cv2.IMREAD_GRAYSCALE)
    assert im is not None and im.shape == (3600, 2400)
    x0, x1, y0, y1 = 650, 1800, 2300, 2950
    mask = np.uint8(im[y0:y1, x0:x1] < 80)
    count, _, stats, centers = cv2.connectedComponentsWithStats(mask, connectivity=8)
    dots = []
    for i in range(1, count):
        _, _, w, h, area = stats[i]
        if 3000 <= area <= 4000 and 65 <= w <= 75 and 65 <= h <= 75:
            dots.append((float(centers[i][0] + x0), float(centers[i][1] + y0), int(area)))
    assert len(dots) == 5, dots
    dots.sort(key=lambda z: z[0])
    coords = np.array([(x, y) for x, y, _ in dots], dtype=float)
    observed_angle = float(angle_at(coords[0], coords[1], coords[2]))
    observed_gaps = np.diff(coords[:, 0])
    assert abs(observed_angle - 90.0) <= TOL_DEG
    assert int(np.argmax(observed_gaps)) == 2
    print("Original image:", SOURCE)
    for i, (x, y, area) in enumerate(dots):
        print(f"dot{i}: center=({x:.3f},{y:.3f}), dark area={area}")
    print(f"original leftmost angle={observed_angle:.9f} degrees")
    print(f"original sorted-x gaps={observed_gaps.tolist()}")
    print("original near-right/3+2 observations: both true")

    rng = np.random.default_rng(SEED)
    width = float(coords[-1, 0] - coords[0, 0])
    height = float(coords[:, 1].max() - coords[:, 1].min())
    totals = np.zeros((2, 6), dtype=np.int64)
    row, col = np.triu_indices(5, 1)
    for start in range(0, SAMPLES, BATCH):
        size = min(BATCH, SAMPLES - start)
        sample = rng.random((size, 5, 2))
        sample[..., 0] *= width
        sample[..., 1] *= height
        sample = np.take_along_axis(sample, np.argsort(sample[..., 0], axis=1)[:, :, None], axis=1)
        near = np.abs(angle_at(sample[:, 0], sample[:, 1], sample[:, 2]) - 90.0) <= TOL_DEG
        gap = np.argmax(np.diff(sample[..., 0], axis=1), axis=1) == 2
        any_angle = any_near_right(sample)
        delta = sample[:, :, None, :] - sample[:, None, :, :]
        sqdist = np.sum(delta * delta, axis=-1)
        spaced = np.all(sqdist[:, row, col] >= MIN_SEP ** 2, axis=1)
        for idx, included in ((0, np.ones(size, bool)), (1, spaced)):
            totals[idx] += np.array([
                included.sum(), (included & near).sum(), (included & gap).sum(),
                (included & near & gap).sum(), (included & any_angle).sum(),
                (included & any_angle & gap).sum(),
            ], dtype=np.int64)

    for name, t in zip(("unrestricted", "nonoverlapping-70px"), totals):
        n, near, gap, both, any_angle, any_both = map(int, t)
        assert n > 0
        print(f"NULL {name}: N={n} near-first={near/n:.8f} gap3+2={gap/n:.8f} both={both/n:.8f}")
        print(f"NULL {name}: any-triple-near-right={any_angle/n:.8f} any-triple-and-gap={any_both/n:.8f}")
    print("Conditional shape illustration only. Postselected source/angle cannot establish authorship, a key, or plaintext.")


if __name__ == "__main__":
    main()
