#!/usr/bin/env python3
"""Image-native adjudication of 11 disputed LP2 numeric-grid glyphs.

Run from repository root:
    python sims/lp2_grid_11_glyph_adjudication.py

Requires Pillow and numpy. The original JPEGs remain unmodified.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
LAYOUT = {66: (318.0, 44.7), 67: (166.0, 45.0), 68: (165.0, 45.0)}

# Original row-major zero-based index, original scan, local table row,
# column, printed token and competing third-party reading.
DISPUTES = [
    (25, 66, 3, 1, "3I", "3i"),
    (45, 66, 5, 5, "1l", "1L"),
    (50, 66, 6, 2, "0l", "0L"),
    (165, 67, 10, 5, "0I", "0l"),
    (172, 67, 11, 4, "2S", "2s"),
    (175, 67, 11, 7, "0I", "0i"),
    (182, 67, 12, 6, "2l", "2L"),
    (199, 68, 1, 7, "0l", "0L"),
    (215, 68, 3, 7, "1O", "05"),
    (237, 68, 6, 5, "0W", "0w"),
    (246, 68, 7, 6, "3I", "3i"),
]

# Independent readable reference glyphs in the same original font.
CONTROLS = [
    (66, 3, 6, "L", "2L"),
    (66, 0, 2, "l", "2l"),
    (67, 4, 4, "s", "0s"),
    (67, 11, 4, "S", "2S"),
    (67, 12, 4, "O", "2O"),
    (68, 1, 0, "0", "00"),
    (68, 6, 4, "w", "3w"),
    (68, 6, 5, "W", "0W"),
    (66, 9, 0, "i", "2i"),
    (68, 7, 6, "I", "3I"),
]


def metrics(image: np.ndarray, scan: int, row: int, col: int) -> dict[str, int]:
    """Read the second glyph's original dark bounding box without OCR."""
    y0, stride = LAYOUT[scan]
    y = round(4 * (y0 + row * stride))
    mask = image[y - 50:y + 60, 610:1800] < 90
    occupied = np.flatnonzero(mask.any(axis=0))
    gaps = np.flatnonzero(np.diff(occupied) > 1)
    beginnings = np.r_[0, gaps + 1]
    endings = np.r_[gaps, len(occupied) - 1]
    groups = [(int(occupied[a]), int(occupied[b]))
              for a, b in zip(beginnings, endings)]
    assert len(groups) == 16, (scan, row, len(groups))
    first, last = groups[2 * col + 1]
    glyph = mask[:, first:last + 1]
    occupied_rows = np.flatnonzero(glyph.any(axis=1))
    strips = 1 + int(np.count_nonzero(np.diff(occupied_rows) > 1))
    return {
        "width": last - first + 1,
        "height": int(occupied_rows[-1] - occupied_rows[0] + 1),
        "vertical_strips": strips,
        "black_pixels": int(glyph.sum()),
        "x0": first + 610,
        "x1": last + 610,
        "y0": int(y - 50 + occupied_rows[0]),
        "y1": int(y - 50 + occupied_rows[-1]),
    }


def classify(a: str, b: str, m: dict[str, int]) -> str:
    """Distinguish original glyph forms using same-image control geometry."""
    pair = frozenset((a, b))
    if pair == {"I", "l"}:
        return "I" if m["height"] <= 69 else "l"
    if pair == {"L", "l"}:
        return "L" if m["width"] >= 20 else "l"
    if pair == {"S", "s"}:
        return "S" if m["height"] >= 60 else "s"
    if pair in ({"O", "0"}, {"O", "5"}):
        return "O" if m["width"] >= 56 else ("0" if "0" in pair else "5")
    if pair == {"W", "w"}:
        return "W" if m["width"] >= 80 else "w"
    if pair == {"I", "i"}:
        return "i" if m["vertical_strips"] >= 2 else "I"
    raise AssertionError((a, b))


def run(image_dir: Path = SOURCE) -> dict:
    """Validate the source tokens, image shapes and font reference classes."""
    imgs = {}
    for scan in LAYOUT:
        im = Image.open(image_dir / f"{scan}.jpg").convert("L")
        assert im.size == (2400, 3600), (scan, im.size)
        imgs[scan] = np.asarray(im)

    grid_path = SOURCE / "base60-grid.json"
    if grid_path.exists():
        rows = json.loads(grid_path.read_text(encoding="utf-8"))["rows"]
        assert len(rows) == 32 and all(len(row) == 8 for row in rows)
        for idx, _, _, _, token, _ in DISPUTES:
            assert rows[idx // 8][idx % 8] == token, (idx, token)

    refs = []
    for scan, row, col, label, token in CONTROLS:
        m = metrics(imgs[scan], scan, row, col)
        refs.append({"scan": scan, "row": row, "col": col,
                     "symbol": label, "token": token, **m})

    by_symbol = {label: [m for m in refs if m["symbol"] == label]
                 for label in "ILlSsO0Wwi"}
    assert by_symbol["L"][0]["width"] > by_symbol["l"][0]["width"]
    assert by_symbol["S"][0]["height"] > by_symbol["s"][0]["height"]
    assert by_symbol["O"][0]["width"] > by_symbol["0"][0]["width"]
    assert by_symbol["W"][0]["width"] > by_symbol["w"][0]["width"]
    assert by_symbol["i"][0]["vertical_strips"] == 2
    assert by_symbol["I"][0]["vertical_strips"] == 1

    cases = []
    for idx, scan, row, col, token, alternative in DISPUTES:
        m = metrics(imgs[scan], scan, row, col)
        observed = classify(token[1], alternative[1], m)
        assert observed == token[1], (idx, token, alternative, observed, m)
        cases.append({"index": idx, "scan": scan, "row": row, "col": col,
                      "printed": token, "alternative": alternative,
                      "image_class": observed, **m})

    assert len(cases) == 11
    return {"source": "Three original JPEGs 66-68, 2400x3600",
            "grid_cells_adjudicated": 11,
            "previously_proposed_five_changes_rejected": 5,
            "six_other_ambiguities_resolved": 6,
            "cases": cases,
            "calibration": refs}


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
