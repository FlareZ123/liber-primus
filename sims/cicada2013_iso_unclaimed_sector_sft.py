"""Original 2013 CicadaOS ISO sector-custody audit, with a hidden-record plant.

This read-only source experiment differentiates filesystem content from unclaimed
physical sectors; unclaimed data is a candidate only, never a decoded LP2 key.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import os
from pathlib import Path
import re
import tempfile
from collections import Counter, deque

from filelock import FileLock
import pycdlib
import requests

SECTOR = 2048
EXPECTED_BYTES = 136398848
EXPECTED_MD5 = "74062dee4093c6ca0340cda23f0e994b"
EXPECTED_SHA1 = "df433cba87644b35cbc47f702a02e2b58d90af6a"
URLS = (
    "https://connortumbleson.com/uploads/2024/01/3301.iso",
    "https://archive.org/download/3301.iso/3301.iso",
)
MAGIC = {
    "PNG": b"\x89PNG\r\n\x1a\n",
    "JPEG": b"\xff\xd8\xff",
    "GIF89": b"GIF89a",
    "ZIP": b"PK\x03\x04",
    "GZIP": b"\x1f\x8b\x08",
    "7ZIP": b"7z\xbc\xaf\x27\x1c",
    "PDF": b"%PDF-",
    "ELF": b"\x7fELF",
    "PGP_ASCII": b"-----BEGIN PGP ",
    "PGP_BINARY_TAG11": b"\xcb",
}


def verified_iso(path: Path) -> dict[str, str | int]:
    size = path.stat().st_size
    assert size == EXPECTED_BYTES, f"Noncanonical ISO byte length: {size}"
    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    with path.open("rb") as source:
        while buf := source.read(1 << 20):
            md5.update(buf)
            sha1.update(buf)
    assert md5.hexdigest() == EXPECTED_MD5, "Noncanonical ISO MD5"
    assert sha1.hexdigest() == EXPECTED_SHA1, "Noncanonical ISO SHA1"
    return {"bytes": size, "md5": md5.hexdigest(), "sha1": sha1.hexdigest()}


EXPECTED_INITRAMFS_GIT_BLOB_SHA1 = "d4dba9a6d3c0d6ed751d71cdc484e4b7efe1ee0a"
EXPECTED_INITRAMFS_BYTES = 5494774
INITRAMFS_REFERENCE = (
    "neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3:"
    "2013/002-3301/3301-contents/boot/3301.img"
)


def initramfs_member(path: Path) -> dict[str, str | int | bool]:
    """Bind the exact ISO's boot initramfs to the previously inventoried Git object."""
    iso = pycdlib.PyCdlib()
    iso.open(str(path))
    try:
        output = io.BytesIO()
        iso.get_file_from_iso_fp(output, iso_path="/BOOT/3301.IMG;1")
        data = output.getvalue()
    finally:
        iso.close()
    git_blob_sha1 = hashlib.sha1(
        b"blob " + str(len(data)).encode("ascii") + b"\\0" + data
    ).hexdigest()
    result = {
        "iso_path": "/BOOT/3301.IMG;1",
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "git_blob_sha1": git_blob_sha1,
        "expected_git_blob_sha1": EXPECTED_INITRAMFS_GIT_BLOB_SHA1,
        "matches_pinned_original_derived_source": (
            git_blob_sha1 == EXPECTED_INITRAMFS_GIT_BLOB_SHA1
        ),
        "reference": INITRAMFS_REFERENCE,
    }
    assert len(data) == EXPECTED_INITRAMFS_BYTES, (
        f"Unexpected ISO initramfs length: {len(data)}"
    )
    assert result["matches_pinned_original_derived_source"], (
        "The ISO's BOOT/3301.IMG;1 does not match the pinned original-derived Git blob"
    )
    return result


