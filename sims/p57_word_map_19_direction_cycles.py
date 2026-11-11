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
from pathlib import Path

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
ROOT = Path(__file__).resolve().parent.parent


def reverse_decimal(n):
    return int(str(n)[::-1])


def prime_factors(n):
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors


def p55_independent_59_selector():
    corpus = json.loads(
        (ROOT / "resources" / "liber-primus" / "lp2-corpus.json").read_text("utf8")
    )
    grid = json.loads(
        (ROOT / "resources" / "liber-primus" / "lp2-grid-256.json").read_text("utf8")
    )
    p55 = next(page["indices"] for page in corpus["pages"] if page["page"] == 55)
    lengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]
    assert sum(lengths) == len(p55) == 76
    assert len(lengths) == 17

    # Ornament-derived route selects base60 table value 193. Historical
    # NUMBER reverses it to 391 and factors that as 17*23.
    number193_factors = prime_factors(reverse_decimal(193))
    assert number193_factors == [17, 23]
    assert [i for i, value in enumerate(grid["bytes"]) if value == 193] == [83, 127]

    # Apply the project's already-established factor-index reduction to the
    # distinct factors 17 and 23. They are the 7th and 9th GP primes, so
    # zero-based indices 6+8 = 14 = X. Among the 19 p57 body-word factor
    # signatures this selects DIVINITY uniquely.
    factor_indices = [corpus["prime"].index(p) for p in number193_factors]
    factor_signature_index = sum(factor_indices) % 29
    factor_signature = corpus["translit"][factor_signature_index]
    assert factor_indices == [6, 8]
    assert factor_signature_index == 14
    assert factor_signature == "X"

    def word_factor_signature(value):
        factors = sorted(set(prime_factors(value)))
        if any(factor not in corpus["prime"] for factor in factors):
            return None
        index = sum(corpus["prime"].index(factor) for factor in factors) % 29
        return corpus["translit"][index]

    signatures = [word_factor_signature(value) for value in SUMS]
    assert [i + 1 for i, value in enumerate(signatures) if value == "X"] == [16]
    assert WORDS[15] == "DIVINITY"

    # "Shed our own circumferences": the first p55 page-local segment is only
    # the ending boundary rune of a word begun on p54. Every later segment of
    # length >2 contributes only its strict interior.
    interior = []
    offset = 0
    inside_d_segments = []
    for segment, length in enumerate(lengths, start=1):
        word = p55[offset:offset + length]
        if segment > 1:
            middle = word[1:-1]
            interior.extend(middle)
            if 23 in middle:
                inside_d_segments.append(segment)
        offset += length
    assert len(interior) == 43
    assert corpus["translit"][23] == "D"

    d_positions = [i + 1 for i, value in enumerate(interior) if value == 23]
    assert d_positions == [5, 23]
    assert d_positions[1] - d_positions[0] - 1 == 17
    assert d_positions[1] - d_positions[0] == 18
    span = interior[d_positions[0] - 1:d_positions[1]]
    assert len(span) == 19
    assert inside_d_segments == [5, 9]

    fold_bits = "".join(
        "1" if span[i] == span[-1 - i] else "0"
        for i in range(len(span) // 2)
    )
    assert fold_bits == "100000000"
    assert int(fold_bits, 2) == 256
    center = span[len(span) // 2]
    assert corpus["translit"][center] == "I"
    assert corpus["prime"][center] == 31

    # The exact interior geometry itself supplies 5 and 19. Their product
    # reverses to 59, independently selecting the previously underdetermined
    # factor 59 in NUMBER(449), without concatenating segment labels.
    product_5_19 = d_positions[0] * len(span)
    assert product_5_19 == 95
    selected = reverse_decimal(product_5_19)
    assert selected == 59
    assert prime_factors(reverse_decimal(selected)) == [5, 19]

    # Carrying the ornament's historical '+' marker into the p57 word graph
    # from the newly selected DIVINITY node reaches the circumference cluster.
    plus_path = []
    seen = set()
    x = 15
    while x not in seen:
        seen.add(x)
        plus_path.append(x)
        x = (x + (SUMS[x] % MOD)) % MOD
    assert [WORDS[i] for i in plus_path[:5]] == [
        "DIVINITY", "OWN", "SHED", "FIND", "CIRCUMFERENCES"
    ]

    return {
        "number193_reversed": reverse_decimal(193),
        "number193_prime_factors": number193_factors,
        "factor_prime_indices_zero_based": factor_indices,
        "factor_index_signature": factor_signature,
        "p57_unique_signature_word": "DIVINITY",
        "p55_page_local_segments": 17,
        "p55_shed_interior_count": len(interior),
        "inside_D_segment_numbers": inside_d_segments,
        "inside_D_positions_1based": d_positions,
        "strictly_between_D_count": 17,
        "D_position_difference": 18,
        "inclusive_D_span_length": len(span),
        "D_span_fold_bits": fold_bits,
        "D_span_fold_value": int(fold_bits, 2),
        "D_span_center": corpus["translit"][center],
        "D_span_center_prime": corpus["prime"][center],
        "product_5x19": product_5_19,
        "independently_selected_number": selected,
        "number59_reversed": reverse_decimal(selected),
        "number59_prime_factors": [5, 19],
        "plus_path_from_DIVINITY": [WORDS[i] for i in plus_path],
    }

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



def all20_word_map(trials=100_000, seed=20261115):
    words20 = ["PARABLE"] + WORDS
    sums20 = [449] + SUMS
    like, find, instar = 1, 14, 3
    def walk(values, start, sign):
        seen, path, x = {}, [], start
        while x not in seen:
            seen[x] = len(path); path.append(x)
            x = (x + sign * (values[x] % 20)) % 20
        return path, path[seen[x]:]
    observed = {}
    for sign, label in [(-1, "minus"), (1, "plus")]:
        pl, cl = walk(sums20, like, sign)
        pf, cf = walk(sums20, find, sign)
        observed[label] = {"LIKE_path":[words20[i] for i in pl],
                           "FIND_path":[words20[i] for i in pf],
                           "LIKE_cycle":[words20[i] for i in cl],
                           "FIND_cycle":[words20[i] for i in cf],
                           "both_reach_INSTAR":cl == [instar] and cf == [instar]}
    rng = Random(seed)
    movable = [i for i in range(20) if i not in (like, find)]
    pool = [sums20[i] for i in movable]
    counts = {"minus":0,"plus":0,"both_signs":0}
    for _ in range(trials):
        shuffled = pool[:]; rng.shuffle(shuffled)
        values = sums20[:]
        for i, value in zip(movable, shuffled): values[i] = value
        _, clm = walk(values, like, -1); _, cfm = walk(values, find, -1)
        _, clp = walk(values, like, 1);  _, cfp = walk(values, find, 1)
        m = clm == [instar] and cfm == [instar]
        p = clp == [instar] and cfp == [instar]
        counts["minus"] += m; counts["plus"] += p; counts["both_signs"] += m and p
    return {"words":words20,"sums":sums20,"modulus":20,"observed":observed,
            "permutation_null":{"trials":trials,"seed":seed,
            "anchors_fixed":{"LIKE_position":2,"FIND_position":15},
            "both_reach_INSTAR_minus":counts["minus"],
            "both_reach_INSTAR_plus":counts["plus"],
            "both_reach_INSTAR_both_signs":counts["both_signs"],
            "null":"shuffle the 18 non-anchor word sums among the other 18 positions; keep LIKE/FIND sums and positions fixed"}}

def main():
    p55_selector = p55_independent_59_selector()
    minus_like = cycle(SUMS, LIKE, -1)
    plus_find = cycle(SUMS, FIND, 1)
    plus_from_like = (LIKE + SUMS[LIKE] % MOD) % MOD
    result = {
        "p55_independent_59_selector": p55_selector,
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
        "all20_word_map": all20_word_map(),
        "caveat": "The 2016 clue supports words-as-map/numbers-as-direction broadly, but does not explicitly select sum mod 19 or the sign assignment. Treat the cycles and null as exploratory.",
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
