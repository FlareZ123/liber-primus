#!/usr/bin/env python3
"""Original-pixel SFT for the physical p15 red 3299 ink hypothesis.

Requires Pillow and NumPy. Run in the cloned repository; prints exact pixel
classifications for all sixteen grid cells and two independent red-ink controls.
No OCR, resizing, resampling, hidden/secret key fitting, or ciphertext scoring.
"""

from collections import Counter
from hashlib import sha256
import json
from pathlib import Path

import numpy as np
from PIL import Image


SOURCE = Path(__file__).resolve().parents[1] / "resources/liber-primus/32.jpg"
SOURCE_SHA256 = "5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5"
NUMBERS = [
    [3258, 3222, 3152, 3038],
    [3278, 3299, 3298, 2838],
    [3288, 3294, 3296, 2472],
    [4516, 1206, 708, 1820],
]
# Bounds in original 2400×3600 pixel coordinates, inclusive-exclusive.
COLUMNS = [(594, 856), (900, 1164), (1205, 1473), (1510, 1776)]
ROWS = [(863, 968), (1003, 1108), (1142, 1247), (1299, 1404)]
RED_CONTROLS = {
    "top_red_rubric": (900, 659, 1500, 810),
    "lower_red_rubric": (775, 1730, 1300, 1880),
}


def palette(image: np.ndarray, bounds: tuple[int, int, int, int]) -> dict:
    """Classify visibly saturated red and near-neutral dark pixels."""
    x0, y0, x1, y1 = bounds
    rgb = image[y0:y1, x0:x1].astype(np.int16)
    red = (
        (rgb[:, :, 0] - rgb[:, :, 1] > 60)
        & (rgb[:, :, 0] - rgb[:, :, 2] > 60)
        & (rgb[:, :, 1] < 170)
        & (rgb[:, :, 2] < 170)
    )
    black = (rgb.max(axis=2) < 110) & (np.ptp(rgb, axis=2) < 20)
    red_pixels = rgb[red]
    black_pixels = rgb[black]
    top_red = Counter(map(tuple, red_pixels.tolist())).most_common(1)
    return {
        "red_pixels": int(red.sum()),
        "neutral_black_pixels": int(black.sum()),
        "median_red_rgb": np.median(red_pixels, axis=0).astype(int).tolist()
        if len(red_pixels) else None,
        "dominant_red_rgb": list(top_red[0][0]) if top_red else None,
        "median_neutral_black_rgb": np.median(black_pixels, axis=0).astype(int).tolist()
        if len(black_pixels) else None,
    }


def main() -> None:
    assert sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_SHA256
    image = np.asarray(Image.open(SOURCE).convert("RGB"), dtype=np.uint8)
    assert image.shape == (3600, 2400, 3)

    entries = []
    for row, (y0, y1) in enumerate(ROWS):
        for col, (x0, x1) in enumerate(COLUMNS):
            number = NUMBERS[row][col]
            measured = palette(image, (x0, y0, x1, y1))
            entries.append({"number": number, "row": row, "col": col, **measured})
            if number == 3299:
                assert measured["red_pixels"] >= 5000
                assert measured["neutral_black_pixels"] == 0
            else:
                assert measured["red_pixels"] == 0
                assert measured["neutral_black_pixels"] >= 4000

    ctrl = {name: palette(image, bounds) for name, bounds in RED_CONTROLS.items()}
    expected_red = [192, 0, 0]
    for value in [entries[5], *ctrl.values()]:
        assert value["dominant_red_rgb"] == expected_red
        assert value["red_pixels"] >= 5000

    assert [e["number"] for e in entries if e["red_pixels"] > 0] == [3299]
    assert len([e for e in entries if e["neutral_black_pixels"] >= 4000]) == 15

    print(json.dumps({
        "source": str(SOURCE.relative_to(SOURCE.parents[2])).replace("\\", "/"),
        "sha256": SOURCE_SHA256,
        "grid": entries,
        "red_controls": ctrl,
        "decision": "3299 is the only red numeral; the same dominant red RGB occurs in "
                    "both surrounding red rubrics. Its grayscale difference from "
                    "black neighbors is ordinary red-versus-black color, with "
                    "no independently selected new decipherment operation.",
    }, indent=2))


if __name__ == "__main__":
    main()
