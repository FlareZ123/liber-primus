#!/usr/bin/env python3
"""Project visible words in the signed 2016 JPEG onto the source-derived p32 tile map.

The original p32 11x11 rune square supplies successive GP-prime strip widths
and heights that exactly sum to the signed 2016 image size 563x569.  This
test uses the visible signed-message words themselves as point locations:
each word's bounding-box center selects one source tile, whose p32 rune is
then read in normal visual word order.

No OCR, cipher key, image rescaling, threshold sweep, tile permutation, or
output fitting is used.  The white-text threshold 180 is inherited from the
existing source-image tiling gate.  Within each known source line, the exact
word count fixes the largest blank-column gaps used as word separators.
"""

from __future__ import annotations

import json
from bisect import bisect_right
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
IMAGE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
THRESHOLD = 180

SOURCE_LINES = [
    "Hello.",
    "The path lies empty; epiphany seeks the devoted.",
    "Liber Primus is the way. Its words are the map, their",
    "meaning is the road, and their numbers are the direction.",
    "Seek and you will be found.",
    "Good luck.",
    "3301",
    "Beware false paths. Verify OpenPGP 7A35090F.",
]


def runs(values: list[int], max_gap: int = 0) -> list[tuple[int, int]]:
    """Return inclusive runs, optionally closing tiny gaps between positions."""
    if not values:
        return []
    out: list[tuple[int, int]] = []
    start = previous = values[0]
    for value in values[1:]:
        if value - previous - 1 > max_gap:
            out.append((start, previous))
            start = value
        previous = value
    out.append((start, previous))
    return out


def cumulative(values: list[int]) -> list[int]:
    result = [0]
    for value in values:
        result.append(result[-1] + value)
    return result


def main() -> None:
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    page32 = next(page["indices"] for page in corpus["pages"] if page["page"] == 32)
    assert len(page32) == 121
    prime = corpus["prime"]

    widths = [prime[index] for index in page32[:11]]
    heights = [prime[page32[11 * row]] for row in range(11)]
    assert widths == [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]
    assert heights == [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]
    assert sum(widths) == 563 and sum(heights) == 569
    x_edges, y_edges = cumulative(widths), cumulative(heights)

    image = Image.open(IMAGE).convert("L")
    assert image.size == (563, 569)
    pixels = image.load()
    width, height = image.size

    bright_by_row = [
        sum(pixels[x, y] >= THRESHOLD for x in range(width))
        for y in range(height)
    ]
    active_rows = [y for y, count in enumerate(bright_by_row) if count >= 5]
    line_runs = runs(active_rows, max_gap=2)
    assert len(line_runs) == len(SOURCE_LINES), line_runs

    records = []
    line_outputs = []
    for line_index, ((y0, y1), source_line) in enumerate(zip(line_runs, SOURCE_LINES)):
        words = source_line.split()
        active_columns = [
            x for x in range(width)
            if any(pixels[x, y] >= THRESHOLD for y in range(y0, y1 + 1))
        ]
        column_runs = runs(active_columns)
        gaps = [
            (column_runs[i + 1][0] - column_runs[i][1] - 1, i)
            for i in range(len(column_runs) - 1)
        ]
        required = len(words) - 1
        assert len(gaps) >= required
        separators = sorted(i for _, i in sorted(gaps, key=lambda item: (-item[0], item[1]))[:required])

        word_spans = []
        start_run = 0
        for separator in separators + [len(column_runs) - 1]:
            word_spans.append((column_runs[start_run][0], column_runs[separator][1]))
            start_run = separator + 1
        assert len(word_spans) == len(words), (line_index, word_spans, words)

        output_tokens = []
        for word_index, (word, (x0, x1)) in enumerate(zip(words, word_spans)):
            center_x = (x0 + x1) // 2
            center_y = (y0 + y1) // 2
            col = bisect_right(x_edges, center_x) - 1
            row = bisect_right(y_edges, center_y) - 1
            assert 0 <= row < 11 and 0 <= col < 11
            local = row * 11 + col
            rune_index = page32[local]
            token = corpus["translit"][rune_index]
            output_tokens.append(token)
            records.append({
                "line": line_index,
                "word_index": word_index,
                "word": word,
                "bbox": [x0, y0, x1, y1],
                "center": [center_x, center_y],
                "tile": [row, col],
                "p32_local": local,
                "rune_index": rune_index,
                "rune": corpus["runes"][rune_index],
                "translit": token,
                "prime": prime[rune_index],
            })
        line_outputs.append("".join(output_tokens))

    result = {
        "classification": "source-locked literal image-word-to-p32-tile readout",
        "source_image": "resources/historical/cicada2016-4gq25.jpg",
        "source_page": 32,
        "threshold": THRESHOLD,
        "image_size": list(image.size),
        "x_edges": x_edges,
        "y_edges": y_edges,
        "line_runs": [list(item) for item in line_runs],
        "visible_word_count": len(records),
        "unique_tiles": len({tuple(record["tile"]) for record in records}),
        "line_outputs": line_outputs,
        "output": "".join(line_outputs),
        "records": records,
        "decision_rule": (
            "A direct reading is supported only if the unmodified source-order "
            "tile sequence supplies a recognizable instruction/key or another "
            "independently checkable structure. Otherwise retire this literal "
            "word-center projection rather than tuning thresholds or offsets."
        ),
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
