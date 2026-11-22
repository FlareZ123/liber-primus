"""Full-length unkeyed DCT magnitude-bit payload search for 58 original LP2 JPEGs.

Extension of jpeg_dct_frame_screen.py's first-128-byte scan. Positive control
uses original JPEG coefficients and places a real zlib payload at byte 256.
"""
from __future__ import annotations

import argparse
import bz2
import hashlib
import json
import lzma
from pathlib import Path
import subprocess
import tempfile
import zlib

from jpeg_dct_frame_screen import compile_native, BIT_REVERSE

HERE = Path(__file__).resolve().parent
MAGIC = {
    "gzip": bytes.fromhex("1f8b08"),
    "zip": bytes.fromhex("504b0304"),
    "png": bytes.fromhex("89504e470d0a1a0a"),
    "pdf": b"%PDF-",
    "bzip2": b"BZh",
    "xz": bytes.fromhex("fd377a585a00"),
    "7zip": bytes.fromhex("377abcaf271c"),
    "rar": bytes.fromhex("526172211a07"),
    "sqlite": b"SQLite format 3\x00",
    "ogg": b"OggS",
    "elf": b"\x7fELF",
    "ascii-pgp": b"-----BEGIN PGP",
    "cicada": b"cicada",
    "CICADA": b"CICADA",
}
ZLIB_HEADERS = tuple(
    bytes((a, b)) for a in range(8, 0x79, 0x10)
    for b in range(256)
    if ((a << 8) | b) % 31 == 0 and not b & 0x20
)
MAX_DECODED = 16 << 20


def reframe(src: bytes, shift: int, reversed_bytes: bool) -> bytes:
    if shift:
        src = bytes(((src[i] << shift) & 255) |
                    (src[i + 1] >> (8 - shift))
                    for i in range(len(src) - 1))
    return src.translate(BIT_REVERSE) if reversed_bytes else src


def positions(data: bytes, signature: bytes):
    off = data.find(signature)
    while off != -1:
        yield off
        off = data.find(signature, off + 1)


def authenticated(data: bytes, offset: int, encoding: str):
    try:
        if encoding in ("zlib", "gzip"):
            decoder = zlib.decompressobj(31 if encoding == "gzip" else 15)
            decoded = decoder.decompress(data[offset:], MAX_DECODED + 1)
        elif encoding == "bzip2":
            decoder = bz2.BZ2Decompressor()
            decoded = decoder.decompress(data[offset:], max_length=MAX_DECODED + 1)
        else:
            decoder = lzma.LZMADecompressor()
            decoded = decoder.decompress(data[offset:], max_length=MAX_DECODED + 1)
        if decoder.eof and len(decoded) <= MAX_DECODED:
            return {"bytes": len(decoded), "sha256": hashlib.sha256(decoded).hexdigest()}
    except (zlib.error, OSError, EOFError, lzma.LZMAError):
        pass
    return None


def totals():
    return {"views": 0, "bytes_scanned": 0, "zlib_headers": 0,
            "signatures": {k: 0 for k in MAGIC}, "raw_signature_hits": [],
            "authenticated_frames": []}


def scan_stream(data: bytes, label: dict, counts: dict, skip_zlib: bool):
    counts["views"] += 1
    counts["bytes_scanned"] += len(data)
    for name, signature in MAGIC.items():
        for offset in positions(data, signature):
            counts["signatures"][name] += 1
            if name in ("gzip", "bzip2", "xz"):
                recovered = authenticated(data, offset, name)
                if recovered is not None:
                    counts["authenticated_frames"].append(
                        {**label, "type": name, "offset": offset, **recovered})
            else:
                counts["raw_signature_hits"].append(
                    {**label, "type": name, "offset": offset})
    if skip_zlib:
        return
    for signature in ZLIB_HEADERS:
        for offset in positions(data, signature):
            counts["zlib_headers"] += 1
            recovered = authenticated(data, offset, "zlib")
            if recovered is not None:
                counts["authenticated_frames"].append(
                    {**label, "type": "zlib", "offset": offset, **recovered})


def scan_one(image: Path, reader: Path, temp: Path,
             counts: dict, skip_zlib: bool):
    prefix = temp / "coeff"
    subprocess.run([str(reader), str(image), str(prefix)],
                   capture_output=True, check=True)
    for mode in (0, 1):
        for component in range(4):
            source = temp / f"coeff_m{mode}_c{component}.bin"
            raw = source.read_bytes()
            if len(raw) < 132:
                continue
            for shift in range(8):
                for reverse in (False, True):
                    data = reframe(raw, shift, reverse)
                    scan_stream(data, {"image": image.name, "mode": mode,
                                       "component": component, "shift": shift,
                                       "reverse": reverse}, counts, skip_zlib)
    for source in temp.glob("coeff_m*_c*.bin"):
        source.unlink()


def planted_control(source: Path, reader: Path, writer: Path, temp: Path):
    message = b"LIBER PRIMUS FULL-STREAM JPEG DCT NONZERO-OFFSET POSITIVE 3301"
    filler = bytes((i * 193 + 79) % 256 for i in range(256))
    planted = temp / "positive.jpg"
    payload = (filler + zlib.compress(message)).hex()
    subprocess.run([str(writer), str(source), str(planted), payload],
                   check=True, capture_output=True)
    found = totals()
    scan_one(planted, reader, temp, found, skip_zlib=False)
    matches = [r for r in found["authenticated_frames"]
               if (r["type"], r["offset"], r["mode"], r["component"],
                   r["shift"], r["reverse"], r["bytes"], r["sha256"])
               == ("zlib", 256, 0, 1, 0, False, len(message),
                   hashlib.sha256(message).hexdigest())]
    assert len(matches) == 1, "Authentic embedded offset-256 payload was not recovered"
    return {"original": source.name, "offset": 256, "positive": True,
            "sha256": hashlib.sha256(message).hexdigest()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--images", type=Path,
                        default=HERE.parent / "resources" / "liber-primus")
    parser.add_argument("--first", type=int, default=17)
    parser.add_argument("--count", type=int, default=58)
    parser.add_argument("--cc", default="cc")
    parser.add_argument("--skip-control", action="store_true")
    parser.add_argument("--skip-zlib", action="store_true",
                        help="Signature-only continuation; skip verified zlib scans")
    args = parser.parse_args()
    if not (17 <= args.first <= 74 and 1 <= args.count <= 75-args.first):
        raise ValueError("Image interval must be contained in 17.jpg..74.jpg")
    inputs = [args.images / f"{i:02}.jpg"
              for i in range(args.first, args.first + args.count)]
    with tempfile.TemporaryDirectory(prefix="lp2-dct-full-") as folder:
        temp = Path(folder)
        reader, writer = temp / "reader", temp / "writer"
        compile_native(HERE / "jpeg_dct_frame_extract.c", reader, args.cc)
        if args.skip_control:
            control = None
        else:
            compile_native(HERE / "jpeg_dct_plant_control.c", writer, args.cc)
            control = planted_control(inputs[0], reader, writer, temp)
        result = totals()
        for source in inputs:
            scan_one(source, reader, temp, result, args.skip_zlib)
            print("SCANNED", source.name, "views", result["views"],
                  "verified", len(result["authenticated_frames"]), flush=True)
    print("RESULT " + json.dumps({"images": len(inputs), "control": control,
                                    "original": result}, sort_keys=True))


if __name__ == "__main__":
    main()
