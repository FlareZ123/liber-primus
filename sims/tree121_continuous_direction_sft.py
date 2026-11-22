"""Test original p32 GP-prime values as continuous degree bearings in the signed 2016 tree.

The 11x11 source array fixes exact signed-image tile widths and heights from its
first row/column. Interior GP-prime numbers 2..109 are interpreted literally as
undirected orientation angles in degrees, following the signed image's 'numbers
are the direction' and earlier Cicada's degree-based movement instructions.
The unfit signed score measures local Sobel-gradient orientation; a two-sided
permutation comparison covers branch tangent versus gradient normal.
"""
import json
import math
import random
from bisect import bisect_right
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TRIALS = 100_000
SEED = 0x20161332
MASK_THRESHOLD = 180


def edges(values):
    out = [0]
    for value in values:
        out.append(out[-1] + value)
    return out


def main():
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    page = next(p for p in corpus["pages"] if p["page"] == 32)
    assert len(page["indices"]) == 121
    matrix = [[corpus["prime"][page["indices"][r * 11 + c]] for c in range(11)] for r in range(11)]
    widths = matrix[0]
    heights = [matrix[r][0] for r in range(11)]
    assert sum(widths) == 563 and sum(heights) == 569
    image = Image.open(ROOT / "resources/historical/cicada2016-4gq25.jpg").convert("L")
    assert image.size == (563, 569)
    px = image.load()
    xe, ye = edges(widths), edges(heights)
    vectors = [[[0.0, 0.0] for _ in range(11)] for _ in range(11)]
    energy = [[0.0] * 11 for _ in range(11)]
    for y in range(1, 568):
        r = bisect_right(ye, y) - 1
        for x in range(1, 562):
            if any(px[x + dx, y + dy] >= MASK_THRESHOLD for dy in (-1, 0, 1) for dx in (-1, 0, 1)):
                continue
            tl, tc, tr = px[x-1,y-1], px[x,y-1], px[x+1,y-1]
            ml, mr = px[x-1,y], px[x+1,y]
            bl, bc, br = px[x-1,y+1], px[x,y+1], px[x+1,y+1]
            gx = tr + 2 * mr + br - tl - 2 * ml - bl
            gy = bl + 2 * bc + br - tl - 2 * tc - tr
            mag = math.hypot(gx, gy)
            if mag == 0:
                continue
            c = bisect_right(xe, x) - 1
            vectors[r][c][0] += (gx * gx - gy * gy) / mag
            vectors[r][c][1] += (2 * gx * gy) / mag
            energy[r][c] += mag

    cells = [(r,c) for r in range(1, 11) for c in range(1, 11)]
    labels = [matrix[r][c] for r,c in cells]
    xy = [vectors[r][c] for r,c in cells]
    angles = [(math.cos(2 * math.radians(v)), math.sin(2 * math.radians(v))) for v in labels]
    total_energy = sum(energy[r][c] for r,c in cells)
    assert total_energy > 0

    def score(a):
        return sum(x * u + y * v for (x,y),(u,v) in zip(xy,a))

    observed = score(angles)
    rng = random.Random(SEED)
    choices = angles.copy()
    perms = []
    for _ in range(TRIALS):
        rng.shuffle(choices)
        perms.append(score(choices))
    mean = sum(perms) / TRIALS
    sd = math.sqrt(sum((v-mean)**2 for v in perms) / TRIALS)
    tail = (sum(abs(v-mean) >= abs(observed-mean) for v in perms) + 1) / (TRIALS + 1)
    # One-sided values are provided descriptively, with the two-sided gate primary.
    upper = (sum(v >= observed for v in perms)+1)/(TRIALS+1)
    lower = (sum(v <= observed for v in perms)+1)/(TRIALS+1)
    print(json.dumps({
        "status": "original-image finite hypothesis test; no cipher or plaintext claim",
        "historical_image": "resources/historical/cicada2016-4gq25.jpg",
        "source_page": 32,
        "tile_count": 100,
        "source_rule": "GP prime values as literal undirected degree bearings",
        "image_rule": "grayscale Sobel energy weighted continuous orientation, masked 3x3 under 180",
        "ambiguity": "two-sided gradient-normal / branch-tangent",
        "source_bearings_range": [min(labels),max(labels)],
        "total_energy": total_energy,
        "observed_raw": observed,
        "observed_per_energy": observed/total_energy,
        "permutation": {
            "seed": hex(SEED), "trials": TRIALS, "mean": mean, "sd": sd,
            "z": (observed-mean)/sd,
            "two_sided": tail, "upper": upper, "lower": lower,
            "min": min(perms), "max": max(perms)
        }
    },indent=2))


if __name__ == "__main__":
    main()
