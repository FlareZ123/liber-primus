#!/usr/bin/env python3
"""Test the three exact preserved 2012 deep-web page/source byte forms under Whirlpool.

The only algorithm rationale is the community-reported Whirlpool lookup in the
2016 Tor Stack Exchange answer. This is a bounded candidate check, not a claim
that Cicada specified Whirlpool or that these archived pages are the target.
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

    candidates = [
        ("2012 original onion enrollment root HTML archive copy",
         "resources/external/2012-sq6wmgv2zcsrix6t-onion-index.html", 1788),
        ("2012 original onion post-page HTML archive copy",
         "resources/external/2012-sq6wmgv2zcsrix6t-post-index.html", 1740),
        ("2012 Cicada-signed enrollment/congratulations message",
         "resources/external/2012-sq6wmgv2zcsrix6t-congratulations.asc", 1433),
    ]

    forms = []
    for label, relative, expected_length in candidates:
        data = read(relative)
        if len(data) != expected_length:
            raise RuntimeError(f"{relative}: expected {expected_length} bytes, got {len(data)}")
        digest = whirlpool(data)
        forms.append({
            "source": label,
            "path": relative,
            "byte_length": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "whirlpool": digest,
            "matches_p56_target": digest == target,
        })

    matches = [item for item in forms if item["matches_p56_target"]]
    result = {
        "test": "p56 target vs three exact 2012 Cicada deep-web page/source objects",
        "algorithm": "Whirlpool (OpenSSL 3 legacy provider)",
        "algorithm_status": "community-reported by a 2016 Tor Stack Exchange answer; not first-party selected",
        "openssl_version": openssl_version,
        "positive_control": {"input": "abc", "digest": WHIRLPOOL_ABC, "passed": True},
        "target_p56_digest": target,
        "forms": forms,
        "matches": matches,
        "decision": "MATCH_FOUND" if matches else "NO_DIRECT_WHIRLPOOL_MATCH_IN_THREE_FROZEN_2012_SOURCE_FORMS",
        "limits": [
            "The two HTML objects are preserved archive copies, not original HTTP/WARC responses.",
            "The 2012 participant-specific /NUMBER response and second-chance page remain unavailable.",
            "This does not test guessed wrappers, URL encodings, normalization, passwords, KDFs, or other hash families.",
            "A negative result does not exclude a lost original response or a different deep-web page.",
        ],
    }
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
