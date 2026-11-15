#!/usr/bin/env python3
"""Derive a source-constrained OpenPuff A/B/C password triple from the 2014 squares.

The three published square matrices are peeled by one cell on every side.
Each remaining cell n is mapped to phi(n) mod 29, then through the canonical
Gematria Primus transliteration. The resulting ASCII strings are suitable for
OpenPuff's 8..32-character password fields.
"""
from __future__ import annotations

import argparse
import json
from itertools import combinations
from pathlib import Path


def totient(n: int) -> int:
    result = n
    p = 2
    x = n
    while p * p <= x:
        if x % p == 0:
            while x % p == 0:
                x //= p
            result -= result // p
        p += 1
    if x > 1:
        result -= result // x
    return result


def bit_hamming(a: str, b: str, pad: bool) -> dict:
    aa, bb = a.encode("ascii"), b.encode("ascii")
    if pad:
        width = max(len(aa), len(bb))
        aa, bb = aa.ljust(width, b"\0"), bb.ljust(width, b"\0")
    else:
        width = min(len(aa), len(bb))
        aa, bb = aa[:width], bb[:width]
    differing = sum((x ^ y).bit_count() for x, y in zip(aa, bb))
    total = 8 * width
    return {
        "differing_bits": differing,
        "compared_bits": total,
        "fraction": differing / total if total else 0.0,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--squares", default="resources/cicada2014-openpuff-magic-squares.txt")
    parser.add_argument("--corpus", default="resources/liber-primus/lp2-corpus.json")
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    rows = [
        [int(token) for token in line.split()]
        for line in Path(args.squares).read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    expected_shapes = [5] * 5 + [7] * 7 + [5] * 5
    if len(rows) != 17 or [len(row) for row in rows] != expected_shapes:
        raise SystemExit("Expected the published 5x5, 7x7, 5x5 square sequence")
    squares = [rows[:5], rows[5:12], rows[12:17]]
    expected_magic = [3301, 1033, 1033]
    for index, (square, magic) in enumerate(zip(squares, expected_magic), start=1):
        if any(sum(row) != magic for row in square):
            raise SystemExit(f"Square {index} does not have its source magic constant")
        if any(sum(square[r][c] for r in range(len(square))) != magic
               for c in range(len(square))):
            raise SystemExit(f"Square {index} column sums do not match")
        if sum(square[i][i] for i in range(len(square))) != magic:
            raise SystemExit(f"Square {index} main diagonal does not match")
        if sum(square[i][len(square) - 1 - i] for i in range(len(square))) != magic:
            raise SystemExit(f"Square {index} anti-diagonal does not match")

    corpus = json.loads(Path(args.corpus).read_text(encoding="utf-8"))
    alphabet = corpus["translit"]
    if len(alphabet) != 29:
        raise SystemExit("Canonical GP transliteration must have 29 entries")

    labels = ["A", "B", "C"]
    derived = []
    for label, square in zip(labels, squares):
        core = [row[1:-1] for row in square[1:-1]]
        values = [totient(n) % 29 for row in core for n in row]
        tokens = [alphabet[value] for value in values]
        password = "".join(tokens)
        if not 8 <= len(password) <= 32:
            raise SystemExit(f"Password {label} violates OpenPuff's 8..32 length constraint")
        if not password.isascii():
            raise SystemExit(f"Password {label} is not ASCII")
        derived.append({
            "field": label,
            "source_square_shape": f"{len(square)}x{len(square)}",
            "source_magic_constant": expected_magic[labels.index(label)],
            "peeled_core_shape": f"{len(core)}x{len(core)}",
            "core_values_row_major": [n for row in core for n in row],
            "phi_mod29_row_major": values,
            "gp_transliteration_tokens": tokens,
            "password": password,
            "rune_count": len(values),
            "ascii_character_count": len(password),
        })

    distances = {}
    for left, right in combinations(derived, 2):
        pair = f'{left["field"]}-{right["field"]}'
        distances[pair] = {
            "zero_padded": bit_hamming(left["password"], right["password"], True),
            "common_prefix": bit_hamming(left["password"], right["password"], False),
        }
    min_padded = min(v["zero_padded"]["fraction"] for v in distances.values())
    if min_padded < 0.25:
        raise SystemExit("Derived passwords fail the conservative zero-padded 25% Hamming gate")

    result = {
        "status": "derived-source-constrained-candidate",
        "derivation": [
            "Read the three 2014 OpenPuff-recovered magic squares in published order (5x5, 7x7, 5x5).",
            "Apply the p57 circumference instruction uniformly: remove the outer one-cell ring from each square.",
            "Apply the LP1 Wisdom/totient operation cellwise: phi(n) mod 29.",
            "Encode residues using the canonical 29-entry GP transliteration in row-major order.",
            "Assign the three resulting ASCII strings to OpenPuff A, B, C in square order.",
        ],
        "passwords": {item["field"]: item["password"] for item in derived},
        "fields": derived,
        "pairwise_ascii_bit_hamming": distances,
        "minimum_zero_padded_hamming_fraction": min_padded,
        "note": "The native OpenPuff GUI password-status control remains authoritative; this script only checks source derivation, length, ASCII, and a conservative input-bit distance proxy.",
    }
    output = json.dumps(result, indent=2, ensure_ascii=True) + "\n"
    if args.out:
        target = Path(args.out)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(output, encoding="utf-8")
    print(output, end="")


if __name__ == "__main__":
    main()
