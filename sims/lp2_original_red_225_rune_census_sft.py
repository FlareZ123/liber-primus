"""Count all 225 LP2 red GP29 rune glyphs directly in 58 original JPEGs.

Single runnable source test. Requires Pillow, numpy, opencv-python.
Run: python sims/lp2_original_red_225_rune_census_sft.py
No derived rune transcription or codebook is used. No files are written.
"""
from collections import Counter
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "resources" / "liber-primus"

# Original pixel coordinates: four numeric digits 3299 at p15; decimal item
# numbers 1 to 5 at pp36-38. These printed numerals are not GP29 runes.
DECIMAL_LABELS = {
    15: {"3": (912, 1016), "2": (974, 1016),
         "9a": (1034, 1016), "9b": (1096, 1016)},
    36: {"1": (620, 1693)},
    37: {"2": (605, 694), "3": (607, 1538), "4": (601, 2569)},
    38: {"5": (602, 1316)},
}

# Original p33 / 50.jpg: two adjacent red runes have touching pixel strokes
# and form one 98x114 connected component. Visible original glyphs: F + C.
JOINED_TWO_RUNE_COMPONENT = (33, 992, 1914, 98, 114)

EXPECTED_RUNE_COUNTS = {
    0: 13, 3: 19, 6: 11, 7: 14, 8: 12, 15: 20,
    23: 16, 27: 19, 33: 18, 39: 3, 40: 8,
    53: 51, 54: 9, 56: 5, 57: 7,
}


def components(page: int) -> list[tuple[int, int, int, int, int]]:
    """Source-colored connected glyph-shaped components: x,y,w,h,area."""
    path = IMG_DIR / f"{page + 17:02d}.jpg"
    assert path.is_file(), path
    with Image.open(path) as image:
        rgb = np.asarray(image.convert("RGB"))
    assert rgb.shape == (3600, 2400, 3), (path, rgb.shape)
    r, g, b = (rgb[:, :, k].astype(np.int16) for k in range(3))
    mask = ((r - g > 50) & (r - b > 50) & (r > 75)).astype("uint8")
    n, _, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    return [(int(stats[i, 0]), int(stats[i, 1]), int(stats[i, 2]),
             int(stats[i, 3]), int(stats[i, 4]))
            for i in range(1, n)
            if stats[i, cv2.CC_STAT_HEIGHT] >= 60
            and stats[i, cv2.CC_STAT_AREA] >= 80]


def main() -> None:
    tally: Counter[int] = Counter()
    component_count = 0
    decimal_count = 0
    joined_count = 0
    for page in range(58):
        source_components = components(page)
        component_count += len(source_components)
        numerals = []
        for digit, (x, y) in DECIMAL_LABELS.get(page, {}).items():
            found = [c for c in source_components if c[0] == x and c[1] == y]
            assert len(found) == 1, (page, digit, x, y, found)
            numerals.append(found[0])
        runes = [c for c in source_components if c not in numerals]
        assert len(runes) + len(numerals) == len(source_components)
        decimal_count += len(numerals)
        joined_here = sum((page, x, y, w, h) == JOINED_TWO_RUNE_COMPONENT
                          for x, y, w, h, _ in runes)
        joined_count += joined_here
        tally[page] = len(runes) + joined_here
        assert tally[page] == EXPECTED_RUNE_COUNTS.get(page, 0), (page, tally[page])
        if source_components:
            print(f"p{page:02d} {page+17:02d}.jpg: "
                  f"components={len(source_components)}, "
                  f"decimal_digits={len(numerals)}, red_runes={tally[page]}")
    assert joined_count == 1
    assert component_count == 233
    assert decimal_count == 9
    assert sum(tally.values()) == 225
    assert sum(tally[page] for page in range(56)) == 213
    assert tally[56] + tally[57] == 12
    assert sum(bool(v) for v in tally.values()) == 15
    print("PASS 58 original JPEGs: 233 red glyph-sized components - "
          "9 source decimal digits + 1 fused rune = 225 red runes.")
    print("Red runes: 213 unknown pp0-55; 12 solved pp56-57.")
    print("No cipher plaintext or key is inferred from the count.")


if __name__ == "__main__":
    main()
