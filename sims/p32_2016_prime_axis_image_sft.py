"""One frozen source-axis image readout. No threshold/key/phase search.

Run from repository root after installing Pillow:
    python sims/p32_2016_prime_axis_image_sft.py
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text("utf8"))
P32 = next(p for p in CORPUS["pages"] if p["page"] == 32)["indices"]
PRIMES = CORPUS["prime"]
SOURCE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
WIDTHS = [PRIMES[i] for i in P32[:11]]
HEIGHTS = [PRIMES[P32[11 * i]] for i in range(11)]
assert len(P32) == 121
assert WIDTHS == [73, 5, 101, 19, 101, 3, 43, 107, 13, 19, 79]
assert HEIGHTS == [73, 23, 5, 23, 79, 59, 53, 79, 59, 109, 7]
assert sum(WIDTHS) == 563 and sum(HEIGHTS) == 569

def cuts(widths):
    out = [0]
    for n in widths:
        out.append(out[-1] + n)
    return out

def decode_ascii(bits):
    return "".join(
        chr(int(bits[i:i + 8], 2))
        if 32 <= int(bits[i:i + 8], 2) <= 126 else "."
        for i in range(0, len(bits) - 7, 8)
    )

def output(label, image, widths, heights):
    xs, ys = cuts(widths), cuts(heights)
    values = []
    means = []
    for y in range(11):
        row = []
        mean = []
        for x in range(11):
            cx = (xs[x] + xs[x + 1]) // 2
            cy = (ys[y] + ys[y + 1]) // 2
            red, green, blue = image.getpixel((cx, cy))
            lum = round(0.2126 * red + 0.7152 * green + 0.0722 * blue)
            row.append("1" if lum >= 128 else "0")
            mean.append(lum)
        values.append("".join(row))
        means.append(mean)
    interior = "".join(row[1:] for row in values[1:])
    full = "".join(values)
    print(label, "full 121 bits", full)
    print(label, "interior 100 bits", interior)
    print(label, "ASCII 8bit interior", decode_ascii(interior))
    print(label, "ASCII 8bit all", decode_ascii(full))
    print(label, "white_bit_counts", sum(map(lambda x: x.count("1"), values)),
          "interior", interior.count("1"))
    for row in values:
        print(" ", row)
    return interior

def main():
    image = Image.open(SOURCE).convert("RGB")
    assert image.size == (563, 569)
    print("Original source signed 2016 JPEG:", SOURCE,
          "canvas", image.size, "GP row widths", WIDTHS, "column heights", HEIGHTS)
    original = output("SOURCE_AXES", image, WIDTHS, HEIGHTS)
    inverse = output("REVERSE_AXES", image, list(reversed(WIDTHS)),
                     list(reversed(HEIGHTS)))
    uniform_widths = [((i + 1) * 563 // 11) - (i * 563 // 11)
                      for i in range(11)]
    uniform_heights = [((i + 1) * 569 // 11) - (i * 569 // 11)
                       for i in range(11)]
    uniform = output("UNIFORM_AXES", image, uniform_widths, uniform_heights)
    print("Hamming distances of source-axis interior from reverse/uniform",
          sum(a != b for a, b in zip(original, inverse)),
          sum(a != b for a, b in zip(original, uniform)))
    print("All readouts are fixed pixel observations, not a decryption or key.")

if __name__ == "__main__":
    main()
