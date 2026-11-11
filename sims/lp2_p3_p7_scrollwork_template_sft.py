#!/usr/bin/env python3
"""SFT: original LP2 pp3–7 margin scrollwork is a reused JPEG source template."""
from hashlib import sha256
from pathlib import Path
import json

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
BOUNDS = {
    "left": (180, 380, 560, 1500),
    "right": (1840, 380, 2180, 1500),
}
BODY = (700, 600, 1700, 1550)


def mask(image, bounds):
    return np.asarray(image.crop(bounds).convert("L")) < 100


def dilated(binary):
    return np.asarray(Image.fromarray(binary.astype("uint8") * 255).filter(ImageFilter.MaxFilter(5))) > 0


def checked_image(number):
    path = SOURCE / f"{number:02}.jpg"
    raw = path.read_bytes()
    image = Image.open(path).convert("RGB")
    assert image.size == (2400, 3600), path
    return image, sha256(raw).hexdigest()


def main():
    images = {}
    source_hashes = {}
    for number in (20, 21, 22, 23, 24, 73, 74):
        images[number], source_hashes[number] = checked_image(number)
    assert len({source_hashes[number] for number in range(20, 25)}) == 5
    assert len({sha256(images[number].crop(BODY).tobytes()).hexdigest() for number in range(20, 25)}) == 5

    report = {"source_sha256": source_hashes, "margin_checks": {}}
    for label, bounds in BOUNDS.items():
        reference = images[21].crop(bounds).tobytes()
        assert all(images[n].crop(bounds).tobytes() == reference for n in (22, 23, 24))
        a = mask(images[20], bounds)
        b = mask(images[21], bounds)
        union = int(np.count_nonzero(a | b))
        intersection = int(np.count_nonzero(a & b))
        assert int(np.count_nonzero(a)) > 10000
        assert int(np.count_nonzero(b)) > 10000
        assert 0.95 < intersection / union < 0.99
        orphan_a = int(np.count_nonzero(a & ~dilated(b)))
        orphan_b = int(np.count_nonzero(b & ~dilated(a)))
        assert orphan_a == orphan_b == 0
        assert not mask(images[73], bounds).any() and not mask(images[74], bounds).any()
        report["margin_checks"][label] = {
            "crop_xyxy": bounds,
            "pixel_identical_original_jpegs": [21, 22, 23, 24],
            "reference_raster_sha256": sha256(reference).hexdigest(),
            "page20_dark_pixels": int(np.count_nonzero(a)),
            "page21_dark_pixels": int(np.count_nonzero(b)),
            "page20_vs_page21_iou": intersection / union,
            "page20_vs_page21_unmatched_dark_at_radius_2px": [orphan_a, orphan_b],
            "solved_page73_74_dark_pixels": [0, 0],
        }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
