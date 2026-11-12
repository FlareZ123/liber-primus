"""Original p55 punctuation gate for LP1 p5's 13-word Wisdom square.

Requires Pillow. Run from a checkout:
    python sims/lp2_p55_13cell_source_gate_sft.py
This tests a source-visible selector, not an invented cipher.
"""

from pathlib import Path
import hashlib
import json

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "resources/liber-primus/72.jpg"
PAGE_SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"


def black_text_separator_dots(image):
    """Extract actual isolated small black punctuation marks from four p55 lines."""
    pixels = image.convert("RGB").load()
    remaining = {
        (x, y)
        for y in range(620, 1390)
        for x in range(570, 1870)
        if max(pixels[x, y]) < 90
    }
    dots = []
    while remaining:
        stack = [remaining.pop()]
        xs, ys = [], []
        while stack:
            x, y = stack.pop()
            xs.append(x)
            ys.append(y)
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    q = (x + dx, y + dy)
                    if q in remaining:
                        remaining.remove(q)
                        stack.append(q)
        xmin, ymin = min(xs), min(ys)
        w = max(xs) - xmin + 1
        h = max(ys) - ymin + 1
        if w in (9, 10) and h == 10 and len(xs) >= 90:
            dots.append((xmin, ymin, w, h))
    return sorted(dots, key=lambda dot: (dot[1], dot[0]))


def main():
    assert hashlib.sha256(PAGE.read_bytes()).hexdigest() == PAGE_SHA256
    dots = black_text_separator_dots(Image.open(PAGE))
    by_line = {}
    for x, y, w, h in dots:
        by_line[y] = by_line.get(y, 0) + 1
    assert by_line == {725: 7, 913: 3, 1102: 4, 1290: 2}, by_line
    assert len(dots) == 16
    print(json.dumps({
        "source_page": "resources/liber-primus/72.jpg",
        "sha256": PAGE_SHA256,
        "black_separators_per_line": by_line,
        "total_black_separators": len(dots),
        "LP1_p5_word_valued_cells": 13,
        "LP2_p55_cipher_runes": 76,
        "interpretation": "No source-selected 13-cell-to-76-rune position assignment",
    }, indent=2))


if __name__ == "__main__":
    main()
