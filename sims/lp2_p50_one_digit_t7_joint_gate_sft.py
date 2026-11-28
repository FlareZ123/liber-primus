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


def gamma_q(a: float, x: float) -> float:
    """Regularized upper incomplete gamma Q(a,x), standard-library only."""
    if a <= 0 or x < 0:
        raise ValueError((a, x))
    if x == 0:
        return 1.0
    eps = 3e-14
    fpmin = 1e-300
    gln = math.lgamma(a)
    if x < a + 1:
        ap = a
        total = term = 1.0 / a
        for _ in range(10000):
            ap += 1.0
            term *= x / ap
            total += term
            if abs(term) < abs(total) * eps:
                p = total * math.exp(-x + a * math.log(x) - gln)
                return max(0.0, min(1.0, 1.0 - p))
        raise RuntimeError("gamma series did not converge")
    b = x + 1.0 - a
    c = 1.0 / fpmin
    d = 1.0 / b
    h = d
    for i in range(1, 10001):
        an = -i * (i - a)
        b += 2.0
        d = an * d + b
        if abs(d) < fpmin:
            d = fpmin
        c = b + an / c
        if abs(c) < fpmin:
            c = fpmin
        d = 1.0 / d
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < eps:
            return max(0.0, min(1.0, math.exp(-x + a * math.log(x) - gln) * h))
    raise RuntimeError("gamma continued fraction did not converge")


def pearson_chi2(observed: list[int], expected: list[float]) -> tuple[float, float]:
    assert len(observed) == len(expected)
    stat = sum((o - e) ** 2 / e for o, e in zip(observed, expected))
    return stat, gamma_q((len(observed) - 1) / 2, stat / 2)


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

# Nested, source-fixed field-type refinement. The p50 source already distinguishes
# the second character as decimal digit / uppercase / lowercase. Intersecting
# the independently established leading-zero state with decimal second digit
# gives exact single-decimal-digit values 0..9 under BOTH base59 and base60.
small_decimal_residues = [
    i for i, token in enumerate(TOKENS)
    if token[0] == "0" and token[1].isdigit()
]
assert small_decimal_residues == [13, 39, 192, 210, 229]
assert [TOKENS[i] for i in small_decimal_residues] == ["04", "05", "00", "06", "00"]
assert [decode(TOKENS[i], BASE60) for i in small_decimal_residues] == [4, 5, 0, 6, 0]
assert [decode(TOKENS[i], BASE59) for i in small_decimal_residues] == [4, 5, 0, 6, 0]

small_decimal_positions = [i for i in valid if (i & 255) in set(small_decimal_residues)]
small_decimal_hits = sum((i & 255) in set(small_decimal_residues) for i in events)
assert (len(small_decimal_positions), small_decimal_hits) == (251, 10)
small_decimal_tail = hypergeom_upper(12901, 251, 86, 10)
assert abs(small_decimal_tail - 6.284426230421346e-06) < 1e-15

# Conditional refinement inside the already established 60-cell leading-zero state.
small_decimal_within_leading_tail = hypergeom_upper(3025, 251, 33, 10)
assert abs(small_decimal_within_leading_tail - 0.00021551579653782398) < 1e-15

# Source phase is the unique circular shift with 10 covered equality events.
phase_hits = []
small_decimal_set = set(small_decimal_residues)
for phase in range(256):
    phase_hits.append(sum(((i + phase) & 255) in small_decimal_set for i in events))
assert phase_hits[0] == 10
assert max(phase_hits) == 10
assert phase_hits.count(10) == 1

# Exact comparator: choose any five of the 256 p50 residues, preserving only
# residue cardinality, and ask how often they cover >=10 observed equality sites.
residue_hits = [0] * 256
for i in events:
    residue_hits[i & 255] += 1
dp = [[0] * 87 for _ in range(6)]
dp[0][0] = 1
used = 0
for hit_count in residue_hits:
    used += 1
    for k in range(min(5, used), 0, -1):
        for covered in range(86, hit_count - 1, -1):
            dp[k][covered] += dp[k - 1][covered - hit_count]
random5_num = sum(dp[5][10:])
random5_den = sum(dp[5])
assert random5_den == math.comb(256, 5)
random5_tail = random5_num / random5_den
assert (random5_num, random5_den) == (980858, 8809549056)
assert abs(random5_tail - 0.00011134031875694682) < 1e-18

# Family of source-visible (first digit 0..4) x (second digit D/U/L) classes.
def second_class(token: str) -> str:
    if token[1].isdigit():
        return "D"
    if token[1].isupper():
        return "U"
    return "L"

