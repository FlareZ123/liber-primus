"""Controlled exhaustive polynomial-feedback inverse search mod 29.

Tests P_i = C_i - a*C_(i-1) - b*C_(i-2) - c*Q(C_(i-1), C_(i-2))
with a,b mod29, c=1..28, Q in {x*y, x*x, y*y}. All such kernels are
covered exactly; the c=0 linear subfamily is covered by affine_feedback.py.
"""
from __future__ import annotations

import json
import random

import numpy as np

from affine_feedback import lagged_arrays
from homophonic_information_bound import (
    download_pinned, parse_ciphertext, parse_reference, nonrepeat_null
)

MODULUS = 29
FORMS = ('xy', 'xx', 'yy')
PLANT = ('xy', 4, 11, 16)
SEED = 3301


def quadratic(x: np.ndarray, y: np.ndarray, form: str) -> np.ndarray:
    if form == 'xy':
        return (x * y) % MODULUS
    if form == 'xx':
        return (x * x) % MODULUS
    if form == 'yy':
        return (y * y) % MODULUS
    raise ValueError(f'Unknown form {form}')


def sweep(pages: list[list[int]], plant: tuple[str, int, int, int] | None = None) -> dict:
    current, (x, y) = lagged_arrays(pages, 2)
    n = len(current)
    denominator = n * (n - 1)
    best = (-1.0, None)
    true_score = None
    per_form = {}
    count = 0
    for form in FORMS:
        q = quadratic(x, y, form)
        best_form = (-1.0, None)
        for a in range(MODULUS):
            linear = (current - a * x) % MODULUS
            for b in range(MODULUS):
                partial = (linear - b * y) % MODULUS
                for c in range(1, MODULUS):
                    plaintext = (partial - c * q) % MODULUS
                    f = np.bincount(plaintext, minlength=MODULUS)
                    score = int(np.dot(f, f - 1)) / denominator
                    key = (form, a, b, c)
                    if score > best_form[0]:
                        best_form = (score, key)
                    if score > best[0]:
                        best = (score, key)
                    if key == plant:
                        true_score = score
                    count += 1
        per_form[form] = {"max_ioc": best_form[0], "key": best_form[1]}
    return {
        "tested": count,
        "decoded_positions": n,
        "best_ioc": best[0],
        "best_coefficients": best[1],
        "per_form": per_form,
        "planted_ioc": true_score,
        "planted_key_is_global_maximum": true_score == best[0] if true_score is not None else None,
    }


def encrypt(reference: list[list[int]], key: tuple[str, int, int, int]) -> list[list[int]]:
    form, a, b, c = key
    output = []
    for line in reference:
        encrypted = []
        for i, value in enumerate(line):
            x = encrypted[i - 1] if i >= 1 else 0
            y = encrypted[i - 2] if i >= 2 else 0
            q = {'xy': x * y, 'xx': x * x, 'yy': y * y}[form]
            encrypted.append((value + a * x + b * y + c * q) % MODULUS)
        output.append(encrypted)
    return output


def run() -> dict:
    ciphertext = parse_ciphertext(download_pinned('LP2'))
    english = parse_reference(download_pinned('LP1_TRANSLATION'))
    real_result = sweep(ciphertext)
    positive_result = sweep(encrypt(english, PLANT), plant=PLANT)
    rng = random.Random(SEED)
    nulls = []
    for _ in range(6):
        synthetic = nonrepeat_null([len(page) for page in ciphertext], 86 / 12901, rng)
        nulls.append(sweep(synthetic)['best_ioc'])
    return {
        'model': 'P_i=C_i-a*x-b*y-c*Q(x,y), x=C_(i-1), y=C_(i-2), mod 29',
        'forms': FORMS, 'nonzero_c': '1..28',
        'LP2': real_result,
        'control': {'planted_key': PLANT, 'plaintext_letters': sum(map(len, english)),
                    'result': positive_result},
        'null': {'seed': SEED, 'replicates': len(nulls), 'global_maxima': nulls},
    }


if __name__ == '__main__':
    print(json.dumps(run(), indent=2))
