#!/usr/bin/env python3
"""Extract concatenated JPEG pages embedded in LP1 10.jpg.

Run from repository root:
    python sims/lp1_10_multi_jpeg_extract_sft.py
Optional:
    python sims/lp1_10_multi_jpeg_extract_sft.py --out /tmp/lp1-10-pages
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path


def jpeg_eoi_end(buf: bytes, start: int) -> int:
    """Return the end offset of one JPEG, parsing markers and entropy stuffing."""
    if buf[start:start + 2] != b"\xff\xd8":
        raise ValueError(f"no SOI at {start}")
    i = start + 2
    while i < len(buf):
        if buf[i] != 0xff:
            raise ValueError(f"expected marker at {i}")
        while i < len(buf) and buf[i] == 0xff:
            i += 1
        if i >= len(buf):
            raise ValueError("truncated marker")
        marker = buf[i]
        i += 1
        if marker == 0xd9:
            return i
        if marker == 0x01 or 0xd0 <= marker <= 0xd7:
            continue
        if i + 2 > len(buf):
            raise ValueError("truncated segment length")
        length = int.from_bytes(buf[i:i + 2], "big")
        if length < 2 or i + length > len(buf):
            raise ValueError(f"invalid FF{marker:02x} segment length at {i}")
        if marker != 0xda:
            i += length
            continue
        i += length
        while i < len(buf):
            if buf[i] != 0xff:
                i += 1
                continue
            j = i + 1
            while j < len(buf) and buf[j] == 0xff:
                j += 1
            if j >= len(buf):
                raise ValueError("truncated entropy marker")
            nxt = buf[j]
            if nxt == 0x00 or 0xd0 <= nxt <= 0xd7:
                i = j + 1
                continue
            if nxt == 0xd9:
                return j + 1
            break
    raise ValueError("EOI not found")


def dimensions(jpeg: bytes) -> tuple[int, int]:
    """Read width/height from a baseline/progressive JPEG SOF marker."""
    i = 2
    while i + 4 < len(jpeg):
        if jpeg[i] != 0xff:
            i += 1
            continue
        while i < len(jpeg) and jpeg[i] == 0xff:
            i += 1
        marker = jpeg[i]
        i += 1
        if marker in (0xd8, 0xd9, 0x01) or 0xd0 <= marker <= 0xd7:
            continue
        length = int.from_bytes(jpeg[i:i + 2], "big")
        if marker in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
            height = int.from_bytes(jpeg[i + 3:i + 5], "big")
            width = int.from_bytes(jpeg[i + 5:i + 7], "big")
            return width, height
        if marker == 0xda:
            break
        i += length
    raise ValueError("SOF dimensions not found")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, help="optional directory for extracted JPEGs")
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1] / "resources" / "liber-primus" / "10.jpg"
    raw = source.read_bytes()
    if hashlib.sha256(raw).hexdigest() != "12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376":
        raise SystemExit("10.jpg SHA-256 differs from the analyzed source")
    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
    pos = 0
    parts = []
    while pos < len(raw):
        if raw[pos:pos + 2] != b"\xff\xd8":
            raise SystemExit(f"non-JPEG bytes at offset {pos}; stop rather than guessing")
        end = jpeg_eoi_end(raw, pos)
        part = raw[pos:end]
        parts.append(part)
        w, h = dimensions(part)
        print(f"page{len(parts)}: start={pos} end={end} bytes={len(part)} dimensions={w}x{h} sha256={hashlib.sha256(part).hexdigest()}")
        if args.out:
            (args.out / f"10-part{len(parts)}.jpg").write_bytes(part)
        pos = end
    print(f"total: {len(parts)} concatenated JPEGs; {len(raw)} bytes; consumed={pos}")


if __name__ == "__main__":
    main()
