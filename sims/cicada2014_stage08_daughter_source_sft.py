#!/usr/bin/env python3
"""Pinned-source SFT: original 2014 Stage08 JPEG/MP3 daughter format audit.

Tests file structure and a narrow absence of appended bytes/extra metadata.
Does not prove absence of steganography inside valid compressed scan data.
"""
from collections import Counter
import hashlib
import urllib.request

REV = "76d3ee8c762f60025822c8c05edbf31351636469"
ROOT = f"https://raw.githubusercontent.com/krisyotam/cicada3301/{REV}/puzzles/2014/assets/stage08/"
PINS = {
    "index.1": ("07d41285504706fabd051d227ef50d1e94cbf3a6",
                "4d66a03af8c3d7880297bce4056d3275f3b02ec00bc7051e36e80509f1d0ea9b"),
    "index.2": ("9ad6f890e3ea4ae0951c5ba237f2152dbdc16eca",
                "6bd3d8011bad9a2593aa64e4b885ac8470e54a6a246b447a3995c2229cd98b79"),
    "index.3": ("c40a65a20cc0dcdad52accec3e816274442c817e",
                "f5719fec286ab0fcc88b36d1fcdd24f23c928b3cce75d437e8aa4f195069e03d"),
}


def fetch_original(name):
    with urllib.request.urlopen(ROOT + name, timeout=35) as response:
        hex_source = response.read()
    blob_sha = hashlib.sha1(
        b"blob " + str(len(hex_source)).encode("ascii") + b"\0" + hex_source
    ).hexdigest()
    assert blob_sha == PINS[name][0], (name, blob_sha)
    raw = bytes.fromhex(hex_source.decode("ascii"))
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == PINS[name][1], (name, digest)
    print(f"SOURCE {name}: {len(raw)} decoded bytes, sha256={digest}")
    return raw


def jpeg_structure(blob):
    assert blob[:2] == b"\xff\xd8", "Missing SOI"
    cursor = 2
    markers = []
    comments = []
    size = None
    scans = 0
    while cursor < len(blob):
        assert blob[cursor] == 255, ("JPEG marker boundary", cursor)
        while blob[cursor] == 255:
            cursor += 1
        marker = blob[cursor]
        cursor += 1
        if marker == 0xD9:
            markers.append("EOI")
            return cursor, markers, size, comments, scans
        assert marker != 0xD8 and marker != 0x00
        assert cursor + 2 <= len(blob), "Truncated marker length"
        length = int.from_bytes(blob[cursor:cursor + 2], "big")
        assert length >= 2 and cursor + length <= len(blob)
        payload = blob[cursor + 2:cursor + length]
        cursor += length
        markers.append(f"FF{marker:02X}")
        if marker == 0xFE:
            comments.append(payload.decode("ascii"))
        if marker in (0xC0, 0xC1, 0xC2):
            assert len(payload) >= 5
            size = (int.from_bytes(payload[3:5], "big"),
                    int.from_bytes(payload[1:3], "big"))
        if marker == 0xDA:
            scans += 1
            while cursor + 1 < len(blob):
                if blob[cursor] == 255:
                    following = blob[cursor + 1]
                    if following == 0 or 0xD0 <= following <= 0xD7:
                        cursor += 2
                        continue
                    if following != 255:
                        break
                cursor += 1
    raise AssertionError("No JPEG EOI")


def mp3_structure(blob):
    # MPEG-2 Layer III, stereo, constant 24 kbps, 24 kHz: 72-byte frames.
    cursor = 0
    headers = Counter()
    frames = 0
    while cursor + 4 <= len(blob):
        word = int.from_bytes(blob[cursor:cursor + 4], "big")
        assert word >> 21 == 0x7FF, ("MP3 sync", cursor)
        version = (word >> 19) & 3
        layer = (word >> 17) & 3
        bitrate_idx = (word >> 12) & 15
        samplerate_idx = (word >> 10) & 3
        padding = (word >> 9) & 1
        assert version == 2 and layer == 1
        assert samplerate_idx < 3 and bitrate_idx not in (0, 15)
        kbps = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80,
                96, 112, 128, 144, 160][bitrate_idx]
        sample_rate = [22050, 24000, 16000][samplerate_idx]
        frame_bytes = 72 * kbps * 1000 // sample_rate + padding
        assert frame_bytes > 4 and cursor + frame_bytes <= len(blob)
        headers[blob[cursor:cursor + 4].hex()] += 1
        cursor += frame_bytes
        frames += 1
    return cursor, frames, headers


def main():
    for n, dims, comment in [
        ("index.1", (163, 79), "Created with GIMP"),
        ("index.2", (197, 173), "LEAD Technologies Inc. V1.01"),
    ]:
        blob = fetch_original(n)
        end, markers, actual_dims, comments, scans = jpeg_structure(blob)
        assert end == len(blob), (n, "JPEG appended bytes", len(blob) - end)
        assert actual_dims == dims and comments == [comment]
        assert scans == 10 and markers.count("FFC2") == 1
        assert all(marker not in markers for marker in ("FFE1", "FFE2", "FFED"))
        assert jpeg_structure(blob + b"\x00")[0] < len(blob) + 1  # trailer control
        print(f"JPEG {n}: {dims}, {scans} progressive scans, COM={comments}, "
              "no EXIF/XMP APP metadata or post-EOI bytes")
    mp3 = fetch_original("index.3")
    end, count, headers = mp3_structure(mp3)
    assert end == len(mp3) and count == 129
    assert headers == {"fff33464": 115, "fff33444": 14}, headers
    assert b"ID3" not in mp3 and b"Xing" not in mp3 and b"VBRI" not in mp3
    assert mp3.count(b"LAME3.98.2") == 2
    assert mp3_structure(mp3 + b"\x00")[0] < len(mp3) + 1  # trailer control
    print(f"MP3: {count} frames, exactly {end} bytes, frame headers={dict(headers)}, "
          f"duration={count * 576 / 24000:.3f} sec, LAME tag x2, "
          "no ID3/Xing/VBRI or out-of-frame trailer")
    print("PASS: pinned original daughter format boundaries. "
          "Scan-coded steganography and audio decoding remain untested.")


if __name__ == "__main__":
    main()
