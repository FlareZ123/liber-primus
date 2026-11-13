#!/usr/bin/env python3
"""Universal original-LP2 OutGuess header invariant (single-file test).

The archived 2014 OutGuess/2016 signed-image operation is source-authentic,
but a valid-looking OutGuess header is not a payload proof. Recover eligible
JPEG coefficient LSBs with the already calibrated repository implementation,
then show *for any password* that every unknown or solved LP2 source JPEG
has identical first four encrypted OutGuess header bytes (FF FF FF FF).

Run from any working directory: python sims/lp2_outguess_universal_header_sft.py
Requires Python 3, C compiler and libjpeg development headers, as for the
existing sims/outguess_extract.py. No project files are written.
"""
from __future__ import annotations

import hashlib
import json
import pathlib
import statistics

from outguess_extract import arc4_getbyte, arc4_getword, arc4_initkey, build_bitmap, extract, header_is_source_forced

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCANS = ROOT / "resources" / "liber-primus"
POSITIVE = ROOT / "resources" / "external" / "derived" / "2014-stage04" / "03-outguess.asc"
PASSWORDS = {
    "Default key": "c0a128e3",
    "HOME": "201b2d2d",
    "X": "9989557b",
}


def leading_one_bits(bitmap: bytes, bit_count: int) -> int:
    """Count the exact run of LSB-first one bits in the OutGuess bitmap."""
    for i, octet in enumerate(bitmap):
        if octet != 255:
            zero = (~octet) & 255
            return min(bit_count, 8 * i + ((zero & -zero).bit_length() - 1))
    return bit_count


def sample_header(bitmap: bytes, bit_count: int, password: str) -> tuple[bytes, int]:
    """Copy only the original OutGuess 32-bit header-selection rule."""
    stream = arc4_initkey(b"Seeding", password.encode("utf-8"))
    offset = arc4_getword(stream) % 32
    encrypted = bytearray(4)
    largest_sampled = -1
    for i in range(32):
        assert offset < bit_count
        encrypted[i // 8] |= ((bitmap[offset // 8] >> (offset % 8)) & 1) << (i % 8)
        largest_sampled = max(largest_sampled, offset)
        offset += arc4_getword(stream) % 32 + 1
    assert largest_sampled <= 1023
    return bytes(encrypted), largest_sampled


def decrypt_fixed_header(password: str) -> str:
    """Determine any password's apparent seed/length, without a JPEG."""
    stream = arc4_initkey(b"Encryption", password.encode("utf-8"))
    return bytes(255 ^ arc4_getbyte(stream) for _ in range(4)).hex()


def main() -> None:
    # Exact, independently published 2014 positive retrieval.
    lp1_bitmap, lp1_size = build_bitmap(SCANS / "03.jpg")
    assert leading_one_bits(lp1_bitmap, lp1_size) == 9
    assert not header_is_source_forced(lp1_bitmap, lp1_size)
    plaintext, _ = extract(lp1_bitmap, lp1_size, "Default key")
    control = POSITIVE.read_bytes()
    assert len(control) == 31809
    assert plaintext == control
    assert control.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
    positive_sha256 = hashlib.sha256(control).hexdigest()

    assert {key: decrypt_fixed_header(key) for key in PASSWORDS} == PASSWORDS
    leading = {}
    representative = {}
    global_max_offset = 0
    for scan in range(17, 75):
        bitmap, bits = build_bitmap(SCANS / f"{scan:02d}.jpg")
        ones = leading_one_bits(bitmap, bits)
        leading[scan] = ones
        assert ones >= 1024, f"source scan {scan}: header may not be uniform"
        assert header_is_source_forced(bitmap, bits)
        for password in PASSWORDS:
            header, last = sample_header(bitmap, bits, password)
            global_max_offset = max(global_max_offset, last)
            assert header == b"\xff\xff\xff\xff", (scan, password)
        if scan in (49, 72):
            representative[scan] = {"initialOneBits": ones, "eligibleBitCount": bits}

    assert len(leading) == 58
    assert min(leading.values()) == 5747
    assert statistics.median(leading.values()) == 25275
    assert max(leading.values()) == 34351
    assert leading[49] == 25349
    assert leading[72] == 25350
    assert global_max_offset <= 1023

    header = bytes.fromhex(PASSWORDS["Default key"])
    default_seed = int.from_bytes(header[:2], "little")
    default_length = int.from_bytes(header[2:], "little")
    assert (default_seed, default_length) == (41408, 58152)

    print(json.dumps({
        "source": "all 58 original LP2 JPEG scans 17.jpg through 74.jpg",
        "outguessMethod": "original libjpeg quantized DCT coefficient eligible-bit scan and ARC4 header iterator",
        "sourceImages": 58,
        "leadingOneBits": {
            "minimum": min(leading.values()),
            "median": statistics.median(leading.values()),
            "maximum": max(leading.values()),
        },
        "sampledHeaderBitIndexUpperBound": 1023,
        "observedMaximumSampledIndex": global_max_offset,
        "encryptedHeaderForEveryPasswordOnEveryLP2Scan": "ffffffff",
        "sampleDecodedHeaders": PASSWORDS,
        "defaultKeyApparentSeed": default_seed,
        "defaultKeyApparentLength": default_length,
        "p32AndP55TreeScans": representative,
        "historicalPositive": {
            "scan": "03.jpg", "password": "Default key",
            "initialOneBits": 9,
            "recoveredBytes": len(control),
            "sha256": positive_sha256,
            "exactOriginalPGPText": True,
        },
        "inference": "A seed/length or header-only OutGuess hit on any original LP2 JPEG is determined by the key and the shared image prefix; it is not evidence for an embedded message. Independently verified structured payload bytes would still be evidence.",
    }, indent=2))


if __name__ == "__main__":
    main()
