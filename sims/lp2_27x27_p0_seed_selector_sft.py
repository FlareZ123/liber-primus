#!/usr/bin/env python3
"""Source-locked candidate selector for the 27x27 opening block.

Run from the repository root:
    python sims/lp2_27x27_p0_seed_selector_sft.py

This tests a candidate human solve path, not an authenticated LP2 decryption.
The two marginal staves and their projection geometry are documented by
sims/lp2_opening_stave_geometry_sft.py; their count is used here only as a
candidate factor in the opening displacement, not to divide the red sum.
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
INK = ROOT / "resources/liber-primus/lp2-ink-annotations.json"
TRANSCRIPTION = ROOT / "resources/liber-primus/lp2-transcription.txt"


def phi(n: int) -> int:
    result = n
    remaining = n
    factor = 2
    while factor * factor <= remaining:
        if remaining % factor == 0:
            while remaining % factor == 0:
                remaining //= factor
            result -= result // factor
        factor += 1
    if remaining > 1:
        result -= result // remaining
    return result


def mu(n: int) -> int:
    if n < 1:
        raise ValueError("mu requires a positive integer")
    remaining = n
    sign = 1
    factor = 2
    while factor * factor <= remaining:
        if remaining % factor == 0:
            remaining //= factor
            sign = -sign
            if remaining % factor == 0:
                return 0
        factor += 1
    return -sign if remaining > 1 else sign


def symbols(values: list[int], alphabet: list[str]) -> list[str]:
    return [alphabet[value] for value in values]


def main() -> None:
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    ink = json.loads(INK.read_text(encoding="utf-8"))
    alphabet = corpus["translit"]
    prime = corpus["prime"]

    pages = [p for p in corpus["pages"] if 0 <= p["page"] <= 2]
    flat = [r for page in pages for r in page["indices"]]
    grid_width = math.isqrt(len(flat))
    assert grid_width * grid_width == len(flat) == 729
    assert grid_width == 27

    p0 = next(p for p in corpus["pages"] if p["page"] == 0)
    p0_ink = next(p for p in ink["pages"] if p["page"] == 0)
    red_span = p0_ink["red_spans"][0]
    assert red_span["start"] == 0 and red_span["length"] == 13
    red_runes = p0["indices"][red_span["start"]:red_span["start"] + red_span["length"]]
    red_prime_weights = [prime[r] for r in red_runes]
    red_prime_sum = sum(red_prime_weights)
    assert red_prime_sum == 662

    first_line = TRANSCRIPTION.read_text(encoding="utf-8").splitlines()[0]
    before_marker, after_marker = first_line.split(".", 1)
    red_words = before_marker.split("-")
    red_word_lengths = [len(word) for word in red_words]
    assert red_word_lengths == [8, 5]
    red_word_prime_sums = [
        sum(prime[r] for r in red_runes[:8]),
        sum(prime[r] for r in red_runes[8:]),
    ]
    assert red_word_prime_sums == [347, 315]
    assert sum(red_word_prime_sums) // 2 == 331

    # Directly apply the source-signalled totient to the full red-heading sum.
    # This is distinct from the previously tested raw-331 PRNG-seed families.
    totient_of_red_sum = phi(red_prime_sum)
    predicted_center = totient_of_red_sum % 29
    assert totient_of_red_sum == 330
    assert predicted_center == 11 and alphabet[predicted_center] == "J"

    # Descriptive p0 cyclic-rotation null: preserve page length and the
    # 13-rune window position, rotate the rune stream, and retest phi(sum) mod29.
    rotation_matches_phi = []
    rotation_exact_sum = []
    for shift in range(len(p0["indices"])):
        rotated_span = [
            p0["indices"][(shift + i) % len(p0["indices"])]
            for i in range(red_span["length"])
        ]
        rotated_sum = sum(prime[r] for r in rotated_span)
        if rotated_sum == red_prime_sum:
            rotation_exact_sum.append(shift)
        if phi(rotated_sum) % 29 == predicted_center:
            rotation_matches_phi.append({
                "shift": shift, "sum": rotated_sum, "phi": phi(rotated_sum)
            })
    assert rotation_exact_sum == [0, 139]
    assert [m["shift"] for m in rotation_matches_phi] == [
        0, 3, 31, 42, 46, 52, 60, 139, 152, 179, 193, 203, 208, 220, 223
    ]

    # The red heading is horizontal; (row, column) are one-based.
    row = red_span["length"]
    column = phi(row)
    assert (row, column) == (13, 12)
    center_index = (row - 1) * grid_width + (column - 1)
    node_positions = [center_index - 1, center_index, center_index + 1]
    node = [flat[i] for i in node_positions]
    assert node == [25, 11, 28]
    assert node[1] == predicted_center
    node_symbols = symbols(node, alphabet)
    assert node_symbols == ["AE", "J", "EA"]

    key = [node[0], phi(node[1]), node[2]]
    assert key == [25, 10, 28]
    key_symbols = symbols(key, alphabet)
    assert key_symbols == ["AE", "I", "EA"]
    step = phi(node[1]) + phi(key[1])

    red_line_count = len(before_marker.replace("-", ""))
    first_black_line = re.sub(r"[-/]", "", after_marker)
    block_length = len(first_black_line)
    assert red_line_count == 13
    assert block_length == 7
    assert block_length == len(p0["indices"][13:20])
    marginal_stave_count = 2  # source-visible left/right pair on p0
    visual_step = marginal_stave_count * block_length
    assert (phi(node[1]), phi(key[1]), step, visual_step) == (10, 4, 14, 14)

    node_start = node_positions[0]
    path_start = node_start + step
    assert (node_start, path_start) == (334, 348)
    path = list(range(path_start, path_start + block_length))
    assert path == list(range(348, 355))
    ciphertext = [flat[i] for i in path]
    cipher_symbols = symbols(ciphertext, alphabet)
    assert cipher_symbols == ["L", "AE", "N", "TH", "P", "U", "X"]

    plaintext = [(c - key[i % len(key)]) % 29 for i, c in enumerate(ciphertext)]
    plaintext_symbols = symbols(plaintext, alphabet)
    plaintext_compact = "".join(plaintext_symbols)
    assert plaintext_compact == "ASIGOTHE"

    # Forward consistency check under the external Reports 01 and 03.
    # It predicts next-key signature, axis and boundary, not exact start/length.
    block1_coords = [(i // grid_width + 1, i % grid_width + 1) for i in path]
    absolute_positions = [i + 1 for i in path]
    mobius_sum = sum(mu(n) for n in absolute_positions)
    next_phase = (1 + mobius_sum) % 3
    leftmost = min(block1_coords, key=lambda cell: (cell[1], -cell[0]))
    n90_leftmost = 27 * (leftmost[1] - 1) + 28 - leftmost[0]
    next_outer = mu(n90_leftmost) % 2
    signature_table = {
        0: ((0, 0, 0), (1, 1, 1)),
        1: ((0, 1, 0), (1, -1, 1)),
        2: ((0, -1, 0), (1, 0, 1)),
    }
    predicted_next_signature = signature_table[next_phase][next_outer]

    next_node_positions = [path[-1], path[-1] + 1, path[-1] + 2]
    next_node = [flat[i] for i in next_node_positions]
    next_unrotated_key = [next_node[0], phi(next_node[1]), next_node[2]]
    actual_next_signature = tuple(mu(phi(k)) for k in next_unrotated_key)
    assert tuple(actual_next_signature) == predicted_next_signature
    assert sum(actual_next_signature) % 3 == next_phase
    aligned_next_key = (
        next_unrotated_key[next_phase:] + next_unrotated_key[:next_phase]
    )
    assert aligned_next_key == [14, 14, 10]

    def n0(cell: tuple[int, int]) -> int:
        r, c = cell
        return 27 * (r - 1) + c

    def n90(cell: tuple[int, int]) -> int:
        r, c = cell
        return 27 * (c - 1) + 28 - r

    def n180(cell: tuple[int, int]) -> int:
        return 730 - n0(cell)

    def n270(cell: tuple[int, int]) -> int:
        r, c = cell
        return 27 * (27 - c) + r

    B, E = block1_coords[0], block1_coords[-1]
    M = (row, column)
    A = n180(B) + n0(M)
    G = math.gcd(n90(E), n180(E))
    axis_score = mu(A) + mu(G)
    predicted_axis = (
        "horizontal" if axis_score == 0
        else "vertical" if axis_score > 0
        else "diagonal"
    )
    predicted_tau = (mu(n270(E)) + phi(node[1])) % 2
    assert (A, G, axis_score, n270(E), predicted_tau) == (717, 5, 0, 635, 1)
    assert predicted_axis == "horizontal"

    # Published block02 is only a geometry comparison fixture.
    published_block2_path = list(range(364, 369))
    block2_coords = [
        (i // grid_width + 1, i % grid_width + 1)
        for i in published_block2_path
    ]
    block2_axis = (
        "horizontal" if len({r for r, _ in block2_coords}) == 1
        else "vertical" if len({c for _, c in block2_coords}) == 1
        else "diagonal"
    )
    block2_leftmost = min(block2_coords, key=lambda cell: (cell[1], -cell[0]))
    block2_tau = int(block2_coords[0] == block2_leftmost)
    assert (block2_axis, block2_tau) == (predicted_axis, predicted_tau)

    print(json.dumps({
        "status": "candidate source selector; not an authenticated full-page decryption",
        "grid": {"runes": len(flat), "width": grid_width, "layout": "row-major"},
        "red_heading": {
            "runes": symbols(red_runes, alphabet),
            "word_lengths": red_word_lengths,
            "word_prime_sums": red_word_prime_sums,
            "gp_prime_weights": red_prime_weights,
            "prime_sum": red_prime_sum,
            "totient_of_full_prime_sum": totient_of_red_sum,
            "mod29_center_prediction": predicted_center,
            "predicted_center_rune": alphabet[predicted_center],
        },
        "p0_cyclic_rotation_null": {
            "page_runes": len(p0["indices"]),
            "window_length": red_span["length"],
            "exact_662_sum_shifts": rotation_exact_sum,
            "phi_sum_mod29_center_matches": rotation_matches_phi,
            "phi_match_count": len(rotation_matches_phi),
            "phi_match_fraction": f"{len(rotation_matches_phi)}/{len(p0['indices'])}",
            "interpretation": "descriptive conditional rate; the arithmetic relation was postselected",
        },
        "coordinate": {"row_one_based": row, "column_one_based": column,
                       "center_flat_zero_based": center_index},
        "source_node": {"positions": node_positions, "symbols": node_symbols},
        "key": {"indices": key, "symbols": key_symbols},
        "jump": {"phi_center_original": phi(node[1]),
                 "phi_center_transformed": phi(key[1]),
                 "totient_sum_distance": step,
                 "two_staves_times_first_black_line": visual_step},
        "first_black_line": {"runes": block_length, "symbols": first_black_line},
        "cipher_path": {"positions": path, "symbols": cipher_symbols},
        "plaintext_consequence": {"symbols": plaintext_symbols,
                                  "compact": plaintext_compact},
        "block2_transition_check": {
            "basis": "frozen external Reports 01 and 03; consistency check only",
            "block1_absolute_positions": absolute_positions,
            "sum_mobius": mobius_sum,
            "predicted_next_phase": next_phase,
            "leftmost_cell": leftmost,
            "n90_leftmost": n90_leftmost,
            "mu_n90_leftmost": mu(n90_leftmost),
            "predicted_next_outer": next_outer,
            "predicted_next_key_signature": predicted_next_signature,
            "next_source_node_positions": next_node_positions,
            "next_source_node_symbols": symbols(next_node, alphabet),
            "next_unrotated_key_symbols": symbols(next_unrotated_key, alphabet),
            "actual_next_key_signature": actual_next_signature,
            "aligned_next_key_symbols": symbols(aligned_next_key, alphabet),
            "report03": {"A": A, "G": G, "q": axis_score,
                         "predicted_axis": predicted_axis,
                         "n270_endpoint": n270(E), "tau": predicted_tau},
            "published_block2_path": published_block2_path,
            "published_block2_coordinates": block2_coords,
            "published_block2_axis": block2_axis,
            "published_block2_leftmost_first": bool(block2_tau),
            "scope": "predicts next key signature, axis and reading boundary; not exact start or length",
        },
        "caveats": [
            "The two staves times the 7-rune first black line may select the 14-cell displacement; this is an interpretation, not a proven instruction.",
            "The direct phi(sum) mod29 center prediction is not statistically unique under p0 cyclic rotations (15/262); its source interpretation is postselected.",
            "The 27x27 row-major flattening and three-rune node convention still need independent source justification.",
            "The block02 transition comparison uses rules from the same external proposal and is not blind independent validation.",
            "The decoded phrase was not used to select the node, key, path, or length.",
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
