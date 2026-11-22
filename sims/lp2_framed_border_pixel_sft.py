"""Original-source LP2 p40-p55 ornamental-border pixel-equivalence SFT.

Requires Pillow and the repository's pinned original JPEGs in
resources/liber-primus/{00..74}.jpg. No files are changed.
"""

from collections import Counter
from hashlib import sha256
from pathlib import Path

from PIL import Image

SOURCE = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
GRAY_PAGES = (
    16, 17, 18, 19, 20, 21, 24, 25, 28, 29, 30, 31,
    41, 42, 43, 44, 45, 46, 47, 48, 50, 51, 52,
)
FRAMED_PAGES = range(40, 56)
EXPECTED_BORDER_SHA256 = "fcc52a7e8855dccde78fd18dde9174fe9d7899b28f93f868647243d0355233ce"


def open_page(page):
    return Image.open(SOURCE / f"{page + 17:02}.jpg")


def border_digest(page):
    with open_page(page) as image:
        assert image.size == (2400, 3600)
        luminance = image.convert("L")
        left = luminance.crop((0, 400, 280, 2900)).tobytes()
        right = luminance.crop((2120, 400, 2400, 2900)).tobytes()
    assert len(left) == len(right) == 700_000
    return sha256(left + right).hexdigest()


def main():
    modes = {}
    quantizers = {}
    for page in range(58):
        with open_page(page) as image:
            modes[page] = image.mode
            quantizers[page] = tuple(image.quantization[0])
            assert image.size == (2400, 3600)

    observed_gray = tuple(page for page, mode in modes.items() if mode == "L")
    assert observed_gray == GRAY_PAGES, (observed_gray, GRAY_PAGES)
    assert all(mode in ("L", "RGB") for mode in modes.values())
    assert len(set(quantizers.values())) == 1
    print("Original LP2 58-page JPEG color modes:", dict(Counter(modes.values())))
    print("Grayscale physical pages:", ",".join(map(str, observed_gray)))
    print("Identical luminance quantizer 0 across all 58 LP2 pages: YES")

    found = {page: border_digest(page) for page in FRAMED_PAGES}
    assert all(value == EXPECTED_BORDER_SHA256 for value in found.values())
    for page in [39, 56]:
        assert border_digest(page) != EXPECTED_BORDER_SHA256
    print("Framed LP2 pages:", list(FRAMED_PAGES))
    print("Border: x=0..279 and x=2120..2399, y=400..2899")
    print("Decoded luminance pixels per image:", 1_400_000)
    print("Pixel-identical against p40 on all other framed pages:", 15)
    print("Border SHA256:", EXPECTED_BORDER_SHA256)
    print("Adjacent unframed negative controls p39 and p56 differ: YES")
    print("PASS: original-source border equivalence and image-mode inventory")


if __name__ == "__main__":
    main()
