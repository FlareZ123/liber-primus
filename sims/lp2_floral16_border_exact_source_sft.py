"""Original LP2 floral-border raster identity, independent sixteen-page gate.

Requires original repo JPGs 56.jpg–73.jpg, Pillow and NumPy. This is a
source-image operation, never reads a derived rune transcription. Read-only.
"""
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"


def border(page):
    original = np.asarray(Image.open(ROOT / f"{page + 17}.jpg").convert("L"))
    assert original.shape == (3600, 2400), (page, original.shape)
    return np.hstack((
        original[600:3050, 100:560],
        original[600:3050, 1850:2310],
    ))


reference = border(40)
assert reference.shape == (2450, 920)
assert int((reference < 200).sum()) == 243614
digest = hashlib.sha256(reference.tobytes()).hexdigest()
assert digest == "75ba259e3537a909e3b54f2985331587bda0d36d8beca1ea4972585d43bad85f"

same = []
for p in range(40, 56):
    if np.array_equal(border(p), reference):
        same.append(p)
assert same == list(range(40, 56)), same

negative = {
    p: int(np.count_nonzero(border(p) != reference))
    for p in [39, 56]
}
assert negative == {39: 360223, 56: 360223}, negative

print(json.dumps({
    "scope": "Original LP2 scans 57.jpg–72.jpg; 2400x3600 pixels",
    "scan_color_normalization": "Pillow convert('L') from the original RGB/L JPEG",
    "two_source_border_windows": [
        {"x": [100, 560], "y": [600, 3050]},
        {"x": [1850, 2310], "y": [600, 3050]},
    ],
    "page_pixel_count": int(reference.size),
    "nonwhite_reference_pixels_below_200": int((reference < 200).sum()),
    "border_sha256_each": digest,
    "all_sixteen_exact_pages": same,
    "preceding_and_following_controls": negative,
    "result": "Sixteen source floral borders match pixel-for-pixel. This rules out page-varying information in these unchanged margin pixels only, not within original text or artwork elsewhere.",
}, indent=2))
