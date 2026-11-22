#!/usr/bin/env python3
"""Test the historically named 2013 MP3 title on the LP2 terminal insect/tree JPEG.

This is one source-selected OutGuess key / carrier hypothesis, not a password
search. The complete 2013 title is 'The Instar Emergence' (761.MP3).
The clear p57 PARABLE names an instar near the illustrated p55 terminus.
A distinct prior source test used this title on p14/p23, never on p55.

Run on Linux with gcc and libjpeg-dev:
    python3 sims/lp2_p55_2013_instar_title_outguess_sft.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from outguess_extract import build_bitmap, extract

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "resources" / "liber-primus"
KEY = "The Instar Emergence"
CARRIER = ORIGINAL / "72.jpg"
SOURCE_SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"


def inspect_payload(payload: bytes, metadata: dict) -> dict:
    """Distinguish a source-forced pseudoheader from readable payload evidence."""
    try:
        text = payload.decode("utf-8")
    except UnicodeDecodeError:
        text = ""
    readable = len(text) >= 64 and sum(
        char.isprintable() or char in "\r\n\t" for char in text
    ) / len(text) >= 0.97
    return {
        "status": "raw_bytes_read",
        "length": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "prefix_hex": payload[:32].hex(),
        "header_is_source_forced": metadata["header_is_source_forced"],
        "possible_openpgp_armor": metadata["possible_openpgp_armor"],
        "magic": metadata["magic"],
        "readable_utf8": readable,
        "printable_fraction": round(metadata["printable_fraction"], 6),
        "entropy_bits_per_byte": round(metadata["entropy_bits_per_byte"], 6),
        "independently_recognizable": bool(
            metadata["magic"] or metadata["possible_openpgp_armor"] or readable
        ),
    }


def main() -> None:
    sha = hashlib.sha256(CARRIER.read_bytes()).hexdigest()
    assert sha == SOURCE_SHA256, "Original LP2 p55 JPEG differs from audited source"
    control_bitmap, control_bits = build_bitmap(ORIGINAL / "03.jpg")
    known, _ = extract(control_bitmap, control_bits, "Default key")
    assert len(known) == 31809
    assert known.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")

    bitmap, nbits = build_bitmap(CARRIER)
    try:
        payload, metadata = extract(bitmap, nbits, KEY)
    except ValueError as error:
        result = {"status": "header_or_iterator_failure", "reason": str(error)}
    else:
        result = inspect_payload(payload, metadata)

    print(json.dumps({
        "source_key": KEY,
        "source_image": "resources/liber-primus/72.jpg",
        "source_sha256": sha,
        "physical_page": 55,
        "eligible_jpeg_coefficient_bits": nbits,
        "positive_control": {
            "source": "resources/liber-primus/03.jpg",
            "key": "Default key",
            "eligible_bits": control_bits,
            "authenticated_pgp_bytes": len(known),
            "status": "PASS",
        },
        "test": result,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
