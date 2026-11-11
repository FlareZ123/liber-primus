#!/usr/bin/env python3
"""Self-supervised original-image audit of all 256 LP2 numeric-table tokens.

Run: python sims/lp2_grid_fullfont_source_audit.py
Requirements: Pillow, numpy, scipy. Reads only existing repository sources.
This is a glyph consistency check, not a cryptanalytic decoder or OCR.
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import find_objects, label

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
ROWS_BY_SCAN = {66: 10, 67: 13, 68: 9}
LAYOUT = {66: (318.0, 44.7), 67: (166.0, 45.0), 68: (165.0, 45.0)}


def segment_row(image: np.ndarray, scan: int, row: int) -> list[np.ndarray]:
    """Return 16 original-pixel character masks at the published row geometry."""
    y0, stride = LAYOUT[scan]
    y = round(4 * (y0 + row * stride))
    ink = image[y - 50:y + 60, 610:1800] < 90
    xs = np.flatnonzero(ink.any(axis=0))
    gaps = np.flatnonzero(np.diff(xs) > 1)
    bounds = [(int(xs[s]), int(xs[t]))
              for s, t in zip(np.r_[0, gaps + 1],
                              np.r_[gaps, len(xs) - 1])]

    if (scan, row) == (68, 0) and len(bounds) == 15:
        # '0J' occupies two separate connected ink shapes with overlapping
        # horizontal projections, producing 15 projection groups in this row.
        lo, hi = bounds[4]
        components, n = label(ink[:, lo:hi + 1], np.ones((3, 3), bool))
        components_bounds = sorted(
            (lo + part[1].start, lo + part[1].stop - 1)
            for part in find_objects(components) if part is not None)
        assert n == len(components_bounds) == 2
        bounds = bounds[:4] + components_bounds + bounds[5:]
    assert len(bounds) == 16, (scan, row, len(bounds))

    shapes = []
    for left, right in bounds:
        mask = ink[:, left:right + 1]
        rows = np.flatnonzero(mask.any(axis=1))
        assert len(rows)
        shapes.append(mask[rows[0]:rows[-1] + 1])
    return shapes


def distance(a: np.ndarray, b: np.ndarray) -> float:
    """Minimum relative pixel difference over nine small translations."""
    ah, aw = a.shape
    bh, bw = b.shape
    if max(abs(ah - bh), abs(aw - bw)) > 4:
        return float("inf")
    h, w = max(ah, bh) + 4, max(aw, bw) + 4
    canvas = np.zeros((h, w), bool)
    canvas[2:2 + ah, 2:2 + aw] = a
    mismatch = float("inf")
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            other = np.zeros((h, w), bool)
            other[2 + dy:2 + dy + bh, 2 + dx:2 + dx + bw] = b
            mismatch = min(mismatch, int(np.count_nonzero(canvas ^ other)))
    return mismatch / max(int(a.sum()), int(b.sum()))


def main() -> dict:
    table = json.loads((SOURCE / "lp2-grid-256.json").read_text("utf-8"))
    assert [p["image"] for p in table["pages"]] == [
        "66.jpg", "67.jpg", "68.jpg"]
    words = [token for page in table["pages"] for token in page["tokens"]]
    assert len(words) == 256 and all(len(word) == 2 for word in words)

    glyphs = []
    token_index = 0
    for scan, total_rows in ROWS_BY_SCAN.items():
        with Image.open(SOURCE / f"{scan}.jpg") as original:
            assert original.size == (2400, 3600)
            image = np.asarray(original.convert("L"))
        for row in range(total_rows):
            shapes = segment_row(image, scan, row)
            for col in range(8):
                word = words[token_index]
                for pos in (0, 1):
                    glyphs.append({
                        "index": token_index, "scan": scan,
                        "row": row, "col": col, "position": pos,
                        "character": word[pos], "shape": shapes[2 * col + pos]})
                token_index += 1
    assert token_index == 256 and len(glyphs) == 512

    classes = defaultdict(list)
    for g in glyphs:
        classes[g["position"], g["character"]].append(g)

    checked = 0
    disputes = []
    for g in glyphs:
        peers = [other for other in classes[g["position"], g["character"]]
                 if other is not g]
        if not peers:
            continue
        checked += 1
        own_score = min(distance(g["shape"], p["shape"]) for p in peers)
        rivals = [(distance(g["shape"], x["shape"]), x) for x in glyphs
                  if x["position"] == g["position"]
                  and x["character"] != g["character"]]
        other_score, rival = min(rivals, key=lambda x: x[0])
        if other_score < own_score + 0.03:
            disputes.append({
                "cell": g["index"], "position": g["position"],
                "printed": g["character"], "rival": rival["character"],
                "same_distance": own_score, "rival_distance": other_score})

    singletons = [
        {"cell": g["index"], "position": g["position"],
         "character": g["character"]}
        for g in glyphs
        if len(classes[g["position"], g["character"]]) == 1]
    return {
        "source_images": ["66.jpg", "67.jpg", "68.jpg"],
        "tokens": 256, "glyphs": 512, "rows": 32,
        "overlapping_projection": "68.jpg row 0, 0J",
        "checked_with_same_character_control": checked,
        "singleton_characters": singletons,
        "conflicting_classifications": disputes,
        "conclusion": "Self-consistent printed transcription; not an independent decipherment."}


if __name__ == "__main__":
    print(json.dumps(main(), ensure_ascii=False, indent=2))
