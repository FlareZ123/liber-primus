#!/usr/bin/env python3
"""Build a deterministic, source-only LP2 p0-p55 human packet."""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import zipfile
from pathlib import Path

EXPECTED_CONTEXT_BLOBS = {
    "cicada2014-stage11-message.asc": "e2b7382ac2cfb0adfe028cc063fc6048e0ad718e",
    "cicada2014-onion7-original-index.html": "303db130705f0ef9be2a738f4336d5cfcebde80c",
    "cicada-3301-2012-public-key.asc": "d44aec389e2f346c6b9d149d4c61e890f62979c9",
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def add_entry(zf: zipfile.ZipFile, name: str, data: bytes, compression: int) -> None:
    info = zipfile.ZipInfo(name, date_time=(2026, 11, 26, 0, 0, 0))
    info.compress_type = compression
    info.external_attr = 0o100644 << 16
    info.create_system = 3
    zf.writestr(info, data, compress_type=compression, compresslevel=9 if compression == zipfile.ZIP_DEFLATED else None)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--source-zip", type=Path, help="Optional 75-image archive; default uses repository resources")
    parser.add_argument("--context-dir", type=Path, help="Optional directory containing the three exact context files")
    parser.add_argument("--docs-dir", type=Path, help="Optional packet-doc directory")
    parser.add_argument("--output", type=Path, default=Path("lp2-p0-p55-blind-packet.zip"))
    args = parser.parse_args()

    docs_dir = args.docs_dir or args.repo_root / "workplace/lp2-human-cold-start-p0-p55"
    source_dir = args.repo_root / "resources/liber-primus"
    context_dir = args.context_dir or args.repo_root / "resources/historical"
    manifest_path = docs_dir / "manifest.csv"
    rows = list(csv.DictReader(manifest_path.open(newline="", encoding="utf-8")))
    if len(rows) != 56:
        raise SystemExit(f"expected 56 manifest rows, found {len(rows)}")

    source_archive = zipfile.ZipFile(args.source_zip) if args.source_zip else None
    try:
        page_entries: list[tuple[str, bytes]] = []
        packet_manifest = io.StringIO(newline="")
        writer = csv.writer(packet_manifest, lineterminator="\n")
        writer.writerow(["page", "filename", "sha256", "bytes"])
        checksum_map = {}
        if not source_archive:
            checksum_lines = (source_dir / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines()
            checksum_map = {line.split()[1]: line.split()[0] for line in checksum_lines if len(line.split()) == 2}
        for row in rows:
            page = int(row["page"][1:])
            if row["page"] != f"p{page:02d}" or page != len(page_entries):
                raise SystemExit(f"manifest order/label error at {row['page']}")
            archive_name = f"{page + 17:02d}.jpg"
            if source_archive:
                data = source_archive.read(f"liber-primus-jpegs/{archive_name}")
            else:
                data = (source_dir / archive_name).read_bytes()
                if checksum_map.get(archive_name) != sha256(data):
                    raise SystemExit(f"repository SHA256SUMS mismatch for {archive_name}")
            digest = sha256(data)
            if digest != row["sha256"] or len(data) != int(row["bytes"]):
                raise SystemExit(f"source mismatch for LP2 {row['page']} ({archive_name})")
            filename = row["filename"]
            page_entries.append((f"pages/{filename}", data))
            writer.writerow([row["page"], filename, digest, len(data)])
    finally:
        if source_archive:
            source_archive.close()

    context_entries: list[tuple[str, bytes]] = []
    for filename, expected_blob in EXPECTED_CONTEXT_BLOBS.items():
        data = (context_dir / filename).read_bytes()
        actual_blob = git_blob_sha1(data)
        if actual_blob != expected_blob:
            raise SystemExit(f"context source mismatch for {filename}: {actual_blob}")
        context_entries.append((f"context/{filename}", data))

    docs = [
        ("README.md", docs_dir / "PACKET_README.md"),
        ("ALLOWED_CONTEXT.md", docs_dir / "ALLOWED_CONTEXT.md"),
    ]
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w") as zf:
        for name, path in docs:
            add_entry(zf, name, path.read_bytes(), zipfile.ZIP_DEFLATED)
        add_entry(zf, "manifest.csv", packet_manifest.getvalue().encode("utf-8"), zipfile.ZIP_DEFLATED)
        for name, data in context_entries:
            add_entry(zf, name, data, zipfile.ZIP_DEFLATED)
        for name, data in page_entries:
            add_entry(zf, name, data, zipfile.ZIP_STORED)

    final_bytes = output.read_bytes()
    print(f"packet={output}")
    print(f"pages={len(page_entries)} image_bytes={sum(len(data) for _, data in page_entries)}")
    print(f"zip_bytes={len(final_bytes)} sha256={sha256(final_bytes)}")


if __name__ == "__main__":
    main()
