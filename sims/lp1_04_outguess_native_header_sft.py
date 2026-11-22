#!/usr/bin/env python3
"""Source-native OutGuess positive and LP1 p04 candidate-header test.

No keys are searched. The period default key and exact archived p04
bytes are fixed before the JPEG is examined. Uses existing libjpeg reader
and historical OutGuess 0.4 iterator implementation.
"""
from __future__ import annotations

import hashlib
import json
import pathlib

from outguess_extract import (
    arc4_getword,
    arc4_initkey,
    build_bitmap,
    extract,
    header_is_source_forced,
)

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "resources" / "liber-primus"
POSITIVE = ROOT / "resources" / "external" / "derived" / "2014-stage04" / "03-outguess.asc"
EXPECTED_P04_SHA256 = "35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db"


def leading_one_bits(bits: bytes, size: int) -> int:
    for i, octet in enumerate(bits):
        if octet != 255:
            z = (~octet) & 255
            return min(size, 8 * i + ((z & -z).bit_length() - 1))
    return size


def header_bits(bitmap: bytes, bit_count: int, key: str) -> tuple[str, list[int]]:
    state = arc4_initkey(b"Seeding", key.encode("utf-8"))
    pos = arc4_getword(state) % 32
    picked = []
    val = 0
    for n in range(32):
        assert pos < bit_count
        picked.append(pos)
        val |= ((bitmap[pos >> 3] >> (pos & 7)) & 1) << n
        pos += arc4_getword(state) % 32 + 1
    return val.to_bytes(4, "little").hex(), picked


def inspect(scan: int) -> dict:
    bmp, count = build_bitmap(SRC / f"{scan:02d}.jpg")
    head, indices = header_bits(bmp, count, "Default key")
    source = {
        "scan": f"{scan:02d}.jpg",
        "eligibleCoefficientBits": count,
        "leadingOneBits": leading_one_bits(bmp, count),
        "isEveryPasswordHeaderForcedToFFFF": header_is_source_forced(bmp, count),
        "defaultKeyEncryptedHeader": head,
        "defaultKeyHeaderSampleIndices": indices,
    }
    try:
        content, metadata = extract(bmp, count, "Default key")
        source["defaultKeyExtraction"] = {
            "length": len(content),
            "sha256": hashlib.sha256(content).hexdigest(),
            "header": metadata["header_hex"],
            "seed": metadata["seed"],
            "endBitOffset": metadata["end_bit_offset"],
            "payloadMagic": metadata["magic"],
        }
        if scan == 3:
            assert content == POSITIVE.read_bytes()
            assert content.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
            source["positiveControlMatchesOriginal"] = True
        if scan == 0:
            assert len(content) == 2899
            assert content.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
            source["positiveControlMatchesOriginal"] = True
        if scan == 8:
            assert len(content) == 140
            assert b"For those who have fallen behind" in content
            source["positiveControlMatchesOriginal"] = True
        if scan == 4:
            source["archived04OutputMatchesExactly"] = (
                hashlib.sha256(content).hexdigest() == EXPECTED_P04_SHA256
            )
    except ValueError as error:
        source["defaultKeyExtractionError"] = str(error)
    return source


def main() -> None:
    items = [inspect(scan) for scan in (0, 3, 4, 6, 8)]
    assert items[1]["positiveControlMatchesOriginal"]
    assert items[1]["leadingOneBits"] == 9
    assert items[3]["defaultKeyEncryptedHeader"] == "ffffffff"
    assert items[3]["isEveryPasswordHeaderForcedToFFFF"]
    assert items[2]["archived04OutputMatchesExactly"], (
        "Archive 04 must originate from authentic Default key extraction"
    )
    print(json.dumps({
        "originalSource": "resources/liber-primus/00.jpg,03.jpg,04.jpg,06.jpg,08.jpg",
        "reader": "calibrated source native libjpeg + OutGuess 0.4 ARC4",
        "fixedPassword": "Default key",
        "cases": items,
    }, indent=2))


if __name__ == "__main__":
    main()
