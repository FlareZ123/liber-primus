#!/usr/bin/env python3
"""Structural calibration of the current common-cycle q8 plants against LP2 lag-1 suppression.

This does NOT exclude the q8 algebraic family. It checks whether the repository's existing
matched-profile controls, and a deterministic ensemble using the same q8 generative rules,
reproduce the strongest first-order property of the original unsolved ciphertext.

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


def q8_rate(words: list[tuple[int, ...]], seed: int) -> tuple[int, int]:
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

    previous: int | None = None
    d = pairs = 0
    for word in words:
        phase = rng.next() % 8
        for p in word:
            if p == 0:
                c = 0
            else:
                c = inv[(pi[p] + key[phase]) % 29]
                phase = (phase + 1) % 8
            if previous is not None:
                pairs += 1
                d += c == previous
            previous = c
    return d, pairs


def main() -> None:
    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
    fixture_counts = []
    for plant in fixture["plants"]:
        flat = "".join(plant["cipher"].split())
        fixture_counts.append(doublets(flat))
    assert fixture_counts == [(9, 298), (8, 298)]

    words = native_words()
    counts = []
    at_or_below_lp2 = at_or_below_1pct = 0
    for n in range(1, PLANTS + 1):
        d, pairs = q8_rate(words, BASE_SEED + n)
        assert pairs == 2978
        counts.append(d)
        at_or_below_lp2 += d / pairs <= LP2_RATE
        at_or_below_1pct += d / pairs <= 0.01

    counts.sort()
    assert counts[0] == 53
    assert counts[99] == 75
    assert counts[499] == 84
    assert counts[4999] == 107
    assert counts[9499] == 134
    assert counts[-1] == 167
    assert at_or_below_lp2 == 0
    assert at_or_below_1pct == 0

    print("PASS: q8 lag-1 structural calibration")
    print(f"LP2 original: 86/12955 = {LP2_RATE:.8%}")
    print(
        "existing q8 fixtures:",
        ", ".join(f"{d}/{n}={d/n:.8%}" for d, n in fixture_counts),
    )
    print(
        "10000 deterministic native q8 plants:",
        f"min={counts[0]}/2978={counts[0]/2978:.8%}",
        f"q01={counts[99]/2978:.8%}",
        f"q05={counts[499]/2978:.8%}",
        f"median={counts[4999]/2978:.8%}",
        f"q95={counts[9499]/2978:.8%}",
        f"max={counts[-1]/2978:.8%}",
        f"<=LP2={at_or_below_lp2}",
        f"<=1%={at_or_below_1pct}",
    )


if __name__ == "__main__":
    main()
