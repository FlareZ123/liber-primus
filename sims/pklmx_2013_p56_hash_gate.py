#!/usr/bin/env python3
"""Direct p56 SHA-512 candidate test for the archived 2013 pklmx signed pages.

Run from the repository root:
    python3 sims/pklmx_2013_p56_hash_gate.py

This tests only exact participant-archive bytes and four literal address/URL
strings motivated by the p57 Instar cross-round reference. It does not claim
to recover the original 2013 HTTP response entity.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "historical" / "pklmx-2013"
TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a842"
    "5893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)

# SHA-512 known-answer test: the local hashing implementation must be sound.
assert hashlib.sha512(b"abc").hexdigest() == (
    "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a"
    "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
)

pages = [
    ("standby", "standby.html", "standby.txt.asc", 983, 909),
    ("okinawa", "okinawa.html", "okinawa-japan.txt.asc", 976, 902),
    ("annapolis", "annapolis.html", "annapolis-md.txt.asc", 978, 904),
]
candidates: list[tuple[str, bytes]] = []
for name, html_name, asc_name, html_size, asc_size in pages:
    html = (SOURCE / html_name).read_bytes()
    asc = (SOURCE / asc_name).read_bytes()
    assert len(html) == html_size, (html_name, len(html))
    assert len(asc) == asc_size, (asc_name, len(asc))
    match = re.search(rb"<pre>(.*?)</pre>", html, flags=re.S)
    assert match is not None
    assert match.group(1) == asc, f"{name}: signed <pre> payload differs from ASC"
    candidates.append((f"{html_name} (full HTML)", html))
    candidates.append((f"{asc_name} (signed payload)", asc))

strings = [
    ("reconstructed SSSS onion bare domain", "p7amjopgric7dfdi.onion"),
    ("2013 pklmx onion bare domain", "pklmx2eeh6fjt7zf.onion"),
    ("reconstructed SSSS onion HTTP URL", "http://p7amjopgric7dfdi.onion/"),
    ("2013 pklmx onion HTTP URL", "http://pklmx2eeh6fjt7zf.onion/"),
]
candidates.extend((name, value.encode("ascii")) for name, value in strings)

results = []
for name, data in candidates:
    digest = hashlib.sha512(data).hexdigest()
    results.append({
        "candidate": name,
        "bytes": len(data),
        "sha512": digest,
        "matches_p56_target": digest == TARGET,
    })

assert len(results) == 10
assert not any(item["matches_p56_target"] for item in results)
print(json.dumps({
    "target": TARGET,
    "candidate_count": len(results),
    "matches": 0,
    "results": results,
    "scope": (
        "Exact participant-archive HTML and clear-signed payload bytes, plus "
        "four literal onion-domain/HTTP-URL strings. The archived HTML files "
        "are not recovered original-server response bytes; the quoted 1869-byte "
        "HTTP entity remains unavailable."
    ),
}, indent=2))