field_rows = []
for high in "01234":
    for cls in "DUL":
        residues = {
            i for i, token in enumerate(TOKENS)
            if token[0] == high and second_class(token) == cls
        }
        n = sum((i & 255) in residues for i in valid)
        k = sum((i & 255) in residues for i in events)
        tail = 1.0 if n == 0 or k == 0 else hypergeom_upper(12901, n, 86, k)
        field_rows.append((high + cls, len(residues), n, k, tail))
nonempty_field_rows = [row for row in field_rows if row[2] > 0]
assert min(nonempty_field_rows, key=lambda row: row[4])[0] == "0D"
field_family_bonferroni = min(1.0, len(nonempty_field_rows) * small_decimal_tail)
assert len(nonempty_field_rows) == 14
assert field_family_bonferroni < 0.0001


def simulate_m35_open_gate(reps: int = 30000, seed: int = 3308) -> dict[str, object]:
    # Concrete count-law bridge:
    # - outside 0D: 35 hidden states, 29 visible + 6 silent, with immediate
    #   hidden-state repetition forbidden. The visible-repeat law is
    #   (35-29)/(29*(35-1)) = 6/(29*34).
    # - at 0D: disable the hidden no-repeat restriction. Conditioned on visible
    #   output, adjacent runes are iid uniform GP29, so repeat probability=1/29.
    # This supplies fixed probabilities rather than fitting the two observed
    # class rates. T7 remains a held-out ordering diagnostic.
    n_in = len(small_decimal_positions)
    k_in = small_decimal_hits
    n_out = len(valid) - n_in
    k_out = len(events) - k_in
    p_out = 6 / (29 * 34)
    p_in = 1 / 29
    assert (n_in, k_in, n_out, k_out) == (251, 10, 12650, 76)

    # Exact-count fit diagnostics.
    expected_out = n_out * p_out
    expected_in = n_in * p_in
    assert abs(expected_out - 76.97768762677485) < 1e-12
    assert abs(expected_in - 8.655172413793103) < 1e-12

    # Integer m profile from the outside count. This is a count fit, not a
    # source-authenticated state count.
    m_profile = []
    for m in range(30, 61):
        p = (m - 29) / (29 * (m - 1))
        m_profile.append((m, p, log_binom(n_out, k_out, p)))
    best_ll = max(row[2] for row in m_profile)
    best_m = max(m_profile, key=lambda row: row[2])[0]
    assert best_m == 35
    likelihood_ratio = {m: math.exp(ll - best_ll) for m, _, ll in m_profile}
    assert abs(likelihood_ratio[34] - 0.4937415300968265) < 1e-12
    assert abs(likelihood_ratio[36] - 0.46940807141881574) < 1e-12

    # Under a homogeneous m35 picker, the open class would retain the closed
    # probability. The observed 10 hits are then extremely high.
    upper_logs = [log_binom(n_in, k, p_out) for k in range(k_in, n_in + 1)]
    upper_max = max(upper_logs)
    homogeneous_open_upper = math.exp(upper_max) * sum(
        math.exp(value - upper_max) for value in upper_logs
    )
    assert abs(homogeneous_open_upper - 4.2042647617336424e-06) < 1e-18

    # Held-out full transition-shape prediction. If the 0D gate truly opens
    # the no-repeat restriction, GP29 deltas at that gate should be uniform.
    gate_delta = [0] * 29
    closed_delta = [0] * 29
    gate_from = [0] * 29
    gate_to = [0] * 29
    for i in valid:
        is_open = (i & 255) in small_decimal_set
        delta = (tape[i + 1] - tape[i]) % 29
        (gate_delta if is_open else closed_delta)[delta] += 1
        if is_open:
            gate_from[tape[i]] += 1
            gate_to[tape[i + 1]] += 1

    gate_delta_chi2, gate_delta_p = pearson_chi2(
        gate_delta, [n_in / 29] * 29
    )
    gate_from_chi2, gate_from_p = pearson_chi2(
        gate_from, [n_in / 29] * 29
    )
    gate_to_chi2, gate_to_p = pearson_chi2(
        gate_to, [n_in / 29] * 29
    )
    closed_expected = [n_out * p_out] + [n_out * (1 - p_out) / 28] * 28
    closed_delta_chi2, closed_delta_p = pearson_chi2(closed_delta, closed_expected)
    closed_nonzero_chi2, closed_nonzero_p = pearson_chi2(
        closed_delta[1:], [sum(closed_delta[1:]) / 28] * 28
    )
    assert abs(gate_delta_chi2 - 22.015936254980083) < 1e-12
    assert abs(gate_delta_p - 0.7805528337231691) < 1e-12
    assert abs(gate_from_p - 0.6014903255796571) < 1e-12
    assert abs(gate_to_p - 0.23180599175844782) < 1e-12
    assert abs(closed_delta_p - 0.03942191267652163) < 1e-12
    assert abs(closed_nonzero_p - 0.029903882020027823) < 1e-12

    # Conditional distribution of open-gate count given exactly 86 events.
    states: list[int] = []
    logs: list[float] = []
    for k in range(87):
        kout = 86 - k
        if k <= n_in and kout <= n_out:
            states.append(k)
            logs.append(log_binom(n_in, k, p_in) + log_binom(n_out, kout, p_out))
    cdf = normalized_cdf(logs)

    # Convert normalized CDF back to point weights for conditional summaries.
    weights = [cdf[0]] + [cdf[i] - cdf[i - 1] for i in range(1, len(cdf))]
    conditional_mean_open = sum(k * w for k, w in zip(states, weights))
    conditional_tail_ge_10 = sum(w for k, w in zip(states, weights) if k >= 10)
    assert abs(conditional_mean_open - 8.693852992471205) < 1e-12
    assert abs(conditional_tail_ge_10 - 0.36908024433615977) < 1e-12

    open_positions = small_decimal_positions
    closed_positions = [i for i in valid if (i & 255) not in small_decimal_set]

    rng = random.Random(seed)
    samples: list[float] = []
    exceed = 0
    for _ in range(reps):
        kin = states[draw_index(rng, cdf)]
        event_sample = sorted(
            rng.sample(open_positions, kin)
            + rng.sample(closed_positions, 86 - kin)
        )
        value = t7(event_sample)
        samples.append(value)
        exceed += value >= observed_t7

    samples.sort()
    return {
        "m_hidden_states": 35,
        "visible_states": 29,
        "silent_states": 6,
        "outside_repeat_probability": p_out,
        "open_gate_repeat_probability": p_in,
        "observed_outside": [k_out, n_out],
        "observed_open_gate": [k_in, n_in],
        "expected_outside_repeats": expected_out,
        "expected_open_gate_repeats": expected_in,
        "expected_total_repeats": expected_out + expected_in,
        "best_integer_m_30_to_60": best_m,
        "m34_likelihood_ratio_vs_m35": likelihood_ratio[34],
        "m36_likelihood_ratio_vs_m35": likelihood_ratio[36],
        "homogeneous_m35_open_hits_ge_10_upper": homogeneous_open_upper,
        "gate_delta_counts": gate_delta,
        "gate_delta_chi2": gate_delta_chi2,
        "gate_delta_p": gate_delta_p,
        "gate_from_p": gate_from_p,
        "gate_to_p": gate_to_p,
        "closed_delta_chi2": closed_delta_chi2,
        "closed_delta_p": closed_delta_p,
        "closed_nonzero_delta_p": closed_nonzero_p,
        "conditional_mean_open_hits_given_86": conditional_mean_open,
        "conditional_tail_open_hits_ge_10_given_86": conditional_tail_ge_10,
        "reps": reps,
        "seed": seed,
        "median_t7": samples[reps // 2],
        "q025_t7": samples[int(0.025 * reps)],
        "q975_t7": samples[int(0.975 * reps)],
        "t7_exceed": exceed,
        "t7_add_one_upper": (exceed + 1) / (reps + 1),
    }


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


m35_open_gate = simulate_m35_open_gate()
two_rate = simulate_two_rate()
zero_dose = simulate_zero_dose()
adjacent_pair = simulate_adjacent_high_digit_pair()

# The result is intentionally coarse enough to remain stable across Python versions.
assert m35_open_gate["t7_add_one_upper"] < 0.005
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
    "small_decimal_state": {
        "residues": small_decimal_residues,
        "tokens": [TOKENS[i] for i in small_decimal_residues],
        "values_base60": [decode(TOKENS[i], BASE60) for i in small_decimal_residues],
        "values_base59": [decode(TOKENS[i], BASE59) for i in small_decimal_residues],
        "opportunities": len(small_decimal_positions),
        "repeat_hits": small_decimal_hits,
        "hypergeom_upper": small_decimal_tail,
        "within_leading_zero_hypergeom_upper": small_decimal_within_leading_tail,
        "phase0_unique_max": True,
        "exact_random_5_residue_tail_ge_10": random5_tail,
        "fixed_0to4_x_DUL_family_bonferroni_upper": field_family_bonferroni,
        "field_classes": field_rows,
    },
    "observed_t7": observed_t7,
    "m35_small_decimal_open_gate": m35_open_gate,
    "two_rate_conditioned_exact86": two_rate,
    "three_zero_count_rate_conditioned_exact86": zero_dose,
    "adjacent_high_digit_pair_conditioned_exact86": adjacent_pair,
    "decision": (
        "p50 leading-zero is a codec-invariant one-digit/high-digit-zero state, "
        "but neither independent state rates nor a fitted overlapping adjacent-high-digit "
        "pair hazard reproduces T7"
    ),
}, indent=2))
