#!/usr/bin/env python3
"""Reproduce the 2013 pklmx phone-XOR and SSSS continuation.

The XOR stage is checked against the extracted-byte column preserved by the
participant solver archive. If the original ISO's DATA directory is available,
pass it with --iso-dir to additionally verify each raw file slice.

The SSSS implementation follows the relevant ssss 0.5 algorithm; share IDs are decimal because its parser uses atoi():
- dynamic security level from the 22-byte ASCII secret (176 bits);
- GF(2^176), polynomial x^176 + x^11 + x^3 + x^2 + 1;
- monic degree-threshold polynomial (ssss removes x**threshold on combine);
- default diffusion layer (40 passes of sliding 64-bit XTEA blocks).

Source pins are documented in im-results/pklmx-2013-onion-continuation-gate.md.
No third-party code is imported.
"""

from __future__ import annotations

import argparse
from itertools import combinations
from pathlib import Path
from typing import Iterable

SECRET = b"p7amjopgric7dfdi.onion"
FIELD_BITS = 176
FIELD_POLY = (1 << 176) | (1 << 11) | (1 << 3) | (1 << 2) | 1
SHARE_THRESHOLD = 5
WORD_BYTES = 2
MASK32 = 0xFFFFFFFF
XTEA_DELTA = 0x9E3779B9
XTEA_SUM_32 = 0xC6EF3720

# dataset, byte offset, phone-provided hex, extracted ISO bytes, expected onion
XOR_ROWS = [
    ("Dallas", "560.17", 0x82B5,
     "f6a2d0a48e1b1ae40cbd454f77baa7d2557683d0cd4998",
     "8f90a7ddfb6d68957edc2a3816ddc4e77b19edb9a22792",
     "y2wyuvrqraowagc5.onion"),
    ("Okinawa", "560.13", 0x93E5,
     "f286b8438cb85eb191ec7bf10a28a54ec06f9a27eb91c5",
     "85fccf2eefcf33c2fad918933d4fcf20ee00f44e84ffcf",
     "wzwmcwmsk5cb7gjn.onion"),
    ("Moscow", "560.13", 0x10F447,
     "c657b2707c4266fda4af4a83acf19cc46e69540c0bc5da",
     "b720851d14210e87d2da3bb5cac3f1a240063a6564abd0",
     "qw7mhchzvuq6f2mf.onion"),
    ("Little Rock", "560.13", 0x3607,
     "5edb5e8029dd2182560da925ec6cd3e1257efc0b8328b4",
     "6ab768f540ad4ff1226fce429b06aa970b119262ec46be",
     "4l6uipnstbggwjyv.onion"),
    ("Annapolis", "560.17", 0x13099,
     "d5a6cb76e55a2166bd6a4d078857ec1f68ea6afa9738",
     "b0d4bc1086294510c55c3d6aba259f7446850493f856",
     "erwfcsdvx6pm2rsk.onion"),
    ("Portland", "560.13", 0x3215,
     "28c07e1b102d4d5c4c1a376e064477e1416fcc94928765",
     "4fa20773275723317a79000b7c371a936f00a2fdfde96f",
     "gbyh7znm6c7ezsmr.onion"),
    ("Columbus", "560.17", 0x0269,
     "d4b10626d65995e8fb010f4388787d56433f90c6df8d8d",
     "b8dd3347b020e68399377975ef4f1a376d50feafb0e387",
     "ll5afyskb6v6g7ga.onion"),
]

# Seven of the ten decimal-indexed shares in the community table. The ssss
# 0.5 parser uses atoi(), so share ID "10" means decimal ten, not hex 0x10.
SHARES = [
    ("02", "41cc481a51fe77f91600f593c1db2ce9babd2626ea6e"),
    ("03", "7678a5f6b72042d839151b34b02ffe161cf997fed484"),
    ("05", "fcd82965b6632ea25d80edc3e58baafb4b2938895cbd"),
    ("07", "f3adb3aacb0b4336fa28178bc1e5edce940c16ce5caa"),
    ("08", "b970e507dbc4ac115a273126f62671654c480fce32e5"),
    ("09", "82a98a7fe06014f783b752506cf6cd1fabaa3d8b3750"),
    ("10", "1668a611ba9fccddee2a0d8fd7e05df4d01c6d42a26d"),
]

# The archived shares.txt contains this order: it omits 07 and appends 10.
SHARES_TXT_ORDER = ["02", "03", "05", "08", "09", "10"]

# Two conflicting Annapolis transcriptions in the neuroretransmit archive.
# The README table is odd-length hex; all.txt shifts a nibble and appends 0.
ANNAPOLIS_README_HEX = "d5a6cb76e55a2166bd6a4d78857ec1f68ea6afa9738"
ANNAPOLIS_ALL_TXT_HEX = "d5a6cb76e55a2166bd6a4d78857ec1f68ea6afa97380"

