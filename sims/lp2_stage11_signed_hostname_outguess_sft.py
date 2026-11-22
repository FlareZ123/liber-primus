#!/usr/bin/env python3
"""Source-fixed Stage11 signed-host passphrase OutGuess original JPEG extraction.

The May 2014 Cicada-signed Stage11 handoff prints the full host
ky2khlqdf7qdznac.onion. Earlier genuine Cicada stages used OutGuess.
Only the exact signed hostname and its bare DNS label are considered.
This is a finite original-payload recovery attempt, not a password search.

Dependencies: built-in Python 3, a C compiler, libjpeg development headers,
and the existing source-exact sims/outguess_extract.py / bitmap dumper.
No output files are created. Run from the repository root.
"""
from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "sims"))
from outguess_extract import build_bitmap, extract  # noqa: E402

PASSWORDS = ("ky2khlqdf7qdznac.onion", "ky2khlqdf7qdznac")


def inspect_payload(payload: bytes, metadata: dict) -> dict:
    """Report independently checkable payload evidence, not header plausibility."""
    text = payload.decode("utf-8", errors="replace")
    normal = sum(ch.isprintable() or ch in "\r\n\t" for ch in text)
    printable_ratio = normal / len(text) if text else 0.0
    recognized = bool(metadata["magic"]) or metadata["possible_openpgp_armor"]
    readable = len(text) >= 64 and "\ufffd" not in text and printable_ratio >= 0.95
    return {
        "length": len(payload),
        "sha256": metadata["payload_sha256"],
        "sha512": metadata["payload_sha512"],
        "header_is_source_forced": metadata["header_is_source_forced"],
        "prefix_hex": metadata["prefix_hex"],
        "entropy": round(metadata["entropy_bits_per_byte"], 4),
        "printable_ascii_fraction": round(metadata["printable_fraction"], 4),
        "utf8_readable": readable,
        "magic": metadata["magic"],
        "pgp_armor": metadata["possible_openpgp_armor"],
        "candidate_payload": recognized or readable,
    }


def main() -> None:
    positive = ROOT / "resources" / "liber-primus" / "03.jpg"
    bitmap, size = build_bitmap(positive)
    known, _meta = extract(bitmap, size, "Default key")
    assert len(known) == 31809 and known.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----"), (
        "Historical OutGuess positive control failed: do not trust source results"
    )

    scans: list[dict] = []
    readable_candidates: list[dict] = []
    for physical in range(58):
        jpeg = ROOT / "resources" / "liber-primus" / f"{physical + 17:02d}.jpg"
        bitmap, size = build_bitmap(jpeg)
        for password in PASSWORDS:
            record: dict = {"physical_page": physical, "source_image": jpeg.name,
                            "password": password, "bitmap_bits": size}
            try:
                recovered, metadata = extract(bitmap, size, password)
            except ValueError as exc:
                record["status"] = "invalid_packet_header_or_bounds"
                record["reason"] = str(exc)
            else:
                record["status"] = "header_permits_read"
                record.update(inspect_payload(recovered, metadata))
                if record["candidate_payload"]:
                    readable_candidates.append(record.copy())
            scans.append(record)
    ok = [r for r in scans if r["status"] == "header_permits_read"]
    result = {
        "experiment": "May-2014 signed Stage11 literal-host OutGuess 0.4",
        "control": "original 03.jpg Default key, 31809-byte authenticated PGP armor: PASS",
        "physical_pages": 58,
        "fixed_source_passwords": list(PASSWORDS),
        "attempts": len(scans),
        "headers_allowing_read": len(ok),
        "independently_recognized_candidates": readable_candidates,
        "raw_attempts": scans,
        "interpretation": "Random-looking decoded header fields do not authenticate a payload. "
                          "Only independently recognizable extracted bytes warrant follow-up.",
    }
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
