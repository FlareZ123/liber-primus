#!/usr/bin/env python3
"""Extract the single CDX-pinned 2017 root HTML response from its named WARC."""
from __future__ import annotations

import argparse
import base64
import hashlib
import importlib.metadata
import json
import shutil
from pathlib import Path

from warcio.archiveiterator import ArchiveIterator

TARGET_URI = "http://1711141131131.xyz/"
TARGET_DATE = "2017-06-29T04:39:35Z"
EXPECTED_WARC_BYTES = 22_508_403
EXPECTED_ENTITY_BYTES = 4_521
EXPECTED_CDX_SHA1 = "GPMGLFNUMSJSUJVXPZSRAZPQJBVLRDPV"
WARC_URL = (
    "https://archive.org/download/falconk_archivebot_1711141131131_xyz_20170629/"
    "1711141131131.xyz-inf-20170629-043925-ewtko-00000.warc.gz"
)
WARC_FILENAME = "1711141131131.xyz-inf-20170629-043925-ewtko-00000.warc.gz"
CDX_LINE = (
    "20170629043935 http://1711141131131.xyz/ text/html 200 "
    "GPMGLFNUMSJSUJVXPZSRAZPQJBVLRDPV 4521"
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha1_base32(data: bytes) -> str:
    return base64.b32encode(hashlib.sha1(data).digest()).decode("ascii").rstrip("=")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--warc", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()

    warc_path = args.warc
    warc_size = warc_path.stat().st_size
    if warc_size != EXPECTED_WARC_BYTES:
        raise SystemExit(f"WARC size mismatch: {warc_size} != {EXPECTED_WARC_BYTES}")
    warc_hash = hashlib.sha256(warc_path.read_bytes()).hexdigest()

    matches = []
    with warc_path.open("rb") as stream:
        for record in ArchiveIterator(stream):
            if record.rec_type != "response":
                continue
            target = record.rec_headers.get_header("WARC-Target-URI")
            date = record.rec_headers.get_header("WARC-Date")
            if target != TARGET_URI or date != TARGET_DATE:
                continue
            http = record.http_headers
            if http is None:
                raise SystemExit("Matched WARC response has no parsed HTTP headers")
            body = record.content_stream().read()
            matches.append({
                "body": body,
                "warc_headers": list(record.rec_headers.headers),
                "http_status_line": http.statusline,
                "http_headers": list(http.headers),
                "warc_record_id": record.rec_headers.get_header("WARC-Record-ID"),
                "warc_payload_digest": record.rec_headers.get_header("WARC-Payload-Digest"),
                "warc_block_digest": record.rec_headers.get_header("WARC-Block-Digest"),
                "warc_type": record.rec_headers.get_header("WARC-Type"),
                "warc_date": date,
                "target_uri": target,
            })

    if len(matches) != 1:
        raise SystemExit(f"Expected exactly one pinned response; found {len(matches)}")
    found = matches[0]
    body = found.pop("body")
    if len(body) != EXPECTED_ENTITY_BYTES:
        raise SystemExit(f"HTTP entity length mismatch: {len(body)} != {EXPECTED_ENTITY_BYTES}")
    body_sha1 = sha1_base32(body)
    if body_sha1 != EXPECTED_CDX_SHA1:
        raise SystemExit(f"CDX SHA-1 mismatch: {body_sha1} != {EXPECTED_CDX_SHA1}")
    if found["warc_payload_digest"] and found["warc_payload_digest"].lower() != ("sha1:" + EXPECTED_CDX_SHA1).lower():
        raise SystemExit("WARC-Payload-Digest does not match the pinned CDX digest")

    out = args.output_dir
    out.mkdir(parents=True, exist_ok=True)
    shutil.copy2(warc_path, out / WARC_FILENAME)
    body_path = out / "root-20170629T043935Z.html"
    body_path.write_bytes(body)

    metadata = {
        "description": "Exact HTTP entity body from the single CDX-pinned ArchiveBot WARC response.",
        "capture_address": found["target_uri"],
        "capture_timestamp_utc": found["warc_date"],
        "http_status_line": found["http_status_line"],
        "http_headers": found["http_headers"],
        "warc_headers": found["warc_headers"],
        "warc_record_id": found["warc_record_id"],
        "warc_type": found["warc_type"],
        "warc_payload_digest": found["warc_payload_digest"],
        "warc_block_digest": found["warc_block_digest"],
        "entity_body_bytes": len(body),
        "entity_body_sha1_base32": body_sha1,
        "entity_body_sha256": sha256(body),
        "entity_body_path": body_path.name,
        "source_warc_url": WARC_URL,
        "source_warc_filename": WARC_FILENAME,
        "source_warc_bytes": warc_size,
        "source_warc_sha256": warc_hash,
        "warcio_version": importlib.metadata.version("warcio"),
        "archivebot_item": "falconk_archivebot_1711141131131_xyz_20170629",
        "cdx_record": CDX_LINE,
        "cdx_sha1_verified": True,
        "limitations": [
            "This establishes what the named host served at the captured time, not who authored or authenticated it.",
            "The ArchiveBot batch manifest labels the associated assets NOT PGP-signed and attribution to 3301 unverified.",
            "No linked media or other URLs are fetched by this extractor."
        ]
    }
    (out / "root-20170629T043935Z.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8"
    )
    sums = (
        f"{sha256(body)}  {body_path.name}\n"
        f"{warc_hash}  {WARC_FILENAME}\n"
    )
    (out / "SHA256SUMS").write_text(sums, encoding="ascii")
    readme = """# 2017 ArchiveBot root capture

This directory preserves the exact compressed WARC file named by the pinned ArchiveBot item record and the exact HTTP entity body of the CDX-pinned response.

- Capture: http://1711141131131.xyz/
- WARC timestamp: 2017-06-29T04:39:35Z
- CDX length/digest: 4521 bytes / GPMGLFNUMSJSUJVXPZSRAZPQJBVLRDPV
- root-20170629T043935Z.html is the HTTP entity body only; root-20170629T043935Z.json preserves WARC and HTTP headers plus SHA-256 values.
- SHA256SUMS covers the entity body and compressed WARC source.

This is an archival record of what the domain served, not authentication of the domain as a Cicada 3301 continuation. The pinned ArchiveBot batch manifest labels the associated assets "NOT PGP-signed, attribution to 3301 unverified." No linked media is fetched or executed.
"""
    (out / "README.md").write_text(readme, encoding="utf-8")
    print(json.dumps(metadata, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
