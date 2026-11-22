"""Original image ink SFT for four LP2 apostrophe glyphs.

Windows Python 3.12, Pillow 11.3.0, NumPy 2.2.6.
The JPEGs in resources/liber-primus are the original physical archive scans.
For each source-selected known mark, measure dark pixels in a tightly locked ROI.
Compare to a same-line ordinary word separator square dot. This rejects the
historical claim that only identical dot-sized glyphs occur at those locations.
"""
from pathlib import Path

import numpy as np
from PIL import Image

BASE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
# Original LP1 p14 Koan source control: encrypted I-RWNB has a single
# apostrophe before final B, corresponding to solved plain "I DON'T".
SOLVED_LP1_SITE = (14, "14.jpg", (1051, 2122, 12, 40), (1114, 2151, 10, 9))
SOURCE_SITES = [
    # physical LP2 page, archive JPEG, apostrophe x/y/w/h, same-line dot x/y/w/h
    (4, "21.jpg", (1400, 2014, 12, 40), (755, 2043, 9, 9)),
    (21, "38.jpg", (1258, 884, 12, 40), (1154, 913, 9, 10)),
    (35, "52.jpg", (1195, 1261, 12, 40), (1274, 1290, 9, 10)),
    (41, "58.jpg", (1304, 2390, 12, 40), (1381, 2420, 9, 9)),
]


def exact_ink_bbox(gray: np.ndarray, predicted: tuple[int, int, int, int]):
    """Compute bounding rectangle of thresholded pixels within locked 3px margin."""
    x, y, width, height = predicted
    crop = gray[y - 3:y + height + 3, x - 3:x + width + 3]
    ys, xs = np.nonzero(crop < 130)
    assert len(xs) > 0, f"No original ink in ROI {predicted}"
    actual = (
        x - 3 + int(xs.min()),
        y - 3 + int(ys.min()),
        int(xs.max() - xs.min() + 1),
        int(ys.max() - ys.min() + 1),
    )
    return actual, int(len(xs))


def main() -> None:
    # Control has an exact original ciphertext word and independently solved text.
    lp1_path = BASE.parent / "transcriptions" / "lp1_wulfic_canonical.txt"
    plain_path = BASE / "lp1-plaintext-reference.txt"
    lp1_p14 = lp1_path.read_text(encoding="utf-8").split("%")[12]
    plaintext_p14 = plain_path.read_text(encoding="utf-8").split("### 14\n")[1].split("### 15\n")[0]
    assert "ᛁ-ᚱᚹᚾᛒ" in lp1_p14
    assert "I DON'T HAVE" in plaintext_p14
    _, control_filename, control_mark, control_dot = SOLVED_LP1_SITE
    with Image.open(BASE / control_filename) as image:
        assert image.size == (2400, 3600)
        control_gray = np.asarray(image.convert("L"), dtype=np.uint8)
    known_bbox, known_pixels = exact_ink_bbox(control_gray, control_mark)
    known_dot_bbox, known_dot_pixels = exact_ink_bbox(control_gray, control_dot)
    assert known_bbox == control_mark and known_pixels == 379
    assert known_dot_bbox == control_dot and known_dot_pixels == 90
    print(
        f"POSITIVE CONTROL LP1 p14: I-RWN'B = I DON'T, {control_filename} "
        f"apostrophe={known_bbox} pixels={known_pixels}, dot={known_dot_bbox}"
    )

    for physical, filename, stroke, dot in SOURCE_SITES:
        with Image.open(BASE / filename) as image:
            assert image.size == (2400, 3600), (filename, image.size)
            gray = np.asarray(image.convert("L"), dtype=np.uint8)
        apostrophe_actual, apostrophe_ink = exact_ink_bbox(gray, stroke)
        dot_actual, dot_ink = exact_ink_bbox(gray, dot)
        print(
            f"LP2 p{physical:02} source {filename}: "
            f"apostrophe bbox={apostrophe_actual} pixels={apostrophe_ink}; "
            f"ordinary same-line separator bbox={dot_actual} pixels={dot_ink}"
        )
        assert apostrophe_actual == stroke, (filename, "stroke", apostrophe_actual)
        assert dot_actual == dot, (filename, "dot", dot_actual)
        assert apostrophe_actual[3] == 40
        assert 9 <= dot_actual[3] <= 10
        assert apostrophe_actual[3] / dot_actual[3] >= 4
        assert apostrophe_ink == 379
        assert dot_ink in (81, 90, 100)

    print("PASS original solved LP1 apostrophe and four source-identical LP2 raised marks.")
    print("Source-visible glyphs establish four punctuation locations, not plaintext or keys.")


if __name__ == "__main__":
    main()
