"""Physically enumerate 10-, 13-, and 23-dot LP2 punctuation from original JPG pixels.

Single runnable source test. Requires numpy, Pillow, scipy, opencv-python.
Run: python sims/lp2_original_color_dots_census_sft.py
Uses all 58 original manuscript pages, JPEGs 17.jpg to 74.jpg.
No derived rune transcription, human OCR, or output files are required.
"""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "resources" / "liber-primus"

# (number of dots, raster x, raster y), observed original full-resolution pixels.
EXPECTED_RED = {
    0: [(13, 1424, 730)], 2: [(13, 1645, 2236)],
    3: [(13, 1578, 730), (13, 1375, 1671), (13, 953, 2158)],
    6: [(13, 762, 1294), (13, 1350, 1782)],
    7: [(13, 742, 2515), (13, 1652, 2515)],
    14: [(13, 1016, 1859)],
    15: [(13, 936, 730), (13, 1459, 730), (13, 1299, 1792)],
    22: [(13, 1650, 1742)], 23: [(13, 1552, 1217)],
    26: [(13, 1654, 2801)], 27: [(13, 1702, 974)],
    32: [(13, 948, 1671)],
    33: [(13, 1287, 730), (13, 1466, 1482), (13, 1160, 1970)],
    36: [(10, 993, 1482)], 38: [(10, 620, 2571)],
    39: [(13, 856, 1671), (13, 963, 1914), (13, 1559, 2856)],
    49: [(10, 1710, 1106)], 53: [(13, 842, 2307)],
    54: [(13, 1212, 974)], 55: [(13, 1053, 1294)],
    56: [(13, 983, 730), (10, 1073, 1106), (13, 1577, 2134)],
    57: [(13, 1159, 974), (23, 1678, 1782)],
}
EXPECTED_BLACK = {7: [(13, 1707, 2271)]}


def dot_groups(mask: np.ndarray, *, max_area: int) -> list[tuple[int, int, int]]:
    """Find isolated ~9x9 dots and merge neighboring points in a marked glyph."""
    n, _, stats, centers = cv2.connectedComponentsWithStats(mask, 8)
    ids = [i for i in range(1, n)
           if 55 <= int(stats[i, cv2.CC_STAT_AREA]) <= max_area
           and 8 <= int(stats[i, cv2.CC_STAT_WIDTH]) <= 12
           and 8 <= int(stats[i, cv2.CC_STAT_HEIGHT]) <= 12]
    if not ids:
        return []
    xy = centers[ids]
    parents = list(range(len(ids)))

    def find(i: int) -> int:
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i

    for a, b in cKDTree(xy).query_pairs(23):
        parents[find(a)] = find(b)
    groups: dict[int, list[int]] = {}
    for i in range(len(ids)):
        groups.setdefault(find(i), []).append(i)
    observed = []
    for members in groups.values():
        if len(members) >= 6:
            x, y = xy[members].mean(axis=0)
            observed.append((len(members), round(float(x)), round(float(y))))
    return sorted(observed, key=lambda x: (x[2], x[1]))


def verify(actual: list[tuple[int, int, int]],
           expected: list[tuple[int, int, int]], label: str) -> None:
    assert len(actual) == len(expected), f"{label}: {actual=} != {expected=}"
    unmatched = actual.copy()
    for count, x, y in expected:
        matches = [v for v in unmatched if v[0] == count
                   and abs(v[1] - x) <= 2 and abs(v[2] - y) <= 2]
        assert len(matches) == 1, (label, count, x, y, actual)
        unmatched.remove(matches[0])
    assert not unmatched, (label, unmatched)


def main() -> None:
    red_counts: Counter[int] = Counter()
    black_counts: Counter[int] = Counter()
    for page in range(58):
        path = IMG_DIR / f"{page + 17:02d}.jpg"
        assert path.is_file(), f"Missing original JPEG: {path}"
        with Image.open(path) as image:
            rgb = np.asarray(image.convert("RGB"))
        assert rgb.shape == (3600, 2400, 3), (path, rgb.shape)
        r, g, b = (rgb[:, :, j].astype(np.int16) for j in range(3))
        red = ((r - g > 50) & (r - b > 50) & (r > 75)).astype(np.uint8)
        black = ((r < 80) & (g < 80) & (b < 80)).astype(np.uint8)
        red_events = dot_groups(red, max_area=150)
        black_events = dot_groups(black, max_area=175)
        verify(red_events, EXPECTED_RED.get(page, []), f"p{page} red")
        verify(black_events, EXPECTED_BLACK.get(page, []), f"p{page} black")
        red_counts.update(n for n, _, _ in red_events)
        black_counts.update(n for n, _, _ in black_events)
        if red_events or black_events:
            print(f"p{page:02d} {path.name}: red={red_events} black={black_events}", flush=True)
    assert red_counts == Counter({13: 30, 10: 4, 23: 1}), red_counts
    assert black_counts == Counter({13: 1}), black_counts
    print(f"PASS: 58 original images; red={dict(red_counts)} black={dict(black_counts)}")
    print("Physical 13-dot marks = 30 red + 1 black = 31.")
    print("These checks do not infer the count of original red rune glyphs.")


if __name__ == "__main__":
    main()