def download(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        if path.exists() and path.stat().st_size == EXPECTED_BYTES:
            verified_iso(path)
            return
        errors = []
        for url in URLS:
            with tempfile.NamedTemporaryFile(
                prefix="cicada2013-", suffix=".iso", dir=path.parent, delete=False
            ) as tmp:
                temp_path = Path(tmp.name)
                try:
                    with requests.get(url, stream=True, timeout=(30, 300)) as response:
                        response.raise_for_status()
                        for block in response.iter_content(chunk_size=1 << 20):
                            if block:
                                tmp.write(block)
                    tmp.flush()
                    os.fsync(tmp.fileno())
                    transfer_error = None
                except (requests.RequestException, OSError) as exc:
                    transfer_error = str(exc)
            # The handle must close before replace/unlink on Windows.
            try:
                if transfer_error:
                    errors.append(f"{url}: {transfer_error}")
                    continue
                verified_iso(temp_path)
                os.replace(temp_path, path)
                print("SOURCE_URL", url)
                return
            except (OSError, AssertionError) as exc:
                errors.append(f"{url}: {exc}")
            finally:
                temp_path.unlink(missing_ok=True)
        raise RuntimeError("No verified source ISO: " + "; ".join(errors))


def mark(mask: bytearray, start: int, length: int) -> None:
    if length <= 0:
        return
    start_sector = start // SECTOR
    last_sector = (start + length + SECTOR - 1) // SECTOR
    assert 0 <= start_sector <= last_sector <= len(mask), (
        start, length, len(mask)
    )
    mask[start_sector:last_sector] = b"\x01" * (last_sector - start_sector)


def filesystem_extents(source: Path) -> tuple[bytearray, list[dict], list[dict]]:
    mask = bytearray(source.stat().st_size // SECTOR)
    mark(mask, 0, 16 * SECTOR)  # ISO system area, including boot system space
    metadata = []
    with source.open("rb") as fp:
        for number in range(16, 48):
            fp.seek(number * SECTOR)
            d = fp.read(SECTOR)
            if d[1:6] != b"CD001":
                break
            mark(mask, number * SECTOR, SECTOR)
            metadata.append({
                "descriptor_sector": number,
                "type": d[0],
                "standard": d[7:39].decode("ascii", "replace").strip(),
            })
            if d[0] in (1, 2):
                pt_length = int.from_bytes(d[132:136], "little")
                for loc in (
                    int.from_bytes(d[140:144], "little"),
                    int.from_bytes(d[144:148], "little"),
                    int.from_bytes(d[148:152], "big"),
                    int.from_bytes(d[152:156], "big"),
                ):
                    if loc:
                        mark(mask, loc * SECTOR, pt_length)
                        metadata.append({"path_table": loc, "bytes": pt_length})
            if d[0] == 0 and b"EL TORITO" in d[7:39]:
                catalogue = int.from_bytes(d[71:75], "little")
                if catalogue:
                    mark(mask, catalogue * SECTOR, SECTOR)
                    metadata.append({"eltorito_catalog_sector": catalogue})
            if d[0] == 255:
                break
    iso = pycdlib.PyCdlib()
    iso.open(str(source))
    entries = []
    seen = set()
    dirs = deque(["/"])
    while dirs:
        parent = dirs.popleft()
        if parent in seen:
            continue
        seen.add(parent)
        record = iso.get_record(iso_path=parent)
        assert record.is_dir()
        mark(mask, int(record.orig_extent_loc) * SECTOR, int(record.data_length))
        for rec in iso.list_children(iso_path=parent):
            if rec.is_dot() or rec.is_dotdot():
                continue
            name = iso.full_path_from_dirrecord(rec)
            fullpath = name.decode("utf-8", "replace") if isinstance(name, bytes) else name
            if rec.is_dir():
                dirs.append(fullpath)
                mark(mask, int(rec.orig_extent_loc) * SECTOR, int(rec.data_length))
                entries.append({"path": fullpath, "type": "dir",
                                "start_sector": int(rec.orig_extent_loc),
                                "bytes": int(rec.data_length)})
            else:
                ranges = [(int(a), int(b)) for a, b in
                          iso.get_file_byte_extents(iso_path=fullpath)]
                for off, size in ranges:
                    mark(mask, off, size)
                entries.append({"path": fullpath, "type": "file",
                                "bytes": sum(b for _, b in ranges),
                                "extents": ranges})
    iso.close()
    assert any(v["type"] == "file" for v in entries)
    return mask, entries, metadata


def interesting_stream(chunk: bytes, offset: int) -> dict:
    hist = Counter(chunk)
    entropy = -sum((n / len(chunk)) * math.log2(n / len(chunk))
                   for n in hist.values()) if chunk else 0
    markers = []
    for label, signature in MAGIC.items():
        if label == "PGP_BINARY_TAG11":
            continue  # 0xCB alone is not a valid complete PGP packet
        cursor = 0
        while len(markers) < 30:
            at = chunk.find(signature, cursor)
            if at < 0:
                break
            markers.append({"kind": label, "absolute_byte": offset + at})
            cursor = at + 1
    strings = [
        {"absolute_byte": offset + match.start(),
         "first_100": match.group(0)[:100].decode("ascii")}
        for match in re.finditer(rb"[ -~]{24,}", chunk)
    ][:12]
    return {
        "bytes": len(chunk),
        "nonzero": len(chunk) - chunk.count(0),
        "non_ff": len(chunk) - chunk.count(255),
        "entropy_bits_per_byte": round(entropy, 6),
        "markers": sorted(markers, key=lambda x: x["absolute_byte"]),
        "printable_runs": strings,
        "sha256": hashlib.sha256(chunk).hexdigest(),
    }


def original_gaps(raw: bytes, mask: bytearray) -> list[dict]:
    assert len(raw) == len(mask) * SECTOR
    results = []
    i = 0
    while i < len(mask):
        if mask[i]:
            i += 1
            continue
        j = i + 1
        while j < len(mask) and not mask[j]:
            j += 1
        chunk = raw[i * SECTOR:j * SECTOR]
        report = interesting_stream(chunk, i * SECTOR)
        results.append({"sector_start": i, "sector_end": j, **report})
        i = j
    return results


def original_file_slack(raw: bytes, entries: list[dict]) -> list[dict]:
    """Read every byte beyond an on-disk file length within its final ISO sector."""
    results = []
    for entry in entries:
        if entry["type"] != "file":
            continue
        for offset, length in entry["extents"]:
            if not length:
                continue
            end = offset + length
            padded_end = ((end + SECTOR - 1) // SECTOR) * SECTOR
            assert padded_end <= len(raw)
            if padded_end == end:
                continue
            chunk = raw[end:padded_end]
            results.append({
                "path": entry["path"],
                "absolute_start": end,
                "absolute_end": padded_end,
                **interesting_stream(chunk, end),
            })
    return results


def plant_positive() -> None:
    source = bytearray(4 * SECTOR)
    sig = b"-----BEGIN PGP MESSAGE-----\n"
    source[SECTOR + 43:SECTOR + 43 + len(sig)] = sig
    mask = bytearray(b"\x01\x00\x01\x01")
    gaps = original_gaps(bytes(source), mask)
    assert len(gaps) == 1 and gaps[0]["sector_start"] == 1
    assert any(m["kind"] == "PGP_ASCII" and m["absolute_byte"] == SECTOR + 43
               for m in gaps[0]["markers"])
    fake = [{"path": "/SLACK.DAT;1", "type": "file", "extents": [(0, SECTOR + 40)]}]
    slack = original_file_slack(bytes(source), fake)
    assert len(slack) == 1
    assert any(m["kind"] == "PGP_ASCII" and m["absolute_byte"] == SECTOR + 43
               for m in slack[0]["markers"])
    print("POSITIVE_CONTROL", "hidden PGP header at byte", SECTOR + 43)


def atomic_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", newline="\n",
            dir=path.parent, prefix=path.stem + "-", suffix=".tmp", delete=False
        ) as f:
            tmp_path = Path(f.name)
            json.dump(value, f, indent=2)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp_path, path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--iso", type=Path, default=Path("3301-2013.iso"))
    parser.add_argument("--report", type=Path, default=Path("cicada2013-iso-sector-audit.json"))
    args = parser.parse_args()
    plant_positive()
    download(args.iso)
    digest = verified_iso(args.iso)
    mask, entries, metadata = filesystem_extents(args.iso)
    with args.iso.open("rb") as handle:
        raw = handle.read()
    gaps = original_gaps(raw, mask)
    file_slack = original_file_slack(raw, entries)
    nonzero_gaps = [g for g in gaps if g["nonzero"]]
    result = {
        "source": digest,
        "initramfs_member": initramfs_member(args.iso),
        "sector_bytes": SECTOR,
        "total_sectors": len(mask),
        "claimed_sectors": sum(mask),
        "unclaimed_sectors": len(mask) - sum(mask),
        "file_count": sum(e["type"] == "file" for e in entries),
        "entries": entries,
        "volume_metadata": metadata,
        "unclaimed_runs": gaps,
        "file_slack": file_slack,
        "file_slack_bytes": sum(s["bytes"] for s in file_slack),
        "nonzero_file_slack_bytes": sum(s["nonzero"] for s in file_slack),
        "nonzero_unclaimed_runs": len(nonzero_gaps),
        "unclaimed_magic": [m for g in gaps for m in g["markers"]],
    }
    atomic_json(args.report, result)
    print("SOURCE", json.dumps(digest))
    print("INITRAMFS_MEMBER", json.dumps(result["initramfs_member"]))
    print("FILES", result["file_count"], "CLAIMED_SECTORS",
          result["claimed_sectors"], "UNCLAIMED_SECTORS",
          result["unclaimed_sectors"])
    for entry in entries:
        print("ENTRY", json.dumps(entry))
    for g in nonzero_gaps:
        print("NONZERO_GAP", json.dumps(g)[:3000])
    print("UNCLAIMED_MAGIC", json.dumps(result["unclaimed_magic"]))
    print("FILE_SLACK_TOTAL", result["file_slack_bytes"],
          "NONZERO", result["nonzero_file_slack_bytes"])
    for s in file_slack:
        if s["nonzero"]:
            print("NONZERO_FILE_SLACK", json.dumps(s)[:3000])
    print("REPORT", args.report)


if __name__ == "__main__":
    main()
