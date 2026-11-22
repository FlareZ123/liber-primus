#!/usr/bin/env python3
"""Test the 2012 Valete RSA key's source-default OAEP scheme against Cicada artifacts.

The key constants are reproduced in sims/ps_number_lp2_screen.py. This script
keeps the cross-round padding test self-contained and uses only Python's standard
library. By default it scans the archived 2013 wisdom/folly bytes; pass the
existing OutGuess Actions artifact ZIP to include LP2 pages 17, 21, and 43.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import zipfile
from pathlib import Path

P = int("99554414790940424414351515490472769096534141749790794321708050837")
Q = int("104593961812606247801193807142122161186583731774511103180935025763")
N = int("10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631")
E = 65537
PHI = (P - 1) * (Q - 1)
D = pow(E, -1, PHI)
K = (N.bit_length() + 7) // 8

WISDOM_FOLLY_GIT_BLOB_SHA = "62b1b949a1e4e4a346e75b1c34101000d3c53220"
OUTGUESS_SHA256 = {
    "17": "cbf1ccddc6c4bb2fd96d449e0667eb5be6c2a542de4e0f43e7ca188df7f289b1",
    "21": "21e26fbcfd0f8cc5706ca4228245854703efa143173b793066ab3a2577f40db3",
    "43": "0a318b3e9e195fdea9e941b7b458ae9cddef5147eec646b6da231b7d6615fe43",
}


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode()
    return hashlib.sha1(header + data).hexdigest()


def mgf1_sha1(seed: bytes, length: int) -> bytes:
    out = bytearray()
    counter = 0
    while len(out) < length:
        out.extend(hashlib.sha1(seed + counter.to_bytes(4, "big")).digest())
        counter += 1
    return bytes(out[:length])


def oaep_sha1_decode(encoded: bytes) -> bytes | None:
    """Decode RSAES-OAEP with SHA-1, MGF1-SHA1, and the default empty label."""
    h_len = 20
    if len(encoded) != K or len(encoded) < 2 * h_len + 2 or encoded[0] != 0:
        return None
    masked_seed = encoded[1 : 1 + h_len]
    masked_db = encoded[1 + h_len :]
    seed_mask = mgf1_sha1(masked_db, h_len)
    seed = bytes(a ^ b for a, b in zip(masked_seed, seed_mask))
    db_mask = mgf1_sha1(seed, len(masked_db))
    db = bytes(a ^ b for a, b in zip(masked_db, db_mask))
    if db[:h_len] != hashlib.sha1(b"").digest():
        return None
    tail = db[h_len:]
    try:
        separator = tail.index(1)
    except ValueError:
        return None
    if any(tail[:separator]):
        return None
    return tail[separator + 1 :]


def pkcs1_v15_type2_decode(encoded: bytes) -> bytes | None:
    if len(encoded) != K or encoded[:2] != b"\x00\x02":
        return None
    try:
        separator = encoded.index(0, 2)
    except ValueError:
        return None
    if separator < 10:
        return None
    return encoded[separator + 1 :]


def pkcs1_v15_type1_decode(encoded: bytes) -> bytes | None:
    if len(encoded) != K or encoded[:2] != b"\x00\x01":
        return None
    pos = 2
    while pos < len(encoded) and encoded[pos] == 0xFF:
        pos += 1
    if pos < 10 or pos >= len(encoded) or encoded[pos] != 0:
        return None
    return encoded[pos + 1 :]


def pss_sha1_structure_decode(encoded: bytes) -> dict | None:
    """Check default EMSA-PSS structure: SHA-1, MGF1-SHA1, 20-byte salt, trailer 0xbc.

    This validates the encoded-message structure, not a signature's message hash:
    a full signature verification additionally needs the signed message.
    """
    h_len = 20
    salt_len = 20
    em_bits = N.bit_length() - 1
    em_len = (em_bits + 7) // 8
    if len(encoded) != em_len or encoded[-1] != 0xBC:
        return None
    unused = 8 * em_len - em_bits
    db_len = em_len - h_len - 1
    masked_db = encoded[:db_len]
    H = encoded[db_len : db_len + h_len]
    if unused and (masked_db[0] >> (8 - unused)) != 0:
        return None
    db_mask = mgf1_sha1(H, db_len)
    db = bytearray(a ^ b for a, b in zip(masked_db, db_mask))
    if unused:
        db[0] &= 0xFF >> unused
    ps_len = em_len - h_len - salt_len - 2
    if ps_len < 0 or any(db[:ps_len]) or db[ps_len] != 1:
        return None
    salt = bytes(db[ps_len + 1 :])
    if len(salt) != salt_len:
        return None
    return {"H": H.hex(), "salt": salt.hex(), "ps_len": ps_len}


def scan_windows(data: bytes) -> dict:
    """Scan every 54-byte big-endian window for OAEP and v1.5 enc/sign blocks."""
    counts = {
        "total_windows": max(0, len(data) - K + 1),
        "ciphertext_values_below_N": 0,
        "oaep_sha1_hits": [],
        "pkcs1_v15_type2_hits": [],
        "pkcs1_v15_type1_hits": [],
        "pss_sha1_structure_hits": [],
    }
    for offset in range(len(data) - K + 1):
        c = int.from_bytes(data[offset : offset + K], "big")
        if c >= N:
            continue
        counts["ciphertext_values_below_N"] += 1

        private_em = pow(c, D, N).to_bytes(K, "big")
        oaep_message = oaep_sha1_decode(private_em)
        if oaep_message is not None:
            counts["oaep_sha1_hits"].append(
                {"offset": offset, "message_hex": oaep_message.hex()}
            )
        v15_message = pkcs1_v15_type2_decode(private_em)
        if v15_message is not None:
            counts["pkcs1_v15_type2_hits"].append(
                {"offset": offset, "message_hex": v15_message.hex()}
            )

        public_em = pow(c, E, N).to_bytes(K, "big")
        signature_message = pkcs1_v15_type1_decode(public_em)
        pss_structure = pss_sha1_structure_decode(public_em)
        if pss_structure is not None:
            counts["pss_sha1_structure_hits"].append(
                {"offset": offset, **pss_structure}
            )
        if signature_message is not None:
            counts["pkcs1_v15_type1_hits"].append(
                {"offset": offset, "message_hex": signature_message.hex()}
            )
    return counts


def aligned_block_screen(data: bytes) -> dict:
    """Check all 54 possible offsets and both byte orders for complete RSA blocks."""
    result = {}
    for endian in ("big", "little"):
        rows = []
        for offset in range(K):
            blocks = [
                data[i : i + K]
                for i in range(offset, len(data) - K + 1, K)
            ]
            values = [int.from_bytes(block, endian) for block in blocks]
            below = sum(value < N for value in values)
            rows.append(
                {
                    "offset": offset,
                    "blocks": len(blocks),
                    "below_N": below,
                    "fraction_below_N": below / len(blocks) if blocks else 0.0,
                    "all_blocks_below_N": bool(blocks) and below == len(blocks),
                }
            )
        best = max(rows, key=lambda row: row["fraction_below_N"])
        result[endian] = {
            "best_alignment": best,
            "complete_valid_alignments": [
                row["offset"] for row in rows if row["all_blocks_below_N"]
            ],
        }
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--outguess-zip",
        type=Path,
        help="ZIP or extracted directory for the outguess-lp2-default-key Actions artifact",
    )
    args = parser.parse_args()

    assert P * Q == N
    assert (E * D) % PHI == 1
    assert K == 54

    root = Path(__file__).resolve().parents[1]
    b64_path = root / "resources/historical/cicada-2013-os-wisdom-folly.bin.b64"
    encoded = "".join(b64_path.read_text(encoding="ascii").split())
    wisdom_folly = base64.b64decode(encoded, validate=True)
    assert len(wisdom_folly) == 3368
    assert git_blob_sha(wisdom_folly) == WISDOM_FOLLY_GIT_BLOB_SHA

    results = {
        "rsa_modulus_bits": N.bit_length(),
        "rsa_block_bytes": K,
        "public_exponent": E,
        "artifacts": {
            "2013_wisdom_folly": {
                "bytes": len(wisdom_folly),
                "git_blob_sha": git_blob_sha(wisdom_folly),
                **scan_windows(wisdom_folly),
            }
        },
    }

    if args.outguess_zip:
        if args.outguess_zip.is_dir():
            payloads = {
                page: (args.outguess_zip / f"{page}.payload").read_bytes()
                for page in OUTGUESS_SHA256
            }
        else:
            with zipfile.ZipFile(args.outguess_zip) as archive:
                payloads = {
                    page: archive.read(f"{page}.payload")
                    for page in OUTGUESS_SHA256
                }
        for page, expected_sha in OUTGUESS_SHA256.items():
            data = payloads[page]
            actual_sha = hashlib.sha256(data).hexdigest()
            if len(data) != 58152 or actual_sha != expected_sha:
                raise ValueError(
                    f"Unexpected page {page} payload: {len(data)} bytes, {actual_sha}"
                )
            results["artifacts"][f"lp2_outguess_page_{page}"] = {
                "bytes": len(data),
                "sha256": actual_sha,
                **scan_windows(data),
                "54_byte_alignment_screen": aligned_block_screen(data),
            }

    print(json.dumps(results, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
