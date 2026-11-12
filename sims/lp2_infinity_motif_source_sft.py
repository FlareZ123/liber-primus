"""Original LP2 infinity mark: six small separators and one larger drawing.

Single-file source-image test:
    python sims/lp2_infinity_motif_source_sft.py
    python sims/lp2_infinity_motif_source_sft.py /path/to/original-jpegs.zip

Requires: numpy, Pillow, OpenCV. Reads original JPEGs, does not modify them.
"""
import hashlib
import io
import json
from pathlib import Path
import sys
import zipfile

import cv2
import numpy as np
from PIL import Image


def read_image(n, archive):
    if archive:
        data = archive.read(f"liber-primus-jpegs/{n:02d}.jpg")
        with Image.open(io.BytesIO(data)) as image:
            return np.asarray(image.convert("L"))
    with Image.open(Path(__file__).resolve().parents[1] / "resources" /
                    "liber-primus" / f"{n:02d}.jpg") as image:
        return np.asarray(image.convert("L"))


def crop(image, box):
    x, y, width, height = box
    return image[y:y + height, x:x + width]


def sha256(array):
    return hashlib.sha256(array.tobytes()).hexdigest()


def iou(one, other):
    return float(np.logical_and(one, other).sum() /
                 np.logical_or(one, other).sum())


def find_small_symbols(image, reference):
    """Original centered glyph aspect and area, with an independent mask check."""
    subset = np.uint8(image[400:3200, 850:1500] < 110)
    _, _, boxes, _ = cv2.connectedComponentsWithStats(
        subset, connectivity=8)
    found = []
    for x, y, w, h, area in boxes[1:]:
        if not (110 <= w <= 130 and 34 <= h <= 50 and
                650 < area < 1200):
            continue
        glyph = subset[y:y + h, x:x + w]
        normalized = cv2.resize(glyph, (115, 41),
                                interpolation=cv2.INTER_NEAREST).astype(bool)
        score = iou(reference, normalized)
        if score > 0.4:
            found.append([int(x + 850), int(y + 400), int(w),
                          int(h), round(score, 6)])
    return found


def match_scaled(reference, giant, orientation):
    if "x" in orientation:
        giant = np.fliplr(giant).copy()
    if "y" in orientation:
        giant = np.flipud(giant).copy()
    target_reference = np.pad(reference, ((50, 50), (50, 50)))
    best = (0.0, None)
    for width in range(109, 123):
        for height in range(37, 46):
            resized = cv2.resize(giant.astype(np.float32),
                                 (width, height),
                                 interpolation=cv2.INTER_AREA) > 0.4
            for dx in range(-7, 8):
                for dy in range(-6, 7):
                    canvas = np.zeros(target_reference.shape, dtype=bool)
                    canvas[50 + dy:50 + dy + height,
                           50 + dx:50 + dx + width] = resized
                    score = iou(target_reference, canvas)
                    if score > best[0]:
                        best = (score, [width, height, dx, dy])
    return {"iou": round(best[0], 9), "size_dx_dy": best[1]}


def main():
    archive = zipfile.ZipFile(sys.argv[1]) if len(sys.argv) > 1 else None
    originals = {n: read_image(n, archive) for n in range(17, 75)}
    small_boxes = {
        17: [(1132, 620, 114, 38), (1132, 2943, 115, 41)],
        18: [(1132, 618, 115, 41), (1132, 2943, 115, 41)],
        19: [(1132, 618, 115, 41), (1132, 2943, 115, 41)]
    }
    small = {n: [crop(originals[n], box) for box in boxes]
             for n, boxes in small_boxes.items()}
    assert np.array_equal(small[18][0], small[19][0])
    assert np.array_equal(small[17][1], small[18][1])
    assert np.array_equal(small[18][1], small[19][1])
    reference = small[18][0] < 110
    found = {str(n - 17): find_small_symbols(originals[n], reference)
             for n in range(17, 75)}
    found = {k: v for k, v in found.items() if v}
    assert {k: len(v) for k, v in found.items()} == {
        "0": 2, "1": 2, "2": 2}
    giant = crop(originals[32], (875, 1510, 551, 187)) < 110
    orientations = {
        name: match_scaled(reference, giant, name)
        for name in ("same", "flip-x", "flip-y", "flip-xy")}
    assert orientations["same"]["iou"] > 0.76
    assert max(orientations[k]["iou"] for k in
               ("flip-x", "flip-y", "flip-xy")) < 0.21
    result = {
        "input": "unchanged original LP2 archive scans 17–74",
        "detected_small_symbols_by_physical_page": found,
        "small_p1_top_equals_p2_top_grayscale": True,
        "all_three_bottom_grayscale_pixel_arrays_identical": True,
        "p1_top_sha256_grayscale": sha256(small[18][0]),
        "p0_to_p2_bottom_sha256_grayscale": sha256(small[17][1]),
        "p15_large_crop_sha256_grayscale": sha256(
            crop(originals[32], (875, 1510, 551, 187))),
        "larger_p15_vs_p1_top_scaled_orientation": orientations,
        "conclusion": ("Same-orientation enlarged infinity ornament; "
                       "no original Mobius seam or cipher consumer")
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
