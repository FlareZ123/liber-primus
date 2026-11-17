"""Source-JPEG repeat test for the pp33–39 sexagesimal emblem.

Read-only, deterministic source test. Requires Pillow.
Run from the repository root on Windows or any Python environment:
    python sims/lp2_cuneiform_repeated_header_original_sft.py

LP2 physical p33..p39 correspond to original 50.jpg..56.jpg.
"""
from hashlib import sha256
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"

def grayscale(scan: int) -> Image.Image:
    with Image.open(SOURCE / f"{scan:02d}.jpg") as original:
        assert original.size == (2400, 3600)
        return original.convert("L")

def iou(a: Image.Image, b: Image.Image, threshold: int = 128) -> float:
    assert a.size == b.size
    x = [value < threshold for value in a.tobytes()]
    y = [value < threshold for value in b.tobytes()]
    intersection = sum(u and v for u, v in zip(x, y))
    union = sum(u or v for u, v in zip(x, y))
    return intersection / union

# The entire two-line sign, including white margins, at its original
# printed top location. The all-six identity is a *pixel equality*,
# stronger than matching only rune labels or visually similar shapes.
top = (1015, 140, 1410, 565)
reference = grayscale(51).crop(top).tobytes()
digest = sha256(reference).hexdigest()
for scan in range(51, 57):
    observed = grayscale(scan).crop(top).tobytes()
    assert observed == reference, f"header differs on {scan:02d}.jpg"
    print(f"scan {scan:02d}: identical 395x425 grayscale pixels")

assert digest == "4dd11e3eeaa4b68ce061c6538ee015588604d6797b2c496748f93e662b3c3fe8"
print(f"six-scan crop SHA256: {digest}")

# On the first page of the chapter, the same visual emblem sits *below*
# the text. Its two rows have slightly different pixel registration and
# JPEG phase. Record shape overlap without asserting raw identity.
first, second = grayscale(50), grayscale(51)
rows = (
    ("upper", (1015, 3046, 1396, 3253), (1015, 153, 1396, 360)),
    ("lower", (1015, 3260, 1396, 3444), (1015, 366, 1396, 550)),
)
for name, first_rect, repeat_rect in rows:
    overlap = iou(first.crop(first_rect), second.crop(repeat_rect))
    assert overlap > 0.88
    print(f"first-page {name} row ink IoU after geometric registration: {overlap:.12f}")

print("PASS: pp34–39 have no per-page header-raster variations.")
