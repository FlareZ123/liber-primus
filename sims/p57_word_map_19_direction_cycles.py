#!/usr/bin/env python3
"""Reproduce the exploratory 19-word p57 modular-direction graph and null.

The 19 word sums are GP-prime sums from the solved p57 plaintext. The two
anchor words LIKE (position 1) and FIND (position 14) are selected by the
corrected 2013 NUMBER marker signatures H and +, respectively. This script
tests the source-motivated modulus 19 and the 5-cycle structure suggested by
the conditional 95 = 5*19 NUMBER(59) follow-up. It is exploratory, not proof
of an intended map.
"""
from random import Random
import json

WORDS = [
    "LIKE", "THE", "INSTAR", "TUNNELING", "TO", "THE", "SURFACE",
    "WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES", "FIND",
    "THE", "DIVINITY", "WITHIN", "AND", "EMERGE",
]
# Sums of the 29 GP prime weights for each p57 body word, in source order.
SUMS = [
    184, 72, 280, 339, 66, 72, 246, 86, 186, 232,
    21, 55, 451, 151, 72, 376, 115, 215, 300,
]
MOD = 19
LIKE = 0
FIND = 13
WE = 7


def cycle(values, start, sign):
    seen = {}
    path = []
    x = start
    while x not in seen:
        seen[x] = len(path)
        path.append(x)
        x = (x + sign * (values[x] % MOD)) % MOD
    return path[seen[x]:]


def describe(path):
    return [{"position": i + 1, "word": WORDS[i], "sum": SUMS[i],
             "step": SUMS[i] % MOD} for i in path]


def permutation_null(trials=100_000, seed=20261112):
    rng = Random(seed)
    movable = [i for i in range(len(SUMS)) if i not in (LIKE, FIND)]
    pool = [SUMS[i] for i in movable]
    one_shared = 0
    shared_we = 0
    both_five = 0

    for _ in range(trials):
        shuffled = pool[:]
        rng.shuffle(shuffled)
        values = SUMS[:]
        for i, value in zip(movable, shuffled):
            values[i] = value

        found_one_shared = False
        found_shared_we = False
        found_both_five = False
        for like_sign in (-1, 1):
            c_like = cycle(values, LIKE, like_sign)
            for find_sign in (-1, 1):
                c_find = cycle(values, FIND, find_sign)
                if len(c_like) == 5 and len(c_find) == 5:
                    found_both_five = True
                    overlap = set(c_like) & set(c_find)
                    if len(overlap) == 1:
                        found_one_shared = True
                        if overlap == {WE}:
                            found_shared_we = True
        both_five += found_both_five
        one_shared += found_one_shared
        shared_we += found_shared_we

    return {
        "trials": trials,
        "seed": seed,
        "anchors_fixed": {"LIKE_position": 1, "FIND_position": 14},
        "event_any_sign_pair_both_5_cycles": both_five,
        "frequency_any_sign_pair_both_5_cycles": both_five / trials,
        "event_any_sign_pair_both_5_cycles_one_shared_node": one_shared,
        "frequency_any_sign_pair_both_5_cycles_one_shared_node": one_shared / trials,
        "event_any_sign_pair_both_5_cycles_shared_at_WE": shared_we,
        "frequency_any_sign_pair_both_5_cycles_shared_at_WE": shared_we / trials,
        "null": "shuffle the 17 non-anchor word sums among the other 17 positions; keep LIKE/FIND sums and positions fixed",
    }


def main():
    minus_like = cycle(SUMS, LIKE, -1)
    plus_find = cycle(SUMS, FIND, 1)
    plus_from_like = (LIKE + SUMS[LIKE] % MOD) % MOD
    result = {
        "words": WORDS,
        "sums": SUMS,
        "modulus": MOD,
        "plus_step_from_LIKE": {
            "from_position": LIKE + 1,
            "step": SUMS[LIKE] % MOD,
            "to_position": plus_from_like + 1,
            "to_word": WORDS[plus_from_like],
        },
        "observed_cycles": {
            "minus_from_LIKE": describe(minus_like),
            "plus_from_FIND": describe(plus_find),
            "intersection_positions": sorted((set(minus_like) & set(plus_find))),
            "intersection_words": [WORDS[i] for i in sorted(set(minus_like) & set(plus_find))],
        },
        "permutation_null": permutation_null(),
        "caveat": "The 2016 clue supports words-as-map/numbers-as-direction broadly, but does not explicitly select sum mod 19 or the sign assignment. Treat the cycles and null as exploratory.",
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
