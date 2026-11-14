#!/usr/bin/env python3
"""Pixel-exact comparison of the repeated five-circle ornaments on LP2 pp49-51.

Run from any directory: python sims/lp2_p50_dot_motif_reuse_sft.py
Requires Pillow. The source JPEGs are the repository's original scans.
"""
from __future__ import annotations

import hashlib
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"
PAGES = (66, 67, 68)  # full-scan filenames for LP2 physical pages 49, 50, 51
CROPS = {
    "left_five_circle_ornament": (280, 1400, 540, 1680),
    "right_five_circle_ornament": (1860, 1400, 2120, 1680),
}

images = {}
for page in PAGES:
    image = Image.open(IMAGE_DIR / f"{page:02d}.jpg").convert("L")
    assert image.size == (2400, 3600), (page, image.size)
    images[page] = image

results = {}
for name, box in CROPS.items():
    crops = {page: images[page].crop(box) for page in PAGES}
    reference = crops[PAGES[0]]
    assert reference.size == (260, 280)
    comparisons = []
    for page in PAGES[1:]:
        difference = ImageChops.difference(reference, crops[page])
        assert difference.getbbox() is None, f"{name} differs on image {page}"
        comparisons.append({"image": page, "different_pixels": 0})
    digest = hashlib.sha256(reference.tobytes()).hexdigest()
    results[name] = {
        "box_xyxy_half_open": box,
        "size": reference.size,
        "pixels": reference.width * reference.height,
        "sha256_grayscale_pixels": digest,
        "comparisons_to_image_66": comparisons,
        "identical_on_all_three_pages": True,
    }

print({
    "source_images": [f"{page:02d}.jpg" for page in PAGES],
    "lp2_pages": [49, 50, 51],
    "results": results,
    "decision": (
        "Both bilateral five-circle ornament crops are reused pixel-for-pixel "
        "across all three table pages. They provide no page-varying key bits "
        "and do not specify a nine-state keypad."
    ),
})
