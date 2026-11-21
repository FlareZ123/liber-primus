"""Source-only 180-degree cross duplication test on original LP2 p0-p2 JPGs.

Requires Pillow and NumPy. Reads repository originals, writes no files.
This is an image-layout audit, not a runic decipherment.
"""
from hashlib import sha256
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
EXPECTED_SHA256 = {
    17: "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
    18: "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f",
    19: "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
}

# Coordinates on 2400x3600 originals: x0,y0,x1,y1, x1/y1 exclusive.
LEFT = (57, 1684, 547, 2960)
RIGHT = (1853, 640, 2343, 1916)
THRESHOLD = 130


def crop(image, rect):
    x0, y0, x1, y1 = rect
    return image[y0:y1, x0:x1]


def iou(a, b):
    a_ink = a < THRESHOLD
    b_ink = b < THRESHOLD
    return np.logical_and(a_ink, b_ink).sum() / np.logical_or(a_ink, b_ink).sum()


for image_index, expected_hash in EXPECTED_SHA256.items():
    image_bytes = (SOURCE / f"{image_index}.jpg").read_bytes()
    assert sha256(image_bytes).hexdigest() == expected_hash, image_index
    with Image.open(SOURCE / f"{image_index}.jpg") as source:
        image = np.asarray(source.convert("L"), dtype=np.uint8)

    left = crop(image, LEFT)
    right = crop(image, RIGHT)
    assert left.shape == right.shape == (1276, 490)
    right_rotated = right[::-1, ::-1]
    direct_corr = float(np.corrcoef(left.ravel(), right.ravel())[0, 1])
    rotated_corr = float(np.corrcoef(left.ravel(), right_rotated.ravel())[0, 1])
    rotated_iou = float(iou(left, right_rotated))
    mean_absolute_error = float(
        np.mean(np.abs(left.astype(np.int16) - right_rotated.astype(np.int16)))
    )
    assert direct_corr < 0.1, (image_index, direct_corr)
    assert rotated_corr > 0.995, (image_index, rotated_corr)
    assert rotated_iou > 0.98, (image_index, rotated_iou)
    print(
        f"scan={image_index} source_sha256={expected_hash} "
        f"direct_corr={direct_corr:.9f} rotated_corr={rotated_corr:.9f} "
        f"rotated_iou={rotated_iou:.9f} mean_abs_error={mean_absolute_error:.9f}"
    )

print("PASS: paired three-bar crosses are exact-design 180-degree rotations on p0-p2.")
