"""Scan preserved July 2016 OnionScan material for the LP2 p56 target.

The corpus is external and public: kal1gh0st/OSINT/onionrunner/onion_result.
OnionScan reports can preserve a front-page snapshot and its historical SHA-1.
The scan checks every preserved non-empty snapshot, records whether the stored
SHA-1 validates its reconstructed bytes, and also checks source-derived .onion
URL strings because the community hash alarm explicitly hashes request URLs.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
from typing import Any

import gostcrypto
import skein
from Crypto.Hash import keccak


TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)


def whirlpool(data: bytes) -> str:
    """Hash with OpenSSL's legacy Whirlpool implementation."""
    return subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool", "-binary"],
        input=data,
        capture_output=True,
        check=True,
    ).stdout.hex()


def digests(data: bytes) -> dict[str, str]:
    """Full-width 512-bit digest candidates, with no truncation or salting."""
    return {
        "sha512": hashlib.sha512(data).hexdigest(),
        "sha3_512": hashlib.sha3_512(data).hexdigest(),
        "blake2b_512": hashlib.blake2b(data, digest_size=64).hexdigest(),
        "keccak512_pre_fips": keccak.new(data=data, digest_bits=512).hexdigest(),
        "skein512_512": skein.skein512(data, digest_bits=512).hexdigest(),
        "streebog512": gostcrypto.gosthash.new("streebog512", data=data).hexdigest(),
        "whirlpool": whirlpool(data),
    }


def onion_url_candidates(value: str) -> set[str]:
    """Return bounded request-string forms for one report-derived .onion value."""
    candidate = value.strip()
    if ".onion" not in candidate.lower():
        return set()

    out = {candidate}
    if candidate.startswith(("http://", "https://")):
        if candidate.lower().endswith(".onion"):
            out.add(candidate + "/")
        return out

    out.add("http://" + candidate)
    if candidate.lower().endswith(".onion"):
        out.add("http://" + candidate + "/")
    return out


def collect_onion_strings(value: Any) -> set[str]:
    """Collect .onion strings from the few report fields that describe pages."""
    if isinstance(value, str):
        return onion_url_candidates(value)
    if isinstance(value, list):
        result: set[str] = set()
        for item in value:
            result.update(collect_onion_strings(item))
        return result
    if isinstance(value, dict):
        result: set[str] = set()
        for key in value:
            result.update(collect_onion_strings(key))
        return result
    return set()


