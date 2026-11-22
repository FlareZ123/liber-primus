"""Original floral-border core: exact source-pixel equality census.

Python 3.11+, Pillow. Read-only; uses all 16 original LP2 scans 57.jpg..72.jpg.
This is a deliberately narrow source-image negative, not a decoder.
"""
from hashlib import sha256
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus"
CROPS = {
    "left": (180, 650, 500, 3100),
    "right": (1900, 650, 2220, 3100),
}
EXPECTED = {
    "left": ("d53112b55b0dd922ebc5e3adb0bddbe649c7d899f8437d42175974d4ca696779", 79045),
    "right": ("9e1babb9e84936516c8eb9066dbcc110804c452d0d4ec00d9afe20ba499d3602", 79861),
}


def main() -> None:
    for filename_index in range(57, 73):
        scan = SOURCE / f"{filename_index:02}.jpg"
        with Image.open(scan) as image:
            gray = image.convert("L")
        assert gray.size == (2400, 3600), scan
        for side, rectangle in CROPS.items():
            crop = gray.crop(rectangle)
            assert crop.size == (320, 2450)
            payload = crop.tobytes()
            digest = sha256(payload).hexdigest()
            black_pixels = sum(v < 128 for v in payload)
            assert (digest, black_pixels) == EXPECTED[side], (
                scan, side, digest, black_pixels
            )
            print(
                f"scan {filename_index:02} LP2 p{filename_index - 17:02} "
                f"{side:5}: {len(payload)} exact pixels, "
                f"dark={black_pixels}, sha256={digest}"
            )
    print(
        "PASS: all 16 scans share two byte-identical 320x2450-pixel "
        "ornament-core crops; 32/32 checked."
    )


if __name__ == "__main__":
    main()
