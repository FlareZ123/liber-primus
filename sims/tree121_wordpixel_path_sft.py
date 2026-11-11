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
