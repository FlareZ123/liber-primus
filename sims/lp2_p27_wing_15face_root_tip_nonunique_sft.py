"""Original p27 wing: count all local root-to-tip 15-face traversals.

Input is the original 2014 LP2 44.jpg (physical p27), with SHA256 asserted.
The operation uses only face contacts inferred from native pixels. This script
quantifies whether topology itself dictates a *unique* reading path. It makes
no key search, no OCR, no edits to original runes or claims of decryption.
Dependencies: opencv-python, numpy, scipy. Run as a standalone test file.
"""
from __future__ import annotations

import hashlib
import json
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus" / "44.jpg"
SHA256 = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"
X0, Y0, X1, Y1 = 520, 450, 1940, 930
THRESHOLDS = (80, 120, 160, 200, 235)
CONTACT_RADII = (18, 22, 26, 30)
MIN_AREA = 200
MIN_CONTACT_PIXELS = 25


def hamiltonian_count(
    n: int, edges: list[tuple[int, int]], start: int, end: int
) -> tuple[int, list[list[int]]]:
    """Count every self-avoiding adjacent-face path visiting all cells once."""
    adjacency: list[list[int]] = [[] for _ in range(n)]
    for a, b in edges:
        adjacency[a].append(b)
        adjacency[b].append(a)
    for neighbours in adjacency:
        neighbours.sort()
    full = (1 << n) - 1

    @lru_cache(maxsize=None)
    def ways(mask: int, last: int) -> int:
        if mask == full:
            return int(last == end)
        return sum(
            ways(mask | (1 << nxt), nxt)
            for nxt in adjacency[last]
            if not (mask & (1 << nxt))
            and (nxt != end or (mask | (1 << nxt)) == full)
        )

    total = ways(1 << start, start)
    examples: list[list[int]] = []

    def collect(mask: int, last: int, partial: list[int]) -> None:
        if len(examples) >= 2:
            return
        if mask == full:
            if last == end:
                examples.append([x + 1 for x in partial])
            return
        for nxt in adjacency[last]:
            nm = mask | (1 << nxt)
            if not mask & (1 << nxt) and ways(nm, nxt):
                collect(nm, nxt, partial + [nxt])

    collect(1 << start, start, [start])
    return total, examples


def segmented_faces(
    wing: np.ndarray, threshold: int
) -> tuple[np.ndarray, list[int], np.ndarray]:
    n, labels, stats, centers = cv2.connectedComponentsWithStats(
        np.uint8(wing > threshold), connectivity=8
    )
    width, height = X1 - X0, Y1 - Y0
    indices = [
        i for i in range(1, n)
        if stats[i, cv2.CC_STAT_AREA] >= MIN_AREA
        and stats[i, cv2.CC_STAT_LEFT] > 0
        and stats[i, cv2.CC_STAT_TOP] > 0
        and stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] < width
        and stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] < height
    ]
    indices.sort(key=lambda i: (centers[i, 0], centers[i, 1]))
    return labels, indices, centers


def source_edges(
    labels: np.ndarray, indices: list[int], radius: int
) -> list[tuple[int, int]]:
    contour = []
    for i in indices:
        boundaries, _ = cv2.findContours(
            np.uint8(labels == i), cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_NONE
        )
        contour.append(np.concatenate([x[:, 0, :] for x in boundaries], axis=0))
    edges = []
    for i in range(len(indices)):
        left_tree = cKDTree(contour[i])
        for j in range(i + 1, len(indices)):
            right_tree = cKDTree(contour[j])
            d1 = left_tree.query(contour[j], k=1)[0]
            d2 = right_tree.query(contour[i], k=1)[0]
            contact = min(
                np.count_nonzero(d1 <= radius),
                np.count_nonzero(d2 <= radius)
            )
            if contact >= MIN_CONTACT_PIXELS:
                edges.append((i, j))
    return edges


def main() -> None:
    # Independent algorithm positives: a chain is unique, and a four-node
    # complete graph has two routes between distinct endpoints.
    assert hamiltonian_count(
        15, [(i, i + 1) for i in range(14)], 0, 14
    )[0] == 1
    assert hamiltonian_count(
        4, [(i, j) for i in range(4) for j in range(i + 1, 4)], 0, 3
    )[0] == 2

    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SHA256
    image = cv2.imread(str(SOURCE), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400)
    wing = image[Y0:Y1, X0:X1]
    results = []
    for threshold in THRESHOLDS:
        labels, cells, centers = segmented_faces(wing, threshold)
        assert len(cells) == 15
        assert int(round(centers[cells[0], 0] + X0)) == 812
        assert int(round(centers[cells[-1], 0] + X0)) == 1711
        for radius in CONTACT_RADII:
            graph = source_edges(labels, cells, radius)
            count, paths = hamiltonian_count(15, graph, 0, 14)
            assert count > 1, (threshold, radius, count)
            if threshold == 160:
                assert {
                    18: (24, 4),
                    22: (27, 6),
                    26: (27, 6),
                    30: (28, 13),
                }[radius] == (len(graph), count)
            results.append({
                "gray_threshold": threshold,
                "contact_radius_px": radius,
                "faces": 15,
                "edges": len(graph),
                "root_to_tip_hamiltonian_paths": count,
                "witnesses_one_based": paths if threshold == 160 else [],
            })
    assert min(x["root_to_tip_hamiltonian_paths"] for x in results) == 4
    print(json.dumps({
        "source": "resources/liber-primus/44.jpg",
        "sha256": SHA256,
        "input": "15 true enclosed cells, >=200 original pixels, original 520:1940 x 450:930 crop",
        "fixed_endpoints": "leftmost face #1 (812,723) to rightmost #15 (1711,680)",
        "topology": "8-connected pale faces; reciprocal >=25 contour pixels within fixed contact radius",
        "positive_controls": "15-node chain has exactly 1 path; K4 0->3 has exactly 2",
        "results": results,
        "decision": "No unique anatomically unlabelled source traversal, even after endpoints and self-avoiding contact rule are imposed. No GP29 reader is selected."
    }, indent=2))


if __name__ == "__main__":
    main()
