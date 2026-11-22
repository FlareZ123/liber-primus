#!/usr/bin/env python3
"""Source-image and ciphertext test of the six repeated Babylonian headers.

Original scans 51.jpg through 56.jpg are six LP2 headers, while the image
preceding them (50.jpg) places the motif below its text. This test asks
whether base 60 and the depicted integer 3301 explain the known six-step
word-local affine echo: c[i] = (3301 - 60*c[i-6]) mod 29.

Node/GUI/OCR and language models are not used. Pillow is needed for the
source-image identity test. All research inputs are read-only.

Usage: python sims/cuneiform_affine_anchor.py
"""
from __future__ import annotations

import bisect
import hashlib
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGE = ROOT / "resources" / "liber-primus"
TRANSCRIPTION = ROOT / "resources" / "lp2-transcription.txt"
CORPUS = IMAGE / "lp2-corpus.json"
RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
VALUE = {rune: i for i, rune in enumerate(RUNES)}
BOUNDS = (850, 140, 1600, 560)  # native 2400x3600, header only


def physical_headers() -> dict:
    seen = []
    for scan in range(51, 57):
        with Image.open(IMAGE / f"{scan:02}.jpg") as original:
            if original.size != (2400, 3600):
                raise AssertionError("Unexpected original source dimensions")
            patch = original.convert("L").crop(BOUNDS)
            seen.append({
                "scan": scan,
                "lp2_page": scan - 17,
                "sha256_decoded_gray_patch": hashlib.sha256(patch.tobytes()).hexdigest(),
                "black_ink_pixels_below_120": sum(v < 120 for v in patch.getdata()),
            })
    if len({entry["sha256_decoded_gray_patch"] for entry in seen}) != 1:
        raise AssertionError("Six top-of-page numeral motifs differ at the pixel level")
    if len({entry["black_ink_pixels_below_120"] for entry in seen}) != 1:
        raise AssertionError("Unexpected inconsistency in source-image measurements")
    return {"crop_xyxy": BOUNDS, "identical_header_patches": seen}


def parse() -> tuple[list[list[int]], list[int], list[tuple[int, int]], str]:
    raw = TRANSCRIPTION.read_text(encoding="utf-8")
    data = "".join(raw.split("%")[:55])
    data = re.sub(r"/\s*\n", "", data)
    words = []
    for section in data.split("$"):
        for token in re.split(r"[-.&\s]+", section):
            word = [VALUE[c] for c in token if c in VALUE]
            if word:
                words.append(word)
    if len(words) != 2896 or sum(map(len, words)) != 12956:
        raise AssertionError("Original 55-page whole-word corpus changed")
    repository = json.loads(CORPUS.read_text(encoding="utf-8"))
    pages = [p for p in repository["pages"]
             if p["page"] <= 55 and p["indices"]]
    flat = [x for word in words for x in word]
    if flat != [x for page in pages for x in page["indices"]]:
        raise AssertionError("Text-based and independently stored page rune order differs")
    cuts, total = [], 0
    for page in pages:
        total += len(page["indices"])
        cuts.append((total, page["page"]))
    return words, flat, cuts, hashlib.sha256(raw.encode("utf-8")).hexdigest()


def screen(words: list[list[int]], cutoffs: list[tuple[int, int]]) -> dict:
    choices = {(number, sign): {lag: {"hits": 0, "opportunities": 0}
                                for lag in range(2, 10)}
               for number in (3301, 1033) for sign in (-1, 1)}
    page_count = {page: {"opportunities": 0, "hits": 0}
                  for _, page in cutoffs}
    ends = [end for end, _ in cutoffs]
    absolute_start = 0
    for word in words:
        for lag in range(2, 10):
            for pos in range(lag, len(word)):
                old, observed = word[pos - lag], word[pos]
                for (number, sign), by_lag in choices.items():
                    score = by_lag[lag]
                    score["opportunities"] += 1
                    score["hits"] += int(observed == (number + sign * 60 * old) % 29)
                if lag == 6:
                    page = cutoffs[bisect.bisect_right(ends, absolute_start + pos)][1]
                    row = page_count[page]
                    row["opportunities"] += 1
                    row["hits"] += int(observed == (3301 - 60 * old) % 29)
        absolute_start += len(word)
    if absolute_start != 12956:
        raise AssertionError("Ciphertext length changed")
    if choices[(3301, -1)][6] != {"hits": 80, "opportunities": 1290}:
        raise AssertionError("Expected source lag-six evidence changed")
    if [choices[key][6]["hits"] for key in
        ((3301, 1), (1033, -1), (1033, 1))] != [34, 38, 45]:
        raise AssertionError("Expected source numeral/sign contrasts changed")
    return {
        "clue_reduction": {
            "3301_mod29": 3301 % 29,
            "1033_mod29": 1033 % 29,
            "base60_mod29": 60 % 29,
            "exact_29_symbol_equivalence": all(
                (3301 - 60 * x) % 29 == (24 - 2 * x) % 29
                for x in range(29)),
        },
        "clue_readings": {
            f"{n}{'minus' if s == -1 else 'plus'}60x": values
            for (n, s), values in choices.items()},
        "motif_window_lp2_33_to_39": {
            "opportunities": sum(page_count[p]["opportunities"]
                                 for p in range(33, 40)),
            "hits": sum(page_count[p]["hits"] for p in range(33, 40))},
        "outside_motif_window": {
            "opportunities": sum(v["opportunities"] for p, v in page_count.items()
                                 if p < 33 or p > 39),
            "hits": sum(v["hits"] for p, v in page_count.items()
                        if p < 33 or p > 39)},
    }


def main() -> None:
    headers = physical_headers()
    words, _, cuts, source_sha256 = parse()
    result = screen(words, cuts)
    print(json.dumps({
        "status": "Exploratory clue-to-existing-ciphertext relation; NOT a decryption",
        "source_transcript_sha256": source_sha256,
        "complete_words": len(words),
        "whole_word_runes": sum(map(len, words)),
        "headers": headers,
        **result,
        "caveat": "Formula and six-step comparison were noticed after prior "
                  "ciphertext discovery of the same affine anomaly. Nearby "
                  "readings and lag choices are retrospective; this is a "
                  "clue-compatible hypothesis, not independent cryptographic proof.",
    }, indent=2))


if __name__ == "__main__":
    main()
