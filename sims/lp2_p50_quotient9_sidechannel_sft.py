"""Original LP2 grid: source-constrained modulo-29 quotient carrier screen.

Run: python sims/lp2_p50_quotient9_sidechannel_sft.py
Python standard library; read-only. Original bytes are never fitted or altered.
"""
from __future__ import annotations

import bz2
import gzip
import hashlib
import json
import lzma
from pathlib import Path
import zlib

SOURCE = Path(__file__).resolve().parents[1] / "resources/liber-primus/lp2-grid-256.json"
SHA = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
MAGIC = {"gzip": b"\x1f\x8b", "zip": b"PK\x03\x04", "pdf": b"%PDF", "png": b"\x89PNG",
         "xz": b"\xfd7zXZ", "bz2": b"BZh", "elf": b"\x7fELF", "pgp": b"-----BEGIN"}
LIMIT = 1_048_576


def base9_bytes(digits: list[int], width: int | None = None) -> bytes:
    value = 0
    for digit in digits:
        assert 0 <= digit <= 8
        value = 9 * value + digit
    if width is None:
        width = ((9 ** len(digits) - 1).bit_length() + 7) // 8
    return value.to_bytes(width, "big")


def packed(digits: list[int], group: int) -> bytes:
    assert len(digits) % group == 0
    width = ((9 ** group - 1).bit_length() + 7) // 8
    return b"".join(base9_bytes(digits[i:i + group], width) for i in range(0, len(digits), group))


def order(major: str, snake: bool, reverse: bool) -> list[int]:
    indexes = []
    for outer in range(32 if major == "rows" else 8):
        inner = list(range(8 if major == "rows" else 32))
        if snake and outer % 2:
            inner.reverse()
        for j in inner:
            r, c = (outer, j) if major == "rows" else (j, outer)
            indexes.append(8 * r + c)
    assert sorted(indexes) == list(range(256))
    return indexes[::-1] if reverse else indexes


def ascii_fraction(data: bytes) -> float:
    return sum(32 <= c <= 126 or c in (9, 10, 13) for c in data) / len(data)


def decompress_candidates(data: bytes) -> list[tuple[str, int, float]]:
    decoders = {
        "raw-deflate": lambda b: zlib.decompressobj(-15).decompress(b, LIMIT + 1),
        "zlib": lambda b: zlib.decompressobj(15).decompress(b, LIMIT + 1),
        "gzip": lambda b: zlib.decompressobj(31).decompress(b, LIMIT + 1),
        "bz2": lambda b: bz2.BZ2Decompressor().decompress(b, max_length=LIMIT + 1),
        "xz": lambda b: lzma.LZMADecompressor().decompress(b, max_length=LIMIT + 1),
    }
    outcomes = []
    for name, decode in decoders.items():
        try:
            output = decode(data)
        except (OSError, EOFError, ValueError, zlib.error, lzma.LZMAError):
            continue
        if 0 < len(output) <= LIMIT:
            outcomes.append((name, len(output), ascii_fraction(output)))
    return outcomes


def readouts(quotients: list[int]):
    for major in ("rows", "columns"):
        for snake in (False, True):
            for reverse in (False, True):
                tag = f"{major}/snake={int(snake)}/reverse={int(reverse)}"
                d = [quotients[i] for i in order(major, snake, reverse)]
                yield tag + "/integer-big", base9_bytes(d)
                yield tag + "/integer-little", base9_bytes(d[::-1])
                for group in (2, 4, 8):
                    yield tag + f"/pack{group}", packed(d, group)
    for bit_name, predicate in (
        ("bit0", lambda x: x & 1),
        ("bit1", lambda x: (x >> 1) & 1),
        ("bit2", lambda x: (x >> 2) & 1),
        ("bit3", lambda x: (x >> 3) & 1),
        ("ge4", lambda x: int(x >= 4)),
    ):
        for lsb in (False, True):
            out = bytearray()
            for row in range(32):
                bits = [predicate(quotients[8 * row + c]) for c in range(8)]
                if lsb:
                    bits.reverse()
                out.append(sum(bit << (7 - i) for i, bit in enumerate(bits)))
            yield f"{bit_name}/rowbits/lsb={int(lsb)}", bytes(out)


def positive_control() -> None:
    phrase = b"THE PATH THROUGH THE BOOK SHOULD REVEAL A REPRODUCIBLE PLAINTEXT. " * 4
    compressed = gzip.compress(phrase, mtime=0)
    assert len(compressed) < 102
    integer = int.from_bytes(compressed, "big")
    digits = [0] * 256
    for i in range(255, -1, -1):
        integer, digits[i] = divmod(integer, 9)
    assert integer == 0
    planted_bytes = bytes(d * 29 for d in digits)
    recovered = base9_bytes([b // 29 for b in planted_bytes]).lstrip(b"\x00")
    assert recovered == compressed and gzip.decompress(recovered) == phrase
    print(f"POSITIVE GZIP bytes={len(compressed)} digits=256 recovered_exactly=yes")


def main() -> None:
    values = json.loads(SOURCE.read_text(encoding="utf-8"))["bytes"]
    assert len(values) == 256 and all(type(x) is int and 0 <= x < 256 for x in values)
    assert hashlib.sha256(bytes(values)).hexdigest() == SHA
    q = [x // 29 for x in values]
    r = [x % 29 for x in values]
    assert all(x == 29 * hi + lo for x, hi, lo in zip(values, q, r))
    print("ORIGINAL source_sha256=" + SHA)
    print("QUOTIENT histogram=" + ",".join(str(q.count(i)) for i in range(9)))
    print("QUOTIENT 102-byte prefix=" + base9_bytes(q)[:16].hex())
    positive_control()

    count = signatures = meaningful = 0
    most_printable = (0.0, "")
    for tag, data in readouts(q):
        count += 1
        file_signatures = [name for name, magic in MAGIC.items() if data.startswith(magic)]
        signatures += len(file_signatures)
        inflations = decompress_candidates(data)
        meaningful += sum(length >= 64 and fraction >= 0.85 for _, length, fraction in inflations)
        fraction = ascii_fraction(data)
        if fraction > most_printable[0]:
            most_printable = (fraction, tag)
        print(f"READ {tag:49} bytes={len(data):3d} ascii={fraction:.4f}"
              f" signature={file_signatures or '-'} inflation={inflations or '-'}"
              f" prefix={data[:8].hex()}")
    assert count == 50
    print(f"ORIGINAL SUMMARY readouts={count} file_signatures={signatures}"
          f" readable_decompressions={meaningful} max_ascii={most_printable[0]:.4f}"
          f" max_ascii_mode={most_printable[1]}")
    assert signatures == 0 and meaningful == 0


if __name__ == "__main__":
    main()
