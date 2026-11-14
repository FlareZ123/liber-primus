#!/usr/bin/env python3
"""Scan original JPEGs for bytes after the final EOI and exact reverse-prefix echoes."""

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
    if eoi < 0:
        return {
            "name": name,
            "size": len(data),
            "has_eoi": False,
            "sha256": sha256(data),
        }
    tail = data[eoi + 2 :]
    return {
        "name": name,
        "size": len(data),
        "sha256": sha256(data),
        "eoi_offset": eoi,
        "tail_start": eoi + 2,
        "tail_length": len(tail),
        "tail_sha256": sha256(tail) if tail else None,
        "tail_is_exact_reversed_prefix": bool(tail) and tail[::-1] == data[: len(tail)],
        "tail_prefix_hex": tail[:16].hex() if tail else "",
        "tail_suffix_hex": tail[-16:].hex() if tail else "",
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
    anomalies = [r for r in records if r.get("tail_length", 0)]
    print(json.dumps({
        "image_count": len(records),
        "trailing_data_count": len(anomalies),
        "trailing_data": anomalies,
    }, indent=2))


if __name__ == "__main__":
    main()
