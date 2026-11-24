#!/usr/bin/env python3
"""Find and validate JPEG streams embedded in a recovered binary/JPEG.

Searches SOI/EOI markers, validates each candidate with Pillow, and compares
its perceptual hashes to the repository's original LP image corpus. It does
not assume that every marker pair is a genuine embedded image.
"""
from __future__ import annotations

import hashlib
import io
import json
import pathlib
import sys

from PIL import Image
import imagehash


def all_offsets(data: bytes, needle: bytes) -> list[int]:
    offsets = []
    start = 0
    while True:
        i = data.find(needle, start)
        if i < 0:
            return offsets
        offsets.append(i)
        start = i + 1


def nearest_pages(im: Image.Image, corpus_dir: pathlib.Path) -> list[dict]:
    target = im.convert("RGB")
    th = imagehash.phash(target)
    td = imagehash.dhash(target)
    rows = []
    for path in sorted(corpus_dir.glob("*.jpg")):
        try:
            candidate = Image.open(path).convert("RGB")
            rows.append({
                "path": str(path),
                "phash": int(th - imagehash.phash(candidate)),
                "dhash": int(td - imagehash.dhash(candidate)),
                "size": list(candidate.size),
            })
        except Exception:
            continue
    rows.sort(key=lambda x: (x["phash"], x["dhash"]))
    return rows[:5]


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit("usage: jpeg_embedded_image_scan.py input.bin output-dir")
    source = pathlib.Path(sys.argv[1])
    outdir = pathlib.Path(sys.argv[2])
    corpus = pathlib.Path("resources/liber-primus")
    outdir.mkdir(parents=True, exist_ok=True)
    data = source.read_bytes()
    starts = all_offsets(data, bytes.fromhex("ffd8ff"))
    ends = all_offsets(data, bytes.fromhex("ffd9"))
    records = []
    for n, offset in enumerate(starts):
        rec = {"index": n, "offset": offset, "remaining_bytes": len(data) - offset}
        next_start = starts[n + 1] if n + 1 < len(starts) else len(data)
        rec["next_soi_offset"] = next_start
        possible_ends = [e + 2 for e in ends if offset < e < next_start]
        rec["eoi_offsets_before_next_soi"] = [x - 2 for x in possible_ends]
        try:
            stream = io.BytesIO(data[offset:])
            im = Image.open(stream)
            im.load()
            rec.update({
                "valid_image": True,
                "format": im.format,
                "dimensions": list(im.size),
                "mode": im.mode,
                "stream_position_after_load": stream.tell(),
                "sha256_segment_to_first_eoi": None,
            })
            if possible_ends:
                end = possible_ends[0]
                segment = data[offset:end]
                rec["segment_bytes"] = len(segment)
                rec["sha256_segment_to_first_eoi"] = hashlib.sha256(segment).hexdigest()
                segment_path = outdir / f"jpeg-{n}-offset-{offset}.jpg"
                segment_path.write_bytes(segment)
            else:
                segment_path = outdir / f"jpeg-{n}-offset-{offset}-reencoded.jpg"
                im.save(segment_path, format="JPEG", quality=90)
                rec["segment_bytes"] = segment_path.stat().st_size
            rec["nearest_lp_pages"] = nearest_pages(im, corpus)
            thumb = im.copy()
            thumb.thumbnail((600, 900))
            thumb.save(outdir / f"preview-{n}.jpg", format="JPEG", quality=65)
            rec["saved_segment"] = str(segment_path)
        except Exception as exc:
            rec.update({
                "valid_image": False,
                "error_type": type(exc).__name__,
                "error": str(exc)[:300],
            })
        records.append(rec)
    result = {
        "source": str(source),
        "source_bytes": len(data),
        "source_sha256": hashlib.sha256(data).hexdigest(),
        "soi_offsets": starts,
        "eoi_offsets": ends,
        "candidate_count": len(records),
        "candidates": records,
        "warning": "SOI/EOI byte patterns alone are not proof of embedded images; require successful independent decode and inspect whether the stream is inside metadata or after the primary EOI.",
    }
    (outdir / "jpeg-embedded-scan.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
