#!/usr/bin/env python3
"""Original LP2 physical raster: test for a common aligned dark layer.

Reads the exact image files checked into resources/liber-primus. Uses full-size
2400x3600 grayscale samples; neither resampling nor image registration.
"""

from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
SHAPE = (3600, 2400)


def maximum_brightness(first_page: int, last_page: int) -> np.ndarray:
    """A dark pixel survives iff it is present on every selected image."""
    brightest = np.zeros(SHAPE, dtype=np.uint8)
    for page in range(first_page, last_page + 1):
        filename = ROOT / f"{page + 17:02d}.jpg"
        with Image.open(filename) as original:
            grayscale = np.asarray(original.convert("L"), dtype=np.uint8)
        assert grayscale.shape == SHAPE, (page, grayscale.shape)
        np.maximum(brightest, grayscale, out=brightest)
    return brightest


def dark_stats(image: np.ndarray) -> tuple[int, int, int, int]:
    """Counts pixels surviving at four unambiguous fixed thresholds."""
    return (
        int(np.count_nonzero(image < 255)),
        int(np.count_nonzero(image < 254)),
        int(np.count_nonzero(image < 248)),
        int(image.min()),
    )


def main() -> None:
    print("Original 2400x3600 JPEG grayscale, no resampling")
    full = maximum_brightness(0, 55)
    intro = maximum_brightness(0, 2)
    floral = maximum_brightness(40, 48)

    expected = {
        "all-p0-55": (0, 0, 0, 255),
        "cross-p0-2": (468904, 437164, 398849, 0),
        "floral-p40-48": (398278, 366284, 311723, 0),
    }
    for name, image in (
        ("all-p0-55", full),
        ("cross-p0-2", intro),
        ("floral-p40-48", floral),
    ):
        actual = dark_stats(image)
        print(f"{name}: below255={actual[0]}, below254={actual[1]}, "
              f"below248={actual[2]}, min={actual[3]}")
        assert actual == expected[name], (name, actual, expected[name])

    # A truly shared one-pixel dark mark remains detectable in all pages.
    planted = [np.array([[255, 120]], dtype=np.uint8) for _ in range(3)]
    np.maximum.reduce(planted)
    assert int(np.maximum.reduce(planted)[0, 1]) == 120
    print("PASS: original common-layer gate and repeated-ornament controls")


if __name__ == "__main__":
    main()
