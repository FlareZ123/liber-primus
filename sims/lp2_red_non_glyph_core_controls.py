#!/usr/bin/env python3
"""Whole-page red-pixel control for LP2 punctuation and marginalia.

Run from the repository root:
    python sims/lp2_red_non_glyph_core_controls.py
Optional:
    python sims/lp2_red_non_glyph_core_controls.py --images /path/to/75-jpg-dir

This is a separate control to the 225-rune glyph census. It does not treat
punctuation or marginal numerals as GP rune glyphs.
"""
import argparse
import json
from collections import Counter
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_IMAGES = ROOT / "resources" / "liber-primus"
RED_RUNE_PAGES = {0, 3, 6, 7, 8, 15, 23, 27, 33, 39, 40, 53, 54, 56, 57}
EXPECTED_NON_GLYPH = [2, 14, 22, 26, 32, 36, 37, 38, 49, 55]


def run(images: Path) -> dict:
    pages = []
    for page in range(58):
        path = images / f"{page + 17:02d}.jpg"
        with Image.open(path) as image:
            if image.mode != "RGB":
                continue
            rgb = np.asarray(image.convert("RGB"))
        rgb16 = rgb.astype(np.int16)
        red = ((rgb16[:, :, 0] - rgb16[:, :, 1] > 55)
               & (rgb16[:, :, 0] - rgb16[:, :, 2] > 55)
               & (rgb16[:, :, 0] > 110))
        ys, xs = np.where(red)
        if len(xs) < 100:
            continue
        x0, y0 = max(0, int(xs.min())-2), max(0, int(ys.min())-2)
        x1, y1 = min(2400, int(xs.max())+3), min(3600, int(ys.max())+3)
        core = cv2.erode(red[y0:y1, x0:x1].astype(np.uint8),
                         np.ones((3, 3), np.uint8), iterations=1) > 0
        if int(core.sum()) < 100:
            continue
        pixels = rgb16[y0:y1, x0:x1][core]

        # Matched neutral paper from the 24-pixel annulus around the red envelope.
        bx0, by0 = max(0, x0-24), max(0, y0-24)
        bx1, by1 = min(2400, x1+24), min(3600, y1+24)
        yy, xx = np.ogrid[by0:by1, bx0:bx1]
        ring = ((xx < x0) | (xx >= x1) | (yy < y0) | (yy >= y1))
        region = rgb16[by0:by1, bx0:bx1]
        neutral = (ring & (region.mean(axis=2) > 165)
                   & ((region.max(axis=2)-region.min(axis=2)) < 25))
        if int(neutral.sum()) < 5:
            raise AssertionError((page, "no neutral local background"))
        lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
        delta = (np.median(lab[y0:y1, x0:x1][core], axis=0)
                 - np.median(lab[by0:by1, bx0:bx1][neutral], axis=0))
        mode, mode_count = Counter(map(tuple, pixels.tolist())).most_common(1)[0]
        pages.append({
            "page": page,
            "kind": "annotated-rune-page" if page in RED_RUNE_PAGES else "non-glyph-red-page",
            "core_pixels": int(core.sum()),
            "mode_rgb": [int(v) for v in mode],
            "mode_count": int(mode_count),
            "mode_fraction": round(mode_count / int(core.sum()), 4),
            "median_rgb": [int(round(float(v))) for v in np.median(pixels, axis=0)],
            "background_rgb": [int(round(float(v))) for v in np.median(region[neutral], axis=0)],
            "lab_delta": [round(float(v), 3) for v in delta],
        })

    pages.sort(key=lambda row: row["page"])
    observed = [row["page"] for row in pages]
    non_glyph = [row["page"] for row in pages if row["kind"] == "non-glyph-red-page"]
    modes = Counter(tuple(row["mode_rgb"]) for row in pages)
    if len(pages) != 25 or non_glyph != EXPECTED_NON_GLYPH:
        raise AssertionError({"page_count": len(pages), "non_glyph_pages": non_glyph})
    if modes != Counter({(192, 0, 0): 23, (193, 0, 0): 2}):
        raise AssertionError(modes)
    if any(row["background_rgb"] != [255, 255, 255] for row in pages):
        raise AssertionError("non-white matched background")
    return {
        "method": "signed red chroma cut R-G>55, R-B>55, R>110; 3x3 erosion; 24px local neutral annulus; OpenCV 8-bit Lab delta",
        "red_core_pages": observed,
        "red_core_page_count": len(pages),
        "non_glyph_red_pages": non_glyph,
        "page_mode_counts": {str(k): v for k, v in modes.items()},
        "pages": pages,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--images", type=Path, default=DEFAULT_IMAGES)
    args = parser.parse_args()
    print(json.dumps(run(args.images), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
