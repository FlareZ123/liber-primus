#!/usr/bin/env python3
"""Reconstruct and verify the archived 2014 Huh2.jpg composite.

Run from any working directory:
    python sims/reconstruct_huh2_composite.py

No network access or third-party packages are required.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "resources" / "liber-primus"

EXPECTED = {
    "00_git_blob_sha1": "b99a2532e76bba018b2ace579238dd07e4fd3dbc",
    "01_git_blob_sha1": "73142da4b986c2679a100ac7be5399619d87843b",
    "02_git_blob_sha1": "ee89ee08025c4476294700a803626c9f631e115f",
    "reversed_02_sha256": "0d7a3ec5339b6578a68124f9f4a4e8626803613c97064aee304acc1f81866ae6",
    "huh2_sha256": "325ee77f09216cb6ca866ee5ef89ce68e068a3275c2788a6880d6653bc6ef89f",
    "huh2_git_blob_sha1": "aa5b1bad888710826c929529d61dae81ff308e77",
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def main() -> None:
    pages = {i: (PAGES / f"{i:02d}.jpg").read_bytes() for i in range(3)}
    for i in range(3):
        actual = git_blob_sha1(pages[i])
        expected = EXPECTED[f"{i:02d}_git_blob_sha1"]
        assert actual == expected, (f"{i:02d}.jpg Git blob SHA-1", actual, expected)

    reversed_02 = pages[2][::-1]
    assert sha256(reversed_02) == EXPECTED["reversed_02_sha256"]

    huh2 = pages[1] + reversed_02
    assert len(huh2) == 1_651_773
    assert sha256(huh2) == EXPECTED["huh2_sha256"]
    assert git_blob_sha1(huh2) == EXPECTED["huh2_git_blob_sha1"]

    print("Huh2.jpg reconstruction: EXACT")
    print(f"  page 01 bytes: {len(pages[1]):,}")
    print(f"  reversed page 02 bytes: {len(reversed_02):,}")
    print(f"  composite bytes: {len(huh2):,}")
    print(f"  trailer SHA-256: {sha256(reversed_02)}")
    print(f"  composite SHA-256: {sha256(huh2)}")
    print(f"  composite Git blob SHA-1: {git_blob_sha1(huh2)}")


if __name__ == "__main__":
    main()
