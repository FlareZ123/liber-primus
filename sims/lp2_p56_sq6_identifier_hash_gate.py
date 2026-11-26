#!/usr/bin/env python3
"""Bounded hash test of source-located sq6 identifiers and RSA challenge components.

Inputs:
- p56 target: exact 128-hex digest transcribed from original LP2 p56.
- valid-participant RSA modulus: resources/external/2012-sq6wmgv2zcsrix6t-valid-participant-rsa-message.asc.
- three response numbers: im-results/2012-rsa-participant-page-recovery.md.
- example number: the enrollment screenshot explicitly labels it as an example.

This is not a search over arbitrary strings or a test of the missing /NUM token.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import subprocess
from pathlib import Path

TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
HOST = "sq6wmgv2zcsrix6t.onion"
EMAIL = "quaetrix0@gmail.com"
MODULUS_DECIMAL = "7880891639791153779530258464649693928733411681581577103690292822333198036864739065916344030512697162068582555837"
EXPONENT = 65537
RESPONSE_NUMBERS = (
    "33521494043430258676",  # valid-participant mirror
    "29201928111913239376",  # unknown copy
    "25121996842107342310",  # another_unknown copy
)
EXAMPLE_NUMBER = "3894894230934209"  # screenshot labels this as an example
WHIRLPOOL_ABC = "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"


def der_len(n: int) -> bytes:
    if n < 128:
        return bytes([n])
    raw = n.to_bytes((n.bit_length() + 7) // 8, "big")
    return bytes([0x80 | len(raw)]) + raw


def tlv(tag: int, payload: bytes) -> bytes:
    return bytes([tag]) + der_len(len(payload)) + payload


def der_integer(value: int) -> bytes:
    raw = value.to_bytes((value.bit_length() + 7) // 8, "big")
    if raw[0] & 0x80:
        raw = b"\x00" + raw
    return tlv(0x02, raw)


def whirlpool(data: bytes) -> str:
    proc = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True,
    )
    return proc.stdout.decode("ascii").strip().split("=")[-1].strip().lower()


def candidates() -> dict[str, bytes]:
    n = int(MODULUS_DECIMAL)
    n_bytes = n.to_bytes((n.bit_length() + 7) // 8, "big")
    rsa_public_key = tlv(0x30, der_integer(n) + der_integer(EXPONENT))
    rsa_algorithm_identifier = bytes.fromhex("300d06092a864886f70d0101010500")
    subject_public_key_info = tlv(0x30, rsa_algorithm_identifier + tlv(0x03, b"\x00" + rsa_public_key))
    out = {
        "onion-host": HOST.encode("ascii"),
        "onion-host-bare": HOST.removesuffix(".onion").encode("ascii"),
        "http-root": ("http://" + HOST).encode("ascii"),
        "https-root": ("https://" + HOST).encode("ascii"),
        "http-root-slash": ("http://" + HOST + "/").encode("ascii"),
        "http-enrollment-url": ("http://" + HOST + "/cgi-bin/get_email").encode("ascii"),
        "https-enrollment-url": ("https://" + HOST + "/cgi-bin/get_email").encode("ascii"),
        "enrollment-path": b"/cgi-bin/get_email",
        "participant-email": EMAIL.encode("ascii"),
        "rsa-modulus-decimal": MODULUS_DECIMAL.encode("ascii"),
        "rsa-e-colon-n": f"{EXPONENT}:{MODULUS_DECIMAL}".encode("ascii"),
        "rsa-n-colon-e": f"{MODULUS_DECIMAL}:{EXPONENT}".encode("ascii"),
        "rsa-modulus-minimal-be": n_bytes,
        "rsa-public-key-der": rsa_public_key,
        "rsa-public-key-spki-der": subject_public_key_info,
        "example-number-decimal": EXAMPLE_NUMBER.encode("ascii"),
        "http-example-url": f"http://{HOST}/{EXAMPLE_NUMBER}".encode("ascii"),
        "https-example-url": f"https://{HOST}/{EXAMPLE_NUMBER}".encode("ascii"),
    }
    for index, number in enumerate(RESPONSE_NUMBERS, 1):
        out[f"response-{index}-decimal"] = number.encode("ascii")
        out[f"http-response-url-{index}"] = f"http://{HOST}/{number}".encode("ascii")
        out[f"https-response-url-{index}"] = f"https://{HOST}/{number}".encode("ascii")
    asc = Path("resources/external/2012-sq6wmgv2zcsrix6t-valid-participant-rsa-message.asc").read_bytes()
    marker = b"-----BEGIN PGP SIGNATURE-----"
    signature_armor = asc[asc.index(marker):]
    sig_lines = signature_armor.splitlines()
    sig_b64 = b"".join(line for line in sig_lines
                       if line and not line.startswith(b"-----")
                       and not line.startswith(b"Version:")
                       and not line.startswith(b"="))
    signature_packet = base64.b64decode(sig_b64)
    signature_no_version = b"\\n".join([sig_lines[0]] + sig_lines[3:-2] + [sig_lines[-1]]) + b"\\n"
    out.update({
        "signature-armor-exact": signature_armor,
        "signature-armor-no-version": signature_no_version,
        "signature-base64-text": sig_b64,
        "signature-binary-packet": signature_packet,
        "signature-keyid-upper": b"181F01E57A35090F",
        "signature-keyid-lower": b"181f01e57a35090f",
        "signature-version": b"GnuPG v1.4.11 (GNU/Linux)",
        "signature-crc24": b"LMdX",
    })
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    control = whirlpool(b"abc")
    if control != WHIRLPOOL_ABC:
        raise SystemExit(f"Whirlpool positive control failed: {control}")
    checks = []
    matches = []
    for name, raw in candidates().items():
        sha = hashlib.sha512(raw).hexdigest()
        whirl = whirlpool(raw)
        checks.append({"name": name, "length": len(raw), "sha512": sha, "whirlpool": whirl})
        if sha == TARGET:
            matches.append({"name": name, "algorithm": "SHA-512"})
        if whirl == TARGET:
            matches.append({"name": name, "algorithm": "Whirlpool"})
    result = {
        "target_sha512_or_whirlpool": TARGET,
        "candidate_count": len(checks),
        "hash_checks": 2 * len(checks),
        "whirlpool_positive_control_abc": control,
        "whirlpool_positive_control_passed": True,
        "matches": matches,
        "candidates": checks,
        "scope": "Exact source-located host/URL/path/email, valid-participant RSA modulus serializations, three decrypted response numbers and their URL paths, plus the screenshot's explicitly labelled example number. Does not test missing initial /NUM token or successful response body.",
    }
    rendered = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    print(f"candidates={len(checks)} hash_checks={2*len(checks)} matches={len(matches)}")
    print(f"whirlpool_abc_control={control} PASS")
    print("matches=" + json.dumps(matches))


if __name__ == "__main__":
    main()
