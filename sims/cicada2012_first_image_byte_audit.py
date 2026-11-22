#!/usr/bin/env python3
"""Byte-level audit for the archived 2012 Cicada first-image carrier."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


EXPECTED = {
    "size": 29279,
    "sha256": "870353b8fbe4d1dd83fdbfc61b07d80213bab035526d3e5fd6a43f7d77db1ead",
    "sha1": "906d8b316b70625c96cb659b745eacdc17dbca1b",
    "git_blob_sha1": "467a24a6f70bb589a994fd73ee37b6f9c7a827f8",
    "dimensions": [509, 503],
    "eoi_offset": 29216,
    "tail": b'TIBERIVS CLAVDIVS CAESAR says "lxxt>33m2mqkyv2gsq3q=w]O2ntk"\n',
}
EXPECTED_BERNSTEIN = {
    "size": 27517,
    "sha256": "72a1fd406da308cd61935fb116f2d73ea5cc008122518a23c9725f6ae1537029",
    "git_blob_sha1": "2cf04f28a98a833e249defdf31d27a8c4664621d",
}
EXPECTED_DECOY = {
    "size": 37348,
    "sha256": "47c2891c7b282f2e5fc5f5af65cf66935a1161ebc9518533e90189d0e64147d7",
    "git_blob_sha1": "0c746eff9331b236077ae77dc962c25ff199d7f4",
}
EXPECTED_OUTGUESS = {
    "size": 535,
    "sha256": "7dbf268b1b356527cf4a2dc105c0dd1f6d2d703291dda24dd9e98e22851d6f40",
}


def hashes(data: bytes) -> dict[str, str]:
    return {
        "sha256": hashlib.sha256(data).hexdigest(),
        "sha1": hashlib.sha1(data).hexdigest(),
        "git_blob_sha1": hashlib.sha1(
            b"blob " + str(len(data)).encode("ascii") + b"\0" + data
        ).hexdigest(),
    }


def jpeg_inventory(data: bytes) -> dict:
    if not data.startswith(b"\xff\xd8"):
        raise ValueError("not a JPEG SOI")

    pos = 2
    segments = []
    dqt = []
    dht = []
    sof0 = None
    jfif = None

    while pos < len(data):
        if data[pos] != 0xFF:
            raise ValueError(f"expected JPEG marker at offset {pos}")
        while pos < len(data) and data[pos] == 0xFF:
            pos += 1
        if pos >= len(data):
            raise ValueError("truncated JPEG marker")
        marker = data[pos]
        pos += 1

        if marker in (0xD8, 0xD9, 0x01) or 0xD0 <= marker <= 0xD7:
            segments.append({"marker": f"FF{marker:02X}", "length": None})
            if marker == 0xD9:
                break
            continue

        if pos + 2 > len(data):
            raise ValueError("truncated JPEG segment length")
        length = int.from_bytes(data[pos:pos + 2], "big")
        if length < 2 or pos + length > len(data):
            raise ValueError(f"invalid JPEG segment length at {pos - 1}")
        payload = data[pos + 2:pos + length]
        segments.append({"marker": f"FF{marker:02X}", "length": length})

        if marker == 0xDB:
            dqt.append(payload)
        elif marker == 0xC4:
            dht.append(payload)
        elif marker == 0xC0:
            sof0 = {
                "precision": payload[0],
                "height": int.from_bytes(payload[1:3], "big"),
                "width": int.from_bytes(payload[3:5], "big"),
                "components": payload[5],
            }
        elif marker == 0xE0 and payload.startswith(b"JFIF\0"):
            jfif = {
                "version": f"{payload[5]}.{payload[6]}",
                "density_units": payload[7],
                "x_density": int.from_bytes(payload[8:10], "big"),
                "y_density": int.from_bytes(payload[10:12], "big"),
                "thumbnail": [payload[12], payload[13]],
            }

        pos += length
        if marker == 0xDA:
            break

    eoi_offsets = [m.start() for m in re.finditer(b"\xff\xd9", data)]
    if len(eoi_offsets) != 1:
        raise ValueError(f"expected one EOI marker, found {len(eoi_offsets)}")
    eoi = eoi_offsets[0]
    markers = [int(s["marker"][2:], 16) for s in segments]
    return {
        "size": len(data),
        **hashes(data),
        "dimensions": [sof0["width"], sof0["height"]] if sof0 else None,
        "sof0": sof0,
        "jfif": jfif,
        "segments": segments,
        "dqt": [x.hex() for x in dqt],
        "dht": [x.hex() for x in dht],
        "has_exif_app1": 0xE1 in markers,
        "has_icc_app2": 0xE2 in markers,
        "has_comment_com": 0xFE in markers,
        "eoi_offset": eoi,
        "tail": data[eoi + 2:],
        "tail_text": data[eoi + 2:].decode("ascii", errors="backslashreplace"),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--bernstein-copy", type=Path)
    parser.add_argument("--decoy", type=Path)
    parser.add_argument("--expected-outguess", type=Path)
    parser.add_argument("--observed-outguess", type=Path)
    args = parser.parse_args()

    primary = jpeg_inventory(args.image.read_bytes())
    assert primary["size"] == EXPECTED["size"]
    assert primary["sha256"] == EXPECTED["sha256"]
    assert primary["sha1"] == EXPECTED["sha1"]
    assert primary["git_blob_sha1"] == EXPECTED["git_blob_sha1"]
    assert primary["dimensions"] == EXPECTED["dimensions"]
    assert primary["eoi_offset"] == EXPECTED["eoi_offset"]
    assert primary["tail"] == EXPECTED["tail"]
    assert primary["jfif"] == {
        "version": "1.1",
        "density_units": 0,
        "x_density": 1,
        "y_density": 1,
        "thumbnail": [0, 0],
    }
    assert [x["marker"] for x in primary["segments"]] == [
        "FFE0", "FFDB", "FFDB", "FFC0", "FFC4", "FFC4", "FFC4", "FFC4", "FFDA"
    ]
    assert [x["length"] for x in primary["segments"]] == [16, 67, 67, 17, 31, 181, 31, 181, 12]
    assert not primary["has_exif_app1"]
    assert not primary["has_icc_app2"]
    assert not primary["has_comment_com"]

    token = re.search(rb'"([^"]+)"', primary["tail"])
    assert token, "Caesar token not found in appended suffix"
    rot4_url = bytes((b - 4) & 0xFF for b in token.group(1)).decode("ascii")
    assert rot4_url == "http://i.imgur.com/m9sYK.jpg"

    result = {"primary": {k: v for k, v in primary.items() if k not in ("dqt", "dht", "tail")}}
    result["primary"]["tail_hex"] = primary["tail"].hex()
    result["primary"]["rot4_url"] = rot4_url

    if args.bernstein_copy:
        secondary = jpeg_inventory(args.bernstein_copy.read_bytes())
        assert secondary["size"] == EXPECTED_BERNSTEIN["size"]
        assert secondary["sha256"] == EXPECTED_BERNSTEIN["sha256"]
        assert secondary["git_blob_sha1"] == EXPECTED_BERNSTEIN["git_blob_sha1"]
        assert secondary["dimensions"] == EXPECTED["dimensions"]
        assert secondary["tail"] == b""
        assert secondary["dqt"] == primary["dqt"]
        assert secondary["dht"] != primary["dht"]
        result["bernstein_copy"] = {
            "size": secondary["size"],
            "sha256": secondary["sha256"],
            "git_blob_sha1": secondary["git_blob_sha1"],
            "dimensions": secondary["dimensions"],
            "tail_length": len(secondary["tail"]),
            "same_dqt": True,
            "same_dht": False,
        }

    if args.decoy:
        decoy_data = args.decoy.read_bytes()
        decoy_hashes = hashes(decoy_data)
        assert len(decoy_data) == EXPECTED_DECOY["size"]
        assert decoy_hashes["sha256"] == EXPECTED_DECOY["sha256"]
        assert decoy_hashes["git_blob_sha1"] == EXPECTED_DECOY["git_blob_sha1"]
        result["decoy"] = {"size": len(decoy_data), **decoy_hashes}

    if args.expected_outguess:
        expected = args.expected_outguess.read_bytes()
        expected_hashes = hashes(expected)
        assert len(expected) == EXPECTED_OUTGUESS["size"]
        assert expected_hashes["sha256"] == EXPECTED_OUTGUESS["sha256"]
        assert b"http://www.reddit.com/r/a2e7j6ic78h0j/" in expected
        code_lines = [
            line for line in expected.splitlines()
            if re.fullmatch(rb"\d+:\d+", line)
        ]
        assert len(code_lines) == 76
        assert code_lines[0] == b"1:20" and code_lines[-1] == b"76:21"
        result["archived_outguess"] = {
            "size": len(expected),
            "sha256": expected_hashes["sha256"],
            "book_code_pairs": len(code_lines),
        }
        if args.observed_outguess:
            observed = args.observed_outguess.read_bytes()
            assert observed == expected, "OutGuess output differs from archived extraction"
            result["observed_outguess_matches_archive"] = True
    elif args.observed_outguess:
        raise ValueError("--observed-outguess requires --expected-outguess")

    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
