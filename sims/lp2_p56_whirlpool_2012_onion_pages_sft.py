#!/usr/bin/env python3
"""Bounded p56 test of archived 2012 onion page objects and its exact screenshot.

Whirlpool is community-reported, not first-party selected. SHA-512 is tested
because the p56 target is 128 hexadecimal characters. The screenshot is a
source-pinned capture of /cgi-bin/get_email, not the missing dynamic /NUMBER
response or original HTTP entity.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

from lp2_p56_whirlpool_historical_onion_sft import TARGET, WHIRLPOOL_ABC, whirlpool

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOT_SOURCE = {
    "repository": "cicada-solvers/neuroretransmit-cicada",
    "commit": "b13600373d3400d75ec4208198019f3d92a304dd",
    "path": "2012/007-onions/sq6wmgv2zcsrix6t.onion/screenshots/6mBiv.jpg",
    "bytes": 123011,
    "git_blob_sha1": "908ec5b74fd99ff9bf5a440e1685ca317dc88c26",
}


def read(relative: str) -> bytes:
    return (ROOT / relative).read_bytes()


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\\0".encode("ascii") + data).hexdigest()


def digests(data: bytes) -> dict[str, str | bool]:
    sha512 = hashlib.sha512(data).hexdigest()
    wp = whirlpool(data)
    return {
        "sha512": sha512,
        "whirlpool": wp,
        "matches_p56_sha512": sha512 == TARGET,
        "matches_p56_whirlpool": wp == TARGET,
    }


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
        forms.append({
            "source": label,
            "path": relative,
            "byte_length": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            **digests(data),
        })

    screenshot_path = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if screenshot_path is None:
        raise RuntimeError("Pass the source-pinned 6mBiv.jpg screenshot path")
    screenshot = screenshot_path.read_bytes()
    if len(screenshot) != SCREENSHOT_SOURCE["bytes"]:
        raise RuntimeError(f"screenshot length mismatch: {len(screenshot)}")
    blob_sha1 = git_blob_sha1(screenshot)
    if blob_sha1 != SCREENSHOT_SOURCE["git_blob_sha1"]:
        raise RuntimeError(f"screenshot Git blob mismatch: {blob_sha1}")
    screenshot_result = {
        "source": "2012 sq6wmgv2zcsrix6t.onion /cgi-bin/get_email screenshot",
        "repository": SCREENSHOT_SOURCE["repository"],
        "commit": SCREENSHOT_SOURCE["commit"],
        "path": SCREENSHOT_SOURCE["path"],
        "byte_length": len(screenshot),
        "git_blob_sha1": blob_sha1,
        "sha256": hashlib.sha256(screenshot).hexdigest(),
        **digests(screenshot),
        "visual_observation": "Browser capture shows /cgi-bin/get_email, requests a public email address, and says the participant must append the emailed number to the URL; it is not the later /NUMBER response.",
    }

    matches = [item for item in forms if item["matches_p56_whirlpool"] or item["matches_p56_sha512"]]
    if screenshot_result["matches_p56_whirlpool"] or screenshot_result["matches_p56_sha512"]:
        matches.append(screenshot_result)
    result = {
        "test": "p56 target vs three exact 2012 onion page/source objects plus one source-pinned page screenshot",
        "algorithms": ["SHA-512", "Whirlpool"],
        "algorithm_status": {
            "SHA-512": "natural candidate for a 128-hex target; not first-party selected",
            "Whirlpool": "community-reported by a 2016 Tor Stack Exchange answer; not first-party selected",
        },
        "openssl_version": openssl_version,
        "positive_control": {"input": "abc", "whirlpool": WHIRLPOOL_ABC, "passed": True},
        "target_p56_digest": target,
        "forms": forms,
        "screenshot": screenshot_result,
        "matches": matches,
        "decision": "MATCH_FOUND" if matches else "NO_DIRECT_MATCH_IN_THREE_2012_PAGE_FORMS_OR_ONE_SCREENSHOT",
        "limits": [
            "The two HTML objects are preserved archive copies, not original HTTP/WARC responses.",
            "The screenshot is a browser capture of /cgi-bin/get_email, not original HTTP entity bytes.",
            "The participant-specific /NUMBER response and the second-chance cginizi page remain unavailable.",
            "This does not test guessed wrappers, URL encodings, normalization, passwords, KDFs, or other hash families.",
            "A negative result does not exclude a lost original response or a different deep-web page.",
        ],
    }
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
