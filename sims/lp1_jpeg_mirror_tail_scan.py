#!/usr/bin/env python3
"""Scan original JPEGs for post-EOI data and maximal byte-mirror shells."""

from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def inspect(name: str, data: bytes) -> dict:
    eoi = data.rfind(b"\xff\xd9")
    tail = data[eoi + 2 :] if eoi >= 0 else b""

    mirror = 0
    while mirror < len(data) // 2 and data[mirror] == data[-1 - mirror]:
        mirror += 1
    middle = data[mirror : len(data) - mirror]
    stripped = middle.strip()
    is_hex = bool(stripped) and len(stripped) % 2 == 0 and all(
        byte in b"0123456789abcdefABCDEF" for byte in stripped
    )
    decoded = bytes.fromhex(stripped.decode("ascii")) if is_hex else b""

    return {
        "name": name,
        "size": len(data),
        "sha256": sha256(data),
        "eoi_offset": eoi,
        "post_eoi_length": len(tail),
        "post_eoi_sha256": sha256(tail) if tail else None,
        "post_eoi_is_exact_reversed_prefix": bool(tail) and tail[::-1] == data[: len(tail)],
        "mirror_shell_length": mirror,
        "central_length": len(middle),
        "central_sha256": sha256(middle) if middle else None,
        "central_is_ascii_hex": is_hex,
        "central_hex_decoded_length": len(decoded) if is_hex else None,
        "central_hex_decoded_sha256": sha256(decoded) if is_hex else None,
    }


def load_images(source: Path):
    if source.is_file() and zipfile.is_zipfile(source):
        with zipfile.ZipFile(source) as archive:
            for name in archive.namelist():
                if name.lower().endswith((".jpg", ".jpeg")):
                    yield name, archive.read(name)
    elif source.is_dir():
        for path in sorted(source.rglob("*")):
            if path.is_file() and path.suffix.lower() in (".jpg", ".jpeg"):
                yield str(path.relative_to(source)), path.read_bytes()
    else:
        raise SystemExit(f"Expected a JPEG directory or ZIP archive: {source}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="JPEG directory or ZIP archive")
    args = parser.parse_args()

    records = [inspect(name, data) for name, data in load_images(args.source)]
    anomalies = [
        record for record in records
        if record["post_eoi_length"] or record["central_length"]
    ]
    print(json.dumps({
        "image_count": len(records),
        "anomaly_count": len(anomalies),
        "anomalies": anomalies,
    }, indent=2))


if __name__ == "__main__":
    main()
