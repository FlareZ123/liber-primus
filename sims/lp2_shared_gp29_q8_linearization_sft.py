#!/usr/bin/env python3
"""Known-plaintext calibration for the shared GP29 q8 cycle-action linearization.

Once a dictionary word and its starting phase are fixed, every non-transparent
rune gives one linear equation over GF(29):
    phi(cipher) - phi(plain) = k[phase] (mod 29).
Gauge: phi(F)=0 and k[0]=1. The unknown vector has 28 alphabet coordinates
plus seven remaining phase shifts (35 variables). This script checks that the
linear system recovers the exact planted action on the same 47-word p54 body,
10-rune carry prefix, and 17-word p55 holdout used by the blind CP-SAT tests.

This is a known-plaintext algebraic calibration, NOT a blind dictionary solve.
"""

from __future__ import annotations

import argparse
import collections
import json
import random
import sys
from pathlib import Path

import lp2_shared_gp29_q8_smt as s

ROOT = Path(__file__).resolve().parents[1]
LEX = ROOT / "resources/control/english_wordfreq_textblob.txt"
FIXTURE = ROOT / "im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json"
PAGES = ROOT / "resources/liber-primus/lp2-page-groups-54-55-derived.json"
MOD = 29
NVAR = 35


def load_inputs():
    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
    pages = json.loads(PAGES.read_text(encoding="utf-8"))
    words = s.load_dictionary(LEX, fixture["added"])
    by_length = collections.defaultdict(list)
    for word in sorted(words):
        by_length[len(word)].append(word)
    prefix_domain = {word[:10] for word in words if len(word) == 11}
    body_lengths = [len(group) for group in pages["p54"]["body_groups"][:47]]
    hold_lengths = [len(group) for group in pages["p55"]["groups"][1:]]
    assert len(body_lengths) == 47
    assert len(hold_lengths) == 16
    assert all(n in by_length for n in body_lengths + hold_lengths + [11])
    return words, by_length, prefix_domain, body_lengths, hold_lengths


def choose_words(by_length, lengths, rng):
    used = set()

    def choose(length):
        pool = [word for word in by_length[length] if word not in used]
        if not pool:
            pool = by_length[length]
        word = rng.choice(pool)
        used.add(word)
        return word

    return [choose(length) for length in lengths], choose


def primitive_q8(k):
    return any(k[j] != k[j + 4] for j in range(4))


def add_group_equations(rows, plain, cipher, start_phase, counters):
    phase = start_phase
    for p, c in zip(plain, cipher):
        if p == 0:
            if c != 0:
                raise AssertionError("plaintext F must be transparent")
            counters["transparent_holds"] += 1
            continue

        row = [0] * NVAR
        rhs = 0
        if c:
            row[c - 1] = (row[c - 1] + 1) % MOD
        row[p - 1] = (row[p - 1] - 1) % MOD
        if phase == 0:
            rhs = 1  # k[0] is fixed to one by the cycle-generator gauge.
        else:
            row[28 + phase - 1] = (row[28 + phase - 1] - 1) % MOD
        rows.append((row, rhs))
        counters["equations"] += 1
        if c == 0:
            counters["consuming_cipher_F"] += 1
        phase = (phase + 1) % 8


def solve_gf29(rows):
    matrix = [list(coeff) + [rhs] for coeff, rhs in rows]
    rank = 0
    pivots = []
    for col in range(NVAR):
        pivot = next((r for r in range(rank, len(matrix)) if matrix[r][col] % MOD), None)
        if pivot is None:
            continue
        matrix[rank], matrix[pivot] = matrix[pivot], matrix[rank]
        scale = pow(matrix[rank][col], -1, MOD)
        matrix[rank] = [(x * scale) % MOD for x in matrix[rank]]
        for r in range(len(matrix)):
            if r == rank:
                continue
            factor = matrix[r][col] % MOD
            if factor:
                matrix[r] = [(x - factor * y) % MOD for x, y in zip(matrix[r], matrix[rank])]
        pivots.append(col)
        rank += 1

    inconsistent = any(
        all(value % MOD == 0 for value in row[:NVAR]) and row[NVAR] % MOD
        for row in matrix
    )
    solution = None
    if rank == NVAR and not inconsistent:
        solution = [0] * NVAR
        for row_index, column in enumerate(pivots):
            solution[column] = matrix[row_index][NVAR] % MOD
    return rank, inconsistent, solution


