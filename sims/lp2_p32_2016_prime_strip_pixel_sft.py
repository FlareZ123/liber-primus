"""Test source-fixed 11-by-11 prime-width partition of the 2016 Cicada image.

The signed 563x569 image repeats p32's oak. The first p32 row's eleven
GP primes sum to 563; its first column's eleven GP primes sum to 569.
Treat the values as literal pixel-strip widths and heights and ask whether
the remaining 100 GP prime symbols encode corresponding image brightness.
A positive control encodes the original values into a synthetic image.
This is a hypothesis, not a recovered historical instruction.
"""
import hashlib
import json
import random
import statistics
import sys
from itertools import accumulate
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
indices = next(page["indices"] for page in corpus["pages"] if page["page"] == 32)
assert len(indices) == 121
prime = corpus["prime"]
widths = [prime[index] for index in indices[:11]]
heights = [prime[indices[r * 11]] for r in range(11)]
assert sum(widths) == 563 and sum(heights) == 569
xe = [0, *accumulate(widths)]
ye = [0, *accumulate(heights)]
values = [prime[indices[r * 11 + c]] for r in range(1, 11) for c in range(1, 11)]


def cells(image):
    means = []
    whites = []
    for row in range(1, 11):
        for col in range(1, 11):
            part = list(image.crop((xe[col], ye[row], xe[col+1], ye[row+1])).getdata())
            means.append(statistics.fmean(part))
            whites.append(sum(value > 127 for value in part) / len(part))
    return means, whites


def score(a, b):
    return abs(statistics.correlation(a, b))


def positive_control():
    image = Image.new("L", (563, 569))
    for row in range(1, 11):
        for col in range(1, 11):
            image.paste(2 * prime[indices[row*11+col]],
                        (xe[col], ye[row], xe[col+1], ye[row+1]))
    means, _ = cells(image)
    assert abs(statistics.correlation(values, means) - 1) < 1e-12


def main(p):
    positive_control()
    data = Path(p).read_bytes()
    image = Image.open(p)
    assert image.size == (563, 569)
    means, whites = cells(image.convert("L"))
    observed = {"mean": score(values, means),
                "fraction_over127": score(values, whites)}
    original_max = max(observed.values())
    rng = random.Random(0x3301)
    exceed = 0
    for _ in range(1000):
        shuffled = values.copy()
        rng.shuffle(shuffled)
        if max(score(shuffled, means), score(shuffled, whites)) >= original_max:
            exceed += 1
    print(json.dumps({
      "original_image_sha256": hashlib.sha256(data).hexdigest(),
      "original_image_dimensions": image.size,
      "prime_widths": widths,
      "prime_heights": heights,
      "interior_symbols": len(values),
      "observed_abs_pearson": observed,
      "permutation_null": 1000,
      "null_at_least_observed": exceed,
      "max_stat_adjusted_p": (exceed + 1) / 1001,
      "positive_control": "original 100 symbols planted in synthetic 11-by-11 image, r=1",
      "white_fraction_by_inner_cell": [
          [round(v, 3) for v in whites[i:i+10]] for i in range(0, 100, 10)],
      "scope": "Fixed direct image-brightness channel only, not arbitrary stego or a decryption"
    }, indent=2))


if __name__ == "__main__":
    main(sys.argv[1])
