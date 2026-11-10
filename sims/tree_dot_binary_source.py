"""Original-source physical check for LP2 pp49-51 tree-ornament five-dot masks.

Run in the repository root with Pillow and NumPy installed. The two rows of
ornament dots form a vertical pentagonal arrangement in scans 66-68.jpg.
The natural order is top, upper-right, lower-right, lower-left, upper-left.
This script measures that one declared reading and makes NO key claim.
"""
from pathlib import Path

import numpy as np
from PIL import Image

SCAN_DIR = Path("resources/liber-primus")
PAGES = (66, 67, 68)
# Centers in native original 2400x3600 pixels, clockwise starting at unique top.
LEFT_CENTERS = ((396, 1477), (425, 1499), (420, 1534), (380, 1540), (367, 1498))
CENTER_RADIUS = 5


def main() -> None:
    reference_sides = None
    for page in PAGES:
        pixels = np.asarray(Image.open(SCAN_DIR / f"{page}.jpg").convert("L"))
        assert pixels.shape == (3600, 2400)
        bits = {}
        center_medians = {}
        for side in ("left", "right"):
            coords = LEFT_CENTERS if side == "left" else tuple((2400 - x, y) for x, y in LEFT_CENTERS)
            samples = [int(np.median(pixels[y - CENTER_RADIUS:y + CENTER_RADIUS + 1,
                                             x - CENTER_RADIUS:x + CENTER_RADIUS + 1])) for x, y in coords]
            assert all(med < 100 or med > 235 for med in samples), (page, side, samples)
            pattern = "".join("1" if value < 100 else "0" for value in samples)
            bits[side] = pattern
            center_medians[side] = samples
        assert bits == {"left": "01101", "right": "11111"}, (page, bits)

        left = pixels[:, :520] < 150
        right = pixels[:, 1880:] < 150
        if reference_sides is None:
            reference_sides = (left, right)
        else:
            assert np.array_equal(left, reference_sides[0])
            assert np.array_equal(right, reference_sides[1])
        print({"image": f"{page}.jpg", "LP2_physical_page": page - 17,
               "top_first_clockwise_left": bits["left"], "left_integer": int(bits["left"], 2),
               "top_first_clockwise_right": bits["right"], "right_integer": int(bits["right"], 2),
               "pixel_center_medians": center_medians,
               "mirrored_outer_520px_black_mask_difference": int(np.sum(left ^ right[:, ::-1]))})
    print("All 3 source-image dot masks match; five-bit left/right reading = 13/31 on each page.")


if __name__ == "__main__":
    main()
