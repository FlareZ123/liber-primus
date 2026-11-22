"""Frozen p32 22-word -> signed 2016 tree-image pixel-coordinate test.

Run as a standalone SFT from repository root:
    python sims/tree121_wordpixel_path_sft.py

Requires Pillow. The p32 page's 121 runes form an 11x11 square whose GP-prime
top/left axes sum to the signed tree JPEG's 563x569 pixel dimensions. It also
contains 22 printed words, giving one source-natural but unproven split of 11
horizontal and 11 vertical coordinate words. This tests that direct proposal
without fitting any phase, pixel threshold, pairing or brightness convention.
No original LP2 plaintext or authentic cipher mechanism is presumed.
"""

from __future__ import annotations

import json
import random
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus"
TREE = ROOT / "resources" / "historical" / "cicada2016-4gq25.jpg"

with (SOURCE / "lp2-corpus.json").open(encoding="utf-8") as file:
    corpus = json.load(file)
runes = corpus["runes"]
prime = corpus["prime"]
alphabet = {rune: index for index, rune in enumerate(runes)}
page32 = next(page["indices"] for page in corpus["pages"] if page["page"] == 32)
assert len(page32) == 121

text = (SOURCE / "lp2-transcription.txt").read_text(encoding="utf-8")
physical = text.split("%")[32]
words = re.findall(r"[ᚠ-᛿]+", physical.replace("/", "").replace("\n", ""))
assert len(words) == 22, len(words)
assert [alphabet[glyph] for word in words for glyph in word] == page32
word_lengths = [len(word) for word in words]
word_prime_sums = [sum(prime[alphabet[glyph]] for glyph in word) for word in words]
assert word_lengths == [1, 3, 5, 11, 5, 5, 3, 11, 6, 9, 5, 8, 4, 9, 4, 8, 2, 3, 2, 8, 5, 4]
assert word_prime_sums == [73, 125, 267, 613, 191, 184, 14, 540, 458, 535, 183, 442, 196, 497, 160, 446, 98, 203, 96, 348, 160, 216]

x_axis = [prime[r] for r in page32[:11]]
y_axis = [prime[page32[11 * row]] for row in range(11)]
assert sum(x_axis) == 563 and sum(y_axis) == 569
with Image.open(TREE) as raw:
    assert raw.size == (563, 569)
    image = raw.convert("L")

# Two source-derived 11-word halves as x and y, one modulo per image dimension.
x = [value % 563 for value in word_prime_sums[:11]]
y = [value % 569 for value in word_prime_sums[11:]]
xy = list(zip(x, y))
values = [image.getpixel(pt) for pt in xy]
bright = [int(value >= 128) for value in values]
observed = sum(bright)

# Conditional no-refit control: preserve the exact source x and y coordinates
# and randomly permute the 11 y destinations, rather than fit an extra pixel.
seed = 0x20163301
rng = random.Random(seed)
runs = 100_000
null = []
for _ in range(runs):
    sample_y = y.copy()
    rng.shuffle(sample_y)
    null.append(sum(image.getpixel((a, b)) >= 128 for a, b in zip(x, sample_y)))
greater = sum(score >= observed for score in null)
less = sum(score <= observed for score in null)

print("Signed 2016 JPEG size:", image.size)
print("Original p32 22 printed GP-word lengths:", word_lengths)
print("Original 22 GP-prime word sums:", word_prime_sums)
print("Column widths from p32 first row:", x_axis)
print("Row heights from p32 first column:", y_axis)
print("Original 11 word-sum-derived image pixel coordinates (x,y):", xy)
print("Original coordinate grayscale luminances:", values)
print("Original >=128 bright pixels:", observed, "of", len(values))
print("Locked null (random y pairing with fixed x,y) bright counts:")
print("  permutations:", runs, "seed:", seed)
print("  mean:", sum(null) / runs)
print("  min, max:", min(null), max(null))
print("  count null >= original:", greater, "add-one upper tail:", (greater + 1) / (runs + 1))
print("  count null <= original:", less, "add-one lower tail:", (less + 1) / (runs + 1))
print("Direct pixel candidates as binary tape:", "".join(map(str, bright)))
print("CONCLUSION: this pixel-location gate is exploratory; only independently")
print("specified source meanings for the 22 word pairs could authenticate it.")

# The same 11x11 source-selected mosaic also has the dimensions of a Micro QR
# M1 symbol. Test ONLY the standard 7x7 top-left finder as a necessary
# condition for the most elementary direct pixel or GP-index bitplane readout.
# This is not an arbitrary threshold/rotation/QR decoder search.
MICRO_QR_FINDER = [
    "1111111",
    "1000001",
    "1011101",
    "1011101",
    "1011101",
    "1000001",
    "1111111",
]

def cumulative(values: list[int]) -> list[int]:
    result = [0]
    for value in values:
        result.append(result[-1] + value)
    return result

x_edges, y_edges = cumulative(x_axis), cumulative(y_axis)
assert x_edges[-1] == 563 and y_edges[-1] == 569
centers = [[((x_edges[col] + x_edges[col + 1]) // 2,
             (y_edges[row] + y_edges[row + 1]) // 2)
            for col in range(11)] for row in range(11)]
luminances = [[image.getpixel(point) for point in row] for row in centers]
center_bits = [[int(value >= 128) for value in row] for row in luminances]
rune_bits = [[page32[11 * row + col] % 2 for col in range(11)]
             for row in range(11)]

def finder_errors(bits: list[list[int]], invert: int) -> int:
    return sum((bits[row][col] ^ invert) != int(MICRO_QR_FINDER[row][col])
               for row in range(7) for col in range(7))

print("11x11 image-mosaic center-bright bit matrix:")
for row in center_bits:
    print("  ", "".join(map(str, row)))
print("11x11 direct original-rune-ordinal parity matrix:")
for row in rune_bits:
    print("  ", "".join(map(str, row)))
print("Standard M1 7x7 top-left finder mismatches, image centers, both polarities:",
      [finder_errors(center_bits, invert) for invert in (0, 1)])
print("Standard M1 7x7 top-left finder mismatches, direct p32 GP-index parity:",
      [finder_errors(rune_bits, invert) for invert in (0, 1)])

# A deterministic symbolic control checks the 11x11 sampling and finder shape.
from PIL import ImageDraw
plant = Image.new("L", (563, 569), color=0)
draw = ImageDraw.Draw(plant)
for row in range(11):
    for col in range(11):
        bit = int(MICRO_QR_FINDER[row][col]) if row < 7 and col < 7 else ((row + col) % 2)
        if bit:
            draw.rectangle((x_edges[col], y_edges[row],
                            x_edges[col + 1] - 1, y_edges[row + 1] - 1), fill=255)
plant_bits = [[int(plant.getpixel(point) >= 128) for point in line] for line in centers]
assert finder_errors(plant_bits, 0) == 0
print("Positive synthetic 11x11 mosaic: 0/49 Micro QR finder mismatches (PASS)")
