"""Inspect the source-visible enclosed cells in LP2 page 27's wing.

Original input: resources/liber-primus/44.jpg (2400x3600).
This is an image-topology fingerprint, not a ciphertext decoder.
Run: python sims/lp2_p27_wing_venation_cells_sft.py
Dependencies: opencv-python, numpy, scipy.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus" / "44.jpg"
X0, Y0, X1, Y1 = 520, 450, 1940, 930
THRESHOLDS = (80, 120, 160, 200, 235)
MIN_AREA = 500


def label_cells(gray: np.ndarray, threshold: int) -> tuple[np.ndarray, list[int]]:
    """Label white enclosed components in the padded original wing crop."""
    height, width = gray.shape
    n, labels, stats, centroids = cv2.connectedComponentsWithStats(
        np.uint8(gray > threshold), connectivity=8
    )
    cells = [i for i in range(1, n)
             if stats[i, cv2.CC_STAT_AREA] >= MIN_AREA
             and stats[i, cv2.CC_STAT_LEFT] > 0
             and stats[i, cv2.CC_STAT_TOP] > 0
             and stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] < width
             and stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] < height]
    cells.sort(key=lambda i: (centroids[i, 0], centroids[i, 1]))
    return labels, cells


def enclosed_cells(gray: np.ndarray, threshold: int) -> list[dict[str, int]]:
    """Coordinates and areas of left-to-right enclosed bright faces."""
    labels, cells = label_cells(gray, threshold)
    result = []
    for index in cells:
        y, x = np.where(labels == index)
        result.append({
            "centroid_x": int(round(np.mean(x) + X0)),
            "centroid_y": int(round(np.mean(y) + Y0)),
            "area_pixels": int(len(y)),
        })
    return result


def adjacency_edges(gray: np.ndarray, threshold: int) -> list[list[int]]:
    """Face graph using 30-pixel reciprocal contact along 25 contour pixels.

    Face numbers are the left-to-right ordering, starting from 1.
    This is a documented raster-proximity graph, not a taxonomy classification.
    """
    labels, cells = label_cells(gray, threshold)
    contours = []
    for i in cells:
        boundary, _ = cv2.findContours(
            np.uint8(labels == i), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE
        )
        contours.append(np.concatenate([b[:, 0, :] for b in boundary], axis=0))
    edges = []
    for i in range(len(cells)):
        for j in range(i + 1, len(cells)):
            left, right = contours[i], contours[j]
            d1 = cKDTree(left).query(right, k=1)[0]
            d2 = cKDTree(right).query(left, k=1)[0]
            contact = min(np.count_nonzero(d1 <= 30), np.count_nonzero(d2 <= 30))
            if contact >= 25:
                edges.append([i + 1, j + 1])
    return edges


def main() -> None:
    source = cv2.imread(str(SOURCE), cv2.IMREAD_GRAYSCALE)
    assert source is not None and source.shape == (3600, 2400)
    wing = source[Y0:Y1, X0:X1]
    rows = {str(t): enclosed_cells(wing, t) for t in THRESHOLDS}
    counts = {t: len(cells) for t, cells in rows.items()}
    assert all(n == 14 for n in counts.values()), counts
    graphs = {str(t): adjacency_edges(wing, t) for t in THRESHOLDS}
    assert len(graphs["160"]) == 26
    assert all(graph == graphs["160"] for graph in graphs.values())
    fixed = rows["160"]
    assert fixed[0]["centroid_x"] == 812
    assert fixed[-1]["centroid_x"] == 1711
    print(json.dumps({
        "source": str(SOURCE.relative_to(ROOT)),
        "crop_xyxy": [X0, Y0, X1, Y1],
        "enclosure": "8-connected white >threshold, area>=500, exclude crop-edge",
        "counts_by_threshold": counts,
        "faces_at_threshold160": fixed,
        "contact": "within30px for >=25 contour points in both directions",
        "adjacency_edge_counts": {t: len(g) for t, g in graphs.items()},
        "adjacency_edges_1based": graphs["160"],
        "interpretation": "original image fingerprint only; no key or plaintext",
    }, indent=2))


if __name__ == "__main__":
    main()
