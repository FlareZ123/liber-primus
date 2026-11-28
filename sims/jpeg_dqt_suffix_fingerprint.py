#!/usr/bin/env python3
"""Compare JPEGs from the first quantization table onward.

Useful for Liber Primus mirrors where archive software rewrote APP0/APP1/APP2
metadata.  Equal DQT->EOI bytes mean the compressed image codestream is the same
even if whole-file hashes and metadata differ.
"""
import argparse, hashlib, json
from pathlib import Path


def first_dqt(data):
    if data[:2] != b"\xff\xd8":
        raise ValueError("not a JPEG")
    i = 2
    while i + 3 < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        start = i
        while i < len(data) and data[i] == 0xFF:
            i += 1
        marker = data[i]
        i += 1
        if marker == 0xDB:
            return start
        if marker in range(0xD0, 0xD8) or marker in (0x01, 0xD8, 0xD9):
            continue
        if i + 1 >= len(data):
            break
        n = (data[i] << 8) | data[i + 1]
        if n < 2:
            raise ValueError("invalid JPEG segment length")
        i += n
    raise ValueError("no DQT marker found")


def fingerprint(path):
    data = Path(path).read_bytes()
    off = first_dqt(data)
    suffix = data[off:]
    return {
        "path": str(path),
        "size": len(data),
        "metadata_prefix_bytes": off - 2,
        "first_dqt_offset": off,
        "dqt_to_eoi_bytes": len(suffix),
        "dqt_to_eoi_sha256": hashlib.sha256(suffix).hexdigest(),
        "whole_sha256": hashlib.sha256(data).hexdigest(),
    }, suffix


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a")
    ap.add_argument("b", nargs="?")
    args = ap.parse_args()

    fa, sa = fingerprint(args.a)
    out = {"a": fa}
    if args.b:
        fb, sb = fingerprint(args.b)
        out["b"] = fb
        out["same_dqt_to_eoi"] = sa == sb
        out["whole_file_size_delta_b_minus_a"] = fb["size"] - fa["size"]
        out["metadata_prefix_delta_b_minus_a"] = (
            fb["metadata_prefix_bytes"] - fa["metadata_prefix_bytes"])
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
