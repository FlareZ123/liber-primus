"""Source-original five-dot floral-mask and fixed row13/31 inverse test.

Read-only single-file test. Run from a repository checkout with Pillow installed.
The geometric 5-dot readouts are exploratory: the book supplies no opcode
identifying these masks as base-2 row addresses.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"

# Top, upper right, lower right, lower left, upper left, in original pixels.
LEFT = ((398, 1475), (425, 1500), (421, 1534), (380, 1542), (367, 1500))
RIGHT = ((2003, 1475), (2034, 1495), (2021, 1536), (1980, 1534), (1975, 1497))


def filled(image: Image.Image, x: int, y: int) -> int:
    """Read a solid black center as 1 and a pale outlined center as 0."""
    patch = [image.getpixel((x + dx, y + dy)) for dx in range(-5, 6)
             for dy in range(-5, 6)]
    dark = sum(value < 128 for value in patch)
    assert dark == 0 or dark >= 100, (x, y, dark)
    if dark == 0:
        ring = [image.getpixel((x + round(10 * math.cos(n * math.pi / 36)),
                                y + round(10 * math.sin(n * math.pi / 36))))
                for n in range(72)]
        assert sum(ring) / len(ring) < 251, (x, y, "no outlined circle")
    return int(dark >= 100)


def ioc(values: list[int]) -> float:
    counts = [0] * 29
    for value in values:
        counts[value] += 1
    return sum(n * (n - 1) for n in counts) / (len(values) * (len(values) - 1))


def main() -> None:
    masks: list[tuple[int, int]] = []
    for physical in range(40, 56):
        with Image.open(SOURCE / f"{physical + 17}.jpg") as jpeg:
            gray = jpeg.convert("L")
            assert gray.size == (2400, 3600)
            left = [filled(gray, x, y) for x, y in LEFT]
            right = [filled(gray, x, y) for x, y in RIGHT]
        assert left == [0, 1, 1, 0, 1], (physical, left)
        assert right == [1, 1, 1, 1, 1], (physical, right)
        masks.append((int("".join(map(str, left)), 2),
                      int("".join(map(str, right)), 2)))

    assert masks == [(13, 31)] * 16
    print("Original 16 floral frames p40..55: left 01101 = 13; right 11111 = 31")
    print("Source caution: top-clockwise row addressing is a hypothesis, not an author instruction")

    table = json.loads((SOURCE / "base60-grid.json").read_text(encoding="utf-8"))
    corpus = json.loads((SOURCE / "lp2-corpus.json").read_text(encoding="utf-8"))
    assert len(table["byte_rows"]) == 32
    assert all(len(row) == 8 for row in table["byte_rows"])
    assert len(corpus["translit"]) == 29
    pages = {int(page["page"]): page["indices"] for page in corpus["pages"]}
    target = pages[55]
    whole = [symbol for page in range(40, 56) for symbol in pages[page]]
    native_control = pages[57][:76]
    assert len(target) == len(native_control) == 76
    assert len(whole) == 3316
    print(f"Original p55: {len(target)} GP29 runes; original floral body: {len(whole)} runes")
    print(f"Untouched p55 IoC={ioc(target):.9f}; floral IoC={ioc(whole):.9f}")

    results: dict[tuple[int, int], tuple[float, float]] = {}
    for row in (13, 31):
        numbers = table["byte_rows"][row]
        key = [number % 29 for number in numbers]
        print(f"Fixed table row {row}: source bytes={numbers} GP29 residues={key}")
        for sign in (-1, 1):
            def transform(source: list[int]) -> list[int]:
                return [(symbol + sign * key[position % 8]) % 29
                        for position, symbol in enumerate(source)]

            observed = transform(target)
            chapter = transform(whole)
            assert transform([(symbol - sign * key[i % 8]) % 29
                              for i, symbol in enumerate(native_control)]) == native_control
            assert [(symbol - sign * key[i % 8]) % 29
                    for i, symbol in enumerate(observed)] == target
            p_ioc, whole_ioc = ioc(observed), ioc(chapter)
            results[row, sign] = p_ioc, whole_ioc
            prefix = "-".join(corpus["translit"][symbol] for symbol in observed[:30])
            print(f"row={row} sign={sign:+d} p55 IoC={p_ioc:.9f} "
                  f"floral IoC={whole_ioc:.9f} first30={prefix}")

    assert all(p_ioc < 0.045 for p_ioc, _ in results.values())
    assert all(abs(whole_ioc - 1 / 29) < 0.0002 for _, whole_ioc in results.values())
    print("PASS: physical dots, 32x8 table, actual ciphertext, and all four planted inverses")
    print("No original plaintext or source-authenticated row-key cipher was recovered")


if __name__ == "__main__":
    main()
