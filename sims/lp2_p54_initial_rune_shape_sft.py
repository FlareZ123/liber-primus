#!/usr/bin/env python3
"""Source-image line-band and p54 initial-rune shape check.

Reads unchanged LP2 original scans 49.jpg (p32), 71.jpg (p54), and
72.jpg (p55). The line-band projection independently fixes printed row
positions. The oversized p54 red initial is compared with ordinary A and N
glyph controls from the p32 original scan.
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "resources" / "liber-primus"


def line_bands(path: Path, box, threshold=180, min_pixels=20, max_blank_gap=20):
    image = Image.open(path).convert("L")
    x0, y0, x1, y1 = box
    pixels = np.asarray(image.crop(box))
    counts = (pixels < threshold).sum(axis=1)
    active = np.flatnonzero(counts >= min_pixels)
    if not len(active):
        return []
    groups = []
    start = previous = int(active[0])
    for y in active[1:]:
        y = int(y)
        if y - previous - 1 > max_blank_gap:
            groups.append((y0 + start, y0 + previous))
            start = y
        previous = y
    groups.append((y0 + start, y0 + previous))
    return groups


def mask_iou(a, b):
    a = np.asarray(a, dtype=bool)
    b = np.asarray(b, dtype=bool)
    return float(np.logical_and(a, b).sum() / np.logical_or(a, b).sum())


p32 = IMG / "49.jpg"
p54 = IMG / "71.jpg"
p55 = IMG / "72.jpg"

bands = {
    "p32": line_bands(p32, (500, 500, 1900, 1900)),
    "p54": line_bands(p54, (750, 700, 1850, 3200)),
    "p55": line_bands(p55, (600, 500, 1800, 1600)),
}
assert [len(bands[k]) for k in ("p32", "p54", "p55")] == [6, 11, 4]

# The red initial on p54 occupies x=601..749, y=913..1408. Compare its
# normalized silhouette with the ordinary A and N glyphs in original p32.
red = np.asarray(Image.open(p54).convert("RGB").crop((601, 913, 750, 1409)))
initial = ((red[:, :, 0] > 120) & (red[:, :, 1] < 120) & (red[:, :, 2] < 120)).astype(np.uint8)
assert initial.shape == (496, 149)
# OpenCV-style nearest-neighbour sampling, expressed directly so this SFT
# needs only Pillow and NumPy (not OpenCV).
y_index = np.floor(np.arange(113) * initial.shape[0] / 113).astype(int)
x_index = np.floor(np.arange(34) * initial.shape[1] / 34).astype(int)
initial = initial[np.ix_(y_index, x_index)] > 0
p32_gray = np.asarray(Image.open(p32).convert("L"))
a_control = p32_gray[1614:1727, 758:792] < 180
n_control = p32_gray[1050:1163, 789:823] < 180
iou_a = mask_iou(initial, a_control)
iou_n = mask_iou(initial, n_control)
assert iou_a > 0.95 and iou_n < 0.25

print(json.dumps({
    "source_images": {"p32": "49.jpg", "p54": "71.jpg", "p55": "72.jpg"},
    "line_bands_y_inclusive": bands,
    "p54_oversized_red_initial": {
        "crop_xyxy": [601, 913, 750, 1409],
        "normalized_size": [34, 113],
        "IoU_vs_p32_A_control": round(iou_a, 6),
        "IoU_vs_p32_N_control": round(iou_n, 6),
        "interpretation": "same source glyph as A, not N",
    },
}, ensure_ascii=False, indent=2))
