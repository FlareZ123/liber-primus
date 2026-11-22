#!/usr/bin/env python3
"""Analyze AC-coefficient LSB streams emitted by jpeg_ac_lsb_screen.c."""
import glob
import json
import math
import os
import sys

root = sys.argv[1] if len(sys.argv) > 1 else "/tmp/lp2-jpeg-ac"
magic = {
    "ZIP": b"PK\x03\x04", "PDF": b"%PDF", "PNG": b"\x89PNG\r\n\x1a\n",
    "JPEG_JFIF": b"\xff\xd8\xff\xe0", "JPEG_EXIF": b"\xff\xd8\xff\xe1",
    "JPEG_DQT": b"\xff\xd8\xff\xdb", "JPEG_SOF0": b"\xff\xd8\xff\xc0",
    "JPEG_SOF2": b"\xff\xd8\xff\xc2", "JPEG_DHT": b"\xff\xd8\xff\xc4",
    "JPEG_SOS": b"\xff\xd8\xff\xda", "GIF": b"GIF8", "BZIP": b"BZh",
    "PGP": b"-----BEGIN", "HTTP": b"http", "Cicada": b"Cicada",
    "3301": b"3301", "ELF": b"\x7fELF", "SQLite": b"SQLite format 3"
}
bit_reverse = bytes(int(f"{i:08b}"[::-1], 2) for i in range(256))
sof_markers = {0xC0,0xC1,0xC2,0xC3,0xC5,0xC6,0xC7,0xC9,0xCA,0xCB,0xCD,0xCE,0xCF}

def valid_jpeg(data, start):
    if data[start:start+2] != b"\xff\xd8":
        return False
    pos = start + 2
    saw_sof = False
    saw_sos = False
    while pos < len(data):
        if data[pos] != 0xFF:
            return False
        while pos < len(data) and data[pos] == 0xFF:
            pos += 1
        if pos >= len(data):
            return False
        marker = data[pos]
        pos += 1
        if marker == 0xD9:
            return saw_sof and saw_sos
        if marker == 0x01 or 0xD0 <= marker <= 0xD7:
            continue
        if pos + 2 > len(data):
            return False
        length = int.from_bytes(data[pos:pos+2], "big")
        if length < 2 or pos + length > len(data):
            return False
        if marker in sof_markers:
            saw_sof = True
        if marker == 0xDA:
            saw_sos = True
            pos += length
            while pos < len(data):
                if data[pos] != 0xFF:
                    pos += 1
                    continue
                q = pos + 1
                while q < len(data) and data[q] == 0xFF:
                    q += 1
                if q >= len(data):
                    return False
                code = data[q]
                if code == 0x00 or 0xD0 <= code <= 0xD7:
                    pos = q + 1
                    continue
                break
        else:
            pos += length
    return False

rows = []
header_candidates = []
magic_hits = []
three_byte_jpeg_prefixes = []
valid_jpeg_candidates = []
stream_count = 0
for jp in sorted(glob.glob(os.path.join(root, "*.json"))):
    stem = os.path.basename(jp).split(".")[0]
    if not stem.isdigit():
        continue
    page = int(stem)
    if not 17 <= page <= 74:
        continue
    with open(jp, "r", encoding="utf-8") as handle:
        stats = json.load(handle)
    ratio = stats["odd_gt1"] / stats["total_abs_gt1"] if stats["total_abs_gt1"] else 0.0
    rows.append((page, stats["total_abs_gt1"], ratio))
    prefix = os.path.join(root, f"{page:02d}")
    for suffix in ["all_gt1", "all_nz", "c0_gt1", "c0_nz", "c1_gt1", "c1_nz", "c2_gt1", "c2_nz"]:
        path = prefix + f"_{suffix}.bin"
        if not os.path.exists(path):
            continue
        stream_count += 1
        with open(path, "rb") as handle:
            raw = handle.read()
        for bitorder, data in [("msb", raw), ("lsb", raw.translate(bit_reverse))]:
            if len(data) >= 4:
                for endian in ("big", "little"):
                    length = int.from_bytes(data[:4], endian)
                    if 0 < length <= len(data) - 4:
                        header_candidates.append((page, suffix, bitorder, endian, length, len(data)))
            for name, signature in magic.items():
                pos = data.find(signature)
                if pos >= 0:
                    magic_hits.append((page, suffix, bitorder, name, pos))
            pos = 0
            while True:
                pos = data.find(b"\xff\xd8\xff", pos)
                if pos < 0:
                    break
                three_byte_jpeg_prefixes.append((page, suffix, bitorder, pos,
                                                  data[pos+3] if pos+3 < len(data) else None))
                if valid_jpeg(data, pos):
                    valid_jpeg_candidates.append((page, suffix, bitorder, pos))
                pos += 1

ratios = [row[2] for row in rows]
mean = sum(ratios) / len(ratios)
std = math.sqrt(sum((value - mean) ** 2 for value in ratios) / len(ratios))
print(json.dumps({
    "pages": len(rows),
    "streams_checked": stream_count,
    "eligible_abs_gt1_coefficients": sum(row[1] for row in rows),
    "per_page_odd_parity_ratio_mean": mean,
    "per_page_odd_parity_ratio_population_sd": std,
    "per_page_odd_parity_ratio_min": min(ratios),
    "per_page_odd_parity_ratio_max": max(ratios),
    "plausible_32bit_length_headers": header_candidates,
    "common_4plus_byte_magic_hits": magic_hits,
    "three_byte_jpeg_prefixes_in_sensitivity_streams": three_byte_jpeg_prefixes,
    "valid_jpeg_candidates": valid_jpeg_candidates,
    "pages": rows
}, indent=2))
