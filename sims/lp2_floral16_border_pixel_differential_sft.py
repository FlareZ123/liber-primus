"""Original-source LP2 p40–55 floral-template differential, read-only SFT.

Requires Pillow and original repo JPEGs in resources/liber-primus/57.jpg..72.jpg.
Run as one Python file from any current directory; makes no file writes.
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SCANS = range(57, 73)
REGIONS = {
    "left": (0, 0, 590, 3600),
    "right": (1810, 0, 2400, 3600),
    "top": (0, 0, 2400, 600),
    "bottom": (0, 3200, 2400, 3600),
}
TEXT_RECT = (590, 600, 1810, 3200)


def nonzero_count(im: Image.Image) -> int:
    """Exact count of nonzero grayscale pixels without OCR or thresholding."""
    return sum(im.histogram()[1:])


def diff_region(a: Image.Image, b: Image.Image, box: tuple[int, int, int, int]):
    """Bounding box and exact different-pixel count for one source region."""
    delta = ImageChops.difference(a.crop(box), b.crop(box))
    return delta.getbbox(), nonzero_count(delta)


def main() -> None:
    images = {}
    for scan in SCANS:
        file = ROOT / "resources" / "liber-primus" / f"{scan:02d}.jpg"
        with Image.open(file) as jpeg:
            assert jpeg.size == (2400, 3600), (file, jpeg.size)
            images[scan] = jpeg.convert("L")
    reference = images[57]
    assert diff_region(reference, reference, TEXT_RECT) == (None, 0)

    # A controlled one-pixel original-exterior mutation must be detected.
    mutated = reference.copy()
    initial = mutated.getpixel((400, 1200))
    mutated.putpixel((400, 1200), (initial + 1) % 256)
    assert diff_region(reference, mutated, REGIONS["left"])[1] == 1
    assert diff_region(reference, mutated, REGIONS["right"])[1] == 0

    for scan in SCANS:
        other = images[scan]
        print(f"source JPEG {scan:02d}.jpg / physical LP2 p{scan-17}")
        for name, box in REGIONS.items():
            bbox, pixels = diff_region(reference, other, box)
            print(f"  {name}: different decoded pixels={pixels} bbox={bbox}")
            if scan <= 71:
                assert (bbox, pixels) == (None, 0), (scan, name, pixels)
            elif name == "right":
                assert (bbox, pixels) == ((0, 2780, 22, 2872), 1070)
            else:
                assert (bbox, pixels) == (None, 0), (scan, name, pixels)
        if scan != 57:
            assert diff_region(reference, other, TEXT_RECT)[1] > 1000

    print("PASS: 16 original source images; 15 exact outer frames; p55 moth wing exception isolated")


if __name__ == "__main__":
    main()
