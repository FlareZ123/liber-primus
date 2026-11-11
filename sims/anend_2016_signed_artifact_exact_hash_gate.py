#!/usr/bin/env python3
"""Exact-byte SHA-512 gate for the four 2016 signed-artifact objects in Issue #225.

Run from any working directory:
    python3 sims/anend_2016_signed_artifact_exact_hash_gate.py

Requires GnuPG for signature verification and extraction of its verified cleartext
body. No text normalization, URL construction, prefixes, concatenation, truncation,
or alternate digest families are tested.
"""
from __future__ import annotations

import base64
import hashlib
import json
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8"
    "425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
FINGERPRINT = "6D854CD7933322A601C3286D181F01E57A35090F"
JPEG = ROOT / "resources/historical/cicada2016-4gq25.jpg"
PAYLOAD = ROOT / "resources/historical/cicada2016-4gq25-outguess.asc"
PUBLIC_KEY = ROOT / "resources/control/cicada-3301-public-key.asc"
EXPECTED_GIT_BLOBS = {
    JPEG: "22027296dcd7df53c5127e6aadbabeaf3223f72d",
    PAYLOAD: "a0d8bd2d73613e01cd8a2103d5721b2b998ee482",
}
EXPECTED = {
    "2016 JPEG raw bytes": (
        26342,
        "f4ac5cb8e0a177756d4ef794287d662465a8d30e04d1fd1a133f3575e40c3622"
        "e5e811099cc81fc6afe204bb9d4282a29e033646e068df495a51186751ac7be2",
    ),
    "OutGuess clear-signed payload exact bytes": (
        1136,
        "d5871cd2f42910c72bf8ff2d9599776173c2e5e34859810633ce3cb8b80d2b7b"
        "d864e67bb6b0794a3600a304d4e68c358f4213ff128f953dd02df4746f375262",
    ),
    "embedded OpenPGP signature packet binary": (
        543,
        "207beae820d8b2a2e40620931a96684ba9b540e03f33d5a082e1a92afd785487"
        "e3270d00ec2efd9d63618780843f140de49bd3714f7433b4d5f60034bbf1eb70",
    ),
    "GnuPG-verified cleartext body bytes": (
        269,
        "e3166e6c8282ba9cd3e00ba9cb8477c20ed9f7ffc48ae48dc4f1013bbabf3638"
        "469007d9acb5eb8998796f2d81be0059fd6f3684ae1a00672ec3c84b8f149285",
    ),
}


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def extract_signature_packet(armored: bytes) -> bytes:
    text = armored.decode("ascii")
    section = text.split("-----BEGIN PGP SIGNATURE-----", 1)[1].split(
        "-----END PGP SIGNATURE-----", 1
    )[0]
    encoded = "".join(
        line.strip()
        for line in section.splitlines()
        if line.strip()
        and not line.startswith("Version:")
        and not line.startswith("=")  # Armor CRC-24, not part of the packet.
    )
    return base64.b64decode(encoded, validate=True)


def verified_cleartext_body() -> bytes:
    with tempfile.TemporaryDirectory(prefix="lp2-anend-") as temporary:
        tmp = pathlib.Path(temporary)
        home = tmp / "gnupg"
        home.mkdir(mode=0o700)
        subprocess.run(
            ["gpg", "--homedir", str(home), "--batch", "--import", str(PUBLIC_KEY)],
            check=True,
            capture_output=True,
        )
        body_path = tmp / "verified-cleartext.bin"
        result = subprocess.run(
            [
                "gpg",
                "--homedir",
                str(home),
                "--batch",
                "--status-fd",
                "1",
                "--output",
                str(body_path),
                "--decrypt",
                str(PAYLOAD),
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        status = result.stdout + "\\n" + result.stderr
        if f"[GNUPG:] VALIDSIG {FINGERPRINT}" not in status:
            raise RuntimeError("GnuPG did not report the expected valid signer fingerprint")
        return body_path.read_bytes()


def main() -> None:
    if hashlib.sha512(b"abc").hexdigest() != (
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a"
        "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
    ):
        raise RuntimeError("SHA-512 abc known-answer test failed")

    jpeg = JPEG.read_bytes()
    payload = PAYLOAD.read_bytes()
    for path, expected_blob in EXPECTED_GIT_BLOBS.items():
        data = path.read_bytes()
        if git_blob_sha1(data) != expected_blob:
            raise RuntimeError(f"Source Git blob mismatch: {path.relative_to(ROOT)}")

    objects = [
        ("2016 JPEG raw bytes", jpeg),
        ("OutGuess clear-signed payload exact bytes", payload),
        ("embedded OpenPGP signature packet binary", extract_signature_packet(payload)),
        ("GnuPG-verified cleartext body bytes", verified_cleartext_body()),
    ]

    output = []
    for name, data in objects:
        digest = hashlib.sha512(data).hexdigest()
        expected_length, expected_digest = EXPECTED[name]
        if len(data) != expected_length or digest != expected_digest:
            raise RuntimeError(
                f"Reproduction mismatch for {name}: {len(data)} bytes, SHA-512 {digest}"
            )
        output.append(
            {
                "object": name,
                "bytes": len(data),
                "sha512": digest,
                "matches_p56_target": digest == TARGET,
            }
        )

    if any(item["matches_p56_target"] for item in output):
        raise RuntimeError("An exact p56 target match was found; preserve and investigate it")
    print(
        json.dumps(
            {
                "target": TARGET,
                "sha512_abc_control": "PASS",
                "pgp_signature": "GOOD; signer fingerprint " + FINGERPRINT,
                "objects": output,
                "result": "0/4 exact-byte matches; this finite candidate set is closed",
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
