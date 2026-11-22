#!/usr/bin/env python3
"""Reproduce the default-key OutGuess census over the 75 archived JPEGs.

Run from the repository root:
    python sims/stage04_default_key_control_census.py

The existing outguess_extract module supplies the retrieval algorithm. This
wrapper compiles the coefficient-bitmap helper once and reports each image's
result without retaining binary payloads.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import tempfile

from outguess_extract import extract

DEFAULT_IMAGES = [f"{i:02d}.jpg" for i in range(75)]
DEFAULT_KEY = "Default key"
EXPECTED_P03_BLOB = "2a355d1bf14d37041384f09d8700e2ee274a13e6"
EXPECTED_P04_BLOB = "d738b052bf0548e2f431e231af7ef1514becb4ad"
EXPECTED_P04_SHA1 = "18b50380fcd1ac5133fbc418b5d17f869da93aa0"
EXPECTED_P04_SHA256 = "35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db"


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def max_printable_run(data: bytes) -> int:
    best = run = 0
    for value in data:
        if 32 <= value < 127 or value in (9, 10, 13):
            run += 1
            best = max(best, run)
        else:
            run = 0
    return best


def common_edge_length(items: list[bytes], reverse: bool = False) -> int:
    if not items:
        return 0
    values = [item[::-1] if reverse else item for item in items]
    limit = min(map(len, values))
    i = 0
    while i < limit and all(item[i] == values[0][i] for item in values[1:]):
        i += 1
    return i


def build_bitmap(image: pathlib.Path, helper: pathlib.Path) -> tuple[bytes, int]:
    proc = subprocess.run([str(helper), str(image)], check=True, capture_output=True)
    match = re.search(rb"eligible_coefficients=(\d+) bitmap_bytes=(\d+)", proc.stderr)
    if not match:
        raise RuntimeError(f"Could not parse bitmap counts for {image.name}: {proc.stderr!r}")
    bit_count, expected_bytes = map(int, match.groups())
    if len(proc.stdout) != expected_bytes:
        raise RuntimeError(f"Bitmap byte count mismatch for {image.name}: {len(proc.stdout)} != {expected_bytes}")
    return proc.stdout, bit_count


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1])
    parser.add_argument("--images", nargs="*", default=DEFAULT_IMAGES)
    parser.add_argument("--summary-only", action="store_true")
    args = parser.parse_args()

    root = args.root.resolve()
    image_dir = root / "resources" / "liber-primus"
    source = pathlib.Path(__file__).with_name("outguess_bitmap_dump.c")
    compiler = shutil.which("cc") or shutil.which("gcc")
    if not compiler:
        raise SystemExit("A C compiler (cc or gcc) is required")
    if not source.is_file():
        raise SystemExit(f"Missing coefficient-bitmap source: {source}")

    rows: list[dict] = []
    payloads: dict[str, bytes] = {}
    with tempfile.TemporaryDirectory(prefix="stage04-outguess-census-") as tmp:
        helper = pathlib.Path(tmp) / "outguess_bitmap_dump"
        subprocess.run([compiler, "-O2", "-o", str(helper), str(source), "-ljpeg"], check=True, capture_output=True)
        for name in args.images:
            image = image_dir / name
            raw = image.read_bytes()
            row = {
                "image": name,
                "image_bytes": len(raw),
                "image_sha256": hashlib.sha256(raw).hexdigest(),
                "image_git_blob_sha1": git_blob_sha1(raw),
            }
            try:
                bitmap, bit_count = build_bitmap(image, helper)
                payload, meta = extract(bitmap, bit_count, DEFAULT_KEY)
                row.update({
                    "status": "extracted",
                    "eligible_coefficients": bit_count,
                    "bitmap_bytes": len(bitmap),
                    "header_hex": meta["header_hex"],
                    "seed": meta["seed"],
                    "length": meta["length"],
                    "payload_bytes": len(payload),
                    "payload_sha1": hashlib.sha1(payload).hexdigest(),
                    "payload_sha256": hashlib.sha256(payload).hexdigest(),
                    "payload_git_blob_sha1": git_blob_sha1(payload),
                    "payload_entropy_bits_per_byte": round(meta["entropy_bits_per_byte"], 6),
                    "payload_printable_fraction": round(meta["printable_fraction"], 6),
                    "payload_max_printable_run": max_printable_run(payload),
                    "payload_magic": meta["magic"],
                    "payload_prefix_hex": payload[:32].hex(),
                })
                payloads[name] = payload
            except Exception as exc:  # Invalid header/iterator is not proof of absence.
                row.update({"status": "rejected", "error": str(exc)})
            rows.append(row)

    by_name = {row["image"]: row for row in rows}
    lp2_rows = [row for row in rows if 17 <= int(row["image"][:2]) <= 74]
    family = [row for row in lp2_rows if row.get("seed") == 41408 and row.get("length") == 58152]
    family_payloads = [payloads[row["image"]] for row in family]
    family_entropy = [row["payload_entropy_bits_per_byte"] for row in family]
    family_printable = [row["payload_printable_fraction"] for row in family]
    length_counts: dict[str, int] = {}
    for row in rows:
        if row.get("status") == "extracted":
            key = str(row["length"])
            length_counts[key] = length_counts.get(key, 0) + 1

    summary = {
        "archive_images": len(rows),
        "extracted": sum(row["status"] == "extracted" for row in rows),
        "rejected": sum(row["status"] == "rejected" for row in rows),
        "lp2_scan_range": "17.jpg-74.jpg",
        "lp2_images": len(lp2_rows),
        "lp2_extracted": sum(row["status"] == "extracted" for row in lp2_rows),
        "lp2_rejected": sum(row["status"] == "rejected" for row in lp2_rows),
        "lp2_58152_family": {
            "count": len(family),
            "pages": [int(row["image"][:2]) for row in family],
            "header_hex": family[0]["header_hex"] if family else None,
            "seed": 41408,
            "length": 58152,
            "common_payload_prefix_bytes": common_edge_length(family_payloads),
            "common_payload_suffix_bytes": common_edge_length(family_payloads, reverse=True),
            "payload_entropy_bits_per_byte_range": [min(family_entropy), max(family_entropy)] if family_entropy else None,
            "payload_printable_fraction_range": [min(family_printable), max(family_printable)] if family_printable else None,
            "recognized_payload_magic": sorted({magic for row in family for magic in row["payload_magic"]}),
        },
        "valid_output_length_counts": dict(sorted(length_counts.items(), key=lambda item: int(item[0]))),
        "page03_positive_control": by_name.get("03.jpg"),
        "page04_target": by_name.get("04.jpg"),
        "page05_control": by_name.get("05.jpg"),
        "page04_unique_7524_byte_output_in_supplied_archive": sum(row.get("length") == 7524 for row in rows) == 1,
    }

    if set(args.images) == set(DEFAULT_IMAGES):
        assert len(rows) == 75
        assert by_name["03.jpg"]["payload_git_blob_sha1"] == EXPECTED_P03_BLOB
        assert by_name["04.jpg"]["payload_git_blob_sha1"] == EXPECTED_P04_BLOB
        assert by_name["04.jpg"]["payload_sha1"] == EXPECTED_P04_SHA1
        assert by_name["04.jpg"]["payload_sha256"] == EXPECTED_P04_SHA256
        assert len(family) == 16
        assert summary["lp2_58152_family"]["common_payload_prefix_bytes"] == 1417
        assert summary["lp2_58152_family"]["common_payload_suffix_bytes"] == 1554
        assert summary["page04_unique_7524_byte_output_in_supplied_archive"]

    output = {
        "extractor": "repository sims/outguess_extract.py + sims/outguess_bitmap_dump.c; source-faithful OutGuess 0.4 retrieval implementation",
        "historical_default_key": DEFAULT_KEY,
        "historical_version_note": "The preserved 2014 command is outguess -r without -k; the exact historical binary version is not pinned. OutGuess 0.2.x source declares the built-in key as 'Default key'.",
        "summary": summary,
    }
    if not args.summary_only:
        output["rows"] = rows
    print(json.dumps(output, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
