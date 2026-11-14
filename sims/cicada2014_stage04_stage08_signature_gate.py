#!/usr/bin/env python3
"""Direct byte-pinned Cicada 2014 Stage04/08 clear-signature adjudication.

Uses the Stage04 carrier-extracted repository artifact and the original
Stage08 bzip2 member at a fixed historical archive revision. No alterations
to textual content are made before the raw signature trials.
"""
from __future__ import annotations

import bz2
import hashlib
import json
import re
import subprocess
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FINGERPRINT = "6D854CD7933322A601C3286D181F01E57A35090F"
STAGE04 = ROOT / "resources/external/derived/2014-stage04/03-outguess.asc"
STAGE04_BLOB = "2a355d1bf14d37041384f09d8700e2ee274a13e6"
REVISION = "76d3ee8c762f60025822c8c05edbf31351636469"
STAGE08_URL = (
    f"https://raw.githubusercontent.com/krisyotam/cicada3301/{REVISION}"
    "/puzzles/2014/assets/stage08/"
)
STAGE08_BLOBS = {
    "index": "57478039d8dbb4b20d16aff7f9c3af0f2f13da8d",
    "index.bz2": "c568e481008fba993741acb77a7f12492b19afa6",
}


def git_blob_sha(data: bytes) -> str:
    prefix = b"blob " + str(len(data)).encode("ascii") + b"\0"
    return hashlib.sha1(prefix + data).hexdigest()


def source(name: str) -> bytes:
    with urllib.request.urlopen(STAGE08_URL + name, timeout=45) as response:
        data = response.read()
    actual = git_blob_sha(data)
    assert actual == STAGE08_BLOBS[name], (name, actual)
    return data


def run_gpg(home: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["gpg", "--homedir", str(home), "--batch", "--no-tty", *args],
        capture_output=True,
        text=True,
        timeout=45,
        check=False,
    )


def verify(home: Path, filename: Path, data: bytes) -> dict[str, object]:
    filename.write_bytes(data)
    verified = run_gpg(home, "--status-fd", "1", "--verify", str(filename))
    status = [
        line.removeprefix("[GNUPG:] ").strip()
        for line in verified.stdout.splitlines()
        if line.startswith("[GNUPG:] ")
    ]
    fingerprints = [
        fields[1]
        for line in status
        if (fields := line.split()) and fields[0] == "VALIDSIG" and len(fields) > 1
    ]
    valid = (
        verified.returncode == 0
        and FINGERPRINT in fingerprints
        and any(line.startswith("GOODSIG ") for line in status)
    )
    packets = run_gpg(home, "--list-packets", str(filename))
    sig_packets = [
        line.strip() for line in (packets.stdout + "\n" + packets.stderr).splitlines()
        if line.startswith(":signature packet:") or "digest algo " in line
        or "sig created " in line
    ][:5]
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "newline": {"lf": data.count(b"\n"), "crlf": data.count(b"\r\n")},
        "gpg_returncode": verified.returncode,
        "valid": valid,
        "validsig_fingerprints": fingerprints,
        "status": [line for line in status if re.match(
            r"^(GOODSIG|VALIDSIG|BADSIG|ERRSIG|NO_PUBKEY|NODATA|NEWSIG) ", line
        )],
        "packet_signature": sig_packets,
        "diagnostic": "" if valid else verified.stderr[-600:],
    }


def examine(home: Path, name: str, data: bytes, needle: bytes) -> dict[str, object]:
    assert data.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
    assert b"-----END PGP SIGNATURE-----" in data
    assert data.count(needle) == 1, (name, "tamper site ambiguous")
    raw = verify(home, home / f"{name}-original.asc", data)
    # A change of transport line ending is a realistic historical archive
    # ambiguity. GnuPG cleartext-signature verification canonicalizes CRLF.
    if b"\r\n" in data:
        alternate = data.replace(b"\r\n", b"\n")
        alternate_name = "LF"
    else:
        alternate = data.replace(b"\n", b"\r\n")
        alternate_name = "CRLF"
    other = verify(home, home / f"{name}-line-ending.asc", alternate)
    tampered = data.replace(needle, needle[:-1] + bytes([needle[-1] ^ 1]), 1)
    altered = verify(home, home / f"{name}-altered.asc", tampered)
    assert not altered["valid"], (name, "signed-content tamper accepted")
    return {
        "witness": name,
        "original": raw,
        "transport_alternative": { "kind": alternate_name, **other },
        "body_tamper_rejected": True,
        "authenticated": bool(raw["valid"]),
    }


def main() -> None:
    original_stage04 = STAGE04.read_bytes()
    assert git_blob_sha(original_stage04) == STAGE04_BLOB
    packed = source("index.bz2")
    original_stage08 = source("index")
    assert bz2.decompress(packed) == original_stage08
    print("SOURCE: Stage04 extracted original Git blob", STAGE04_BLOB)
    print("SOURCE: Stage08 original archived bzip2 byte identity confirmed")
    with tempfile.TemporaryDirectory(prefix="cicada-pgp-") as temporary:
        home = Path(temporary)
        home.chmod(0o700)
        key = ROOT / "resources/control/cicada-3301-public-key.asc"
        imported = run_gpg(home, "--import", str(key))
        assert imported.returncode == 0, imported.stderr
        keylist = run_gpg(home, "--with-colons", "--fingerprint")
        assert FINGERPRINT in keylist.stdout.replace(":", "")
        for name, data, tamper in (
            ("stage04", original_stage04, b"Let the text guide you."),
            ("stage08", original_stage08, b"Very good.  You have done well"),
        ):
            output = examine(home, name, data, tamper)
            print("AUTHENTICATION " + json.dumps(output, sort_keys=True))
    print("PASS: pinned original witness verification and mutation controls complete")


if __name__ == "__main__":
    main()
