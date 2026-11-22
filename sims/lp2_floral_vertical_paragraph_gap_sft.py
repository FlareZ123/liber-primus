"""Source-native floral text line-spacing and implicit-break audit.

SFT: Run this one Python file from a checked-out repository with Pillow, NumPy.
Read-only; uses original page images and supplied rune transcription.
"""

from __future__ import annotations

from pathlib import Path
import re

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RUNES = frozenset("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
PAGES = tuple(range(40, 49)) + (52, 53)
EXPECTED = {40: (3, 4, 8), 41: (9,), 42: (2, 5), 43: (0,), 53: (2, 5)}


def spans(image: Image.Image, page: int) -> list[tuple[int, int]]:
    image_array = np.asarray(image.convert("L"))
    x1, x2 = (600, 1790) if page == 53 else (700, 1550)
    source = image_array[:, x1:x2]
    count = np.count_nonzero(source < 125, axis=1)
    in_band = False
    regions: list[tuple[int, int]] = []
    for y, hits in enumerate(count):
        if hits > 50 and not in_band:
            start = y
            in_band = True
        elif hits <= 50 and in_band:
            if y - start > 45 and start >= 630:
                regions.append((start, y - 1))
            in_band = False
    return regions[:9 if page == 53 else 11 if page == 40 else 12]


def main() -> None:
    text = (ROOT / "resources" / "lp2-transcription.txt").read_text(encoding="utf8")
    sections = text.split("%")
    details = []
    for page in PAGES:
        original = sections[page - (page > 50)]
        rows = [line.strip() for line in re.split(r"/\r?\n", original)]
        rows = [row for row in rows if any(glyph in RUNES for glyph in row)]
        scan = page + 17
        with Image.open(ROOT / "resources" / "liber-primus" / f"{scan:02}.jpg") as image:
            assert image.size == (2400, 3600)
            regions = spans(image, page)
        assert len(regions) == len(rows), (page, len(regions), len(rows))
        starts = [start for start, _ in regions]
        gaps = tuple(i for i, delta in enumerate(np.diff(starts)) if delta >= 210)
        assert gaps == EXPECTED.get(page, ()), (page, gaps)
        for line_index in gaps:
            runic_offset = sum(sum(glyph in RUNES for glyph in row) for row in rows[:line_index + 1])
            trailing = rows[line_index][-1]
            marked = trailing in "-."
            details.append((page, scan, line_index, starts[line_index + 1] - starts[line_index],
                            runic_offset, marked, trailing))
            print(f"p{page:02d}/scan{scan:02d} after line {line_index + 1}: "
                  f"+{starts[line_index + 1] - starts[line_index]}px pitch; "
                  f"rune offset {runic_offset}; explicit punctuation={marked}")
    assert len(details) == 9
    assert sum(not record[5] for record in details) == 6
    assert sum(record[5] for record in details) == 3
    print("PASS: eleven original rune-text floral pages; nine extra 36px gaps; "
          "six have no source-transcribed separator")


if __name__ == "__main__":
    main()
