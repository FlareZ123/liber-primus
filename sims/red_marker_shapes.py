#!/usr/bin/env python3
"""Classify red punctiform ornaments in the original Liber Primus JPEG scans.

Usage: python red_marker_shapes.py resources/liber-primus
Requires numpy and opencv-python-headless. Reads the 58 LP2 original JPEG pages.
"""
import json
import sys
from collections import defaultdict
from pathlib import Path

import cv2
import numpy as np


def clusters(dots):
    """Group nearby dot components; resolve row and column levels separately."""
    remaining = set(range(len(dots)))
    while remaining:
        stack = [remaining.pop()]
        seen = []
        while stack:
            i = stack.pop()
            seen.append(dots[i])
            neighbors = {j for j in remaining if np.linalg.norm(dots[i] - dots[j]) <= 31}
            remaining -= neighbors
            stack.extend(neighbors)
        if len(seen) >= 5:
            yield np.asarray(seen)


def axis_centres(values, tolerance=4.0):
    """Cluster actual dot-centre levels; adjacent alternating rows stay distinct."""
    grouped = []
    for value in sorted(float(v) for v in values):
        if not grouped or value - float(np.mean(grouped[-1])) > tolerance:
            grouped.append([value])
        else:
            grouped[-1].append(value)
    return [float(np.mean(group)) for group in grouped]


def grid_pattern(group, tolerance=4.0):
    """Return (column,row) cells using independent 4-pixel axis clustering."""
    xs = axis_centres(group[:, 0], tolerance)
    ys = axis_centres(group[:, 1], tolerance)
    cells = []
    for x, y in group:
        col = min(range(len(xs)), key=lambda i: abs(xs[i] - x))
        row = min(range(len(ys)), key=lambda i: abs(ys[i] - y))
        assert abs(xs[col] - x) <= tolerance and abs(ys[row] - y) <= tolerance
        cells.append((col, row))
    assert len(set(cells)) == len(group), (group, cells)
    return tuple(sorted(cells))


def grid_rows(pattern):
    """Render normalized cells as top-to-bottom occupancy rows."""
    width = max(x for x, _ in pattern) + 1
    height = max(y for _, y in pattern) + 1
    cells = set(pattern)
    return tuple("".join("#" if (x, y) in cells else "." for x in range(width))
                 for y in range(height))


def scan(images):
    out = defaultdict(list)
    for page in range(17, 75):
        img = cv2.imread(str(images / f"{page:02d}.jpg"))
        assert img is not None, (images, page)
        blue, green, red = cv2.split(img)
        red = red.astype(np.float32)
        mask = ((red > 85) & (red > green.astype(np.float32) * 1.4)
                & (red > blue.astype(np.float32) * 1.4) & (green < 130)).astype(np.uint8)
        n, _, boxes, centers = cv2.connectedComponentsWithStats(mask)
        dots = np.asarray([
            centers[i] for i in range(1, n)
            if 7 <= boxes[i, cv2.CC_STAT_WIDTH] <= 12
            and 7 <= boxes[i, cv2.CC_STAT_HEIGHT] <= 12
            and 55 <= boxes[i, cv2.CC_STAT_AREA] <= 120
        ], dtype=np.float64).reshape(-1, 2)
        for group in clusters(dots):
            minima = group.min(axis=0)
            maxima = group.max(axis=0)
            if maxima[0] - minima[0] > 90 or maxima[1] - minima[1] > 180:
                continue
            pat = grid_pattern(group)
            out[pat].append({"archive_jpg": page, "lp2_physical_page": page - 17,
                             "x": round(float(minima[0])), "y": round(float(minima[1])),
                             "grid_rows": grid_rows(pat)})
    return out


if __name__ == "__main__":
    paths = scan(Path(sys.argv[1]) if len(sys.argv) > 1 else Path("resources/liber-primus"))
    patterns = sorted(paths, key=lambda pat: (-len(paths[pat]), -len(pat), pat))
    print(json.dumps({
        "sampled_archive_pages": "17.jpg--74.jpg inclusive (58 LP2 physical images)",
        "total_clusters": sum(len(paths[k]) for k in patterns),
        "patterns": [{"count": len(paths[k]), "dot_count": len(k),
                      "normalized_grid_cells": k, "locations": paths[k]}
                     for k in patterns],
    }, indent=2))
