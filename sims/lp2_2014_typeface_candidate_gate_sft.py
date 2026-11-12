"""Original-image LP2 p0 gate for archived BabelStone Beorhtnoth runic font.

The first seven black glyphs on LP2 p0 are ᚦᛄᚷᚫᚠᛄᛟ.
Their observed relative ink widths differ from the archived font's unmodified
Unicode cmap glyph outlines under any uniform horizontal scale.

Requires Pillow. Optional --font verifies the exact original archive font
blob SHA and the cmap/glyf metrics, without redistributing its bytes.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

FONT_BLOB_SHA1 = "414f3b5852438dd8450411e204aeff75adab0d42"
IMAGE_SHA256 = "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e"
FONT_INK_WIDTH_UNITS = {"ᚦ": 900, "ᛄ": 1200, "ᚷ": 1567, "ᚠ": 800, "ᛟ": 1200}
FIRST_BLACK_RUNES = "ᚦᛄᚷᚫᚠᛄᛟ"
EXPECTED_BOXES = [
    [1450, 673, 34, 114],
    [1487, 673, 45, 114],
    [1537, 673, 44, 114],
    [1586, 673, 34, 114],
    [1641, 673, 34, 114],
    [1679, 673, 46, 114],
    [1729, 673, 44, 114],
]


def original_glyph_boxes(image: Image.Image) -> list[list[int]]:
    """Find eight-connected black ink in the known first-line p0 rectangle."""
    pixels = image.convert("RGB").load()
    x0, y0, x1, y1 = 1400, 655, 1900, 795
    remaining = {
        (x, y)
        for y in range(y0, y1)
        for x in range(x0, x1)
        if max(pixels[x, y]) < 140
    }
    boxes = []
    while remaining:
        stack = [remaining.pop()]
        xs, ys = [], []
        while stack:
            x, y = stack.pop()
            xs.append(x)
            ys.append(y)
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    point = (x + dx, y + dy)
                    if point in remaining:
                        remaining.remove(point)
                        stack.append(point)
        xmin, xmax = min(xs), max(xs)
        ymin, ymax = min(ys), max(ys)
        if len(xs) > 1000 and ymax - ymin + 1 >= 110:
            boxes.append([xmin, ymin, xmax - xmin + 1, ymax - ymin + 1])
    return sorted(boxes)


def check_archived_font(path: Path) -> None:
    """Check the original TTF's SHA-1 Git blob and regular cmap outlines."""
    from fontTools.ttLib import TTFont

    contents = path.read_bytes()
    header = b"blob " + str(len(contents)).encode() + b"\0"
    got = hashlib.sha1(header + contents).hexdigest()
    assert got == FONT_BLOB_SHA1, (got, FONT_BLOB_SHA1)
    font = TTFont(path)
    cmap = font.getBestCmap()
    outlines = font["glyf"]
    for rune, expected in FONT_INK_WIDTH_UNITS.items():
        glyph = outlines[cmap[ord(rune)]]
        actual = glyph.xMax - glyph.xMin
        assert actual == expected, (rune, expected, actual)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--image", type=Path,
        default=Path(__file__).resolve().parents[1] / "resources/liber-primus/17.jpg",
    )
    parser.add_argument("--font", type=Path)
    args = parser.parse_args()
    assert hashlib.sha256(args.image.read_bytes()).hexdigest() == IMAGE_SHA256
    boxes = original_glyph_boxes(Image.open(args.image))
    assert boxes == EXPECTED_BOXES, boxes
    if args.font is not None:
        check_archived_font(args.font)
    widths = [box[2] for box in boxes]
    printed_ratio = widths[2] / ((widths[1] + widths[5]) / 2)
    font_ratio = FONT_INK_WIDTH_UNITS["ᚷ"] / FONT_INK_WIDTH_UNITS["ᛄ"]
    assert abs(printed_ratio - font_ratio) > 0.3
    print(json.dumps({
        "first_black_line": FIRST_BLACK_RUNES,
        "image_sha256": IMAGE_SHA256,
        "font_git_blob_sha1": FONT_BLOB_SHA1,
        "original_boxes_xywh": boxes,
        "printed_G_to_J_mean": printed_ratio,
        "font_G_to_J": font_ratio,
        "classification": "archived Beorhtnoth standard Unicode glyphs are not the original LP2 typeface under uniform font scaling",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
