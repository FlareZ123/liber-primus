#!/usr/bin/env python3
"""Exact historical 2013 XOR operator on the 2014 physical p49–51 byte table.

Cicada's 2013 original XOR challenges publicly selected the raw _560.00 byte0
and 560.17 byte offsets 617, 33461 and 77977. Here the input at each original
byte coordinate is XORed with the printed LP2 32x8 base60 table (row-major).
The historical operation and offsets are fixed; no fitted key or transport.
"""
from __future__ import annotations

import argparse
import binascii
import hashlib
import json
import math
import os
from pathlib import Path
import zlib

from filelock import FileLock

from lp2_2013_binary_pad_prf_seed_gate import load_pads

ROOT = Path(__file__).resolve().parents[1]
OFFSETS = (("_560.00", 0), ("560.17", 617), ("560.17", 33461),
           ("560.17", 77977))
MAGIC = {
    "gzip": bytes.fromhex("1f8b08"),
    "bzip2": b"BZh",
    "xz": bytes.fromhex("fd377a585a00"),
    "zip": bytes.fromhex("504b0304"),
    "pdf": b"%PDF",
    "png": bytes.fromhex("89504e470d0a1a0a"),
    "gif": b"GIF8",
    "elf": bytes.fromhex("7f454c46"),
}


def properties(data: bytes) -> dict:
    counts = [data.count(bytes((i,))) for i in range(256)]
    entropy = -sum((n / len(data)) * math.log2(n / len(data))
                   for n in counts if n)
    printable = sum(32 <= b <= 126 or b in (9, 10, 13) for b in data)
    pgp_packet_bit = bool(data[0] & 0x80)
    try:
        decomp = zlib.decompress(data)
        zlib_result = {"valid": True, "length": len(decomp),
                       "start_hex": decomp[:32].hex()}
    except zlib.error:
        zlib_result = {"valid": False}
    return {
        "sha256": hashlib.sha256(data).hexdigest(),
        "first_32_hex": data[:32].hex(),
        "byte_entropy": entropy,
        "printable_ascii": printable,
        "utf8_decodable": is_utf8(data),
        "matches_magic": [name for name, prefix in MAGIC.items() if data.startswith(prefix)],
        "openpgp_packet_possible_byte0": pgp_packet_bit,
        "zlib_header_decompress": zlib_result,
    }


def is_utf8(raw: bytes) -> bool:
    try:
        raw.decode("utf-8")
        return True
    except UnicodeDecodeError:
        return False


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--pad-dir", required=True, type=Path)
    p.add_argument("--output", required=True, type=Path)
    args = p.parse_args()
    pads = load_pads(args.pad_dir)
    data = json.loads((ROOT / "resources/liber-primus/lp2-grid-256.json").read_text())
    table = bytes(data["bytes"])
    if len(table) != 256:
        raise AssertionError("Original grid transcription must contain exactly 256 bytes")
    rows = []
    for name, offset in OFFSETS:
        source = pads[name][offset:offset + len(table)]
        assert len(source) == len(table)
        decoded = bytes(a ^ b for a, b in zip(table, source))
        assert bytes(b ^ s for b, s in zip(decoded, source)) == table
        rows.append({"file": name, "byte_offset": offset,
                     "decoded": properties(decoded)})
    report = {
        "hypothesis": "Author-used 2013 XOR byte operation with author-selected source offsets on the 2014 256-cell printed table",
        "table": "resources/liber-primus/lp2-grid-256.json; row-major, byte=60*a+b",
        "table_sha256": hashlib.sha256(table).hexdigest(),
        "source_bytes": {k: hashlib.sha256(v).hexdigest() for k, v in pads.items()},
        "source_offsets": list(OFFSETS),
        "tests": rows,
        "interpretation": "Direct source-byte XOR only; no additional key schedule or byte offset fitting",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(args.output) + ".lock"):
        temp = args.output.with_suffix(".json.tmp")
        temp.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        os.replace(temp, args.output)
    print("SOURCE_AUTHORED_XOR_TABLE " + json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
