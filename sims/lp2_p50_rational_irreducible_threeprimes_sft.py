"""Source-exact three-prime irreducibility certificate for LP2 256-byte grid.

The original high-degree-first 256 byte coefficients define a primitive
degree-255 integer polynomial. Factor it over GF(11), GF(17), GF(19).
The common subset sums of irreducible degrees decide rational irreducibility
without integer polynomial factoring or tuning any ciphertext.

Run on Windows 11 with Python 3.12+ and SymPy 1.14:
    python sims/lp2_p50_rational_irreducible_threeprimes_sft.py
This is a read-only source original test, no file writes.
"""
import hashlib
import json
from functools import reduce
from math import gcd
from pathlib import Path

from sympy import Poly, symbols

ROOT = Path(__file__).resolve().parents[1]
GRID = ROOT / "resources" / "liber-primus" / "lp2-grid-256.json"
BYTE_HASH = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
EXPECTED = {
    11: (1, 1, 10, 14, 229),
    17: (1, 3, 3, 17, 24, 207),
    19: (2, 2, 7, 11, 19, 26, 188),
}
X = symbols("x")


def subset_sums(degrees):
    possible = {0}
    for degree in degrees:
        possible |= {d + degree for d in possible}
    return possible


def run():
    payload = json.loads(GRID.read_text(encoding="utf-8"))
    coeff = payload["bytes"]
    assert len(coeff) == 256
    assert all(isinstance(v, int) and 0 <= v <= 255 for v in coeff)
    assert hashlib.sha256(bytes(coeff)).hexdigest() == BYTE_HASH
    assert coeff[0] == 203 and coeff[-1] == 80
    assert reduce(gcd, coeff) == 1
    degree = len(coeff) - 1

    common = set(range(degree + 1))
    for prime, declared in EXPECTED.items():
        assert coeff[0] % prime != 0
        source = Poly.from_list(coeff, X, modulus=prime)
        unit, components = source.factor_list()
        factor_degrees = tuple(sorted(
            term.degree()
            for term, multiplicity in components
            for _ in range(multiplicity)
        ))
        assert factor_degrees == declared
        assert sum(factor_degrees) == degree

        rebuilt = Poly(unit, X, modulus=prime)
        for factor, multiplicity in components:
            assert factor.is_irreducible
            rebuilt *= factor ** multiplicity
        assert rebuilt == source
        common &= subset_sums(factor_degrees)
        print(json.dumps({
            "modulus": prime,
            "coefficient_degree": source.degree(),
            "factor_degrees": factor_degrees,
            "possible_integer_factor_degrees_remaining": sorted(common),
        }))
    assert common == {0, 255}

    # A true reducible primitive polynomial must have a nonzero proper
    # integer-factor degree in the intersection; this source has none.
    print("ORIGINAL_SOURCE_CERTIFIED: Primitive degree-255 table polynomial "
          "is irreducible over Q; modular GP29 factors do not lift to Z[x].")

    # Independent synthetic positive: multiply two primitive polynomials
    # of distinct degrees. The same possible-degree intersection retains a
    # proper degree 1 and degree 254; the source certificate would reject it.
    planted = Poly(X + 1, X) * Poly(X ** 254 + 2 * X + 1, X)
    assert planted.degree() == 255
    positive = set(range(256))
    for prime in EXPECTED:
        reduced = Poly(planted.as_expr(), X, modulus=prime)
        _, factors = reduced.factor_list()
        positive &= subset_sums(
            [factor.degree() for factor, multiplicity in factors
             for _ in range(multiplicity)]
        )
    assert 1 in positive and 254 in positive
    print("PLANTED_REDUCIBLE_POSITIVE: Proper degrees 1 and 254 "
          "survive the identical three-prime subset-degree discriminator.")
    print("PASS LP2 p50 rational irreducibility three-modulus source SFT")


if __name__ == "__main__":
    run()
