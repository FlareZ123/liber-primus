#!/usr/bin/env python3
"""Original-image p53 red-shape and seven shifted-span assignment SFT."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
AUDIT = json.loads((ROOT / "im-results/lp2-full-source-rune-assignment-audit.json").read_text(encoding="utf-8"))
INK = json.loads((ROOT / "resources/liber-primus/lp2-ink-annotations.json").read_text(encoding="utf-8"))
SHIFTED = [(3, 0, 16), (3, 119, 3), (15, 9, 11), (27, 0, 19),
           (33, 91, 8), (39, 119, 3), (54, 0, 9)]
RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"
LATIN = ["F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
         "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D",
         "A", "AE", "Y", "IA", "EA"]
TRANSLIT = dict(zip(RUNES, LATIN))

def red(rgb: np.ndarray) -> np.ndarray:
    a = rgb.astype(np.float32)
    return ((a[:, :, 0] > 80) &
            (a[:, :, 0] > 1.45 * a[:, :, 1]) &
            (a[:, :, 0] > 1.45 * a[:, :, 2]))

def image_for(page: int) -> np.ndarray:
    return np.asarray(Image.open(ROOT / "resources/liber-primus" / f"{page + 17:02}.jpg").convert("RGB"))

def shape(image: np.ndarray, bounds: list[int]) -> np.ndarray:
    x0, y0, x1, y1 = bounds
    mask = red(image[y0:y1 + 1, x0:x1 + 1])
    ys, xs = np.where(mask)
    assert len(ys), f"red pixels absent at {bounds}"
    tight = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    assert tight.shape[0] <= 100 and tight.shape[1] <= 105
    canvas = np.zeros((130, 120), dtype=np.bool_)
    canvas[9:9 + tight.shape[0], 8:8 + tight.shape[1]] = tight
    return canvas

def iou(a: np.ndarray, b: np.ndarray) -> float:
    best = 0.0
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            moved = np.roll(b, (dy, dx), axis=(0, 1))
            best = max(best, np.count_nonzero(a & moved) / np.count_nonzero(a | moved))
    return best

positions = AUDIT["red_positions"]
assert len(positions) == 213
p53 = sorted((r for r in positions if r["page"] == 53), key=lambda r: r["page_local_offset"])
assert [r["page_local_offset"] for r in p53] == list(range(128, 179))
source = next(s for p in INK["pages"] if p["page"] == 53
              for s in p["red_spans"] if s["start"] == 128)
labels = [TRANSLIT[ch] for ch in source["runes"]]
assert len(labels) == 51
assert labels == [r["expected"] for r in p53]
assert all(r["p43_nearest"] == r["expected"] for r in p53)
photo = image_for(53)
masks = [shape(photo, r["box"]) for r in p53]
freq = Counter(labels)
repeated = [i for i, label in enumerate(labels) if freq[label] > 1]
assert len(repeated) == 40 and len(freq) == 26
hits = 0
for i in repeated:
    closest = max((iou(masks[i], masks[j]), j) for j in range(51) if j != i)[1]
    hits += int(labels[i] == labels[closest])
assert hits == 40, f"p53 shape matches {hits}/40"

shift_hits = shifted_raw_bad = shifted_positions = 0
for page, start, length in SHIFTED:
    group = sorted((r for r in positions if r["page"] == page and
                    r["red_span_start"] == start), key=lambda r: r["red_span_offset"])
    assert len(group) == length
    assert [r["red_span_offset"] for r in group] == list(range(length))
    image = image_for(page)
    x0, y0, _, y1 = group[0]["box"]
    before = red(image[max(0, y0 - 30):y1 + 30, 595:x0 - 10])
    assert np.count_nonzero(before) > 1000, (page, start)
    assert group[-1]["p43_nearest"] == "I"
    assert group[-1]["box"][2] - group[-1]["box"][0] <= 12
    for i in range(length - 1):
        assert group[i]["p43_nearest"] == group[i + 1]["expected"], (page, start, i)
        shift_hits += 1
    shifted_positions += length
    raw_bad = sum(r["p43_nearest"] != r["expected"] for r in group)
    shifted_raw_bad += raw_bad
    print(f"p{page}:{start} {length} glyphs: shifted {length - 1}/{length - 1}, raw errors {raw_bad}")
assert (shifted_positions, shift_hits, shifted_raw_bad) == (69, 62, 68)
all_bad = {(r["page"], r["page_local_offset"]) for r in positions
           if r["p43_nearest"] != r["expected"]}
shift_set = {(p, s + i) for p, s, n in SHIFTED for i in range(n)}
remaining = sorted(all_bad - shift_set)
assert len(all_bad) == 79
# Page 0 has a separately visible joined S/Y glyph at assigned position 8,
# three shifted ordinary red glyphs, and a punctuation sliver at position 12.
# This supplies a native-image explanation for the five residual tail flags.
p0 = sorted((r for r in positions if r["page"] == 0), key=lambda r: r["page_local_offset"])
assert len(p0) == 13
assert (p0[8]["box"][0], p0[8]["box"][2]) == (1134, 1233)
assert p0[8]["box"][2] - p0[8]["box"][0] >= 95
assert [r["p43_nearest"] for r in p0[9:12]] == [r["expected"] for r in p0[10:13]]
assert p0[12]["p43_nearest"] == "I"
assert p0[12]["box"][2] - p0[12]["box"][0] <= 12
p0photo = image_for(0)
assert np.count_nonzero(red(p0photo[643:768, 1134:1233])) > 3000
assert np.count_nonzero(red(p0photo[687:768, 1419:1429])) > 350
# The six other flags are first positions of visually enlarged red headings.
# They must remain stylistic exceptions: a black-font classifier is invalid
# evidence for changing the corresponding source rune.
decorative = {(0, 0), (6, 71), (8, 0), (23, 0), (33, 0), (40, 0)}
p0_merge = {(0, i) for i in range(8, 13)}
assert set(remaining) == decorative | p0_merge
print("Original-image classification: 68 shifted-span flags, 5 p0 merged-glyph "
      "flags, 6 enlarged-title glyph flags; 79/79 raw flags explained")

assert remaining == [(0, 0), (0, 8), (0, 9), (0, 10), (0, 11), (0, 12),
                     (6, 71), (8, 0), (23, 0), (33, 0), (40, 0)]
print(f"p53 original: 51/51 labels, 40/40 repeated native red shapes; residual flags {remaining}")
