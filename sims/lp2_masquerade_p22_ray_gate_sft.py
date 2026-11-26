"""Run: python lp2_masquerade_p22_ray_gate_sft.py path/to/39.jpg"""
import json
import sys
from fractions import Fraction
from itertools import product
from PIL import Image

EYE = ((2120, 2399), (3200, 3500))
DIGITS = {"hand": ((650, 1750), (3100, 3550)),
          "foot": ((0, 300), (3100, 3550))}


def bounds(eye, digit, target_x):
    # x is left of every possible eye; digit is left of every possible eye.
    assert eye[0][0] > max(digit[0][1], target_x[1])
    # Each variable is monotone with the others fixed (linear-fractional
    # with positive denominator), so extrema are at the box corners.
    ys = [Fraction(ey) + (dy - ey) * Fraction(ex - x, ex - dx)
          for ex, ey, dx, dy, x in product(*eye, *digit, target_x)]
    return min(ys), max(ys)


def run(path):
    with Image.open(path) as image:
        assert image.size == (2400, 3600)
        top = image.convert("L").crop((0, 0, 2400, 2100))
    mask = top.point(lambda v: 255 if v < 160 else 0)
    x0, y0, x1, y1 = mask.getbbox()
    target = ((x0, x1 - 1), (y0, y1 - 1))
    out = {"target": target, "dark_pixels": mask.histogram()[255],
           "eye": EYE, "digits": {}}
    for name, digit in DIGITS.items():
        lo, hi = bounds(EYE, digit, target[0])
        out["digits"][name] = {"box": digit, "min_y": str(lo), "max_y": str(hi),
                               "disjoint": lo > target[1][1] or hi < target[1][0]}
    # A line from (10,10) through (8,8) crosses (2,2).
    assert bounds(((10, 10), (10, 10)), ((8, 8), (8, 8)), (2, 2)) == (2, 2)
    assert all(item["disjoint"] for item in out["digits"].values())
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    run(sys.argv[1])
