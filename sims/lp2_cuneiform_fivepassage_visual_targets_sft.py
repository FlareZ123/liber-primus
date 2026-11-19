#!/usr/bin/env python3
"""Read-only visual cross-check for the five-passage SHED page targets.

Run from the repository root:
    python sims/lp2_cuneiform_fivepassage_visual_targets_sft.py

An optional first argument supplies an alternate directory containing the
original numbered JPEGs (for example, a local extracted source archive).
"""
from pathlib import Path
import hashlib
import sys

from PIL import Image

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("resources/liber-primus")

def load_scan(number):
    path = ROOT / (str(number).zfill(2) + ".jpg")
    if not path.is_file():
        raise FileNotFoundError(path)
    image = Image.open(path).convert("L")
    if image.size != (2400, 3600):
        raise AssertionError((path, image.size))
    return image

# The page targets are 1-based ordinals [46,35,50,38,58], i.e. physical
# pages p45,p34,p49,p37,p57 and archive scans 62,51,66,54,74.
for scan in (62, 51, 66, 54, 74):
    load_scan(scan)

checks = [
    (
        "p45/p49 left tree-border crop",
        62, 66, (0, 700, 500, 3000),
        "01f95fadea3e901f076f81d5d09ea2349fc20ca88931d1965a166c1a096e0910",
    ),
    (
        "p45/p49 right tree-border crop",
        62, 66, (1900, 700, 2400, 3000),
        "0ce08c89f94901d4b8444527418f55a15f2962f5725c3d22addf79231e6cea29",
    ),
    (
        "p34/p37 cuneiform-header crop",
        51, 54, (900, 40, 1500, 430),
        "af14dee6fa232506c52103393b47690e2eb52a96b50f10e594f36c21693dc66f",
    ),
]

for label, left_scan, right_scan, box, expected_hash in checks:
    left = load_scan(left_scan).crop(box)
    right = load_scan(right_scan).crop(box)
    if left.size != right.size or left.tobytes() != right.tobytes():
        raise AssertionError(label + ": crops are not pixel-identical")
    digest = hashlib.sha256(left.tobytes()).hexdigest()
    if digest != expected_hash:
        raise AssertionError(label + ": unexpected crop hash " + digest)
    print(label + ": identical, sha256=" + digest)

print("p57 (scan 74) is present as the terminal central-tree target; no pixel identity with p45/p49 is asserted.")
