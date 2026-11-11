#!/usr/bin/env python3
"""Original-JPEG pixel gate for three disputed pp49-51 table bytes.

Read original JPEGs from the repository, or pass --archive with the maintainer
75-JPEG ZIP. Requires Pillow, NumPy and OpenCV. No OCR or ciphertext fitting.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"
HASHES = {
    66: "aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335",
    68: "2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b",
}
ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx"
# Original physical p49 is archive scan66; p51 is scan68.
# x,y,w,h are tight ORIGINAL-JPEG connected components at grayscale <140.
CASES = {
    45: {"scan": 66, "box": (1441, 2139, 8, 74), "token": "1l", "competing": "1L"},
    50: {"scan": 66, "box": (1027, 2318, 8, 74), "token": "0l", "competing": "0L"},
    246: {"scan": 68, "box": (1566, 1884, 8, 67), "token": "3I", "competing": "3i"},
}
# Independent printed control glyphs, not derived from disputed tokens.
UPPER_I = (66, (899, 1788, 8, 67))  # p49 row3, "3I"
UPPER_L = (68, (893, 1884, 26, 67))  # p51 row7, "2L"


def glyph_mask(image: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    x, y, w, h = box
    return image[y:y+h, x:x+w] < 140


def native_component(image: np.ndarray, box: tuple[int, int, int, int]) -> dict[str, int]:
    x, y, w, h = box
    border = 5
    # Independently re-derive the glyph component inside an isolated window.
    patch = (image[y-border:y+h+border, x-border:x+w+border] < 140).astype(np.uint8)
    _, _, stats, _ = cv2.connectedComponentsWithStats(patch, 8)
    components = [tuple(map(int, v)) for v in stats[1:] if int(v[4]) >= 40]
    assert len(components) == 1, (box, components)
    left, top, width, height, ink = components[0]
    assert (left, top, width, height) == (border, border, w, h), (box, components)
    return {"width": width, "height": height, "solid_pixels": ink}


def to_byte(token: str) -> int:
    assert len(token) == 2
    return ALPHABET.index(token[0]) * 60 + ALPHABET.index(token[1])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, help="Original 75-JPEG archive ZIP")
    arguments = parser.parse_args()
    archive = ZipFile(arguments.archive) if arguments.archive else None
    images: dict[int, np.ndarray] = {}
    for scan, digest in HASHES.items():
        payload = (archive.read(f"liber-primus-jpegs/{scan:02}.jpg")
                   if archive else (IMAGE_DIR / f"{scan:02}.jpg").read_bytes())
        assert hashlib.sha256(payload).hexdigest() == digest, scan
        images[scan] = np.asarray(Image.open(io.BytesIO(payload)).convert("L"))
        assert images[scan].shape == (3600, 2400)
    if archive:
        archive.close()

    selected = {}
    for index, case in CASES.items():
        glyph = native_component(images[case["scan"]], case["box"])
        assert to_byte(case["token"]) in range(256)
        selected[index] = {
            "source_token": case["token"], "source_byte": to_byte(case["token"]),
            "rival_token": case["competing"], "rival_byte": to_byte(case["competing"]),
            **glyph,
        }
    assert selected[45]["height"] == selected[50]["height"] == 74
    assert selected[246]["height"] == 67
    assert selected[45]["width"] == selected[50]["width"] == selected[246]["width"] == 8

    lower_l_45 = glyph_mask(images[66], CASES[45]["box"])
    lower_l_50 = glyph_mask(images[66], CASES[50]["box"])
    upper_i_ref = glyph_mask(images[UPPER_I[0]], UPPER_I[1])
    upper_i_target = glyph_mask(images[68], CASES[246]["box"])
    assert np.array_equal(lower_l_45, lower_l_50), "lower-l forms differ"
    assert np.array_equal(upper_i_ref, upper_i_target), "upper-I forms differ"
    big_l = native_component(images[UPPER_L[0]], UPPER_L[1])
    assert big_l == {"width": 26, "height": 67, "solid_pixels": 602}

    # Source p49 row9 "2i": the lowercase-i has a disjoint dot and stem.
    dot_and_stem = (images[66][2863:2932, 759:772] < 140).astype(np.uint8)
    _, _, dot_stats, _ = cv2.connectedComponentsWithStats(dot_and_stem, 8)
    pieces = sorted((int(v[2]), int(v[3]), int(v[4]))
                    for v in dot_stats[1:] if int(v[4]) >= 40)
    assert pieces == [(7, 42, 294), (11, 11, 85)], pieces

    fixture = IMAGE_DIR / "base60-grid.json"
    if fixture.exists():
        table = json.loads(fixture.read_text(encoding="utf-8"))
        for index, case in CASES.items():
            row, col = divmod(index, 8)
            assert table["rows"][row][col] == case["token"]
            assert table["byte_rows"][row][col] == to_byte(case["token"])

    print(json.dumps({
        "status": "PASS: source-original three-byte glyph gate",
        "source_sha256": HASHES,
        "table_indices_zero_based": selected,
        "uppercase_L_control": big_l,
        "lowercase_i_control_components": pieces,
        "lowercase_l_binary_masks_identical": True,
        "uppercase_I_binary_masks_identical": True,
        "unknown_lp2_plaintext_recovered": False,
    }, indent=2))


if __name__ == "__main__":
    main()
