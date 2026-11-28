#!/usr/bin/env python3
"""Full-length q8 word-phase retry counterexample for LP2's soft doublet suppression.

The construction is deliberately a mechanism probe, not a solve:
- q8 common-cycle word cipher as in the current repository family;
- choose an initial word-start phase;
- if that whole encoded word creates ANY adjacent-equal ciphertext pair, either
  (A) advance the start phase by one exactly once, or
  (B) redraw one start phase exactly once;
- accept the second encoding even if it still contains a repeat.

It preserves rune count and does not consume extra per-rune key positions. It tests whether
LP2-like doublet suppression logically entails a skip/delete filter or pad-pointer drift.

Usage:
    python sims/lp2_q8_phase_retry_candidate_sft.py
"""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NATIVE = ROOT / "resources/external/relikd-solved-gp29-native-v1.json"
RUNE_RE = re.compile(r"[\u16A0-\u16FF]+")
BASE_SEED = 3301
PLANTS = 2000
N_RUNES = 12956
LP2_DOUBLET = 86
LP2_RATE = 86 / 12955
LP2_GAP_R = 0.38001968924100965


class LCG:
    def __init__(self, seed: int):
        self.x = seed & 0xFFFFFFFF

    def next(self) -> int:
        self.x = (self.x * 1664525 + 1013904223) & 0xFFFFFFFF
        return self.x


def native_words_full_length() -> list[tuple[int, ...]]:
    obj = json.loads(NATIVE.read_text(encoding="utf-8"))
    index = {r: i for i, r in enumerate(obj["runes"])}
    base = [
        tuple(index[r] for r in m.group(0))
        for section in obj["sections"]
        for m in RUNE_RE.finditer(section["source_text"])
    ]
    assert len(base) == 740
    assert sum(map(len, base)) == 2979

    words: list[tuple[int, ...]] = []
    total = 0
    i = 0
    while total < N_RUNES:
        word = base[i % len(base)]
        i += 1
        if total + len(word) > N_RUNES:
            word = word[: N_RUNES - total]
        words.append(word)
        total += len(word)
    assert total == N_RUNES
    assert len(words) == 3214
    return words


def q8_key(seed: int) -> tuple[LCG, list[int], list[int], list[int]]:
    rng = LCG(seed)
    pi = list(range(29))
    for i in range(28, 1, -1):
        j = 1 + rng.next() % i
        pi[i], pi[j] = pi[j], pi[i]
    inv = [0] * 29
    for i, v in enumerate(pi):
        inv[v] = i
    key = [1] + [rng.next() % 29 for _ in range(7)]
    if key[:4] == key[4:]:
        key[7] = (key[7] + 1) % 29
    return rng, pi, inv, key


def encode(word: tuple[int, ...], start: int, pi: list[int], inv: list[int], key: list[int]) -> list[int]:
    phase = start
    out: list[int] = []
    for p in word:
        if p == 0:
            out.append(0)
        else:
            out.append(inv[(pi[p] + key[phase]) % 29])
            phase = (phase + 1) % 8
    return out


def corr(x: list[float], y: list[float]) -> float:
    mx, my = sum(x) / len(x), sum(y) / len(y)
    num = sum((a - mx) * (b - my) for a, b in zip(x, y))
    dx = sum((a - mx) ** 2 for a in x)
    dy = sum((b - my) ** 2 for b in y)
    return num / math.sqrt(dx * dy)


def plant(words: list[tuple[int, ...]], seed: int, random_redraw: bool) -> dict[str, float | int]:
    rng, pi, inv, key = q8_key(seed)
    previous: int | None = None
    events: list[int] = []
    counts = [0] * 29
    within_d = within_n = cross_d = cross_n = 0
    pos = 0

    for word in words:
        start = rng.next() % 8
        encoded = encode(word, start, pi, inv, key)
        bad = sum(a == b for a, b in zip(encoded, encoded[1:]))
        if previous is not None:
            bad += encoded[0] == previous

        if bad:
            start = rng.next() % 8 if random_redraw else (start + 1) % 8
            encoded = encode(word, start, pi, inv, key)

        for i, c in enumerate(encoded):
            counts[c] += 1
            if previous is not None:
                if i == 0:
                    cross_n += 1
                    cross_d += c == previous
                else:
                    within_n += 1
                    within_d += c == previous
                if c == previous:
                    events.append(pos - 1)
            previous = c
            pos += 1

    gaps = [b - a for a, b in zip(events, events[1:])]
    gap_r = corr([float(x) for x in gaps[:-1]], [float(x) for x in gaps[1:]])
    ioc29 = 29 * sum(n * (n - 1) for n in counts) / (pos * (pos - 1))
    return {
        "doublets": len(events),
        "rate": len(events) / (pos - 1),
        "within": within_d / within_n,
        "cross": cross_d / cross_n,
        "gap_r": gap_r,
        "ioc29": ioc29,
    }


def summarize(rows: list[dict[str, float | int]]) -> dict[str, object]:
    def quantiles(key: str) -> list[float]:
        xs = sorted(float(r[key]) for r in rows)
        return [xs[0], xs[99], xs[999], xs[1899], xs[-1]]

    d = sorted(int(r["doublets"]) for r in rows)
    return {
        "doublets": [d[0], d[99], d[999], d[1899], d[-1]],
        "ioc29": quantiles("ioc29"),
        "cross_minus_within": sorted(float(r["cross"]) - float(r["within"]) for r in rows)[999],
        "gap_r": quantiles("gap_r"),
        "gap_r_ge_lp2": sum(float(r["gap_r"]) >= LP2_GAP_R for r in rows),
        "doublets_le_lp2": sum(int(r["doublets"]) <= LP2_DOUBLET for r in rows),
        "joint_75_100_ioc098_102": sum(
            75 <= int(r["doublets"]) <= 100 and 0.98 <= float(r["ioc29"]) <= 1.02
            for r in rows
        ),
    }


def main() -> None:
    words = native_words_full_length()
    advance = [plant(words, BASE_SEED + n, False) for n in range(1, PLANTS + 1)]
    redraw = [plant(words, BASE_SEED + n, True) for n in range(1, PLANTS + 1)]
    a, r = summarize(advance), summarize(redraw)

    assert a["doublets"] == [37, 60, 91, 157, 292]
    assert r["doublets"] == [35, 56, 94, 154, 265]
    assert a["gap_r_ge_lp2"] == 8
    assert r["gap_r_ge_lp2"] == 29
    assert a["doublets_le_lp2"] == 816
    assert r["doublets_le_lp2"] == 768
    assert a["joint_75_100_ioc098_102"] == 0
    assert r["joint_75_100_ioc098_102"] == 0

    print("PASS: q8 one-retry mechanism probe")
    print(f"LP2 target: doublets=86/12955={LP2_RATE:.8%}; gap_r={LP2_GAP_R:.9f}; IoC29≈1")
    print("advance-one-once:", json.dumps(a, sort_keys=True))
    print("random-redraw-once:", json.dumps(r, sort_keys=True))


if __name__ == "__main__":
    main()
