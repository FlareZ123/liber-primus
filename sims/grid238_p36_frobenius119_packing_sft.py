"""Reversible 119+119 Frobenius eigenspace packing of authentic LP2 page36.

Original-source GF(29^238) test. Run with Python 3, NumPy and SymPy
from the repository root. Does not write files.
"""
import json
from pathlib import Path
import numpy as np
import sympy as sp

MOD = 29
DEGREE = 238
corpus = json.loads(Path('resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
grid = json.loads(Path('resources/liber-primus/base60-grid.json').read_text(encoding='utf-8'))
values = [n for row in grid['byte_rows'] for n in row]
tokens = [s for row in grid['rows'] for s in row]
assert len(tokens) == len(values) == 256
assert grid['alphabet'] == '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'
assert all(grid['alphabet'].index(s[0])*60 + grid['alphabet'].index(s[1]) == v
           for s, v in zip(tokens, values))
x = sp.Symbol('x')
source = sp.Poly.from_list([v % MOD for v in values], gens=x, modulus=MOD)
small = sp.Poly(
    (x+5)**2 * (x*x+18*x+11) * (x**3+14*x*x+16*x+24) *
    (x**9+12*x**8+20*x**7+10*x**6+5*x**5+x**4+9*x**3+15*x+11),
    gens=x, modulus=MOD
)
quotient, remainder = source.div(small)
assert remainder.is_zero and quotient.degree() == DEGREE
q = (np.array([int(quotient.nth(i)) % MOD for i in range(DEGREE+1)],
              dtype=np.int64)*28) % MOD
assert q[0] == 5 and q[-1] == 1


def multiply(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    out = np.convolve(a, b) % MOD
    for i in range(2*DEGREE-2, DEGREE-1, -1):
        factor = out[i]
        if factor:
            out[i-DEGREE:i] = (out[i-DEGREE:i] - factor*q[:DEGREE]) % MOD
    return out[:DEGREE]


one = np.zeros(DEGREE, dtype=np.int64)
one[0] = 1


def power(a: np.ndarray, n: int) -> np.ndarray:
    result = one.copy()
    base = a.copy()
    while n:
        if n & 1:
            result = multiply(result, base)
        n >>= 1
        if n:
            base = multiply(base, base)
    return result


def inverse_matrix(m: np.ndarray) -> np.ndarray:
    n = len(m)
    aug = np.concatenate((m.copy() % MOD, np.eye(n, dtype=np.int64)), axis=1)
    for c in range(n):
        candidates = np.flatnonzero(aug[c:, c])
        assert candidates.size, 'singular packing at column %d' % c
        pivot = c + int(candidates[0])
        aug[[pivot, c]] = aug[[c, pivot]]
        aug[c] = aug[c]*pow(int(aug[c, c]), -1, MOD) % MOD
        others = np.flatnonzero(aug[:, c])
        others = others[others != c]
        if others.size:
            aug[others] = (aug[others] - aug[others, c, None]*aug[c]) % MOD
    assert np.array_equal(aug[:, :n], np.eye(n, dtype=np.int64))
    return aug[:, n:]


def stats(a: np.ndarray) -> tuple[float, float]:
    counts = np.bincount(a, minlength=29)
    n = len(a)
    return (float(sum(c*(c-1) for c in counts)/(n*(n-1))),
            float(sum(sorted(counts)[-12:])/n))


p36 = next(p for p in corpus['pages'] if p['page'] == 36)
p57 = next(p for p in corpus['pages'] if p['page'] == 57)
assert p36['runic_count'] == 238 and p57['runic_count'] == 95
cipher = np.array(p36['indices'], dtype=np.int64)
basis_x = np.zeros(DEGREE, dtype=np.int64)
basis_x[1] = 1
frobenius_x = power(basis_x, 29**119)
frobenius = np.zeros((DEGREE, DEGREE), dtype=np.int64)
image = one.copy()
for col in range(DEGREE):
    frobenius[:, col] = image
    image = multiply(image, frobenius_x)
identity = np.eye(DEGREE, dtype=np.int64)
assert np.array_equal(frobenius @ frobenius % MOD, identity)
even = (identity + frobenius)*15 % MOD
odd = (identity - frobenius)*15 % MOD
assert np.array_equal(even @ even % MOD, even)
assert np.array_equal(odd @ odd % MOD, odd)
assert np.count_nonzero(even @ odd % MOD) == 0

# The first119 coefficients of each order-two eigenspace constitute a full
# 119+119 register; no ciphertext-selected pivot locations are used.
pack = np.concatenate((even[:119], odd[:119]), axis=0)
unpack = inverse_matrix(pack)
assert np.array_equal(pack @ unpack % MOD, identity)
assert np.array_equal(unpack @ pack % MOD, identity)
decoded = pack @ cipher % MOD
assert np.array_equal(unpack @ decoded % MOD, cipher)

# Planted real solved-p57 GP text proves the fixed decoder has a lossless
# source-native original-cipher positive, in each of the two 119-rune lanes.
solved = p57['indices']
plain = np.array([solved[i % 95] for i in range(119)] +
                 [solved[(i+41) % 95] for i in range(119)], dtype=np.int64)
coded = unpack @ plain % MOD
assert np.array_equal(pack @ coded % MOD, plain)

print('Original p36 IoC/top12:', stats(cipher))
for name, part in [
    ('even119', decoded[:119]), ('odd119', decoded[119:]),
    ('solved-plant-even119', plain[:119]), ('solved-plant-odd119', plain[119:]),
]:
    print(name, 'IoC/top12', stats(part),
          'first80', ''.join(corpus['translit'][i] for i in part[:80]))
print('PASS: GF(29^238) Frobenius119 119+119 packing,')
print('exact original+solved 238/238 inversion, no unknown plaintext.')
