#!/usr/bin/env python3
"""Fixed-crop SFT for the repeated LP1/LP2 cicada artwork.

Uses original JPEG coordinates, grayscale thresholding and 8-connected
component filtering only. No OCR, resizing, language scoring, or cipher fitting.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import numpy as np
from PIL import Image

CROPS = {
    9:  (842, 1940, 1516, 2176),
    13: (860, 1084, 1534, 1320),
    16: (866, 1460, 1540, 1696),
    19: (885, 2647, 1559, 2883),  # LP2 page 2
}
P15_CROPS = {
    "left":  (918, 1958, 1154, 2632),
    "right": (1246, 1958, 1482, 2632),
}


def component_mask(binary: np.ndarray, min_area: int = 500):
    h, w = binary.shape
    seen = np.zeros((h, w), dtype=np.bool_)
    kept = np.zeros((h, w), dtype=np.uint8)
    areas = []
    ys, xs = np.nonzero(binary)
    for y0, x0 in zip(ys.tolist(), xs.tolist()):
        if seen[y0, x0]:
            continue
        stack = [(y0, x0)]
        seen[y0, x0] = True
        comp = []
        while stack:
            y, x = stack.pop()
            comp.append((y, x))
            for dy in (-1, 0, 1):
                ny = y + dy
                if not 0 <= ny < h:
                    continue
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    nx = x + dx
                    if 0 <= nx < w and not seen[ny, nx] and binary[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
        if len(comp) >= min_area:
            areas.append(len(comp))
            cy, cx = zip(*comp)
            kept[np.asarray(cy), np.asarray(cx)] = 1
    return kept, sorted(areas, reverse=True)


def load(image_dir: Path, page: int, box):
    path = image_dir / f"{page:02d}.jpg"
    image = Image.open(path).convert("L")
    assert image.size == (2400, 3600), (path, image.size)
    crop = np.asarray(image.crop(box), dtype=np.uint8)
    return component_mask(crop < 140)


def metrics(a, b):
    xor = int(np.logical_xor(a, b).sum())
    inter = int(np.logical_and(a, b).sum())
    union = int(np.logical_or(a, b).sum())
    return {
        "xor_pixels": xor,
        "foreground_a": int(a.sum()),
        "foreground_b": int(b.sum()),
        "pixel_agreement": float(np.mean(a == b)),
        "iou": float(inter / union) if union else 1.0,
    }


def mobius(n: int) -> int:
    if n == 1:
        return 1
    sign, p = 1, 2
    while p * p <= n:
        if n % p == 0:
            n //= p
            sign = -sign
            if n % p == 0:
                return 0
            while n % p == 0:
                n //= p
        p += 1
    return -sign if n > 1 else sign


def omega(n: int) -> int:
    count, p = 0, 2
    while p * p <= n:
        if n % p == 0:
            count += 1
            while n % p == 0:
                n //= p
        p += 1
    return count + (1 if n > 1 else 0)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image-dir", type=Path, default=Path("resources/liber-primus"))
    args = parser.parse_args()

    masks, areas = {}, {}
    for page, box in CROPS.items():
        masks[page], areas[page] = load(args.image_dir, page, box)
        assert masks[page].shape == (236, 674), (page, masks[page].shape)
        assert len(areas[page]) == 10, (page, areas[page])

    p15, p15_areas = {}, {}
    for side, box in P15_CROPS.items():
        p15[side], p15_areas[side] = load(args.image_dir, 15, box)
        assert p15[side].shape == (674, 236), (side, p15[side].shape)
        assert len(p15_areas[side]) == 10, (side, p15_areas[side])

    base = masks[16]
    results = {
        "LP1_p9_equals_LP1_p16": metrics(masks[9], base),
        "LP1_p13_equals_horizontal_flip_p16": metrics(masks[13], np.fliplr(base)),
        "LP2_p2_equals_horizontal_flip_p16": metrics(masks[19], np.fliplr(base)),
        "LP1_p15_left_equals_vertical_flip_then_90cw_p16": metrics(p15["left"], np.rot90(np.flipud(base), k=-1)),
        "LP1_p15_right_equals_90cw_p16": metrics(p15["right"], np.rot90(base, k=-1)),
    }
    assert np.array_equal(masks[9], base), results
    assert np.array_equal(masks[13], np.fliplr(base)), results
    for key in list(results)[2:]:
        assert results[key]["xor_pixels"] == 35 and results[key]["iou"] > 0.999, (key, results[key])

    pages = (2, 9, 13, 15, 16)
    page_mu = {n: mobius(n) for n in pages}
    page_omega = {n: omega(n) for n in pages}
    copy_counts = {2: 1, 9: 1, 13: 1, 15: 2, 16: 1}
    assert page_mu == {2: -1, 9: 0, 13: -1, 15: 1, 16: 0}
    assert page_omega == copy_counts

    print({
        "source": "original LP1 pages 9,13,15,16 and LP2 page 2 (image file 19)",
        "threshold": "grayscale < 140",
        "component_filter": "8-connected components, area >= 500 pixels",
        "page_mobius": page_mu,
        "page_distinct_prime_factor_count": page_omega,
        "observed_cicada_copy_count": copy_counts,
        "transformed_mask_comparisons": results,
        "retained_component_areas": {str(k): v for k, v in areas.items()},
        "p15_component_areas": p15_areas,
        "interpretation": "identity / horizontal reflection / paired quarter-turns align with μ(page)=0/-1/+1; correlation is not an established cipher rule",
    })


if __name__ == "__main__":
    main()
