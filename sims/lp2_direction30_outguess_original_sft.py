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

from outguess_extract import build_bitmap, extract

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
    info = {"scan": file.name, "eligible_bits": nbits}
    try:
        payload, metadata = extract(bitmap, nbits, password)
    except ValueError as error:
        info["result"] = "rejected_header_or_iterator"
        info["reason"] = str(error)[:150]
    else:
        info.update({
            "result": "header_accepted",
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
survivors = [row for row in results if row["result"] != "rejected_header_or_iterator"]
print("SUMMARY", json.dumps({
    "source": "signed 2016 DIRECTION word30 -> table row30 printed token password",
    "password": password,
    "scans": len(results),
    "positive_control": True,
    "header_survivors": survivors,
}, sort_keys=True))
