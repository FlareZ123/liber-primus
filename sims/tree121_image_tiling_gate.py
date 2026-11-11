"""Source-locked 2016-image pixel grid test for LP2 physical page 32.

The eleven top-row GP primes of p32 sum to image width 563, and the
eleven left-column primes sum to height 569. Those numbers are read as
successive widths/heights of 121 nonuniform image tiles. This program
tests one non-cryptographic consequence: their internal strip boundaries
would tend to avoid bright signed-image text strokes if the tiling were
designed to segment the printed text.

The null permutes the ten non-initial widths and heights independently,
keeping the shared top-left GP prime 73 fixed. Its output does not
license a cipher claim and cannot exclude a non-text picture encoding.
"""

import json
import random
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
SOURCE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
TRIALS = 100_000
SEED = 0x20161132
LUMINANCE_THRESHOLD = 180
BAND_RADIUS = 1


def cut_positions(widths):
    """Return the internal cumulative axis cuts, excluding 0 and image edge."""
    edges = []
    p = 0
    for w in widths[:-1]:
        p += w
        edges.append(p)
    return edges


def boundary_cost(cuts, scores):
    """Total bright-stroke coverage at each internal axis cut."""
    return sum(scores[cut] for cut in cuts)


def main():
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    square = [corpus["prime"][i] for i in corpus["pages"][32]["indices"]]
    assert len(square) == 121
    xwidth = square[:11]
    yheight = square[::11]
    assert xwidth == [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]
    assert yheight == [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]
    assert sum(xwidth) == 563 and sum(yheight) == 569

    image = Image.open(SOURCE).convert("L")
    assert image.size == (563, 569)
    width, height = image.size
    pixels = image.load()
    # The signed JPEG contains white writing on a dark background.
    bright = [[int(pixels[x, y] >= LUMINANCE_THRESHOLD)
               for x in range(width)] for y in range(height)]
    xline = [sum(bright[y][x] for y in range(height)) for x in range(width)]
    yline = [sum(bright[y]) for y in range(height)]

    # Avoid arbitrarily selecting a stroke-avoidance threshold after scoring.
    xscore = [
        sum(xline[k] for k in range(max(0, x - BAND_RADIUS),
                                   min(width - 1, x + BAND_RADIUS) + 1))
        for x in range(width)
    ]
    yscore = [
        sum(yline[k] for k in range(max(0, y - BAND_RADIUS),
                                   min(height - 1, y + BAND_RADIUS) + 1))
        for y in range(height)
    ]
    xcuts = cut_positions(xwidth)
    ycuts = cut_positions(yheight)
    real_x = boundary_cost(xcuts, xscore)
    real_y = boundary_cost(ycuts, yscore)
    real_total = real_x + real_y

    randomizer = random.Random(SEED)
    null_low_x = null_low_y = null_low_both = 0
    totals_x = totals_y = totals_both = 0
    minimum = float("inf")
    maximum = 0
    # First source value is fixed because the two axes share the top-left rune.
    for _ in range(TRIALS):
        candidate_x = xwidth[1:].copy()
        candidate_y = yheight[1:].copy()
        randomizer.shuffle(candidate_x)
        randomizer.shuffle(candidate_y)
        score_x = boundary_cost(cut_positions([xwidth[0], *candidate_x]), xscore)
        score_y = boundary_cost(cut_positions([yheight[0], *candidate_y]), yscore)
        score = score_x + score_y
        totals_x += score_x
        totals_y += score_y
        totals_both += score
        null_low_x += int(score_x <= real_x)
        null_low_y += int(score_y <= real_y)
        null_low_both += int(score <= real_total)
        minimum = min(minimum, score)
        maximum = max(maximum, score)

    result = {
        "classification": "conditional source-visible text-gutter gate only",
        "source_image": "resources/historical/cicada2016-4gq25.jpg",
        "source_page": 32,
        "image_size": [width, height],
        "xwidth": xwidth,
        "yheight": yheight,
        "xcuts": xcuts,
        "ycuts": ycuts,
        "threshold": LUMINANCE_THRESHOLD,
        "cut_half_band_px": BAND_RADIUS,
        "original_stroke_intersections": {
            "x": real_x, "y": real_y, "combined": real_total
        },
        "null": {
            "trials": TRIALS,
            "seed": hex(SEED),
            "first_width_height_fixed": 73,
            "mean_x": totals_x / TRIALS,
            "mean_y": totals_y / TRIALS,
            "mean_combined": totals_both / TRIALS,
            "minimum_combined": minimum,
            "maximum_combined": maximum,
            "low_stroke_tail_x": (null_low_x + 1) / (TRIALS + 1),
            "low_stroke_tail_y": (null_low_y + 1) / (TRIALS + 1),
            "low_stroke_tail_combined": (null_low_both + 1) / (TRIALS + 1),
        },
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
