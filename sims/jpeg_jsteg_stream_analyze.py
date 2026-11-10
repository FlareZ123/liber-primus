#!/usr/bin/env python3
"""Analyze sequential JSteg-style coefficient-LSB extraction streams.

Standard-library only. Input files are named PAGE_component.bin and
PAGE_mcu.bin, as produced by jpeg_jsteg_coeff_scan.c.
"""
import argparse
import collections
import csv
import hashlib
import json
import math
import pathlib

MAGIC = {
    "ZIP": b"PK\x03\x04", "PNG": b"\x89PNG\r\n\x1a\n", "PDF": b"%PDF",
    "GIF87": b"GIF87a", "GIF89": b"GIF89a", "GZIP": b"\x1f\x8b\x08",
    "BZ2": b"BZh", "XZ": b"\xfd7zXZ\x00", "7Z": b"7z\xbc\xaf\x27\x1c",
    "RAR": b"Rar!\x1a\x07", "SQLite": b"SQLite format 3\x00",
    "PGP": b"-----BEGIN PGP", "JFIF": b"JFIF", "JPEG": b"\xff\xd8\xff",
    "ELF": b"\x7fELF", "RIFF": b"RIFF", "CICADA": b"CICADA",
    "LIBER": b"LIBER",
}

def entropy(data):
    if not data:
        return 0.0
    counts = collections.Counter(data)
    n = len(data)
    return -sum((c / n) * math.log2(c / n) for c in counts.values())

def printable_stats(data):
    if not data:
        return 0.0, 0.0, 0
    printable = ascii7 = best = run = 0
    for b in data:
        if b < 128:
            ascii7 += 1
        if 32 <= b < 127:
            printable += 1
            run += 1
            best = max(best, run)
        else:
            run = 0
    n = len(data)
    return printable / n, ascii7 / n, best

def shifted_bytes(data, shift):
    if shift == 0 or len(data) < 2:
        return data
    out = bytearray(len(data) - 1)
    for i in range(len(out)):
        out[i] = ((data[i] << shift) & 0xff) | (data[i + 1] >> (8 - shift))
    return bytes(out)

def lcp(a, b):
    n = min(len(a), len(b))
    i = 0
    while i < n and a[i] == b[i]:
        i += 1
    return i

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input_dir", type=pathlib.Path)
    ap.add_argument("--csv", type=pathlib.Path)
    args = ap.parse_args()
    files = sorted(args.input_dir.glob("*_*.bin"))
    rows = []
    streams = {"component": {}, "mcu": {}}
    for path in files:
        page_s, order = path.stem.split("_", 1)
        if order not in streams:
            continue
        page = int(page_s)
        data = path.read_bytes()
        p, a7, maxrun = printable_stats(data)
        hits = [name for name, sig in MAGIC.items() if sig in data]
        rows.append({
            "page": page, "order": order, "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "entropy_bits_per_byte": round(entropy(data), 9),
            "printable_ascii_fraction": round(p, 9),
            "ascii7_fraction": round(a7, 9),
            "max_printable_run": maxrun,
            "magic_signatures": ";".join(hits),
            "prefix32_hex": data[:32].hex(),
        })
        streams[order][page] = data
    if args.csv:
        args.csv.parent.mkdir(parents=True, exist_ok=True)
        with args.csv.open("w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0]) if rows else [])
            w.writeheader()
            w.writerows(rows)
    summary = {}
    for order, by_page in streams.items():
        if not by_page:
            continue
        pages = sorted(by_page)
        combined = b"".join(by_page[p] for p in pages)
        magic_hits = []
        for shift in range(8):
            data = shifted_bytes(combined, shift)
            for name, sig in MAGIC.items():
                pos = data.find(sig)
                if pos >= 0:
                    magic_hits.append({"signature": name, "bit_shift": shift, "byte_offset": pos})
        prefix_pairs = []
        for i, p in enumerate(pages):
            for q in pages[i + 1:]:
                n = lcp(by_page[p], by_page[q])
                if n >= 32:
                    prefix_pairs.append({"page_a": p, "page_b": q, "common_prefix_bytes": n})
        prefix_pairs.sort(key=lambda x: x["common_prefix_bytes"], reverse=True)
        metrics = [r for r in rows if r["order"] == order]
        summary[order] = {
            "pages": len(pages),
            "total_extracted_bytes": len(combined),
            "mean_page_entropy_bits_per_byte": round(sum(r["entropy_bits_per_byte"] for r in metrics) / len(metrics), 9),
            "min_page_entropy_bits_per_byte": min(r["entropy_bits_per_byte"] for r in metrics),
            "max_page_entropy_bits_per_byte": max(r["entropy_bits_per_byte"] for r in metrics),
            "mean_printable_ascii_fraction": round(sum(r["printable_ascii_fraction"] for r in metrics) / len(metrics), 9),
            "max_page_printable_run": max(r["max_printable_run"] for r in metrics),
            "magic_signature_hits_at_any_bit_alignment": magic_hits,
            "longest_shared_page_prefixes_ge_32_bytes": prefix_pairs[:20],
        }
    print(json.dumps(summary, indent=2, sort_keys=True))

if __name__ == "__main__":
    main()
