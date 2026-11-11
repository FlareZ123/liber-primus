#!/usr/bin/env python3
"""Verify the source-visible LP2 word-token contract at four disputed cuts.

Run from a repository checkout:
    python sims/lp2_visual_token_contract_sft.py
Requires numpy and opencv-python-headless.
"""
from __future__ import annotations

from hashlib import sha256
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "resources" / "liber-primus"
TRANSCRIPTION = IMAGES / "lp2-transcription.txt"
HISTORICAL = ROOT / "resources" / "transcriptions" / "lp2_krisyotam_2017.txt"
CORPUS = IMAGES / "lp2-corpus.json"
SHA256SUMS = IMAGES / "SHA256SUMS.txt"
RUNIC = range(0x16A0, 0x1700)

TARGETS = [
    {"page": 4, "local_cut": 164, "global_cut": 1110, "archive": 21,
     "line": 7, "crop": (250, 1970, 2150, 2120), "components": 6,
     "word": "ᛗᛉᛁᚹ", "legacy_wrong_archive": 4},
    {"page": 21, "local_cut": 36, "global_cut": 5138, "archive": 38,
     "line": 1, "crop": (250, 840, 2150, 990), "components": 4,
     "word": "ᚫᚩᚣ", "legacy_wrong_archive": 21},
    {"page": 35, "local_cut": 80, "global_cut": 8515, "archive": 52,
     "line": 3, "crop": (250, 1218, 2150, 1368), "components": 7,
     "word": "ᛈᛖᛏ", "legacy_wrong_archive": 35},
    {"page": 41, "local_cut": 218, "global_cut": 10089, "archive": 58,
     "line": 9, "crop": (250, 2570, 2150, 2720), "components": 5,
     "word": "ᛉᛚᛄᚳ", "legacy_wrong_archive": 41},
]


def is_rune(ch: str) -> bool:
    return ord(ch) in RUNIC


def checksum_manifest() -> dict[str, str]:
    result = {}
    for line in SHA256SUMS.read_text(encoding="utf-8").splitlines():
        digest, name = line.split(maxsplit=1)
        result[name.lstrip("* ")] = digest
    return result


def parse_words(raw: str) -> list[dict]:
    page_segments = raw.split("%")[:55]
    stream = "%".join(page_segments)
    words = []
    current = []
    start = 0
    offset = 0
    for ch in stream:
        if is_rune(ch):
            if not current:
                start = offset
            current.append(ch)
            offset += 1
        elif ch == "%" or ch == "/" or ch.isspace():
            continue
        elif current:
            words.append({"start": start, "end": offset, "runes": "".join(current)})
            current = []
    if current:
        words.append({"start": start, "end": offset, "runes": "".join(current)})
    assert offset == 12956
    assert len(words) == 2896
    return words


def gap_at_rune_offset(raw: str, cut: int) -> str:
    stream = "%".join(raw.split("%")[:55])
    rune_count = 0
    previous_rune_pos = None
    for pos, ch in enumerate(stream):
        if not is_rune(ch):
            continue
        if rune_count == cut:
            assert previous_rune_pos is not None
            return stream[previous_rune_pos + 1:pos]
        rune_count += 1
        previous_rune_pos = pos
    raise AssertionError(cut)


def line_for_local_cut(page_text: str, local_cut: int) -> tuple[int, str]:
    start = 0
    for index, line in enumerate(page_text.split("/")):
        count = sum(is_rune(ch) for ch in line)
        if start < local_cut < start + count:
            return index, line.strip()
        start += count
    raise AssertionError(local_cut)


def small_square_components(image: np.ndarray, crop: tuple[int, int, int, int]) -> list[list[int]]:
    x0, y0, x1, y1 = crop
    region = image[y0:y1, x0:x1]
    mask = (np.max(region, axis=2) < 105).astype(np.uint8)
    count, _, boxes, _ = cv2.connectedComponentsWithStats(mask, 8)
    found = []
    for i in range(1, count):
        x, y, w, h, area = map(int, boxes[i])
        if 6 <= w <= 12 and 6 <= h <= 12 and 40 <= area <= 130:
            found.append([x + x0, y + y0, w, h, area])
    return sorted(found, key=lambda row: (row[1], row[0]))


def main() -> None:
    current_raw = TRANSCRIPTION.read_text(encoding="utf-8")
    historical_raw = HISTORICAL.read_text(encoding="utf-8")
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    words = parse_words(current_raw)
    sums = checksum_manifest()
    page_segments = current_raw.split("%")[:55]
    page_starts = {}
    total = 0
    for page in corpus["pages"]:
        if page["page"] > 55:
            continue
        page_starts[page["page"]] = total
        total += page["runic_count"]
    assert total == 12956

    rows = []
    for target in TARGETS:
        page = target["page"]
        assert target["archive"] == page + 17
        assert page_starts[page] + target["local_cut"] == target["global_cut"]
        word = next(w for w in words if w["start"] < target["global_cut"] < w["end"])
        assert word["runes"] == target["word"]
        assert gap_at_rune_offset(current_raw, target["global_cut"]) == ""
        assert gap_at_rune_offset(historical_raw, target["global_cut"]) == ""
        line_index, line = line_for_local_cut(page_segments[page], target["local_cut"])
        assert line_index == target["line"]
        expected_components = line.count("-") + 4 * line.count(".")
        assert expected_components == target["components"]

        image_path = IMAGES / f"{target['archive']:02d}.jpg"
        raw = image_path.read_bytes()
        assert sha256(raw).hexdigest() == sums[image_path.name]
        image = cv2.imread(str(image_path))
        assert image is not None and image.shape[:2] == (3600, 2400)
        components = small_square_components(image, target["crop"])
        assert len(components) == expected_components
        rows.append({
            "physical_page": page,
            "correct_archive_jpg": target["archive"],
            "legacy_wrong_archive_jpg": target["legacy_wrong_archive"],
            "global_rune_cut": target["global_cut"],
            "canonical_word": target["word"],
            "transcript_internal_gap": "",
            "historical_2017_internal_gap": "",
            "canonical_line_punctuation_components": expected_components,
            "observed_separator_sized_components": len(components),
            "component_bboxes_xywh_area": components,
        })

    summary = {
        "classification": "source-visible token contract selected; four alleged internal dots falsified",
        "canonical_unsolved_runes": 12956,
        "canonical_unsolved_words": len(words),
        "source_visible_extra_internal_separators_at_disputed_cuts": 0,
        "selected_visual_token_count": len(words),
        "retired_synthetic_split_count": len(words) + 4,
        "page_to_archive_rule": "LP2 physical page N is archive scan N+17",
        "targets": rows,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
