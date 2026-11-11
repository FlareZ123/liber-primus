#!/usr/bin/env python3
"""Stage5 2014 original data.out: source-motivated JPEG carving under identity,
byte reversal and 0xFF XOR, operations used in earlier Cicada 2014 stages.

Requires Pillow; reads the preserved gzip-expanded source bytes. No key search.
"""
from __future__ import annotations

import hashlib
import io
import os
from pathlib import Path
import sys
import tempfile

from PIL import Image

SOURCE_SHA256 = "8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a"
SOURCE_LENGTH = 3_010_703
TRAILER_START = 1_647_321


def inspect(data: bytes, label: str) -> list[tuple[int, int, int, int, str]]:
    """Find complete structurally decodable JPEGs, preserving their positions."""
    found = []
    pos = 0
    while True:
        start = data.find(b"\xff\xd8\xff", pos)
        if start < 0:
            break
        pos = start + 1
        end = data.find(b"\xff\xd9", start + 3)
        if end < 0:
            continue
        end += 2
        try:
            with Image.open(io.BytesIO(data[start:end])) as im:
                im.load()
                if im.format != "JPEG" or min(im.size) < 16:
                    continue
                width, height = im.size
        except (OSError, ValueError, SyntaxError):
            continue
        digest = hashlib.sha256(data[start:end]).hexdigest()
        found.append((start, end, width, height, digest))
        print(f"VALID {label} offset={start} end={end} bytes={end-start} "
              f"dimensions={width}x{height} sha256={digest}")
        pos = end
    print(f"VIEW {label} length={len(data)} valid_jpegs={len(found)}")
    return found


def run(raw: bytes) -> dict[str, list[tuple[int, int, int, int, str]]]:
    assert len(raw) == SOURCE_LENGTH, "unexpected historical byte length"
    assert hashlib.sha256(raw).hexdigest() == SOURCE_SHA256, "historical source changed"
    assert raw[:3] == b"\xff\xd8\xff"
    assert raw[823_805:823_807] == b"\xff\xd9"
    assert raw[823_807:823_810] == b"\xff\xd8\xff"
    assert raw[1_647_319:TRAILER_START] == b"\xff\xd9"
    trailer = raw[TRAILER_START:]
    inverted = bytes(value ^ 255 for value in trailer)
    print(f"SOURCE len={len(raw)} trailer={len(trailer)} sha256={SOURCE_SHA256}")
    views = {
        "source-original": raw,
        "trailer-as-is": trailer,
        "trailer-reversed": trailer[::-1],
        "trailer-xor-ff": inverted,
        "trailer-reversed-xor-ff": inverted[::-1],
    }
    return {name: inspect(content, name) for name, content in views.items()}


def selftest() -> None:
    samples = []
    for xy in [(16, 32), (32, 16)]:
        im = Image.new("RGB", xy, (38, 107, 211))
        buf = io.BytesIO()
        im.save(buf, format="JPEG")
        samples.append(buf.getvalue())
    combined = b"".join(samples)
    assert len(inspect(combined, "plant-forward")) == 2
    assert len(inspect(combined[::-1][::-1], "plant-reversal-recovered")) == 2
    flipped = bytes(x ^ 255 for x in combined)
    assert len(inspect(bytes(x ^ 255 for x in flipped), "plant-xor-recovered")) == 2
    assert len(inspect(bytes(x ^ 255 for x in flipped[::-1])[::-1], "plant-both-recovered")) == 2
    assert len(inspect(bytes(1000), "plant-zero-negative")) == 0
    print("SELFTEST PASS: 4 positive transformations, zero-input negative")


def recover(raw: bytes, destination: Path) -> None:
    """Materialize four validated JPEGs, with content hashes pinned by the original scan."""
    assert len(raw) == SOURCE_LENGTH
    assert hashlib.sha256(raw).hexdigest() == SOURCE_SHA256
    backwards = raw[TRAILER_START:][::-1]
    chunks = (
        raw[:823807],
        raw[823807:TRAILER_START],
        backwards[:638805],
        backwards[638805:],
    )
    expected_hashes = (
        "913e26462e51942f49ca3ce2e94ef56c5fb65110814442dccc02b0d88af2c5ca",
        "b50c1536ea1f30847e7875835991d52951bafb599fb1ab04eb78c5c6e6c2b468",
        "f0edba1084df9983353c11544bbf711f94ed7649edbf94b426c9b78549b64557",
        "975cda73bbf829b2775f25beb609d34fa429728b2f2a4ce863c129b10b005089",
    )
    destination.mkdir(parents=True, exist_ok=True)
    for index, (chunk, digest) in enumerate(zip(chunks, expected_hashes), 1):
        assert hashlib.sha256(chunk).hexdigest() == digest
        with Image.open(io.BytesIO(chunk)) as picture:
            picture.load()
            assert picture.format == "JPEG" and picture.size == (2400, 3600)
        target = destination / f"stage5-image-{index:02d}.jpg"
        with tempfile.NamedTemporaryFile(mode="wb", dir=destination,
                                     prefix=f".stage5-{index:02d}-", delete=False) as handle:
            handle.write(chunk)
            name = handle.name
        os.replace(name, target)
        print(f"EXTRACTED image={index} file={target} bytes={len(chunk)} sha256={digest}")
    print("EXTRACTED four complete source-authenticated Stage5 JPEGs")


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--selftest":
        selftest()
    elif len(sys.argv) == 4 and sys.argv[1] == "--extract":
        recover(Path(sys.argv[2]).read_bytes(), Path(sys.argv[3]))
    elif len(sys.argv) == 2:
        run(Path(sys.argv[1]).read_bytes())
    else:
        raise SystemExit("usage: stage5_four_image_carve_sft.py --selftest|data.out|--extract data.out DIRECTORY")
