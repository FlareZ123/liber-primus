"""Original-image geometric gate for the historical 2014 76+23 prime-hole proposal.

Reads original p57 (archive 74.jpg) red 23-dot end stencil and original
5×5/7×7/5×5 magic-square values. The dots have five parallel occupied columns.
Every invertible affine map must preserve that five-parallel-line cover.
The 17 prime-valued cells of the original 7×7 square alone require at least
seven parallel lines in every direction, so those cells cannot be registered
by one affine transform to any subset of the 23 original dots.

This rejects ONLY a literal geometrical dot-to-prime-hole overlay. It does
not exclude an explicitly instructed nongeometric 23-cell permutation.

Reproduce: Python 3.11+, cv2 and numpy. Execute this file within the repo.
"""
from __future__ import annotations

import hashlib
import json
from itertools import combinations
from math import gcd, isqrt
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources/liber-primus/74.jpg"
SQUARES = ROOT / "resources/cicada2014-openpuff-magic-squares.txt"
SHA256_P57 = "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"


def prime(value: int) -> bool:
    return value >= 2 and all(value % d != 0 for d in range(2, isqrt(value) + 1))


def source_squares() -> list[list[list[int]]]:
    parts = SQUARES.read_text(encoding="utf-8").strip().split("\n\n")
    squares = [
        [[int(value) for value in line.split()] for line in part.splitlines()]
        for part in parts
    ]
    assert [len(s) for s in squares] == [5, 7, 5]
    assert all(all(len(row) == len(s) for row in s) for s in squares)
    assert [sum(s[0]) for s in squares] == [3301, 1033, 1033]
    assert [sum(prime(v) for row in s for v in row) for s in squares] == [1, 17, 6]
    return squares


def dot_stencil() -> tuple[list[tuple[float, float]], list[int], list[int]]:
    image_bytes = IMAGE.read_bytes()
    assert hashlib.sha256(image_bytes).hexdigest() == SHA256_P57
    image = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    assert image.shape == (3600, 2400, 3)
    left, right, top, bottom = 1635, 1735, 1730, 1840
    patch = image[top:bottom, left:right].astype(np.int16)
    blue, green, red = patch[:, :, 0], patch[:, :, 1], patch[:, :, 2]
    ink = ((red > 90) & (red * 10 > green * 17) & (red * 10 > blue * 17)).astype(np.uint8)
    count, _, sizes, centroids = cv2.connectedComponentsWithStats(ink, connectivity=8)
    dots = sorted(
        [(float(centroids[i, 0] + left), float(centroids[i, 1] + top))
         for i in range(1, count) if 65 <= sizes[i, cv2.CC_STAT_AREA] <= 120],
        key=lambda point: (point[1], point[0]),
    )
    assert len(dots) == 23, "Expected precisely the 23 red square dots, not nearby glyph ink"
    # Centers of the five printed columns (0 and 4: four dots; 1,2,3: five).
    columns = [round((x - 1647.5) / 15.0) for x, _ in dots]
    assert all(0 <= c <= 4 and abs(x - (1647.5 + 15.0 * c)) <= 0.6
               for (x, _), c in zip(dots, columns))
    column_counts = [columns.count(i) for i in range(5)]
    assert column_counts == [4, 5, 5, 5, 4]
    # Horizontal row grouping: use original source-pixel y, with <1px tolerance.
    rows: list[list[tuple[float, float]]] = []
    for dot in dots:
        if rows and abs(dot[1] - rows[-1][0][1]) < 1.0:
            rows[-1].append(dot)
        else:
            rows.append([dot])
    row_counts = [len(row) for row in rows]
    assert row_counts == [3, 2, 3, 2, 3, 2, 3, 2, 3]
    return dots, column_counts, row_counts


def min_parallel_lines(points: list[tuple[int, int]]) -> tuple[int, list[tuple[int, int]]]:
    """Exact affine-invariant minimum lines in any common parallel direction."""
    normals = set()
    for (x, y), (u, v) in combinations(points, 2):
        dx, dy = u - x, v - y
        g = gcd(abs(dx), abs(dy))
        dx, dy = dx // g, dy // g
        if dx < 0 or (dx == 0 and dy < 0):
            dx, dy = -dx, -dy
        normals.add((-dy, dx))
    assert normals
    cover = min(len({a * x + b * y for x, y in points}) for a, b in normals)
    witnesses = sorted(
        (a, b) for a, b in normals
        if len({a * x + b * y for x, y in points}) == cover
    )
    return cover, witnesses


def run() -> dict:
    squares = source_squares()
    dots, colcounts, rowcounts = dot_stencil()
    primeholes7 = [
        (col, row)
        for row, line in enumerate(squares[1])
        for col, value in enumerate(line)
        if prime(value)
    ]
    assert len(primeholes7) == 17
    hole_cover, witnesses = min_parallel_lines(primeholes7)
    assert hole_cover == 7
    # Positive: arbitrary invertible affine maps preserve the cover count.
    planted = [(3*x + 2*y + 11, x + 2*y + 17) for x,y in primeholes7]
    assert min_parallel_lines(planted)[0] == hole_cover
    assert len({x for x, _ in dots}) == 5, "Original stencil has five pixel-true x-columns"
    assert sum(colcounts) == 23
    assert hole_cover > len(colcounts)
    return {
        "status": "PASS",
        "source_p57_sha256": SHA256_P57,
        "original_red_stencil_dots": len(dots),
        "stencil_columns": len(colcounts),
        "stencil_column_occupancy": colcounts,
        "stencil_row_occupancy": rowcounts,
        "original_7x7_prime_cells": len(primeholes7),
        "minimum_parallel_lines_covering_7x7_prime_cells": hole_cover,
        "minimum_cover_direction_normals": witnesses,
        "positive_control_invertible_affine_reparametrization": "PASS",
        "inference": "Five parallel stencil columns cannot map by one affine transform onto the 17 7x7 prime holes, which require at least seven parallel lines. The other six 5x5 prime holes cannot remove this obstruction.",
        "scope": "Rejects literal whole-set affine overlay only. Does not reject non-geometric, separately selected hole permutations, stateful decoders, or the 76/23 cardinality. No p55 plaintext recovered.",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
