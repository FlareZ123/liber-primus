#!/usr/bin/env python3
"""Source-calibrated binary reading of LP2's 10- and 13-dot stencils.

The solved p56 10-dot mark calibrates a row-count rule. Apply that frozen
rule to p53 and held-out p56 13-dot marks, then compare with candidate p32
M7 fixed points. This is a structural-selector test, not a cipher inverse.
Run from the repository root: python sims/lp2_dot_stencil_binary_m7_selector_sft.py
Requires Pillow and NumPy. Original JPEGs and source annotations are read only.
"""
import argparse
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT = ROOT / "resources" / "liber-primus"
# archive JPEG, crop (x0,x1,y0,y1), expected red-dot count
REGIONS = {
    "p53_13dot": ("70.jpg", (818, 865, 2260, 2355), 13),
    "p56_10dot_control": ("73.jpg", (1049, 1098, 1070, 1143), 10),
    "p56_13dot_title_heldout": ("73.jpg", (959, 1007, 682, 778), 13),
    "p56_13dot_terminal_heldout": ("73.jpg", (1552, 1603, 2087, 2185), 13),
}


def extract_dots(path, crop, expected):
    x0, x1, y0, y1 = crop
    rgb = np.asarray(Image.open(path).convert("RGB").crop((x0, y0, x1, y1)), dtype=np.int16)
    mask = ((rgb[:, :, 0] > 130) & (rgb[:, :, 1] < 100)
            & (rgb[:, :, 2] < 100) & ((rgb[:, :, 0] - rgb[:, :, 1]) > 50))
    yy, xx = np.where(mask)
    remaining = set(zip(xx.tolist(), yy.tolist()))
    points = []
    while remaining:
        seed = remaining.pop()
        queue, component = deque([seed]), [seed]
        while queue:
            x, y = queue.popleft()
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    q = (x + dx, y + dy)
                    if (dx or dy) and q in remaining:
                        remaining.remove(q)
                        queue.append(q)
                        component.append(q)
        points.append((x0 + sum(x for x, _ in component) / len(component),
                       y0 + sum(y for _, y in component) / len(component)))
    points.sort(key=lambda p: (p[1], p[0]))
    assert len(points) == expected, (path.name, crop, expected, len(points))
    return points


def axis_groups(points, axis, tolerance=4.0):
    result = []
    for point in sorted(points, key=lambda p: p[axis]):
        centre = float(np.mean([p[axis] for p in result[-1]])) if result else None
        if not result or abs(point[axis] - centre) > tolerance:
            result.append([point])
        else:
            result[-1].append(point)
    return result


def describe(points):
    rows, columns = axis_groups(points, 1), axis_groups(points, 0)
    row_counts = [len(row) for row in rows]
    column_counts = [len(column) for column in columns]
    assert all(n in (1, 2) for n in row_counts), row_counts
    bits = "".join("1" if n == 1 else "0" for n in row_counts)
    complement = "".join("0" if bit == "1" else "1" for bit in bits)
    presence = "1" * len(rows)
    return {
        "dots": len(points), "rows_by_columns": [len(rows), len(columns)],
        "row_dot_counts": row_counts, "column_dot_counts": column_counts,
        "single_dot_row_1_double_dot_row_0": bits,
        "binary_value": int(bits, 2),
        "complement_bits": complement, "complement_value": int(complement, 2),
        "row_presence_bits": presence, "row_presence_value": int(presence, 2),
        "row_reversal_invariant": bits == bits[::-1],
        "left_right_reflection_invariant": column_counts == column_counts[::-1],
    }


