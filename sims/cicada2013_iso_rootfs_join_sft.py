"""Join the original 2013 ISO's embedded initramfs to its pinned source blob.

This is a bounded custody check, not a new cipher/key search. It verifies the
whole ISO before reading the exact BOOT/3301.IMG;1 member, then byte-compares
that member with the original-derived Git blob at a pinned commit.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile

import pycdlib
import requests

ISO_BYTES = 136_398_848
ISO_MD5 = "74062dee4093c6ca0340cda23f0e994b"
ISO_SHA1 = "df433cba87644b35cbc47f702a02e2b58d90af6a"
ISO_SHA256 = "784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f"

INITRAMFS_BYTES = 5_494_774
INITRAMFS_GIT_BLOB_SHA1 = "d4dba9a6d3c0d6ed751d71cdc484e4b7efe1ee0a"
SOURCE_REPO = "neuroretransmit/cicada"
SOURCE_COMMIT = "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3"
SOURCE_PATH = "2013/002-3301/3301-contents/boot/3301.img"
SOURCE_URL = (
    "https://raw.githubusercontent.com/"
    + SOURCE_REPO + "/" + SOURCE_COMMIT + "/" + SOURCE_PATH
)
ISO_URLS = (
    "https://connortumbleson.com/uploads/2024/01/3301.iso",
    "https://archive.org/download/3301.iso/3301.iso",
)
ISO_MEMBER = "/BOOT/3301.IMG;1"


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def digest_iso(path: Path) -> dict[str, str | int]:
    size = path.stat().st_size
    if size != ISO_BYTES:
        raise ValueError(f"ISO size mismatch: {size} != {ISO_BYTES}")
    hashes = {
        "md5": hashlib.md5(),
        "sha1": hashlib.sha1(),
        "sha256": hashlib.sha256(),
    }
    with path.open("rb") as source:
        while block := source.read(1 << 20):
            for digest in hashes.values():
                digest.update(block)
    result = {name: digest.hexdigest() for name, digest in hashes.items()}
    expected = {"md5": ISO_MD5, "sha1": ISO_SHA1, "sha256": ISO_SHA256}
    if result != expected:
        raise ValueError(f"ISO digest mismatch: {result!r}")
    return {"bytes": size, **result}


def download_verified_iso(path: Path) -> tuple[str, dict[str, str | int]]:
    path.parent.mkdir(parents=True, exist_ok=True)
    errors: list[str] = []
    for url in ISO_URLS:
        temp_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                prefix="cicada2013-", suffix=".iso", dir=path.parent, delete=False
            ) as tmp:
                temp_path = Path(tmp.name)
                with requests.get(url, stream=True, timeout=(30, 300)) as response:
                    response.raise_for_status()
                    for block in response.iter_content(chunk_size=1 << 20):
                        if block:
                            tmp.write(block)
                tmp.flush()
                os.fsync(tmp.fileno())
            digest = digest_iso(temp_path)
            os.replace(temp_path, path)
            return url, digest
        except (requests.RequestException, OSError, ValueError) as exc:
            errors.append(f"{url}: {exc}")
        finally:
            if temp_path is not None:
                temp_path.unlink(missing_ok=True)
    raise RuntimeError("No verified original ISO source: " + "; ".join(errors))


def extract_member(path: Path) -> tuple[bytes, list[dict[str, int]]]:
    iso = pycdlib.PyCdlib()
    try:
        iso.open(str(path))
        extents = [
            {"offset": int(offset), "bytes": int(length)}
            for offset, length in iso.get_file_byte_extents(iso_path=ISO_MEMBER)
        ]
    finally:
        iso.close()
    if not extents:
        raise ValueError(f"ISO member not found: {ISO_MEMBER}")
    chunks: list[bytes] = []
    with path.open("rb") as source:
        for extent in extents:
            offset = extent["offset"]
            length = extent["bytes"]
            if offset < 0 or length <= 0 or offset + length > path.stat().st_size:
                raise ValueError(f"Invalid ISO extent: {extent!r}")
            source.seek(offset)
            chunk = source.read(length)
            if len(chunk) != length:
                raise ValueError(f"Short read for ISO extent: {extent!r}")
            chunks.append(chunk)
    return b"".join(chunks), extents


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--iso", type=Path, default=Path("3301-2013.iso"))
    parser.add_argument("--initramfs-out", type=Path, default=Path("3301.img"))
    parser.add_argument(
        "--report", type=Path, default=Path("cicada2013-iso-rootfs-join.json")
    )
    args = parser.parse_args()

    source_url, iso_digest = download_verified_iso(args.iso)
    embedded, extents = extract_member(args.iso)
    if len(embedded) != INITRAMFS_BYTES:
        raise ValueError(
            f"Embedded initramfs size mismatch: {len(embedded)} != {INITRAMFS_BYTES}"
        )
    embedded_blob_sha1 = git_blob_sha1(embedded)
    if embedded_blob_sha1 != INITRAMFS_GIT_BLOB_SHA1:
        raise ValueError(
            "Embedded initramfs Git blob mismatch: "
            f"{embedded_blob_sha1} != {INITRAMFS_GIT_BLOB_SHA1}"
        )

    response = requests.get(SOURCE_URL, timeout=(30, 120))
    response.raise_for_status()
    pinned_source = response.content
    source_blob_sha1 = git_blob_sha1(pinned_source)
    if source_blob_sha1 != INITRAMFS_GIT_BLOB_SHA1:
        raise ValueError(
            f"Pinned GitHub source blob mismatch: {source_blob_sha1}"
        )
    if embedded != pinned_source:
        raise ValueError("ISO member is not byte-identical to pinned GitHub source")

    args.initramfs_out.parent.mkdir(parents=True, exist_ok=True)
    args.initramfs_out.write_bytes(embedded)
    result = {
        "classification": "positive exact ISO-to-source custody join; no LP2 key or plaintext",
        "iso": {"url": source_url, **iso_digest},
        "iso_member": ISO_MEMBER,
        "member_extents": extents,
        "embedded_initramfs": {
            "bytes": len(embedded),
            "git_blob_sha1": embedded_blob_sha1,
            "sha256": hashlib.sha256(embedded).hexdigest(),
            "pinned_source_repository": SOURCE_REPO,
            "pinned_source_commit": SOURCE_COMMIT,
            "pinned_source_path": SOURCE_PATH,
            "pinned_source_url": SOURCE_URL,
            "pinned_source_bytes": len(pinned_source),
            "pinned_source_git_blob_sha1": source_blob_sha1,
            "byte_identical_to_pinned_source": True,
        },
        "written_initramfs_path": str(args.initramfs_out),
        "scope": (
            "Verifies the exact original ISO member against the pinned initramfs "
            "blob. The separate full rootfs inventory determines the contents; "
            "this join alone does not select an LP2 operation or key."
        ),
    }
    args.report.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print("ISO_SOURCE_URL", source_url)
    print("ISO_DIGESTS", json.dumps(iso_digest, sort_keys=True))
    print("ISO_MEMBER", ISO_MEMBER, "EXTENTS", json.dumps(extents))
    print("INITRAMFS_GIT_BLOB_SHA1", embedded_blob_sha1)
    print("INITRAMFS_BYTES", len(embedded), "BYTE_IDENTICAL_TO_PINNED_SOURCE", True)
    print("REPORT", args.report)


if __name__ == "__main__":
    main()
