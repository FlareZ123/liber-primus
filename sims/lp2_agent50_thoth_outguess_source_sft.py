#!/usr/bin/env python3
"""Original LP2 THOTH glyph-packet OutGuess source-exact receiver.

Causal selector (conditional, not an authenticated author instruction):
p57 sentence prime ordinals 205-173=32 and 201-173=28 select
physical p32 rune28, 49.jpg. There: TH F|-F O TH, deleting facing
F word edges produces literal GP-native THOTH. Independently the
p32/p55 original tree images share the same stock art. Fix exactly
one uppercase Latin key THOTH and only those two original JPEGs.
Accept only independently recognizable recovered data, NOT any
length-consistent OutGuess header (many original images force 1-bits).
Test known 2012 LP1 signed-image positive before unknown targets.
"""
from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "sims"))
from outguess_extract import build_bitmap, extract  # noqa: E402

PASSWORD = "THOTH"
TARGETS = ((32, "49.jpg"), (55, "72.jpg"))


def main() -> None:
    lp1_positive = ROOT / "resources" / "liber-primus" / "03.jpg"
    bitmap, nbits = build_bitmap(lp1_positive)
    control, control_meta = extract(bitmap, nbits, "Default key")
    assert len(control) == 31809
    assert control.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
    assert not control_meta["header_is_source_forced"]

    rows = []
    for physical, file in TARGETS:
        image = ROOT / "resources" / "liber-primus" / file
        bitmap, nbits = build_bitmap(image)
        row = {"physical_page": physical, "original_image": file,
               "source_key": PASSWORD, "bitmap_bits": nbits}
        try:
            payload, metadata = extract(bitmap, nbits, PASSWORD)
        except ValueError as exc:
            row.update({"status": "reject", "reason": str(exc),
                        "recognizable_payload": False})
        else:
            magic = metadata["magic"]
            pgp = metadata["possible_openpgp_armor"]
            text = payload.decode("utf-8", errors="replace")
            textlike = (len(payload) >= 64 and "\ufffd" not in text
                        and sum(32 <= k < 127 or k in (9, 10, 13)
                                for k in payload) / len(payload) >= .95)
            recognizable = bool(magic) or pgp or textlike
            row.update({
                "status": "header_permits_read",
                "apparent_len": len(payload),
                "header_is_source_forced": metadata["header_is_source_forced"],
                "payload_sha256": metadata["payload_sha256"],
                "prefix_hex": metadata["prefix_hex"],
                "entropy_bits_per_byte": round(metadata["entropy_bits_per_byte"], 5),
                "printable_fraction": round(metadata["printable_fraction"], 5),
                "magic": magic, "openpgp_armor": pgp,
                "high_printable_utf8": textlike,
                "recognizable_payload": recognizable,
            })
            if recognizable:
                row["first_200_utf8"] = text[:200]
        rows.append(row)

    report = {
        "control": "original 03.jpg / Default key / 31809-byte PGP: PASS",
        "source_selector": "p57 ordinal differences (32,28) and p32 facing F word edges -> THOTH",
        "inferred_key": PASSWORD,
        "fixed_original_targets": [name for _, name in TARGETS],
        "attempt_count": len(rows),
        "results": rows,
        "independently_recognizable_payloads": sum(x["recognizable_payload"] for x in rows),
        "status": "SOURCE-FIXED TEST ONLY: no unknown plaintext unless payload independently authenticates",
    }
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
