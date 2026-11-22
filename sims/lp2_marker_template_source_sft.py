#!/usr/bin/env python3
"""Test whether p32's 5+8 red-dot geometry is generic LP2 punctuation.

Read original 2400x3600 JPEGs. Source-coordinate crops are frozen.
Requires Pillow and NumPy; no OCR, derived masks, or ink annotations.
"""
from __future__ import annotations

import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
JPGS = ROOT / "resources" / "liber-primus"
# (x0, x1, y0, y1), in original JPEG pixel coordinates
REGIONS = {
    "p32_red_dot": ("49.jpg", (923, 974, 1625, 1720)),
    "p53_red_dot": ("70.jpg", (818, 865, 2260, 2355)),
    "p56_title_dot": ("73.jpg", (959, 1007, 682, 778)),
    "p56_body_dot": ("73.jpg", (1552, 1603, 2087, 2185)),
}


def components(filename: str, crop: tuple[int, int, int, int]) -> list[tuple[float, float]]:
    x0, x1, y0, y1 = crop
    rgb = np.asarray(Image.open(JPGS / filename).convert("RGB").crop((x0, y0, x1, y1)), dtype=np.int16)
    red = ((rgb[:, :, 0] > 130) & (rgb[:, :, 1] < 100)
           & (rgb[:, :, 2] < 100) & ((rgb[:, :, 0] - rgb[:, :, 1]) > 50))
    yy, xx = np.where(red)
    remaining = set(zip(xx.tolist(), yy.tolist()))
    out = []
    while remaining:
        seed = remaining.pop()
        queue, points = deque([seed]), [seed]
        while queue:
            x, y = queue.popleft()
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    candidate = (x + dx, y + dy)
                    if (dx or dy) and candidate in remaining:
                        remaining.remove(candidate)
                        queue.append(candidate)
                        points.append(candidate)
        out.append((sum(x for x, _ in points) / len(points),
                    sum(y for _, y in points) / len(points)))
    assert len(out) == 13, (filename, crop, len(out))
    return out


def groups(points: list[tuple[float, float]], axis: int) -> list[list[tuple[float, float]]]:
    grouped = []
    for point in sorted(points, key=lambda p: p[axis]):
        if not grouped or abs(point[axis] - np.mean([p[axis] for p in grouped[-1]])) > 4:
            grouped.append([point])
        else:
            grouped[-1].append(point)
    return grouped


def main() -> None:
    reports = {}
    reference = None
    for name, (filename, crop) in REGIONS.items():
        dots = components(filename, crop)
        row_groups, column_groups = groups(dots, 1), groups(dots, 0)
        row_counts = [len(row) for row in row_groups]
        column_counts = [len(col) for col in column_groups]
        assert row_counts == [1, 2, 1, 2, 1, 2, 1, 2, 1], row_counts
        assert column_counts == [4, 5, 4], column_counts
        ordered = [p for row in row_groups for p in sorted(row)]
        mean_x = sum(p[0] for p in ordered) / 13
        mean_y = sum(p[1] for p in ordered) / 13
        centered = [(x - mean_x, y - mean_y) for x, y in ordered]
        if reference is None:
            reference = centered
        max_deviation = max(((x - a) ** 2 + (y - b) ** 2) ** 0.5
                            for (x, y), (a, b) in zip(centered, reference))
        assert max_deviation < 3, (name, max_deviation)
        reports[name] = {
            "image": filename, "crop_xyxy": crop, "dots": len(dots),
            "row_counts": row_counts, "column_counts": column_counts,
            "max_relative_centroid_deviation_px": round(max_deviation, 4),
        }
    print(json.dumps({
        "conclusion": "p32 5+8 matches generic 13-dot punctuation on p53 and solved p56",
        "tested": reports,
    }, indent=2))


if __name__ == "__main__":
    main()
