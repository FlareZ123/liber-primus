#!/usr/bin/env python3
"""One exact Cicada-period auxiliary Twitter avatar stego consumer.

The source image is the 400x400 archived @991948530947554 profile
with corner digits 9-9-0-1, and 9901 was also its reported bio.
Only the literal key '9901' and the exact historical 'Default key' are tested.
The account's relation to the real Cicada organization is unverified.

Runs on an Ubuntu Actions runner with libjpeg-dev, using the existing
repository OutGuess 0.4 coefficient/ARC4 implementation. No output files.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from outguess_extract import build_bitmap, detect_magic, extract

ROOT = Path(__file__).resolve().parent.parent
IMAGE = ROOT / "resources/external/cicada2014-aux-twitter-9901-profile.jpeg"
LP1_CONTROL = ROOT / "resources/liber-primus/03.jpg"
EXPECTED_BLOB = "c3f0011f9c3e6de4338a2c7cac95535b04e2bb18"


def git_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode()
    return hashlib.sha1(header + data).hexdigest()


def probe(image: Path, key: str) -> dict:
    bitmap, bit_count = build_bitmap(image)
    record = {
        "filename": image.name,
        "key": key,
        "eligible_bit_count": bit_count,
        "bitmap_len": len(bitmap),
    }
    try:
        payload, info = extract(bitmap, bit_count, key)
    except ValueError as exc:
        record["status"] = "no extractable header/payload"
        record["reason"] = str(exc)
        return record
    record.update({
        "status": "unvalidated header-consistent extraction",
        "length": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "first32hex": payload[:32].hex(),
        "magic": detect_magic(payload),
        "printable_fraction": sum(
            x in (9, 10, 13) or 32 <= x <= 126 for x in payload
        ) / len(payload),
        "forcibly_constant_header": info["header_is_source_forced"],
        "first48_ascii": "".join(
            chr(x) if 32 <= x <= 126 else "." for x in payload[:48]
        ),
    })
    return record


def main() -> None:
    source = IMAGE.read_bytes()
    assert git_sha1(source) == EXPECTED_BLOB, "Archived 2014 profile byte integrity"

    # Positive: genuine original LP1 image, authentic keyed "Default key" OutGuess path.
    control = probe(LP1_CONTROL, "Default key")
    assert control["status"] == "unvalidated header-consistent extraction", control
    assert control["length"] == 31809, control
    print("AUTHENTIC_LP1_CONTROL " + json.dumps(control, sort_keys=True), flush=True)
    assert control["first48_ascii"].startswith(
        "-----BEGIN PGP SIGNED MESSAGE-----"
    ), "Authentic 2014 LP1 Default key OutGuess control failed"
    tests = [probe(IMAGE, key) for key in ("Default key", "9901")]
    print(json.dumps({
        "source_file": str(IMAGE.relative_to(ROOT)),
        "source_git_blob_sha1": EXPECTED_BLOB,
        "avatar_digit_order": "top-left 9, top-right 9, bottom-left 0, bottom-right 1",
        "reason_for_key": "profile text and biography literally 9901",
        "claimed_cicada_author": False,
        "source_proof": {"authentic_lp1_signed_control": True,
                         "control_extract_length": control["length"]},
        "probe": tests
    }, indent=2))
    for test in tests:
        if test["status"] == "unvalidated header-consistent extraction":
            assert not test["magic"], "Inspect an unexpectedly recognized file header"
            assert test["printable_fraction"] < 0.97, (
                "Inspect an unexpectedly readable embedded file"
            )
    print("PASS: exact-source profile probes with authentic LP1 positive; "
          "no recognized plaintext or file payload claimed.")


if __name__ == "__main__":
    main()
