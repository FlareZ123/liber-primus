#!/usr/bin/env python3
"""Source-frozen OutGuess test of p32's literal HOMEX clue.

The signed 2016 tree image selects p32; the p32 11x11 source runes contain
H O M E X beginning at zero-based index 33. OutGuess is an earlier verified
Cicada operation, so these four literal key spellings are finite candidates.
This test reports bytes and recognizes no unseen output as plaintext merely
because an OutGuess header decodes.

Run: python sims/lp2_p32_home_outguess_sft.py
Requires a C compiler, libjpeg, and the repository's existing
outguess_extract.py plus outguess_bitmap_dump.c. No files are written.
"""
from __future__ import annotations

import hashlib
import json
import pathlib

from outguess_extract import build_bitmap, extract

ROOT = pathlib.Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
SOURCES = ROOT / "resources/liber-primus"
CONTROL = ROOT / "resources/external/derived/2014-stage04/03-outguess.asc"
SHA = {
    "03": "b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f",
    "49": "c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72",
    "72": "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
}
KEYS = ("HOME", "HOMEX", "HOME X", "X")


def bitmap(scan: str) -> tuple[bytes, int]:
    source = SOURCES / (scan + ".jpg")
    assert hashlib.sha256(source.read_bytes()).hexdigest() == SHA[scan], scan
    return build_bitmap(source)


def main() -> None:
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    p32 = next(p["indices"] for p in corpus["pages"] if p["page"] == 32)
    p55 = next(p["indices"] for p in corpus["pages"] if p["page"] == 55)
    assert len(p32) == 121 and len(p55) == 76
    assert [corpus["translit"][r] for r in p32[33:38]] == list("HOMEX")

    cb, cn = bitmap("03")
    recovered, _ = extract(cb, cn, "Default key")
    original = CONTROL.read_bytes()
    assert recovered == original and len(original) == 31809
    assert recovered.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")

    probes = []
    for scan, page in (("49", 32), ("72", 55)):
        bs, nbits = bitmap(scan)
        for key in KEYS:
            try:
                payload, meta = extract(bs, nbits, key)
                printable = sum(
                    b in (9, 10, 13) or 32 <= b <= 126 for b in payload
                ) / len(payload)
                observed = {
                    "page": page, "scan": scan, "key": key,
                    "status": "extracted", "bytes": len(payload),
                    "seed": meta["seed"], "header": meta["header_hex"],
                    "sha256": meta["payload_sha256"],
                    "printable": round(printable, 6),
                    "magic": meta["magic"],
                    "openpgpArmor": meta["possible_openpgp_armor"],
                }
                assert meta["magic"] == []
                assert not meta["possible_openpgp_armor"]
                assert printable < 0.50
            except ValueError as exc:
                observed = {
                    "page": page, "scan": scan, "key": key,
                    "status": "invalid-header-or-iterator",
                    "reason": str(exc),
                }
            probes.append(observed)
    assert len(probes) == 8
    assert sum(p["status"] == "extracted" for p in probes) == 4
    print(json.dumps({
        "source": "Original LP2 p32 HOMEX at offsets 33..37; p32/p55 tree carriers",
        "knownPositive": "Original LP1 p03 OutGuess default-key 31809-byte signed text exact",
        "probes": probes,
        "conclusion": "No readable or recognized payload from these source-word keys; source does not explicitly command a keyed extraction",
    }, indent=2))


if __name__ == "__main__":
    main()
