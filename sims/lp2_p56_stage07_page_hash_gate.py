#!/usr/bin/env python3
"""Exact p56 preimage gate for the authenticated 2014 Stage07 onion artifact.

The p56 page gives a 512-bit digest but no hash-family name or target URL.
The 2014 Stage07 onion response is a bounded historical candidate: the
source archive preserves a PGP clear-signed hex page and its decoded MP3.
The page signature is verified by the workflow before this script runs.

This is an exact-byte candidate test, not an open-ended hash/serialization
search. It checks six established 512-bit families against three
source-fixed representations: signed page bytes, signed cleartext hex body,
and decoded MP3.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

import gostcrypto
import skein

TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
FINGERPRINT = "6D854CD7933322A601C3286D181F01E57A35090F"

SKEIN_EMPTY = (
    "bc5b4c50925519c290cc634277ae3d6257212395cba733bbad37a4af0fa06af4"
    "1fca7903d06564fea7a2d3730dbdb80c1f85562dfcc070334ea4d1d9e72cba7a"
)
STREEBOG_EMPTY = (
    "8e945da209aa869f0455928529bcae4679e9873ab707b55315f56ceb98bef0a7"
    "362f715528356ee83cda5f2aac4c6ad2ba3a715c1bcd81cb8e9f90bf4c1c1a8a"
)
WHIRLPOOL_ABC = (
    "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4"
    "c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"
)
SHA512_ABC = (
    "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a"
    "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
)

EXPECTED = {
    "signed_page_raw": {
        "filename": "cijhho-signed.html",
        "bytes": 13_526_359,
        "git_blob_sha1": "afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9",
    },
    "signed_cleartext_hex": {
        "filename": "cijhho-cleartext.hex",
    },
    "decoded_mp3": {
        "filename": "cijhho-index.mp3",
        "bytes": 6_651_873,
        "git_blob_sha1": "09fe068192b76a3697c47ec1d604b527703db798",
        "sha256": "1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6",
    },
}


def git_blob_sha1(data: bytes) -> str:
    header = b"blob " + str(len(data)).encode("ascii") + b"\0"
    return hashlib.sha1(header + data).hexdigest()


def streebog512(data: bytes) -> str:
    return gostcrypto.gosthash.new("streebog512", data=data).hexdigest()


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


def verify_kats() -> dict:
    assert hashlib.sha512(b"abc").hexdigest() == SHA512_ABC
    assert skein.skein512(b"", digest_bits=512).hexdigest() == SKEIN_EMPTY
    assert streebog512(b"") == STREEBOG_EMPTY
    assert whirlpool(b"abc") == WHIRLPOOL_ABC
    openssl_version = subprocess.run(
        ["openssl", "version"], check=True, capture_output=True, text=True
    ).stdout.strip()
    assert openssl_version.startswith("OpenSSL 3."), openssl_version
    return {
        "SHA-512": "abc KAT passed",
        "Skein-512-512": "empty-message KAT passed",
        "Streebog-512": "empty-message KAT passed",
        "Whirlpool": "abc KAT passed",
        "SHA3-512": "Python hashlib implementation",
        "BLAKE2b-512": "Python hashlib implementation",
        "openssl": openssl_version,
    }


def digest_families(data: bytes) -> dict[str, str]:
    return {
        "SHA-512": hashlib.sha512(data).hexdigest(),
        "SHA3-512": hashlib.sha3_512(data).hexdigest(),
        "BLAKE2b-512": hashlib.blake2b(data, digest_size=64).hexdigest(),
        "Whirlpool": whirlpool(data),
        "Skein-512-512": skein.skein512(data, digest_bits=512).hexdigest(),
        "Streebog-512": streebog512(data),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--report", required=True)
    args = parser.parse_args()

    assert len(TARGET) == 128 and len(bytes.fromhex(TARGET)) == 64
    kats = verify_kats()
    root = Path(args.input_dir)

    verify_status = (root / "cijhho.verify.status").read_text(encoding="utf-8")
    decrypt_status = (root / "cijhho.decrypt.status").read_text(encoding="utf-8")
    expected_validsig = f"[GNUPG:] VALIDSIG {FINGERPRINT}"
    assert expected_validsig in verify_status, "raw signed page lacks expected VALIDSIG"
    assert expected_validsig in decrypt_status, "cleartext recovery lacks expected VALIDSIG"

    objects: dict[str, bytes] = {}
    for name, spec in EXPECTED.items():
        data = (root / spec["filename"]).read_bytes()
        if "bytes" in spec:
            assert len(data) == spec["bytes"], (name, len(data), spec["bytes"])
        if "git_blob_sha1" in spec:
            actual = git_blob_sha1(data)
            assert actual == spec["git_blob_sha1"], (name, actual)
        if "sha256" in spec:
            actual = hashlib.sha256(data).hexdigest()
            assert actual == spec["sha256"], (name, actual)
        objects[name] = data

    # The second participant archive is an exact duplicate of the signed page
    # and MP3 objects; verify both mirrors before counting unique byte objects.
    for first, second in (
        ("cijhho-signed.html", "scream314-signed.html"),
        ("cijhho-index.mp3", "scream314-index.mp3"),
    ):
        a = (root / first).read_bytes()
        b = (root / second).read_bytes()
        assert a == b, f"participant archive copies differ: {first} / {second}"

    cleartext = objects["signed_cleartext_hex"]
    compact_hex = re.sub(rb"\s+", b"", cleartext)
    assert compact_hex and len(compact_hex) % 2 == 0
    decoded = bytes.fromhex(compact_hex.decode("ascii"))
    assert decoded == objects["decoded_mp3"], "PGP cleartext hex does not reproduce the MP3"

    results = []
    matches = []
    comparisons = 0
    for candidate, data in objects.items():
        hashes = digest_families(data)
        assert all(len(value) == 128 for value in hashes.values())
        comparisons += len(hashes)
        row = {
            "candidate": candidate,
            "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "git_blob_sha1": git_blob_sha1(data),
            "hashes": hashes,
        }
        results.append(row)
        for algorithm, digest in hashes.items():
            if digest == TARGET:
                matches.append({
                    "candidate": candidate,
                    "algorithm": algorithm,
                    "digest": digest,
                })

    report = {
        "candidate": "2014 Stage07 q4utgdi2n4m4uim5.onion signed response, cleartext, and decoded MP3",
        "target_p56_digest": TARGET,
        "source": {
            "signed_page_git_blob_sha1": EXPECTED["signed_page_raw"]["git_blob_sha1"],
            "signed_page_bytes": EXPECTED["signed_page_raw"]["bytes"],
            "mp3_git_blob_sha1": EXPECTED["decoded_mp3"]["git_blob_sha1"],
            "mp3_bytes": EXPECTED["decoded_mp3"]["bytes"],
            "mp3_sha256": EXPECTED["decoded_mp3"]["sha256"],
            "pgp_signing_key_fingerprint": FINGERPRINT,
            "pgp_valid_signature": True,
            "archive_copies_identical": True,
            "cleartext_hex_decodes_to_mp3": True,
        },
        "digest_families": list(results[0]["hashes"].keys()),
        "known_answer_tests": kats,
        "unique_byte_objects": len(objects),
        "exact_digest_comparisons": comparisons,
        "matches": matches,
        "matched_target": bool(matches),
        "objects": results,
        "decision": "MATCH_FOUND" if matches else "NO_MATCH_IN_EXACT_STAGE07_OBJECTS_UNDER_SIX_512_BIT_FAMILIES",
        "scope": (
            "Exact signed Stage07 response bytes, exact GPG cleartext hex body, "
            "and decoded MP3 only. No alternate line-ending, HTML, URL, or "
            "unknown HTTP-response variants."
        ),
    }
    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
