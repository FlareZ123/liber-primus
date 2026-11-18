#!/usr/bin/env python3
"""Whirlpool-only completion of the source-pinned 2014 p56 onion candidate gate.

The companion Node SFT tested SHA-512, SHA3-512 and BLAKE2b-512, but Node 22
on its runner did not expose Whirlpool. This test uses OpenSSL 3's legacy
provider, a published Whirlpool KAT, and the exact 2014 Git blob.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09"
    "a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
WHIRLPOOL_ABC = (
    "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4"
    "c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"
)
SOURCE = {
    "commit": "2e0cb5ace2f4172cda402489201bbbe27dd19999",
    "commit_date": "2014-09-15T18:23:41Z",
    "blob_sha1": "8722ee2edd749f01b4fffbd91053fac5a8ca0ff3",
    "byte_length": 73692,
    "line_count": 3204,
}
INDEX = {
    "commit": "6c3421a4d245596e403c88e037509d162a2afd17",
    "commit_date": "2014-05-11T18:33:43Z",
    "blob_sha1": "303db130705f0ef9be2a738f4336d5cfcebde80c",
    "byte_length": 1640,
}

def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()

def whirlpool(data: bytes) -> str:
    proc = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    fields = proc.stdout.decode("ascii").strip().split()
    digest = fields[-1].lower()
    if not re.fullmatch(r"[0-9a-f]{128}", digest):
        raise RuntimeError(f"unexpected OpenSSL Whirlpool output: {proc.stdout!r}")
    return digest

def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit("usage: python sims/lp2_p56_whirlpool_historical_onion_sft.py <onions-list.txt>")
    openssl_version = subprocess.run(
        ["openssl", "version"], check=True, capture_output=True, text=True
    ).stdout.strip()
    assert openssl_version.startswith("OpenSSL 3."), openssl_version
    assert whirlpool(b"abc") == WHIRLPOOL_ABC, "published Whirlpool abc KAT failed"
    assert len(TARGET) == 128 and len(bytes.fromhex(TARGET)) == 64

    source_bytes = Path(sys.argv[1]).read_bytes()
    assert len(source_bytes) == SOURCE["byte_length"]
    actual_blob = git_blob_sha1(source_bytes)
    assert actual_blob == SOURCE["blob_sha1"], actual_blob
    hosts = source_bytes.decode("utf-8").splitlines()
    assert len(hosts) == SOURCE["line_count"]
    assert len(set(hosts)) == len(hosts)
    valid_v2 = [h for h in hosts if re.fullmatch(r"[a-z2-7]{16}\.onion", h)]
    assert len(valid_v2) == 3172, len(valid_v2)

    variants = [
        ("exact-host-including-onion-suffix", lambda h: h),
        ("bare-16-character-label", lambda h: re.sub(r"\.onion$", "", h, flags=re.I)),
        ("http-url-with-root-slash", lambda h: "http://" + h + "/"),
        ("https-url-with-root-slash", lambda h: "https://" + h + "/"),
    ]
    matches = []
    counts = []
    for name, serialize in variants:
        found = 0
        for host in hosts:
            candidate = serialize(host).encode("ascii")
            if whirlpool(candidate) == TARGET:
                found += 1
                matches.append({"candidate_type": "historical_onion_address", "algorithm": "whirlpool",
                                "variant": name, "host": host, "serialized": candidate.decode("ascii")})
        counts.append({"variant": name, "tested": len(hosts), "matches": found})

    root = Path(__file__).resolve().parents[1]
    index_bytes = (root / "resources" / "cicada2014-onion7-index.html").read_bytes()
    assert len(index_bytes) == INDEX["byte_length"]
    index_blob = git_blob_sha1(index_bytes)
    assert index_blob == INDEX["blob_sha1"], index_blob
    index_digest = whirlpool(index_bytes)
    if index_digest == TARGET:
        matches.append({"candidate_type": "exact_archived_2014_stage11_index_html",
                        "algorithm": "whirlpool", "digest": index_digest})

    result = {
        "algorithm": "Whirlpool (OpenSSL 3 legacy provider)",
        "openssl_version": openssl_version,
        "positive_control": {"input": "abc", "digest": WHIRLPOOL_ABC, "passed": True},
        "target_p56_digest": TARGET,
        "historical_onion_source": {
            **SOURCE, "actual_blob_sha1": actual_blob, "actual_byte_length": len(source_bytes),
            "actual_line_count": len(hosts), "unique_count": len(set(hosts)),
            "valid_lowercase_v2_hosts": len(valid_v2), "noncanonical_or_legacy_entries": len(hosts)-len(valid_v2),
        },
        "serialization_variants": counts,
        "total_onion_hashes": sum(x["tested"] for x in counts),
        "archived_stage11_index": {
            **INDEX, "actual_blob_sha1": index_blob, "actual_byte_length": len(index_bytes),
            "whirlpool": index_digest, "matches_target": index_digest == TARGET,
            "limitation": "participant-archive copy, not an authenticated original HTTP entity body",
        },
        "matches": matches,
        "decision": "MATCH_FOUND" if matches else "NO_DIRECT_MATCH_IN_TESTED_2014_SOURCES_AND_SERIALIZATIONS",
    }
    print(json.dumps(result, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
