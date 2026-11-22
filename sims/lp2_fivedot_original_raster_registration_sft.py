"""
Five-dot original-JPEG registration: p7 -> p23 vertical reflection and
p7 -> solved p56 horizontal reflection plus offset.

This tests whether these are three independently designed coordinate
diagrams or repeated graphic artwork. The original raster is retained.

Run from repository root (Python 3.11+, Pillow, NumPy):
    python sims/lp2_fivedot_original_raster_registration_sft.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = {
    7: (24, "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c"),
    23: (40, "d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee"),
    56: (73, "a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc"),
}


def read_original(page: int) -> np.ndarray:
    scan, expected_sha256 = ORIGINALS[page]
    image_file = ROOT / "resources" / "liber-primus" / f"{scan:02}.jpg"
    payload = image_file.read_bytes()
    assert hashlib.sha256(payload).hexdigest() == expected_sha256
    image = np.asarray(Image.open(image_file).convert("L"))
    assert image.shape == (3600, 2400)
    return image


def iou(source: np.ndarray, target: np.ndarray) -> float:
    shared = np.count_nonzero(source & target)
    union = np.count_nonzero(source | target)
    assert union > 0
    return float(shared / union)


def main() -> None:
    """Test source-registered five-dot image template against wrong transforms."""
    a = read_original(7)
    b = read_original(23)
    c = read_original(56)

    # Original p7 five-dot artwork occupies the lower portion of scan 24.
    # Restrict to all five circles and no adjacent text or ornament.
    y, x = np.mgrid[2800:3230, 750:1590]
    base = a[y, x] < 105
    assert int(base.sum()) == 17803

    # Source-known dot centres obey (x, y) -> (x, 3674-y) on p23.
    vertical_copy = b[3674 - y, x] < 105

    # Source-known dot centres obey (x, y) -> (2401-x, y-419)
    # on solved p56: same five discs in horizontally flipped placement.
    horizontal_copy = c[y - 419, 2401 - x] < 105

    # Wrong-transform controls preserve size/shape of both raster regions.
    p23_unflipped = b[y - 2415, x] < 105
    p56_unflipped = c[y - 419, x] < 105

    mirrored_p23 = iou(base, vertical_copy)
    mirrored_p56 = iou(base, horizontal_copy)
    wrong_p23 = iou(base, p23_unflipped)
    wrong_p56 = iou(base, p56_unflipped)

    assert abs(mirrored_p23 - 0.989491335941867) < 1e-12
    assert abs(mirrored_p56 - 0.9651342689799978) < 1e-12
    assert wrong_p23 < 0.03
    assert wrong_p56 < 0.01

    report = {
        "source_originals": ["24.jpg=p7", "40.jpg=p23", "73.jpg=p56"],
        "p7_mask_pixels": int(base.sum()),
        "original_threshold": 105,
        "original_pixel_roi": {"x": [750, 1590], "y": [2800, 3230]},
        "p7_to_p23": {"mapping": "[x,3674-y]", "IoU": mirrored_p23,
                        "unmirrored_IoU": wrong_p23},
        "p7_to_p56": {"mapping": "[2401-x,y-419]", "IoU": mirrored_p56,
                        "unmirrored_IoU": wrong_p56},
        "conclusion": "The same five-dot raster template recurs under geometric reflections; the layout does not independently specify a cipher key."
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
