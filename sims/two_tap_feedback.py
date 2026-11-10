"""Exhaust two-tap mod-29 feedback keys with long lag up to 2048 and 3301.

A short reproducible simulation with a planted key tests the sweep's detection power.
"""
from __future__ import annotations

import heapq
import json
import random

import numpy as np

from homophonic_information_bound import (
    download_pinned,
    parse_ciphertext,
    parse_reference,
    nonrepeat_null,
)

MODULUS = 29
LAGS = tuple(range(2, 2049)) + (3301,)
PLANT_LAG = 137
PLANT_COEFFICIENTS = (7, 19)
SEED = 3301


def sweep(cipher: np.ndarray, lags: tuple[int, ...], plant: tuple[int, int, int] | None = None) -> dict:
    """Decode P_i=(C_i-a*C_(i-1)-b*C_(i-L)) mod 29 for every a,b, b!=0."""
    if cipher.ndim != 1:
        raise ValueError("A flat rune stream is required")
    top: list[tuple[float, int, int, int, int]] = []
    evaluated = 0
    positive_score = None
    for lag in lags:
        current = cipher[lag:]
        last = cipher[lag - 1:-1]
        distant = cipher[:-lag]
        if not len(current):
            continue
        n = len(current)
        denominator = n * (n - 1)
        for a in range(MODULUS):
            base = (current - a * last) % MODULUS
            for b in range(1, MODULUS):
                decoded = (base - b * distant) % MODULUS
                freq = np.bincount(decoded, minlength=MODULUS)
                score = int(np.dot(freq, freq - 1)) / denominator
                candidate = (score, lag, a, b, n)
                if len(top) < 15:
                    heapq.heappush(top, candidate)
                elif score > top[0][0]:
                    heapq.heapreplace(top, candidate)
                if plant == (lag, a, b):
                    positive_score = score
                evaluated += 1
    top.sort(reverse=True)
    return {
        "tested": evaluated,
        "tested_lags": len(lags),
        "global_best": {"IoC": top[0][0], "lag": top[0][1],
                        "a": top[0][2], "b": top[0][3], "decoded_length": top[0][4]},
        "top15": [{"IoC": score, "lag": lag, "a": a, "b": b, "length": n}
                  for score, lag, a, b, n in top],
        "planted_score": positive_score,
        "planted_recovered_at_global_maximum": (positive_score == top[0][0]
                                                  if positive_score is not None else None),
    }


def encrypt(plaintext: list[int], lag: int, a: int, b: int) -> np.ndarray:
    """Use zero-valued missing past symbols to generate a planted cipher stream."""
    ciphertext: list[int] = []
    for i, symbol in enumerate(plaintext):
        prev = ciphertext[i - 1] if i >= 1 else 0
        distant = ciphertext[i - lag] if i >= lag else 0
        ciphertext.append((symbol + a * prev + b * distant) % MODULUS)
    return np.array(ciphertext, dtype=np.int16)


def run() -> dict:
    ciphertext_pages = parse_ciphertext(download_pinned("LP2"))
    ciphertext = np.asarray([rune for page in ciphertext_pages for rune in page], dtype=np.int16)
    ref_lines = parse_reference(download_pinned("LP1_TRANSLATION"))
    reference = [rune for line in ref_lines for rune in line]
    experimental = sweep(ciphertext, LAGS)
    plant_cipher = encrypt(reference, PLANT_LAG, *PLANT_COEFFICIENTS)
    positive = sweep(plant_cipher, LAGS, plant=(PLANT_LAG, *PLANT_COEFFICIENTS))
    rng = random.Random(SEED)
    q = 86 / 12901
    null_maxima = []
    for _ in range(3):
        synthetic_pages = nonrepeat_null([len(page) for page in ciphertext_pages], q, rng)
        synthetic = np.asarray([rune for page in synthetic_pages for rune in page], dtype=np.int16)
        null_maxima.append(sweep(synthetic, LAGS)["global_best"])
    return {
        "model": "P_i = C_i - a*C_(i-1) - b*C_(i-L) (mod 29), b != 0",
        "lags": {"inclusive_range": [2, 2048], "additional": [3301]},
        "ciphertext_runes": len(ciphertext),
        "observed": experimental,
        "positive": {"plant_lag": PLANT_LAG, "plant_coefficients": PLANT_COEFFICIENTS,
                     "plaintext_letters": len(reference), "sweep": positive},
        "matched_no_repeat_null": {"seed": SEED, "replicates": len(null_maxima),
                                   "best_of_each_full_sweep": null_maxima},
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
