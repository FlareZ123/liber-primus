#!/usr/bin/env python3
"""Audit every LP2 large punctuation glyph in both inks.

Run from the repository root:
    python sims/lp2_ink_annotation_audit.py
Requires numpy and opencv-python-headless. Original source JPEGs remain unchanged.
"""
import json
from collections import Counter
from pathlib import Path

import cv2
import numpy as np

from red_marker_shapes import clusters, scan

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "resources" / "liber-primus"
ANNOTATIONS = IMAGES / "lp2-ink-annotations.json"
CORPUS = IMAGES / "lp2-corpus.json"

def black_large_marks(images):
    """Locate sparse black 10+-square punctuation motifs, excluding ordinary four-dot stops."""
    found = []
    for archive in range(17, 75):
        image = cv2.imread(str(images / f"{archive:02d}.jpg"))
        assert image is not None, archive
        mask = (np.max(image, axis=2) < 105).astype(np.uint8)
        count, _, boxes, centers = cv2.connectedComponentsWithStats(mask)
        dots = np.asarray([
            centers[i] for i in range(1, count)
            if 6 <= boxes[i, cv2.CC_STAT_WIDTH] <= 12
            and 6 <= boxes[i, cv2.CC_STAT_HEIGHT] <= 12
            and 40 <= boxes[i, cv2.CC_STAT_AREA] <= 130
        ], dtype=np.float64).reshape(-1, 2)
        for group in clusters(dots):
            if len(group) < 10:
                continue
            low, high = group.min(axis=0), group.max(axis=0)
            if high[0] - low[0] > 100 or high[1] - low[1] > 190:
                continue
            pattern = tuple(sorted(
                (round((x - low[0]) / 15), round((y - low[1]) / 17))
                for x, y in group
            ))
            found.append({
                "page": archive - 17, "archive_jpg": archive,
                "x": round(float(low[0])), "y": round(float(low[1])),
                "dots": len(group), "pattern": pattern,
            })
    return found

def run():
    annotations = json.loads(ANNOTATIONS.read_text(encoding="utf-8"))
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    assert annotations["counts"] == {
        "runes": 13136, "red": 225, "large": 36,
        "red13": 30, "black13": 1, "red10": 4, "red23": 1,
    }
    page_data = {p["page"]: p for p in annotations["pages"]}
    assert len(corpus["pages"]) == 58
    for page in corpus["pages"]:
        number = page["page"]
        expected = "".join(corpus["runes"][i] for i in page["indices"])
        src = page_data.get(number, {})
        assert len(expected) == src.get("rune_count", len(expected)), number
        for span in src.get("red_spans", []):
            start, length = span["start"], span["length"]
            assert expected[start:start + length] == span["runes"], (number, start)
    red = scan(IMAGES)
    red_rows = [
        {"page": loc["lp2_physical_page"], "archive_jpg": loc["archive_jpg"],
         "dots": len(pattern), "ink": "red",
         "x": loc["x"], "y": loc["y"], "pattern": pattern}
        for pattern, places in red.items() for loc in places
    ]
    black_rows = [{**row, "ink": "black"} for row in black_large_marks(IMAGES)]
    actual = red_rows + black_rows
    expected = [
        (p["page"], dots, ink)
        for p in annotations["pages"]
        for _, dots, ink in p.get("large_punctuation", [])
    ]
    assert Counter((r["page"], r["dots"], r["ink"]) for r in actual) == Counter(expected)
    assert len(red_rows) == 35 and len(black_rows) == 1 and len(actual) == 36
    assert {(r["page"], r["archive_jpg"], r["dots"], r["x"], r["y"])
            for r in black_rows} == {(7, 24, 13, 1692, 2233)}
    unique = {tuple(r["pattern"]) for r in red_rows}
    assert len(unique) == 3
    black_pattern = tuple(black_rows[0]["pattern"])
    assert any(tuple(pat) == black_pattern and len(pat) == 13 for pat in unique)
    summary = {
        "source_pages": 58,
        "runes_exact": 13136,
        "colored_runes": 225,
        "large_mark_census": dict(sorted(Counter(
            f"{r['ink']}-{r['dots']}" for r in actual
        ).items())),
        "black_13_dot": {k: black_rows[0][k] for k in
                         ("page", "archive_jpg", "x", "y", "dots")},
        "all_marker_counts_match_source_annotations": True,
    }
    print(json.dumps(summary, indent=2))
    return summary

if __name__ == "__main__":
    run()
