#!/usr/bin/env python3
"""Structural calibration of common-cycle q8 plants against LP2 lag-1 suppression.

This does NOT exclude the q8 algebraic family. It tests two distinct generative readings:
(1) the repository's current random/arbitrary word-start control distribution, and
(2) an oracle that jointly chooses each word's allowed q8 start phase to minimize doublets.

Usage:
    python sims/lp2_q8_lag1_structural_calibration_sft.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NATIVE = ROOT / "resources/external/relikd-solved-gp29-native-v1.json"
FIXTURE = ROOT / "im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json"
RUNE_RE = re.compile(r"[\u16A0-\u16FF]+")
LP2_RATE = 86 / 12955
PLANTS = 10_000
ORACLE_PLANTS = 1_000
BASE_SEED = 3301


class LCG:
    def __init__(self, seed: int):
        self.x = seed & 0xFFFFFFFF

    def next(self) -> int:
        self.x = (self.x * 1664525 + 1013904223) & 0xFFFFFFFF
        return self.x


def doublets(s: str) -> tuple[int, int]:
    return sum(a == b for a, b in zip(s, s[1:])), max(0, len(s) - 1)


def native_words() -> list[tuple[int, ...]]:
    obj = json.loads(NATIVE.read_text(encoding="utf-8"))
    index = {r: i for i, r in enumerate(obj["runes"])}
    words: list[tuple[int, ...]] = []
    for section in obj["sections"]:
        for match in RUNE_RE.finditer(section["source_text"]):
            words.append(tuple(index[r] for r in match.group(0)))
    assert len(words) == 740
    assert sum(map(len, words)) == 2979
    return words


def q8_key(seed: int) -> tuple[LCG, list[int], list[int], list[int]]:
    rng = LCG(seed)
    pi = list(range(29))
    # Uniform Fisher-Yates on labels 1..28, preserving transparent F=0.
    for i in range(28, 1, -1):
        k = 1 + rng.next() % i
        pi[i], pi[k] = pi[k], pi[i]
    inv = [0] * 29
    for i, v in enumerate(pi):
        inv[v] = i

    # Gauge-normalized primitive q8 vector: k0=1.
    key = [1] + [rng.next() % 29 for _ in range(7)]
    if key[:4] == key[4:]:
        key[7] = (key[7] + 1) % 29
    return rng, pi, inv, key


def encode_word(
    word: tuple[int, ...], start: int, pi: list[int], inv: list[int], key: list[int]
) -> tuple[int, int, int]:
    phase = start
    first = last = previous = -1
    internal = 0
    for p in word:
        if p == 0:
            c = 0
        else:
            c = inv[(pi[p] + key[phase]) % 29]
            phase = (phase + 1) % 8
        if first < 0:
            first = c
        if previous >= 0:
            internal += c == previous
        previous = last = c
    return first, last, internal


def random_start_count(words: list[tuple[int, ...]], seed: int) -> tuple[int, int]:
    rng, pi, inv, key = q8_key(seed)
    previous: int | None = None
    d = pairs = 0
    for word in words:
        phase = rng.next() % 8
        first, last, internal = encode_word(word, phase, pi, inv, key)
        d += internal
        pairs += len(word) - 1
        if previous is not None:
            pairs += 1
            d += previous == first
        previous = last
    return d, pairs


def oracle_start_count(words: list[tuple[int, ...]], seed: int) -> tuple[int, int]:
    """Exact DP over all 8^740 word-start schedules; state is previous ciphertext rune."""
    _, pi, inv, key = q8_key(seed)
    dp: dict[int, int] = {}
    for wi, word in enumerate(words):
        options = [encode_word(word, start, pi, inv, key) for start in range(8)]
        nxt: dict[int, int] = {}
        if wi == 0:
            for _, last, internal in options:
                old = nxt.get(last)
                if old is None or internal < old:
                    nxt[last] = internal
        else:
            for previous, cost in dp.items():
                for first, last, internal in options:
                    value = cost + internal + (previous == first)
                    old = nxt.get(last)
                    if old is None or value < old:
                        nxt[last] = value
        dp = nxt
    return min(dp.values()), sum(map(len, words)) - 1


def main() -> None:
    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
    fixture_counts = []
    for plant in fixture["plants"]:
        flat = "".join(plant["cipher"].split())
        fixture_counts.append(doublets(flat))
    assert fixture_counts == [(9, 298), (8, 298)]

    words = native_words()

    random_counts = []
    at_or_below_lp2 = at_or_below_1pct = 0
    for n in range(1, PLANTS + 1):
        d, pairs = random_start_count(words, BASE_SEED + n)
        assert pairs == 2978
        random_counts.append(d)
        at_or_below_lp2 += d / pairs <= LP2_RATE
        at_or_below_1pct += d / pairs <= 0.01

    random_counts.sort()
    assert random_counts[0] == 53
    assert random_counts[99] == 75
    assert random_counts[499] == 84
    assert random_counts[4999] == 107
    assert random_counts[9499] == 134
    assert random_counts[-1] == 167
    assert at_or_below_lp2 == 0
    assert at_or_below_1pct == 0

    oracle_counts = sorted(
        oracle_start_count(words, BASE_SEED + n)[0]
        for n in range(1, ORACLE_PLANTS + 1)
    )
    assert oracle_counts[0] == 4
    assert oracle_counts[9] == 4
    assert oracle_counts[49] == 4
    assert oracle_counts[499] == 4
    assert oracle_counts[949] == 4
    assert oracle_counts[-1] == 7
    assert all(d / 2978 <= LP2_RATE for d in oracle_counts)

    print("PASS: q8 lag-1 structural calibration")
    print(f"LP2 original: 86/12955 = {LP2_RATE:.8%}")
    print(
        "existing q8 fixtures:",
        ", ".join(f"{d}/{n}={d/n:.8%}" for d, n in fixture_counts),
    )
    print(
        "10000 random-start native q8 plants:",
        f"min={random_counts[0]}/2978={random_counts[0]/2978:.8%}",
        f"q01={random_counts[99]/2978:.8%}",
        f"q05={random_counts[499]/2978:.8%}",
        f"median={random_counts[4999]/2978:.8%}",
        f"q95={random_counts[9499]/2978:.8%}",
        f"max={random_counts[-1]/2978:.8%}",
        f"<=LP2={at_or_below_lp2}",
        f"<=1%={at_or_below_1pct}",
    )
    print(
        "1000 oracle-start native q8 plants:",
        f"min={oracle_counts[0]}/2978={oracle_counts[0]/2978:.8%}",
        f"median={oracle_counts[499]}/2978={oracle_counts[499]/2978:.8%}",
        f"max={oracle_counts[-1]}/2978={oracle_counts[-1]/2978:.8%}",
        f"<=LP2={sum(d / 2978 <= LP2_RATE for d in oracle_counts)}/{ORACLE_PLANTS}",
    )


if __name__ == "__main__":
    main()
