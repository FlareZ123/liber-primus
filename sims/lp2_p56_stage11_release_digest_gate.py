#!/usr/bin/env python3
"""Bounded original-byte test of the p56 digest against the 2014 Stage11 index and LP2 page JPEGs."""
from __future__ import annotations

import argparse
import hashlib
import subprocess
from pathlib import Path

TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
INDEX_GIT_BLOB_SHA1 = "303db130705f0ef9be2a738f4336d5cfcebde80c"
P55_SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"


def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode("ascii") + data).hexdigest()


def whirlpool(data: bytes) -> str:
    proc = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    return proc.stdout.decode("ascii").strip().rsplit("=", 1)[1].strip().lower()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lp2-dir", type=Path, required=True,
                        help="directory containing original LP2 archive images 00.jpg..74.jpg")
    parser.add_argument("--index", type=Path, required=True,
                        help="exact archived 2014 Stage11 index HTML")
    args = parser.parse_args()

    index_bytes = args.index.read_bytes()
    assert len(index_bytes) == 1640, f"unexpected Stage11 index length: {len(index_bytes)}"
    blob_sha = git_blob_sha1(index_bytes)
    assert blob_sha == INDEX_GIT_BLOB_SHA1, f"Stage11 index Git blob mismatch: {blob_sha}"

    index_sha512 = hashlib.sha512(index_bytes).hexdigest()
    index_whirlpool = whirlpool(index_bytes)
    print(f"index_bytes={len(index_bytes)} git_blob_sha1={blob_sha}")
    print(f"index_sha512={index_sha512}")
    print(f"index_whirlpool={index_whirlpool}")

    matches = []
    checked = 0
    for physical_page in range(58):
        archive_index = physical_page + 17  # archive 17..74 = LP2 physical p0..p57
        path = args.lp2_dir / f"{archive_index:02d}.jpg"
        data = path.read_bytes()
        checked += 1
        sha512 = hashlib.sha512(data).hexdigest()
        wp = whirlpool(data)
        if sha512 == TARGET or wp == TARGET:
            matches.append({
                "physical_page": physical_page,
                "archive_index": archive_index,
                "sha512": sha512,
                "whirlpool": wp,
            })
        if physical_page == 55:
            sha256 = hashlib.sha256(data).hexdigest()
            assert sha256 == P55_SHA256, f"p55 source-byte control mismatch: {sha256}"

    print(f"page_images_checked={checked} p55_sha256_control={P55_SHA256}")
    print(f"target={TARGET}")
    print(f"matches={matches}")
    assert checked == 58
    assert not matches, "candidate match found; inspect before treating this as a negative"
    print("DECISION: no exact SHA-512 or Whirlpool match among the Stage11 index or 58 original LP2 page JPEGs")


if __name__ == "__main__":
    main()
