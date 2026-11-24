#!/usr/bin/env python3
"""Verify the archived 2013 clientlog and its extracted PGP-signed NEXT response.

The client identity is not present in the archive. A valid signature authenticates
only the extracted server message, not the enclosing transcript or its date.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG = ROOT / "resources" / "historical" / "cicada2013-clientlog-1362290293-9.txt"
ASC = ROOT / "resources" / "historical" / "derived" / "cicada2013-20130303-next-response.asc"
KEY = ROOT / "resources" / "control" / "cicada-3301-public-key.asc"

EXPECTED_LOG_BYTES = 10636
EXPECTED_LOG_BLOB = "02b25b72a183b8e83ef6876de69eb64218190846"
EXPECTED_KEY_BYTES = 3057
EXPECTED_KEY_SHA256 = "6e397c5c6ceeeb4da08535db74874989f193c914b8d2d87972dd282b24ea809f"
EXPECTED_KEY_BLOB = "d44aec389e2f346c6b9d149d4c61e890f62979c9"
EXPECTED_FINGERPRINT = "6D854CD7933322A601C3286D181F01E57A35090F"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def extract_signed_message(log_bytes: bytes) -> bytes:
    text = log_bytes.decode("ascii")
    extracted: list[str] = []
    active = False
    ended = False

    for line in text.splitlines():
        marker = "Received line: "
        at = line.find(marker)
        if at < 0:
            continue
        rest = line[at + len(marker):]
        if not rest or rest[0] not in ("'", '"'):
            continue
        quote = rest[0]
        end = rest.rfind(quote)
        if end <= 0:
            continue
        payload = rest[1:end]
        if payload.endswith(r"\r\n"):
            payload = payload[:-4]

        if not active and payload == "-----BEGIN PGP SIGNED MESSAGE-----":
            active = True
        if active:
            extracted.append(payload)
        if active and payload == "-----END PGP SIGNATURE-----":
            ended = True
            break

    if not ended:
        raise AssertionError("PGP signed response was not completely reconstructed")
    return ("\n".join(extracted) + "\n").encode("ascii")


def checked_run(args: list[str], env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(args, env=env, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(
            f"command failed ({result.returncode}): {' '.join(args)}\n"
            f"stdout:\n{result.stdout}\nstderr:\n{result.stderr}"
        )
    return result


def main() -> None:
    raw = LOG.read_bytes()
    asc = ASC.read_bytes()
    key = KEY.read_bytes()

    assert len(raw) == EXPECTED_LOG_BYTES
    assert git_blob_sha1(raw) == EXPECTED_LOG_BLOB
    assert len(key) == EXPECTED_KEY_BYTES
    assert sha256(key) == EXPECTED_KEY_SHA256
    assert git_blob_sha1(key) == EXPECTED_KEY_BLOB

    reconstructed = extract_signed_message(raw)
    assert reconstructed == asc, "derived PGP file differs from transcript extraction"
    assert b"\r" not in asc
    assert asc.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----\n")
    assert asc.endswith(b"-----END PGP SIGNATURE-----\n")

    log_text = raw.decode("ascii")
    expected_events = {
        "base29_input": "Received line: 'BASE29 1033\\r\\n'",
        "base29_output": "Sending line: '01 OK 16I'",
        "dh_input": "Received line: 'DH 3301\\r\\n'",
        "dh_output": "Sending line: '01 OK 2757 1264'",
        "dh_client_value": "Received line: '2800\\r\\n'",
        "dh_server_data": "Sending line: '03 DATA 1067'",
        "next_command": "Received line: 'NEXT\\r\\n'",
    }
    for name, marker in expected_events.items():
        assert marker in log_text, name
    koan_count = log_text.count("Received line: 'KOAN\\r\\n'")
    assert koan_count == 4
    assert "What is the nature of the primes?" in log_text
    assert b"DO NOT SHARE THIS INFORMATION!" in asc
    assert b"privacy is an inalienable right" in asc
    assert b"there won't be any hidden codes, or secret messages" in asc

    with tempfile.TemporaryDirectory(prefix="cicada-2013-gpg-") as td:
        home = Path(td) / "gnupg"
        home.mkdir(mode=0o700)
        os.chmod(home, 0o700)
        env = os.environ.copy()
        env["GNUPGHOME"] = str(home)
        checked_run(["gpg", "--batch", "--import", str(KEY)], env)
        key_info = checked_run(
            ["gpg", "--batch", "--with-colons", "--fingerprint", "--list-keys"], env
        ).stdout
        fingerprints = [
            line.split(":")[9]
            for line in key_info.splitlines()
            if line.startswith("fpr:")
        ]
        assert fingerprints and fingerprints[0] == EXPECTED_FINGERPRINT

        verification = checked_run(
            ["gpg", "--batch", "--status-fd=1", "--verify", str(ASC)], env
        )
        status = verification.stdout + verification.stderr
        assert "[GNUPG:] GOODSIG " in status
        valid_line = next(
            line for line in verification.stdout.splitlines()
            if line.startswith("[GNUPG:] VALIDSIG ")
        )
        fields = valid_line.split()
        fingerprint = fields[2]
        created = int(fields[4])
        assert fingerprint == EXPECTED_FINGERPRINT

    output = {
        "artifact": LOG.name,
        "upstream": "neuroretransmit/cicada/irc-logs/clientlog-1362290293-9.txt",
        "rawBytes": len(raw),
        "rawGitBlobSha1": git_blob_sha1(raw),
        "derivedSignedMessageBytes": len(asc),
        "derivedSignedMessageSha256": sha256(asc),
        "derivedSignedMessageGitBlobSha1": git_blob_sha1(asc),
        "signature": "GOODSIG",
        "primaryFingerprint": fingerprint,
        "signatureCreationUnix": created,
        "commandEvidence": {
            "base29": "1033 -> 16I",
            "koanCalls": koan_count,
            "koanSubject": "What is the nature of the primes?",
            "diffieHellman": "DH 3301 -> 2757 1264; client sends 2800; server returns DATA 1067",
            "finalCommand": "NEXT",
        },
        "identityLimit": "client is anonymous; PGP authenticates only the server's signed NEXT message",
    }
    print(json.dumps(output, separators=(",", ":")))


if __name__ == "__main__":
    main()
