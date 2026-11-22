"""Original-JPEG decision test for the small red dot after the p54 giant A.

Python 3.12, NumPy, Pillow, OpenCV. Read only. The page numbers and
geometry are source-derived rather than estimated from ciphertext output.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
CAP_PAGES = {0: 1, 3: 2, 6: 1, 8: 1, 15: 1, 23: 1,
             27: 1, 33: 2, 39: 1, 40: 1, 54: 1}
CONTROL_PAGE = 56


def red_mask(page):
    """Keep strong red source ink, performing arithmetic in signed integers."""
    rgb = np.asarray(Image.open(SOURCE / f"{page + 17:02}.jpg").convert("RGB"))
    r, g, b = (rgb[:, :, k].astype(np.int16) for k in range(3))
    return ((r > 100) & (r > 2 * g) & (r > 2 * b)).astype(np.uint8)


def components(mask):
    count, _labels, stats, _centroids = cv2.connectedComponentsWithStats(
        mask, connectivity=8
    )
    return [tuple(int(n) for n in stats[i]) for i in range(1, count)]


def isolated_red_points(parts):
    """Exclude 13-dot clusters and retain standalone printed square stops."""
    dots = [b for b in parts if 8 <= b[2] <= 11 and 8 <= b[3] <= 11
            and 75 <= b[4] <= 110]
    return sorted([a for a in dots if sum(
        abs(a[0] - b[0]) <= 23 and abs(a[1] - b[1]) <= 25
        for b in dots) == 1], key=lambda d: (d[1], d[0]))


def overlap(a, b):
    return np.logical_and(a, b).sum() / np.logical_or(a, b).sum()


def main():
    masks = {}
    singles = {}
    count = 0
    for page, expected in {**CAP_PAGES, CONTROL_PAGE: 1}.items():
        mask = red_mask(page)
        masks[page] = mask
        parts = components(mask)
        caps = [b for b in parts if 490 <= b[3] <= 610 and b[4] > 18000]
        assert len(caps) == expected, (page, caps)
        count += len(caps)
        singles[page] = isolated_red_points(parts)
        print(f"p{page:02}: {len(caps)} giant caps, "
              f"{len(singles[page])} isolated small red stops "
              f"{singles[page]}")
    assert count == 14  # 13 unknown-page caps, one solved p56 positive
    assert sum(len(x) for x in singles.values()) == 21

    p54 = singles[54]
    p27 = singles[27]
    assert p54 == [(765, 969, 9, 10, 89)], p54
    assert (970, 969, 9, 10, 89) in p27, p27
    assert (1123, 725, 10, 10, 100) in singles[0]

    # Two independent typical word-separator dots use almost the same
    # 9x10 printed square, with opposite corner pixels altered by JPEG.
    d54 = masks[54][969:979, 765:774]
    d27 = masks[27][969:979, 970:979]
    assert d54.sum() == d27.sum() == 89
    assert np.count_nonzero(d54 != d27) == 2
    print(f"p54 tiny dot vs p27 ordinary small red dot: "
          f"IoU={overlap(d54, d27):.8f}, pixel disagreements=2/90")

    # Both dots lie 52px below the usual top of a 114px-high ordinary
    # text glyph. On p0 the same spacing holds at 673+52=725.
    assert 969 - 917 == 725 - 673 == 52
    assert 765 - (601 + 149) == 15  # gap after p54 giant A
    assert 781 - (765 + 9) == 7  # gap to first normal red rune

    # The giant A itself repeats at p6 and p54; the extra point must be
    # detached, not interpreted as part of a new enlarged letter shape.
    a6 = masks[6][1721:2218, 601:750]
    a54 = masks[54][912:1409, 601:750]
    assert a6.shape == a54.shape == (497, 149)
    assert a6.sum() == 31004 and a54.sum() == 31007
    assert abs(overlap(a6, a54) - 0.98689523) < 1e-7
    print(f"p6 vs p54 giant A IoU={overlap(a6,a54):.8f}; "
          "p54's separate dot belongs to the ordinary text line")
    print("PASS: p54 red 9x10 point is an ordinary source-height word separator; "
          "no distinct visible delimiter opcode or cipher key was found")


if __name__ == "__main__":
    main()
