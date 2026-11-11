#!/usr/bin/env python3
"""Self-supervised original-image audit of all 256 LP2 numeric-table tokens and p15 print control.

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

# Physical p15 (archive scan 32.jpg) numerical-printing control. The final
# printed value is 708, so this control contains 63 digit glyphs, not 64.
P15_ROW_CENTERS = (915, 1055, 1193, 1350)
P15_DIGIT_ROWS = (
    "3258322231523038",
    "3278329932982838",
    "3288329432962472",
    "451612067081820",
)


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



def segment_p15_row(image: np.ndarray, row: int) -> list[np.ndarray]:
    """Return the independently read p15 numeric-control glyphs."""
    center = P15_ROW_CENTERS[row]
    ink = image[center - 50:center + 60, 550:1850] < 90
    xs = np.flatnonzero(ink.any(axis=0))
    gaps = np.flatnonzero(np.diff(xs) > 1)
    bounds = [(int(xs[s]), int(xs[t]))
              for s, t in zip(np.r_[0, gaps + 1],
                              np.r_[gaps, len(xs) - 1])]
    expected = P15_DIGIT_ROWS[row]
    assert len(bounds) == len(expected), (row, len(bounds), len(expected))
    shapes = []
    for left, right in bounds:
        mask = ink[:, left:right + 1]
        rows = np.flatnonzero(mask.any(axis=1))
        assert len(rows)
        shapes.append(mask[rows[0]:rows[-1] + 1])
    return shapes


def pairwise_report(classes: dict[str, list[np.ndarray]]) -> tuple[dict, list]:
    """Summarize native-mask mismatch for every pair in each glyph class."""
    per_character = {}
    all_values = []
    for character, shapes in sorted(classes.items()):
        distances = [
            distance(shapes[i], shapes[j])
            for i in range(len(shapes))
            for j in range(i + 1, len(shapes))
        ]
        assert all(np.isfinite(value) for value in distances), character
        if distances:
            per_character[character] = {
                "glyphs": len(shapes),
                "pairs": len(distances),
                "median_mismatch": float(np.median(distances)),
                "p90_mismatch": float(np.percentile(distances, 90)),
                "max_mismatch": float(max(distances)),
            }
            all_values.extend((value, character) for value in distances)
    return per_character, all_values


def aggregate_pairwise(values: list) -> dict:
    distances = np.asarray([value for value, _ in values], dtype=float)
    worst = max(values, key=lambda item: item[0])
    return {
        "pairs": int(len(values)),
        "median_mismatch": float(np.median(distances)),
        "p90_mismatch": float(np.percentile(distances, 90)),
        "p95_mismatch": float(np.percentile(distances, 95)),
        "max_mismatch": float(worst[0]),
        "worst_character": worst[1],
    }


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

    # Compare each printed character across both token positions, not only
    # within the same first/second-character slot.
    all_character_classes = defaultdict(list)
    digit_classes = defaultdict(list)
    for glyph in glyphs:
        all_character_classes[glyph["character"]].append(glyph["shape"])
        if glyph["character"].isdigit():
            digit_classes[glyph["character"]].append(glyph["shape"])
    all_character_per, all_character_values = pairwise_report(all_character_classes)
    digit_per, digit_values = pairwise_report(digit_classes)
    repeated_character_glyphs = sum(
        entry["glyphs"] for entry in all_character_per.values())

    # Independent control: the four-row numeric table on physical p15 (32.jpg).
    with Image.open(SOURCE / "32.jpg") as original:
        assert original.size == (2400, 3600)
        p15_image = np.asarray(original.convert("L"))
    p15_classes = defaultdict(list)
    p15_glyphs = 0
    for row, text in enumerate(P15_DIGIT_ROWS):
        shapes = segment_p15_row(p15_image, row)
        assert len(shapes) == len(text)
        for character, shape in zip(text, shapes):
            p15_classes[character].append(shape)
            p15_glyphs += 1
    p15_per, p15_values = pairwise_report(p15_classes)

    all_character_summary = aggregate_pairwise(all_character_values)
    digit_summary = aggregate_pairwise(digit_values)
    p15_summary = aggregate_pairwise(p15_values)
    assert repeated_character_glyphs == 509
    assert len(all_character_values) == 8543
    assert p15_glyphs == 63 and len(p15_values) == 265
    assert sum(len(v) for v in digit_classes.values()) == 298
    assert len(digit_values) == 8099
    assert all_character_summary["max_mismatch"] < 0.03
    assert digit_summary["max_mismatch"] < p15_summary["max_mismatch"]

    return {
        "source_images": ["66.jpg", "67.jpg", "68.jpg"],
        "tokens": 256, "glyphs": 512, "rows": 32,
        "overlapping_projection": "68.jpg row 0, 0J",
        "checked_with_same_character_control": checked,
        "singleton_characters": singletons,
        "conflicting_classifications": disputes,
        "all_position_same_character": {
            "checked_glyphs": repeated_character_glyphs,
            "pairwise_comparisons": len(all_character_values),
            "aggregate": all_character_summary,
            "per_character": all_character_per,
        },
        "p50_digit_control": {
            "glyphs": sum(len(v) for v in digit_classes.values()),
            "pairwise_comparisons": len(digit_values),
            "aggregate": digit_summary,
            "per_digit": digit_per,
        },
        "p15_printing_control": {
            "source_image": "32.jpg",
            "rows": len(P15_DIGIT_ROWS),
            "glyphs": p15_glyphs,
            "pairwise_comparisons": len(p15_values),
            "aggregate": p15_summary,
            "per_digit": p15_per,
        },
        "conclusion": "Self-consistent printed transcription; no stable repeated-glyph side channel; not an independent decipherment."}


if __name__ == "__main__":
    print(json.dumps(main(), ensure_ascii=False, indent=2))
