"""Search all 75 original Liber Primus JPEGs for the exact five-dot geometry on LP2 p7.

The search fixes pixel size and source dot separations. Only translation and
four axial reflection signs are allowed; no rotation fitting, scale or shear.
"""
from __future__ import annotations

from collections import Counter
from itertools import product
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
SOURCE = np.array([
    [796.9461, 3105.7397], [992.4667, 3166.6876],
    [1296.9662, 2866.7040], [1479.3638, 3127.5000],
    [1527.2172, 2936.2049],
], dtype=np.float64)
TEMPLATES = [(sx, sy, SOURCE * [sx, sy]) for sx, sy in product((1, -1), repeat=2)]
THRESHOLD_PX = 3.0


def candidate_centers(gray: np.ndarray) -> np.ndarray:
    x0, y0 = 600, 200
    mask = (gray[y0:3350, x0:1900] < 160).astype(np.uint8)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    centers = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if not (45 <= w <= 100 and 45 <= h <= 100):
            continue
        if not (1900 <= cv2.contourArea(contour) <= 6000):
            continue
        moment = cv2.moments(contour)
        if moment["m00"] > 0:
            centers.append((
                moment["m10"] / moment["m00"] + x0,
                moment["m01"] / moment["m00"] + y0,
            ))
    return np.array(centers, dtype=np.float64).reshape(-1, 2)


def match(centers: np.ndarray) -> tuple[int, float, tuple[int, int]]:
    if centers.size == 0:
        return 0, 0.0, (1, 1)
    best_count, best_rms, best_sign = 0, float("inf"), (1, 1)
    for sx, sy, template in TEMPLATES:
        for image_point in centers:
            for source_point in template:
                translation = image_point - source_point
                nearest = np.linalg.norm(
                    template[:, None, :] + translation - centers[None, :, :],
                    axis=2,
                ).min(axis=1)
                matched = nearest[nearest <= THRESHOLD_PX]
                count = len(matched)
                rms = float(np.sqrt(np.mean(matched ** 2))) if count else float("inf")
                if count > best_count or (count == best_count and rms < best_rms):
                    best_count, best_rms, best_sign = count, rms, (sx, sy)
    return best_count, best_rms, best_sign


def run() -> None:
    hits = {}
    census = Counter()
    for archive_image in range(75):
        file = ROOT / f"{archive_image:02d}.jpg"
        image = cv2.imread(str(file), cv2.IMREAD_GRAYSCALE)
        assert image is not None and image.shape == (3600, 2400), file
        centers = candidate_centers(image)
        score = match(centers)
        census[score[0]] += 1
        if score[0] >= 2:
            hits[archive_image] = (len(centers), score)
            print(
                f"{archive_image:02d}.jpg candidates={len(centers)} "
                f"matches={score[0]}/5 rms={score[1]:.4f} sign={score[2]}"
            )
    print("Match-count histogram:", dict(sorted(census.items())))
    assert sorted(hits) == [24, 40, 73], hits
    assert [hits[p][1][0] for p in (24, 40, 73)] == [5, 5, 5]
    assert [hits[p][1][2] for p in (24, 40, 73)] == [
        (1, 1), (1, -1), (-1, 1),
    ]
    assert dict(census) == {0: 56, 1: 16, 5: 3}, census
    assert sum(census.values()) == 75
    print("PASS: exact five-dot stencil occurs only on LP2 p7,p23,p56 across all 75 original scans.")


if __name__ == "__main__":
    run()
