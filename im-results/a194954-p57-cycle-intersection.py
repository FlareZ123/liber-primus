#!/usr/bin/env python3
"""Conditioned permutation diagnostic for the A194954 / p57 cycle intersection.

Source word sums and marker-selected anchors are copied from
sims/p57_word_map_19_direction_cycles.py (Agent 35).
This is a post-observed diagnostic, not a formal p-value or a cipher attack.
"""
from random import Random

MODULUS = 19
WORDS = [
    "LIKE", "THE", "INSTAR", "TUNNELING", "TO", "THE", "SURFACE",
    "WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES", "FIND",
    "THE", "DIVINITY", "WITHIN", "AND", "EMERGE",
]
WORD_SUMS = [
    184, 72, 280, 339, 66, 72, 246, 86, 186, 232,
    21, 55, 451, 151, 72, 376, 115, 215, 300,
]
# A194954 first seven terms, used as 1-based word positions in the Parable.
A194954_POSITIONS = (2, 3, 5, 7, 11, 13, 17)
SELECTED = {p - 1 for p in A194954_POSITIONS}

# The 2013 NUMBER markers fix these starts and directions:
# LIKE(1) uses subtraction; FIND(14) uses addition.
LIKE_START = 0
FIND_START = 13
LIKE_SIGN = -1
FIND_SIGN = +1
SHARED_WE = 7  # zero-based index of word 8, WE


def cycle(values, start, sign):
    """Return the directed cycle reached from start under i -> i + sign*s_i mod 19."""
    seen = {}
    path = []
    node = start
    while node not in seen:
        seen[node] = len(path)
        path.append(node)
        node = (node + sign * (values[node] % MODULUS)) % MODULUS
    return path[seen[node]:]


def observed_pattern():
    like = cycle(WORD_SUMS, LIKE_START, LIKE_SIGN)
    find = cycle(WORD_SUMS, FIND_START, FIND_SIGN)
    assert [i + 1 for i in like] == [1, 7, 8, 17, 16]
    assert [i + 1 for i in find] == [14, 13, 8, 18, 5]
    assert set(like) & set(find) == {SHARED_WE}
    assert set(like) & SELECTED == {6, 16}  # SURFACE(7), WITHIN(17)
    assert set(find) & SELECTED == {4, 12}  # TO(5), CIRCUMFERENCES(13)
    return like, find


def run(trials=1_000_000, seed=20261112):
    observed_pattern()
    rng = Random(seed)
    movable = [i for i in range(len(WORDS)) if i not in (LIKE_START, FIND_START)]
    pool = [WORD_SUMS[i] for i in movable]
    counts = {
        "both_cycles_length_5": 0,
        "both_length_5_and_one_shared_node": 0,
        "both_length_5_and_shared_WE": 0,
        "four_selected_nodes_on_expected_cycles": 0,
        "exact_intersection_no_other_selected_nodes": 0,
    }

    for _ in range(trials):
        shuffled = pool[:]
        rng.shuffle(shuffled)
        values = WORD_SUMS[:]
        for index, value in zip(movable, shuffled):
            values[index] = value

        like = cycle(values, LIKE_START, LIKE_SIGN)
        find = cycle(values, FIND_START, FIND_SIGN)
        if len(like) != 5 or len(find) != 5:
            continue
        counts["both_cycles_length_5"] += 1

        overlap = set(like) & set(find)
        if len(overlap) != 1:
            continue
        counts["both_length_5_and_one_shared_node"] += 1
        if overlap != {SHARED_WE}:
            continue
        counts["both_length_5_and_shared_WE"] += 1

        # Selected cycle nodes: SURFACE/WITHIN on LIKE-minus;
        # CIRCUMFERENCES/TO on FIND-plus.
        if {6, 16}.issubset(like) and {4, 12}.issubset(find):
            counts["four_selected_nodes_on_expected_cycles"] += 1
            if (set(like) & SELECTED) == {6, 16} and (set(find) & SELECTED) == {4, 12}:
                counts["exact_intersection_no_other_selected_nodes"] += 1

    return {
        "seed": seed,
        "trials": trials,
        "observed_like_minus_cycle_1_based": [i + 1 for i in cycle(WORD_SUMS, LIKE_START, LIKE_SIGN)],
        "observed_find_plus_cycle_1_based": [i + 1 for i in cycle(WORD_SUMS, FIND_START, FIND_SIGN)],
        "A194954_selected_positions_1_based": list(A194954_POSITIONS),
        "A194954_selected_words": [WORDS[p - 1] for p in A194954_POSITIONS],
        "counts": counts,
        "frequencies": {key: value / trials for key, value in counts.items()},
        "interpretation": (
            "Conditional exploratory diagnostic only. It fixes the 2013 marker-selected "
            "anchors/signs and shuffles the other 17 sums. The exact observed intersection "
            "was not seen in this seeded run; this is not a formal p-value and must not be "
            "treated as proof of intended construction."
        ),
    }


if __name__ == "__main__":
    import json
    print(json.dumps(run(), indent=2))
