"""Original-JPEG-only gate for the physical p53 red Tiwaz as a direction cue.

Usage: python sims/lp2_p53_tiwaz_source_gate_sft.py
Requires Pillow, NumPy, OpenCV. Original scans 70.jpg/71.jpg are never edited.
"""
from hashlib import sha256
from pathlib import Path

import numpy as np
from PIL import Image


SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
HASHES = {
    "70.jpg": "4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548",
    "71.jpg": "dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4",
}


def pixels(name):
    path = SOURCE / name
    assert sha256(path.read_bytes()).hexdigest() == HASHES[name], name
    return np.asarray(Image.open(path).convert("RGB"))


def red_mask(im):
    r, g, b = (im[:, :, i].astype(np.int16) for i in range(3))
    return (r * 10 > g * 14) & (r * 10 > b * 14) & (r < 240) & (g < 160) & (b < 160)


def dark_mask(im):
    return im.max(axis=2) < 110


def rect(mask, x, y, width=50, height=114):
    return mask[y : y + height, x : x + width]


def iou(a, b):
    return np.logical_and(a, b).sum() / np.logical_or(a, b).sum()


def run():
    p53 = pixels("70.jpg")
    p54 = pixels("71.jpg")
    red53 = red_mask(p53)
    dark53 = dark_mask(p53)
    dark54 = dark_mask(p54)

    # Source-visible first red rune, standard GP Tiwaz at p53 local offset 128.
    first_red = rect(red53, 1719, 1650)
    assert first_red.shape == (114, 50)
    assert first_red.sum() == 1502
    print("red p53 local128: 50x114-pixel template; 1502 foreground pixels")

    # Same-page black rune instances, with identical bounding-box dimensions.
    for x, y in ((1107, 1462), (719, 1650)):
        black = rect(dark53, x, y)
        overlap = iou(first_red, black)
        assert overlap == 1.0, (x, y, overlap)
        print(f"p53 black glyph x={x}, y={y}: IoU={overlap:.6f}")

    # Next-page black instance has minor JPEG/font raster differences.
    overlap = iou(first_red, rect(dark54, 1712, 2047))
    assert overlap > 0.97
    print(f"p54 black glyph x=1712, y=2047: IoU={overlap:.6f}")

    # Ink starts on p53: the red T is inline with the final black rune row.
    assert dark53[1650:1764, 600:1700].any()
    assert red53[:1650, 600:1850].sum() == 0
    assert red53[1764:1874, 600:1850].sum() == 0
    assert red53[1874:1988, 600:1850].sum() > 0
    print("p53 red T starts y=1650 inline with final black line;")
    print("remaining red text begins at y=1874, then y=2062 and y=2250")
    print("Conclusion: glyph shape cannot uniquely select vertical traversal.")


if __name__ == "__main__":
    run()
