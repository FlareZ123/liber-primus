"""Original LP2 font-rune vertical-offset watermark test with source-native JPEG plant.

Run with Python3, numpy, Pillow, and OpenCV from the repository checkout.
Uses original 2400x3600 JPEGs and the existing source-native glyph classifier.
No files are modified. All marks exist only in memory for the positive plant.
"""
from collections import Counter, defaultdict
import json
from pathlib import Path
from runpy import run_path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
base = run_path(str(ROOT / "sims/lp2_original_rune_typography_sft.py"))
PAGES = base["HOLDOUT"]
source_image = base["source_image"]
detect = base["detect"]
predict = base["predict"]
types = base["types"]
templates = base["templates"]


def glyph_records(page, image):
    result = {}
    for row in range(12):
        y0 = 673 + 188 * row
        records = []
        boxes = detect(image, row)
        keys, confidence = predict(boxes, types, templates)
        for ix, (x1, x2, _) in enumerate(boxes):
            if confidence[ix] < 0.88:
                continue
            ink = image[y0 - 10:y0 + 125, x1:x2 + 1] < 155
            y = np.flatnonzero(ink.any(axis=1))
            if not len(y):
                continue
            records.append((ix, int(keys[ix]), int(y[0]) - 10,
                            int(y[-1]) - 10, x1, x2))
        result[(page, row)] = records
    return result


def pairwise_geometry(lines):
    counts = Counter()
    for glyphs in lines.values():
        by_type = defaultdict(list)
        for _, typ, top, bottom, _, _ in glyphs:
            by_type[typ].append((top, bottom))
        for coords in by_type.values():
            for i in range(len(coords)):
                for j in range(i + 1, len(coords)):
                    first, last = coords[i], coords[j]
                    counts[(last[0] - first[0], last[1] - first[1])] += 1
    return counts


def shifted_pairs(counts):
    return sum(v for (a, b), v in counts.items()
               if abs(a) == 1 and a == b)


def edge_only(counts):
    return sum(v for (a, b), v in counts.items()
               if (abs(a) == 1 and b == 0) or (a == 0 and abs(b) == 1))


original = {}
reencoded = {}
planted = {}
target_changes = []
plants = 0
quality = [int(cv2.IMWRITE_JPEG_QUALITY), 92]

for page in PAGES:
    image = source_image(page)
    plain = glyph_records(page, image)
    original.update(plain)
    shift_targets = []
    for (p, row), glyphs in plain.items():
        by_type = defaultdict(list)
        for ix, typ, top, bottom, x1, x2 in glyphs:
            by_type[typ].append((ix, x1, x2, row))
        # A fixed deterministic mark plan: move only the final occurrence of
        # each rune class repeating within the SAME physical text line.
        shift_targets.extend(items[-1] for items in by_type.values()
                             if len(items) >= 2)

    image_shifted = image.copy()
    for ix, x1, x2, row in shift_targets:
        y0 = 673 + 188 * row
        lo, hi = y0 - 9, y0 + 126
        image_shifted[lo:hi, x1:x2 + 1] = image[lo - 1:hi - 1, x1:x2 + 1]
    plants += len(shift_targets)

    # Recompress BOTH controls and payload via the same original-style
    # JPEG Q92 path, then rerun the original glyph decoder on both.
    def q92_decode(source):
        ok, blob = cv2.imencode(".jpg", source, quality)
        assert ok
        return cv2.imdecode(blob, cv2.IMREAD_GRAYSCALE)

    without = glyph_records(page, q92_decode(image))
    marked = glyph_records(page, q92_decode(image_shifted))
    reencoded.update(without)
    planted.update(marked)

    assert [(key, len(val)) for key, val in plain.items()] == [
        (key, len(val)) for key, val in marked.items()
    ]
    for line in plain:
        old, new = plain[line], marked[line]
        assert [(a[0], a[1]) for a in old] == [
            (b[0], b[1]) for b in new
        ]
        for a, b in zip(old, new):
            if (a[0], a[4], a[5], line[1]) in shift_targets:
                target_changes.append((b[2] - a[2], b[3] - a[3]))

counts = pairwise_geometry(original)
blank = pairwise_geometry(reencoded)
positive = pairwise_geometry(planted)
assert len(original) == len(reencoded) == len(planted) == 300
assert sum(map(len, original.values())) == 6673
assert sum(counts.values()) == 2179
assert counts == blank
assert shifted_pairs(counts) == 10
assert edge_only(counts) == 369
assert plants == len(target_changes) == 1491
assert set(target_changes) == {(1, 1)}
assert sum(positive.values()) == 2179
assert shifted_pairs(positive) == 1457
assert edge_only(positive) == 232

print(json.dumps({
    "case": "source-native vertical glyph ink-position mark, 1px JPEG Q92 positive control",
    "held_out_original_physical_pages": PAGES,
    "full_printed_lines": len(original),
    "accepted_real_glyphs": sum(map(len, original.values())),
    "matched_identical_rune_pairs_within_same_printed_line": sum(counts.values()),
    "original_exact_one_pixel_top_and_bottom_comoving_pairs": shifted_pairs(counts),
    "original_one_edge_moves_only": edge_only(counts),
    "q92_reencoded_control_comoving_pairs": shifted_pairs(blank),
    "planted_1px_shifted_rune_occurrences": plants,
    "planted_target_occurrences_exact_plus_1_top_bottom": len(target_changes),
    "q92_planted_comoving_pairs": shifted_pairs(positive),
    "q92_planted_one_edge_moves_only": edge_only(positive),
    "interpretation": "The original 1px co-moving vertical-offset channel is almost absent on same-rune same-line pairs. A dense 1px planted channel is recovered after source-style JPEG compression. No decoded key or plaintext."
}, indent=2))
