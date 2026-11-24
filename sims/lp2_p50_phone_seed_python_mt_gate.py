#!/usr/bin/env python3
"""Test the exact 2012 Cicada phone number as a direct Python-MT seed for p50.

Run from the repository root with Python 3.11+:
    python sims/lp2_p50_phone_seed_python_mt_gate.py

This is a fixed, source-derived seed hypothesis, not a seed search.
"""
from __future__ import annotations

from hashlib import sha256
from json import dumps, loads
from pathlib import Path
from random import Random

SOURCE = Path("resources/liber-primus/lp2-grid-256.json")
SOURCE_SHA256 = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
PHONE_SEED = 2143909608
METHODS = ("bits8", "randrange256", "float256")


def draw(rng: Random, method: str) -> int:
    if method == "bits8":
        return rng.getrandbits(8)
    if method == "randrange256":
        return rng.randrange(256)
    if method == "float256":
        return int(rng.random() * 256)
    raise ValueError(method)


def produce(seed: int, method: str, size: int = 256) -> bytes:
    rng = Random(seed)
    return bytes(draw(rng, method) for _ in range(size))


def prefix_length(a: bytes, b: bytes) -> int:
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y:
            return i
    return min(len(a), len(b))


def main() -> None:
    obj = loads(SOURCE.read_text(encoding="utf-8"))
    rows = [
        page["bytes"][8 * j:8 * (j + 1)]
        for page in obj["pages"]
        for j in range(page["rows"])
    ]
    assert len(rows) == 32 and all(len(row) == 8 for row in rows)
    row_major = bytes(x for row in rows for x in row)
    column_major = bytes(rows[r][c] for c in range(8) for r in range(32))
    assert len(row_major) == len(column_major) == 256
    assert sha256(row_major).hexdigest() == SOURCE_SHA256
    assert row_major[:8] == bytes.fromhex("cb e7 a7 ba 61 ed 7e b7")
    assert column_major[:8] == bytes.fromhex("cb 5c 79 6d 73 50 fd fe")
    assert 0 <= PHONE_SEED <= 2**31 - 1

    results = []
    for method in METHODS:
        generated = produce(PHONE_SEED, method)
        assert len(generated) == 256
        assert generated == produce(PHONE_SEED, method), "determinism positive control failed"
        for layout, target in (
            ("row-major", row_major),
            ("column-major", column_major),
        ):
            result = {
                "seed_decimal": PHONE_SEED,
                "seed_hex": hex(PHONE_SEED),
                "method": method,
                "layout": layout,
                "prefix_bytes_matching": prefix_length(generated, target),
                "matching_positions_of_256": sum(a == b for a, b in zip(generated, target)),
                "source_first8": target[:8].hex(" "),
                "generated_first8": generated[:8].hex(" "),
                "full_256_match": generated == target,
            }
            results.append(result)
            print(dumps(result, sort_keys=True))

    print(dumps({
        "source_sha256": SOURCE_SHA256,
        "source_geometry": "32x8 = 256 bytes",
        "phone_seed": PHONE_SEED,
        "signed_32bit_margin": 2**31 - 1 - PHONE_SEED,
        "methods": list(METHODS),
        "tests": len(results),
        "any_eight_byte_prefix": any(r["prefix_bytes_matching"] >= 8 for r in results),
        "any_full_match": any(r["full_256_match"] for r in results),
    }, sort_keys=True))


if __name__ == "__main__":
    main()