def write_json_locked_atomic(path: Path, payload: dict[str, object]) -> None:
    """Write one report under an exclusive lock using atomic replacement."""
    path.parent.mkdir(parents=True, exist_ok=True)
    lock = path.with_name(path.name + ".lock")
    lock_fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    temp_name = ""
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=path.parent,
            prefix=path.name + ".",
            suffix=".tmp",
            delete=False,
        ) as handle:
            temp_name = handle.name
            json.dump(payload, handle, indent=2, sort_keys=True)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp_name, path)
    finally:
        os.close(lock_fd)
        lock.unlink(missing_ok=True)
        if temp_name:
            Path(temp_name).unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("corpus", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    assert len(TARGET) == 128
    assert args.corpus.is_dir(), f"missing OnionScan corpus: {args.corpus}"

    counts = {
        "json_files": 0,
        "parse_errors": 0,
        "string_snapshots": 0,
        "nonempty_snapshots": 0,
        "reports_with_stored_sha1": 0,
        "sha1_validated": 0,
        "sha1_mismatch": 0,
        "snapshot_digest_inputs": 0,
        "validated_snapshot_digest_inputs": 0,
        "unvalidated_snapshot_digest_inputs": 0,
        "unique_url_digest_inputs": 0,
    }
    matches: list[dict[str, object]] = []
    mismatches: list[dict[str, object]] = []
    url_inputs: set[str] = set()

    for path in sorted(args.corpus.rglob("*.json")):
        counts["json_files"] += 1
        try:
            report = json.loads(path.read_text(encoding="utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            counts["parse_errors"] += 1
            mismatches.append({"file": str(path), "error": type(exc).__name__})
            continue

        for field in (
            "hiddenService",
            "internalPages",
            "linkedSites",
            "relatedOnionServices",
            "relatedOnionDomains",
            "crawls",
        ):
            url_inputs.update(collect_onion_strings(report.get(field)))

        snapshot = report.get("snapshot")
        if not isinstance(snapshot, str):
            continue
        counts["string_snapshots"] += 1
        if not snapshot:
            continue
        counts["nonempty_snapshots"] += 1

        body = snapshot.encode("utf-8")
        body_sha1 = hashlib.sha1(body).hexdigest()
        stored_hashes = {
            value.lower()
            for value in (report.get("hashes") or [])
            if isinstance(value, str) and len(value) == 40
        }

        validation = "no_stored_sha1"
        if stored_hashes:
            counts["reports_with_stored_sha1"] += 1
            if body_sha1 in stored_hashes:
                validation = "stored_sha1_match"
                counts["sha1_validated"] += 1
            else:
                validation = "stored_sha1_mismatch"
                counts["sha1_mismatch"] += 1
                if len(mismatches) < 20:
                    mismatches.append({
                        "file": str(path.relative_to(args.corpus)),
                        "hidden_service": report.get("hiddenService"),
                        "computed_sha1": body_sha1,
                        "stored_sha1": sorted(stored_hashes),
                        "snapshot_bytes": len(body),
                    })

        counts["snapshot_digest_inputs"] += 1
        if validation == "stored_sha1_match":
            counts["validated_snapshot_digest_inputs"] += 1
        else:
            counts["unvalidated_snapshot_digest_inputs"] += 1

        for algorithm, value in digests(body).items():
            if value == TARGET:
                matches.append({
                    "input_kind": "snapshot",
                    "file": str(path.relative_to(args.corpus)),
                    "hidden_service": report.get("hiddenService"),
                    "algorithm": algorithm,
                    "snapshot_bytes": len(body),
                    "snapshot_sha1": body_sha1,
                    "snapshot_validation": validation,
                    "response_date": (report.get("responseHeaders") or {}).get("DATE"),
                    "target": TARGET,
                })

    counts["unique_url_digest_inputs"] = len(url_inputs)
    for url in sorted(url_inputs):
        data = url.encode("utf-8")
        for algorithm, value in digests(data).items():
            if value == TARGET:
                matches.append({
                    "input_kind": "report_derived_onion_url",
                    "url": url,
                    "algorithm": algorithm,
                    "target": TARGET,
                })

    payload: dict[str, object] = {
        "target": TARGET,
        "corpus": str(args.corpus),
        "candidate_algorithms": [
            "sha512",
            "sha3_512",
            "blake2b_512",
            "keccak512_pre_fips",
            "skein512_512",
            "streebog512",
            "whirlpool",
        ],
        "counts": counts,
        "exact_matches": matches,
        "first_sha1_mismatches_or_parse_errors": mismatches,
        "snapshot_interpretation": (
            "Every non-empty preserved snapshot is checked. stored_sha1_match "
            "marks snapshots whose reconstructed UTF-8 bytes reproduce an OnionScan "
            "SHA-1; other snapshots remain exact-match candidates but carry lower "
            "byte-fidelity confidence."
        ),
        "url_interpretation": (
            "URL candidates come only from report fields describing onion services "
            "or pages, with the stored string plus bounded http:// and trailing-slash "
            "forms. This mirrors the community 3301-hash-alarm practice of hashing "
            "request URLs as well as response bytes."
        ),
    }
    write_json_locked_atomic(args.output, payload)
    print(json.dumps(payload, indent=2, sort_keys=True))
    if matches:
        print("EXACT P56 TARGET MATCH FOUND")
    else:
        print("NO EXACT P56 TARGET MATCH IN PRESERVED SNAPSHOTS OR REPORT-DERIVED ONION URLS")


if __name__ == "__main__":
    main()
