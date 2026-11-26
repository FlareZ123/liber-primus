#!/usr/bin/env python3
"""Bounded hash test of the source-derived eq6 v2 onion identifier.

The 2012 Britannica 11th-edition book-code route supplies
eq6emgv2ehsrix6t.onion as a historical candidate. This tests only the
identifier, root URL spellings, and decoded v2 service ID. It does not guess
page paths or claim to hash the unavailable page body.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import subprocess
from pathlib import Path

TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
HOST = "eq6emgv2ehsrix6t.onion"
WHIRLPOOL_ABC = "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"

def whirlpool(data: bytes) -> str:
    proc = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True,
    )
    return proc.stdout.decode("ascii").strip().split("=")[-1].strip().lower()

def candidates() -> dict[str, bytes]:
    service_id = base64.b32decode(HOST.removesuffix(".onion").upper())
    return {
        "onion-host": HOST.encode("ascii"),
        "onion-host-bare": HOST.removesuffix(".onion").encode("ascii"),
        "onion-host-trailing-slash": (HOST + "/").encode("ascii"),
        "http-root": ("http://" + HOST).encode("ascii"),
        "http-root-slash": ("http://" + HOST + "/").encode("ascii"),
        "https-root": ("https://" + HOST).encode("ascii"),
        "https-root-slash": ("https://" + HOST + "/").encode("ascii"),
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
    rows, matches = [], []
    for name, raw in candidates().items():
        hashes = {
            "SHA-512": hashlib.sha512(raw).hexdigest(),
            "Whirlpool": whirlpool(raw),
            "BLAKE2b-512": hashlib.blake2b(raw, digest_size=64).hexdigest(),
            "SHA3-512": hashlib.sha3_512(raw).hexdigest(),
        }
        rows.append({"name": name, "length": len(raw), "hashes": hashes})
        matches.extend(
            {"candidate": name, "algorithm": alg}
            for alg, digest in hashes.items() if digest == TARGET
        )
    result = {
        "target": TARGET,
        "candidate_count": len(rows),
        "algorithm_count": 4,
        "hash_checks": len(rows) * 4,
        "algorithms": ["SHA-512", "Whirlpool", "BLAKE2b-512", "SHA3-512"],
        "whirlpool_abc_control": control,
        "whirlpool_control_passed": True,
        "matches": matches,
        "candidates": rows,
        "scope": "Exact source-derived eq6 onion host, bare host, root URL spellings, and v2 service-ID encodings only. No speculative paths, response bodies, or page serializations tested.",
        "interpretation": "A miss rejects only the tested identifier-as-preimage candidates; it does not test the unavailable page body or any unknown hash serialization."
    }
    rendered = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")

if __name__ == "__main__":
    main()
