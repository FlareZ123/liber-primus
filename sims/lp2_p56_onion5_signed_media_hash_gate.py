#!/usr/bin/env python3
"""Test exact 2014 Fifth Onion signed-media byte forms against the LP2 p56 digest.

This is a bounded source-candidate gate, not a hash-algorithm or preimage search.
The source's own media parser fixes the 12,007-byte payload and its three parts.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources/historical/cicada2014-onion5-signed.asc"
MANIFEST = ROOT / "resources/cicada2014-archive-hash-manifest.json"
TARGET = json.loads(MANIFEST.read_text(encoding="utf-8"))["targetHex"]
assert re.fullmatch(r"[0-9a-f]{128}", TARGET)

raw = SOURCE.read_bytes()
text = raw.decode("utf-8")
assert text.startswith("-----BEGIN PGP SIGNED MESSAGE-----")
media_region = re.split(r"\r?\n3PI:", text, maxsplit=1)[0]
assert "Very good.  You have done well to come this far." in media_region
hex_text = "".join(
    line.strip()
    for line in media_region.splitlines()
    if re.fullmatch(r"[0-9a-f]+", line.strip())
)
assert len(hex_text) == 24014
media = bytes.fromhex(hex_text)
assert len(media) == 12007
assert hashlib.sha256(media).hexdigest() == (
    "ebe41c78a0471f145e0177ddfa339c32019fa9eca650ca2dc7d589a13550ed3c"
)
assert media[:2] == bytes.fromhex("ffd8")
assert media[1082:1084] == bytes.fromhex("ffd9")
assert media[1084:1086] == bytes.fromhex("ffd8")
assert media[2717:2719] == bytes.fromhex("ffd9")
assert media[2719:2721] == bytes.fromhex("fff3")

# The 2014 clear-signed page is a textual container; test its exact raw bytes,
# its exact cleartext region, the media's compact hex representation, the raw
# binary payload, and each independently delimited binary media component.
signature_marker = b"-----BEGIN PGP SIGNATURE-----"
sig_at = raw.find(signature_marker)
assert sig_at > 0
blank = re.search(rb"\r?\n\r?\n", raw)
assert blank
cleartext = raw[blank.end():sig_at]
candidates = [
    ("complete_original_clear-signed_file", raw),
    ("cleartext_after_pgp_headers_before_signature", cleartext),
    ("media_region_exact_text", media_region.encode("utf-8")),
    ("media_hex_compact_ascii", hex_text.encode("ascii")),
    ("media_payload_binary_12007", media),
    ("godel_jpeg_binary_1084", media[:1084]),
    ("escher_jpeg_binary_1635", media[1084:2719]),
    ("bach_audio_binary_9288", media[2719:]),
    ("godel_jpeg_hex_ascii", hex_text[:2168].encode("ascii")),
    ("escher_jpeg_hex_ascii", hex_text[2168:5438].encode("ascii")),
    ("bach_audio_hex_ascii", hex_text[5438:].encode("ascii")),
]

def whirlpool(data: bytes) -> str:
    result = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data, check=True, capture_output=True,
    ).stdout.decode("ascii").strip()
    return result.rsplit("=", 1)[-1].strip().lower()

rows = []
with tempfile.TemporaryDirectory(prefix="p56-onion5-") as tmp:
    for name, data in candidates:
        sha512 = hashlib.sha512(data).hexdigest()
        sha3_512 = hashlib.sha3_512(data).hexdigest()
        blake2b_512 = hashlib.blake2b(data, digest_size=64).hexdigest()
        wp = whirlpool(data)
        rows.append({
            "source_form": name,
            "bytes": len(data),
            "sha512": sha512,
            "sha3_512": sha3_512,
            "blake2b_512": blake2b_512,
            "whirlpool": wp,
            "matches": {
                "sha512": sha512 == TARGET,
                "sha3_512": sha3_512 == TARGET,
                "blake2b_512": blake2b_512 == TARGET,
                "whirlpool": wp == TARGET,
            },
        })

matches = [
    {"source_form": row["source_form"], "algorithm": alg}
    for row in rows for alg, yes in row["matches"].items() if yes
]
print(json.dumps({
    "test": "p56 digest against exact 2014 Fifth Onion signed-media source forms",
    "target": TARGET,
    "source_sha256": hashlib.sha256(raw).hexdigest(),
    "media_sha256_integrity": hashlib.sha256(media).hexdigest(),
    "media_components": [
        {"name": "Godel JPEG", "bytes": 1084},
        {"name": "Escher JPEG", "bytes": 1635},
        {"name": "Bach audio", "bytes": 9288},
    ],
    "candidates": rows,
    "matches": matches,
    "conclusion": (
        "EXACT SOURCE PREIMAGE FOUND" if matches else
        "No tested Fifth Onion signed-media source form matches the p56 digest"
    ),
}, indent=2))
