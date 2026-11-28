#!/usr/bin/env python3
"""Byte-level JPEG production fingerprint for the 75 Liber Primus source JPEGs.

Usage:
  python lp2_jpeg_pipeline_fingerprint_sft.py /path/to/liber-primus-jpegs.zip
  python lp2_jpeg_pipeline_fingerprint_sft.py /path/to/extracted-directory

No image decoder is required. The program parses JPEG marker segments directly, reconstructs
ICC_PROFILE chunks, identifies IJG quality from standard quantization tables, and asserts the
source invariants reported in im-results/lp2-jpeg-artifex-pipeline.md.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path

STD_LUMA = [
    16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,
    14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,
    18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,
    49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99,
]
STD_CHROMA = [
    17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,
    24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,
    99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,
    99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,
]
ZIGZAG = [
    0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,
    12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,
    35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,
    58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63,
]

LP2_RGB_PAGES = [
    0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
    22,23,26,27,32,33,34,35,36,37,38,39,40,49,53,54,55,56,57,
]
LP2_GRAY_PAGES = [
    16,17,18,19,20,21,24,25,28,29,30,31,
    41,42,43,44,45,46,47,48,50,51,52,
]
LP2_ICC_SHA256 = "942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0"
LP2_ICC_GIT_BLOB_SHA1 = "627e8feb0ec9635c9672deff48b0d3bb9e1bc024"
LP2_ICC_DESCRIPTION = "Artifex Software sRGB ICC Profile"
LP2_ICC_COPYRIGHT = "Copyright Artifex Software 2011"
LP2_RGB_DQT_SHA256 = "3d5deb37442ccf2167079b26777a83e7dd10a8ad8ce4a2f1db645176f075b094"
LP2_GRAY_DQT_SHA256 = "ab45b515fbe99cd32b49303e5bf9bff37f6781c81c1cdedeee87f0ceae4add5d"
LP2_RGB_MARKERS = ("SOI","APP0","APP2","DQT","DQT","SOF0","DHT","DHT","DHT","DHT","SOS","EOI")
LP2_GRAY_MARKERS = ("SOI","APP0","APP2","DQT","SOF0","DHT","DHT","SOS","EOI")

@dataclass(frozen=True)
class JpegInfo:
    file_number: int
    width: int
    height: int
    components: int
    sampling: tuple[tuple[int, int, int], ...]
    jfif_version: tuple[int, int]
    jfif_unit: int
    jfif_xdensity: int
    jfif_ydensity: int
    dqt_ids: tuple[int, ...]
    dqt_sha256: str
    ijg_quality: int | None
    icc_length: int
    icc_sha256: str | None
    icc_git_blob_sha1: str | None
    icc_description: str | None
    icc_copyright: str | None
    marker_sequence: tuple[str, ...]
    dht_sha256: str
    trailing_bytes: int


def ijg_scaled(base: list[int], quality: int) -> bytes:
    if not 1 <= quality <= 100:
        raise ValueError(quality)
    scale = 5000 // quality if quality < 50 else 200 - 2 * quality
    natural = [max(1, min(255, (v * scale + 50) // 100)) for v in base]
    return bytes(natural[i] for i in ZIGZAG)


def identify_quality(tables: list[tuple[int, bytes]]) -> int | None:
    by_id = {table_id: values for table_id, values in tables}
    for quality in range(1, 101):
        if by_id.get(0) != ijg_scaled(STD_LUMA, quality):
            continue
        if 1 in by_id and by_id[1] != ijg_scaled(STD_CHROMA, quality):
            continue
        if set(by_id) <= {0, 1}:
            return quality
    return None


def icc_text_tag(profile: bytes, tag_signature: bytes) -> str | None:
    if len(profile) < 132:
        return None
    count = int.from_bytes(profile[128:132], "big")
    for n in range(count):
        off = 132 + 12 * n
        if off + 12 > len(profile):
            return None
        sig = profile[off:off+4]
        pos = int.from_bytes(profile[off+4:off+8], "big")
        size = int.from_bytes(profile[off+8:off+12], "big")
        if sig != tag_signature or pos + size > len(profile):
            continue
        body = profile[pos:pos+size]
        if body[:4] == b"desc" and len(body) >= 12:
            length = int.from_bytes(body[8:12], "big")
            return body[12:12+max(0, length - 1)].decode("latin1", "replace")
        if body[:4] == b"text" and len(body) >= 8:
            return body[8:].split(b"\0", 1)[0].decode("latin1", "replace")
    return None


def parse_jpeg(file_number: int, data: bytes) -> JpegInfo:
    if data[:2] != b"\xff\xd8":
        raise AssertionError(f"{file_number:02d}.jpg is not JPEG")

    i = 2
    in_scan = False
    markers = ["SOI"]
    names = {
        0xE0:"APP0", 0xE1:"APP1", 0xE2:"APP2", 0xDB:"DQT",
        0xC0:"SOF0", 0xC1:"SOF1", 0xC2:"SOF2", 0xC4:"DHT", 0xDA:"SOS", 0xD9:"EOI",
    }
    dqt: list[tuple[int, bytes]] = []
    dht: list[bytes] = []
    icc_chunks: dict[int, tuple[int, bytes]] = {}
    width = height = components = 0
    sampling: tuple[tuple[int, int, int], ...] = ()
    jfif = None
    trailing_bytes = -1

    while i < len(data):
        if in_scan:
            j = data.find(b"\xff", i)
            if j < 0:
                break
            k = j + 1
            while k < len(data) and data[k] == 0xFF:
                k += 1
            if k >= len(data):
                break
            marker = data[k]
            if marker == 0x00 or 0xD0 <= marker <= 0xD7:
                i = k + 1
                continue
            i = j
            in_scan = False

        if data[i] != 0xFF:
            i += 1
            continue
        while i < len(data) and data[i] == 0xFF:
            i += 1
        if i >= len(data):
            break
        marker = data[i]
        i += 1
        if marker == 0x00:
            continue
        markers.append(names.get(marker, f"FF{marker:02X}"))

        if marker == 0xD9:
            trailing_bytes = len(data) - i
            break
        if marker in {0xD8} or 0xD0 <= marker <= 0xD7 or marker == 0x01:
            continue
        if i + 2 > len(data):
            raise AssertionError("truncated JPEG marker")
        length = int.from_bytes(data[i:i+2], "big")
        if length < 2 or i + length > len(data):
            raise AssertionError("invalid JPEG marker length")
        payload = data[i+2:i+length]
        i += length

        if marker == 0xE0 and payload.startswith(b"JFIF\0"):
            if len(payload) < 14:
                raise AssertionError("short JFIF")
            jfif = (
                (payload[5], payload[6]), payload[7],
                int.from_bytes(payload[8:10], "big"),
                int.from_bytes(payload[10:12], "big"),
                (payload[12], payload[13]),
            )
        elif marker == 0xE2 and payload.startswith(b"ICC_PROFILE\0"):
            if len(payload) < 14:
                raise AssertionError("short ICC chunk")
            seq, total = payload[12], payload[13]
            icc_chunks[seq] = (total, payload[14:])
        elif marker == 0xC4:
            dht.append(payload)
        elif marker == 0xDB:
            j = 0
            while j < len(payload):
                pq_tq = payload[j]
                j += 1
                precision = pq_tq >> 4
                table_id = pq_tq & 0x0F
                nbytes = 64 * (2 if precision else 1)
                values = payload[j:j+nbytes]
                if len(values) != nbytes:
                    raise AssertionError("truncated DQT")
                if precision:
                    raise AssertionError("unexpected 16-bit DQT")
                dqt.append((table_id, values))
                j += nbytes
        elif marker in {0xC0, 0xC1, 0xC2}:
            if len(payload) < 6:
                raise AssertionError("short SOF")
            height = int.from_bytes(payload[1:3], "big")
            width = int.from_bytes(payload[3:5], "big")
            components = payload[5]
            entries = []
            j = 6
            for _ in range(components):
                cid, hv, tq = payload[j:j+3]
                entries.append((cid, hv, tq))
                j += 3
            sampling = tuple(entries)
        elif marker == 0xDA:
            in_scan = True

    if jfif is None or not width or not dqt or trailing_bytes < 0:
        raise AssertionError(f"missing required JPEG metadata in {file_number:02d}.jpg")

    profile = b""
    if icc_chunks:
        totals = {total for total, _ in icc_chunks.values()}
        if len(totals) != 1:
            raise AssertionError("inconsistent ICC chunk counts")
        total = totals.pop()
        if set(icc_chunks) != set(range(1, total + 1)):
            raise AssertionError("missing ICC chunk")
        profile = b"".join(icc_chunks[n][1] for n in range(1, total + 1))

    dqt_concat = b"".join(values for _, values in dqt)
    return JpegInfo(
        file_number=file_number,
        width=width,
        height=height,
        components=components,
        sampling=sampling,
        jfif_version=jfif[0],
        jfif_unit=jfif[1],
        jfif_xdensity=jfif[2],
        jfif_ydensity=jfif[3],
        dqt_ids=tuple(table_id for table_id, _ in dqt),
        dqt_sha256=hashlib.sha256(dqt_concat).hexdigest(),
        ijg_quality=identify_quality(dqt),
        icc_length=len(profile),
        icc_sha256=hashlib.sha256(profile).hexdigest() if profile else None,
        icc_git_blob_sha1=(hashlib.sha1(b"blob " + str(len(profile)).encode() + b"\0" + profile).hexdigest() if profile else None),
        icc_description=icc_text_tag(profile, b"desc") if profile else None,
        icc_copyright=icc_text_tag(profile, b"cprt") if profile else None,
        marker_sequence=tuple(markers),
        dht_sha256=hashlib.sha256(b"".join(dht)).hexdigest(),
        trailing_bytes=trailing_bytes,
    )


def load_source(path: Path) -> dict[int, bytes]:
    out: dict[int, bytes] = {}
    if path.is_file() and path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as zf:
            for name in zf.namelist():
                base = Path(name).name
                if len(base) == 6 and base[:2].isdigit() and base.endswith(".jpg"):
                    out[int(base[:2])] = zf.read(name)
    elif path.is_dir():
        for n in range(75):
            candidates = list(path.rglob(f"{n:02d}.jpg"))
            if candidates:
                out[n] = candidates[0].read_bytes()
    else:
        raise SystemExit(f"unsupported source: {path}")
    missing = [n for n in range(75) if n not in out]
    if missing:
        raise AssertionError(f"missing JPEGs: {missing}")
    return out


def summarize(infos: list[JpegInfo]) -> dict[str, object]:
    lp1 = infos[:17]
    lp2 = infos[17:]
    rgb_pages = [x.file_number - 17 for x in lp2 if x.components == 3]
    gray_pages = [x.file_number - 17 for x in lp2 if x.components == 1]

    assert len(lp2) == 58
    assert all((x.width, x.height) == (2400, 3600) for x in lp2)
    assert all((x.jfif_version, x.jfif_unit, x.jfif_xdensity, x.jfif_ydensity) == ((1,1),1,400,400) for x in lp2)
    assert all(x.ijg_quality == 92 for x in lp2)
    assert all(x.trailing_bytes == 0 for x in lp2)
    assert rgb_pages == LP2_RGB_PAGES
    assert gray_pages == LP2_GRAY_PAGES

    for x in lp2:
        assert x.icc_length == 2576
        assert x.icc_sha256 == LP2_ICC_SHA256
        assert x.icc_git_blob_sha1 == LP2_ICC_GIT_BLOB_SHA1
        assert x.icc_description == LP2_ICC_DESCRIPTION
        assert x.icc_copyright == LP2_ICC_COPYRIGHT
        if x.components == 3:
            assert x.dqt_ids == (0, 1)
            assert x.dqt_sha256 == LP2_RGB_DQT_SHA256
            assert x.sampling == ((1,0x22,0),(2,0x11,1),(3,0x11,1))
            assert x.marker_sequence == LP2_RGB_MARKERS
        else:
            assert x.dqt_ids == (0,)
            assert x.dqt_sha256 == LP2_GRAY_DQT_SHA256
            assert x.sampling == ((1,0x11,0),)
            assert x.marker_sequence == LP2_GRAY_MARKERS

    assert len(lp1) == 17
    assert all((x.width, x.height) == (2400, 3600) for x in lp1)
    assert all(x.components == 3 for x in lp1)
    assert all(x.icc_length == 0 for x in lp1)
    assert len({(x.jfif_unit,x.jfif_xdensity,x.jfif_ydensity) for x in lp1}) == 2
    assert len({x.dqt_sha256 for x in lp1}) == 3
    assert sum(x.ijg_quality == 92 for x in lp1) == 8

    return {
        "lp2_count":58,
        "dimensions":[2400,3600],
        "density_dpi":[400,400],
        "nominal_inches":[6.0,9.0],
        "icc":{
            "length":2576,
            "sha256":LP2_ICC_SHA256,
            "git_blob_sha1":LP2_ICC_GIT_BLOB_SHA1,
            "description":LP2_ICC_DESCRIPTION,
            "copyright":LP2_ICC_COPYRIGHT,
        },
        "ijg_quality":92,
        "rgb_count":len(rgb_pages),
        "gray_count":len(gray_pages),
        "page_specific_huffman_tables":len({x.dht_sha256 for x in lp2}) == len(lp2),
        "rgb_pages":rgb_pages,
        "gray_pages":gray_pages,
        "mode_string":"".join("R" if p in set(rgb_pages) else "G" for p in range(58)),
        "lp1_contrast":{
            "count":len(lp1),
            "icc_profile_count":sum(bool(x.icc_length) for x in lp1),
            "component_counts":dict(Counter(x.components for x in lp1)),
            "density_variants":[list(v) for v in sorted({(x.jfif_unit,x.jfif_xdensity,x.jfif_ydensity) for x in lp1})],
            "dqt_families":len({x.dqt_sha256 for x in lp1}),
            "ijg_q92_count":sum(x.ijg_quality == 92 for x in lp1),
        },
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("source", type=Path)
    ap.add_argument("--json", action="store_true", help="emit full per-file JSON")
    args = ap.parse_args()
    blobs = load_source(args.source)
    infos = [parse_jpeg(n, blobs[n]) for n in range(75)]
    result = summarize(infos)
    print("PASS: LP2 JPEG production fingerprint")
    print(json.dumps(result, indent=2, sort_keys=True))
    if args.json:
        print(json.dumps([asdict(x) for x in infos], indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
