#!/usr/bin/env python3
"""Reproduce the byte-identity and OpenPGP checks for the 2013 pklmx pages.

The inputs are pinned participant-archive copies, not original HTTP/WARC bytes.
A good signature authenticates the signed text against the preserved key; it
does not authenticate the HTML wrapper, HTTP headers, web-of-trust identity,
or first-publication time.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "historical" / "pklmx-2013"
KEY = ROOT / "resources" / "control" / "cicada-3301-public-key.asc"
FINGERPRINT = "6D854CD7933322A601C3286D181F01E57A35090F"
KEY_GIT_BLOB = "d44aec389e2f346c6b9d149d4c61e890f62979c9"
KEY_SHA256 = "6e397c5c6ceeeb4da08535db74874989f193c914b8d2d87972dd282b24ea809f"

RECORDS = [
    {
        "name": "standby",
        "html": "standby.html",
        "asc": "standby.txt.asc",
        "html_git_blob": "941b17cf48ca3963e2eb1929c82a3bbad770dfaa",
        "asc_git_blob": "ce5f19ebc61c5920102d84a7b6a96e1e5c520fba",
        "html_size": 983,
        "asc_size": 909,
        "html_sha256": "292b3450434756eeb872bd9bf1c88033b2056cab1925310f53214dfbffa6d086",
        "asc_sha256": "86ad73b36db096c48720ab36ba5147b0b4baf9f8be7e2cd6a4d6d8afdf6435d6",
        "signed_text": b"Standby for coordinates.",
        "created": 1357946428,
        "signature_sha256": "b8b14ae7e57f968fa2b8a6ae0d89e3ab32f54aab34b825e7e8c4b380a897211a",
    },
    {
        "name": "annapolis",
        "html": "annapolis.html",
        "asc": "annapolis-md.txt.asc",
        "html_git_blob": "aff807d3c4ac427b9b767f6961ee3ae5266ec5b0",
        "asc_git_blob": "1ee6b40f4f90e431587123012a35a97c6d993ac7",
        "html_size": 978,
        "asc_size": 904,
        "html_sha256": "287c360521f5693a73c218060a96d3c1c8bff1497b88a83faf527e55999c99e0",
        "asc_sha256": "348cf5639cde991d1257865b0e5778843d067b6e272e93725389da72eb0314dc",
        "signed_text": b"38.977845, -76.486451",
        "created": 1358023599,
        "signature_sha256": "a59cbc644c57fe12ed155a950fa0656ccdd08a28ed0dfc96258f731bc2a973fb",
    },
    {
        "name": "okinawa",
        "html": "okinawa.html",
        "asc": "okinawa-japan.txt.asc",
        "html_git_blob": "4237a2c769215ac27a5ee8970480c533d94583ee",
        "asc_git_blob": "dbff1d55c8a1c818614edc7b92c8d61e008f41b4",
        "html_size": 976,
        "asc_size": 902,
        "html_sha256": "4c0768ffb17868db874cf9e01f217b2056939e0164f16566e0783370ee7f6a62",
        "asc_sha256": "ce3b6b7c5beacf46d7b729805084f51001cb7a7bae5d3d7b2d90076546af63b1",
        "signed_text": b"26.41968, 127.73254",
        "created": 1358023191,
        "signature_sha256": "c565fd255f340164bce5b8292441f8175ffd121e322373950467c01c4d9d6690",
    },
]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def checked_run(args: list[str]) -> subprocess.CompletedProcess:
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(
            f"command failed ({result.returncode}): {' '.join(args)}\n"
            f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
        )
    return result


def main() -> None:
    key_bytes = KEY.read_bytes()
    assert len(key_bytes) == 3057
    assert sha256(key_bytes) == KEY_SHA256
    assert git_blob_sha1(key_bytes) == KEY_GIT_BLOB

    outputs = []
    with tempfile.TemporaryDirectory(prefix="pklmx-gpg-") as td:
        home = Path(td) / "gnupg"
        home.mkdir(mode=0o700)
        os.chmod(home, 0o700)
        checked_run(["gpg", "--homedir", str(home), "--batch", "--import", str(KEY)])
        key_info = checked_run([
            "gpg", "--homedir", str(home), "--batch", "--with-colons",
            "--fingerprint", "--list-keys"
        ]).stdout
        primary_fpr = next(
            line.split(":")[9] for line in key_info.splitlines()
            if line.startswith("fpr:")
        )
        assert primary_fpr == FINGERPRINT

        for item in RECORDS:
            html_bytes = (SOURCE / item["html"]).read_bytes()
            asc_bytes = (SOURCE / item["asc"]).read_bytes()
            match = re.search(rb"<pre>(.*?)</pre>", html_bytes, flags=re.S)
            assert match is not None, item["name"]
            assert match.group(1) == asc_bytes, f"HTML PGP block differs: {item['name']}"
            assert b"\r" not in asc_bytes, f"unexpected CR line ending: {item['name']}"
            assert len(html_bytes) == item["html_size"]
            assert len(asc_bytes) == item["asc_size"]
            assert sha256(html_bytes) == item["html_sha256"]
            assert sha256(asc_bytes) == item["asc_sha256"]
            assert git_blob_sha1(html_bytes) == item["html_git_blob"]
            assert git_blob_sha1(asc_bytes) == item["asc_git_blob"]
            assert item["signed_text"] in asc_bytes

            verification = checked_run([
                "gpg", "--homedir", str(home), "--batch", "--status-fd=1",
                "--verify", str(SOURCE / item["asc"])
            ])
            status = verification.stdout + verification.stderr
            assert "[GNUPG:] GOODSIG " in status
            valid_line = next(
                line for line in verification.stdout.splitlines()
                if line.startswith("[GNUPG:] VALIDSIG ")
            )
            fields = valid_line.split()
            fingerprint = fields[2]
            created = int(fields[4])
            assert fingerprint == FINGERPRINT
            assert created == item["created"]

            signature_match = re.search(
                rb"-----BEGIN PGP SIGNATURE-----.*?-----END PGP SIGNATURE-----",
                asc_bytes, flags=re.S
            )
            assert signature_match is not None
            armor_path = Path(td) / f"{item['name']}.sig.asc"
            binary_path = Path(td) / f"{item['name']}.sig"
            armor_path.write_bytes(signature_match.group(0) + b"\n")
            checked_run([
                "gpg", "--homedir", str(home), "--batch", "--dearmor",
                "--yes", "--output", str(binary_path), str(armor_path)
            ])
            packet_bytes = binary_path.read_bytes()
            packet_info = checked_run([
                "gpg", "--homedir", str(home), "--batch", "--list-packets",
                str(binary_path)
            ]).stdout
            assert "version 4," in packet_info
            assert f"created {item['created']}" in packet_info
            assert "sigclass 0x01" in packet_info
            assert "digest algo 2" in packet_info
            assert len(packet_bytes) == 543
            assert sha256(packet_bytes) == item["signature_sha256"]

            outputs.append({
                "name": item["name"],
                "html_bytes": len(html_bytes),
                "html_sha256": sha256(html_bytes),
                "asc_bytes": len(asc_bytes),
                "asc_sha256": sha256(asc_bytes),
                "html_pre_equals_asc": True,
                "upstream_git_blob_ids_match": True,
                "signature_packet_bytes": len(packet_bytes),
                "signature_packet_sha256": sha256(packet_bytes),
                "signature_version": 4,
                "public_key_fingerprint": fingerprint,
                "signature_created_unix": created,
                "signature_created_utc": datetime.fromtimestamp(
                    created, timezone.utc
                ).isoformat(),
                "rsa_signature": "Good signature",
                "digest": "SHA-1",
            })

    print(json.dumps({
        "source_repository": "neuroretransmit/cicada",
        "source_commit": "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
        "key_fingerprint": FINGERPRINT,
        "key_sha256": KEY_SHA256,
        "results": outputs,
        "limitations": [
            "The HTML and .asc files are participant-archive copies, not original HTTP/WARC bytes.",
            "Valid signatures authenticate the signed message bodies under the preserved key, not HTML wrappers or HTTP headers.",
            "GnuPG cryptographic validity does not establish web-of-trust identity or original publication time.",
        ],
    }, indent=2))


if __name__ == "__main__":
    main()
