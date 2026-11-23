#!/usr/bin/env python3
"""Source-motivated word-reset tests for p8 XIXM and the p7 quartic over GP29.

Run from any directory:
    python3 sims/lp2_p8_xixm_wordlocal_reset_original_sft.py
No third-party dependencies.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
TRANSCRIPTION = (ROOT / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8")
RUNES = CORPUS["runes"]
TRANSLIT = CORPUS["translit"]
RUNE_TO_INDEX = {r: i for i, r in enumerate(RUNES)}
SEED = [14, 10, 14, 19]
A = [
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
    [9, 16, 25, 7],
]


def mod29(value: int) -> int:
    return value % 29


def mat_vec(matrix: list[list[int]], vector: list[int]) -> list[int]:
    return [sum(a * b for a, b in zip(row, vector)) % 29 for row in matrix]


def ioc(values: list[int]) -> float:
    counts = [values.count(i) for i in range(29)]
    n = len(values)
    return sum(c * (c - 1) for c in counts) / (n * (n - 1))


def flatten(words: list[list[int]]) -> list[int]:
    return [x for word in words for x in word]


def preview(words: list[list[int]], limit: int = 40) -> str:
    return " / ".join("".join(TRANSLIT[x] for x in word) for word in words[:limit])


def word_vigenere(words: list[list[int]], sign: int) -> list[list[int]]:
    return [[mod29(x + sign * SEED[i % 4]) for i, x in enumerate(word)] for word in words]


def word_scalar_lfsr(words: list[list[int]], sign: int) -> list[list[int]]:
    result = []
    for word in words:
        key = SEED.copy()
        for i in range(max(0, len(word) - 4)):
            key.append(mod29(9 * key[i] + 16 * key[i + 1] + 25 * key[i + 2] + 7 * key[i + 3]))
        result.append([mod29(x + sign * key[i]) for i, x in enumerate(word)])
    return result


def word_block_register(words: list[list[int]], sign: int) -> list[list[int]]:
    result = []
    for word in words:
        state = SEED.copy()
        output = []
        for offset in range(0, len(word), 4):
            block = word[offset:offset + 4]
            output.extend(mod29(x + sign * state[i]) for i, x in enumerate(block))
            state = mat_vec(A, state)
        result.append(output)
    return result


def main() -> None:
    pages = TRANSCRIPTION.split("%")
    assert len(pages) >= 15
    p8 = pages[8]
    title_end = p8.index(".")
    chapter = (p8[title_end + 1:] + "".join(pages[9:15]))
    chapter = chapter.replace("\r", "").replace("\n", "").replace("/", "")
    chapter = chapter.replace("&", "-").replace("$", "-")
    words = [
        [RUNE_TO_INDEX[ch] for ch in token if ch in RUNE_TO_INDEX]
        for token in re.split(r"[-.]", chapter)
    ]
    words = [word for word in words if word]
    rune_count = sum(map(len, words))
    assert len(words) == 381, len(words)
    assert rune_count == 1717, rune_count

    results = {}
    for sign in (-1, 1):
        for name, transform in (
            ("vigenere", word_vigenere),
            ("scalar_lfsr", word_scalar_lfsr),
            ("block_register", word_block_register),
        ):
            decoded = transform(words, sign)
            flat = flatten(decoded)
            results[f"{name}_sign{sign}"] = {
                "word_count": len(decoded),
                "rune_count": len(flat),
                "ioc": ioc(flat),
                "preview": preview(decoded),
            }

    planted = [[(7 * i + 3) % 29 for i in range(n)] for n in [1, 2, 3, 4, 5, 7, 11, 17]]
    for transform in (word_vigenere, word_scalar_lfsr, word_block_register):
        cipher = transform(planted, 1)
        assert transform(cipher, -1) == planted

    print(json.dumps({
        "scope": "physical p8-p14 black text; p8 red title excluded; page carry joined",
        "word_count": len(words),
        "rune_count": rune_count,
        "seed_XIXM": SEED,
        "p7_quartic_low_first": [11, 26, 8, 15, 2],
        "monic_characteristic_ascending": [20, 13, 4, 22, 1],
        "companion_matrix": A,
        "results": results,
        "planted_round_trips": "PASS",
    }, indent=2))


if __name__ == "__main__":
    main()
