#!/usr/bin/env python3
"""Bounded source-visible DIVINITY OutGuess candidate test for LP2 p0-p2.

Run from the repository root:
    python sims/lp2_p0_p2_outguess_divinity_candidate_sft.py

This tests the p57 word DIVINITY as an OutGuess password on the three
cross-framed original images. It is a candidate cross-tool transfer, not an
authenticated OutGuess instruction. Shared helpers are imported from the
main p0-p2 OutGuess SFT. No source images or outputs are modified.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from lp2_p0_p2_outguess_cross_three_share_gate import (
    EXPECTED_IMAGES,
    common_prefix_length,
    common_suffix_length,
    entropy,
    longest_printable,
    printable_fraction,
    trace_password,
)
from outguess_extract import build_bitmap, extract, header_is_source_forced

ROOT = Path(__file__).resolve().parents[1]
SCANS = ROOT / "resources" / "liber-primus"
PASSWORD = "DIVINITY"
EXPECTED_PAYLOADS = {
    17: "772860c15ca24d4cbb41b60f7058caf3bb2a4557e9000a27adc1df8adce64eef",
    18: "bef2dcb6a0e8498ba6aa5ac24e21c7cd80ca1a0572f305b00f39ce8a4b815f30",
    19: "4f7c591533218bd47b354dbdfe76995b6cbffae80e116bfe412f592c2e3313bf",
}
EXPECTED_XOR = "62a287c6191693c7257f5958ba92e6136c992bfbcf8926ac6411bae1cd16c3dc"
MAGIC_SIGNATURES = (
    b"-----BEGIN PGP ", b"PK\x03\x04", b"\x1f\x8b\x08", b"BZh",
    b"%PDF-", b"\x89PNG\r\n\x1a\n", b"CICADA", b"LIBER", b"3301",
)


def main() -> None:
    payloads = []
    details = {}
    for scan in (17, 18, 19):
        image = SCANS / f"{scan:02d}.jpg"
        assert hashlib.sha256(image.read_bytes()).hexdigest() == EXPECTED_IMAGES[scan]
        bitmap, bit_count = build_bitmap(image)
        assert header_is_source_forced(bitmap, bit_count)
        trace = trace_password(bitmap, bit_count, PASSWORD)
        assert trace["complete"]
        assert trace["encrypted_header"] == "ffffffff"
        assert trace["header"] == "ee5b43c7"
        assert (trace["seed"], trace["length"], trace["payload_bytes"]) == (23534, 51011, 51011)
        payload, meta = extract(bitmap, bit_count, PASSWORD)
        digest = hashlib.sha256(payload).hexdigest()
        assert digest == EXPECTED_PAYLOADS[scan]
        assert meta["header_is_source_forced"]
        payloads.append(payload)
        details[scan] = {
            "trace": trace, "payload_bytes": len(payload),
            "payload_sha256": digest,
        }

    assert len({len(p) for p in payloads}) == 1
    combined = bytes(a ^ b ^ c for a, b, c in zip(*payloads))
    digest = hashlib.sha256(combined).hexdigest()
    assert digest == EXPECTED_XOR
    prefix = common_prefix_length(payloads)
    suffix = common_suffix_length(payloads)
    h = entropy(combined)
    printable = printable_fraction(combined)
    longest = longest_printable(combined)
    assert (prefix, suffix) == (1408, 2110)
    assert abs(h - 7.996803080066247) < 1e-12
    assert abs(printable - 0.382466526827547) < 1e-12
    assert longest == 10
    assert not any(sig in combined for sig in MAGIC_SIGNATURES)

    gzip_offsets = [i for i in range(len(combined)) if combined.startswith(b"\x1f\x8b", i)]
    assert gzip_offsets == [26909]
    assert combined[26909:26912] == b"\x1f\x8b\xbf"
    assert b"\x1f\x8b\x08" not in combined

    print(json.dumps({
        "candidate_password": PASSWORD,
        "warning": "p57 source-visible word tested as OutGuess passphrase; not an authenticated OutGuess instruction",
        "payloads": details,
        "three_way_xor": {
            "bytes": len(combined), "sha256": digest,
            "entropy_bits_per_byte": h, "printable_fraction": printable,
            "longest_printable_run": longest,
            "common_payload_prefix_bytes": prefix,
            "common_payload_suffix_bytes": suffix,
            "recognized_signatures": [],
            "invalid_gzip_like_occurrence": {
                "offset": 26909, "bytes": combined[26909:26912].hex(),
                "reason": "method byte bf is not gzip DEFLATE method 08",
            },
        },
        "decision": "Direct three-share XOR under DIVINITY does not recover a valid message or file.",
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
