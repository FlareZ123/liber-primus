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

# Pinned source objects from neuroretransmit/cicada at this exact commit.
# The fourth residual is the object from which that README extracts 13.jpg.
ARCHIVE_COMMIT = "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3"
ARCHIVE_OBJECTS = [
    ("10.jpg", "bd270e45c58dfb6f0c50f9af60cf7104cf78e78e"),
    ("11.jpg", "d80bea5ec6aac4eee0eebeaaed31840cb24c029d"),
    ("12.jpg", "49253cf8e4c1cacda601c9507111f0c4bfe318b3"),
    ("10,11,12-trimmed.bin", "754a18ce2d0b2f8bcdd03e0a0e458e2bc4912a0a"),
]


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


def git_blob_sha1(data: bytes) -> str:
    """Git object ID for an exact byte sequence."""
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


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
        segment_number = len(parts)
        if segment_number > len(ARCHIVE_OBJECTS):
            raise SystemExit(f"unexpected extra JPEG segment {segment_number}")
        archive_object, expected_blob_sha1 = ARCHIVE_OBJECTS[segment_number - 1]
        actual_blob_sha1 = git_blob_sha1(part)
        if actual_blob_sha1 != expected_blob_sha1:
            raise SystemExit(
                f"segment {segment_number} does not match pinned archive object "
                f"{archive_object}: {actual_blob_sha1} != {expected_blob_sha1}"
            )
        standalone_match = "embedded-only segment"
        if segment_number >= 2:
            local_page_number = segment_number + 9
            standalone_path = source.parent / f"{local_page_number}.jpg"
            if not standalone_path.exists() or standalone_path.read_bytes() != part:
                raise SystemExit(
                    f"segment {segment_number} differs from local {local_page_number}.jpg"
                )
            standalone_match = f"{local_page_number}.jpg byte-identical"
        w, h = dimensions(part)
        print(
            f"page{segment_number}: start={pos} end={end} bytes={len(part)} "
            f"dimensions={w}x{h} archive_object={archive_object!r} "
            f"archive_commit={ARCHIVE_COMMIT} git_blob_sha1={actual_blob_sha1} "
            f"standalone={standalone_match} sha256={hashlib.sha256(part).hexdigest()}"
        )
        if args.out:
            (args.out / f"10-part{len(parts)}.jpg").write_bytes(part)
        pos = end
    if len(parts) != len(ARCHIVE_OBJECTS):
        raise SystemExit(f"expected four archived page objects, found {len(parts)}")
    print(f"total: {len(parts)} concatenated JPEGs; {len(raw)} bytes; consumed={pos}")


if __name__ == "__main__":
    main()
