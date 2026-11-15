"""Original LP2 raster baseline test across seven page images.

Reads canonical source GP29 indices and exact 2400x3600 LP2 JPEG scans.
Requires only NumPy and Pillow; makes no output files.
"""
from collections import Counter
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
PAGES = (32, 55, 9, 12, 19, 26, 47)
COUNTS = {32: (25, 23, 23, 21, 22, 7), 55: (24, 22, 22, 8)}
TRAIN = (32, 55)
HOLDOUT = (9, 12, 19, 26, 47)


def glyph_bases(source: np.ndarray, page: int, row: int):
    y = 673 + 188 * row
    right = 1032 if page == 55 and row == 3 else 1810
    ink = source[y - 10:y + 125, 590:right] < 155
    cols = np.flatnonzero(ink.sum(axis=0) >= 2)
    if not len(cols):
        return []
    components = np.split(cols, np.where(np.diff(cols) > 1)[0] + 1)
    out = []
    for component in components:
        if not len(component):
            continue
        yy = np.flatnonzero(ink[:, component].any(axis=1))
        if len(yy) and yy[-1] - yy[0] + 1 >= 93:
            out.append(int(yy[-1]) + y - 10)
    return out


rows = []
for page in PAGES:
    source = np.asarray(Image.open(ROOT / "resources/liber-primus" / f"{page + 17}.jpg").convert("L"))
    assert source.shape == (3600, 2400), page
    observed = []
    for row in range(6 if page == 32 else 4 if page == 55 else 12):
        bottoms = glyph_bases(source, page, row)
        if page in COUNTS:
            assert len(bottoms) == COUNTS[page][row], (page, row, len(bottoms))
        for bottom in bottoms:
            observed.append((row, bottom))
    indices = CORPUS["pages"][page]["indices"]
    assert len(observed) == len(indices), (page, len(observed), len(indices))
    for (row, bottom), rune in zip(observed, indices):
        baseline = 786 + 188 * row + ((row + 1) // 3)
        rows.append((page, row, rune, bottom - baseline))

assert len(rows) == 1536
all_residuals = Counter(item[3] for item in rows)
assert all_residuals == {0: 1423, -1: 97, -2: 16}, all_residuals
anomalies = Counter(item[2] for item in rows if item[3] != 0)
assert anomalies == {17: 36, 13: 39, 12: 31, 21: 7}, anomalies
assert all((rune in {12, 13, 17, 21}) or residual == 0
           for _, _, rune, residual in rows)
for page in HOLDOUT:
    assert sum(row[0] == page for row in rows) == len(CORPUS["pages"][page]["indices"])

print(json.dumps({
    "original_page_count": len(PAGES),
    "original_glyphs": len(rows),
    "source_frozen_baseline": "786 + 188 * row + floor((row+1)/3)",
    "residual_counts": dict(sorted(all_residuals.items())),
    "nonzero_residual_gp29_indices": dict(sorted(anomalies.items())),
    "unchanged_25_other_symbol_classes": True,
    "heldout_pages": list(HOLDOUT),
    "scope": "Original seven clean page scans; ink-height bottom residual only"
}, indent=2))
