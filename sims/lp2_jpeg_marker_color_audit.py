#!/usr/bin/env python3
"""Audit JPEG container structure for LP2 physical images 17.jpg..72.jpg.

Standard-library only. This checks marker/metadata and color-mode grouping;
it does not test DCT-coefficient steganography.
"""
from collections import Counter
from hashlib import sha256
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"


def parse_jpeg(data):
    if data[:2] != b"\xff\xd8":
        raise ValueError("missing SOI")
    pos = 2
    markers = []
    quant = {}
    icc_chunks = {}
    icc_count = None
    components = None
    width = height = None
    app_markers = []
    exif = comments = 0
    eoi_end = None

    while pos < len(data):
        # Outside a segment, advance through entropy-coded bytes to the next
        # non-stuffed, non-restart marker.
        if data[pos] != 0xFF:
            while pos < len(data) - 1:
                if data[pos] != 0xFF:
                    pos += 1
                    continue
                j = pos + 1
                while j < len(data) and data[j] == 0xFF:
                    j += 1
                if j >= len(data):
                    pos = len(data)
                    break
                marker_byte = data[j]
                if marker_byte == 0x00 or 0xD0 <= marker_byte <= 0xD7:
                    pos = j + 1
                    continue
                pos = j - 1
                break
            if pos >= len(data) - 1:
                break

        if data[pos] != 0xFF:
            raise ValueError("marker sync lost at byte " + str(pos))
        while pos < len(data) and data[pos] == 0xFF:
            pos += 1
        if pos >= len(data):
            break
        marker = data[pos]
        pos += 1
        markers.append(marker)

        if marker == 0xD9:
            eoi_end = pos
            break
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            continue
        if pos + 2 > len(data):
            raise ValueError("truncated segment length")
        length = int.from_bytes(data[pos:pos + 2], "big")
        if length < 2 or pos + length > len(data):
            raise ValueError("invalid segment length")
        payload = data[pos + 2:pos + length]
        pos += length

        if marker == 0xDB:  # DQT
            i = 0
            while i < len(payload):
                info = payload[i]
                i += 1
                precision = info >> 4
                table_id = info & 0x0F
                size = 64 * (precision + 1)
                raw = payload[i:i + size]
                if len(raw) != size:
                    raise ValueError("truncated quantization table")
                quant[table_id] = raw
                i += size
        elif marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7):
            if len(payload) < 6:
                raise ValueError("truncated SOF")
            height = int.from_bytes(payload[1:3], "big")
            width = int.from_bytes(payload[3:5], "big")
            components = payload[5]
        elif marker == 0xE2 and payload.startswith(b"ICC_PROFILE\x00"):
            if len(payload) < 14:
                raise ValueError("truncated ICC chunk")
            seq, count = payload[12], payload[13]
            icc_count = count
            icc_chunks[seq] = payload[14:]
        elif 0xE0 <= marker <= 0xEF:
            app_markers.append(marker)
            if marker == 0xE1 and payload.startswith(b"Exif\x00\x00"):
                exif += 1
        elif marker == 0xFE:
            comments += 1

    if eoi_end is None:
        raise ValueError("missing EOI")
    icc = b""
    if icc_chunks:
        if icc_count != len(icc_chunks) or sorted(icc_chunks) != list(range(1, icc_count + 1)):
            raise ValueError("incomplete ICC profile")
        icc = b"".join(icc_chunks[i] for i in range(1, icc_count + 1))
    return {
        "markers": markers,
        "components": components,
        "width": width,
        "height": height,
        "quant": quant,
        "icc": icc,
        "app": app_markers,
        "exif": exif,
        "comments": comments,
        "trailing": len(data) - eoi_end,
    }


def main():
    rows = []
    for page in range(56):
        filename = f"{page + 17:02d}.jpg"
        data = (IMAGE_DIR / filename).read_bytes()
        info = parse_jpeg(data)
        rows.append({
            "page": page,
            "file": filename,
            "bytes": len(data),
            "components": info["components"],
            "size": [info["width"], info["height"]],
            "quant_ids": sorted(info["quant"]),
            "luma_sha256": sha256(info["quant"][0]).hexdigest(),
            "chroma_sha256": sha256(info["quant"][1]).hexdigest() if 1 in info["quant"] else None,
            "icc_sha256": sha256(info["icc"]).hexdigest() if info["icc"] else None,
            "icc_bytes": len(info["icc"]),
            "markers": [f"FF{x:02X}" for x in info["markers"]],
            "app_markers": [f"FF{x:02X}" for x in info["app"]],
            "exif": info["exif"],
            "comments": info["comments"],
            "trailing": info["trailing"],
        })

    gray = [r["page"] for r in rows if r["components"] == 1]
    rgb = [r["page"] for r in rows if r["components"] == 3]
    assert len(gray) == 23 and len(rgb) == 33, (len(gray), len(rgb))
    assert all(r["size"] == [2400, 3600] for r in rows)
    assert len({r["luma_sha256"] for r in rows}) == 1
    assert len({r["icc_sha256"] for r in rows}) == 1
    assert all(r["trailing"] == 0 and r["exif"] == 0 and r["comments"] == 0 for r in rows)
    assert all(r["quant_ids"] == [0] for r in rows if r["components"] == 1)
    assert all(r["quant_ids"] == [0, 1] for r in rows if r["components"] == 3)
    print(json.dumps({
        "scope": "LP2 p0..p55; physical JPEGs 17.jpg..72.jpg",
        "pages": len(rows),
        "grayscale_count": len(gray),
        "grayscale_pages": gray,
        "rgb_count": len(rgb),
        "rgb_pages": rgb,
        "shared_luminance_quant_table_sha256": rows[0]["luma_sha256"],
        "shared_icc_profile_sha256": rows[0]["icc_sha256"],
        "icc_profile_bytes": rows[0]["icc_bytes"],
        "all_dimensions_2400x3600": True,
        "trailing_bytes": sum(r["trailing"] for r in rows),
        "exif_segments": sum(r["exif"] for r in rows),
        "comment_segments": sum(r["comments"] for r in rows),
        "marker_layout_counts": {
            "|".join(r["markers"]): sum(1 for x in rows if x["markers"] == r["markers"])
            for r in rows
        },
        "interpretation": "The 23/33 split is exactly grayscale (one component, one luma table) versus RGB (three components, shared luma plus chroma table). No APP1 EXIF, COM, or post-EOI payload was found. DCT-coefficient steganography is not tested.",
    }, indent=2))


if __name__ == "__main__":
    main()
