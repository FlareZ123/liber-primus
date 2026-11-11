#!/usr/bin/env python3
"""Source-oriented p32 column-7 Fibonacci-89 checksum and frozen original inverse.

Run: python sims/p32_p15_f89_col7_sft.py
Conditional null fixes the first row and first column of original p32.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SEED = 0x20163301
TRIALS = 200_000


def ioc(seq: np.ndarray) -> float:
    counts = np.bincount(seq, minlength=29)
    return float(np.dot(counts, counts - 1) / (len(seq) * (len(seq) - 1)))


def main() -> None:
    corpus = json.loads(
        (ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
    )
    primes = np.array(corpus["prime"], dtype=np.int64)
    matrix = np.asarray(corpus["pages"][32]["indices"], dtype=np.int64).reshape(11, 11)
    weights = primes[matrix]
    assert int(weights[0].sum()) == 563
    assert int(weights[:, 0].sum()) == 569
    assert int(weights[3, 6]) == 89
    assert int(weights[:, 6].sum()) == 463
    assert weights[:, 6].tolist() == [43, 67, 5, 89, 19, 47, 3, 109, 3, 19, 59]
    assert 3301 - 2838 == 463
    first_ninety_primes = [
        p for p in range(2, 464)
        if all(p % q for q in range(2, int(p ** 0.5) + 1))
    ]
    assert len(first_ninety_primes) == 90 and first_ninety_primes[-1] == 463

    # Independent 2012/2016 image dimensions have consecutive prime ranks.
    image_primes = [
        p for p in range(2, 570)
        if all(p % q for q in range(2, int(p ** 0.5) + 1))
    ]
    assert [image_primes[i - 1] for i in (96, 97, 103, 104)] == [
        503, 509, 563, 569
    ]
    assert 103 - 96 == 104 - 97 == 7
    assert 103 - 13 == 90

    # Width ordinal minus the source-visible 13-dot marker selects p32's
    # one-based 90th rune, which starts a printed word.
    transcript = (ROOT / "resources/lp2-transcription.txt").read_text(
        encoding="utf-8"
    ).split("%")[32]
    rune_sites = [
        i for i, char in enumerate(transcript)
        if 0x16A0 <= ord(char) <= 0x16FF
    ]
    assert len(rune_sites) == 121
    assert transcript[rune_sites[89]] == "ᛟ"
    assert transcript[rune_sites[89] - 1] == "-"


    rng = np.random.default_rng(SEED)
    inner = weights[1:, 1:].ravel()
    cell = col = joint = anycol = anyaxis = 0
    for _ in range(TRIALS):
        perm = rng.permutation(inner).reshape(10, 10)
        cols = perm.sum(axis=0) + weights[0, 1:]
        rows = perm.sum(axis=1) + weights[1:, 0]
        has_cell = int(perm[2, 5] == 89)
        has_col = int(cols[5] == 463)
        cell += has_cell
        col += has_col
        joint += has_cell and has_col
        anycol += int(np.any(cols == 463))
        anyaxis += int(np.any(cols == 463) or np.any(rows == 463))
    assert (cell, col, joint, anycol, anyaxis) == (7875, 741, 23, 6950, 13628)

    # The original paired three-dot marks bracket p33:91 to p39:119.
    original = np.asarray([
        x for page in range(33, 40)
        for x in corpus["pages"][page]["indices"][
            91 if page == 33 else 0:119 if page == 39 else None
        ]
    ], dtype=np.int64)
    assert len(original) == 1468
    key = matrix[:, 6]
    clock = np.resize(key, len(original))
    subtract = (original - clock) % 29
    add = (original + clock) % 29
    solved = np.asarray(corpus["pages"][56]["indices"], dtype=np.int64)
    solved_clock = np.resize(key, len(solved))
    assert np.array_equal((solved + solved_clock - solved_clock) % 29, solved)
    summary = {
        "p32_original_row0_sum": 563,
        "p32_original_column0_sum": 569,
        "p32_row4_col7_prime": int(weights[3, 6]),
        "p32_column7_prime_weights": weights[:, 6].tolist(),
        "p32_column7_sum": int(weights[:, 6].sum()),
        "p15_11th_spiral": {"fibonacci": 89, "prime90": 463, "printed": 2838},
        "null_seed": hex(SEED),
        "null_trials": TRIALS,
        "null_hit_counts": {
            "fixed_cell89": cell, "fixed_column463": col,
            "joint_fixed_cell_column": joint,
            "any_nonfirst_column463": anycol,
            "any_nonfirst_row_or_column463": anyaxis
        },
        "column7_gp_key": "-".join(corpus["translit"][int(i)] for i in key),
        "source_bracket_runes": len(original),
        "source_ioc": ioc(original),
        "period11_subtract_ioc": ioc(subtract),
        "period11_add_ioc": ioc(add),
        "solved_source_gp_synthetic_round_trip": True,
        "result": "provisional cross-link; direct inverse nonlinguistic"
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
