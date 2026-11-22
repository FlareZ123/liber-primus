#!/usr/bin/env python3
"""Source-derived RIGHT OutGuess 0.4 key on all 58 byte-preserved LP2 JPEGs.

One fixed key, one first-party historical positive control, no brute-force
password variants, no output writes. Runs with libjpeg headers and C compiler.
"""
from __future__ import annotations

import json
import pathlib
import re

from outguess_extract import build_bitmap, extract

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCES = ROOT / "resources"
PAGE_DIR = SOURCES / "liber-primus"

html = (SOURCES / "historical" / "stage11-2014-index.html").read_text("utf-8")
title = int(re.search(r"<title>(\d+)</title>", html).group(1))
div_id = int(re.search(r'<div id="(\d+)">', html).group(1))
assert (title, div_id) == (133, 331)
corpus = json.loads((PAGE_DIR / "lp2-corpus.json").read_text("utf-8"))
grid = json.loads((PAGE_DIR / "base60-grid.json").read_text("utf-8"))
bytes256 = [value for row in grid["byte_rows"] for value in row]
assert len(bytes256) == 256

combined = int(str(title) + str(div_id))
factors = []
remainder = combined
for prime in corpus["prime"]:
    while remainder % prime == 0:
        remainder //= prime
        factors.append(prime)
assert remainder == 1
assert factors == [11, 17, 23, 31]
rank = {prime: index for index, prime in enumerate(corpus["prime"])}
t_index = bytes256[bytes256[sum(factors)]] % len(corpus["prime"])
assert t_index == (title + div_id) // len(corpus["prime"]) == 16
password = "".join(corpus["translit"][rank[factors[i]]] for i in (0, 3, 1, 2))
password += corpus["translit"][t_index]
assert password == "RIGHT"

# Real, previously known non-LP2 positive: old LP1 page03 via OutGuess 0.4.
positive_jpeg = PAGE_DIR / "03.jpg"
positive_map, positive_bits = build_bitmap(positive_jpeg)
positive, positive_meta = extract(positive_map, positive_bits, "Default key")
assert len(positive) == 31809
assert positive.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
print("SOURCE_AUTHENTIC_OUTGUESS_POSITIVE_OK", positive_jpeg.name,
      positive_meta["payload_sha256"], len(positive))

results = []
for image_num in range(17, 75):
    original = PAGE_DIR / f"{image_num:02d}.jpg"
    assert original.is_file() and original.stat().st_size > 10000, original
    bitmap, eligible_bits = build_bitmap(original)
    entry = {
        "file": original.name,
        "source_bytes": original.stat().st_size,
        "eligible_bits": eligible_bits,
        "source_forced_header": len(bitmap) >= 128 and bitmap[:128] == b"\xff" * 128,
    }
    try:
        payload, metadata = extract(bitmap, eligible_bits, password)
    except ValueError as error:
        entry["result"] = "rejected_header_or_iterator"
        entry["reason"] = str(error)[:180]
    else:
        entry.update({
            "result": "raw_header_accepted",
            "length": len(payload),
            "sha256": metadata["payload_sha256"],
            "entropy": round(metadata["entropy_bits_per_byte"], 5),
            "printable": round(metadata["printable_fraction"], 5),
            "magic": metadata["magic"],
            "openpgp_armor": metadata["possible_openpgp_armor"],
            "prefix": metadata["prefix_hex"],
        })
        if metadata["magic"] or metadata["possible_openpgp_armor"]:
            entry["result"] = "recognizable_payload_magic"
        elif metadata["printable_fraction"] >= 0.8 and len(payload) >= 32:
            entry["result"] = "printable_payload_candidate"
    results.append(entry)
    print("JPEG", json.dumps(entry, sort_keys=True))

assert len(results) == 58
print("SUMMARY", json.dumps({
    "source": "2014 HTML 133/331 GP-factor outside-in + original table 201->74",
    "password": password,
    "original_pages": len(results),
    "known_2014_LP1_positive": True,
    "recognizable": [r["file"] for r in results
                     if r["result"] in
                     ("recognizable_payload_magic", "printable_payload_candidate")],
    "header_accepted": sum(
        r["result"] != "rejected_header_or_iterator" for r in results),
    "forced_header": sum(r["source_forced_header"] for r in results),
}, sort_keys=True))
