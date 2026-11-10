"""Exhaust the previously untested order-4 affine feedback kernels mod29."""
from __future__ import annotations

from itertools import product
import heapq
import json
import random

import numpy as np

from affine_feedback import lagged_arrays, encrypt
from homophonic_information_bound import (download_pinned, parse_ciphertext, parse_reference,
                                          parse_rune_reference, nonrepeat_null)

MODULUS = 29
TRUE_KEY = (5, 17, 26, 9)
SEED = 3301


def sweep(pages: list[list[int]], planted: tuple[int, ...] | None = None) -> dict:
    current, (x, y, z, w) = lagged_arrays(pages, 4)
    n = len(current)
    den = n * (n - 1)
    best = (-1.0, None)
    top: list[tuple[float, tuple[int, ...]]] = []
    true_score = None
    counter = 0
    for a, b, c in product(range(MODULUS), repeat=3):
        partial = (current - a * x - b * y - c * z) % MODULUS
        for d in range(1, MODULUS):
            decoded = (partial - d * w) % MODULUS
            freq = np.bincount(decoded, minlength=MODULUS)
            score = int(np.dot(freq, freq - 1)) / den
            candidate = (a, b, c, d)
            if score > best[0]:
                best = (score, candidate)
            if len(top) < 8:
                heapq.heappush(top, (score, candidate))
            elif score > top[0][0]:
                heapq.heapreplace(top, (score, candidate))
            if planted == candidate:
                true_score = score
            counter += 1
    return {
        'tested': counter,
        'decoded_positions': n,
        'best_ioc': best[0],
        'best_key': best[1],
        'top8': [{'ioc': score, 'key': key} for score, key in sorted(top, reverse=True)],
        'planted_ioc': true_score,
        'planted_recovered': true_score == best[0] if true_score is not None else None,
    }


def run() -> dict:
    cipher = parse_ciphertext(download_pinned('LP2'))
    solved = parse_reference(download_pinned('LP1_TRANSLATION'))
    observed = sweep(cipher)
    positive = sweep(encrypt(solved, TRUE_KEY), planted=TRUE_KEY)
    runic_reference = parse_rune_reference(download_pinned('LP1_RUNE_REFERENCE'))
    runic_positive = sweep(encrypt(runic_reference, TRUE_KEY), planted=TRUE_KEY)
    rng = random.Random(SEED)
    null = [sweep(nonrepeat_null([len(page) for page in cipher], 86 / 12901, rng))['best_ioc']
            for _ in range(3)]
    return {'model': 'P_i=C_i-aC_(i-1)-bC_(i-2)-cC_(i-3)-dC_(i-4) mod29, d!=0',
            'LP2': observed, 'positive': {'key': TRUE_KEY, 'result': positive},
            'positive_original_runes': {'key': TRUE_KEY, 'reference_runes': sum(map(len, runic_reference)),
                                        'result': runic_positive},
            'matched_no_repeat_null': {'seed': SEED, 'n': len(null), 'best_ioc': null}}


if __name__ == '__main__':
    print(json.dumps(run(), indent=2))
