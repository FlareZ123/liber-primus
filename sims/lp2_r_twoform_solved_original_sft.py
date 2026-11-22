"""LP2 original-R morphology: solved-control allograph decision.

Single-file SFT, Windows 11 / Python 3.12 / Pillow / NumPy / OpenCV.
Run from the repository checkout (normal source JPEGs in resources):
  python sims/lp2_r_twoform_solved_original_sft.py
Or pass --archive PATH_TO_ORIGINAL_JPEGS_ZIP.

The original p17 ᚱ copies in independent image classes 15 and 31 are the
frozen source-prototype pair. Their shapes are tested against original
p0,p7,p27,p54 and independently known *plaintext* p56,p57. Original
coordinates and independent Round9 classes are frozen without scoring
unknown plaintext or tuning a GP29 key. The finite result is an overt
font-variant obstruction; it is not a ciphertext decryption.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

# physical page, independently derived ᚱ morphological class, source bitmap bbox
PROTOTYPES = [
    (17, 15, (1043, 862, 34, 113)),
    (17, 31, (1604, 861, 35, 114)),
]
UNKNOWN = [
    (0, 15, (816, 2745, 35, 114)),
    (0, 31, (1428, 2745, 35, 114)),
    (7, 15, (1295, 897, 35, 114)),
    (7, 31, (1610, 1274, 35, 114)),
    (27, 15, (1091, 1482, 35, 114)),
    (27, 31, (1470, 1482, 35, 114)),
    (54, 15, (1278, 2424, 34, 113)),
    (54, 31, (1138, 2423, 35, 114)),
]
# Authentic solved p56 prime-totient text contains five literal R runes.
# Cleartext p57 PARABLE contains six literal R runes. Their original labels
# are independently established, not inferred from the class prototypes.
SOLVED = [
    (56, 31, (925, 673, 35, 113)),
    (56, 15, (1158, 1890, 34, 114)),
    (56, 15, (1306, 1890, 34, 114)),
    (56, 15, (1072, 2078, 34, 114)),
    (56, 15, (1289, 2078, 35, 114)),
    (57, 15, (928, 918, 34, 113)),
    (57, 15, (1511, 1106, 34, 114)),
    (57, 31, (1549, 1350, 35, 114)),
    (57, 15, (905, 1538, 35, 114)),
    (57, 15, (1211, 1538, 35, 114)),
    (57, 31, (1496, 1726, 35, 114)),
]


def read_original(page: int, zip_file: ZipFile | None) -> np.ndarray:
    name = f"{page+17:02}.jpg"
    if zip_file:
        with zip_file.open("liber-primus-jpegs/" + name) as fp:
            image = np.asarray(Image.open(fp).convert("L"))
    else:
        image = np.asarray(
            Image.open(ROOT / "resources" / "liber-primus" / name).convert("L")
        )
    assert image.shape == (3600, 2400)
    return image


def shape(image: np.ndarray, rectangle: tuple[int, int, int, int]) -> np.ndarray:
    x, y, w, h = rectangle
    assert 0 <= x <= 2400 - w and 0 <= y <= 3600 - h
    assert w <= 45 and h <= 120
    result = np.zeros((120, 45), dtype=np.uint8)
    result[:h, :w] = (image[y:y+h, x:x+w] < 128).astype(np.uint8)
    assert result.sum() > 1000
    return result


def overlap(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.logical_and(a, b).sum() / np.logical_or(a, b).sum())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--archive", type=Path)
    options = ap.parse_args()
    all_sites = PROTOTYPES + UNKNOWN + SOLVED
    z = ZipFile(options.archive) if options.archive else None
    images = {}
    for page in sorted(set(p for p, _, _ in all_sites)):
        images[page] = read_original(page, z)
    if z:
        z.close()
    glyphs = {(page, rect): shape(images[page], rect)
              for page, _, rect in all_sites}
    form15 = glyphs[(PROTOTYPES[0][0], PROTOTYPES[0][2])]
    form31 = glyphs[(PROTOTYPES[1][0], PROTOTYPES[1][2])]
    prototype_iou = overlap(form15, form31)
    assert abs(prototype_iou - 0.9013953488372093) < 1e-12
    kernel = np.ones((3, 3), dtype=np.uint8)
    # Every ink pixel from one purported "alternate rune" lies within
    # one original output pixel of the other form's same stroke.
    assert np.count_nonzero(form15 & (cv2.dilate(form31, kernel) == 0)) == 0
    assert np.count_nonzero(form31 & (cv2.dilate(form15, kernel) == 0)) == 0

    results = []
    for page, expected, rect in UNKNOWN + SOLVED:
        candidate = glyphs[(page, rect)]
        a = overlap(candidate, form15)
        b = overlap(candidate, form31)
        chosen = 15 if a > b else 31
        assert chosen == expected, (page, rect, expected, chosen, a, b)
        results.append({"page": page, "class": chosen, "bbox": list(rect),
                        "overlap15": round(a, 6), "overlap31": round(b, 6)})
    assert len(results) == 19
    for page, count in ((56, 5), (57, 6)):
        subset = [r for r in results if r["page"] == page]
        assert len(subset) == count
        assert {r["class"] for r in subset} == {15, 31}
    for page in (0, 7, 27, 54):
        assert {r["class"] for r in results if r["page"] == page} == {15, 31}

    # The other previously unmapped original-image class0 is merely a
    # duplicate of the canonical GP I (ᛁ) class11 at source raster scale.
    # Original p0/p7/p17/p54 9x114 text glyphs are entirely pixel-identical.
    i_sites = [
        (0, 0, (1320, 1426, 9, 114)),
        (7, 0, (1189, 897, 9, 114)),
        (7, 11, (1108, 1274, 9, 114)),
        (17, 11, (687, 861, 9, 114)),
        (54, 0, (1118, 917, 9, 114)),
    ]
    i_masks = []
    for page, image_class, (x, y, w, h) in i_sites:
        exact = (images[page][y:y+h, x:x+w] < 128).astype(np.uint8)
        assert exact.shape == (114, 9)
        assert int(exact.sum()) == 1026, (page, image_class)
        i_masks.append(exact)
    assert all(np.array_equal(i_masks[0], m) for m in i_masks)

    # An actual added isolated key-bit stem has a readily measurable
    # signature; this artificial control is not source data.
    planted = form15.copy()
    planted[25:47, 37:43] = 1
    assert max(overlap(planted, form15), overlap(planted, form31)) < 0.97

    print("PASS: two R bitmap classes on all four original unknown pages")
    print("PASS: both R bitmap classes also occur on each independently solved page")
    print(json.dumps({
        "training_page": 17, "training_form_IoU": prototype_iou,
        "both_training_forms_same_strokes_to_one_pixel": True,
        "canonical_I_and_extra_class0_identical_source_pixels": True,
        "solved_R_form_counts": {
            str(p): {str(c): sum(r["page"] == p and r["class"] == c
                                for r in results) for c in (15, 31)}
            for p in (56, 57)
        },
        "heldout_samples": results,
        "conclusion": "Both putative R glyph alternates appear in authenticated plaintext. Their one-pixel stroke differences have no selected key/decoder."
    }, indent=2))


if __name__ == "__main__":
    main()
