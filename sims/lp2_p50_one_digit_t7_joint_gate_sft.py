#!/usr/bin/env python3
"""SFT: p50 codec-invariant one-digit state and T7 joint gate.

Reads only the canonical LP2 corpus and p49-p51 table. It establishes that
the published leading-zero mask is the same one-digit/high-digit-zero
predicate under both surviving base59 and base60 grammars, then asks whether
a maximally favorable independent repeat-rate model keyed by that predicate
can reproduce the held-out T7 equality-gap ordering.

No language model, plaintext score, key search, or fitted table phase is used.
"""
from __future__ import annotations

import bisect
import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
GRID = json.loads((ROOT / "resources/liber-primus/base60-grid.json").read_text(encoding="utf-8"))

BASE60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx"
BASE59 = BASE60.replace("f", "")
TOKENS = [token for row in GRID["rows"] for token in row]


def decode(token: str, alphabet: str) -> int:
    radix = len(alphabet)
    high = alphabet.index(token[0])
    low = alphabet.index(token[1])
    value = high * radix + low
    assert 0 <= value <= 255
    return value


def corr(xs: list[float], ys: list[float]) -> float:
    mx = sum(xs) / len(xs)
    my = sum(ys) / len(ys)
    dx = [x - mx for x in xs]
    dy = [y - my for y in ys]
    den = math.sqrt(sum(x * x for x in dx) * sum(y * y for y in dy))
    return sum(x * y for x, y in zip(dx, dy)) / den


def t7(event_positions: list[int]) -> float:
    gaps = [b - a for a, b in zip(event_positions, event_positions[1:])]
    return corr(gaps[:-1], gaps[1:])


def log_choose(n: int, k: int) -> float:
    if k < 0 or k > n:
        return -math.inf
    return math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)


def log_binom(n: int, k: int, q: float) -> float:
    if k < 0 or k > n:
        return -math.inf
    return log_choose(n, k) + k * math.log(q) + (n - k) * math.log1p(-q)


def normalized_cdf(log_weights: list[float]) -> list[float]:
    m = max(log_weights)
    weights = [math.exp(x - m) for x in log_weights]
    total = sum(weights)
    out: list[float] = []
    acc = 0.0
    for weight in weights:
        acc += weight / total
        out.append(acc)
    out[-1] = 1.0
    return out


def draw_index(rng: random.Random, cdf: list[float]) -> int:
    return bisect.bisect_left(cdf, rng.random())


def hypergeom_upper(population: int, marked: int, draws: int, observed: int) -> float:
    lo = max(observed, draws - (population - marked))
    hi = min(marked, draws)
    denom = log_choose(population, draws)
    logs = [
        log_choose(marked, k) + log_choose(population - marked, draws - k) - denom
        for k in range(lo, hi + 1)
    ]
    m = max(logs)
    return math.exp(m) * sum(math.exp(x - m) for x in logs)


assert GRID["alphabet"] == BASE60
assert len(TOKENS) == 256
assert all(token[0] == "0" for token in TOKENS if decode(token, BASE60) < 60)
assert all((token[0] == "0") == (decode(token, BASE60) < 60) for token in TOKENS)
assert all((token[0] == "0") == (decode(token, BASE59) < 59) for token in TOKENS)
assert sum(token[0] == "0" for token in TOKENS) == 60

pages = [
    page for page in CORPUS["pages"]
    if page["status"] == "unsolved" and page["page"] <= 55 and page["runic_count"]
]
tape = [index for page in pages for index in page["indices"]]
assert len(tape) == 12956

seams: set[int] = set()
offset = 0
for page in pages[:-1]:
    offset += len(page["indices"])
    seams.add(offset - 1)

valid = [i for i in range(len(tape) - 1) if i not in seams]
events = [i for i in valid if tape[i] == tape[i + 1]]
assert len(valid) == 12901
assert len(events) == 86
observed_t7 = t7(events)
assert abs(observed_t7 - 0.38001968924100965) < 1e-12

leading = [TOKENS[i & 255][0] == "0" for i in valid]
zero_count = [TOKENS[i & 255].count("0") for i in valid]
event_leading = [TOKENS[i & 255][0] == "0" for i in events]
event_zero_count = [TOKENS[i & 255].count("0") for i in events]

