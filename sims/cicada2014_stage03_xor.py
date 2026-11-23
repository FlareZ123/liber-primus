#!/usr/bin/env python3
"""Reconstruct the 2014 Stage 03 three-image XOR handoff from LP1 OutGuess payloads.

The three page payloads are PGP clear-signed messages whose cleartext bodies are
991-byte hex strings.  The historically specified operation is a bytewise XOR
of those three decoded bodies, yielding a second PGP clear-signed message.
Its 70-character 5-gram ciphertext is then read through the documented
14-column permutation.

This is a historical-chain reproducer, not an LP2 decryption claim.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

PAGES = ("00", "01", "02")
COLUMN_ORDER = (2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10)
EXPECTED_CIPHERTEXT = (
    "IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ"
    "7TFYVOIUAUSNOCO5JI4MEODZZ"
)
EXPECTED_PLAINTEXT = (
    "GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSION"
    "JOINUSATFV7LYUCMEOZZD5J4ONIO"
)
EXPECTED_ONION = "fv7lyucmeozzd5j4.onion"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extract_signed_hex(path: Path) -> tuple[bytes, str]:
    text = path.read_text(encoding="ascii")
    match = re.search(
        r"-----BEGIN PGP SIGNED MESSAGE-----\r?\n"
        r"Hash:[^\r\n]*\r?\n\r?\n"
        r"(.*?)\r?\n-----BEGIN PGP SIGNATURE-----",
        text,
        flags=re.DOTALL,
    )
    if not match:
        raise ValueError(f"{path}: missing PGP cleartext-signed body")
    body = match.group(1)
    compact = re.sub(r"\s+", "", body)
    if not re.fullmatch(r"[0-9a-fA-F]+", compact):
        raise ValueError(f"{path}: cleartext body is not a pure hex string")
    if len(compact) != 1982:
        raise ValueError(f"{path}: expected 1982 hex characters, got {len(compact)}")
    data = bytes.fromhex(compact)
    if len(data) != 991:
        raise ValueError(f"{path}: expected 991 bytes, got {len(data)}")
    return data, compact.lower()


def xor_three(blobs: list[bytes]) -> bytes:
    if len(blobs) != 3 or len({len(x) for x in blobs}) != 1:
        raise ValueError("expected exactly three equal-length byte streams")
    return bytes(a ^ b ^ c for a, b, c in zip(*blobs))


def decrypt_14_columns(message: bytes) -> tuple[str, str]:
    text = message.decode("ascii")
    match = re.search(
        r"Hash:[^\r\n]*\r?\n\r?\n(.*?)\r?\n-----BEGIN PGP SIGNATURE-----",
        text,
        flags=re.DOTALL,
    )
    if not match:
        raise ValueError("XOR result is not a PGP cleartext-signed message")
    body = match.group(1)
    ciphertext = re.sub(r"[^A-Z0-9]", "", body.split("Good luck.", 1)[0])
    if len(ciphertext) != 70:
        raise ValueError(f"expected 70 ciphertext characters, got {len(ciphertext)}")
    if ciphertext != EXPECTED_CIPHERTEXT:
        raise ValueError("XOR result does not match the known 70-character 5-gram input")

    rows = [ciphertext[i:i + 14] for i in range(0, 70, 14)]
    plaintext = "".join("".join(row[col] for col in COLUMN_ORDER) for row in rows)
    if plaintext != EXPECTED_PLAINTEXT:
        raise ValueError("14-column transposition did not produce the expected plaintext")
    return ciphertext, plaintext


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=Path, required=True,
                        help="directory containing 00.payload, 01.payload, 02.payload")
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    args.output_dir.mkdir(parents=True, exist_ok=True)
    inputs = []
    blobs = []
    for page in PAGES:
        path = args.input_dir / f"{page}.payload"
        blob, hex_body = extract_signed_hex(path)
        blobs.append(blob)
        inputs.append({
            "page": page,
            "file": path.name,
            "file_sha256": sha256(path.read_bytes()),
            "hex_body_sha256": sha256(hex_body.encode("ascii")),
            "decoded_bytes": len(blob),
            "decoded_sha256": sha256(blob),
        })

    combined = xor_three(blobs)
    ciphertext, plaintext = decrypt_14_columns(combined)
    xor_path = args.output_dir / "stage03-three-image-xor.asc"
    xor_path.write_bytes(combined)
    plaintext_path = args.output_dir / "stage03-three-image-plaintext.txt"
    plaintext_path.write_text(
        "Ciphertext (70 chars):\n"
        f"{' '.join(ciphertext[i:i + 5] for i in range(0, 70, 5))}\n\n"
        "14-column order (zero-based):\n"
        f"{list(COLUMN_ORDER)}\n\n"
        "Plaintext (70 chars):\n"
        f"{plaintext}\n\n"
        "Recovered hidden-service address:\n"
        f"{EXPECTED_ONION}\n"
        "Note: the transposed 70-character text ends in ONIO; the documented "
        "hidden-service suffix completes .onion.\n",
        encoding="utf-8",
    )

    report = {
        "operation": "bytewise XOR of three 991-byte hex-decoded cleartext bodies",
        "inputs": inputs,
        "xor_output": {
            "file": xor_path.name,
            "bytes": len(combined),
            "sha256": sha256(combined),
            "begins_with_pgp_cleartext_signature": combined.startswith(
                b"-----BEGIN PGP SIGNED MESSAGE-----"
            ),
        },
        "transposition": {
            "rows": 5,
            "columns": 14,
            "column_order_zero_based": list(COLUMN_ORDER),
            "ciphertext_70": ciphertext,
            "plaintext_70": plaintext,
            "onion_address": EXPECTED_ONION,
        },
        "scope": "2014 historical puzzle-chain reconstruction; not an LP2 plaintext result",
    }
    (args.output_dir / "stage03-three-image-xor.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
