"""Source-image SFT for scroll pp3–7 and floral pp40–55.

Read-only. Requires Pillow and NumPy. Original archive JPEGs must exist under
resources/liber-primus/ as 20.jpg–24.jpg and 57.jpg–72.jpg.

These tests locate repeated *decoration-only* raster strips, not a cipher.
"""
from __future__ import annotations

from hashlib import sha256
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "resources" / "liber-primus"


def image(page: int) -> np.ndarray:
    """Read physical LP2 source page at native resolution."""
    with Image.open(IMAGES / f"{page + 17:02d}.jpg") as img:
        assert img.size == (2400, 3600), (page, img.size)
        return np.asarray(img.convert("RGB"), dtype=np.uint8).copy()


def strips(a: np.ndarray, boxes: tuple[tuple[int, int, int, int], ...]) -> np.ndarray:
    """Flatten RGB strip boxes in the printed reading order."""
    return np.concatenate([a[y0:y1, x0:x1].reshape(-1, 3) for x0, y0, x1, y1 in boxes])


def fingerprint(a: np.ndarray) -> str:
    return sha256(a.tobytes()).hexdigest()


SCROLL_BOXES = ((0, 450, 500, 3150), (1900, 450, 2400, 3150))
SCROLL_HASHES = {
    3: "ae55016020bf50051ff2e8bcc7419682b3056924ec7e09e3269566d0b80fa4e",
    4: "6d056e4a99d82c54978ae2ac55c22e02a72317b2c717e7e65c417bb7e86f2b2",
}
FLORAL_BOXES = ((0, 600, 565, 3000), (1835, 600, 2400, 3000))
FLORAL_HASH = "b401a0c150f1255c3fb3448dc5f89c342281e508a6f360a3c93f3e84e2db6ea6"

print("SCROLL source pages p3–p7 (archive 20–24.jpg)")
first_scroll = None
second_scroll = None
for p in range(3, 8):
    a = image(p)
    crop = strips(a, SCROLL_BOXES)
    actual = fingerprint(crop)
    expected = SCROLL_HASHES[3 if p == 3 else 4]
    assert actual == expected, (p, actual, expected)
    left = a[450:3150, :500].astype(np.float32).mean(axis=2)
    right = a[450:3150, 1900:].astype(np.float32).mean(axis=2)[:, ::-1]
    # Grayscale used for opacity and mirror test, not for raw RGB identity.
    with Image.fromarray(a[450:3150, :500], "RGB") as im:
        left_grey = np.asarray(im.convert("L"), dtype=np.uint8)
    with Image.fromarray(a[450:3150, 1900:], "RGB") as im:
        right_grey = np.asarray(im.convert("L"), dtype=np.uint8)[:, ::-1]
    mask_xor = int(np.count_nonzero((left_grey < 128) ^ (right_grey < 128)))
    assert mask_xor == (32 if p == 3 else 38), (p, mask_xor)
    print(f"  p{p}: strips SHA256={actual}; mirror black-mask disagreements={mask_xor}/1,350,000")
    if p == 3:
        first_scroll = crop.copy()
    elif p == 4:
        second_scroll = crop.copy()
    else:
        assert np.array_equal(crop, second_scroll)
assert first_scroll is not None and second_scroll is not None
difference = np.abs(first_scroll.astype(np.int16) - second_scroll.astype(np.int16))
changed = int(np.count_nonzero(np.any(difference != 0, axis=1)))
assert changed == 173066, changed
print(f"  p3 vs common p4–7: {changed:,} changed RGB pixels over both strips; the two sides change symmetrically")

print("FLORAL source pages p40–p55 (archive 57–72.jpg)")
for p in range(40, 56):
    crop = strips(image(p), FLORAL_BOXES)
    actual = fingerprint(crop)
    assert actual == FLORAL_HASH, (p, actual)
print(f"  16/16 pages have exact same left+right template SHA256={FLORAL_HASH}")

# A positive source-only local stroke edit is always detected by the hash.
plant = crop.copy()
plant[0, 0] ^= 255
assert fingerprint(plant) != FLORAL_HASH
print("PASS: repeated original decoration templates verified; an independent one-pixel marker is detected.")
