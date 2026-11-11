#!/usr/bin/env python3
"""Measure the original p32 red 13-dot mark without using the derived annotation."""
from __future__ import annotations

import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "49.jpg"
rgb = np.asarray(Image.open(IMAGE).convert("RGB"), dtype=np.int16)
red = (
    (rgb[:, :, 0] > 130)
    & (rgb[:, :, 1] < 100)
    & (rgb[:, :, 2] < 100)
    & ((rgb[:, :, 0] - rgb[:, :, 1]) > 50)
)
ys, xs = np.where(red)
pixels = set(zip(xs.tolist(), ys.tolist()))
components = []
while pixels:
    seed = pixels.pop()
    queue = deque([seed])
    points = [seed]
    while queue:
        x, y = queue.popleft()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dx == 0 and dy == 0:
                    continue
                q = (x + dx, y + dy)
                if q in pixels:
                    pixels.remove(q)
                    queue.append(q)
                    points.append(q)
    components.append({
        "area": len(points),
        "x": sum(p[0] for p in points) / len(points),
        "y": sum(p[1] for p in points) / len(points),
    })
components.sort(key=lambda c: (c["y"], c["x"]))
assert len(components) == 13, f"expected 13 red components, found {len(components)}"

# The mark has nine horizontal levels. Within-level y-centres differ by <1 px;
# adjacent levels are separated by at least 6 px in the original scan.
rows = []
for component in components:
    if not rows or abs(component["y"] - rows[-1]["y"]) > 4:
        rows.append({"y": component["y"], "components": [component]})
    else:
        rows[-1]["components"].append(component)
        rows[-1]["y"] = sum(c["y"] for c in rows[-1]["components"]) / len(rows[-1]["components"])
row_counts = [len(row["components"]) for row in rows]
assert row_counts == [1, 2, 1, 2, 1, 2, 1, 2, 1], row_counts

centres = [c["x"] for c in components]
columns = []
for x in sorted(centres):
    if not columns or abs(x - columns[-1]["mean"]) > 4:
        columns.append({"values": [x], "mean": x})
    else:
        columns[-1]["values"].append(x)
        columns[-1]["mean"] = sum(columns[-1]["values"]) / len(columns[-1]["values"])
column_counts = [len(col["values"]) for col in columns]
assert column_counts == [4, 5, 4], column_counts

left, centre, right = [col["mean"] for col in columns]
assert abs((left + right) / 2 - centre) < 1.0
assert sum(row_counts) == 13
assert column_counts[1] == 5
assert column_counts[0] + column_counts[2] == 8

print(json.dumps({
    "image": str(IMAGE.relative_to(ROOT)),
    "image_size": Image.open(IMAGE).size,
    "red_components": len(components),
    "row_occupancy_top_to_bottom": row_counts,
    "column_occupancy_left_to_right": column_counts,
    "decomposition": "5 central-column dots + 8 lateral dots = 13",
    "symmetry": "left/right column centroids are symmetric about the centre column",
    "interpretation_limit": "The count and geometry are exact scan observations; their intended meaning and orientation are not established."
}, indent=2))
