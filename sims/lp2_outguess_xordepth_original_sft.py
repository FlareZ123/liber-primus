#!/usr/bin/env python3
"""Exact six-original-JPEG OutGuess pseudo-payload XOR-depth test.

Run: python sims/lp2_outguess_xordepth_original_sft.py
Requires libjpeg and the existing outguess_extract.py and outguess_bitmap_dump.c.
Reads original source images; writes no files.
"""
from __future__ import annotations

from collections import Counter
import hashlib
import math
from pathlib import Path

from outguess_extract import build_bitmap, extract

ROOT = Path(__file__).resolve().parents[1]
SCANS = ROOT / "resources" / "liber-primus"
EXPECTED = {
    17: ("cbf1ccddc6c4bb2fd96d449e0667eb5be6c2a542de4e0f43e7ca188df7f289b1", "dcd47827eb02f3d5c7cbfc6259868621bc1ee7b6"),
    21: ("21e26fbcfd0f8cc5706ca4228245854703efa143173b793066ab3a2577f40db3", "58ba0c966954f2a02964995613a6ba93fca57425"),
    43: ("0a318b3e9e195fdea9e941b7b458ae9cddef5147eec646b6da231b7d6615fe43", "e4c94e1d285aff041276bf5c7bb1c265e987d93d"),
    57: ("a32dcbfdaddb4a9c643ef156df4c1715037f397b179417cb42149ee13729ec64", None),
    61: ("e717deb033fe4f353e2a59feb9b816c7f9aa9a04a0d9983ab0139324f169296d", None),
    65: ("247a30f12be3e15c490ea15c8870e7485aea2fd8596783a7f1db76c3ed338ca4", None),
}
PAIR_EXPECTED = {
    (17, 21): (1417, 1953, 54782, 737, 26589),
    (17, 43): (1417, 1953, 54782, 1060, 26463),
    (21, 43): (2004, 2228, 53920, 738, 26222),
    (17, 57): (1417, 1953, 54782, 752, 26620),
    (57, 61): (1521, 2315, 54316, 443, 26601),
    (57, 65): (1521, 2310, 54321, 442, None),
    (61, 65): (1554, 2310, 54288, 396, None),
}


def xor(a: bytes, b: bytes) -> bytes:
    assert len(a) == len(b)
    return bytes(x ^ y for x, y in zip(a, b))


def entropy(data: bytes) -> float:
    counts = Counter(data)
    return -sum((n / len(data)) * math.log2(n / len(data)) for n in counts.values())


def check_depth_pair(a: int, b: int, data: dict[int, bytes]) -> None:
    full = xor(data[a], data[b])
    first = next(i for i, value in enumerate(full) if value)
    last = max(i for i, value in enumerate(full) if value)
    middle = full[first:last + 1]
    metrics = (first, len(full) - last - 1, len(middle),
               middle.count(0), sum(v >= 128 for v in middle))
    expected = PAIR_EXPECTED[a, b]
    assert metrics[:4] == expected[:4], (a, b, metrics, expected)
    if expected[4] is not None:
        assert metrics[4] == expected[4], (a, b, metrics, expected)
    assert len(set(middle)) == 256
    assert 7.9 < entropy(middle) < 8.0
    print(f"PAIR {a:02d}-{b:02d}: zero-prefix={first}, zero-suffix={len(full)-last-1}, "
          f"middle={len(middle)}, middle-zero={metrics[3]}, high-bit={metrics[4]}, "
          f"unique=256, entropy={entropy(middle):.6f} bits/byte")


def main() -> None:
    # Positive crib-drag control: two independently selected ASCII messages
    # encrypted under the same synthetic pad recover perfectly by pair XOR.
    m1 = (b"THE KEY IS HIDDEN IN THE ORIGINAL ARTIFACT. " * 4)[:128]
    m2 = (b"FIND THE MESSAGE BY COMPARING THE REAL SOURCES. " * 4)[:128]
    assert len(m1) == len(m2) == 128
    pad = hashlib.sha256(b"distinct test pad").digest() * 4
    c1, c2 = xor(m1, pad), xor(m2, pad)
    assert xor(xor(c1, c2), m1) == m2
    assert max(xor(c1, c2)) < 128
    print("POSITIVE: 128/128 ASCII reused-pad plaintext bytes recovered")

    data: dict[int, bytes] = {}
    for scan, (expected_sha, expected_git_blob) in EXPECTED.items():
        bitmap, count = build_bitmap(SCANS / f"{scan:02d}.jpg")
        plaintext, meta = extract(bitmap, count, "Default key")
        assert len(plaintext) == 58152, scan
        assert meta["header_is_source_forced"]
        assert meta["encrypted_header_hex"] == "ffffffff"
        assert meta["header_hex"] == "c0a128e3"
        assert meta["seed"] == 41408
        digest = hashlib.sha256(plaintext).hexdigest()
        assert digest == expected_sha, (scan, digest)
        git_blob = hashlib.sha1(
            b"blob " + str(len(plaintext)).encode() + b"\0" + plaintext
        ).hexdigest()
        if expected_git_blob:
            assert git_blob == expected_git_blob, (scan, git_blob)
        data[scan] = plaintext
        print(f"IMAGE {scan:02d}: recovered 58,152 bytes; SHA256={digest}; "
              "source-forced OutGuess header=ffffffff")

    for a, b in PAIR_EXPECTED:
        check_depth_pair(a, b, data)
    triple = bytes(a ^ b ^ c for a, b, c in
                   zip(data[17], data[21], data[43]))
    assert len(set(triple)) == 256
    assert abs(entropy(triple) - 7.996726156657) < 1e-9
    print(f"TRIPLE 17^21^43: unique=256, entropy={entropy(triple):.6f} bits/byte")
    print("DECISION: no reused-pad ASCII/GP three-message depth; the long "
          "matching prefixes/suffixes recur on independent framed carriers.")


if __name__ == "__main__":
    main()
