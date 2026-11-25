"""Try both conditional base59 quotient factors as literal consecutive-prime origins.
Run from checkout: python sims/lp2_p55_base59_factor_prime_origin_sft.py
Requires SymPy. No language assumptions or key fitting.
"""
from pathlib import Path
import json
from sympy import nextprime, isprime

ROOT = Path(__file__).resolve().parents[1]
corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
pages = {p["page"]: p["indices"] for p in corpus["pages"]}
p = 25049452499506949
q = 494114755650988709396898675903506495573679579533633450389
assert isprime(p) and isprime(q)

def prime_shifts(origin, count):
    x = origin
    out = []
    for _ in range(count):
        out.append((x - 1) % 29)
        x = int(nextprime(x))
    return out

def reach(cipher, key):
    cursors = {0: 1}
    for i, c in enumerate(cipher):
        new = {}
        for j, n in cursors.items():
            if c == 0:
                new[j] = new.get(j, 0) + n
            if c != key[j]:
                new[j + 1] = new.get(j + 1, 0) + n
        if not new:
            return i, {}
        cursors = new
    return None, cursors

keys = [prime_shifts(x, 400) for x in (p, q)]
positive = reach(pages[56], prime_shifts(2, 85))
assert positive == (None, {81: 4, 82: 8, 83: 6, 84: 3, 85: 1})
scopes = [(0, 2), (3, 7), (8, 14), (15, 22), (23, 26), (27, 32), (33, 39), (40, 53), (54, 55), (55, 55), (56, 56)]
expected = [(36,85),(6,0),(29,43),(127,64),(36,42),(3,20),(98,72),(93,115),(8,25),(8,9),(9,7)]
for (a,b), exp in zip(scopes, expected):
    cipher = [v for i in range(a,b+1) for v in pages[i]][:400]
    deaths = tuple(reach(cipher,k)[0] for k in keys)
    assert deaths == exp
    print(f"p{a}-{b} length={len(cipher)} first impossible offset: {deaths}")
print("Authentic p56 positive: ", positive)
