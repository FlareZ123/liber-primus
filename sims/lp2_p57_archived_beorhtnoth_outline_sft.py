"""Original LP2 p57 red PARABLE versus archived 2013 BabelStone Beorhtnoth outlines.

Run from repository root after installing Pillow:
    python sims/lp2_p57_archived_beorhtnoth_outline_sft.py
No font bytes are redistributed. Outlines are the uncurved, on-curve polygons of
U+16C8, U+16AA, U+16B1 and U+16D2 taken from the archived 2013 TTF,
GitHub blob 414f3b5852438dd8450411e204aeff75adab0d42.
"""
from hashlib import sha256
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus" / "74.jpg"
SHA256 = "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"
N = 144
# Physical source: x inclusive, y=917..1030 inclusive. First five PARABLE runes.
SITES = [(0x16C8, 890, 922), (0x16AA, 928, 961),
         (0x16B1, 966, 999), (0x16AA, 1004, 1037),
         (0x16D2, 1044, 1076)]
# Candidate Beorhtnoth glyf coordinates in TTF units (head.unitsPerEm=2048).
# Inner contours of U+16D2 are knockouts, not separate filled glyphs.
OUTLINES = {
    0x16C8: [[(200,1800),(850,1425),(1150,1800),(1400,1800),
              (900,1150),(400,1436),(400,364),(900,650),(1400,0),
              (1150,0),(850,375),(200,0)]],
    0x16AA: [[(200,1800),(800,1425),(1200,1800),(1200,1550),
              (800,1175),(400,1417),(400,1067),(1000,700),(1000,450),
              (400,817),(400,0),(200,0)]],
    0x16B1: [[(600,800),(900,1250),(400,1500),(400,0),(200,0),
              (200,1800),(1200,1300),(850,800),(1400,0),(1150,0)]],
    0x16D2: [[(1200,1250),(564,900),(1200,550),(200,0),(200,1800)],
              [(400,790),(400,310),(836,550)],
              [(836,1250),(400,1490),(400,1010)]],
}


def source_glyph(image, left, right):
    rect = image.crop((left, 917, right + 1, 1031)).convert("RGB")
    ink = Image.new("L", rect.size)
    pixels = rect.load()
    mask = ink.load()
    for y in range(rect.height):
        for x in range(rect.width):
            r, g, b = pixels[x, y]
            if r > 95 and r > 1.6 * g and r > 1.6 * b and g < 180:
                mask[x, y] = 255
    bounds = ink.getbbox()
    assert bounds is not None
    return ink.crop(bounds).resize((N, N), Image.Resampling.NEAREST), bounds


def candidate_glyph(codepoint):
    contours = OUTLINES[codepoint]
    xs = [x for c in contours for x, _ in c]
    ys = [y for c in contours for _, y in c]
    xlo, xhi, ylo, yhi = min(xs), max(xs), min(ys), max(ys)
    canvas = Image.new("L", (240, 240))
    pen = ImageDraw.Draw(canvas)
    for j, contour in enumerate(contours):
        points = [((x - xlo) * 239 / (xhi - xlo),
                   (yhi - y) * 239 / (yhi - ylo)) for x, y in contour]
        pen.polygon(points, fill=255 if j == 0 else 0)
    return canvas.resize((N, N), Image.Resampling.NEAREST), (xhi-xlo, yhi-ylo)


def iou(first, second):
    a, b = first.tobytes(), second.tobytes()
    overlap = sum(x > 127 and y > 127 for x, y in zip(a, b))
    union = sum(x > 127 or y > 127 for x, y in zip(a, b))
    return overlap / union


def main():
    assert sha256(SOURCE.read_bytes()).hexdigest() == SHA256
    original = Image.open(SOURCE)
    scores = []
    for codepoint, left, right in SITES:
        sampled, bounds = source_glyph(original, left, right)
        candidate, (width, height) = candidate_glyph(codepoint)
        score = iou(sampled, candidate)
        scores.append(score)
        print(f"U+{codepoint:04X} original x={left}..{right} "
              f"bbox={bounds} candidate_bbox={width}x{height} IoU={score:.4f}")
    print(f"Unweighted mean of five original glyphs: {sum(scores)/len(scores):.4f}")
    assert min(scores) < 0.45  # Obvious shape mismatch, not a decryption test.


if __name__ == "__main__":
    main()
