#!/usr/bin/env python3
"""Reproduce the LP1 p05 reversed-JPEG / 5x5-1033 extraction."""
from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"
SOURCE = IMAGE_DIR / "05.jpg"
EXPECTED = [
    [272, 138, 341, 131, 151],
    [366, 199, 130, 320, 18],
    [226, 245, 91, 245, 226],
    [18, 320, 130, 199, 366],
    [151, 131, 341, 138, 272],
]


def first_eoi(data: bytes, start: int = 2) -> int:
    pos = data.find(b"\xff\xd9", start)
    if pos < 0:
        raise ValueError("JPEG EOI marker not found")
    return pos


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    anomalies = []
    for path in sorted(IMAGE_DIR.glob("*.jpg")):
        data = path.read_bytes()
        end = first_eoi(data)
        trailing = len(data) - end - 2
        if trailing:
            anomalies.append((path.name, len(data), end, trailing))
    print("first-EOI trailing-data audit:")
    for row in anomalies:
        print("  %s size=%d first_eoi=%d trailing=%d" % row)

    data = SOURCE.read_bytes()
    eoi1 = first_eoi(data)
    first_jpeg = data[: eoi1 + 2]
    reversed_tail = data[eoi1 + 2 :][::-1]
    eoi2 = first_eoi(reversed_tail)
    second_jpeg = reversed_tail[: eoi2 + 2]
    payload = reversed_tail[eoi2 + 2 :]

    if first_jpeg != second_jpeg:
        raise AssertionError("reconstructed JPEG prefix is not byte-identical")
    if len(payload) != 360:
        raise AssertionError(f"expected 360-byte trailer, got {len(payload)}")

    hex_text = payload.decode("ascii")
    compact = "".join(hex_text.split())
    if len(compact) != 358:
        raise AssertionError(f"expected 358 hex digits, got {len(compact)}")
    decoded = bytes.fromhex(compact)
    text = decoded.decode("ascii")
    matrix = [
        [int(token) for token in line.split()]
        for line in text.splitlines()
        if line.strip()
    ]
    if matrix != EXPECTED:
        raise AssertionError("decoded matrix differs from the verified 5x5/1033 square")
    if any(sum(row) != 1033 for row in matrix):
        raise AssertionError("row magic sum failed")
    if any(sum(matrix[r][c] for r in range(5)) != 1033 for c in range(5)):
        raise AssertionError("column magic sum failed")
    if sum(matrix[i][i] for i in range(5)) != 1033:
        raise AssertionError("main diagonal magic sum failed")
    if sum(matrix[i][4 - i] for i in range(5)) != 1033:
        raise AssertionError("anti-diagonal magic sum failed")

    print(f"source_bytes={len(data)} first_eoi={eoi1} first_jpeg_bytes={len(first_jpeg)}")
    print(f"reversed_tail_bytes={len(reversed_tail)} second_eoi={eoi2} payload_bytes={len(payload)}")
    print(f"first_jpeg_sha256={sha256(first_jpeg)}")
    print(f"payload_sha256={sha256(payload)}")
    print(f"decoded_text_bytes={len(decoded)} decoded_text_sha256={sha256(decoded)}")
    print(text, end="")
    print("VERIFIED: all rows, columns and principal diagonals sum to 1033")


if __name__ == "__main__":
    main()
