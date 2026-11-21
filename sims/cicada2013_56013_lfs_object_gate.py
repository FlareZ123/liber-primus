#!/usr/bin/env python3
"""Recover the exact DATA/560.13 Git LFS object from one pinned public repository.

This tests one already-known OID via the Git LFS batch/download protocol (POST),
then compares the downloaded bytes with the same member in the hash-verified
2013 ISO. It does not search filenames, digest families, or alternative hosts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import tempfile
from urllib.parse import quote, urlparse

import pycdlib
import requests

OWNER = "Caiobas12345"
REPO = "aulas-javascript"
COMMIT = "30a9368c01dc70f1e5a0cfedb8ad086045f184cd"
POINTER_PATH = (
    "The-Complete-Cicada3301-Archive/2013/additional files/"
    "Cicada OS/cicados/DATA/560.13"
)
POINTER_URL = (
    f"https://raw.githubusercontent.com/{OWNER}/{REPO}/{COMMIT}/"
    + quote(POINTER_PATH, safe="/")
)
LFS_BATCH_URL = f"https://github.com/{OWNER}/{REPO}.git/info/lfs/objects/batch"
OID = "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f"
OBJECT_BYTES = 118_818_811
ISO_MEMBER = "/DATA/560.13;1"
ISO_BYTES = 136_398_848
ISO_MD5 = "74062dee4093c6ca0340cda23f0e994b"
ISO_SHA1 = "df433cba87644b35cbc47f702a02e2b58d90af6a"
ISO_SHA256 = "784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f"
ISO_URLS = (
    "https://connortumbleson.com/uploads/2024/01/3301.iso",
    "https://archive.org/download/3301.iso/3301.iso",
)
CHUNK = 1 << 20
USER_AGENT = "cicada-56013-exact-lfs-object-gate/1.0"


def digest_file(path: Path, algorithms=("sha256",)) -> dict[str, str | int]:
    hashes = {name: hashlib.new(name) for name in algorithms}
    size = 0
    with path.open("rb") as source:
        while block := source.read(CHUNK):
            size += len(block)
            for digest in hashes.values():
                digest.update(block)
    return {"bytes": size, **{name: h.hexdigest() for name, h in hashes.items()}}


def stream_download(
    url: str,
    path: Path,
    *,
    headers: dict[str, str] | None = None,
    expected_bytes: int | None = None,
) -> dict:
    path.parent.mkdir(parents=True, exist_ok=True)
    request_headers = headers if headers is not None else {}
    with requests.get(
        url, headers=request_headers, stream=True, timeout=(30, 300),
        allow_redirects=True,
    ) as response:
        response.raise_for_status()
        with path.open("wb") as output:
            for block in response.iter_content(chunk_size=CHUNK):
                if block:
                    output.write(block)
        info = {
            "status_code": response.status_code,
            "final_host": urlparse(response.url).netloc,
            "content_length_header": response.headers.get("Content-Length"),
            "etag": response.headers.get("ETag"),
            "last_modified": response.headers.get("Last-Modified"),
            "content_type": response.headers.get("Content-Type"),
        }
    info.update(digest_file(path))
    if expected_bytes is not None and info["bytes"] != expected_bytes:
        raise ValueError(
            f"Downloaded byte count mismatch: {info['bytes']} != {expected_bytes}"
        )
    return info


def fetch_lfs_object(destination: Path) -> dict:
    pointer = requests.get(POINTER_URL, timeout=(30, 60), headers={"User-Agent": USER_AGENT})
    pointer.raise_for_status()
    pointer_text = pointer.content.decode("ascii", errors="strict")
    expected_pointer = (
        "version https://git-lfs.github.com/spec/v1\n"
        f"oid sha256:{OID}\n"
        f"size {OBJECT_BYTES}\n"
    )
    if pointer_text != expected_pointer:
        raise ValueError("Pinned GitHub file is not the expected exact LFS pointer")
    pointer_info = {
        "url": POINTER_URL,
        "bytes": len(pointer.content),
        "sha256": hashlib.sha256(pointer.content).hexdigest(),
        "exact_pointer_match": True,
    }

    payload = {
        "operation": "download",
        "transfers": ["basic"],
        "ref": {"name": "refs/heads/main"},
        "objects": [{"oid": OID, "size": OBJECT_BYTES}],
        "hash_algo": "sha256",
    }
    headers = {
        "Accept": "application/vnd.git-lfs+json",
        "Content-Type": "application/vnd.git-lfs+json",
        "User-Agent": "git-lfs/3.5.1",
    }
    try:
        response = requests.post(
            LFS_BATCH_URL, json=payload, headers=headers, timeout=(30, 120)
        )
    except requests.RequestException as exc:
        return {
            "available": False,
            "pointer": pointer_info,
            "batch_url": LFS_BATCH_URL,
            "error": f"{type(exc).__name__}: {exc}",
        }

    batch_record = {
        "status_code": response.status_code,
        "content_type": response.headers.get("Content-Type"),
        "www_authenticate": response.headers.get("WWW-Authenticate"),
    }
    try:
        batch_json = response.json()
    except ValueError:
        batch_json = {"body_preview": response.text[:1000]}
    if not response.ok:
        return {
            "available": False,
            "pointer": pointer_info,
            "batch_url": LFS_BATCH_URL,
            "batch": batch_record,
            "response": batch_json,
        }

    objects = batch_json.get("objects") or []
    if len(objects) != 1 or objects[0].get("oid") != OID:
        return {
            "available": False,
            "pointer": pointer_info,
            "batch_url": LFS_BATCH_URL,
            "batch": batch_record,
            "response": batch_json,
            "error": "Batch response did not return the one requested OID",
        }
    obj = objects[0]
    if "error" in obj:
        return {
            "available": False,
            "pointer": pointer_info,
            "batch_url": LFS_BATCH_URL,
            "batch": batch_record,
            "object_error": obj["error"],
        }
    action = (obj.get("actions") or {}).get("download")
    if not action or not action.get("href"):
        return {
            "available": False,
            "pointer": pointer_info,
            "batch_url": LFS_BATCH_URL,
            "batch": batch_record,
            "response": batch_json,
            "error": "No download action was returned for the requested LFS object",
        }

    download_headers = action.get("header") or {}
    try:
        download_info = stream_download(
            action["href"], destination, headers=download_headers,
            expected_bytes=OBJECT_BYTES,
        )
    except (requests.RequestException, OSError, ValueError) as exc:
        destination.unlink(missing_ok=True)
        return {
            "available": False,
            "downloaded": False,
            "pointer": pointer_info,
            "batch_url": LFS_BATCH_URL,
            "batch": batch_record,
            "download_host": urlparse(action["href"]).netloc,
            "error": f"{type(exc).__name__}: {exc}",
        }
    download_info["sha256_matches_pointer_oid"] = download_info["sha256"] == OID
    return {
        "available": True,
        "downloaded": True,
        "pointer": pointer_info,
        "batch_url": LFS_BATCH_URL,
        "batch": batch_record,
        "download": download_info,
    }


def download_iso(path: Path) -> tuple[str, dict]:
    errors = []
    for url in ISO_URLS:
        try:
            info = stream_download(url, path, expected_bytes=ISO_BYTES)
            expected = {
                "md5": ISO_MD5,
                "sha1": ISO_SHA1,
                "sha256": ISO_SHA256,
            }
            # The stream helper already computes SHA256. Recompute MD5/SHA1
            # in one bounded pass after verifying the size.
            full = digest_file(path, ("md5", "sha1", "sha256"))
            if full != {"bytes": ISO_BYTES, **expected}:
                raise ValueError(f"ISO digest mismatch: {full!r}")
            return url, full
        except (requests.RequestException, OSError, ValueError) as exc:
            errors.append(f"{url}: {type(exc).__name__}: {exc}")
    raise RuntimeError("No verified original ISO source: " + "; ".join(errors))


def extract_iso_member(iso_path: Path, output_path: Path) -> dict:
    iso = pycdlib.PyCdlib()
    try:
        iso.open(str(iso_path))
        extents = [
            {"offset": int(offset), "bytes": int(length)}
            for offset, length in iso.get_file_byte_extents(iso_path=ISO_MEMBER)
        ]
        if not extents:
            raise ValueError(f"ISO member not found: {ISO_MEMBER}")
        iso.get_file_from_iso(local_path=str(output_path), iso_path=ISO_MEMBER)
    finally:
        iso.close()
    info = digest_file(output_path)
    if info["bytes"] != OBJECT_BYTES:
        raise ValueError(
            f"ISO member byte count mismatch: {info['bytes']} != {OBJECT_BYTES}"
        )
    info["extents"] = extents
    info["path"] = ISO_MEMBER
    return info


def files_equal(left: Path, right: Path) -> bool:
    if left.stat().st_size != right.stat().st_size:
        return False
    with left.open("rb") as a, right.open("rb") as b:
        while True:
            x = a.read(CHUNK)
            y = b.read(CHUNK)
            if x != y:
                return False
            if not x:
                return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--lfs-out", type=Path, required=True)
    parser.add_argument("--iso", type=Path, required=True)
    parser.add_argument("--iso-member-out", type=Path, required=True)
    args = parser.parse_args()

    result = {
        "scope": "One pinned Git LFS OID and one exact ISO member only; no filename/digest-family sweep.",
        "repository": {
            "name": f"{OWNER}/{REPO}",
            "commit": COMMIT,
            "pointer_path": POINTER_PATH,
            "readme_url": f"https://github.com/{OWNER}/{REPO}/blob/{COMMIT}/README.md",
            "provenance_assessment": (
                "The pinned nested README says this is a reorganization of Uncovering Cicada "
                "Wiki materials and credits the solver community. It is a community archive, "
                "not a Cicada-signed or first-party custody statement."
            ),
        },
        "expected_lfs_object": {"oid_sha256": OID, "bytes": OBJECT_BYTES},
    }

    lfs = fetch_lfs_object(args.lfs_out)
    result["lfs"] = lfs

    iso_url, iso_digest = download_iso(args.iso)
    result["iso"] = {"url": iso_url, **iso_digest}
    member = extract_iso_member(args.iso, args.iso_member_out)
    result["iso_member"] = member

    result["iso_member_sha256_matches_pointer_oid"] = member["sha256"] == OID
    if lfs.get("downloaded"):
        result["lfs_object_byte_identical_to_iso_member"] = files_equal(
            args.lfs_out, args.iso_member_out
        )
    else:
        result["lfs_object_byte_identical_to_iso_member"] = None

    if (
        lfs.get("downloaded")
        and lfs["download"].get("sha256_matches_pointer_oid")
        and result["lfs_object_byte_identical_to_iso_member"]
        and result["iso_member_sha256_matches_pointer_oid"]
    ):
        result["classification"] = (
            "exact LFS object recovered and byte-identical to the verified ISO member; "
            "this is a public community-archive copy, not first-party authorship evidence"
        )
    elif lfs.get("downloaded"):
        result["classification"] = (
            "LFS object was retrieved but did not establish byte identity with the ISO member"
        )
    else:
        result["classification"] = (
            "the pinned LFS pointer was verified, but its object was not recoverable "
            "through this exact public Git LFS batch endpoint"
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
