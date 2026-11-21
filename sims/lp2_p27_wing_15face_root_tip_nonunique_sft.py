"""Original p27 wing: count root-to-tip paths and test the two inner-face orders.

Input is the unmodified original 2014 LP2 44.jpg (physical p27), with SHA256
asserted. The source-pixel 13-rim/2-inner partition is reused from
lp2_p27_wing_perimeter_sft.py. This extension asks whether the two internal
faces have a uniquely selected order under a restrictive root-to-tip,
self-avoiding proximity-path model. It makes no key search, OCR, rune edits,
or decryption claim.

Dependencies: opencv-python, numpy, scipy. Run from the repository root:
    python sims/lp2_p27_wing_15face_root_tip_nonunique_sft.py
"""
from __future__ import annotations

import hashlib
import json
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from scipy.spatial import cKDTree

from lp2_p27_wing_perimeter_sft import perimeter_faces

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus" / "44.jpg"
SHA256 = "c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e"
X0, Y0, X1, Y1 = 520, 450, 1940, 930
THRESHOLDS = (80, 120, 160, 200, 235)
CONTACT_RADII = (18, 22, 26, 30)
MIN_AREA = 200
MIN_CONTACT_PIXELS = 25
RIM = [1, 2, 5, 7, 4, 8, 11, 12, 14, 15, 13, 10, 3]
INNER = [6, 9]


def segmented_faces(wing: np.ndarray, threshold: int):
    n, labels, stats, centers = cv2.connectedComponentsWithStats(
        np.uint8(wing > threshold), connectivity=8
    )
    height, width = wing.shape
    indices = [
        i for i in range(1, n)
        if stats[i, cv2.CC_STAT_AREA] >= MIN_AREA
        and stats[i, cv2.CC_STAT_LEFT] > 0
        and stats[i, cv2.CC_STAT_TOP] > 0
        and stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] < width
        and stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] < height
    ]
    indices.sort(key=lambda i: (centers[i, 0], centers[i, 1]))
    return labels, indices, stats, centers


def source_edges(
    labels: np.ndarray, indices: list[int], radius: int
) -> list[tuple[int, int]]:
    """Reciprocal near-contour proxy, not a taxonomic shared-vein graph."""
    contours = []
    for i in indices:
        boundaries, _ = cv2.findContours(
            np.uint8(labels == i), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE
        )
        contours.append(
            np.concatenate([x[:, 0, :] for x in boundaries], axis=0)
        )
    edges = []
    for i in range(len(indices)):
        left_tree = cKDTree(contours[i])
        for j in range(i + 1, len(indices)):
            right_tree = cKDTree(contours[j])
            d1 = left_tree.query(contours[j], k=1)[0]
            d2 = right_tree.query(contours[i], k=1)[0]
            contact = min(
                np.count_nonzero(d1 <= radius),
                np.count_nonzero(d2 <= radius),
            )
            if contact >= MIN_CONTACT_PIXELS:
                edges.append((i, j))
    return edges


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


def inner_pair_order_audit(
    n: int,
    edges: list[tuple[int, int]],
    start: int,
    end: int,
    left_inner: int,
    right_inner: int,
) -> dict:
    """Count valid root-to-tip paths with either ordering of the two inner faces."""
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

    counts = {"face6_before_face9": 0, "face9_before_face6": 0}
    witnesses = {}

    def collect(mask: int, last: int, path: list[int]) -> None:
        if mask == full:
            if last != end:
                return
            if path.index(left_inner) < path.index(right_inner):
                key = "face6_before_face9"
            else:
                key = "face9_before_face6"
            counts[key] += 1
            witnesses.setdefault(key, [x + 1 for x in path])
            return
        for nxt in adjacency[last]:
            nm = mask | (1 << nxt)
            if not mask & (1 << nxt) and ways(nm, nxt):
                collect(nm, nxt, path + [nxt])

    collect(1 << start, start, [start])
    return {"counts": counts, "witnesses_one_based": witnesses}


def main() -> None:
    original = SOURCE.read_bytes()
    assert hashlib.sha256(original).hexdigest() == SHA256
    image = cv2.imdecode(np.frombuffer(original, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400)

    # Independent algorithm positives: a chain is unique; K4 has two paths.
    assert hamiltonian_count(
        15, [(i, i + 1) for i in range(14)], 0, 14
    )[0] == 1
    assert hamiltonian_count(
        4, [(i, j) for i in range(4) for j in range(i + 1, 4)], 0, 3
    )[0] == 2

    wing = image[Y0:Y1, X0:X1]
    results = []
    for threshold in THRESHOLDS:
        rim, inside, _ = perimeter_faces(image, threshold)
        assert rim == RIM, (threshold, rim)
        assert inside == INNER, (threshold, inside)

        labels, cells, stats, centers = segmented_faces(wing, threshold)
        assert len(cells) == 15
        assert int(round(centers[cells[0], 0] + X0)) == 812
        assert int(round(centers[cells[-1], 0] + X0)) == 1711

        inner_metrics = {}
        for face_number in INNER:
            component = cells[face_number - 1]
            inner_metrics[str(face_number)] = {
                "area_px": int(stats[component, cv2.CC_STAT_AREA]),
                "centroid_px": [
                    round(float(centers[component, 0] + X0), 2),
                    round(float(centers[component, 1] + Y0), 2),
                ],
            }
        assert inner_metrics["6"]["centroid_px"][0] < inner_metrics["9"]["centroid_px"][0]

        for radius in CONTACT_RADII:
            graph = source_edges(labels, cells, radius)
            count, paths = hamiltonian_count(15, graph, 0, 14)
            pair = inner_pair_order_audit(15, graph, 0, 14, 5, 8)
            order_counts = pair["counts"]
            assert count > 1, (threshold, radius, count)
            assert sum(order_counts.values()) == count
            assert all(v > 0 for v in order_counts.values()), (
                threshold, radius, order_counts
            )
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
                "inner_order_counts": order_counts,
                "inner_order_witnesses_one_based": pair["witnesses_one_based"],
                "inner_face_metrics": inner_metrics,
                "first_two_root_to_tip_paths_one_based": paths,
            })

    assert min(x["root_to_tip_hamiltonian_paths"] for x in results) == 4
    print(json.dumps({
        "source": "resources/liber-primus/44.jpg",
        "sha256": SHA256,
        "input": "15 true enclosed cells, >=200 original pixels, original 520:1940 x 450:930 crop",
        "fixed_endpoints": "leftmost face #1 (812,723) to rightmost #15 (1711,680)",
        "topology": "8-connected pale faces; reciprocal >=25 contour pixels within fixed contact radius",
        "inner_faces": "two source-visible internal components; x-rank labels 6 and 9 are analyst labels",
        "coordinate_order": "left-to-right centroid order is face 6 then face 9, but no arrow or authored label selects this as the cipher clock",
        "pair_order_result": "both 6-before-9 and 9-before-6 occur as valid complete root-to-tip paths in every threshold/radius model",
        "positive_controls": "15-node chain has exactly 1 path; K4 0->3 has exactly 2",
        "results": results,
        "decision": "The source distinguishes two internal compartments but does not authenticate their sequence, GP29 values, DH/state mapping, or a reversible ciphertext receiver. The proximity graph is a sensitivity model, not a physical shared-vein graph."
    }, indent=2))


if __name__ == "__main__":
    main()
