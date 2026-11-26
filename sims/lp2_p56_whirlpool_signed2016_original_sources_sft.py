#!/usr/bin/env python3
"""Source-locked Whirlpool check of the ten exact 2016/p32/p55 p56-hash candidates.

The 2016 Tor Stack Exchange answer mentions a Whirlpool lookup. This test
applies that one historically reported 512-bit digest family to the exact ten
byte strings already frozen in the SHA-512 gate. It does not generate URL,
whitespace, encoding, or password variants.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

from lp2_p56_whirlpool_historical_onion_sft import TARGET, WHIRLPOOL_ABC, whirlpool

ROOT = Path(__file__).resolve().parents[1]


def read(relative: str) -> bytes:
    return (ROOT / relative).read_bytes()


def main() -> int:
    openssl_version = subprocess.run(
        ["openssl", "version"], check=True, capture_output=True, text=True
    ).stdout.strip()
    if not openssl_version.startswith("OpenSSL 3."):
        raise RuntimeError(f"expected OpenSSL 3, got {openssl_version}")
    if whirlpool(b"abc") != WHIRLPOOL_ABC:
        raise RuntimeError("published Whirlpool abc known-answer test failed")

    manifest = json.loads(read("resources/cicada2014-archive-hash-manifest.json"))
    target = manifest["targetHex"]
    if target != TARGET or not re.fullmatch(r"[0-9a-f]{128}", target):
        raise RuntimeError("p56 target mismatch or malformed target")

    signed = read("resources/historical/cicada2016-4gq25-outguess.asc")
    if len(signed) != 1136:
        raise RuntimeError(f"unexpected signed OutGuess bytes: {len(signed)}")
    text = signed.decode("utf-8")
    begin = text.index("Hello.")
    end = text.index("-----BEGIN PGP SIGNATURE-----")
    cleartext = text[begin:end]
    canonical = "\r\n".join(
        line.rstrip(" \t") for line in cleartext.replace("\r\n", "\n").split("\n")
    )

    armor = text[end:]
    match = re.search(
        r"-----BEGIN PGP SIGNATURE-----\r?\nVersion: [^\r\n]+\r?\n\r?\n([\s\S]*?)\r?\n-----END PGP SIGNATURE-----",
        armor,
    )
    if not match:
        raise RuntimeError("could not parse the frozen OpenPGP signature armor")
    packet_b64 = "".join(
        line for line in match.group(1).splitlines()
        if line and not line.startswith("=")
    )
    import base64
    packet = base64.b64decode(packet_b64, validate=True)
    if len(packet) != 543:
        raise RuntimeError(f"unexpected signature packet length: {len(packet)}")
    mpi = packet[-512:]

    jpeg = read("resources/historical/cicada2016-4gq25.jpg")
    prefix = read("resources/historical/cicada2016-4gq25-20160109-prefix.txt")
    response = prefix + jpeg
    if (len(prefix), len(jpeg), len(response)) != (99, 26342, 26441):
        raise RuntimeError("the exact 2016-01-09 response lengths changed")
    response_sha256 = hashlib.sha256(response).hexdigest()
    if response_sha256 != "2aa61b8393e6d993646445caabccbf03812f553b24c8752c66eb1c9526b458f4":
        raise RuntimeError("the exact 2016-01-09 response SHA-256 changed")

    candidates = [
        ("signed 2016 JPEG raw bytes", jpeg),
        ("signed 2016 OutGuess ASCII raw bytes", signed),
        ("original LP2 p14 scan 31.jpg", read("resources/liber-primus/31.jpg")),
        ("original LP2 p32 scan 49.jpg", read("resources/liber-primus/49.jpg")),
        ("original LP2 p55 scan 72.jpg", read("resources/liber-primus/72.jpg")),
        ("2016 cleartext exact on-disk line endings", cleartext.encode("utf-8")),
        ("2016 cleartext canonical CRLF", canonical.encode("utf-8")),
        ("2016 OpenPGP signature packet", packet),
        ("2016 OpenPGP signature RSA MPI", mpi),
        ("2016-01-09 exact HTTP body: 99-byte preamble + JPEG", response),
    ]

    forms = []
    for name, data in candidates:
        digest = whirlpool(data)
        forms.append({
            "source": name,
            "byte_length": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "whirlpool": digest,
            "matches_p56_target": digest == target,
        })

    matches = [item for item in forms if item["matches_p56_target"]]
    result = {
        "test": "p56 target vs ten frozen 2016 signed-source and original LP2 tree-carrier byte forms",
        "algorithm": "Whirlpool (OpenSSL 3 legacy provider)",
        "openssl_version": openssl_version,
        "positive_control": {"input": "abc", "digest": WHIRLPOOL_ABC, "passed": True},
        "target_p56_digest": target,
        "source_2016_http_body": {
            "byte_length": len(response),
            "sha256": response_sha256,
            "prefix_bytes": len(prefix),
            "jpeg_bytes": len(jpeg),
        },
        "forms": forms,
        "matches": matches,
        "decision": (
            "MATCH_FOUND" if matches
            else "NO_DIRECT_WHIRLPOOL_MATCH_IN_TEN_FROZEN_2016_SOURCE_FORMS"
        ),
        "limits": [
            "This tests only the ten exact source forms also used by the SHA-512 gate.",
            "It does not test guessed HTML wrappers, URL serializations, passwords, KDFs, or arbitrary hash families.",
            "A negative result does not exclude an unavailable deep-web page or a historically different response body.",
        ],
    }
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
