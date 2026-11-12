#!/usr/bin/env python3
"""SFT: test direct lossless compression formats on original LP2 table bytes."""

import bz2
import gzip
import hashlib
import json
import lzma
from pathlib import Path
import zlib


ROOT = Path(__file__).resolve().parents[1]
GRID = ROOT / "resources" / "liber-primus" / "base60-grid.json"
EXPECTED_SHA256 = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"


def table_bytes():
    """Decode the canonical 32 by 8 printed table using its frozen base60 alphabet."""
    source = json.loads(GRID.read_text(encoding="utf-8"))
    alphabet = source["alphabet"]
    rows = source["rows"]
    assert len(alphabet) == 60 and len(set(alphabet)) == 60
    assert len(rows) == 32 and all(len(row) == 8 for row in rows)
    values = [60 * alphabet.index(cell[0]) + alphabet.index(cell[1])
              for row in rows for cell in row]
    assert len(values) == 256 and all(0 <= value < 256 for value in values)
    data = bytes(values)
    assert hashlib.sha256(data).hexdigest() == EXPECTED_SHA256
    return data


def deflate_raw(data):
    """Compress the positive control as a complete RFC 1951 raw DEFLATE stream."""
    compressor = zlib.compressobj(level=6, wbits=-zlib.MAX_WBITS)
    return compressor.compress(data) + compressor.flush()


def main():
    original = table_bytes()
    plant = b"LIBER PRIMUS 3301: THE PRIMES ARE SACRED. " * 16
    decoders = [
        ("bzip2", bz2.decompress, bz2.compress),
        ("gzip", gzip.decompress, gzip.compress),
        ("zlib", zlib.decompress, zlib.compress),
        ("raw-deflate", lambda data: zlib.decompress(data, -zlib.MAX_WBITS), deflate_raw),
        ("xz-or-lzma-container", lzma.decompress, lzma.compress),
    ]
    print("Original table: 256 octets, sha256=" + EXPECTED_SHA256)
    print("Source first 16 bytes: " + original[:16].hex())
    for name, decode, encode in decoders:
        assert decode(encode(plant)) == plant, "positive control failed: " + name
        try:
            output = decode(original)
        except (OSError, EOFError, zlib.error, lzma.LZMAError, ValueError) as error:
            print(f"{name}: INVALID ({type(error).__name__}: {error})")
        else:
            print(f"{name}: DECODED {len(output)} bytes: {output[:120]!r}")
            raise AssertionError("Unexpected valid compressed stream; reassess the report")
    print("PASS: 5/5 codec positives; 5/5 original direct compressed streams rejected")


if __name__ == "__main__":
    main()
