"""Source-only SFT: identify LP2 three-dot sectional dividers on original JPEGs.

Dependencies: Pillow, NumPy, opencv-python. From repository root:
    python sims/lp2_three_dot_delimiters_sft.py
For an extracted archive ZIP instead:
    python sims/lp2_three_dot_delimiters_sft.py --zip liber-primus-jpegs.zip
"""

import argparse
import hashlib
import json
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHA256 = {
    50: "13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d",
    56: "d1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00",
}
EXPECTED_COUNTS = {7: 5, 23: 5, 33: 3, 39: 3, 56: 5}


def source_bytes(page, archive):
    filename = f"{page + 17:02d}.jpg"
    if archive is not None:
        return archive.read(f"liber-primus-jpegs/{filename}")
    return (ROOT / "resources" / "liber-primus" / filename).read_bytes()


def circles(jpeg):
    rgb = np.asarray(Image.open(BytesIO(jpeg)).convert("RGB"))
    mask = (np.max(rgb, axis=2) < 110).astype(np.uint8)
    count, _, stats, centers = cv2.connectedComponentsWithStats(mask, 8)
    result = []
    for i in range(1, count):
        _, _, width, height, area = map(int, stats[i])
        fill = area / (width * height)
        if (25 <= width <= 80 and 25 <= height <= 80
                and 0.90 <= width / height <= 1.10
                and 0.66 <= fill <= 0.82 and 350 <= area <= 4000):
            result.append((float(centers[i, 0]), float(centers[i, 1]), width, height, area))
    return sorted(result, key=lambda c: c[0])


def run(archive):
    census = {}
    for page in range(58):
        jpeg = source_bytes(page, archive)
        image_number = page + 17
        if image_number in SHA256:
            digest = hashlib.sha256(jpeg).hexdigest()
            assert digest == SHA256[image_number], (image_number, digest)
        found = circles(jpeg)
        if found:
            census[page] = found
            print(f"Physical p{page:02d} / scan {image_number:02d}: {len(found)} circles")
            for x, y, w, h, area in sorted(found, key=lambda c: c[1]):
                print(f"  center=({x:.3f}, {y:.3f}), box={w}x{h}, area={area}")
    assert {p: len(v) for p, v in census.items()} == EXPECTED_COUNTS, census

    left = census[33]
    right = census[39]
    for p, triad in ((33, left), (39, right)):
        assert max(c[1] for c in triad) - min(c[1] for c in triad) < 0.03, p
    t33 = (left[1][0] - left[0][0]) / (left[2][0] - left[0][0])
    t39 = (right[1][0] - right[0][0]) / (right[2][0] - right[0][0])
    assert abs(t33 - t39) < 0.0001, (t33, t39)
    scale = (right[2][0] - right[0][0]) / (left[2][0] - left[0][0])
    expected_middle = right[0][0] + scale * (left[1][0] - left[0][0])
    assert abs(right[1][0] - expected_middle) < 0.08
    print(f"Triplet normalized middle: p33={t33:.8f}, p39={t39:.8f}")
    print(f"Triplet horizontal scale p33→p39={scale:.8f}; middle residual={right[1][0] - expected_middle:+.4f}px")
    print("Comparator: 5-dot pages p7, p23 and solved p56 are not collinear triads.")

    annotation = json.loads((ROOT / "resources" / "liber-primus" / "lp2-ink-annotations.json").read_text(encoding="utf-8"))
    corpus = json.loads((ROOT / "resources" / "liber-primus" / "lp2-corpus.json").read_text(encoding="utf-8"))
    ink = {p["page"]: p for p in annotation["pages"]}
    pages = {p["page"]: p for p in corpus["pages"]}
    assert any(s["start"] == 91 for s in ink[33]["red_spans"])
    assert any(s["start"] == 119 for s in ink[39]["red_spans"])
    assert any(p[0] == 91 and p[1] == 13 for p in ink[33]["large_punctuation"])
    assert any(p[0] == 119 and p[1] == 13 for p in ink[39]["large_punctuation"])
    lengths = [pages[33]["runic_count"] - 91]
    lengths += [pages[p]["runic_count"] for p in range(34, 39)]
    lengths.append(119)
    assert lengths == [123, 261, 271, 238, 228, 228, 119], lengths
    enclosed = sum(lengths)
    broad = sum(pages[p]["runic_count"] for p in range(33, 40)) - 91
    assert enclosed == 1468 and broad == 1589 and broad - enclosed == 121
    print(f"Source-delimited candidate passage: {lengths} = {enclosed} runes")
    print(f"Previously grouped p33:91..p39:end: {broad} runes, including {broad-enclosed} after the p39 delimiter")
    print("PASS: exact original-image geometry and source-punctuation boundary check")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", type=Path, help="Optional original archive (otherwise use resources/liber-primus/)")
    args = parser.parse_args()
    if args.zip:
        with ZipFile(args.zip) as z:
            run(z)
    else:
        run(None)
