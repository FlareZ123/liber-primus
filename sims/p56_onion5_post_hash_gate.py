#!/usr/bin/env python3
"""Source-locked p56 hash tests for the 2014 Onion5 snapshots and embedded MP3.

The preceding Stage5 OutGuess payload names q4utgdi2n4m4uim5.onion. A
contemporaneous 2014 walkthrough describes this Onion5 page as a long hex
string that decodes to the "Interconnectedness" MP3. Test that source-selected
hex-decoded asset, not arbitrary file formats or guessed serializations.
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


def digest(data: bytes, algorithm: str) -> str:
    if algorithm == "sha512":
        return hashlib.sha512(data).hexdigest()
    if algorithm == "sha3_512":
        return hashlib.sha3_512(data).hexdigest()
    if algorithm == "blake2b512":
        return hashlib.blake2b(data, digest_size=64).hexdigest()
    if algorithm == "whirlpool":
        return whirlpool(data)
    raise AssertionError(algorithm)


def fetch_source(name: str, spec: dict) -> bytes:
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
    return data


def find_hex_assets(data: bytes):
    """Extract only long, source-described hex payloads, allowing ASCII whitespace."""
    pattern = re.compile(rb"(?:[0-9a-fA-F]{2}[\t\r\n ]*){512,}")
    seen = set()
    for match in pattern.finditer(data):
        hex_bytes = re.sub(rb"[\t\r\n ]+", b"", match.group(0))
        if len(hex_bytes) < 1024 or len(hex_bytes) % 2:
            continue
        asset = bytes.fromhex(hex_bytes.decode("ascii"))
        fingerprint = hashlib.sha256(asset).hexdigest()
        if fingerprint in seen:
            continue
        seen.add(fingerprint)
        yield {
            "offset": match.start(),
            "hex_chars": len(hex_bytes),
            "bytes": asset,
            "sha256": fingerprint,
        }


def magic_label(data: bytes) -> str:
    if data.startswith(b"ID3"):
        return "ID3/MP3"
    if data.startswith(b"OggS"):
        return "Ogg"
    if data.startswith(b"PK\x03\x04"):
        return "ZIP"
    if data.startswith(b"\x1f\x8b"):
        return "GZIP"
    if data.startswith(b"-----BEGIN PGP"):
        return "PGP armor"
    if data.startswith(b"\xff\xfb") or data.startswith(b"\xff\xf3") or data.startswith(b"\xff\xf2"):
        return "MPEG audio frame"
    return "unknown"


def main() -> None:
    target = bytes.fromhex(TARGET_HEX)
    assert len(TARGET_HEX) == 128 and len(target) == 64
    assert hashlib.sha256(target).hexdigest() == TARGET_BYTES_SHA256
    assert hashlib.sha512(b"abc").hexdigest() == (
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea"
        "20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd"
        "454d4423643ce80e2a9ac94fa54ca49f"
    )

    raw_results, asset_results = [], []
    for name, spec in SOURCES.items():
        data = fetch_source(name, spec)
        raw = {
            "snapshot": name,
            "path": spec["path"],
            "bytes": len(data),
            "git_blob_sha1": spec["git_blob_sha1"],
            "sha256": hashlib.sha256(data).hexdigest(),
            "hashes": {},
        }
        for algorithm in spec["algorithms"]:
            value = digest(data, algorithm)
            raw["hashes"][algorithm] = value
            if value == TARGET_HEX:
                raw.setdefault("matches", []).append(algorithm)
        raw_results.append(raw)

        for index, candidate in enumerate(find_hex_assets(data), start=1):
            asset = candidate.pop("bytes")
            item = {
                "snapshot": name,
                "candidate": index,
                "offset": candidate["offset"],
                "hex_chars": candidate["hex_chars"],
                "bytes": len(asset),
                "sha256": candidate["sha256"],
                "magic": magic_label(asset),
                "hashes": {},
            }
            for algorithm in ("sha512", "sha3_512", "blake2b512", "whirlpool"):
                value = digest(asset, algorithm)
                item["hashes"][algorithm] = value
                if value == TARGET_HEX:
                    item.setdefault("matches", []).append(algorithm)
            asset_results.append(item)

    print(json.dumps({
        "target": TARGET_HEX,
        "upstream_commit": UPSTREAM_COMMIT,
        "raw_snapshots": raw_results,
        "source_described_hex_assets": asset_results,
        "any_match": any(x.get("matches") for x in raw_results + asset_results),
        "scope": "exact raw pre/post snapshots and long embedded hex payloads only",
    }, indent=2))
    if any(x.get("matches") for x in raw_results + asset_results):
        print("MATCH: a source-selected Onion5 page or embedded asset hashes to p56")
    else:
        print("NO MATCH: neither raw snapshot nor any long embedded hex asset is the p56 preimage under the tested digest families")


if __name__ == "__main__":
    main()
