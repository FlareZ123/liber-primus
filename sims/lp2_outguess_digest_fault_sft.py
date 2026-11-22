#!/usr/bin/env python3
"""SFT: original p55 OutGuess SIGFPE under solved-p56 literal digest key.

Uses original JPEG DCT coefficient reader and period OutGuess ARC4 selector
already calibrated by outguess_extract.py. No password or image selection sweep.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from outguess_extract import (
    arc4_addrandom, arc4_getbyte, arc4_getword, arc4_initkey,
    build_bitmap, header_is_source_forced,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "resources" / "liber-primus"
DIGEST = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
SOURCE_SHA = {
    3: "b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f",
    70: "4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548",
    72: "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
    73: "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc",
}
BIT_COUNT = {3: 811192, 70: 758806, 72: 629181, 73: 428609}


def trace(page: int, password: str) -> dict:
    image = SOURCES / f"{page:02d}.jpg"
    source_sha = hashlib.sha256(image.read_bytes()).hexdigest()
    assert source_sha == SOURCE_SHA[page], f"Source JPEG mismatch: {page}"
    bitmap, bit_count = build_bitmap(image)
    assert bit_count == BIT_COUNT[page]
    stream = arc4_initkey(b"Seeding", password.encode("utf-8"))
    offset = arc4_getword(stream) % 32
    skipmod = 32

    def read_byte() -> int:
        nonlocal offset
        value = 0
        for shift in range(8):
            assert offset < bit_count, "OutGuess byte read beyond bitmap"
            value |= ((bitmap[offset >> 3] >> (offset & 7)) & 1) << shift
            offset += arc4_getword(stream) % skipmod + 1
        return value

    encrypted_header = bytes(read_byte() for _ in range(4))
    cipher = arc4_initkey(b"Encryption", password.encode("utf-8"))
    header = bytes(octet ^ arc4_getbyte(cipher) for octet in encrypted_header)
    seed = int.from_bytes(header[:2], "little")
    length = int.from_bytes(header[2:], "little")
    assert length > 0
    arc4_addrandom(stream, seed.to_bytes(2, "little"))
    raw = bytearray()
    first_shortfall = None
    failure = None
    for emitted in range(length):
        available = bit_count - offset
        needed = 8 * (length - emitted)
        if available < needed and first_shortfall is None:
            first_shortfall = {"emitted": emitted, "neededBits": needed,
                               "availableBits": available}
        quotient = bit_count // 32
        adjustment = (2.0 if available > quotient else
                      2.0 - (quotient - available) / float(quotient))
        skipmod = int(adjustment * available / needed)
        if skipmod <= 0:
            failure = {"kind": "zero-adaptive-skip-modulus", "emitted": emitted,
                       "remainingBytes": length - emitted, "offset": offset,
                       "remainingBits": available, "minimumBitsNeeded": needed,
                       "skipmod": skipmod}
            break
        raw.append(read_byte())
    cipher = arc4_initkey(b"Encryption", password.encode("utf-8"))
    payload = bytes(octet ^ arc4_getbyte(cipher) for octet in raw)
    return {
        "jpeg": image.name, "jpegSHA256": source_sha,
        "bitmapBits": bit_count, "encryptedHeader": encrypted_header.hex(),
        "sourceForcedHeader": header_is_source_forced(bitmap, bit_count),
        "decodedHeader": header.hex(), "declaredSeed": seed,
        "declaredBytes": length, "recoveredBytes": len(payload),
        "payloadSHA256": hashlib.sha256(payload).hexdigest(),
        "prefixHex": payload[:12].hex(),
        "pgpSigned": payload.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----"),
        "firstCapacityShortfall": first_shortfall, "failure": failure,
    }


def main() -> None:
    historical = trace(3, "Default key")
    assert historical["declaredBytes"] == historical["recoveredBytes"] == 31809
    assert historical["payloadSHA256"] == "a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1"
    assert historical["pgpSigned"] and historical["failure"] is None
    assert historical["sourceForcedHeader"] is False

    p53, p55, p56 = (trace(page, DIGEST) for page in (70, 72, 73))
    for item in (p53, p55, p56):
        assert item["encryptedHeader"] == "ffffffff"
        assert item["decodedHeader"] == "36838edc"
        assert item["declaredSeed"] == 33590
        assert item["declaredBytes"] == 56462
        assert item["sourceForcedHeader"] is True
        assert not item["pgpSigned"]
    assert p53["failure"] is None and p53["recoveredBytes"] == 56462
    assert p53["payloadSHA256"] == "2a38acd6c0c101c02023ffa7087ec65465cbf2393df6acf20995805f1876776e"
    assert p55["failure"] == {
        "kind": "zero-adaptive-skip-modulus", "emitted": 56445,
        "remainingBytes": 17, "offset": 629046,
        "remainingBits": 135, "minimumBitsNeeded": 136, "skipmod": 0,
    }
    assert p56["failure"]["kind"] == "zero-adaptive-skip-modulus"
    assert p56["firstCapacityShortfall"]["emitted"] == 0
    print(json.dumps({"controlLP1": historical, "p53": p53,
                      "p55": p55, "p56": p56}, indent=2))


if __name__ == "__main__":
    main()