def run_plant(plant, inputs):
    words, by_length, prefix_domain, body_lengths, hold_lengths = inputs
    rng = random.Random(3301 + plant)
    train_truth, choose = choose_words(by_length, body_lengths, rng)
    carry = choose(11)
    hold_truth = [choose(n) for n in hold_lengths]

    pi = [0] + rng.sample(range(1, 29), 28)
    while True:
        key = [1] + [rng.randrange(29) for _ in range(7)]
        if primitive_q8(key):
            break

    train_starts = [rng.randrange(8) for _ in train_truth]
    carry_start = rng.randrange(8)
    hold_starts = [rng.randrange(8) for _ in hold_truth]
    train_cipher = [s.encode(word, pi, key, phase) for word, phase in zip(train_truth, train_starts)]
    carry_cipher = s.encode(carry, pi, key, carry_start)
    hold_cipher = [s.encode(word, pi, key, phase) for word, phase in zip(hold_truth, hold_starts)]

    rows = []
    counters = collections.Counter()
    for plain, cipher, phase in zip(train_truth, train_cipher, train_starts):
        add_group_equations(rows, plain, cipher, phase, counters)
    add_group_equations(rows, carry[:10], carry_cipher[:10], carry_start, counters)

    rank, inconsistent, solution = solve_gf29(rows)
    recovered_pi = [0] + solution[:28] if solution is not None else None
    recovered_key = [1] + solution[28:] if solution is not None else None
    permutation = recovered_pi is not None and sorted(recovered_pi) == list(range(29))
    primitive = recovered_key is not None and primitive_q8(recovered_key)
    exact_pi = recovered_pi == pi
    exact_key = recovered_key == key
    exact_action = (
        recovered_pi is not None
        and s.same_action(recovered_pi, recovered_key, pi, key)
    )

    training_present = 0
    prefix_present = False
    holdout_present = 0
    holdout_unique = 0
    if recovered_pi is not None:
        for truth, cipher in zip(train_truth, train_cipher):
            candidates = s.decode(cipher, recovered_pi, recovered_key, words)
            training_present += truth in candidates
        prefix_present = carry[:10] in s.decode(carry_cipher[:10], recovered_pi, recovered_key, prefix_domain)
        holdout_cipher = [carry_cipher] + hold_cipher
        holdout_truth = [carry] + hold_truth
        for truth, cipher in zip(holdout_truth, holdout_cipher):
            candidates = s.decode(cipher, recovered_pi, recovered_key, words)
            holdout_present += truth in candidates
            holdout_unique += len(candidates) == 1 and truth in candidates

    passed = (
        rank == NVAR and not inconsistent and permutation and primitive
        and exact_action and training_present == 47 and prefix_present
        and holdout_present == 17
    )
    result = {
        "plant": plant,
        "method": "GF(29) linear equations after fixing plaintext word identities and per-word start phases",
        "blind": False,
        "known_plaintext_calibration": True,
        "dictionary_size": len(words),
        "training_complete_words": len(train_truth),
        "training_body_runes": sum(body_lengths),
        "carry_prefix_runes": 10,
        "heldout_carry_suffix_runes": 1,
        "heldout_complete_words": len(hold_truth),
        "heldout_word_runes": sum(hold_lengths),
        "linear_system": {
            "field": 29,
            "unknowns": NVAR,
            "equations": counters["equations"],
            "rank": rank,
            "inconsistent": inconsistent,
            "transparent_holds": counters["transparent_holds"],
            "consuming_cipher_F": counters["consuming_cipher_F"],
        },
        "recovery": {
            "permutation": permutation,
            "primitive_q8": primitive,
            "exact_pi": exact_pi,
            "exact_key": exact_key,
            "same_action": exact_action,
            "training_truth_present": training_present,
            "carry_prefix_present": prefix_present,
            "holdout_truth_present": holdout_present,
            "holdout_unique": holdout_unique,
        },
        "planted_pi": pi,
        "recovered_pi": recovered_pi,
        "planted_key": key,
        "recovered_key": recovered_key,
        "passed": passed,
    }
    out = ROOT / f"im-results/lp2-shared-gp29-q8-linearization-control-{plant}.json"
    out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--plant", type=int, choices=[0, 1], default=None)
    args = parser.parse_args()
    inputs = load_inputs()
    plants = [args.plant] if args.plant is not None else [0, 1]
    results = [run_plant(plant, inputs) for plant in plants]
    print(json.dumps(results, indent=2))
    if not all(result["passed"] for result in results):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
