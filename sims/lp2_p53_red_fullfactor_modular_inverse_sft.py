"""LP2 p53 red 51-rune factor arithmetic and one 2012-era modular inverse.

Python 3.12+, SymPy. Original repo sources, no ciphertext fitting or writes.
The candidate is not an authenticated RSA key and no LP2 plaintext is claimed.
"""
from hashlib import sha256
from math import gcd, lcm, prod
from pathlib import Path
import json
from sympy import isprime

root = Path(__file__).resolve().parent.parent
def load(name):
    return json.loads((root / name).read_text(encoding="utf-8"))

grid = load("resources/liber-primus/base60-grid.json")
corpus = load("resources/liber-primus/lp2-corpus.json")
ink = load("resources/liber-primus/lp2-ink-annotations.json")
rows = grid["byte_rows"]
assert len(rows) == 32 and all(len(row) == 8 for row in rows)
data = bytes(v for row in rows for v in row)
assert sha256(data).hexdigest() == "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
N = int.from_bytes(data, "big")
page = next(p for p in corpus["pages"] if p["page"] == 53)
annotation = next(p for p in ink["pages"] if p["page"] == 53)
start, length = annotation["red_spans"][0]["start"], annotation["red_spans"][0]["length"]
assert len(page["indices"]) == 179 and (start, length) == (128, 51)
indices = page["indices"][start:start + length]
assert "".join(corpus["runes"][v] for v in indices) == annotation["red_spans"][0]["runes"]
R = 0
for v in indices:
    R = R * 29 + v

C = 269573819958837950787541728931395654992696677965349
factors = [2, 113, 179, 27241, 39901, 68909, 265541, C]
assert prod(factors) == R
assert all(isprime(p) for p in factors)
assert len(set(factors)) == 8
# SymPy's large-integer isprime is BPSW probable primality, not an
# independently published Pocklington/ECPP primality certificate.
totient = prod(p - 1 for p in factors)
carmichael = lcm(*(p - 1 for p in factors))
e = 65537
assert gcd(e, carmichael) == 1
d = pow(e, -1, carmichael)
assert d == 58028108156247511553393981856015707768216249348457261213870331073
for message in (1, 3, 29, 179, 3301, 65537, C):
    assert pow(pow(message, e, R), d, R) == message % R
# The two unpermuted printed-axis readings yield 8 natural 32-byte
# integers each, all larger than the 247-bit candidate modulus.
row_blocks = [data[i:i + 32] for i in range(0, 256, 32)]
column_blocks = [bytes(rows[j][i] for j in range(32)) for i in range(8)]
assert all(int.from_bytes(block, "big") >= R for block in row_blocks + column_blocks)
# A 247-bit modulus requires 31-byte RSA ciphertexts. If the 32x8
# source geometry stores eight complete column blocks after skipping an
# apparent extra row, all eight source blocks must be below R. Neither
# of the two source-boundary (first/last-row) readings satisfies this.
trimmed_counts = []
for cut_rows in (rows[1:], rows[:-1]):
    assert len(cut_rows) == 31
    candidates = [bytes(row[col] for row in cut_rows) for col in range(8)]
    trimmed_counts.append(sum(int.from_bytes(block, "big") < R for block in candidates))
assert trimmed_counts == [2, 1]

# A separate but speculative reduction of the whole 2048-bit N modulo R
# gives an arithmetically exact inverse but no recognizable text payload.
candidate = pow(N % R, d, R)
assert pow(candidate, e, R) == N % R
assert candidate.to_bytes(31, "big").hex() == (
    "43e37f8a4dfbdb2423460c54ee4109f79a65e7e1a70ad1cfcfa5adaf855718")
print(json.dumps({
    "result": "PASS",
    "large_residual_probable_prime": str(C),
    "red_modulus_bits": R.bit_length(),
    "distinct_probable_prime_factors": len(factors),
    "phi": str(totient),
    "lambda": str(carmichael),
    "historical_candidate_e": e, "derived_d": str(d),
    "direct_32byte_RSA_blocks_eligible": 0,
    "eight_31byte_columns_eligible_drop_first_last_row": trimmed_counts,
    "whole_table_reduced_inverse_hex": candidate.to_bytes(31, "big").hex(),
    "plaintext_recovered": False,
    "limit": "R is even and not a conventional RSA modulus; scalar reduction is conjectural",
}, indent=2))
