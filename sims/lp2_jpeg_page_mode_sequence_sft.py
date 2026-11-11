#!/usr/bin/env python3
"""Original LP2 RGB/grayscale page-sequence and visible-ink source gate.

Reads only the 58 original JPEGs (archive 17.jpg..74.jpg) and optionally
their canonical red-rune/punctuation annotations. Does not decode any key,
reinterpret arbitrary mode bits, or modify source files.

Dependencies: Pillow, NumPy. Use --zip for the maintained original JPG ZIP;
otherwise the default is resources/liber-primus/ inside this repository.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import zipfile
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
EXPECTED_SOURCE_SHA256 = "37a418e0231524fda775046605a111b945c6e85becc911958512d5bc7c95608a"
EXPECTED_MODE = "RRRRRRRRRRRRRRRRGGGGGGRRGGRRGGGGRRRRRRRRRGGGGGGGGRGGGRRRRR"
EXPECTED_RED = [0, 2, 3, 6, 7, 8, 14, 15, 22, 23, 26, 27, 32, 33,
                36, 37, 38, 39, 40, 49, 53, 54, 55, 56, 57]
EXPECTED_RGB_ACHROMATIC = [1, 4, 5, 9, 10, 11, 12, 13, 34, 35]
# Visually repeated motifs, identified independently of JPEG file-mode flags.
# Cross p0-2; scrollwork p3-7; mirrored tree pp8-14;
# cuneiform header pp33-40. Each family also contains visibly red pages.
MOTIF_FAMILIES = [(0, 2, "cross"), (3, 7, "scrollwork"),
                  (8, 14, "mirrored trees"), (33, 40, "cuneiform header")]
EXPECTED_RUNS = [
    ("R", 0, 15, 16), ("G", 16, 21, 6), ("R", 22, 23, 2),
    ("G", 24, 25, 2), ("R", 26, 27, 2), ("G", 28, 31, 4),
    ("R", 32, 40, 9), ("G", 41, 48, 8), ("R", 49, 49, 1),
    ("G", 50, 52, 3), ("R", 53, 57, 5),
]


def sof_component_count(data: bytes) -> int:
    """Read JPEG SOF component count independently of Pillow decoding."""
    assert data.startswith(b"\xff\xd8")
    i = 2
    while i + 10 < len(data):
        assert data[i] == 0xFF, f"Expected JPEG marker at byte {i}"
        while data[i] == 0xFF:
            i += 1
        marker = data[i]
        i += 1
        if marker in (0xD8, 0xD9, 0x01) or 0xD0 <= marker <= 0xD7:
            continue
        seglen = int.from_bytes(data[i:i + 2], "big")
        if marker in (0xC0, 0xC1, 0xC2):
            return data[i + 7]
        assert marker != 0xDA, "Reached entropy-coded scan before SOF"
        i += seglen
    raise AssertionError("No JPEG SOF segment")


def read_source(number: int, original_dir: Path, archive: zipfile.ZipFile | None) -> bytes:
    name = f"{number:02d}.jpg"
    if archive is not None:
        return archive.read(f"liber-primus-jpegs/{name}")
    return (original_dir / name).read_bytes()


def scan(original_dir: Path, zip_path: Path | None) -> dict:
    archive = zipfile.ZipFile(zip_path) if zip_path else None
    digest = hashlib.sha256()
    pages = []
    try:
        for number in range(17, 75):
            source = read_source(number, original_dir, archive)
            digest.update(number.to_bytes(2, "big"))
            digest.update(len(source).to_bytes(8, "big"))
            digest.update(source)
            count = sof_component_count(source)
            with Image.open(io.BytesIO(source)) as im:
                assert im.size == (2400, 3600)
                mode = "R" if count == 3 else "G"
                assert (im.mode, count) in (("RGB", 3), ("L", 1))
                red_count = 0
                max_spread = 0
                if count == 3:
                    rgb = np.asarray(im)
                    r = rgb[:, :, 0].astype(np.int16)
                    g = rgb[:, :, 1].astype(np.int16)
                    b = rgb[:, :, 2].astype(np.int16)
                    max_spread = max(int(np.max(np.abs(r - g))),
                                     int(np.max(np.abs(r - b))),
                                     int(np.max(np.abs(g - b))))
                    # Strong visible-red ink, above JPEG near-gray fringes.
                    red_count = int(np.count_nonzero(
                        (r - g > 18) & (r - b > 18) & (r > 55)))
                pages.append(dict(page=number - 17, image=number,
                                  components=count, mode=mode,
                                  max_spread=max_spread, red_pixels=red_count,
                                  jpeg_sha256=hashlib.sha256(source).hexdigest()))
    finally:
        if archive:
            archive.close()

    actual_mode = "".join(p["mode"] for p in pages)
    red_pages = [p["page"] for p in pages if p["red_pixels"] > 0]
    achromatic = [p["page"] for p in pages if p["mode"] == "R" and p["max_spread"] <= 5]
    runs = []
    start = 0
    for i in range(1, len(actual_mode) + 1):
        if i == len(actual_mode) or actual_mode[i] != actual_mode[start]:
            runs.append((actual_mode[start], start, i - 1, i - start))
            start = i
    transitions = [i for i in range(1, len(actual_mode))
                   if actual_mode[i] != actual_mode[i - 1]]

    assert digest.hexdigest() == EXPECTED_SOURCE_SHA256
    assert actual_mode == EXPECTED_MODE
    assert Counter(actual_mode) == {"R": 35, "G": 23}
    assert red_pages == EXPECTED_RED
    motif_pages = {i for start, stop, _ in MOTIF_FAMILIES
                   for i in range(start, stop + 1)}
    visible_ink_and_repeated_art_model = "".join(
        "R" if i in red_pages or i in motif_pages else "G" for i in range(58))
    assert visible_ink_and_repeated_art_model == actual_mode
    assert sorted(motif_pages - set(red_pages)) == EXPECTED_RGB_ACHROMATIC
    assert achromatic == EXPECTED_RGB_ACHROMATIC
    assert runs == EXPECTED_RUNS
    assert all(p["red_pixels"] == 0 for p in pages if p["mode"] == "G")
    assert all(p["max_spread"] <= 5 for p in pages if p["page"] in achromatic)
    assert all(p["max_spread"] >= 199 for p in pages if p["page"] in red_pages)

    annotations_path = ROOT / "resources/liber-primus/lp2-ink-annotations.json"
    annotation_red = []
    red_rune_start_pages = []
    if annotations_path.exists():
        annotations = json.loads(annotations_path.read_text(encoding="utf-8"))
        annotation_red = [q["page"] for q in annotations["pages"]
                          if q.get("red_spans") or any(
                              punct[2] == "red" for punct in q.get("large_punctuation", []))]
        red_rune_start_pages = [
            q["page"] for q in annotations["pages"]
            if any(span["start"] == 0 for span in q.get("red_spans", []))]
        assert not set(transitions).intersection(red_rune_start_pages)
        # p37's red characters are the visible numbered list 2,3,4,
        # outside the annotation's red-rune/punctuation scope.
        assert set(red_pages) - set(annotation_red) == {37}
        assert set(annotation_red) - set(red_pages) == set()

    return dict(source_sha256=digest.hexdigest(), mode=actual_mode,
                runs=runs, transitions=transitions, red_pages=red_pages,
                rgb_achromatic_pages=achromatic, annotation_red_pages=annotation_red,
                motif_families=MOTIF_FAMILIES,
                red_rune_start_pages=red_rune_start_pages,
                transitions_that_are_red_rune_starts=[],
                source_visual_model_matches_58_of_58=True,
                pages=pages, total_rgb=35, total_grayscale=23,
                all_red_pages_are_rgb=True, solved_controls={56: "R", 57: "R"})


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", type=Path, default=None,
                        help="Original archive with liber-primus-jpegs/17.jpg...74.jpg")
    parser.add_argument("--original-dir", type=Path,
                        default=ROOT / "resources/liber-primus")
    args = parser.parse_args()
    result = scan(args.original_dir, args.zip)
    print(json.dumps({k: v for k, v in result.items() if k != "pages"},
                     indent=2, sort_keys=True))
    print("PAGES", json.dumps(result["pages"], separators=(",", ":")))


if __name__ == "__main__":
    main()
