#!/usr/bin/env python3
"""Inspect all 17 exact original LP1 JPEGs under one standard OutGuess key.

Question: do historically signed creator-confirmed message carriers ever use
a seed above the pinned upstream 0..255 default embedding search bound?
Requires pinned project OutGuess reader and libjpeg-dev, no files modified.
"""
from __future__ import annotations
import hashlib
import json
import pathlib
from outguess_extract import build_bitmap, extract

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCANS = ROOT / "resources/liber-primus"

def main() -> None:
    rows = []
    for i in range(17):
        bitmap, bit_count = build_bitmap(SCANS / f"{i:02}.jpg")
        row = {"scan":f"{i:02}.jpg","eligibleBits":bit_count}
        try:
            data, meta = extract(bitmap, bit_count, "Default key")
            printable = sum(c in (9,10,13) or 32 <= c <= 126 for c in data) / len(data)
            # Signed textual controls, unsigned known 2014 08 OutGuess message,
            # and raw possible strings are each labeled separately.
            row.update({
                "seed":meta["seed"],"length":len(data),
                "sha256":hashlib.sha256(data).hexdigest(),
                "pgpSigned":data.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----"),
                "pgpSignature":data.startswith(b"-----BEGIN PGP SIGNATURE-----"),
                "known08Text":b"For those who have fallen behind" in data,
                "printable":round(printable,6),
                "first80":data[:80].decode("latin1").encode("unicode_escape").decode()[:120]
            })
        except ValueError as exc:
            row["noValidExtraction"] = str(exc)[:180]
        rows.append(row)
    true = [r for r in rows if r.get("pgpSigned") or r.get("known08Text")]
    assert len(true) >= 3, "Known original LP1 controls should be identifiable"
    assert {r["scan"] for r in true} >= {"00.jpg","03.jpg","08.jpg"}
    assert all(r["seed"] < 256 for r in true), "counterexample: historical genuine message outside normal default embedding range"
    print(json.dumps({
        "hypothesis":"All unequivocally recognizable original LP1 default-key message outputs use normal default embedding seeds below256",
        "sourceImages":17,
        "recognizedOriginalMessages":len(true),
        "recognizedMessageSeeds":[{"scan":r["scan"],"seed":r["seed"],"length":r["length"]} for r in true],
        "unrecognizedResultsDoNotCountAsEvidenceOfEmbedding":True,
        "allRows":rows
    },indent=2))

if __name__ == "__main__":
    main()
