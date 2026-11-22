"""Original-source physical check for the repeated LP2 pp40-55 tree-ornament five-dot masks.

Run in the repository root with Pillow and NumPy installed. The two rows of
ornament dots form a vertical pentagonal arrangement in scans 57-72.jpg.
The natural order is top, upper-right, lower-right, lower-left, upper-left.
This script measures that one declared reading and makes NO key claim.
"""
from pathlib import Path

import numpy as np
from PIL import Image

SCAN_DIR = Path("resources/liber-primus")
PAGES = tuple(range(57, 73))
# Centers in native original 2400x3600 pixels, clockwise starting at unique top.
LEFT_CENTERS = ((396, 1477), (425, 1499), (420, 1534), (380, 1540), (367, 1498))
CENTER_RADIUS = 5



def mirrored_difference_components(left: np.ndarray, mirrored_right: np.ndarray):
    """8-connected original-size ink mismatches between corresponding borders."""
    missing = set(zip(*np.nonzero(left ^ mirrored_right)))
    components = []
    while missing:
        stack = [missing.pop()]
        pixels = []
        while stack:
            y, x = stack.pop()
            pixels.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    near = (y + dy, x + dx)
                    if near in missing:
                        missing.remove(near)
                        stack.append(near)
        components.append((len(pixels),
                           round(sum(x for y, x in pixels) / len(pixels)),
                           round(sum(y for y, x in pixels) / len(pixels))))
    components.sort(reverse=True)
    return components


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
        # 520px border counterparts are mirror aligned. Their two largest
        # coherent dark-ink differences are the exact two pale left dot slots.
        # Other mismatches are tiny stroke/antialias variations.
        components = mirrored_difference_components(left, right[:, ::-1])
        assert components[:2] == [(460, 396, 1476), (432, 380, 1540)], (page, components[:5])
        assert components[2][0] < 40, (page, components[:5])
        assert int(np.sum(left ^ right[:, ::-1])) == 2293
        print({"mirror_ink_xor": 2293, "largest_8connected_differences": components[:3],
               "source_interpretation": "two deliberately pale circles; binary key use remains unproved"})
        print({"image": f"{page}.jpg", "LP2_physical_page": page - 17,
               "top_first_clockwise_left": bits["left"], "left_integer": int(bits["left"], 2),
               "top_first_clockwise_right": bits["right"], "right_integer": int(bits["right"], 2),
               "pixel_center_medians": center_medians,
               "mirrored_outer_520px_black_mask_difference": int(np.sum(left ^ right[:, ::-1]))})
    print("All 16 decorated source-page masks are identical; five-bit left/right reading = 13/31 throughout pp40-55.")


if __name__ == "__main__":
    main()
