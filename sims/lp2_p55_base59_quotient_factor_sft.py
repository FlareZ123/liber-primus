"""Factor the conditional p55 base59 quotient and test the historical e=65537.
Run from the checkout: python sims/lp2_p55_base59_quotient_factor_sft.py
Requires SymPy 1.14.0 (ECM and primality testing).
"""
from pathlib import Path
import json
import math
import re
import sympy
from sympy.ntheory.ecm import ecm

ROOT = Path(__file__).resolve().parents[1]
corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
pages = (ROOT / "resources/transcriptions/lp2-image-corrected.txt").read_text(encoding="utf8").split("\n%\n")
ix = {r: i for i, r in enumerate(corpus["runes"])}
fragments = [[ix[r] for r in w if r in ix] for w in re.split(r"[-.&$§]", pages[54])]
fragments = [w for w in fragments if w]
assert len(pages) == 57 and fragments[0] == [21]
assert sum(fragments, []) == corpus["pages"][55]["indices"]
words = fragments[1:]
inside = [v for w in words for v in w[1:-1]]
shell = [v for w in words for v in (w[0], w[-1])]
assert (len(words), len(inside), len(shell)) == (16, 43, 32)

def value(digits, radix):
    n = 0
    for digit in digits:
        n = radix * n + digit
    return n

def digits(n, radix):
    out = []
    while n:
        n, d = divmod(n, radix)
        out.append(d)
    return out[::-1] or [0]

I, S = value(inside, 59), value(shell, 59)
N, remainder = divmod(I, 16 * 23)
assert remainder == 0
assert (S % 23, N % 23) == (20, 19)
print("SymPy", sympy.__version__, "I", I, "S", S, "N", N, flush=True)
p, q = sorted(ecm(N, B1=10000, B2=1000000, max_curve=60, seed=59))
assert (p, q) == (25049452499506949, 494114755650988709396898675903506495573679579533633450389)
assert p * q == N and sympy.isprime(p) and sympy.isprime(q)
e = 65537
phi = (p - 1) * (q - 1)
assert math.gcd(e, phi) == 1 and 0 < S < N
d = pow(e, -1, phi)
m = pow(S, d, N)
assert pow(m, e, N) == S
gp = digits(m, 29)
raw = m.to_bytes((m.bit_length() + 7) // 8, "big")
width = (N.bit_length() + 7) // 8
assert width == 31 and width < 2 * 20 + 2
assert 28 * (59 ** 32 - 1) // 58 < N
out = {
    "I": str(I), "S": str(S), "N": str(N),
    "factors": [str(p), str(q)],
    "factor_bits": [p.bit_length(), q.bit_length()],
    "modulus_bits": N.bit_length(), "modulus_bytes": width,
    "rsa_exponent": e, "raw_hex": raw.hex(),
    "raw_gp29": [corpus["translit"][v] for v in gp],
    "raw_gp29_count": len(gp), "rsa_replay": True,
    "sha1_oaep_minimum_bytes": 42,
    "shell_capacity": str(29 ** 32),
    "uniform_residue_shell_fraction": 29 ** 32 / N,
    "uniform_residue_shell_log2_fraction": 32 * math.log2(29) - math.log2(N),
}
print(json.dumps(out, indent=2))
