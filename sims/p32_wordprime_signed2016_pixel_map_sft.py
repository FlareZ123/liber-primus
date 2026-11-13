#!/usr/bin/env python3
"""Source-fixed GP-prime word-coordinate reading of the signed 2016 JPEG.

LP2 physical p32 contains 22 printed words and exactly 121 runes. Its
independently known 11x11 prime-axis sums match the signed 2016 image's
563x569 dimensions. Under the signed message's "words are the map" clue,
this tests one literal mapping: pair successive printed p32 GP-prime word
sums as (x,y) pixel coordinates, origin at the upper left. No modular
reduction, key search, coordinate wrap, direction changes or fitted origin.

The sole acceptance cue is a white text pixel (grayscale >=180), using
the previously source-fixed image-text threshold. A permutation control
randomly pairs the same exact 22 word sums, preserving the one invalid
coordinate and the marginal number distribution. This is a navigation
diagnostic, never evidence of plaintext without an independently legible
or cryptographically reproducible output.
"""
from __future__ import annotations

import json
import random
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
TEXT = ROOT / "resources/lp2-transcription.txt"
IMAGE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
THRESHOLD = 180
TRIALS = 20000
SEED = 0x20261113
EXPECTED = [
    73, 125, 267, 613, 191, 184, 14, 540, 458, 535, 183,
    442, 196, 497, 160, 446, 98, 203, 96, 348, 160, 216,
]


def positions(sums: list[int], pixels, width: int, height: int) -> tuple[int, list[dict]]:
    records = []
    hits = 0
    for pair in range(len(sums) // 2):
        x, y = sums[2 * pair:2 * pair + 2]
        valid = x < width and y < height
        light = pixels[x, y] if valid else None
        hit = valid and light >= THRESHOLD
        hits += hit
        records.append({
            "pair": pair + 1, "word_ordinals": [2 * pair + 1, 2 * pair + 2],
            "xy": [x, y], "valid": valid, "grayscale": light,
            "white_text_pixel": hit,
        })
    return hits, records


def main() -> None:
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    pages = TEXT.read_text(encoding="utf-8").strip().split("\n%\n")
    assert len(pages) == 57
    runes = set(corpus["runes"])
    chunks = re.split(r"[-.]", pages[32])
    words = [[r for r in chunk if r in runes] for chunk in chunks]
    words = [w for w in words if w]
    indices = [[corpus["runes"].index(r) for r in word] for word in words]
    page32 = next(p["indices"] for p in corpus["pages"] if p["page"] == 32)
    assert len(words) == 22
    assert [i for word in indices for i in word] == page32
    sums = [sum(corpus["prime"][i] for i in word) for word in indices]
    assert sums == EXPECTED
    assert sum(corpus["prime"][i] for i in page32[:11]) == 563
    assert sum(corpus["prime"][page32[11 * row]] for row in range(11)) == 569

    image = Image.open(IMAGE).convert("L")
    width, height = image.size
    assert (width, height) == (563, 569)
    pixels = image.load()
    observed, records = positions(sums, pixels, width, height)
    assert sum(record["valid"] for record in records) == 10
    assert records[1]["xy"] == [267, 613] and not records[1]["valid"]

    rng = random.Random(SEED)
    histogram = [0] * 12
    at_least_observed = 0
    for _ in range(TRIALS):
        shuffle = sums.copy()
        rng.shuffle(shuffle)
        count, _ = positions(shuffle, pixels, width, height)
        histogram[count] += 1
        at_least_observed += count >= observed

    image_white = sum(
        pixels[x, y] >= THRESHOLD
        for y in range(height)
        for x in range(width)
    )
    result = {
        "source": "signed 2016 original JPEG and original LP2 physical p32 words",
        "model": "successive GP-prime-sum word pairs as unmodified x,y pixel addresses",
        "image_wh": [width, height],
        "threshold_for_visible_white_text": THRESHOLD,
        "image_white_pixel_fraction": image_white / (width * height),
        "all_22_word_sums": sums,
        "usable_points": 10,
        "observed_white_points": observed,
        "observed_binary": "".join(
            "1" if r["white_text_pixel"] else "0" if r["valid"] else "?"
            for r in records
        ),
        "word_coordinate_records": records,
        "same_sum_random_pairing_null": {
            "trials": TRIALS, "seed": hex(SEED),
            "white_hit_histogram_0_to_11": histogram,
            "at_least_observed": at_least_observed,
            "empirical_upper_tail": (at_least_observed + 1) / (TRIALS + 1),
        },
        "interpretation": (
            "Coordinates with x or y outside the signed image invalidate a strict "
            "complete-map reading. White-pixel enrichment is a conditional "
            "navigation cue only; a positive needs a source-selected readout "
            "that recovers independently recognizable text or cipher key."
        ),
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
