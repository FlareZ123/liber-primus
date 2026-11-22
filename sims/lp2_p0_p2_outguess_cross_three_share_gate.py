#!/usr/bin/env python3
"""Original-source gate for the p0-p2 cross / three-share OutGuess hypothesis.

Run from the repository root:
    python sims/lp2_p0_p2_outguess_cross_three_share_gate.py

Tests the historical OutGuess Default key and the LP1-derived candidate
FIRFUMFERENFE. The latter is a candidate OutGuess passphrase, not an
authenticated OutGuess instruction. No source images or outputs are modified.
"""
from __future__ import annotations

import hashlib
import json
import math
from collections import Counter
from pathlib import Path

from outguess_extract import (
    arc4_addrandom,
    arc4_getbyte,
    arc4_getword,
    arc4_initkey,
    build_bitmap,
    extract,
    header_is_source_forced,
)

ROOT = Path(__file__).resolve().parents[1]
SCANS = ROOT / "resources" / "liber-primus"
POSITIVE = ROOT / "resources" / "external" / "derived" / "2014-stage04" / "03-outguess.asc"
DEFAULT_KEY = "Default key"
LP1_DERIVED_KEY = "FIRFUMFERENFE"
EXPECTED_IMAGES = {
    17: "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
    18: "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f",
    19: "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
}
EXPECTED_DEFAULT_P0 = "cbf1ccddc6c4bb2fd96d449e0667eb5be6c2a542de4e0f43e7ca188df7f289b1"
EXPECTED_FIRFUM_PAYLOADS = {
    17: "d9505f6f6d40c2099cad79963a16f2823f2e46f6aead83776c863c648815f6e6",
    18: "ed5a3ced513c70c1f0e15cc3097af1173779fad7d2fbc994e763ba48393e9b15",
    19: "3e190a76b50c25c486a4f21ca80e86730e878e418ebcf7f5f076e05e5cc02712",
}
EXPECTED_FIRFUM_XOR = "fca81a16753c21df3d5874224d666c2c963cd8a036e67f766fa64e5f9b5628c8"
EXPECTED_DEFAULT_FAILURES = {
    18: {
        "payload_bytes": 58120, "remaining": 32, "offset": 686973,
        "bit_count": 687226, "available": 253, "quotient": 21475,
    },
    19: {
        "payload_bytes": 58113, "remaining": 39, "offset": 619352,
        "bit_count": 619659, "available": 307, "quotient": 19364,
    },
}
MAGIC_SIGNATURES = (
    b"-----BEGIN PGP ", b"PK\x03\x04", b"\x1f\x8b", b"BZh",
    b"%PDF-", b"\x89PNG\r\n\x1a\n", b"CICADA", b"LIBER", b"3301",
)


def trace_password(bitmap: bytes, bit_count: int, password: str) -> dict:
    """Trace the source-faithful OutGuess 0.4 adaptive iterator."""
    key = password.encode("utf-8")
    iterator = arc4_initkey(b"Seeding", key)
    skipmod = 32
    offset = arc4_getword(iterator) % skipmod

    def next_offset() -> None:
        nonlocal offset
        offset += (arc4_getword(iterator) % skipmod) + 1
        if offset >= bit_count:
            raise AssertionError(f"unexpected iterator overrun at {offset}/{bit_count}")

    def retrieve_byte() -> int:
        nonlocal offset
        value = 0
        for shift in range(8):
            value |= ((bitmap[offset >> 3] >> (offset & 7)) & 1) << shift
            next_offset()
        return value

    encrypted_header = bytes(retrieve_byte() for _ in range(4))
    encryption = arc4_initkey(b"Encryption", key)
    header = bytes(value ^ arc4_getbyte(encryption) for value in encrypted_header)
    seed = header[0] | (header[1] << 8)
    length = header[2] | (header[3] << 8)
    arc4_addrandom(iterator, seed.to_bytes(2, "little"))

    completed = 0
    for remaining in range(length, 0, -1):
        available = bit_count - offset
        quotient = bit_count // 32
        adjustment = (
            2.0 if available > quotient
            else 2.0 - (quotient - available) / float(quotient)
        )
        skipmod = int(adjustment * available / (8 * remaining))
        if skipmod <= 0:
            return {
                "complete": False, "payload_bytes": completed,
                "remaining": remaining, "offset": offset,
                "bit_count": bit_count, "available": available,
                "quotient": quotient, "adjustment": adjustment,
                "skipmod": skipmod, "encrypted_header": encrypted_header.hex(),
                "header": header.hex(), "seed": seed, "length": length,
            }
        retrieve_byte()
        completed += 1

    return {
        "complete": True, "payload_bytes": completed, "offset": offset,
        "bit_count": bit_count, "encrypted_header": encrypted_header.hex(),
        "header": header.hex(), "seed": seed, "length": length,
    }


def entropy(data: bytes) -> float:
    counts = Counter(data)
    n = len(data)
    return -sum((count / n) * math.log2(count / n) for count in counts.values())


def printable_fraction(data: bytes) -> float:
    return sum(32 <= b <= 126 or b in (9, 10, 13) for b in data) / len(data)


def longest_printable(data: bytes) -> int:
    best = current = 0
    for b in data:
        if 32 <= b <= 126 or b in (9, 10, 13):
            current += 1
            best = max(best, current)
        else:
            current = 0
    return best


def common_prefix_length(parts: list[bytes]) -> int:
    limit = min(map(len, parts))
    for i in range(limit):
        if any(part[i] != parts[0][i] for part in parts[1:]):
            return i
    return limit