# Gematria Primus prime values used to convert poster letter pairs into IVR
# digits. The independent worked call example gives L=73, M=71 -> 7371.
GP_PRIME = {
    "F": 2, "U": 3, "TH": 5, "O": 7, "R": 11, "C": 13, "G": 17,
    "W": 19, "H": 23, "N": 29, "I": 31, "J": 37, "EO": 41, "P": 43,
    "X": 47, "S": 53, "T": 59, "B": 61, "E": 67, "M": 71, "L": 73,
    "NG": 79, "OE": 83, "D": 89, "A": 97, "AE": 101, "Y": 103,
    "IA": 107, "EA": 109,
}
POSTER_ACCESS_CODES = {
    "Dallas": ("JD", "3789"),
    "Okinawa": ("YF", "1032"),
    "Moscow": ("CR", "1311"),
    "Little Rock": ("LM", "7167"),  # archive transcription; worked call says 7371
    "Annapolis": ("PX", "4347"),
    "Portland": ("GH", "1723"),
    "Columbus": ("NR", "2911"),
}


def gf_mul(a: int, b: int) -> int:
    """Multiply in GF(2^176) using the pinned ssss irreducible polynomial."""
    z = 0
    if b & 1:
        z = a
    for i in range(1, FIELD_BITS):
        a <<= 1
        if (a >> FIELD_BITS) & 1:
            a ^= FIELD_POLY
        if (b >> i) & 1:
            z ^= a
    return z


def gf_pow(a: int, exponent: int) -> int:
    result = 1
    while exponent:
        if exponent & 1:
            result = gf_mul(result, a)
        a = gf_mul(a, a)
        exponent >>= 1
    return result


def gf_inv(a: int) -> int:
    if a == 0:
        raise ZeroDivisionError("zero has no multiplicative inverse")
    return gf_pow(a, (1 << FIELD_BITS) - 2)


def xtea_decrypt(v0: int, v1: int) -> tuple[int, int]:
    total = XTEA_SUM_32
    for _ in range(32):
        v1 = (v1 - (((((v0 << 4) & MASK32) ^ (v0 >> 5)) + v0) ^ total)) & MASK32
        total = (total - XTEA_DELTA) & MASK32
        v0 = (v0 - (((((v1 << 4) & MASK32) ^ (v1 >> 5)) + v1) ^ total)) & MASK32
    return v0, v1


def mpz_export_words(x: int, nbytes: int) -> bytearray:
    """Match mpz_export(order=-1, size=2, endian=1, nails=0)."""
    big_endian = x.to_bytes(nbytes, "big")
    return bytearray(
        b"".join(big_endian[i:i + WORD_BYTES]
                 for i in range(nbytes - WORD_BYTES, -1, -WORD_BYTES))
    )


def mpz_import_words(words: bytes | bytearray) -> int:
    """Inverse of mpz_export_words."""
    big_endian = b"".join(
        bytes(words[i:i + WORD_BYTES])
        for i in range(len(words) - WORD_BYTES, -1, -WORD_BYTES)
    )
    return int.from_bytes(big_endian, "big")


