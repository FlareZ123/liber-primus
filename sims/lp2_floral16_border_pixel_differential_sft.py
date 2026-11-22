"""Original-source LP2 p40–55 floral-template RGB differential, read-only SFT.

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


def diff_region(a: Image.Image, b: Image.Image, box: tuple[int, int, int, int]):
    """Bounding box and count of changed pixels in at least one RGB channel."""
    delta = ImageChops.difference(a.crop(box), b.crop(box))
    red, green, blue = delta.split()
    channel_union = ImageChops.lighter(red, ImageChops.lighter(green, blue))
    return channel_union.getbbox(), sum(channel_union.histogram()[1:])


def main() -> None:
    images = {}
    for scan in SCANS:
        file = ROOT / "resources" / "liber-primus" / f"{scan:02d}.jpg"
        with Image.open(file) as jpeg:
            assert jpeg.size == (2400, 3600), (file, jpeg.size)
            images[scan] = jpeg.convert("RGB")
    reference = images[57]
    assert diff_region(reference, reference, TEXT_RECT) == (None, 0)

    # A one-channel mutation must be detected, including if luma barely changes.
    mutated = reference.copy()
    red, green, blue = mutated.getpixel((400, 1200))
    mutated.putpixel((400, 1200), ((red + 1) % 256, green, blue))
    assert diff_region(reference, mutated, REGIONS["left"])[1] == 1
    assert diff_region(reference, mutated, REGIONS["right"])[1] == 0

    for scan in SCANS:
        other = images[scan]
        print(f"source JPEG {scan:02d}.jpg / physical LP2 p{scan-17}")
        for name, box in REGIONS.items():
            bbox, pixels = diff_region(reference, other, box)
            print(f"  {name}: RGB-different decoded pixels={pixels} bbox={bbox}")
            if scan <= 71:
                assert (bbox, pixels) == (None, 0), (scan, name, pixels)
            elif name == "right":
                assert (bbox, pixels) == ((0, 2780, 22, 2872), 1070)
            else:
                assert (bbox, pixels) == (None, 0), (scan, name, pixels)
        if scan != 57:
            assert diff_region(reference, other, TEXT_RECT)[1] > 1000

    print("PASS: 16 original images; 15 exact RGB outer frames; p55 moth-wing exception isolated")


if __name__ == "__main__":
    main()
