#!/usr/bin/env python3
"""Source-locked p56 hash test for the 2014 Onion5 pre/post page snapshots.

The Stage5 OutGuess plaintext names q4utgdi2n4m4uim5.onion. This tests the
exact archived post snapshot as raw page bytes, plus the pre snapshot under
Whirlpool only (the other three 512-bit digests were already screened).
No URL variants, whitespace edits, or guessed salts are tried.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tempfile
import urllib.request

TARGET_HEX = (
    "36367763ab73783c7af284446c59466b"
    "4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e89"
    "1c6e2274568926a49fb4f45132c2a8b4"
)
TARGET_BYTES_SHA256 = "0911bf3c8cc3a73bbb346f82ba65daff3eb81914c4826060ac168bd0f55e267e"
UPSTREAM_COMMIT = "a0a616d85717af59f8b806875b43d51e06e1e874"
BASE = f"https://raw.githubusercontent.com/iBotPeaches/cicada_3301/{UPSTREAM_COMMIT}/onions/q4utgdi2n4m4uim5.onion"

SOURCES = {
    "post": {
        "path": "post/index.html",
        "size": 359_282,
        "git_blob_sha1": "58de2bf93cc61e6817f7cae98afd690df9b9d039",
        "algorithms": ("sha512", "sha3_512", "blake2b512", "whirlpool"),
    },
    "pre": {
        "path": "pre/index.html",
        "size": 13_526_359,
        "git_blob_sha1": "afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9",
        "algorithms": ("whirlpool",),
    },
}


def whirlpool(data: bytes) -> str:
    with tempfile.NamedTemporaryFile() as handle:
        handle.write(data)
        handle.flush()
        proc = subprocess.run(
            ["openssl", "dgst", "-provider", "legacy", "-whirlpool", handle.name],
            check=True, capture_output=True, text=True,
        )
    match = re.search(r"([0-9a-fA-F]{128})\s*$", proc.stdout)
    if not match:
        raise RuntimeError(f"Could not parse OpenSSL Whirlpool output: {proc.stdout!r}")
    return match.group(1).lower()


def fetch_and_check(name: str, spec: dict) -> dict:
    url = f"{BASE}/{spec['path']}"
    request = urllib.request.Request(url, headers={"User-Agent": "liber-primus-research"})
    with urllib.request.urlopen(request, timeout=120) as response:
        data = response.read()
    if len(data) != spec["size"]:
        raise RuntimeError(f"{name}: size mismatch: expected {spec['size']}, got {len(data)}")
    git_blob = hashlib.sha1(
        b"blob " + str(len(data)).encode("ascii") + b"\0" + data
    ).hexdigest()
    if git_blob != spec["git_blob_sha1"]:
        raise RuntimeError(f"{name}: Git blob mismatch: {git_blob}")
    result = {
        "snapshot": name,
        "path": spec["path"],
        "bytes": len(data),
        "git_blob_sha1": git_blob,
        "sha256": hashlib.sha256(data).hexdigest(),
        "hashes": {},
    }
    for algorithm in spec["algorithms"]:
        if algorithm == "sha512":
            digest = hashlib.sha512(data).hexdigest()
        elif algorithm == "sha3_512":
            digest = hashlib.sha3_512(data).hexdigest()
        elif algorithm == "blake2b512":
            digest = hashlib.blake2b(data, digest_size=64).hexdigest()
        elif algorithm == "whirlpool":
            digest = whirlpool(data)
        else:
            raise AssertionError(algorithm)
        result["hashes"][algorithm] = digest
        result.setdefault("matches", []).append(algorithm) if digest == TARGET_HEX else None
    return result


def main() -> None:
    target = bytes.fromhex(TARGET_HEX)
    assert len(TARGET_HEX) == 128 and len(target) == 64
    assert hashlib.sha256(target).hexdigest() == TARGET_BYTES_SHA256
    assert hashlib.sha512(b"abc").hexdigest() == (
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea"
        "20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd"
        "454d4423643ce80e2a9ac94fa54ca49f"
    )
    results = [fetch_and_check(name, spec) for name, spec in SOURCES.items()]
    print(json.dumps({
        "target": TARGET_HEX,
        "upstream_commit": UPSTREAM_COMMIT,
        "results": results,
        "any_match": any(item.get("matches") for item in results),
        "scope": "exact raw pre/post page bytes only; no guessed serializations",
    }, indent=2))
    if any(item.get("matches") for item in results):
        print("MATCH: an exact archived Onion5 page snapshot hashes to the p56 target")
    else:
        print("NO MATCH: neither tested raw Onion5 snapshot is the p56 preimage under its tested digest families")


if __name__ == "__main__":
    main()