def decode_diffusion(encoded: int) -> int:
    """Reverse ssss 0.2+ diffusion: 40*len sliding XTEA decryptions."""
    words = mpz_export_words(encoded, FIELD_BITS // 8)
    n = len(words)
    for idx in range(40 * n - 2, -1, -2):
        left = bytes(words[(idx + k) % n] for k in range(4))
        right = bytes(words[(idx + 4 + k) % n] for k in range(4))
        v0, v1 = xtea_decrypt(
            int.from_bytes(left, "big"),
            int.from_bytes(right, "big"),
        )
        left_out = v0.to_bytes(4, "big")
        right_out = v1.to_bytes(4, "big")
        for k in range(4):
            words[(idx + k) % n] = left_out[k]
            words[(idx + 4 + k) % n] = right_out[k]
    return mpz_import_words(words)


def combine_ssss(points: Iterable[tuple[str, str]]) -> bytes:
    """Combine exactly five ssss shares, matching the ssss 0.5 algorithm."""
    points = list(points)
    if len(points) != SHARE_THRESHOLD:
        raise ValueError(f"expected exactly {SHARE_THRESHOLD} shares")
    if len({share_id for share_id, _ in points}) != SHARE_THRESHOLD:
        raise ValueError("share IDs must be unique")

    adjusted = []
    for share_id, share_hex in points:
        x = int(share_id, 10)
        y = int(share_hex, 16)
        # ssss uses a monic degree-t polynomial; remove its known x**t term.
        y ^= gf_pow(x, SHARE_THRESHOLD)
        adjusted.append((x, y))

    secret_encoded = 0
    for i, (xi, yi) in enumerate(adjusted):
        numerator = 1
        denominator = 1
        for j, (xj, _) in enumerate(adjusted):
            if i == j:
                continue
            # In characteristic 2, (0 - xj) == xj.
            numerator = gf_mul(numerator, xj)
            denominator = gf_mul(denominator, xi ^ xj)
        basis_at_zero = gf_mul(numerator, gf_inv(denominator))
        secret_encoded ^= gf_mul(yi, basis_at_zero)

    secret_integer = decode_diffusion(secret_encoded)
    return secret_integer.to_bytes(FIELD_BITS // 8, "big")


def reproduce_access_codes() -> list[tuple[str, str, str]]:
    results = []
    for location, (letters, archived_digits) in POSTER_ACCESS_CODES.items():
        derived = "".join(str(GP_PRIME[letter]) for letter in letters)
        results.append((location, archived_digits, derived))
    return results


def reproduce_xor(iso_dir: Path | None) -> list[tuple[str, str]]:
    outputs = []
    for location, dataset, offset, data_hex, extracted_hex, expected in XOR_ROWS:
        data = bytes.fromhex(data_hex)
        extracted = bytes.fromhex(extracted_hex)
        if len(data) != len(extracted):
            raise AssertionError(f"{location}: data/extracted length mismatch")
        if iso_dir is not None:
            raw = (iso_dir / dataset).read_bytes()
            raw_slice = raw[offset:offset + len(data)]
            if raw_slice != extracted:
                raise AssertionError(f"{location}: ISO slice mismatch")
        result = bytes(a ^ b for a, b in zip(data, extracted)).strip()
        actual = result.decode("ascii")
        if actual != expected:
            raise AssertionError(f"{location}: got {actual!r}, expected {expected!r}")
        outputs.append((location, actual))
    return outputs


def reproduce_shamir() -> tuple[list[tuple[str, ...]], list[tuple[str, ...]]]:
    by_id = dict(SHARES)
    observed_ids = [sid for sid, _ in SHARES]
    valid_subsets = []
    invalid_subsets = []
    for subset in combinations(observed_ids, SHARE_THRESHOLD):
        points = [(sid, by_id[sid]) for sid in subset]
        if combine_ssss(points) == SECRET:
            valid_subsets.append(subset)
        else:
            invalid_subsets.append(subset)

    if len(valid_subsets) != 21 or invalid_subsets:
        raise AssertionError(
            f"expected all 21 observed five-share subsets to match; "
            f"valid={len(valid_subsets)}, invalid={invalid_subsets}"
        )

    # The five shares used by Connor Tumbleson's independent walkthrough.
    published_example = ["05", "07", "09", "03", "02"]
    if combine_ssss([(sid, by_id[sid]) for sid in published_example]) != SECRET:
        raise AssertionError("published five-share example did not reconstruct")

    # The archived shares.txt first five lines reconstruct; its sixth line is
    # not consumed by ssss-combine -t 5, although share 10 is itself consistent.
    first_five = SHARES_TXT_ORDER[:SHARE_THRESHOLD]
    if combine_ssss([(sid, by_id[sid]) for sid in first_five]) != SECRET:
        raise AssertionError("shares.txt first five lines did not reconstruct")

    if combine_ssss([(sid, by_id[sid]) for sid in ["02", "03", "05", "07", "10"]]) != SECRET:
        raise AssertionError("decimal share 10 did not reconstruct")

    return valid_subsets, invalid_subsets


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--iso-dir",
        type=Path,
        help="optional directory containing the original DATA/560.13 and DATA/560.17 files",
    )
    args = parser.parse_args()

    print("Gematria Primus phone access codes:")
    for location, archived_digits, derived in reproduce_access_codes():
        note = " (archive mismatch)" if archived_digits != derived else ""
        print(f"  {location:12s} -> {derived} [archive: {archived_digits}]{note}")

    outputs = reproduce_xor(args.iso_dir)
    print("Phone-data XORs:")
    for location, onion in outputs:
        print(f"  {location:12s} -> {onion}")
    if args.iso_dir is None:
        print("  Raw ISO slices NOT checked: using the archived Extracted-byte column.")

    # Explicitly expose the Annapolis transcription discrepancy.
    try:
        bytes.fromhex(ANNAPOLIS_README_HEX)
    except ValueError:
        print("Annapolis README table: malformed odd-length hex (43 nibbles).")
    wrong = bytes.fromhex(ANNAPOLIS_ALL_TXT_HEX)
    extracted = bytes.fromhex(XOR_ROWS[4][4])
    wrong_output = bytes(a ^ b for a, b in zip(wrong, extracted)).strip()
    print(f"Annapolis all.txt transcription XORs to non-onion bytes: {wrong_output!r}")

    good, bad = reproduce_shamir()
    print(f"SSSS threshold: {SHARE_THRESHOLD}; field: GF(2^{FIELD_BITS})")
    print(f"SSSS result: {SECRET.decode('ascii')}")
    print(f"Five-share subsets from all seven observed decimal IDs: {len(good)}/21 match.")
    print("All seven observed shares, including signed share 10, are mutually consistent.")
    print("Three of the ten shares described by the historical walkthrough are absent from this archive.")
    print("All checks passed.")


if __name__ == "__main__":
    main()