def mobius_fixed_points(matrix, modulus):
    (a, b), (c, d) = matrix
    return [x for x in range(modulus)
            if (c * x + d) % modulus
            and ((a * x + b) * pow((c * x + d) % modulus, -1, modulus) % modulus) == x]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", type=Path, default=DEFAULT,
                        help="directory containing original archive JPEGs")
    parser.add_argument("--resources", type=Path, default=DEFAULT,
                        help="directory containing lp2-ink-annotations.json and lp2-corpus.json")
    args = parser.parse_args()
    annotations = json.loads((args.resources / "lp2-ink-annotations.json").read_text())
    corpus = json.loads((args.resources / "lp2-corpus.json").read_text())
    ann = {p["page"]: p for p in annotations["pages"]}
    corp = {p["page"]: p for p in corpus["pages"]}
    assert ann[53]["large_punctuation"] == [[179, 13, "red"]]
    assert ann[56]["large_punctuation"] == [[5, 13, "red"], [45, 10, "red"], [85, 13, "red"]]
    page_length = corp[56]["runic_count"]
    assert page_length == ann[56]["rune_count"] == 85

    measured = {name: describe(extract_dots(args.images / file, crop, count))
                for name, (file, crop, count) in REGIONS.items()}

    # Select the convention from the solved p56 10-dot control only.
    control = measured["p56_10dot_control"]
    assert control["rows_by_columns"] == [7, 3]
    assert control["row_dot_counts"] == [1, 2, 1, 2, 1, 2, 1]
    assert control["single_dot_row_1_double_dot_row_0"] == "1010101"
    assert control["binary_value"] == page_length == 85
    assert control["complement_value"] == 42 and control["row_presence_value"] == 127
    terminal_offset = ann[56]["large_punctuation"][-1][0]
    assert terminal_offset == control["binary_value"]

    ten_dot_pages = {p["page"]: p["rune_count"] for p in annotations["pages"]
                     if any(dots == 10 and ink == "red"
                            for _, dots, ink in p.get("large_punctuation", []))}
    assert ten_dot_pages == {36: 238, 38: 228, 49: 66, 56: 85}
    matches = [page for page, length in ten_dot_pages.items()
               if length == control["binary_value"]]
    assert matches == [56]

    # Freeze that rule; p56's 13-dot marks are held-out controls.
    for name in ("p53_13dot", "p56_13dot_title_heldout", "p56_13dot_terminal_heldout"):
        mark = measured[name]
        assert mark["rows_by_columns"] == [9, 3]
        assert mark["row_dot_counts"] == [1, 2, 1, 2, 1, 2, 1, 2, 1]
        assert mark["single_dot_row_1_double_dot_row_0"] == "101010101"
        assert mark["binary_value"] == 341 and mark["complement_value"] == 170
        assert mark["row_reversal_invariant"] and mark["left_right_reflection_invariant"]

    pair = sorted((341 % 29, 170 % 29))
    assert pair == [22, 25]
    m7 = [[14, 25], [25, 28]]
    fixed = mobius_fixed_points(m7, 29)
    assert fixed == [22, 25] and pair == fixed

    print(json.dumps({
        "classification": "source-calibrated structural selector; not a cipher inverse",
        "frozen_rule": "single-dot row = 1; double-dot row = 0",
        "p56_calibration": {
            "marker_offset": 45, "geometry": control,
            "canonical_page_length": page_length, "terminal_13dot_offset": terminal_offset,
            "all_10dot_page_lengths": ten_dot_pages, "only_matching_page": matches,
        },
        "p53_target_and_p56_heldout": {
            "p53_offset": 179, "p53": measured["p53_13dot"],
            "p56_offsets": [5, 85],
            "p56": [measured["p56_13dot_title_heldout"],
                    measured["p56_13dot_terminal_heldout"]],
            "complementary_9bit_values": [341, 170], "mod29_unordered_pair": pair,
        },
        "candidate_p32_m7": {
            "matrix": m7, "field": "GF(29)", "fixed_points": fixed,
            "stencil_pair_matches": True,
        },
        "limits": [
            "The row word is palindromic; top-to-bottom and bottom-to-top are indistinguishable.",
            "Left-right reflection preserves row dot counts.",
            "Polarity complement swaps 341 and 170 but preserves unordered residue pair {22,25}.",
            "The repeated 13-dot mark is a fixed punctuation class, not per-occurrence variable data.",
            "This does not prove M7 is the intended cipher, select an ordered eigenbasis or paired state, specify a 7-cycle traversal, or recover plaintext or a key; it does not overturn #273's negative direct M7 inverse.",
        ],
    }, indent=2))


if __name__ == "__main__":
    main()
