"""Frozen original LP2 p40-p55 floral arithmetic mean image test.

Python 3, Pillow, numpy, filelock. One 2014-era image choice and one
literal Mean PNG consumer; no registration, subset or threshold search.
"""

from __future__ import annotations

import hashlib
import json
import os
from io import BytesIO
from pathlib import Path
import tempfile
from zipfile import ZipFile

from filelock import FileLock
import numpy as np
from PIL import Image


FILES = tuple(f"{n:02}.jpg" for n in range(57, 73))
EXPECTED_PIXEL_SHA256 = "1df3e6a9cd49cd2d09a9c945077e3877b956651d4b25cb38dcf9c9be9a26c259"
EXPECTED_PERSISTENT_PIXELS = 6008117
CANVAS = (3600, 2400, 3)


def read_images(source: Path):
    """Iterate exact original JPEGs from repository directory or maintainer ZIP."""
    if source.is_dir():
        for filename in FILES:
            with Image.open(source / filename) as image:
                yield np.asarray(image.convert("RGB"), dtype=np.uint8)
    else:
        with ZipFile(source) as archive:
            for filename in FILES:
                with Image.open(BytesIO(archive.read(f"liber-primus-jpegs/{filename}"))) as image:
                    yield np.asarray(image.convert("RGB"), dtype=np.uint8)


def reproduce(source: Path, destination: Path) -> dict:
    """Fixed equal-weight RGB arithmetic mean and locked atomic PNG write."""
    accum = np.zeros(CANVAS, dtype=np.uint32)
    fixed = np.ones(CANVAS[:2], dtype=bool)
    first = None
    count = 0
    for rgb in read_images(source):
        if rgb.shape != CANVAS:
            raise ValueError(f"Unexpected JPEG dimensions: {rgb.shape}")
        if first is None:
            first = rgb.copy()
        fixed &= np.all(rgb == first, axis=2)
        accum += rgb.astype(np.uint32)
        count += 1
    assert count == 16
    mean = ((accum + 8) // 16).astype(np.uint8)  # nearest, half-up
    pixel_sha = hashlib.sha256(mean.tobytes()).hexdigest()
    if pixel_sha != EXPECTED_PIXEL_SHA256:
        raise AssertionError(f"Unexpected original mean pixel SHA256: {pixel_sha}")
    fixed_count = int(fixed.sum())
    if fixed_count != EXPECTED_PERSISTENT_PIXELS:
        raise AssertionError(f"Unexpected unchanged-pixel count: {fixed_count}")

    destination.parent.mkdir(parents=True, exist_ok=True)
    with FileLock(str(destination) + ".lock"):
        with tempfile.NamedTemporaryFile(
            prefix=".meanpng-", suffix=".png", dir=destination.parent, delete=False
        ) as temp:
            staged = Path(temp.name)
        try:
            Image.fromarray(mean).save(staged, format="PNG", optimize=True)
            os.replace(staged, destination)
        finally:
            staged.unlink(missing_ok=True)

    outer = np.ones(CANVAS[:2], dtype=bool)
    outer[600:3000, 500:1900] = False
    return {
        "source_jpegs": list(FILES),
        "source_physical_pages": "LP2 p40-p55",
        "mean_definition": "RGB arithmetic mean, round to nearest half-up",
        "pixel_sha256": pixel_sha,
        "identical_pixels_all_16": fixed_count,
        "identical_pixels_exterior": int(np.count_nonzero(fixed & outer)),
        "exterior_pixel_count": int(np.count_nonzero(outer)),
        "result_png": str(destination),
    }


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    images = root / "resources/liber-primus"
    with tempfile.TemporaryDirectory(prefix="lp2-meanpng-") as temporary:
        stats = reproduce(images, Path(temporary) / "floral-16-mean.png")
        print(json.dumps(stats, indent=2))
        print("PASS original 2014 JPEGs, fixed mean and atomic PNG generation")


if __name__ == "__main__":
    main()
