"""Inspect the source-visible closed cells in LP2 page 27's isolated wing.

Reads resources/liber-primus/44.jpg, the original 2400x3600 source JPEG.
Results are raster morphology, not an assertion of a cipher or plaintext.
Run: python sims/lp2_p27_wing_venation_cells_sft.py
Requires opencv-python and numpy.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus" / "44.jpg"
# Padded original coordinate crop, avoiding artificial cuts in wing veins.
X0, Y0, X1, Y1 = 520, 450, 1940, 930
THRESHOLDS = (80, 120, 160, 200, 235)
MIN_AREA = 500


def enclosed_cells(gray: np.ndarray, threshold: int) -> list[dict[str, int]]:
    """Return bright connected components enclosed in the padded wing crop."""
    height, width = gray.shape
    count, _, stats, centroids = cv2.connectedComponentsWithStats(
        np.uint8(gray > threshold), connectivity=8
    )
    result = []
    for index in range(1, count):
        x, y, w, h, area = [int(v) for v in stats[index]]
        if area < MIN_AREA or not (x > 0 and y > 0 and x + w < width and y + h < height):
            continue
        cx, cy = centroids[index]
        result.append({
            "centroid_x": int(round(cx + X0)),
            "centroid_y": int(round(cy + Y0)),
            "area_pixels": area,
        })
    return sorted(result, key=lambda item: (item["centroid_x"], item["centroid_y"]))


def main() -> None:
    source = cv2.imread(str(SOURCE), cv2.IMREAD_GRAYSCALE)
    assert source is not None and source.shape == (3600, 2400)
    wing = source[Y0:Y1, X0:X1]
    reads = {str(t): enclosed_cells(wing, t) for t in THRESHOLDS}
    counts = {t: len(components) for t, components in reads.items()}
    assert all(value == 14 for value in counts.values()), counts
    fixed = reads["160"]
    assert fixed[0]["centroid_x"] == 812
    assert fixed[-1]["centroid_x"] == 1711
    print(json.dumps({
        "source": str(SOURCE.relative_to(ROOT)),
        "crop_xyxy": [X0, Y0, X1, Y1],
        "enclosure_definition": "white 8-neighbor component, area >=500 pixels, no crop-edge contact",
        "closed_cell_counts": counts,
        "cells_at_threshold_160_left_to_right": fixed,
        "status": "original illustration topology only; no cipher selected",
    }, indent=2))


if __name__ == "__main__":
    main()