leading_positions = [i for i, flag in zip(valid, leading) if flag]
nonleading_positions = [i for i, flag in zip(valid, leading) if not flag]
assert (len(leading_positions), len(nonleading_positions)) == (3025, 9876)
assert (sum(event_leading), len(events) - sum(event_leading)) == (33, 53)

categories = [[i for i, z in zip(valid, zero_count) if z == cls] for cls in range(3)]
category_hits = [sum(z == cls for z in event_zero_count) for cls in range(3)]
assert [len(x) for x in categories] == [9725, 3076, 100]
assert category_hits == [52, 29, 5]

# Source-phase one-digit enrichment. This is the same predicate under base59/base60.
one_digit_tail = hypergeom_upper(12901, 3025, 86, 33)
assert abs(one_digit_tail - 0.0013489911418068095) < 1e-12

# Negative control: a zero only in the low-order digit is not enriched.
trailing_only_residues = {
    i for i, token in enumerate(TOKENS)
    if token[0] != "0" and token[1] == "0"
}
trailing_only_positions = [i for i in valid if (i & 255) in trailing_only_residues]
trailing_only_hits = sum((i & 255) in trailing_only_residues for i in events)
assert (len(trailing_only_positions), trailing_only_hits) == (151, 1)
trailing_only_tail = hypergeom_upper(12901, 151, 86, 1)
assert abs(trailing_only_tail - 0.6379221773955903) < 1e-12


