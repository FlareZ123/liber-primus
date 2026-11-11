#!/usr/bin/env python3
"""Source-frozen direct p50/GF(2^176) Shamir-share packing exclusion.

2013 SSSS used ten decimal IDs, threshold five, 22-byte GF(2^176) shares,
the monic degree-5 polynomial convention, and a separate secret diffusion.
The original LP2 pp49-51 table has 256 decoded bytes: try the natural first
or last 220 as ten consecutive 22-byte shares with IDs 1..10.

This is a necessary-condition test on the **public shares**. It does not
assume the 2013 secret appears in LP2 and does not run the later XTEA
diffusion (irrelevant to interpolating publicly visible share values).
No source fixes the 36 discarded bytes or a packing method, so passing
would only have justified further investigation. Node SSSS-row analogue:
sims/lp2_p49_2013_ssss_5of10_original_gate_sft.cjs.
"""
from __future__ import annotations

import hashlib
import json
import runpy
from functools import reduce
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
grid = json.loads((ROOT / 'resources/liber-primus/base60-grid.json').read_text(encoding='utf-8'))
raw = bytes(grid['byte_rows'][r][c] for r in range(32) for c in range(8))
assert len(raw) == 256
assert hashlib.sha256(raw).hexdigest() == (
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
)

# Reuse the exact historical 2013 code, rather than inventing a field.
legacy = runpy.run_path(str(ROOT / 'sims/2013_pklmx_reproduce.py'))
mul, power, inverse = legacy['gf_mul'], legacy['gf_pow'], legacy['gf_inv']
poly_eval = legacy['poly_eval']
assert legacy['FIELD_BITS'] == 176
assert legacy['SHARE_THRESHOLD'] == 5
assert legacy['FIELD_POLY'] == (
    (1 << 176) | (1 << 11) | (1 << 3) | (1 << 2) | 1
)

XS = tuple(range(1, 6))
MASK = (1 << 176) - 1
denominators = tuple(
    inverse(_denominator)
    for _denominator in (
        reduce(
            mul, (xi ^ xj for xj in XS if xj != xi), 1)
        for xi in XS)
)


def predict(first_five: list[int], x: int) -> int:
    """Degree-5 SSSS share: x**5 + degree<=4 interpolation of y_i+x_i**5."""
    assert len(first_five) == 5
    result = power(x, 5)
    for i, xi in enumerate(XS):
        term = first_five[i] ^ power(xi, 5)
        for j, xj in enumerate(XS):
            if i != j:
                term = mul(term, x ^ xj)
        result ^= mul(term, denominators[i])
    return result


def evaluate(shares: list[int]) -> dict:
    """Hold out original source share IDs 6..10; no fit to these five shares."""
    expected = [predict(shares[:5], x) for x in range(6, 11)]
    heldout = shares[5:]
    return {
        'exactShares': sum(a == b for a,b in zip(expected, heldout)),
        'heldoutShares': 5,
        'correctBits': sum((~(a ^ b) & MASK).bit_count()
                           for a,b in zip(expected, heldout)),
        'bitsTested': 880,
        'firstPredictedShareHex': f'{expected[0]:044x}',
        'firstActualShareHex': f'{heldout[0]:044x}',
    }


def main() -> dict:
    # Historical polynomial algebra positive-control, fixed 176-bit coefficients.
    coeff = [0x1234567, 0x1033, 0x3301, 0x123456789ABC, 0xDEADBEEF, 1]
    planted = [poly_eval(coeff, x) for x in range(1, 11)]
    positive = evaluate(planted)
    assert positive['exactShares'] == 5
    assert positive['correctBits'] == 880
    rows = []
    expected_bits = {
        ('first', 'forward'): 418,
        ('first', 'reverse'): 438,
        ('last', 'forward'): 455,
        ('last', 'reverse'): 425,
    }
    for span, start in [('first', 0), ('last', 36)]:
        values = [
            int.from_bytes(raw[start + j:start + j + 22], 'big')
            for j in range(0, 220, 22)
        ]
        assert len(values) == 10
        for direction in ['forward', 'reverse']:
            shares = values if direction == 'forward' else list(reversed(values))
            outcome = evaluate(shares)
            assert outcome['exactShares'] == 0
            assert outcome['correctBits'] == expected_bits[(span, direction)]
            rows.append({'span': span, 'direction': direction, **outcome})
    return {
        'source': 'Original 32x8 p50 radix60 table and 2013 SSSS GF2^176 implementation',
        'shareIDs': list(range(1,11)),
        'threshold': 5,
        'shareBytes': 22,
        'matrixBytes': 256,
        'unusedBytes': 36,
        'cases': rows,
        'plantedPositive': positive,
        'directHistoricalShareCodewordsFound': 0,
        'scope': 'Only prefix/suffix 220-byte sequential packings; no arbitrary offsets, share IDs, digest/KDF, or GP29 pretransform.'
    }


if __name__ == '__main__':
    print(json.dumps(main(), indent=2))
