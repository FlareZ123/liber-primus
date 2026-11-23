"""Check whether the sixteen original LP2 floral borders vary with page content.

Run from a repository checkout with Pillow and NumPy installed. This is a
source-image invariant, not a claimed original cryptographic decoder.
"""
from hashlib import sha256
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
FIRST_JPEG = 57  # LP2 physical page 40, first floral page
LAST_JPEG = 72   # LP2 physical page 55, last floral page
SHAPE = (3600, 2400, 3)


def load_original(jpeg_number: int) -> np.ndarray:
    with Image.open(SOURCE / f"{jpeg_number:02}.jpg") as im:
        rgb = np.asarray(im.convert("RGB"), dtype=np.uint8)
    assert rgb.shape == SHAPE, (jpeg_number, rgb.shape)
    return rgb


def digest(data: np.ndarray) -> str:
    return sha256(data.tobytes()).hexdigest()


def main() -> None:
    reference = load_original(FIRST_JPEG)
    all_variation = np.zeros(SHAPE[:2], dtype=bool)
    left = reference[650:3000, :550]
    right = reference[650:3000, 1850:]
    print(f"Image shape RGB: {reference.shape}")
    print(f"Left border crop SHA256:  {digest(left)}")
    print(f"Right border crop SHA256: {digest(right)}")
    for number in range(FIRST_JPEG, LAST_JPEG + 1):
        image = load_original(number)
        assert np.array_equal(image[650:3000, :550], left), number
        assert np.array_equal(image[650:3000, 1850:], right), number
        changed = np.any(image != reference, axis=2)
        all_variation |= changed
        print(f"LP2 p{number - 17}: {int(changed.sum())} RGB-different pixels")
    ys, xs = np.nonzero(all_variation)
    assert xs.size > 0
    bbox = (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))
    n_changed = int(all_variation.sum())
    n_identical = all_variation.size - n_changed
    print(f"Union varying-pixel bounding box x0,y0,x1,y1: {bbox}")
    print(f"Varying pixels across 16 pages: {n_changed}/{all_variation.size}")
    print(f"Invariant pixels across 16 pages: {n_identical}/{all_variation.size}")
    assert bbox == (591, 624, 1831, 3183), bbox
    assert n_changed == 2631883, n_changed
    assert n_identical == 6008117, n_identical
    print("PASS: both floral side crops are exactly identical on all 16 pages")


if __name__ == "__main__":
    main()
