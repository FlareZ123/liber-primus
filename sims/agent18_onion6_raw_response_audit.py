#!/usr/bin/env python3
"""Audit the archived 2014 Onion 6 response and its hexadecimal companion.

Inputs are fetched at a pinned upstream commit by the workflow. This script
checks the source blobs, decodes only the supplied hex representation, and
compares the resulting object with the independently archived onion6.jpg.
It does not search arbitrary stego parameters or candidate keys.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

SOURCE_COMMIT = "d360ad97d39c4719e42dc88b0cbbb81ed54aa02c"
P56_TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a842"
    "5893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
SOURCES = {
    "response_body": {
        "filename": "response_body.bin",
        "size": 8623291,
        "git_blob_sha1": "eeabba07a9a97d5446cbf6bddc6f6bf4f18d13ff",
    },
    "response_hex": {
        "filename": "response.hex",
        "size": 8623280,
        "git_blob_sha1": "731c591392467d9dd9e805927f0fef31d925e951",
    },
    "headers": {
        "filename": "response.headers",
        "size": 241,
        "git_blob_sha1": "9d55da374559f44abbb9a474c4a01833ec702404",
    },
    "onion6_jpg": {
        "filename": "onion6.jpg",
        "size": 4240957,
        "git_blob_sha1": "369ee0a0eb59b999a5f9c0574d306fb78fa0b9ec",
    },
}


def sha(name: str, data: bytes) -> dict:
    blob = hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()
    return {
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "sha512": hashlib.sha512(data).hexdigest(),
        "git_blob_sha1": blob,
        "matches_p56_sha512": hashlib.sha512(data).hexdigest() == P56_TARGET,
    }


def all_offsets(data: bytes, needle: bytes) -> list[int]:
    found: list[int] = []
    start = 0
    while True:
        at = data.find(needle, start)
        if at < 0:
            return found
        found.append(at)
        start = at + 1


def common_edges(a: bytes, b: bytes) -> tuple[int, int]:
    prefix = 0
    limit = min(len(a), len(b))
    while prefix < limit and a[prefix] == b[prefix]:
        prefix += 1
    suffix = 0
    while suffix < limit - prefix and a[len(a) - suffix - 1] == b[len(b) - suffix - 1]:
        suffix += 1
    return prefix, suffix


def jpeg_info(data: bytes) -> dict:
    soi = all_offsets(data, b"\xff\xd8")
    eoi = all_offsets(data, b"\xff\xd9")
    first_eoi = eoi[0] if eoi else -1
    end = first_eoi + 2 if first_eoi >= 0 else -1
    trailer = data[end:] if end >= 0 else b""
    signatures = {
        "jpeg_soi": b"\xff\xd8\xff",
        "png": b"\x89PNG\r\n\x1a\n",
        "gif87a": b"GIF87a",
        "gif89a": b"GIF89a",
        "zip_local": b"PK\x03\x04",
        "pdf": b"%PDF-",
        "gzip": b"\x1f\x8b\x08",
        "7z": b"7z\xbc\xaf\x27\x1c",
        "rar": b"Rar!\x1a\x07",
        "elf": b"\x7fELF",
        "openpgp_public": b"-----BEGIN PGP PUBLIC KEY BLOCK-----",
        "openpgp_message": b"-----BEGIN PGP MESSAGE-----",
    }
    magic = {
        label: all_offsets(data, sig)[:20]
        for label, sig in signatures.items()
        if data.find(sig) >= 0
    }
    return {
        "starts_jpeg": data.startswith(b"\xff\xd8\xff"),
        "soi_offsets_first20": soi[:20],
        "eoi_offsets_first20": eoi[:20],
        "first_eoi_offset": first_eoi,
        "first_jpeg_end_offset": end,
        "trailer_bytes_after_first_eoi": len(trailer),
        "trailer_sha256": hashlib.sha256(trailer).hexdigest() if trailer else None,
        "trailer_sha512": hashlib.sha512(trailer).hexdigest() if trailer else None,
        "trailer_magic": {
            label: all_offsets(trailer, sig)[:20]
            for label, sig in signatures.items()
            if trailer.find(sig) >= 0
        },
        "embedded_magic_offsets": magic,
    }


def main() -> int:
    if len(sys.argv) != 3:
        raise SystemExit("usage: audit.py <input-dir> <output-dir>")
    input_dir, output_dir = map(Path, sys.argv[1:])
    output_dir.mkdir(parents=True, exist_ok=True)

    loaded: dict[str, bytes] = {}
    summary: dict = {
        "source_repository": "cijhho123/cicada3301",
        "source_commit": SOURCE_COMMIT,
        "source_paths": {
            "response_body": "2014/Websites/onion 6/ut3qtzbrvs7dtvzp.onion",
            "response_hex": "2014/Websites/onion 6/ut3qtzbrvs7dtvzp.onion.hex",
            "headers": "2014/Websites/onion 6/ut3qtzbrvs7dtvzp.onion.headers",
            "onion6_jpg": "2014/Websites/onion 6/onion6.jpg",
        },
        "p56_sha512_target": P56_TARGET,
        "source_files": {},
    }

    for label, meta in SOURCES.items():
        data = (input_dir / meta["filename"]).read_bytes()
        loaded[label] = data
        actual = sha(label, data)
        actual["expected_bytes"] = meta["size"]
        actual["expected_git_blob_sha1"] = meta["git_blob_sha1"]
        actual["source_blob_verified"] = (
            actual["bytes"] == meta["size"]
            and actual["git_blob_sha1"] == meta["git_blob_sha1"]
        )
        summary["source_files"][label] = actual

    headers = loaded["headers"].decode("latin-1", errors="replace")
    summary["headers_text"] = headers
    content_length = re.search(r"(?im)^Content-Length:\s*(\d+)", headers)
    summary["header_content_length"] = int(content_length.group(1)) if content_length else None
    summary["header_length_matches_body"] = (
        summary["header_content_length"] == len(loaded["response_body"])
        if content_length else None
    )

    raw_body = loaded["response_body"]
    hex_file = loaded["response_hex"]
    summary["raw_body_prefix_hex"] = raw_body[:48].hex()
    summary["raw_body_suffix_hex"] = raw_body[-48:].hex()
    summary["raw_body_is_ascii_hex"] = bool(re.fullmatch(rb"[\s0-9a-fA-F]+", raw_body))
    summary["hex_file_is_ascii_hex"] = bool(re.fullmatch(rb"[\s0-9a-fA-F]+", hex_file))
    body_hex = re.sub(rb"\s+", b"", raw_body)
    file_hex = re.sub(rb"\s+", b"", hex_file)
    summary["raw_body_hex_chars_after_whitespace"] = len(body_hex)
    summary["hex_file_hex_chars_after_whitespace"] = len(file_hex)
    summary["raw_body_equals_hex_file"] = raw_body == hex_file
    summary["raw_body_hex_equals_hex_file_hex"] = body_hex == file_hex
    body_prefix, body_suffix = common_edges(raw_body, hex_file)
    summary["raw_body_vs_hex_file"] = {
        "common_prefix_bytes": body_prefix,
        "common_suffix_bytes": body_suffix,
        "raw_body_length": len(raw_body),
        "hex_file_length": len(hex_file),
        "length_difference": len(raw_body) - len(hex_file),
    }

    decoded_candidates: dict[str, bytes] = {}
    for label, candidate in (("response_hex", hex_file), ("response_body", raw_body)):
        compact = re.sub(rb"\s+", b"", candidate)
        if compact and len(compact) % 2 == 0 and re.fullmatch(rb"[0-9a-fA-F]+", compact):
            decoded = bytes.fromhex(compact.decode("ascii"))
            decoded_candidates[label] = decoded
            out_path = output_dir / f"{label}-decoded.bin"
            out_path.write_bytes(decoded)
            summary[f"{label}_decoded"] = sha(label + "_decoded", decoded)
            summary[f"{label}_decoded"]["output_file"] = out_path.name
            summary[f"{label}_decoded"]["jpeg"] = jpeg_info(decoded)
            if decoded.startswith(b"\xff\xd8\xff"):
                (output_dir / f"{label}-decoded.jpg").write_bytes(decoded)

    if "response_hex" in decoded_candidates:
        decoded = decoded_candidates["response_hex"]
        original = loaded["onion6_jpg"]
        prefix, suffix = common_edges(decoded, original)
        summary["decoded_hex_vs_onion6_jpg"] = {
            "decoded_length": len(decoded),
            "original_length": len(original),
            "exact_equal": decoded == original,
            "decoded_starts_with_original": decoded.startswith(original),
            "original_starts_with_decoded": original.startswith(decoded),
            "common_prefix_bytes": prefix,
            "common_suffix_bytes": suffix,
            "length_difference": len(decoded) - len(original),
            "decoded_jpeg": jpeg_info(decoded),
            "original_jpeg": jpeg_info(original),
        }
        if decoded.startswith(original) and len(decoded) > len(original):
            trailer = decoded[len(original):]
            (output_dir / "bytes-after-onion6-jpg-prefix.bin").write_bytes(trailer)
            summary["bytes_after_original_prefix"] = sha("trailer", trailer)
            summary["bytes_after_original_prefix"]["output_file"] = "bytes-after-onion6-jpg-prefix.bin"

    # Also test whether the p56 target appears literally or as raw 64-byte digest.
    target_bytes = bytes.fromhex(P56_TARGET)
    for label, data in list(loaded.items()) + list(decoded_candidates.items()):
        summary.setdefault("target_occurrences", {})[label] = {
            "hex_ascii_offsets": all_offsets(data.lower(), P56_TARGET.encode("ascii"))[:20],
            "raw_digest_offsets": all_offsets(data, target_bytes)[:20],
        }

    (output_dir / "summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))

    bad_sources = [
        label for label, result in summary["source_files"].items()
        if not result["source_blob_verified"]
    ]
    if bad_sources:
        print("SOURCE BLOB VERIFICATION FAILED:", ", ".join(bad_sources), file=sys.stderr)
        return 2
    if not summary["hex_file_is_ascii_hex"]:
        print("The companion .hex file is not pure hexadecimal text.", file=sys.stderr)
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
