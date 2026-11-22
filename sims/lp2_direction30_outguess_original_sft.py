#!/usr/bin/env python3
"""Test one source-suggested password on all 58 original LP2 JPEGs.

Signed 2016 DIRECTION word #30 (including Hello greeting) -> p50 original
table row #30 -> printable 16-character original-token password.
This tests a historically authentic OutGuess receiver, rather than a newly
invented GP cipher. Read-only. Preserve rejected header evidence.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re

from outguess_extract import build_bitmap, extract, header_is_source_forced

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "resources"
PAGE = RES / "liber-primus"

signed = (RES / "historical" / "cicada2016-4gq25-outguess.asc").read_text("utf-8")
start = signed.upper().index("HELLO")
end = signed.index("-----BEGIN PGP SIGNATURE-----", start)
words = re.findall(r"[A-Za-z]+", signed[start:end])
direction = 1 + next(i for i, w in enumerate(words) if w.upper() == "DIRECTION")
assert direction == 30

table = json.loads((PAGE / "lp2-grid-256.json").read_text("utf-8"))
tokens = [token for page in table["pages"] for token in page["tokens"]]
assert len(tokens) == 256
row = tokens[(direction - 1) * 8:direction * 8]
assert row == ["1k", "3s", "3G", "21", "3w", "0W", "29", "2r"]
password = "".join(row)
assert password == "1k3s3G213w0W292r"
# These are the physically printed characters, not a binary KDF guessed
# after output inspection. OutGuess 0.2 is a historically used Cicada tool.

bitmap, nbits = build_bitmap(PAGE / "03.jpg")
positive, meta = extract(bitmap, nbits, "Default key")
assert positive.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
assert len(positive) == 31809
print("KNOWN_FIRST_PARTY_OUTGUESS_CONTROL", meta["payload_sha256"], len(positive))
print("ROW30", json.dumps({"ordinal": direction, "tokens": row, "password": password}))

results = []
for n in range(17, 75):
    file = PAGE / f"{n:02d}.jpg"
    assert file.is_file() and file.stat().st_size > 10000, file
    bitmap, nbits = build_bitmap(file)
    info = {
        "scan": file.name, "eligible_bits": nbits,
        "source_forces_header": header_is_source_forced(bitmap, nbits),
    }
    try:
        payload, metadata = extract(bitmap, nbits, password)
    except ValueError as error:
        info["result"] = "rejected_header_or_iterator"
        info["reason"] = str(error)[:150]
    else:
        info.update({
            "result": "header_accepted",
            "encrypted_header_hex": metadata["encrypted_header_hex"],
            "decoded_header_hex": metadata["header_hex"],
            "length": len(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
            "prefix": payload[:32].hex(),
            "magic": metadata["magic"],
            "printable": round(metadata["printable_fraction"], 4),
            "armor": metadata["possible_openpgp_armor"],
        })
    results.append(info)
    print("SCAN", json.dumps(info, sort_keys=True))

assert len(results) == 58
survivors = [entry for entry in results if entry["result"] == "header_accepted"]
rejects = [entry for entry in results if entry["result"] == "rejected_header_or_iterator"]
recognizable = [
    entry for entry in survivors
    if entry["magic"] or entry["armor"]
    or (entry["printable"] >= 0.8 and entry["length"] >= 32)
]
# The source contains a known wrong-key-like 32-byte header candidate. The
# extractor's acceptance alone cannot establish an embedded original payload.
assert len(survivors) == 57, survivors
assert all(entry["source_forces_header"] for entry in results)
assert {entry["encrypted_header_hex"] for entry in survivors} == {"ffffffff"}
assert len(rejects) == 1 and rejects[0]["scan"] == "74.jpg", rejects
assert not recognizable, recognizable
assert {entry["length"] for entry in survivors} == {32904}
assert {entry["prefix"] for entry in survivors} == {
    "8ca188804d02f5cc41485a86b8509ebe845d4612f2ea36b14ec73733c06c82a3"
}
assert len({entry["sha256"] for entry in survivors}) == 57
print("SUMMARY", json.dumps({
    "source": "signed 2016 DIRECTION word30 -> table row30 printed token password",
    "password": password,
    "scans": len(results),
    "positive_control": True,
    "header_survivors": len(survivors),
    "rejected": rejects,
    "recognizable_payloads": recognizable,
    "distinct_survivor_sha256": len({entry["sha256"] for entry in survivors}),
    "common_survivor_prefix_hex": survivors[0]["prefix"],
    "common_survivor_length": survivors[0]["length"],
    "every_original_header_source_forced": True,
    "encrypted_header_hex": "ffffffff",
    "decoded_header_hex": survivors[0]["decoded_header_hex"],
    "conclusion": "no recognizable PGP/file/printable payload"
}, sort_keys=True))
