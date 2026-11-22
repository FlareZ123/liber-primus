#!/usr/bin/env python3
"""Reproduce the pinned 2014 Stage 7 signed-hex -> MP3 -> OpenPuff chain.

GPG verification is performed by the workflow; this script independently checks
the exact verifier status records, Git blob identities, hex inversion, mirror
equality, and the recovered 99-number stream.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

FINGERPRINT = "6D854CD7933322A601C3286D181F01E57A35090F"

EXPECTED = {
    "signed_page": (13_526_359, "afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9"),
    "mp3": (6_651_873, "09fe068192b76a3697c47ec1d604b527703db798"),
    "magic_721": (721, "bc26dcc8bf6c6da12fa16006374831225fe225da"),
    "magic_745": (745, "0cff0a94f16a8603443619b6338def411c9f7bd5"),
}
MP3_SHA256 = "1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6"


def git_blob_sha1(data: bytes) -> str:
    header = b"blob " + str(len(data)).encode("ascii") + b"\0"
    return hashlib.sha1(header + data).hexdigest()


def facts(path: Path) -> dict:
    data = path.read_bytes()
    return {
        "path": str(path),
        "bytes": len(data),
        "git_blob_sha1": git_blob_sha1(data),
        "sha256": hashlib.sha256(data).hexdigest(),
    }


def assert_object(label: str, path: Path, expected_key: str) -> tuple[bytes, dict]:
    data = path.read_bytes()
    expected_size, expected_blob = EXPECTED[expected_key]
    actual = facts(path)
    if len(data) != expected_size or actual["git_blob_sha1"] != expected_blob:
        raise AssertionError(
            f"{label} mismatch: expected {expected_size}/{expected_blob}, got "
            f"{len(data)}/{actual['git_blob_sha1']}"
        )
    return data, actual


def assert_validsig(label: str, path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="replace")
    matches = re.findall(
        r"^\[GNUPG:\] VALIDSIG ([0-9A-Fa-f]{40})(?:\s|$)", text, flags=re.MULTILINE
    )
    if FINGERPRINT not in [item.upper() for item in matches]:
        raise AssertionError(f"{label} does not contain VALIDSIG for {FINGERPRINT}")
    return FINGERPRINT


def number_stream(path: Path) -> list[int]:
    return [int(token) for token in re.findall(rb"\d+", path.read_bytes())]


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--signed-a", type=Path, required=True)
    p.add_argument("--signed-b", type=Path, required=True)
    p.add_argument("--mp3-a", type=Path, required=True)
    p.add_argument("--mp3-b", type=Path, required=True)
    p.add_argument("--hex-a", type=Path, required=True)
    p.add_argument("--hex-b", type=Path, required=True)
    p.add_argument("--verify-status-a", type=Path, required=True)
    p.add_argument("--verify-status-b", type=Path, required=True)
    p.add_argument("--decrypt-status-a", type=Path, required=True)
    p.add_argument("--decrypt-status-b", type=Path, required=True)
    p.add_argument("--magic-a", type=Path, required=True)
    p.add_argument("--magic-b", type=Path, required=True)
    p.add_argument("--magic-local", type=Path, required=True)
    p.add_argument("--openpuff-output", type=Path)
    p.add_argument("--report", type=Path)
    args = p.parse_args()

    signed_a, signed_a_facts = assert_object("cijhho signed page", args.signed_a, "signed_page")
    signed_b, signed_b_facts = assert_object("scream314 signed page", args.signed_b, "signed_page")
    if signed_a != signed_b:
        raise AssertionError("The two pinned signed-page archive copies are not byte-identical")

    mp3_a, mp3_a_facts = assert_object("cijhho MP3", args.mp3_a, "mp3")
    mp3_b, mp3_b_facts = assert_object("scream314 MP3", args.mp3_b, "mp3")
    if mp3_a != mp3_b:
        raise AssertionError("The two pinned MP3 archive copies are not byte-identical")
    if mp3_a_facts["sha256"] != MP3_SHA256:
        raise AssertionError(f"MP3 SHA-256 mismatch: {mp3_a_facts['sha256']}")

    hex_a = args.hex_a.read_bytes()
    hex_b = args.hex_b.read_bytes()
    if hex_a != hex_b:
        raise AssertionError("GPG cleartext bodies from the two signed-page copies differ")
    compact_hex = re.sub(rb"\s+", b"", hex_a)
    if not compact_hex or len(compact_hex) % 2 or re.fullmatch(rb"[0-9A-Fa-f]+", compact_hex) is None:
        raise AssertionError("GPG cleartext body is not a complete whitespace-delimited hex stream")
    decoded_mp3 = bytes.fromhex(compact_hex.decode("ascii"))
    if decoded_mp3 != mp3_a or decoded_mp3 != mp3_b:
        raise AssertionError("GPG cleartext hex does not reproduce the exact archived MP3 bytes")

    signature_records = {
        "verify_a": assert_validsig("signed page A verification", args.verify_status_a),
        "verify_b": assert_validsig("signed page B verification", args.verify_status_b),
        "decrypt_a": assert_validsig("signed page A decryption", args.decrypt_status_a),
        "decrypt_b": assert_validsig("signed page B decryption", args.decrypt_status_b),
    }

    magic_a, magic_a_facts = assert_object("cijhho 721-byte magic-square text", args.magic_a, "magic_721")
    magic_b, magic_b_facts = assert_object("scream314 745-byte magic-square text", args.magic_b, "magic_745")
    magic_local, magic_local_facts = assert_object("repository 745-byte magic-square text", args.magic_local, "magic_745")

    stream_a = number_stream(args.magic_a)
    stream_b = number_stream(args.magic_b)
    stream_local = number_stream(args.magic_local)
    if not (len(stream_a) == len(stream_b) == len(stream_local) == 99):
        raise AssertionError(
            f"Expected 99 numbers in each archived stream; got "
            f"{len(stream_a)}, {len(stream_b)}, {len(stream_local)}"
        )
    if not (stream_a == stream_b == stream_local):
        raise AssertionError("The 721-byte and 745-byte archive variants do not encode the same 99 numbers")

    openpuff_facts = None
    if args.openpuff_output is not None:
        output, openpuff_facts = assert_object(
            "native OpenPuff extracted payload", args.openpuff_output, "magic_745"
        )
        if output != magic_b or output != magic_local:
            raise AssertionError("Native OpenPuff output is not byte-identical to the 745-byte source payload")
        if number_stream(args.openpuff_output) != stream_a:
            raise AssertionError("Native OpenPuff output does not reproduce the 99-number stream")

    report = {
        "classification": "historical Stage 7 chain reproduction; not an LP2 cipher result",
        "pgp_signer_fingerprint": FINGERPRINT,
        "pgp_status": signature_records,
        "signed_page": {
            "cijhho": signed_a_facts,
            "scream314": signed_b_facts,
            "byte_identical": True,
        },
        "mp3": {
            "cijhho": mp3_a_facts,
            "scream314": mp3_b_facts,
            "byte_identical": True,
            "gpg_hex_body_bytes": len(hex_a),
            "decoded_bytes_equal_both_archives": True,
        },
        "magic_squares": {
            "cijhho_721": magic_a_facts,
            "scream314_745": magic_b_facts,
            "repository_745": magic_local_facts,
            "number_count": 99,
            "all_three_number_streams_equal": True,
        },
        "openpuff_output": openpuff_facts,
        "conclusion": (
            "PGP-authenticated signed hex reproduces the exact archived MP3; "
            "the 2014 OpenPuff v4.00 output matches the original 99-number stream."
            if openpuff_facts is not None
            else "PGP-authenticated signed hex reproduces the exact archived MP3 and source square stream."
        ),
        "scope_limit": "This establishes the historical 2014 source chain only; it does not establish an LP2 cipher role.",
    }
    encoded = json.dumps(report, indent=2, sort_keys=True)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(encoded + "\n", encoding="utf-8")
    print(encoded)


if __name__ == "__main__":
    main()
