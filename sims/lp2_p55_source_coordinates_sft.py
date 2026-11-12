"""Original-pixel positive control for LP2 p55 (source 72.jpg).

Requires numpy and OpenCV; reads pinned original images, no OCR or model fitting.
"""
from pathlib import Path
import hashlib
import json

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "resources" / "liber-primus"
IMAGE = BASE / "72.jpg"
GEOMETRY = BASE / "lp2-p55-source-glyph-coordinates.json"
EXPECTED_SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"
SCAN_BANDS = [(650, 790), (835, 975), (1010, 1160), (1180, 1350)]


def intervals(xs: np.ndarray) -> list[tuple[int, int]]:
    return [(int(block[0]), int(block[-1])) for block in np.split(xs, np.flatnonzero(np.diff(xs) > 1) + 1)]


def main() -> None:
    assert hashlib.sha256(IMAGE.read_bytes()).hexdigest() == EXPECTED_SHA256
    image = cv2.imread(str(IMAGE), cv2.IMREAD_COLOR)
    b, g, r = cv2.split(image)
    black = (b < 110) & (g < 110) & (r < 110)
    red = (b < 100) & (g < 100) & (r > 145)
    data = json.loads(GEOMETRY.read_text(encoding="utf-8"))

    glyphs = []
    dots = []
    for line, (y1, y2) in enumerate(SCAN_BANDS, 1):
        region = black[y1:y2, 580:1810]
        xs = np.flatnonzero(region.sum(axis=0) > 1)
        for start, end in intervals(xs):
            x1, x2 = start + 580, end + 580
            rows = np.flatnonzero(region[:, start:end + 1].any(axis=1))
            rect = [x1, int(y1 + rows[0]), x2, int(y1 + rows[-1])]
            (glyphs if rows[-1] - rows[0] > 35 else dots).append({"line": line, "rect": rect})
    expected_glyphs = [dict(line=o["line"], rect=o["rect"]) for o in data["glyphs"]]
    expected_dots = [dict(line=o["line"], rect=o["rect"]) for o in data["interword_dots"]]
    assert glyphs == expected_glyphs, "Original black-glyph coordinates changed"
    assert dots == expected_dots, "Original word punctuation changed"
    assert len(glyphs) == 76 and len(dots) == 16

    count, _, stat, _ = cv2.connectedComponentsWithStats(red.astype("uint8"), 8)
    squares = sorted(
        [[int(stat[i, 0]), int(stat[i, 1]), int(stat[i, 2]), int(stat[i, 3])]
         for i in range(1, count)
         if 5 <= stat[i, 2] <= 20 and 5 <= stat[i, 3] <= 20]
    )
    assert squares == sorted(data["terminal_red_squares"])
    assert len(squares) == 13

    corpus = json.loads((BASE / "lp2-corpus.json").read_text(encoding="utf-8"))
    canonical = next(page for page in corpus["pages"] if page["page"] == 55)["indices"]
    assert [glyph["gp29_index"] for glyph in data["glyphs"]] == canonical
    assert canonical[-3:] == [17, 18, 10]
    assert glyphs[-1]["rect"] == [1019, 1238, 1028, 1349]
    print("PASS: original p55 76 black GP29 runes, 16 black separators, 13 red squares")
    print("PASS: 76 source-coordinate GP29 identities agree with canonical p55")
    print("PASS: final BEI consists of three distinct black glyphs before the red terminal ornament")


if __name__ == "__main__":
    main()
