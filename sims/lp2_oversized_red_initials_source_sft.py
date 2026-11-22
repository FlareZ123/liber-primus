"""Source-only LP2 oversized red initials inventory. Python 3, Pillow/OpenCV.

Read byte-original 2014 JPEG pages, not OCR/transcribed font renderings.
Run: python sims/lp2_oversized_red_initials_source_sft.py
This freezes the complete first-letter inventory, not a decipherment.
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus"

# Manually matched each connected component to the printed red heading start.
# (physical LP2 page, first red-rune offset, actual rune,
#  native JPEG component left, top, width, height, area)
EXPECTED = [
    (0, 0, "ᛋ", 601, 667, 150, 498, 31929),
    (3, 0, "ᛚ", 601, 670, 149, 495, 24763),
    (3, 119, "ᛈ", 601, 2099, 229, 493, 39502),
    (6, 71, "ᚪ", 601, 1722, 148, 496, 30868),
    (8, 0, "ᛉ", 603, 667, 282, 498, 31876),
    (15, 9, "ᛚ", 601, 1732, 149, 496, 24779),
    (23, 0, "ᚢ", 601, 1157, 230, 496, 39132),
    (27, 0, "ᛗ", 601, 913, 230, 496, 54858),
    (33, 0, "ᛞ", 601, 667, 230, 498, 56747),
    (33, 91, "ᛝ", 602, 1909, 218, 497, 44963),
    (39, 119, "ᛡ", 601, 1852, 231, 498, 53341),
    (40, 0, "ᚠ", 601, 667, 149, 498, 31539),
    (54, 0, "ᚪ", 601, 914, 148, 495, 30862),
    (56, 0, "ᚫ", 601, 670, 149, 496, 30614),
    (57, 0, "ᛈ", 601, 915, 279, 604, 58641),
]
ink = json.loads((SOURCE / "lp2-ink-annotations.json").read_text(encoding="utf-8"))
spans_by_page = {page["page"]: page["red_spans"] for page in ink["pages"]}
for page, start, rune, *_ in EXPECTED:
    spans = [span for span in spans_by_page[page] if span["start"] == start]
    assert len(spans) == 1, (page, start)
    assert spans[0]["runes"][0] == rune, (page, start, spans)

seen = []
for physical_page in range(58):
    # LP2 p0..57 correspond to original combined-corpus JPEG 17..74.
    filename = SOURCE / f"{physical_page+17:02d}.jpg"
    source_rgb = np.asarray(Image.open(filename).convert("RGB"))
    assert source_rgb.shape == (3600, 2400, 3), filename
    red_mask = ((source_rgb[:, :, 0] > 130)
                & (source_rgb[:, :, 1] < 90)
                & (source_rgb[:, :, 2] < 90)).astype(np.uint8)
    _, _, stats, _ = cv2.connectedComponentsWithStats(red_mask, connectivity=8)
    for x, y, width, height, area in stats[1:]:
        if height >= 300 and area >= 10000:
            seen.append((physical_page, int(x), int(y), int(width),
                         int(height), int(area)))

expected_pixels = [(p, x, y, width, height, area)
                   for p, _, _, x, y, width, height, area in EXPECTED]
assert seen == expected_pixels, {"expected": expected_pixels, "observed": seen}
# Both solved-puzzle controls have a large first glyph in a red title.
assert [r[0] for r in EXPECTED].count(56) == 1
assert [r[0] for r in EXPECTED].count(57) == 1
print(json.dumps({
    "physical_pages": 58,
    "oversized_red_glyph_count": len(EXPECTED),
    "pages_with_oversized_red_glyphs": len(set(row[0] for row in EXPECTED)),
    "chronological_original_runic_string": "".join(row[2] for row in EXPECTED),
    "source_red_span_starts": [[row[0], row[1]] for row in EXPECTED],
    "solved_controls": [56, 57]
}, ensure_ascii=False, indent=2))
