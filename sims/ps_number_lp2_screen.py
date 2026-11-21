#!/usr/bin/env python3
"""Bounded screen of the 2012 Valete P.S. integer against LP2.

Uses only the repository's canonical LP2 transcription and source-published
P.S. factorization. This is a negative candidate screen, not a decryption claim.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

ALPHABET = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
INDEX = {r: i for i, r in enumerate(ALPHABET)}

N = int(
    "10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631"
)
P = int(
    "99554414790940424414351515490472769096534141749790794321708050837"
)
Q = int(
    "104593961812606247801193807142122161186583731774511103180935025763"
)
E = 65537

# The 2014 Stage 2 signed payload's own modulus, concatenated across its
# shell line continuation. It is not the 2012 P.S. integer.
STAGE2_N = int(
    "75579125746085351644267182920580212556413102071876330957950694457000592"
    "10248050757270234679993673844203148013173091173786572116639"
)

COOKIE_HEX = {
    "167": "6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6",
    "761": "7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5",
}


def base29_digits(value: int) -> list[int]:
    if value == 0:
        return [0]
    out = []
    while value:
        value, rem = divmod(value, 29)
        out.append(rem)
    return out[::-1]


def scaled_ioc(values: list[int]) -> float:
    n = len(values)
    counts = [0] * 29
    for value in values:
        counts[value] += 1
    return 29 * sum(c * (c - 1) for c in counts) / (n * (n - 1))


def read_lp2(path: Path) -> tuple[list[int], int]:
    text = path.read_text(encoding="utf-8")
    values = [INDEX[ch] for ch in text if ch in INDEX]
    if len(values) != 13136:
        raise ValueError(f"Expected 13,136 rune tokens; found {len(values)}")
    # Pages 0-55 are the 12,956 unsolved runes; the final 180 are p56-p57.
    return values[:12956], len(values)


def main() -> None:
    assert P * Q == N
    assert N.bit_length() == 432
    assert P.bit_length() == Q.bit_length() == 216
    assert len(str(N)) == 131

    phi_n = (P - 1) * (Q - 1)
    d = pow(E, -1, phi_n)
    assert (E * d) % phi_n == 1

    lp2, total_runes = read_lp2(
        Path("resources/liber-primus/lp2-transcription.txt")
    )

    keys = {
        "N": base29_digits(N),
        "p": base29_digits(P),
        "q": base29_digits(Q),
        "phiN": base29_digits(phi_n),
        "d_e65537": base29_digits(d),
    }

    results = []
    for name, key in keys.items():
        for sign in (-1, 1):
            for skip_f in (False, True):
                out = []
                key_pos = 0
                for cipher in lp2:
                    if skip_f and cipher == 0:
                        out.append(0)
                        continue
                    out.append((cipher + sign * key[key_pos % len(key)]) % 29)
                    key_pos += 1
                results.append({
                    "key": name,
                    "key_length": len(key),
                    "sign": sign,
                    "skip_ciphertext_f": skip_f,
                    "scaled_ioc": scaled_ioc(out),
                    "sample": "".join(ALPHABET[x] for x in out[:40]),
                })

    cookies = {}
    for label, hex_value in COOKIE_HEX.items():
        ciphertext = int(hex_value, 16)
        plaintext = pow(ciphertext, d, N)
        raw = plaintext.to_bytes((plaintext.bit_length() + 7) // 8, "big")
        cookies[label] = {
            "ciphertext_less_than_N": ciphertext < N,
            "decrypted_hex": format(plaintext, "x"),
            "decrypted_ascii": raw.decode("ascii", errors="replace"),
            "pkcs1_v15_type2_prefix": raw.startswith(b"\\x00\\x02"),
        }

    wrong_trailing_one = int(str(N) + "1")
    report = {
        "N_digits": len(str(N)),
        "N_bits": N.bit_length(),
        "factor_product_matches": P * Q == N,
        "factor_bits": [P.bit_length(), Q.bit_length()],
        "phi_bits": phi_n.bit_length(),
        "private_exponent_bits_if_e65537": d.bit_length(),
        "base29_key_lengths": {name: len(key) for name, key in keys.items()},
        "lp2_total_runes": total_runes,
        "lp2_unsolved_runes": len(lp2),
        "lp2_cipher_scaled_ioc": scaled_ioc(lp2),
        "stage2_modulus_digits": len(str(STAGE2_N)),
        "stage2_modulus_bits": STAGE2_N.bit_length(),
        "stage2_modulus_equal": STAGE2_N == N,
        "gcd_with_stage2_modulus": math.gcd(N, STAGE2_N),
        "extra_trailing_one_digits": len(str(wrong_trailing_one)),
        "extra_trailing_one_bits": wrong_trailing_one.bit_length(),
        "cookie_rsa_decryptions_if_e65537": cookies,
        "best_base29_key_screens": sorted(
            results, key=lambda x: x["scaled_ioc"], reverse=True
        )[:5],
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
