"""Complete original LP2 256-byte table factorization over GF(29).

Uses the original printed grid bytes, as independently authenticated in the
repository's source corpus. Requires SymPy 1.14+.
Run: python sims/lp2_grid_gf29_factorization_sft.py
The factorization is exact. Cryptographic interpretation remains conjectural.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from sympy import Poly, Symbol, factor_list

ROOT = Path(__file__).resolve().parents[1]
P = 29
EXPECTED_SHA = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
EXPECTED_LOW = {
    1: [1, 5],
    2: [1, 18, 11],
    3: [1, 14, 16, 24],
    9: [1, 12, 20, 10, 5, 1, 9, 0, 15, 11],
}
EXPECTED_HIGH_SHA = "9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3"


def gp_ioc(symbols: list[int]) -> float:
    """Index of coincidence of unmodified GP29 coefficients."""
    n = len(symbols)
    return sum(symbols.count(v) * (symbols.count(v) - 1) for v in range(P)) / (n * (n - 1))


def main() -> dict[str, object]:
    grid = json.loads((ROOT / "resources/liber-primus/base60-grid.json").read_text(encoding="utf-8"))
    ink = json.loads((ROOT / "resources/liber-primus/lp2-ink-annotations.json").read_text(encoding="utf-8"))
    original = [byte for row in grid["byte_rows"] for byte in row]
    assert len(original) == 256
    assert all(isinstance(byte, int) and 0 <= byte < 256 for byte in original)
    assert hashlib.sha256(bytes(original)).hexdigest() == EXPECTED_SHA
    # Preserve the source's full 256-position width, then let Poly discard
    # its leading zero modulo 29.
    assert original[0] == 203 and original[0] % P == 0
    x = Symbol("x")
    polynomial = Poly.from_list([v % P for v in original], x, modulus=P)
    assert polynomial.degree() == 254

    scalar, factors = factor_list(polynomial)
    factor_degrees = [(factor.degree(), multiplicity) for factor, multiplicity in factors]
    assert factor_degrees == [(1, 2), (2, 1), (3, 1), (9, 1), (238, 1)]
    assert int(scalar) % P == 28
    product = Poly(scalar, x, modulus=P)
    for factor, multiplicity in factors:
        product *= factor**multiplicity
        if factor.degree() in EXPECTED_LOW:
            assert [int(c) % P for c in factor.all_coeffs()] == EXPECTED_LOW[factor.degree()]
    assert product == polynomial, "The complete factorization must reconstruct the original"
    large = next(factor for factor, _ in factors if factor.degree() == 238)
    high_coeffs = [int(c) % P for c in large.all_coeffs()]
    assert len(high_coeffs) == 239 and high_coeffs[0] == 1
    assert hashlib.sha256(bytes(high_coeffs)).hexdigest() == EXPECTED_HIGH_SHA
    assert large.degree() == 2 * 119
    assert sum(d * mult for d, mult in factor_degrees if d < 238) == 16

    red3 = next(page for page in ink["pages"] if page["page"] == 3)
    red39 = next(page for page in ink["pages"] if page["page"] == 39)
    red15 = next(page for page in ink["pages"] if page["page"] == 15)
    assert [span["start"] for span in red3["red_spans"] if span["length"] == 3] == [119]
    assert [span["start"] for span in red39["red_spans"] if span["length"] == 3] == [119]
    assert any(span["start"] == 0 and span["length"] == 9 for span in red15["red_spans"])

    # Read the 238 non-leading coefficients as contiguous base29 symbols,
    # or a 145-byte big-endian radix29 integer. Neither is plaintext.
    payload = high_coeffs[1:]
    integer = 0
    for c in payload:
        integer = integer * 29 + c
    octets = integer.to_bytes((integer.bit_length() + 7) // 8, "big")
    printable = sum(32 <= byte <= 126 for byte in octets)
    assert len(octets) == 145
    assert printable == 49

    result: dict[str, object] = {
        "classification": "Exact complete GF29 factorization; possible clue, no recovered plaintext",
        "original_sha256": EXPECTED_SHA,
        "source_polynomial_degree": polynomial.degree(),
        "unit_mod29": int(scalar) % P,
        "irreducible_factor_degrees_multiplicities": factor_degrees,
        "low_degree_factors_monic_coefficients": EXPECTED_LOW,
        "large_irreducible_degree": 238,
        "large_irreducible_monic_coefficient_sha256": EXPECTED_HIGH_SHA,
        "total_removed_degree": 16,
        "residual_degree": 238,
        "source_red_triad_local_start_both": 119,
        "independent_page15_red_title_runes": 9,
        "large_factor_nonleading_runes": len(payload),
        "large_factor_nonleading_gp29_ioc": gp_ioc(payload),
        "large_factor_direct_base29_bigendian_bytes": len(octets),
        "large_factor_direct_printable_ascii_bytes": printable,
        "exact_product_reconstructs_original": True,
    }
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    main()
