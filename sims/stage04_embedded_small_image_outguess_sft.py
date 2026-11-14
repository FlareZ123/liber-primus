#!/usr/bin/env python3
"""Source-fixed OutGuess check of the small JPEG carried in the 2014 signed Stage04 text.

A second OutGuess layer here could supply contemporary key material. The only keys
considered are OutGuess's documented default and the exact historical phrase
used to decipher the runes of this same embedded image.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

from outguess_extract import build_bitmap, extract

ROOT = Path(__file__).resolve().parents[1]
SMALL = ROOT / "resources/external/derived/2014-stage04/03-small-rune-image.jpg"
CONTROL = ROOT / "resources/liber-primus/03.jpg"
EXPECTED_SMALL_BLOB = "f91bdd6e2a890968a5a13d39be4d56899b877920"
EXPECTED_CONTROL_SHA256 = "a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1"


def blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def extract_summary(bitmap: bytes, bit_count: int, password: str) -> dict:
    try:
        payload, meta = extract(bitmap, bit_count, password)
    except ValueError as exc:
        return {"key": password, "result": "header_or_capacity_rejected", "reason": str(exc)}
    printable = [line.decode("ascii", "replace") for line in payload.splitlines()
                 if len(line) >= 24 and all(byte in (9, 10, 13) or 32 <= byte <= 126 for byte in line)]
    return {
        "key": password,
        "result": "candidate_extraction_only",
        "header_source_forced": meta["header_is_source_forced"],
        "seed": meta["seed"],
        "bytes": len(payload),
        "sha256": meta["payload_sha256"],
        "prefix_hex": meta["prefix_hex"],
        "entropy_bits_per_byte": round(meta["entropy_bits_per_byte"], 6),
        "printable_fraction": round(meta["printable_fraction"], 6),
        "recognised_magic": meta["magic"],
        "long_printable_lines": printable[:3],
    }


def checked_bitmap(image: Path) -> tuple[bytes, int]:
    try:
        return build_bitmap(image)
    except subprocess.CalledProcessError as exc:
        detail = exc.stderr.decode("utf-8", "replace") if isinstance(exc.stderr, bytes) else exc.stderr
        raise RuntimeError(f"OutGuess JPEG bitmap compiler failed: {detail}") from exc


def main() -> None:
    small = SMALL.read_bytes()
    assert len(small) == 15188
    assert blob_sha1(small) == EXPECTED_SMALL_BLOB

    control_bits, control_bit_count = checked_bitmap(CONTROL)
    control_payload, control_meta = extract(control_bits, control_bit_count, "Default key")
    assert hashlib.sha256(control_payload).hexdigest() == EXPECTED_CONTROL_SHA256
    assert control_payload.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
    assert control_meta["length"] == 31809

    bitmap, bit_count = checked_bitmap(SMALL)
    results = [extract_summary(bitmap, bit_count, key) for key in (
        "Default key", "WELCOME PILGRIM TO THE"
    )]
    report = {
        "scope": "One original 2014 PGP-signed nested JPEG, distinct from the 75 page images",
        "source_image": str(SMALL.relative_to(ROOT)),
        "source_bytes": len(small),
        "source_sha256": hashlib.sha256(small).hexdigest(),
        "source_git_blob_sha1": blob_sha1(small),
        "eligible_outguess_coefficients": bit_count,
        "source_bitmap_sha256": hashlib.sha256(bitmap).hexdigest(),
        "authenticated_default_outguess_control": {
            "source": "resources/liber-primus/03.jpg", "bytes": len(control_payload),
            "sha256": hashlib.sha256(control_payload).hexdigest(),
            "identification": "signed PGP text",
        },
        "frozen_keys": results,
        "claim": "Only a structured extracted payload would justify a further historical source-led decode",
    }
    print(json.dumps(report, indent=2, ensure_ascii=True))


if __name__ == "__main__":
    main()
