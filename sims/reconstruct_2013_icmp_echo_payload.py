#!/usr/bin/env python3
"""Reconstruct the 2013 second-onion ICMP data stream and test its prime-ID hypothesis."""
from __future__ import annotations

import gzip
import hashlib
import struct
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HEX_PATH = ROOT / "resources/historical/cicada2013-second-onion-icmp-echo.hex.txt"
ASC_PATH = ROOT / "resources/historical/cicada2013-second-onion-icmp-echo.asc"
PRIME_SEED = 3301

# Fragments transcribed in scream314/cicada3301/2013.md.
# Zero-based indexes 18, 19, 20 are data lines 19–21.
OBSERVED = {
    18: (3457, "c866c2e3cd2eda7698b2057681c3846fba7bf4b1c1bc6c7f2e8db8fc"),
    19: (3461, "e0ddd275cf4069985ed481c22491bb267414e5fb128fdb429c662443"),
    20: (3463, "f6856ed2d4aa87f36686ca58e0f82927b1756e6d7bcf94f6abb55c4f"),
}


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


def next_prime(n: int) -> int:
    candidate = n + 1
    while not is_prime(candidate):
        candidate += 1
    return candidate


def main() -> None:
    lines = [line.strip().lower() for line in HEX_PATH.read_text(encoding="ascii").splitlines() if line.strip()]
    if len(lines) != 28:
        raise SystemExit(f"expected 28 data lines, got {len(lines)}")

    chunks = [bytes.fromhex(line) for line in lines]
    if any(len(chunk) != 28 for chunk in chunks[:-1]) or len(chunks[-1]) != 22:
        raise SystemExit("unexpected 28-byte chunking or final chunk length")

    compressed = b"".join(chunks)
    recovered = gzip.decompress(compressed)
    expected = ASC_PATH.read_bytes()
    if recovered != expected:
        raise SystemExit("gzip output does not match the mirrored signed .asc file")

    mtime = struct.unpack_from("<I", compressed, 4)[0]
    filename = None
    if compressed[3] & 0x08:
        end = compressed.index(b"\x00", 10)
        filename = compressed[10:end].decode("ascii")

    predicted_ids = []
    current = PRIME_SEED
    for _ in lines:
        current = next_prime(current)
        predicted_ids.append(current)

    for index, (observed_id, observed_hex) in OBSERVED.items():
        if lines[index] != observed_hex or predicted_ids[index] != observed_id:
            raise SystemExit(f"sample mismatch at data line {index + 1}")

    print(f"data lines: {len(lines)}")
    print(f"data chunk bytes: {[len(chunk) for chunk in chunks]}")
    print(f"compressed bytes: {len(compressed)}")
    print(f"compressed SHA-256: {hashlib.sha256(compressed).hexdigest()}")
    print(f"decompressed bytes: {len(recovered)}")
    print(f"decompressed SHA-256: {hashlib.sha256(recovered).hexdigest()}")
    print(f"matches mirrored .asc byte-for-byte: {recovered == expected}")
    print(f"gzip original filename: {filename}")
    print(f"gzip mtime: {mtime} ({datetime.fromtimestamp(mtime, timezone.utc).isoformat()})")
    print(f"prime seed: {PRIME_SEED}")
    print(f"predicted first/last ICMP identifiers: {predicted_ids[0]} / {predicted_ids[-1]}")
    print(f"predicted 28 identifiers: {', '.join(map(str, predicted_ids))}")
    for index, (observed_id, _) in OBSERVED.items():
        print(f"data line {index + 1}: observed {observed_id}, predicted {predicted_ids[index]} — match")


if __name__ == "__main__":
    main()
