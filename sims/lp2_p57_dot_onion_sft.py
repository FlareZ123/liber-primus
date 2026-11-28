#!/usr/bin/env python3
"""Reproduce the p57 terminal-dot onion geometry from canonical 74.jpg."""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "74.jpg"
CORPUS = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"

EXPECTED_SHA256 = "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"
ROI = (1600, 1700, 1760, 1860)  # x0,y0,x1,y1; contains only the terminal red-dot ornament.
BOUNDARY_TOLERANCE = 1.0


def connected_components(mask: list[list[bool]]) -> list[list[tuple[int, int]]]:
    height = len(mask)
    width = len(mask[0])
    seen = [[False] * width for _ in range(height)]
    out: list[list[tuple[int, int]]] = []
    for y in range(height):
        for x in range(width):
            if not mask[y][x] or seen[y][x]:
                continue
            stack = [(x, y)]
            seen[y][x] = True
            component: list[tuple[int, int]] = []
            while stack:
                cx, cy = stack.pop()
                component.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < width and 0 <= ny < height and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        stack.append((nx, ny))
            out.append(component)
    return out


def cross(o: tuple[float, float], a: tuple[float, float], b: tuple[float, float]) -> float:
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def convex_hull_vertices(points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    pts = sorted(set(points))
    if len(pts) <= 1:
        return pts
    lower: list[tuple[float, float]] = []
    for point in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], point) <= 0:
            lower.pop()
        lower.append(point)
    upper: list[tuple[float, float]] = []
    for point in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], point) <= 0:
            upper.pop()
        upper.append(point)
    return lower[:-1] + upper[:-1]


def point_segment_distance(
    point: tuple[float, float],
    start: tuple[float, float],
    end: tuple[float, float],
) -> float:
    px, py = point
    ax, ay = start
    bx, by = end
    dx, dy = bx - ax, by - ay
    denominator = dx * dx + dy * dy
    t = 0.0 if denominator == 0 else ((px - ax) * dx + (py - ay) * dy) / denominator
    t = max(0.0, min(1.0, t))
    qx, qy = ax + t * dx, ay + t * dy
    return math.hypot(px - qx, py - qy)


def peel_boundary(
    points: list[tuple[float, float]],
    tolerance: float,
) -> tuple[list[tuple[float, float]], list[tuple[float, float]]]:
    hull = convex_hull_vertices(points)
    boundary = []
    interior = []
    for point in points:
        distance = min(
            point_segment_distance(point, hull[i], hull[(i + 1) % len(hull)])
            for i in range(len(hull))
        )
        (boundary if distance <= tolerance else interior).append(point)
    return boundary, interior


def cluster_columns(points: list[tuple[float, float]], tolerance: float = 4.0) -> list[list[float]]:
    clusters: list[list[float]] = []
    for x, _ in sorted(points):
        if not clusters or abs(x - sum(clusters[-1]) / len(clusters[-1])) > tolerance:
            clusters.append([x])
        else:
            clusters[-1].append(x)
    return clusters


data = IMAGE.read_bytes()
assert hashlib.sha256(data).hexdigest() == EXPECTED_SHA256

corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
p57 = next(page for page in corpus["pages"] if page["page"] == 57)
transliteration = "".join(corpus["translit"][value] for value in p57["indices"])
assert "SHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHINANDEMERGE" in transliteration

image = Image.open(IMAGE).convert("RGB")
assert image.size == (2400, 3600)
x0, y0, x1, y1 = ROI
crop = image.crop(ROI)
pixels = crop.load()
mask = [
    [
        pixels[x, y][0] > 150 and pixels[x, y][1] < 80 and pixels[x, y][2] < 80
        for x in range(crop.width)
    ]
    for y in range(crop.height)
]

components = [component for component in connected_components(mask) if len(component) >= 20]
assert len(components) == 23

centers: list[tuple[float, float]] = []
for component in components:
    xs = [x + x0 for x, _ in component]
    ys = [y + y0 for _, y in component]
    centers.append(((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2))

columns = cluster_columns(centers)
assert [len(column) for column in columns] == [4, 5, 5, 5, 4]

layers: list[list[tuple[float, float]]] = []
remaining = centers[:]
while len(remaining) > 1:
    boundary, remaining = peel_boundary(remaining, BOUNDARY_TOLERANCE)
    layers.append(boundary)
layers.append(remaining)

assert [len(layer) for layer in layers] == [14, 8, 1]
assert remaining == [(1677.5, 1782.0)]

# The source-visible DH convergence: total dots p=23, five columns g=5,
# second circumference A=8. With the independently selected DH operation,
# g^a = A mod p has unique a=6 in the ordinary 1..p-2 range.
p = len(centers)
g = len(columns)
A = len(layers[1])
a_hits = [a for a in range(1, p - 1) if pow(g, a, p) == A]
assert [p, g, A] == [23, 5, 8]
assert a_hits == [6]

print(json.dumps({
    "status": "PASS",
    "image": {
        "path": str(IMAGE.relative_to(ROOT)),
        "sha256": EXPECTED_SHA256,
        "size": image.size,
        "roi": ROI,
    },
    "solved_instruction": "SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE",
    "terminal_dot_count": len(centers),
    "column_populations": [len(column) for column in columns],
    "circumference_onion": [len(layer) for layer in layers],
    "center": remaining[0],
    "dh_geometry": {
        "p_total_dots": p,
        "g_columns": g,
        "A_inner_circumference": A,
        "unique_a_from_g_pow_a_eq_A_mod_p": a_hits[0],
    },
    "classification": (
        "Original-image hidden-structure recovery: the p57 terminal 23-dot ornament "
        "peels as 14/8/1 exactly under its solved circumference instruction; its "
        "23 total dots, five columns, and inner circumference8 reproduce p/g/A "
        "of the independently selected DH23 state. No unknown body plaintext."
    ),
}, indent=2))