def common_suffix_length(parts: list[bytes]) -> int:
    limit = min(map(len, parts))
    for i in range(limit):
        if any(part[-1 - i] != parts[0][-1 - i] for part in parts[1:]):
            return i
    return limit


def main() -> None:
    # Positive control: authentic LP1 03.jpg OutGuess payload under Default key.
    control_bitmap, control_bits = build_bitmap(SCANS / "03.jpg")
    control, control_meta = extract(control_bitmap, control_bits, DEFAULT_KEY)
    known_control = POSITIVE.read_bytes()
    assert len(known_control) == 31809
    assert control == known_control
    assert control.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")

    bitmaps = {}
    bit_counts = {}
    for scan in (17, 18, 19):
        image = SCANS / f"{scan:02d}.jpg"
        image_sha = hashlib.sha256(image.read_bytes()).hexdigest()
        assert image_sha == EXPECTED_IMAGES[scan]
        bitmap, bit_count = build_bitmap(image)
        assert header_is_source_forced(bitmap, bit_count)
        bitmaps[scan], bit_counts[scan] = bitmap, bit_count

    # Historically demonstrated OutGuess Default key: p0 completes; p1/p2 stop.
    default_results = {}
    for scan in (17, 18, 19):
        trace = trace_password(bitmaps[scan], bit_counts[scan], DEFAULT_KEY)
        assert trace["encrypted_header"] == "ffffffff"
        assert trace["header"] == "c0a128e3"
        assert (trace["seed"], trace["length"]) == (41408, 58152)
        if scan == 17:
            assert trace["complete"] and trace["payload_bytes"] == 58152
            payload, meta = extract(bitmaps[scan], bit_counts[scan], DEFAULT_KEY)
            digest = hashlib.sha256(payload).hexdigest()
            assert digest == EXPECTED_DEFAULT_P0
            assert meta["header_is_source_forced"]
            default_results[scan] = {
                "trace": trace, "payload_bytes": len(payload),
                "payload_sha256": digest,
            }
        else:
            expected = EXPECTED_DEFAULT_FAILURES[scan]
            assert not trace["complete"]
            for key, value in expected.items():
                assert trace[key] == value, (scan, key, trace[key], value)
            assert trace["skipmod"] == 0
            try:
                extract(bitmaps[scan], bit_counts[scan], DEFAULT_KEY)
            except ValueError as exc:
                assert str(exc) == "OutGuess iterator adapted to zero skip modulus"
            else:
                raise AssertionError(f"scan {scan} unexpectedly completed Default-key extraction")
            default_results[scan] = {"trace": trace, "extraction": "zero-skipmod failure"}

    # LP1-derived FIRFUMFERENFE candidate passphrase: all three complete.
    firfum_payloads = []
    firfum_results = {}
    for scan in (17, 18, 19):
        trace = trace_password(bitmaps[scan], bit_counts[scan], LP1_DERIVED_KEY)
        assert trace["complete"] and trace["payload_bytes"] == 9474
        assert trace["encrypted_header"] == "ffffffff"
        assert trace["header"] == "2aa00225"
        assert (trace["seed"], trace["length"]) == (41002, 9474)
        payload, meta = extract(bitmaps[scan], bit_counts[scan], LP1_DERIVED_KEY)
        digest = hashlib.sha256(payload).hexdigest()
        assert digest == EXPECTED_FIRFUM_PAYLOADS[scan]
        assert meta["header_is_source_forced"]
        firfum_payloads.append(payload)
        firfum_results[scan] = {
            "trace": trace, "payload_bytes": len(payload),
            "payload_sha256": digest,
        }

    assert len({len(p) for p in firfum_payloads}) == 1
    xor_payload = bytes(a ^ b ^ c for a, b, c in zip(*firfum_payloads))
    xor_digest = hashlib.sha256(xor_payload).hexdigest()
    assert xor_digest == EXPECTED_FIRFUM_XOR
    prefix = common_prefix_length(firfum_payloads)
    suffix = common_suffix_length(firfum_payloads)
    h = entropy(xor_payload)
    printable = printable_fraction(xor_payload)
    longest = longest_printable(xor_payload)
    assert (prefix, suffix) == (293, 323)
    assert abs(h - 7.982151697312902) < 1e-12
    assert abs(printable - 0.3836816550559426) < 1e-12
    assert longest == 12
    assert not any(signature in xor_payload for signature in MAGIC_SIGNATURES)

    print(json.dumps({
        "positive_control": {
            "image": "LP1 03.jpg", "password": DEFAULT_KEY,
            "bytes": len(control), "sha256": hashlib.sha256(control).hexdigest(),
            "exact_archived_payload": True, "metadata": control_meta,
        },
        "LP2_Default_key": default_results,
        "LP2_FIRFUMFERENFE_candidate": {
            "note": "LP1-derived Vigenere key tested as an OutGuess passphrase; not an authenticated OutGuess instruction",
            "payloads": firfum_results,
            "three_way_xor": {
                "bytes": len(xor_payload), "sha256": xor_digest,
                "entropy_bits_per_byte": h, "printable_fraction": printable,
                "longest_printable_run": longest,
                "common_payload_prefix_bytes": prefix,
                "common_payload_suffix_bytes": suffix,
                "recognized_signatures": [],
            },
        },
        "decision": (
            "The direct p0/p1/p2 three-share OutGuess transfer is negative under "
            "Default key (only p0 completes) and FIRFUMFERENFE (all complete, "
            "but the direct XOR is high-entropy and has no recognized message/file signature)."
        ),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
