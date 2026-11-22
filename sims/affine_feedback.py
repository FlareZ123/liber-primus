"""Exhaust all affine mod-29 ciphertext-feedback inverse kernels of memory 0-3.

Run with Python 3.12 and NumPy: python sims/affine_feedback.py
Uses the pinned sources and parser in homophonic_information_bound.py.
"""
from __future__ import annotations

from itertools import product
import json
import random

import numpy as np

from homophonic_information_bound import (
    download_pinned,
    parse_ciphertext,
    parse_reference,
    nonrepeat_null,
)

ORDER = 29
SEED = 3301
POSITIVE_COEFFICIENTS = (5, 17, 26)


def lagged_arrays(pages: list[list[int]], memory: int) -> tuple[np.ndarray, list[np.ndarray]]:
    """Use within-page runes and remove the first memory runes of each page."""
    p = [np.asarray(page, dtype=np.int16) for page in pages if len(page) > memory]
    current = np.concatenate([page[memory:] for page in p])
    lags = [np.concatenate([page[memory - j:-j] for page in p]) for j in range(1, memory + 1)]
    if any(len(lag) != len(current) for lag in lags):
        raise ValueError("Misaligned lagged arrays")
    return current, lags


def ioc(numerator: int, count: int) -> float:
    return numerator / (count * (count - 1))


def sweep(pages: list[list[int]], memory: int, planted: tuple[int, ...] | None = None) -> dict:
    current, lags = lagged_arrays(pages, memory)
    total = len(current)
    best = (-1, None)
    top = []
    planted_result = None
    visited = 0
    if memory == 0:
        choices = [()]
    elif memory == 1:
        choices = [(x,) for x in range(ORDER)]
    else:
        choices = (prefix + (last,) for prefix in product(range(ORDER), repeat=memory - 1)
                   for last in range(1, ORDER))

    for coefficients in choices:
        output = current.copy()
        for coefficient, lag in zip(coefficients, lags):
            output -= coefficient * lag
        output %= ORDER
        counts = np.bincount(output, minlength=ORDER)
        numerator = int(np.dot(counts, counts - 1))
        visited += 1
        if numerator > best[0]:
            best = numerator, coefficients
        if len(top) < 8 or numerator > top[0][0]:
            top.append((numerator, coefficients))
            top.sort()
            if len(top) > 8:
                top.pop(0)
        if planted is not None and tuple(coefficients) == planted:
            planted_result = numerator

    return {
        "memory": memory,
        "evaluated": visited,
        "decoded_positions": total,
        "max_ioc": ioc(best[0], total),
        "max_ioc_times_29": 29 * ioc(best[0], total),
        "best_coefficients": best[1],
        "top_candidates": [
            {"coefficients": c, "ioc": ioc(num, total)}
            for num, c in sorted(top, reverse=True)
        ],
        "planted_score": ioc(planted_result, total) if planted_result is not None else None,
        "planted_recovered_at_global_maximum": planted_result == best[0] if planted_result is not None else None,
    }


def encrypt(pages: list[list[int]], coefficients: tuple[int, ...]) -> list[list[int]]:
    """Plant P_i = C_i - sum(a_j*C_{i-j}) mod 29 with each page reset to zero."""
    result = []
    for plaintext in pages:
        ciphertext = []
        for position, symbol in enumerate(plaintext):
            stream = sum(coeff * ciphertext[position - j]
                         for j, coeff in enumerate(coefficients, 1) if position >= j)
            ciphertext.append((symbol + stream) % ORDER)
        result.append(ciphertext)
    return result


def run() -> dict:
    ciphertext = parse_ciphertext(download_pinned("LP2"))
    reference = parse_reference(download_pinned("LP1_TRANSLATION"))
    results = [sweep(ciphertext, memory) for memory in (1, 2, 3)]
    planted_pages = encrypt(reference, POSITIVE_COEFFICIENTS)
    plant = sweep(planted_pages, 3, planted=POSITIVE_COEFFICIENTS)
    rng = random.Random(SEED)
    q = 86 / 12901
    null_maxima = []
    for _ in range(8):
        synthetic = nonrepeat_null([len(page) for page in ciphertext], q, rng)
        null_maxima.append(sweep(synthetic, 3)["max_ioc"])
    return {
        "model": "P_i = C_i - sum_{j=1}^r a_j C_{i-j} (mod 29), r <= 3",
        "ciphertext": {"rune_count": sum(map(len, ciphertext)), "pages": len(ciphertext)},
        "tested_families": results,
        "tested_coefficients_total": sum(result["evaluated"] for result in results),
        "positive_control": {
            "plaintext_runes": sum(map(len, reference)),
            "true_coefficients": POSITIVE_COEFFICIENTS,
            "result": plant,
        },
        "matched_no_repeat_null": {
            "seed": SEED,
            "replicates": 8,
            "all_degree3_max_ioc": null_maxima,
        },
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
