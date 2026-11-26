#!/usr/bin/env python3
"""Bounded identifier-as-preimage check for two source-derived 2012 onion candidates.

The candidates are eq6emgv2ehsrix6t.onion (2012 Britannica book-code route) and
cginiziglyaobyph.onion (2012 second-chance Blake book-code route). This tests
only host/root-URL spellings and decoded v2 service-ID forms, not page bodies.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import subprocess
from pathlib import Path

TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
HOSTS = ["eq6emgv2ehsrix6t.onion", "cginiziglyaobyph.onion"]
WHIRLPOOL_ABC = "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"

def whirlpool(data: bytes) -> str:
    proc = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True,
    )
    return proc.stdout.decode("ascii").strip().split("=")[-1].strip().lower()

def candidates(host: str) -> dict[str, bytes]:
    label = host.removesuffix(".onion")
    service_id = base64.b32decode(label.upper())
    return {
        "onion-host": host.encode("ascii"),
        "onion-host-bare": label.encode("ascii"),
        "onion-host-trailing-slash": (host + "/").encode("ascii"),
        "http-root": ("http://" + host).encode("ascii"),
        "http-root-slash": ("http://" + host + "/").encode("ascii"),
        "https-root": ("https://" + host).encode("ascii"),
        "https-root-slash": ("https://" + host + "/").encode("ascii"),
        "onion-v2-service-id-raw10": service_id,
        "onion-v2-service-id-hex": service_id.hex().encode("ascii"),
        "onion-v2-service-id-base64": base64.b64encode(service_id),
    }

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    control = whirlpool(b"abc")
    if control != WHIRLPOOL_ABC:
        raise SystemExit(f"Whirlpool positive control failed: {control}")
    rows, matches, per_host = [], [], {}
    for host in HOSTS:
        local_matches = []
        for name, raw in candidates(host).items():
            hashes = {
                "SHA-512": hashlib.sha512(raw).hexdigest(),
                "Whirlpool": whirlpool(raw),
                "BLAKE2b-512": hashlib.blake2b(raw, digest_size=64).hexdigest(),
                "SHA3-512": hashlib.sha3_512(raw).hexdigest(),
            }
            rows.append({"host": host, "name": name, "length": len(raw), "hashes": hashes})
            for algorithm, digest in hashes.items():
                if digest == TARGET:
                    match = {"host": host, "candidate": name, "algorithm": algorithm}
                    matches.append(match)
                    local_matches.append(match)
        per_host[host] = {"candidate_count": 10, "hash_checks": 40, "matches": local_matches}
    result = {
        "target": TARGET,
        "hosts": HOSTS,
        "candidate_count": len(rows),
        "algorithm_count": 4,
        "hash_checks": len(rows) * 4,
        "algorithms": ["SHA-512", "Whirlpool", "BLAKE2b-512", "SHA3-512"],
        "whirlpool_abc_control": control,
        "whirlpool_control_passed": True,
        "matches": matches,
        "per_host": per_host,
        "candidates": rows,
        "scope": "Two source-derived 2012 v2 onion identifiers only: eq6 from the Britannica book-code route and cginiziglyaobyph from the second-chance Blake book-code route. Ten host/root-URL/service-ID forms per host. No speculative paths or page bodies.",
        "interpretation": "A miss rejects only these identifier-as-preimage candidates under the four tested 512-bit digests. It does not test either unavailable page body or an unknown page serialization."
    }
    rendered = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")

if __name__ == "__main__":
    main()
