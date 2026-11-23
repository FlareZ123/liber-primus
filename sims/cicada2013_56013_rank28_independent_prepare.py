#!/usr/bin/env python3
"""Independent ISO9660 extraction and source-input preparation for the C++ rank28 scan."""
from __future__ import annotations

import hashlib
import json
import math
import re
import struct
import sys
from pathlib import Path

SECTOR = 2048
ISO_BYTES = 136_398_848
ISO_SHA256 = "784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f"
MEMBER_BYTES = 118_818_811
MEMBER_SHA256 = "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def parse_record(buf: bytes, pos: int) -> dict | None:
    n = buf[pos]
    if n == 0:
        return None
    rec = buf[pos:pos + n]
    if len(rec) != n or n < 34:
        raise ValueError(f"malformed ISO directory record at {pos}")
    extent_le = int.from_bytes(rec[2:6], "little")
    extent_be = int.from_bytes(rec[6:10], "big")
    length_le = int.from_bytes(rec[10:14], "little")
    length_be = int.from_bytes(rec[14:18], "big")
    if extent_le != extent_be or length_le != length_be:
        raise ValueError("ISO both-endian extent/length mismatch")
    name_len = rec[32]
    name = rec[33:33 + name_len]
    if len(name) != name_len:
        raise ValueError("short ISO identifier")
    return {
        "record_bytes": n,
        "extent_lba": extent_le,
        "length": length_le,
        "flags": rec[25],
        "name": name,
    }


def directory_records(iso: bytes, entry: dict):
    start = entry["extent_lba"] * SECTOR
    end = start + entry["length"]
    if start < 0 or end > len(iso):
        raise ValueError("ISO directory extent outside image")
    pos = start
    while pos < end:
        n = iso[pos]
        if n == 0:
            pos = ((pos // SECTOR) + 1) * SECTOR
            continue
        record = parse_record(iso, pos)
        if record is None:
            raise AssertionError("nonzero record became null")
        yield record
        pos += record["record_bytes"]


def extract_56013(iso: bytes) -> tuple[bytes, list[dict]]:
    pvd = 16 * SECTOR
    if iso[pvd] != 1 or iso[pvd + 1:pvd + 6] != b"CD001" or iso[pvd + 6] != 1:
        raise ValueError("primary ISO9660 volume descriptor not found")
    root = parse_record(iso, pvd + 156)
    if root is None or not (root["flags"] & 0x02):
        raise ValueError("invalid ISO9660 root directory record")
    data_dirs = [
        e for e in directory_records(iso, root)
        if e["name"].rstrip(b";1").upper() == b"DATA" and (e["flags"] & 0x02)
    ]
    if len(data_dirs) != 1:
        raise ValueError(f"expected one DATA directory, found {len(data_dirs)}")
    data_dir = data_dirs[0]
    files = [
        e for e in directory_records(iso, data_dir)
        if e["name"].split(b";", 1)[0].upper() == b"560.13" and not (e["flags"] & 0x02)
    ]
    if not files:
        raise ValueError("DATA/560.13;1 not found in ISO9660 directory")
    extents = []
    parts = []
    for e in files:
        start = e["extent_lba"] * SECTOR
        end = start + e["length"]
        if start < 0 or end > len(iso):
            raise ValueError("560.13 extent outside ISO image")
        parts.append(iso[start:end])
        extents.append({"offset": start, "bytes": e["length"], "lba": e["extent_lba"]})
    member = b"".join(parts)
    if len(member) != MEMBER_BYTES or sha256(member) != MEMBER_SHA256:
        raise ValueError(
            f"member mismatch: bytes={len(member)} sha256={sha256(member)}"
        )
    return member, extents


def gp_text(text: str, tokens: list[str]) -> list[int]:
    text = text.upper().replace("QU", "CW")
    text = text.replace("V", "U").replace("K", "C").replace("Q", "C").replace("Z", "S")
    choices = sorted(enumerate(tokens), key=lambda pair: -len(pair[1]))
    out: list[int] = []
    for word in re.findall(r"[A-Z]+", text):
        at = 0
        while at < len(word):
            if word.startswith("ING", at):
                out.append(21)
                at += 3
                continue
            if word.startswith("IO", at):
                out.append(27)
                at += 2
                continue
            found = next(((idx, token) for idx, token in choices if word.startswith(token, at)), None)
            if found is None:
                raise ValueError(f"unmapped GP spelling: {word[at:]} in {word}")
            out.append(found[0])
            at += len(found[1])
    return out


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: prepare.py ORIGINAL.iso OUTDIR")
    iso_path = Path(sys.argv[1])
    outdir = Path(sys.argv[2])
    outdir.mkdir(parents=True, exist_ok=True)

    iso = iso_path.read_bytes()
    if len(iso) != ISO_BYTES or sha256(iso) != ISO_SHA256:
        raise ValueError("original 2013 ISO size/SHA-256 mismatch")
    member, extents = extract_56013(iso)
    (outdir / "tape.bin").write_bytes(member)

    root = Path(__file__).resolve().parents[1]
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    cipher = [
        rune for page in corpus["pages"] if page["page"] in (0, 1, 2)
        for rune in page["indices"]
    ]
    if len(cipher) != 729 or any(not 0 <= x < 29 for x in cipher):
        raise ValueError(f"original p0-p2 GP29 receiver length/value mismatch: {len(cipher)}")
    (outdir / "cipher.bin").write_bytes(bytes(cipher))

    gibran = (root / "resources/control/gibran_prophet_58585.txt").read_text(encoding="utf-8")
    language = gp_text(gibran, corpus["translit"])
    counts = [0] * 29
    for x in language:
        counts[x] += 1
    total = sum(counts) + 29 * 0.5
    weights = [round(12 * math.log(((n + 0.5) / total) * 29)) for n in counts]
    if len(weights) != 29:
        raise AssertionError("wrong weight vector length")
    (outdir / "weights.bin").write_bytes(struct.pack("<29h", *weights))

    lp1_text = (root / "resources/transcriptions/lp1_wulfic_canonical.txt").read_text(encoding="utf-8")
    begin = lp1_text.index("ᚦᛖ-ᛚᚩᛋᛋ")
    end = lp1_text.index("\n$\n%\n", begin)
    rune_index = {rune: i for i, rune in enumerate(corpus["runes"])}
    lp1 = [rune_index[ch] for ch in lp1_text[begin:end] if ch in rune_index]
    if len(lp1) != 755:
        raise ValueError(f"authentic solved LP1 p10-p13 rune count mismatch: {len(lp1)}")
    (outdir / "lp1.bin").write_bytes(bytes(lp1[:729]))

    metadata = {
        "iso": {"bytes": len(iso), "sha256": sha256(iso)},
        "member": {
            "path": "/DATA/560.13;1",
            "bytes": len(member),
            "sha256": sha256(member),
            "extents": extents,
        },
        "receiver": {"pages": [0, 1, 2], "gp29_runes": len(cipher)},
        "language_model": {
            "source": "resources/control/gibran_prophet_58585.txt",
            "gp29_runes": len(language),
            "counts": counts,
            "weights": weights,
            "rounding": "Python round-to-nearest, ties-to-even; matches numpy.rint",
        },
        "positive_control": {
            "source": "resources/transcriptions/lp1_wulfic_canonical.txt",
            "original_solved_lp1_runes": len(lp1),
            "planted_runes": 729,
        },
        "tokens": corpus["translit"],
    }
    (outdir / "metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metadata, ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
