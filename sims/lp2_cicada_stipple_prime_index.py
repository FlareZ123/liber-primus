#!/usr/bin/env python3
"""Reproduce the p57 cicada stipple count and its provisional prime-index pointer.

Run from the repository root:
    python sims/lp2_cicada_stipple_prime_index.py

This is a source-observation reproducer, not a cipher decoder. It verifies the
original-image component counts, the prime ordinals, and the selected archive
image/page mapping, then checks the exact cross-artifact count relations. The
prime-ordinal-to-filename interpretation remains a hypothesis.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"
IMAGE = IMAGE_DIR / "74.jpg"
CORPUS = IMAGE_DIR / "lp2-corpus.json"
GRID = IMAGE_DIR / "base60-grid.json"
INK = IMAGE_DIR / "lp2-ink-annotations.json"
ONION7_HTML = ROOT / "resources" / "cicada2014-onion7-index.html"
TRANSCRIPTION = ROOT / "resources" / "lp2-transcription.txt"
RUNIC = re.compile(r"[\u16A0-\u16FF]")
LP2_FIRST_IMAGE = 17
PARABLE_FIRST_SENTENCE_WORDS = 7
PARABLE_BODY_SENTENCES = 3


def prime_ordinal(n: int) -> int:
    """Return the one-based ordinal of n, requiring n to be prime."""
    if n < 2:
        raise ValueError(n)
    count = 0
    for candidate in range(2, n + 1):
        if all(candidate % d for d in range(2, int(candidate**0.5) + 1)):
            count += 1
            if candidate == n:
                return count
    raise ValueError(f"{n} is not prime")


def rune_count(s: str) -> int:
    return len(RUNIC.findall(s))


def main() -> None:
    raw = IMAGE.read_bytes()
    image = cv2.imread(str(IMAGE), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Could not read {IMAGE}")
    height, width = image.shape[:2]
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    x0, y0, x1, y1 = 350, 1900, 2050, 3450
    crop = gray[y0:y1, x0:x1]
    threshold_counts = {}
    threshold_100 = None
    for threshold in range(40, 201):
        count, _, stats, centroids = cv2.connectedComponentsWithStats(
            (crop < threshold).astype(np.uint8), connectivity=8
        )
        threshold_counts[threshold] = count - 1
        if threshold == 100:
            threshold_100 = (stats, centroids)
    if set(threshold_counts.values()) != {574}:
        raise AssertionError(f"Threshold component counts vary: {threshold_counts}")

    stats, centroids = threshold_100
    areas = stats[1:, cv2.CC_STAT_AREA]
    largest_idx = np.argsort(areas)[-2:]
    largest_areas = sorted((int(areas[i]) for i in largest_idx), reverse=True)
    keep = np.ones(len(areas), dtype=bool)
    keep[largest_idx] = False
    small_x = centroids[1:, 0][keep] + x0
    left = int(np.count_nonzero(small_x < width / 2))
    right = int(np.count_nonzero(small_x >= width / 2))
    small_count = int(np.count_nonzero(keep))

    left_prime_index = prime_ordinal(left)
    right_prime_index = prime_ordinal(right)
    image_files = sorted(IMAGE_DIR.glob("[0-9][0-9].jpg"))
    image_count = len(image_files)
    onion_html = ONION7_HTML.read_text(encoding="utf-8")
    onion_indices = [int(m.group(1)) for m in re.finditer(
        r"<img\b[^>]*\bsrc\s*=\s*['\"](\d+)\.jpg", onion_html, re.I
    )]
    onion_div_331 = bool(re.search(r"<div\s+id\s*=\s*['\"]331['\"]", onion_html, re.I))
    selected = {
        "241": {
            "prime_ordinal": left_prime_index,
            "onion7_image": 53,
            "onion7_image_exists": 53 in onion_indices,
            "onion7_physical_page": 53,
            "full_bundle_file": 70,
        },
        "331": {
            "prime_ordinal": right_prime_index,
            "onion7_div_id_331_exists": onion_div_331,
            "onion7_image_67_exists": 67 in onion_indices,
        },
        "alternate_full_bundle_numbering": {
            "image_53_exists": (IMAGE_DIR / "53.jpg").is_file(),
            "image_67_exists": (IMAGE_DIR / "67.jpg").is_file(),
            "image_53_lp2_physical_page": 53 - LP2_FIRST_IMAGE,
            "image_67_lp2_physical_page": 67 - LP2_FIRST_IMAGE,
        },
    }

    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    grid = json.loads(GRID.read_text(encoding="utf-8"))
    ink = json.loads(INK.read_text(encoding="utf-8"))
    pages_by_number = {p["page"]: p for p in corpus["pages"]}
    p36_runes = int(pages_by_number[36]["runic_count"])
    p50_status = pages_by_number[50]["status"]
    ink_pages_by_number = {p["page"]: p for p in ink["pages"]}
    p53_red_lengths = [s["length"] for s in ink_pages_by_number[53].get("red_spans", [])]
    red51 = 51 in p53_red_lengths
    mark_count = int(ink["counts"]["red13"] + ink["counts"]["black13"])
    p36_ten_dots = any(int(mark[0]) == 99 and int(mark[1]) == 10 for mark in ink_pages_by_number[36].get("large_punctuation", []))
    p38_ten_dots = any(int(mark[0]) == 186 and int(mark[1]) == 10 for mark in ink_pages_by_number[38].get("large_punctuation", []))
    table_shape = (len(grid["byte_rows"]), len(grid["byte_rows"][0]))
    table_cells = sum(len(row) for row in grid["byte_rows"])

    text_pages = TRANSCRIPTION.read_text(encoding="utf-8").split("%")
    p36_count, p37_count, p38_count = map(rune_count,
        (text_pages[36], text_pages[37], text_pages[38]))
    span_length = (p36_count - 99) + p37_count + 186

    if (width, height) != (2400, 3600):
        raise AssertionError(f"Unexpected image dimensions: {(width, height)}")
    if (small_count, left, right) != (572, 241, 331):
        raise AssertionError((small_count, left, right))
    if (left_prime_index, right_prime_index) != (53, 67):
        raise AssertionError((left_prime_index, right_prime_index))
    if not selected["241"]["onion7_image_exists"] or not selected["331"]["onion7_div_id_331_exists"]:
        raise AssertionError(f"Historical Onion7 pointer changed: {selected}")
    if not all(selected["alternate_full_bundle_numbering"][k] for k in ("image_53_exists", "image_67_exists")):
        raise AssertionError(f"Full-bundle alternative image missing: {selected}")
    if (image_count, len(onion_indices), min(onion_indices), max(onion_indices),
        p36_runes, table_shape, table_cells, mark_count, span_length, red51, p36_ten_dots, p38_ten_dots) != (
        75, 58, 0, 57, 238, (32, 8), 256, 31, 553, True, True, True
    ):
        raise AssertionError("A source count changed; review the original artifacts")

    result = {
        "source_image": {
            "path": str(IMAGE.relative_to(ROOT)),
            "sha256": hashlib.sha256(raw).hexdigest(),
            "dimensions": [width, height],
            "crop_xyxy": [x0, y0, x1, y1],
            "grayscale_thresholds": [40, 200],
            "thresholds_tested": len(threshold_counts),
            "components_at_every_threshold": 574,
            "largest_component_areas": largest_areas,
            "remaining_stipple_components": small_count,
            "midline_x": width / 2,
            "left_right": [left, right],
        },
        "prime_index_page_pointer": {
            "selected_images": selected,
            "original_image_file_count": image_count,
            "onion7_html_image_count": len(onion_indices),
            "onion7_html_image_minmax": [min(onion_indices), max(onion_indices)],
            "lp2_first_image_number_in_full_bundle": LP2_FIRST_IMAGE,
            "p36_runic_count": p36_runes,
            "p50_status": p50_status,
            "table_shape": list(table_shape),
            "table_cells": table_cells,
        },
        "other_source_counts": {
            "p53_red_span_length": 51 if red51 else None,
            "13_dot_mark_count": mark_count,
            "p36_p38_ten_dot_enclosure_runes": span_length,
            "p57_parable_first_sentence_words": PARABLE_FIRST_SENTENCE_WORDS,
            "p57_parable_body_sentences": PARABLE_BODY_SENTENCES,
        },
        "exact_arithmetic": {
            "574_equals_7_times_p53_red_span_plus_31_marks": 574 == PARABLE_FIRST_SENTENCE_WORDS * (51 + mark_count),
            "553_equals_7_times_79": span_length == PARABLE_FIRST_SENTENCE_WORDS * 79,
            "574_equals_7_times_79_plus_three_parable_sentences": 574 == PARABLE_FIRST_SENTENCE_WORDS * (79 + PARABLE_BODY_SENTENCES),
            "574_equals_553_plus_21": 574 == span_length + 21,
        },
        "classification": "reproducible source observation; prime-ordinal page navigation is provisional; no plaintext or key recovered",
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