def simulate_two_rate(reps: int = 30000, seed: int = 3301) -> dict[str, float | int | list[float]]:
    # Give the one-digit mask its observed MLE rates. Conditioning on exactly 86
    # events removes total-count mismatch, making this a favorable held-out T7 test.
    n1, k1_obs = len(leading_positions), 33
    n0, k0_obs = len(nonleading_positions), 53
    q1, q0 = k1_obs / n1, k0_obs / n0

    states: list[int] = []
    logs: list[float] = []
    for k1 in range(87):
        k0 = 86 - k1
        if k1 <= n1 and k0 <= n0:
            states.append(k1)
            logs.append(log_binom(n1, k1, q1) + log_binom(n0, k0, q0))
    cdf = normalized_cdf(logs)

    rng = random.Random(seed)
    samples: list[float] = []
    exceed = 0
    for _ in range(reps):
        k1 = states[draw_index(rng, cdf)]
        event_sample = sorted(
            rng.sample(leading_positions, k1)
            + rng.sample(nonleading_positions, 86 - k1)
        )
        value = t7(event_sample)
        samples.append(value)
        exceed += value >= observed_t7

    samples.sort()
    return {
        "reps": reps,
        "seed": seed,
        "median": samples[reps // 2],
        "q025": samples[int(0.025 * reps)],
        "q975": samples[int(0.975 * reps)],
        "exceed": exceed,
        "add_one_upper": (exceed + 1) / (reps + 1),
    }


def simulate_zero_dose(reps: int = 30000, seed: int = 3302) -> dict[str, float | int | list[float]]:
    # More permissive control: each 0/1/2-zero class gets its own observed MLE
    # repeat rate, then total event count is conditioned to exactly 86.
    ns = [len(x) for x in categories]
    qs = [k / n for k, n in zip(category_hits, ns)]
    states: list[tuple[int, int, int]] = []
    logs: list[float] = []
    for k2 in range(87):
        for k1 in range(87 - k2):
            k0 = 86 - k1 - k2
            if all(k <= n for k, n in zip((k0, k1, k2), ns)):
                states.append((k0, k1, k2))
                logs.append(sum(
                    log_binom(n, k, q)
                    for n, k, q in zip(ns, (k0, k1, k2), qs)
                ))
    cdf = normalized_cdf(logs)

    rng = random.Random(seed)
    samples: list[float] = []
    exceed = 0
    for _ in range(reps):
        k0, k1, k2 = states[draw_index(rng, cdf)]
        event_sample = sorted(
            rng.sample(categories[0], k0)
            + rng.sample(categories[1], k1)
            + rng.sample(categories[2], k2)
        )
        value = t7(event_sample)
        samples.append(value)
        exceed += value >= observed_t7

    samples.sort()
    return {
        "reps": reps,
        "seed": seed,
        "median": samples[reps // 2],
        "q025": samples[int(0.025 * reps)],
        "q975": samples[int(0.975 * reps)],
        "exceed": exceed,
        "add_one_upper": (exceed + 1) / (reps + 1),
    }


def simulate_adjacent_high_digit_pair(reps: int = 30000, seed: int = 3303) -> dict[str, object]:
    # Stronger shared-operand test: each ordered pair (z_i,z_(i+1)) gets its
    # own fitted independent repeat rate. Neighboring pair states literally
    # share one p50 high-digit operand, matching the source-visible overlap
    # shape suggested by T7. If even this fails T7, a simple overlapping
    # p50-bit hazard is insufficient.
    pair_categories: list[list[int]] = [[] for _ in range(4)]
    for i in valid:
        left = int(TOKENS[i & 255][0] == "0")
        right = int(TOKENS[(i + 1) & 255][0] == "0")
        pair_categories[2 * left + right].append(i)

    pair_hits = [0, 0, 0, 0]
    for i in events:
        left = int(TOKENS[i & 255][0] == "0")
        right = int(TOKENS[(i + 1) & 255][0] == "0")
        pair_hits[2 * left + right] += 1

    ns = [len(x) for x in pair_categories]
    assert ns == [7556, 2320, 2318, 707]
    assert pair_hits == [42, 11, 29, 4]
    qs = [k / n for k, n in zip(pair_hits, ns)]

    states: list[tuple[int, int, int, int]] = []
    logs: list[float] = []
    for k0 in range(87):
        for k1 in range(87 - k0):
            for k2 in range(87 - k0 - k1):
                k3 = 86 - k0 - k1 - k2
                ks = (k0, k1, k2, k3)
                if all(k <= n for k, n in zip(ks, ns)):
                    states.append(ks)
                    logs.append(sum(
                        log_binom(n, k, q)
                        for n, k, q in zip(ns, ks, qs)
                    ))
    cdf = normalized_cdf(logs)

    rng = random.Random(seed)
    samples: list[float] = []
    exceed = 0
    for _ in range(reps):
        ks = states[draw_index(rng, cdf)]
        event_sample: list[int] = []
        for positions, k in zip(pair_categories, ks):
            event_sample.extend(rng.sample(positions, k))
        event_sample.sort()
        value = t7(event_sample)
        samples.append(value)
        exceed += value >= observed_t7

    samples.sort()
    return {
        "reps": reps,
        "seed": seed,
        "category_order": ["00", "01", "10", "11"],
        "opportunities": ns,
        "repeat_hits": pair_hits,
        "rates": qs,
        "median": samples[reps // 2],
        "q025": samples[int(0.025 * reps)],
        "q975": samples[int(0.975 * reps)],
        "exceed": exceed,
        "add_one_upper": (exceed + 1) / (reps + 1),
    }


two_rate = simulate_two_rate()
zero_dose = simulate_zero_dose()
adjacent_pair = simulate_adjacent_high_digit_pair()

# The result is intentionally coarse enough to remain stable across Python versions.
assert two_rate["add_one_upper"] < 0.005
assert zero_dose["add_one_upper"] < 0.005
assert adjacent_pair["add_one_upper"] < 0.005
assert two_rate["q975"] < 0.25
assert zero_dose["q975"] < 0.25
assert adjacent_pair["q975"] < 0.25

print(json.dumps({
    "one_digit_predicate": {
        "base60": "token[0]=='0' iff decoded value < 60",
        "base59": "token[0]=='0' iff decoded value < 59",
        "cells": 60,
        "opportunities": 3025,
        "repeat_hits": 33,
        "hypergeom_upper": one_digit_tail,
    },
    "trailing_zero_only_control": {
        "cells": len(trailing_only_residues),
        "opportunities": len(trailing_only_positions),
        "repeat_hits": trailing_only_hits,
        "hypergeom_upper": trailing_only_tail,
    },
    "observed_t7": observed_t7,
    "two_rate_conditioned_exact86": two_rate,
    "three_zero_count_rate_conditioned_exact86": zero_dose,
    "adjacent_high_digit_pair_conditioned_exact86": adjacent_pair,
    "decision": (
        "p50 leading-zero is a codec-invariant one-digit/high-digit-zero state, "
        "but neither independent state rates nor a fitted overlapping adjacent-high-digit "
        "pair hazard reproduces T7"
    ),
}, indent=2))
