"""Source-locked p32 direction test against the 2016 oak-tree image.

The top row and left column of physical p32 supply 11 tile widths/heights
whose GP-prime sums equal the signed image dimensions 563x569.  The remaining
10x10 interior primes are direction labels.  For an undirected tree branch,
the image-gradient normal is perpendicular to its tangent; the fixed
eight-compass-to-four-line conversion therefore predicts Sobel bin prime % 4.

Bright message text is excluded using the existing tree-tiling threshold 180.
A permutation null shuffles only the 100 interior labels.  This tests one
source-locked geometric hypothesis; it is not a decryption claim.
"""
import json
import math
import random
from bisect import bisect_right
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "resources/liber-primus/lp2-corpus.json"
SOURCE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
TRIALS = 100_000
SEED = 0x20161132
TEXT_THRESHOLD = 180


def cumulative(values):
    out = [0]
    for value in values:
        out.append(out[-1] + value)
    return out


def main():
    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))
    page = corpus["pages"][32]
    assert page["page"] == 32 and len(page["indices"]) == 121
    primes = corpus["prime"]
    values = [primes[i] for i in page["indices"]]
    matrix = [values[r * 11:(r + 1) * 11] for r in range(11)]
    widths = matrix[0]
    heights = [matrix[r][0] for r in range(11)]
    assert widths == [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]
    assert heights == [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]
    assert sum(widths) == 563 and sum(heights) == 569

    image = Image.open(SOURCE).convert("L")
    assert image.size == (563, 569)
    px = image.load()
    xe, ye = cumulative(widths), cumulative(heights)
    hist = [[[0.0] * 4 for _ in range(11)] for _ in range(11)]

    for y in range(1, 568):
        row = bisect_right(ye, y) - 1
        for x in range(1, 562):
            if px[x, y] >= TEXT_THRESHOLD:
                continue
            if any(px[x + dx, y + dy] >= TEXT_THRESHOLD
                   for dy in (-1, 0, 1) for dx in (-1, 0, 1)):
                continue
            tl, tc, tr = px[x-1, y-1], px[x, y-1], px[x+1, y-1]
            ml, mr = px[x-1, y], px[x+1, y]
            bl, bc, br = px[x-1, y+1], px[x, y+1], px[x+1, y+1]
            gx = -tl - 2*ml - bl + tr + 2*mr + br
            gy = -tl - 2*tc - tr + bl + 2*bc + br
            if gx == 0 and gy == 0:
                continue
            theta = math.atan2(gy, gx) % math.pi
            direction = int((theta + math.pi/8) / (math.pi/4)) % 4
            col = bisect_right(xe, x) - 1
            hist[row][col][direction] += math.hypot(gx, gy)

    # The first row/column define geometry; do not reuse them as labels.
    cells = [(r, c) for r in range(1, 11) for c in range(1, 11)]
    labels = [matrix[r][c] % 4 for r, c in cells]
    tile_hist = [hist[r][c] for r, c in cells]
    total_energy = sum(sum(h) for h in tile_hist)
    assert total_energy > 0

    def score(order):
        return sum(tile_hist[i][order[i]] for i in range(100))

    observed = score(labels)
    rng = random.Random(SEED)
    shuffled = labels.copy()
    exceed = 0
    total = total_sq = 0.0
    low, high = float("inf"), float("-inf")
    for _ in range(TRIALS):
        rng.shuffle(shuffled)
        value = score(shuffled)
        total += value
        total_sq += value * value
        exceed += value >= observed
        low, high = min(low, value), max(high, value)

    mean = total / TRIALS
    variance = max(0.0, total_sq / TRIALS - mean * mean)
    sd = math.sqrt(variance)
    energy_by_bin = [sum(h[k] for h in tile_hist) for k in range(4)]
    print(json.dumps({
        "classification": "single source-locked image-direction hypothesis; no plaintext claim",
        "source_image": "resources/historical/cicada2016-4gq25.jpg",
        "physical_page": 32,
        "image_size": list(image.size),
        "tile_widths": widths,
        "tile_heights": heights,
        "scored_tiles": 100,
        "label_counts": {str(k): labels.count(k) for k in range(4)},
        "direction_rule": "GP prime mod 4; gradient-normal bins 0/45/90/135 degrees",
        "bright_text_mask": {"threshold": TEXT_THRESHOLD, "dark_3x3_required": True},
        "edge_energy_by_bin": energy_by_bin,
        "observed": {
            "matched_energy": observed,
            "total_energy": total_energy,
            "fraction": observed / total_energy,
        },
        "permutation_null": {
            "trials": TRIALS,
            "seed": hex(SEED),
            "mean": mean,
            "sd": sd,
            "mean_fraction": mean / total_energy,
            "z_score": (observed - mean) / sd if sd else None,
            "upper_tail": (exceed + 1) / (TRIALS + 1),
            "minimum": low,
            "maximum": high,
        },
    }, indent=2))


if __name__ == "__main__":
    main()
