#!/usr/bin/env python3
"""Source-pinned 2014 signed-margin signature-index candidate on LP2 JPEGs.

The archived May 2014 clear-signed message has exactly eleven whitespace
widths, the first twelve primes with GP prime 19 omitted. As zero-based
character positions in successive 64-character OpenPGP signature lines
these emit I8XwhKTScAn, ending in a case-insensitive English SCAN.

This is an exploratory source-derived password candidate. The whitespace
widths are not cryptographically authenticated by OpenPGP; a phrase ending
recognized after extraction has not established the creator's intent.

Reproduction requires Python 3, an installed C compiler and libjpeg headers
as in sims/outguess_extract.py. Read-only; original source JPEGs.
"""
from __future__ import annotations

import json
import pathlib
import re

from outguess_extract import build_bitmap, extract, header_is_source_forced

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "historical" / "cicada2014-stage11-message.asc"
SCANS = ROOT / "resources" / "liber-primus"
PRIMES = [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37]
POSITIVE_SHA = "a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1"


def derive_passwords(message: str) -> tuple[str, str]:
    assert "Hash: SHA1\n\n" in message
    unsigned_body = message.split("Hash: SHA1\n\n", 1)[1].split(
        "-----BEGIN PGP SIGNATURE-----", 1
    )[0]
    widths = []
    for line in unsigned_body.strip("\n").splitlines():
        if line and line.isspace():
            widths.append(len(line))
            continue
        lead = len(line) - len(line.lstrip(" "))
        trail = len(line) - len(line.rstrip(" "))
        if lead:
            widths.append(lead)
        if trail:
            widths.append(trail)
    assert widths == PRIMES, widths

    armor = message.split("-----BEGIN PGP SIGNATURE-----", 1)[1].split(
        "-----END PGP SIGNATURE-----", 1
    )[0]
    rows = [
        line.strip()
        for line in armor.splitlines()
        if re.fullmatch(r"[A-Za-z0-9+/]{20,64}", line.strip())
    ]
    assert len(rows) == 12 and [len(s) for s in rows] == [64] * 11 + [20]
    zero_based = "".join(rows[i][prime] for i, prime in enumerate(PRIMES))
    one_based = "".join(rows[i][prime - 1] for i, prime in enumerate(PRIMES))
    assert zero_based == "I8XwhKTScAn"
    assert one_based == "Q55koweATyH"
    return zero_based, one_based


def main() -> None:
    candidate, one_based = derive_passwords(SOURCE.read_text("utf-8"))

    known_bitmap, known_bits = build_bitmap(SCANS / "03.jpg")
    known_payload, known_meta = extract(known_bitmap, known_bits, "Default key")
    assert len(known_payload) == 31809
    assert known_meta["payload_sha256"] == POSITIVE_SHA
    assert known_payload.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")

    scan_summaries = []
    for scan in range(17, 75):
        bitmap, bit_count = build_bitmap(SCANS / f"{scan:02d}.jpg")
        assert header_is_source_forced(bitmap, bit_count)
        payload, meta = extract(bitmap, bit_count, candidate)
        assert len(payload) == 310
        assert meta["header_hex"] == "58b13601"
        assert meta["encrypted_header_hex"] == "ffffffff"
        assert meta["seed"] == 45400
        assert not meta["magic"] and not meta["payload_tail_magic"]
        assert not meta["possible_openpgp_armor"]
        scan_summaries.append(
            {
                "scan": f"{scan:02d}.jpg",
                "sha256": meta["payload_sha256"],
                "printableFraction": round(meta["printable_fraction"], 5),
                "entropyBitsPerByte": round(meta["entropy_bits_per_byte"], 5),
            }
        )
    assert len(scan_summaries) == 58
    assert max(x["printableFraction"] for x in scan_summaries) < 0.5
    assert min(x["entropyBitsPerByte"] for x in scan_summaries) > 7.0
    print(
        json.dumps(
            {
                "firstPartySignedMessage": str(SOURCE.relative_to(ROOT)),
                "unsignedWidths": PRIMES,
                "excludedFirstTwelvePrime": 19,
                "zeroBasedSignatureColumnPassword": candidate,
                "oneBasedControl": one_based,
                "signatureDataRows": 12,
                "knownHistoricalOutGuessControl": "PASS / 03.jpg / 31809 bytes",
                "originalLP2Jpegs": 58,
                "sourceForcedFfHeader": 58,
                "candidateHeader": "58b13601",
                "apparentPayloadLength": 310,
                "recognizableFileHeaders": 0,
                "maxPrintableFraction": max(
                    x["printableFraction"] for x in scan_summaries
                ),
                "minEntropyBitsPerByte": min(
                    x["entropyBitsPerByte"] for x in scan_summaries
                ),
                "authenticUnknownPagePlaintextRecovered": False,
                "recoveredCreatorPassword": False,
                "imageSummaries": scan_summaries,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
