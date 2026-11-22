#!/usr/bin/env python3
"""Source-locked audit of the A194954-selected p57 word order.

This tests whether the provisional A194954 positions define one directed
traversal through the two p57 marker-derived cycles. It is a structural
decision gate, not a plaintext decoder or significance test.
"""
import json

GP_PRIME = {
    "F": 2, "U": 3, "TH": 5, "O": 7, "R": 11, "C": 13, "G": 17,
    "W": 19, "H": 23, "N": 29, "I": 31, "J": 37, "EO": 41,
    "P": 43, "X": 47, "S": 53, "T": 59, "B": 61, "E": 67,
    "M": 71, "L": 73, "NG": 79, "OE": 83, "D": 89, "A": 97,
    "AE": 101, "Y": 103, "IA": 107, "EA": 109,
}
WORDS = [
    "LIKE", "THE", "INSTAR", "TUNNELING", "TO", "THE", "SURFACE",
    "WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES", "FIND",
    "THE", "DIVINITY", "WITHIN", "AND", "EMERGE",
]
# Exact GP tokens from p57. The fourth word is seven runes
# T,U,N,N,E,L,NG; the English rendering is "TUNNELING".
TOKENS = [
    ["L", "I", "C", "E"], ["TH", "E"], ["I", "N", "S", "T", "A", "R"],
    ["T", "U", "N", "N", "E", "L", "NG"], ["T", "O"], ["TH", "E"],
    ["S", "U", "R", "F", "A", "C", "E"], ["W", "E"], ["M", "U", "S", "T"],
    ["S", "H", "E", "D"], ["O", "U", "R"], ["O", "W", "N"],
    ["C", "I", "R", "C", "U", "M", "F", "E", "R", "E", "N", "C", "E", "S"],
    ["F", "I", "N", "D"], ["TH", "E"], ["D", "I", "U", "I", "N", "I", "T", "Y"],
    ["W", "I", "TH", "I", "N"], ["A", "N", "D"], ["E", "M", "E", "R", "G", "E"],
]
WORD_SUMS = [sum(GP_PRIME[t] for t in ts) for ts in TOKENS]
EXPECTED_SUMS = [
    184, 72, 280, 339, 66, 72, 246, 86, 186, 232,
    21, 55, 451, 151, 72, 376, 115, 215, 300,
]
MODULUS = 19
A194954_POSITIONS = [2, 3, 5, 7, 11, 13, 17]  # 1-based
# Word-start/end coordinates: 1-based (physical line, rune column).
COORDS = {
    1: ((1, 8), (1, 11)), 2: ((1, 12), (1, 13)),
    3: ((1, 14), (1, 19)), 4: ((1, 20), (2, 6)),
    5: ((2, 7), (2, 8)), 6: ((2, 9), (2, 10)),
    7: ((2, 11), (2, 17)), 8: ((3, 1), (3, 2)),
    9: ((3, 3), (3, 6)), 10: ((3, 7), (3, 10)),
    11: ((3, 11), (3, 13)), 12: ((3, 14), (3, 16)),
    13: ((3, 17), (4, 13)), 14: ((4, 14), (4, 17)),
    15: ((4, 18), (5, 1)), 16: ((5, 2), (5, 9)),
    17: ((5, 10), (5, 14)), 18: ((5, 15), (5, 17)),
    19: ((5, 18), (5, 23)),
}
LINE_LENGTHS = [20, 17, 17, 18, 23]


def step(position, sign):
    i = position - 1
    return ((i + sign * (WORD_SUMS[i] % MODULUS)) % MODULUS) + 1


def directed_cycle(start, sign):
    seen, path, node = {}, [], start
    while node not in seen:
        seen[node] = len(path)
        path.append(node)
        node = step(node, sign)
    return path[seen[node]:]


def main():
    assert WORD_SUMS == EXPECTED_SUMS
    like_minus = directed_cycle(1, -1)
    find_plus = directed_cycle(14, +1)
    assert like_minus == [1, 7, 8, 17, 16]
    assert find_plus == [14, 13, 8, 18, 5]
    assert set(like_minus) & set(find_plus) == {8}

    selected_words = [WORDS[p - 1] for p in A194954_POSITIONS]
    selected_cycle_nodes = [p for p in A194954_POSITIONS
                            if p in like_minus or p in find_plus]
    assert selected_words == [
        "THE", "INSTAR", "TO", "SURFACE", "OUR", "CIRCUMFERENCES", "WITHIN"
    ]
    assert selected_cycle_nodes == [5, 7, 13, 17]
    like_order = [p for p in like_minus if p in A194954_POSITIONS]
    find_order = [p for p in find_plus if p in A194954_POSITIONS]
    assert like_order == [7, 17]  # SURFACE -> WE -> WITHIN
    assert find_order == [13, 5]  # CIRCUMFERENCES -> WE -> AND -> TO

    # Physical layout facts: SURFACE ends at row 2's final rune;
    # CIRCUMFERENCES begins at row 3's final rune; WE begins row 3.
    assert COORDS[7][1] == (2, LINE_LENGTHS[1])
    assert COORDS[13][0] == (3, LINE_LENGTHS[2])
    assert COORDS[8][0] == (3, 1)

    return {
        "word_sums_recomputed_from_exact_gp_tokens": WORD_SUMS,
        "A194954_positions_1_based": A194954_POSITIONS,
        "A194954_selected_words": selected_words,
        "LIKE_minus_cycle_1_based": like_minus,
        "FIND_plus_cycle_1_based": find_plus,
        "selected_cycle_nodes_in_A194954_order": selected_cycle_nodes,
        "LIKE_minus_selected_cycle_order": like_order,
        "FIND_plus_selected_cycle_order": find_order,
        "fixed_cycle_paths": {
            "SURFACE_to_WITHIN": [7, 8, 17],
            "CIRCUMFERENCES_to_TO": [13, 8, 18, 5],
        },
        "A194954_order_is_single_fixed_cycle_walk": False,
        "physical_boundary_facts": {
            "SURFACE_end": COORDS[7][1],
            "WE_start": COORDS[8][0],
            "CIRCUMFERENCES_start": COORDS[13][0],
            "line_lengths": LINE_LENGTHS,
        },
        "decision": (
            "Conditional map-structure clue only: the selected order interleaves "
            "the two cycles and reverses the FIND-plus pair. The H marker does not "
            "select the LIKE-minus sign; a line-3 wrap is possible but unselected."
        ),
    }


if __name__ == "__main__":
    print(json.dumps(main(), indent=2))
