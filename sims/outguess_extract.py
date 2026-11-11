#!/usr/bin/env python3
"""Source-faithful OutGuess 0.4 JPEG retrieval probe.

Requires a C compiler and libjpeg development headers/library. The companion
outguess_bitmap_dump.c reproduces the JPEG coefficient bitmap; this file
implements the OutGuess ARC4/iterator retrieval path.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import pathlib
import re
import shutil
import subprocess
import tempfile
from collections import Counter


def arc4_initkey(kind: bytes, key: bytes) -> dict:
    digest = hashlib.md5(kind + key).digest()
    state = list(range(256))
    i = 0
    j = 0
    i = (i - 1) & 0xFF
    for n in range(256):
        i = (i + 1) & 0xFF
        si = state[i]
        j = (j + si + digest[n % len(digest)]) & 0xFF
        state[i], state[j] = state[j], si
    return {"s": state, "i": i, "j": j}


def arc4_getbyte(stream: dict) -> int:
    state = stream["s"]
    i = (stream["i"] + 1) & 0xFF
    si = state[i]
    j = (stream["j"] + si) & 0xFF
    sj = state[j]
    state[i], state[j] = sj, si
    stream["i"], stream["j"] = i, j
    return state[(si + sj) & 0xFF]


def arc4_getword(stream: dict) -> int:
    return (
        (arc4_getbyte(stream) << 24)
        | (arc4_getbyte(stream) << 16)
        | (arc4_getbyte(stream) << 8)
        | arc4_getbyte(stream)
    )


def arc4_addrandom(stream: dict, data: bytes) -> None:
    state = stream["s"]
    i = (stream["i"] - 1) & 0xFF
    j = stream["j"]
    for n in range(256):
        i = (i + 1) & 0xFF
        si = state[i]
        j = (j + si + data[n % len(data)]) & 0xFF
        state[i], state[j] = state[j], si
    stream["i"], stream["j"] = i, j


def build_bitmap(image: pathlib.Path) -> tuple[bytes, int]:
    compiler = shutil.which("cc") or shutil.which("gcc")
    if not compiler:
        raise RuntimeError("A C compiler (cc or gcc) is required")
    source = pathlib.Path(__file__).with_name("outguess_bitmap_dump.c")
    if not source.is_file():
        raise RuntimeError(f"Missing companion source: {source}")
    with tempfile.TemporaryDirectory(prefix="outguess-bitmap-") as tmp:
        binary = pathlib.Path(tmp) / "outguess_bitmap_dump"
        subprocess.run(
            [compiler, "-O2", "-o", str(binary), str(source), "-ljpeg"],
            check=True,
            capture_output=True,
            text=True,
        )
        proc = subprocess.run(
            [str(binary), str(image)],
            check=True,
            capture_output=True,
        )
    match = re.search(rb"eligible_coefficients=(\d+) bitmap_bytes=(\d+)", proc.stderr)
    if not match:
        raise RuntimeError(f"Could not parse bitmap count: {proc.stderr!r}")
    bit_count = int(match.group(1))
    expected_bytes = int(match.group(2))
    if len(proc.stdout) != expected_bytes:
        raise RuntimeError(
            f"Bitmap byte count mismatch: {len(proc.stdout)} != {expected_bytes}"
        )
    return proc.stdout, bit_count


def extract(bitmap: bytes, bit_count: int, password: str) -> tuple[bytes, dict]:
    key = password.encode("utf-8")
    iterator_stream = arc4_initkey(b"Seeding", key)
    skipmod = 32
    offset = arc4_getword(iterator_stream) % skipmod

    def next_offset() -> int:
        nonlocal offset
        offset += (arc4_getword(iterator_stream) % skipmod) + 1
        if offset >= bit_count:
            raise ValueError(
                f"OutGuess iterator overrun: {offset} >= {bit_count}"
            )
        return offset

    def retrieve_byte() -> int:
        nonlocal offset
        value = 0
        for shift in range(8):
            value |= ((bitmap[offset >> 3] >> (offset & 7)) & 1) << shift
            next_offset()
        return value

    encrypted_header = bytes(retrieve_byte() for _ in range(4))
    encryption_stream = arc4_initkey(b"Encryption", key)
    header = bytes(
        value ^ arc4_getbyte(encryption_stream) for value in encrypted_header
    )
    seed = header[0] | (header[1] << 8)
    length = header[2] | (header[3] << 8)
    if length <= 0:
        raise ValueError(f"Invalid zero-length OutGuess header: {header.hex()}")
    if length > len(bitmap):
        raise ValueError(
            f"OutGuess length exceeds bitmap: {length} > {len(bitmap)}"
        )

    arc4_addrandom(iterator_stream, seed.to_bytes(2, "little"))
    encrypted_payload = bytearray()
    for remaining in range(length, 0, -1):
        available = bit_count - offset
        quotient = bit_count // 32
        adjustment = (
            2.0
            if available > quotient
            else 2.0 - (quotient - available) / float(quotient)
        )
        skipmod = int(adjustment * available / (8 * remaining))
        if skipmod <= 0:
            raise ValueError("OutGuess iterator adapted to zero skip modulus")
        encrypted_payload.append(retrieve_byte())

    payload_stream = arc4_initkey(b"Encryption", key)
    payload = bytes(
        value ^ arc4_getbyte(payload_stream) for value in encrypted_payload
    )
    tail = payload[4:]
    metadata = {
        "header_hex": header.hex(),
        "seed": seed,
        "length": length,
        "end_bit_offset": offset,
        "payload_sha256": hashlib.sha256(payload).hexdigest(),
        "entropy_bits_per_byte": entropy(payload),
        "printable_fraction": sum(
            32 <= value < 127 or value in (9, 10, 13) for value in payload
        ) / len(payload),
        "payload_tail_entropy_bits_per_byte": entropy(tail) if tail else 0.0,
        "payload_tail_printable_fraction": (
            sum(32 <= value < 127 or value in (9, 10, 13) for value in tail) / len(tail)
            if tail else 0.0
        ),
        "possible_openpgp_header_byte": bool(payload) and (payload[0] >> 6) in (2, 3),
        "prefix_hex": payload[:32].hex(),
        "magic": detect_magic(payload),
    }
    return payload, metadata


def entropy(data: bytes) -> float:
    counts = Counter(data)
    return -sum(
        (count / len(data)) * math.log2(count / len(data))
        for count in counts.values()
    )


def detect_magic(data: bytes) -> list[str]:
    tests = {
        "gzip": data.startswith(b"\x1f\x8b"),
        "zlib": data[:2] in (b"\x78\x01", b"\x78\x9c", b"\x78\xda"),
        "zip": data.startswith(b"PK\x03\x04"),
        "pdf": data.startswith(b"%PDF-"),
        "png": data.startswith(b"\x89PNG\r\n\x1a\n"),
        "jpeg": data.startswith(b"\xff\xd8\xff"),
        "sqlite": data.startswith(b"SQLite format 3"),
        "elf": data.startswith(b"\x7fELF"),
    }
    return [name for name, present in tests.items() if present]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=pathlib.Path)
    parser.add_argument("password")
    parser.add_argument("--output", type=pathlib.Path)
    parser.add_argument("--expect-sha256")
    args = parser.parse_args()

    bitmap, bit_count = build_bitmap(args.image)
    payload, metadata = extract(bitmap, bit_count, args.password)
    metadata.update(
        {
            "image": str(args.image),
            "password": args.password,
            "bitmap_bits": bit_count,
            "bitmap_bytes": len(bitmap),
        }
    )
    if args.output:
        args.output.write_bytes(payload)
        metadata["output"] = str(args.output)
    if args.expect_sha256 and metadata["payload_sha256"] != args.expect_sha256:
        print(json.dumps(metadata, indent=2, sort_keys=True))
        raise SystemExit("SHA-256 did not match expected control")
    print(json.dumps(metadata, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
