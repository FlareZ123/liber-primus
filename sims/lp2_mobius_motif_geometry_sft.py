#!/usr/bin/env python3
"""Bounded original-JPEG geometry audit of the LP2 infinity/Mobius-like mark.

This tests only source-visible shape/orientation. It does not search cipher keys,
seams, grids, or plaintext. Archive scan N+17 is LP2 physical page N.
Requires Pillow; run from repository root:
  python sims/lp2_mobius_motif_geometry_sft.py
Optional argument: directory containing 17.jpg, 18.jpg, 19.jpg, 32.jpg.
"""
from __future__ import annotations

import sys
from pathlib import Path
from PIL import Image, ImageChops

THRESHOLD = 160
NORMAL_SIZE = (320, 112)
SMALL_ROIS = {
    ("p0", "top"): (1125, 615, 1255, 665),
    ("p0", "bottom"): (1125, 2940, 1255, 2990),
    ("p1", "top"): (1125, 615, 1255, 665),
    ("p1", "bottom"): (1125, 2940, 1255, 2990),
    ("p2", "top"): (1125, 615, 1255, 665),
    ("p2", "bottom"): (1125, 2940, 1255, 2990),
}
FILES = {"p0": "17.jpg", "p1": "18.jpg", "p2": "19.jpg", "p15": "32.jpg"}
P15_ROI = (700, 1450, 1600, 1730)
TRANSFORMS = {
    "identity": lambda im: im,
    "horizontal_flip": lambda im: im.transpose(Image.Transpose.FLIP_LEFT_RIGHT),
    "vertical_flip": lambda im: im.transpose(Image.Transpose.FLIP_TOP_BOTTOM),
    "rotate_180": lambda im: im.transpose(Image.Transpose.ROTATE_180),
    "rotate_90": lambda im: im.transpose(Image.Transpose.ROTATE_90),
    "rotate_270": lambda im: im.transpose(Image.Transpose.ROTATE_270),
    "transpose": lambda im: im.transpose(Image.Transpose.TRANSPOSE),
    "transverse": lambda im: im.transpose(Image.Transpose.TRANSVERSE),
}


def threshold_mask(image: Image.Image) -> Image.Image:
    return image.convert("L").point(lambda value: 255 if value < THRESHOLD else 0, mode="L")


def tight_crop(image: Image.Image, roi: tuple[int, int, int, int]) -> tuple[Image.Image, tuple[int, int, int, int]]:
    x0, y0, x1, y1 = roi
    region = image.crop(roi).convert("L")
    bbox = threshold_mask(region).getbbox()
    if bbox is None:
        raise AssertionError(f"no mark found in ROI {roi}")
    bx0, by0, bx1, by1 = bbox
    absolute = (x0 + bx0, y0 + by0, x0 + bx1, y0 + by1)
    return region.crop(bbox), absolute


def normalized_mask(image: Image.Image, transform: str = "identity") -> bytes:
    transformed = TRANSFORMS[transform](image)
    resized = transformed.resize(NORMAL_SIZE, Image.Resampling.LANCZOS).convert("L")
    return bytes(1 if value < THRESHOLD else 0 for value in resized.tobytes())


def iou(a: bytes, b: bytes) -> float:
    intersection = sum(x and y for x, y in zip(a, b))
    union = sum(x or y for x, y in zip(a, b))
    return intersection / union if union else 1.0


def best_alignment(reference: Image.Image, candidate: Image.Image) -> tuple[float, str, float]:
    ref = normalized_mask(reference)
    scores = {name: iou(ref, normalized_mask(candidate, name)) for name in TRANSFORMS}
    best_name = max(scores, key=scores.get)
    alternative = max(value for name, value in scores.items() if name != "identity")
    return scores["identity"], best_name, alternative


def main() -> None:
    source_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("resources/liber-primus")
    images = {page: Image.open(source_dir / filename).convert("RGB") for page, filename in FILES.items()}
    for page, image in images.items():
        if image.size != (2400, 3600):
            raise AssertionError(f"{FILES[page]} has unexpected dimensions {image.size}")

    marks: dict[tuple[str, str], Image.Image] = {}
    boxes: dict[tuple[str, str], tuple[int, int, int, int]] = {}
    raw_crops: dict[tuple[str, str], Image.Image] = {}
    for key, roi in SMALL_ROIS.items():
        raw_crops[key] = images[key[0]].crop(roi).convert("L")
        marks[key], boxes[key] = tight_crop(images[key[0]], roi)

    p15, p15_box = tight_crop(images["p15"], P15_ROI)
    reference = marks[("p1", "top")]

    # The page-1/page-2 top crops are exact copies; all three bottom crops
    # are exact copies. Page-0 top is the only different small raster crop.
    assert ImageChops.difference(raw_crops[("p1", "top")], raw_crops[("p2", "top")]).getbbox() is None
    assert ImageChops.difference(raw_crops[("p0", "bottom")], raw_crops[("p1", "bottom")]).getbbox() is None
    assert ImageChops.difference(raw_crops[("p1", "bottom")], raw_crops[("p2", "bottom")]).getbbox() is None

    print("LP2 Möbius-like mark source geometry (threshold=160; normalized=320x112)")
    print("physical page | archive file | position | tight bbox (x0,y0,x1,y1) | identity IoU vs p1-top | best D4 transform | best nonidentity IoU")
    for key in SMALL_ROIS:
        identity, best, alt = best_alignment(reference, marks[key])
        print(f"{key[0]:>13} | {FILES[key[0]]:>12} | {key[1]:>8} | {boxes[key]} | {identity:.6f} | {best} | {alt:.6f}")
        assert best == "identity", f"unexpected orientation change in {key}: {best}"
        assert identity > alt + 0.25

    p15_identity, p15_best, p15_alt = best_alignment(reference, p15)
    print(f"{'p15':>13} | {FILES['p15']:>12} | {'center':>8} | {p15_box} | {p15_identity:.6f} | {p15_best} | {p15_alt:.6f}")
    assert p15_best == "identity", f"p15 mark changes orientation: {p15_best}"
    assert p15_identity > p15_alt + 0.25

    print("PASS: all seven marks retain the same left-right orientation; no mirrored/rotated instance or unique source-marked seam was found.")
    print("Scope: this establishes only the repeated artwork geometry. It does not establish the symbol's intended semantics or a cipher operation.")


if __name__ == "__main__":
    main()
