#!/usr/bin/env python3
"""Original-source gate for the p0-p2 cross / three-share OutGuess hypothesis.

Run from the repository root:
    python sims/lp2_p0_p2_outguess_cross_three_share_gate.py

Uses the existing source-faithful OutGuess JPEG coefficient reader and ARC4
retrieval implementation. No source images or outputs are modified.
"""
from __future__ import annotations

import hashlib
import json
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
PASSWORD = "Default key"
EXPECTED_IMAGES = {
    17: "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
    18: "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f",
    19: "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
}
EXPECTED_P0_PAYLOAD = "cbf1ccddc6c4bb2fd96d449e0667eb5be6c2a542de4e0f43e7ca188df7f289b1"
EXPECTED_FAILURES = {
    18: {
        "payload_bytes": 58120, "remaining": 32, "offset": 686973,
        "bit_count": 687226, "available": 253, "quotient": 21475,
    },
    19: {
        "payload_bytes": 58113, "remaining": 39, "offset": 619352,
        "bit_count": 619659, "available": 307, "quotient": 19364,
    },
}


def trace_default_key(bitmap: bytes, bit_count: int) -> dict:
    """Trace the existing OutGuess 0.4 iterator to its first zero skipmod."""
    key = PASSWORD.encode("utf-8")
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


def main() -> None:
    # Positive control: the original LP1 03.jpg known OutGuess message.
    control_bitmap, control_bits = build_bitmap(SCANS / "03.jpg")
    control, control_meta = extract(control_bitmap, control_bits, PASSWORD)
    known_control = POSITIVE.read_bytes()
    assert len(known_control) == 31809
    assert control == known_control
    assert control.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")

    results = {}
    for scan in (17, 18, 19):
        image = SCANS / f"{scan:02d}.jpg"
        image_bytes = image.read_bytes()
        image_sha = hashlib.sha256(image_bytes).hexdigest()
        assert image_sha == EXPECTED_IMAGES[scan]
        bitmap, bit_count = build_bitmap(image)
        assert header_is_source_forced(bitmap, bit_count)
        trace = trace_default_key(bitmap, bit_count)
        assert trace["encrypted_header"] == "ffffffff"
        assert trace["header"] == "c0a128e3"
        assert (trace["seed"], trace["length"]) == (41408, 58152)

        if scan == 17:
            assert trace["complete"] and trace["payload_bytes"] == 58152
            payload, meta = extract(bitmap, bit_count, PASSWORD)
            digest = hashlib.sha256(payload).hexdigest()
            assert digest == EXPECTED_P0_PAYLOAD
            assert len(payload) == 58152
            assert meta["header_is_source_forced"]
            results[scan] = {
                "image_sha256": image_sha, "trace": trace,
                "payload_sha256": digest, "payload_bytes": len(payload),
            }
        else:
            assert not trace["complete"]
            expected = EXPECTED_FAILURES[scan]
            for key, value in expected.items():
                assert trace[key] == value, (scan, key, trace[key], value)
            assert trace["skipmod"] == 0
            try:
                extract(bitmap, bit_count, PASSWORD)
            except ValueError as exc:
                assert str(exc) == "OutGuess iterator adapted to zero skip modulus"
            else:
                raise AssertionError(f"scan {scan} unexpectedly completed OutGuess extraction")
            results[scan] = {"image_sha256": image_sha, "trace": trace}

    print(json.dumps({
        "historical_positive": {
            "image": "LP1 03.jpg", "password": PASSWORD,
            "bytes": len(control), "exact_archived_payload": True,
            "sha256": hashlib.sha256(control).hexdigest(),
            "metadata": control_meta,
        },
        "LP2_cross_pages": results,
        "decision": (
            "Only p0/scan17 completes the 58,152-byte default-key payload. "
            "p1/scan18 and p2/scan19 stop at skipmod zero; the direct three-share "
            "OutGuess XOR transfer therefore lacks three complete equal-length shares."
        ),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
