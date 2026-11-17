#!/usr/bin/env python3
"""Source-only audit of the seven 224-pixel LP2 extra-leading events.

Run: python sims/lp2_line_extra_leading_source_sft.py
Or: python sims/lp2_line_extra_leading_source_sft.py --zip liber-primus-jpegs.zip
Requires numpy, Pillow, the canonical original JPEGs and transcript.
"""
import argparse
import json
from collections import Counter
from pathlib import Path

import numpy as np

from lp2_line_geometry_gate import bands_and_boxes, image_reader

RUNES = frozenset("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
EXPECTED_GAPS = ((4, 7), (10, 7), (21, 1), (41, 9), (42, 2), (42, 5), (43, 0))


def join_type(left, right):
    if left[-1] == "-" or right[0] == "-":
        return "separator"
    if left[-1] in RUNES and right[0] in RUNES:
        return "within_word"
    if left[-1] == "." or right[0] == ".":
        return "punctuation"
    return "other"


def audit(zip_path=None):
    root = Path(__file__).resolve().parent.parent
    corpus = (root / "resources/liber-primus/lp2-transcription.txt").read_text(encoding="utf-8")
    source_pages = corpus.split("%")
    assert len(source_pages) == 57, "Physical p50 has no rune transcription"
    read_image = image_reader(zip_path)
    clean_pages, records = [], []
    solved_control_bands = {}
    for page in range(58):
        pixels = np.asarray(read_image(page))
        assert pixels.shape == (3600, 2400), page
        boxes, _ = bands_and_boxes(pixels)
        if page in (56, 57):
            solved_control_bands[page] = len(boxes)
        if len(boxes) != 12 or any(
            not (109 <= y1 - y0 + 1 <= 117 and 597 <= x0 <= 608)
            for x0, _, y0, y1 in boxes
        ):
            continue
        clean_pages.append(page)
        page_index = page if page < 50 else page - 1
        lines = [
            line.replace("\n", "").replace("\r", "")
            for line in source_pages[page_index].split("/")
        ]
        lines = [line for line in lines if any(c in RUNES for c in line)]
        assert len(lines) == 12, (page, len(lines))
        for i in range(11):
            left, right = boxes[i], boxes[i + 1]
            pitch = right[2] - left[2]
            assert pitch in (188, 189, 224), (page, i, pitch)
            left_run, right_run = lines[i], lines[i + 1]
            records.append({
                "page": page,
                "line_before": i + 1,
                "line_after": i + 2,
                "pitch_px": pitch,
                "join": join_type(left_run, right_run),
                "preceding_text": left_run[-18:],
                "following_text": right_run[:18],
                "punctuation_within_8": "." in (left_run[-8:] + right_run[:8]),
                "x_before_after": [left[0], right[0]],
            })
    counts = Counter(row["pitch_px"] for row in records)
    extra = [row for row in records if row["pitch_px"] == 224]
    normal = [row for row in records if row["pitch_px"] != 224]
    assert len(clean_pages) == 29
    assert counts == Counter({188: 231, 189: 81, 224: 7})
    assert [(x["page"], x["line_before"] - 1) for x in extra] == list(EXPECTED_GAPS)
    assert Counter(x["join"] for x in extra) == Counter({
        "within_word": 4, "separator": 2, "punctuation": 1,
    })
    assert len(normal) == 312
    return {
        "clean_pages": clean_pages,
        "pitch_counts": dict(sorted(counts.items())),
        "normal_join_counts": dict(Counter(x["join"] for x in normal)),
        "extra_join_counts": dict(Counter(x["join"] for x in extra)),
        "exploratory_punctuation_within_8": {
            "extra": sum(x["punctuation_within_8"] for x in extra),
            "normal": sum(x["punctuation_within_8"] for x in normal),
            "warning": "The 8-rune proximity rule was chosen after viewing events.",
        },
        "extra_events": extra,
        "solved_control_detected_bands": solved_control_bands,
        "conclusion": "Four extra gaps divide uninterrupted words; seven paragraph starts are excluded.",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", default=None)
    args = parser.parse_args()
    print(json.dumps(audit(args.zip), indent=2, ensure_ascii=False))
