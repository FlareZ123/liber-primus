"""Exact partial Pohlig-Hellman and bounded DLP for conditional p55 base59 factors.
Requires SymPy 1.14.0. Peak memory roughly 500 MB at 23 GP29 digits.
Run from checkout: python sims/lp2_p55_base59_factor_dlog_sft.py
"""
import json
import math
import re
from pathlib import Path
import sympy
from sympy.ntheory import discrete_log
from sympy.ntheory.modular import crt

root = Path(__file__).resolve().parents[1]
corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
pages = (root / "resources/transcriptions/lp2-image-corrected.txt").read_text(encoding="utf8").split("\n%\n")
ix = {r: i for i, r in enumerate(corpus["runes"])}
fragments = [[ix[r] for r in w if r in ix] for w in re.split(r"[-.&$§]", pages[54])]
fragments = [w for w in fragments if w]
assert len(pages) == 57 and fragments[0] == [21]
assert sum(fragments, []) == corpus["pages"][55]["indices"]
words = fragments[1:]
inside = [v for w in words for v in w[1:-1]]
shell = [v for w in words for v in (w[0], w[-1])]
assert (len(words), len(inside), len(shell)) == (16, 43, 32)

def val(xs):
    n = 0
    for x in xs:
        n = 59 * n + x
    return n

I, S = val(inside), val(shell)
p = 25049452499506949
q = 494114755650988709396898675903506495573679579533633450389
assert I == 16 * 23 * p * q and 0 < S < q
assert sympy.isprime(p) and sympy.isprime(q)
small = [4, 3, 8053, 236503, 19994329753]
ell = 1081297935435871954478318282795754437
assert math.prod(small) * ell == q - 1
assert all(sympy.isprime(f) for f in [2, *small[1:], ell])
assert all(pow(p, (q - 1) // f, q) != 1 for f in [2, *small[1:], ell])

residues = []
for f in small:
    g, h = pow(p, (q - 1) // f, q), pow(S, (q - 1) // f, q)
    r = next(i for i in range(f) if pow(g, i, q) == h) if f == 4 else int(discrete_log(q, h, g, order=f, prime_order=True))
    assert pow(g, r, q) == h
    residues.append(r)
    print("subgroup", f, "log", r, flush=True)
r, M = map(int, crt(small, residues))
assert (r, M) == (287198427206174543159, 456964486343729774724)
assert pow(p, r, q) != S
K = (29 ** 23 - 1 - r) // M
B = math.isqrt(K) + 1
g = pow(p, M, q)
h = S * pow(pow(p, r, q), -1, q) % q
assert K < ell
baby = {}
cur = 1
for j in range(B):
    baby[cur] = j
    cur = cur * g % q
assert len(baby) == B
stride = pow(cur, -1, q)

def interval_log(target):
    cur = target
    for i in range(K // B + 1):
        j = baby.get(cur)
        if j is not None and i * B + j <= K:
            k = i * B + j
            assert pow(g, k, q) == target
            return k
        cur = cur * stride % q
    return None

assert interval_log(pow(g, 123456789, q)) == 123456789
found = interval_log(h)
assert found is None
m = pow(S, pow(p, -1, q - 1), q)
assert pow(m, p, q) == S
print(json.dumps({"r": str(r), "M": str(M), "remaining_prime_order": str(ell),
    "K_max": K, "baby_steps": B, "short_exponent_found": found,
    "exponentiation_cipher_inverse": str(m), "positive_control": 123456789}, indent=2))
