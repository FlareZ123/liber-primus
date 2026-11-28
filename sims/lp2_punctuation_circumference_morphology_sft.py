#!/usr/bin/env python3
"""Raster charge of LP2 red large-punctuation morphology under p57's circumference instruction."""

from __future__ import annotations

import json
import math
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "resources" / "liber-primus"
INK = json.loads((RES / "lp2-ink-annotations.json").read_text(encoding="utf-8"))

RED_THRESHOLD = (150, 80, 80)
AREA_RANGE = (40, 100)
BOX_RANGE = (6, 11)
CLUSTER_DISTANCE = 25.0
BOUNDARY_TOLERANCE = 1.0


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def hull(points):
    pts = sorted(set(points))
    if len(pts) <= 1:
        return pts
    lower = []
    for point in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], point) <= 0:
            lower.pop()
        lower.append(point)
    upper = []
    for point in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], point) <= 0:
            upper.pop()
        upper.append(point)
    return lower[:-1] + upper[:-1]


def point_segment_distance(point, start, end):
    px, py = point
    ax, ay = start
    bx, by = end
    dx, dy = bx - ax, by - ay
    denominator = dx * dx + dy * dy
    t = 0.0 if denominator == 0 else ((px - ax) * dx + (py - ay) * dy) / denominator
    t = max(0.0, min(1.0, t))
    qx, qy = ax + t * dx, ay + t * dy
    return math.hypot(px - qx, py - qy)


def onion(points):
    remaining = list(points)
    layers = []
    while len(remaining) > 1:
        polygon = hull(remaining)
        boundary = [
            point
            for point in remaining
            if min(
                point_segment_distance(point, polygon[i], polygon[(i + 1) % len(polygon)])
                for i in range(len(polygon))
            )
            <= BOUNDARY_TOLERANCE
        ]
        assert boundary
        layers.append(len(boundary))
        remaining = [point for point in remaining if point not in boundary]
    if remaining:
        layers.append(1)
    return layers


def x_column_populations(points):
    clusters = []
    for x, _ in sorted(points):
        if not clusters or abs(x - sum(clusters[-1]) / len(clusters[-1])) > 4.0:
            clusters.append([x])
        else:
            clusters[-1].append(x)
    return [len(cluster) for cluster in clusters]


def dot_components(image):
    arr = np.asarray(image.convert("RGB"))
    mask = (
        (arr[:, :, 0] > RED_THRESHOLD[0])
        & (arr[:, :, 1] < RED_THRESHOLD[1])
        & (arr[:, :, 2] < RED_THRESHOLD[2])
    )
    labels, _ = ndimage.label(mask)
    objects = ndimage.find_objects(labels)
    components = []
    for label_id, slices in enumerate(objects, start=1):
        if slices is None:
            continue
        y_slice, x_slice = slices
        width = x_slice.stop - x_slice.start
        height = y_slice.stop - y_slice.start
        area = int((labels[slices] == label_id).sum())
        if (
            AREA_RANGE[0] <= area <= AREA_RANGE[1]
            and BOX_RANGE[0] <= width <= BOX_RANGE[1]
            and BOX_RANGE[0] <= height <= BOX_RANGE[1]
        ):
            components.append(
                (
                    (x_slice.start + x_slice.stop - 1) / 2,
                    (y_slice.start + y_slice.stop - 1) / 2,
                )
            )
    return components


def spatial_clusters(points):
    seen = [False] * len(points)
    clusters = []
    for start in range(len(points)):
        if seen[start]:
            continue
        stack = [start]
        seen[start] = True
        indices = []
        while stack:
            current = stack.pop()
            indices.append(current)
            x, y = points[current]
            for other in range(len(points)):
                if seen[other]:
                    continue
                xx, yy = points[other]
                if math.hypot(x - xx, y - yy) <= CLUSTER_DISTANCE:
                    seen[other] = True
                    stack.append(other)
        cluster = [points[index] for index in indices]
        if len(cluster) in (10, 13, 23):
            clusters.append(cluster)
    return clusters


records = []
for source_image in range(17, 75):
    image_path = RES / f"{source_image:02d}.jpg"
    assert image_path.exists(), image_path
    for cluster in spatial_clusters(dot_components(Image.open(image_path))):
        records.append(
            {
                "source_image": source_image,
                "count": len(cluster),
                "columns": x_column_populations(cluster),
                "onion": onion(cluster),
            }
        )

# The annotations have one additional black 13-dot mark on p7; this raster scan is red-only.
annotated_red = Counter()
for page in INK["pages"]:
    for mark in page.get("large_punctuation", []):
        if mark[2] == "red" and mark[1] in (10, 13, 23):
            annotated_red[mark[1]] += 1

raster_counts = Counter(record["count"] for record in records)
assert annotated_red == Counter({13: 30, 10: 4, 23: 1})
assert raster_counts == annotated_red

signatures = Counter(
    (record["count"], tuple(record["columns"]), tuple(record["onion"]))
    for record in records
)
assert signatures == Counter(
    {
        (13, (4, 5, 4), (10, 3)): 30,
        (10, (3, 4, 3), (8, 2)): 4,
        (23, (4, 5, 5, 5, 4), (14, 8, 1)): 1,
    }
)

terminal = next(record for record in records if record["count"] == 23)
assert terminal["source_image"] == 74

# P57's solved instruction supplies the operation: shed circumferences.
# The uniform red punctuation classes then expose the historical DH state.
p = terminal["count"]
g = len(terminal["columns"])
A = terminal["onion"][1]
e_values = {record["onion"][-1] for record in records if record["count"] == 13}
K_values = {record["onion"][-1] for record in records if record["count"] == 10}
assert e_values == {3}
assert K_values == {2}
e = next(iter(e_values))
K = next(iter(K_values))

b_candidates = [value for value in range(1, p - 1) if (e * value) % (p - 1) == 1]
assert b_candidates == [15]
b = b_candidates[0]

a_candidates = [value for value in range(1, p - 1) if pow(g, value, p) == A]
assert a_candidates == [6]
a = a_candidates[0]
B = pow(g, b, p)
assert B == 19
assert pow(A, b, p) == K
assert pow(B, a, p) == K

state = {"p": p, "g": g, "a": a, "b": b, "A": A, "B": B, "K": K, "e": e}
assert state == {"p": 23, "g": 5, "a": 6, "b": 15, "A": 8, "B": 19, "K": 2, "e": 3}

print(
    json.dumps(
        {
            "status": "PASS",
            "red_annotation_counts": dict(sorted(annotated_red.items())),
            "raster_counts": dict(sorted(raster_counts.items())),
            "morphology_signatures": [
                {
                    "count": count,
                    "columns": list(columns),
                    "circumference_onion": list(layers),
                    "multiplicity": multiplicity,
                }
                for (count, columns, layers), multiplicity in sorted(signatures.items())
            ],
            "terminal_source_image": terminal["source_image"],
            "recovered_dh_state": state,
            "classification": (
                "P57's solved circumference instruction turns the complete original red-punctuation "
                "morphology into a uniform hidden-state register: 13-marks leave3=e, 10-marks leave2=K, "
                "and the unique 23-mark supplies p=23, five columns g=5, inner circumference A=8; "
                "ordinary DH then forces a=6,b=15,B=19. No unknown body plaintext."
            ),
        },
        indent=2,
    )
)
