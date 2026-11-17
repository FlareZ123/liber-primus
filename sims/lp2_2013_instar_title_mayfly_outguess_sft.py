#!/usr/bin/env python3
"""Test one genuine 2013 metadata title as an OutGuess key on two mayfly pages.

This is a human-visible cross-round key hypothesis, not a password scan:
2013 761.MP3 title "The Instar Emergence"; LP2 p14/p23 mayfly imagery.
Only the exact title, with original case and spaces, is accepted.
Input original combined-archive JPEGs 31.jpg (p14) and 40.jpg (p23).
Use the separately validated historical LP1 03.jpg / Default key as control.
"""
from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "sims"))
from outguess_extract import build_bitmap, extract  # noqa: E402

KEY = "The Instar Emergence"
CARRIERS = ((14, "31.jpg"), (23, "40.jpg"))


def main() -> None:
    source = ROOT / "resources" / "liber-primus"
    bitmap, nbits = build_bitmap(source / "03.jpg")
    known, _ = extract(bitmap, nbits, "Default key")
    assert len(known) == 31809 and known.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
    findings: list[dict] = []
    for page, name in CARRIERS:
        bitmap, nbits = build_bitmap(source / name)
        record = {"physical_page": page, "file": name, "password": KEY, "bitmap_bits": nbits}
        try:
            payload, meta = extract(bitmap, nbits, KEY)
        except ValueError as error:
            record["status"] = "header_or_iterator_failure"
            record["reason"] = str(error)
        else:
            readable = False
            try:
                string = payload.decode("utf-8")
                readable = len(string) >= 64 and sum(
                    ch.isprintable() or ch in "\r\n\t" for ch in string
                ) / len(string) >= 0.97
            except UnicodeDecodeError:
                pass
            recognizable = bool(meta["magic"] or meta["possible_openpgp_armor"] or readable)
            record.update({
                "status": "raw_bytes_read",
                "length": len(payload),
                "sha256": meta["payload_sha256"],
                "source_forced_header": meta["header_is_source_forced"],
                "prefix_hex": meta["prefix_hex"],
                "printable_fraction": round(meta["printable_fraction"], 5),
                "entropy": round(meta["entropy_bits_per_byte"], 5),
                "magic": meta["magic"],
                "pgp_armor": meta["possible_openpgp_armor"],
                "readable_utf8": readable,
                "independently_recognizable": recognizable
            })
        findings.append(record)
    print(json.dumps({
        "source_key": "exact 2013 title: The Instar Emergence",
        "source_clue": "later LP2 p14 / p23 mayfly illustrations",
        "historical_control": "LP1 03.jpg Default key authentic PGP 31809 bytes: PASS",
        "attempts": len(findings),
        "findings": findings
    }, indent=2))


if __name__ == "__main__":
    main()
