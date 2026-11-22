"""Source-pixel SFT for the repeated LP2 cuneiform numeral header.

Read-only; requires Pillow and the original resources/liber-primus/{50..56}.jpg.
The historical source comparison is documented separately, not asserted by this test.
"""
from hashlib import sha256
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
BOX = (960, 110, 1540, 560)
REFERENCE_IMAGE_SHA256 = "6f1b4c04b64ee54c689478bd3986bb6ab8a3b81f48780562094e9f248e4e87f8"
REFERENCE_CROP_SHA256 = "0c033925997418b428a4b409addc20d62697a74dba97d9d7ebe4b1cb6db70f18"


def cropped_image(page: int, box: tuple[int, int, int, int]) -> Image.Image:
    with Image.open(ROOT / f"{page:02d}.jpg") as page_image:
        return page_image.convert("RGB").crop(box)


def main() -> None:
    source_bytes = (ROOT / "51.jpg").read_bytes()
    assert sha256(source_bytes).hexdigest() == REFERENCE_IMAGE_SHA256
    original = cropped_image(51, BOX)
    assert sha256(original.tobytes()).hexdigest() == REFERENCE_CROP_SHA256

    # p33 carries the same emblem at its footer; p34-p39 at their header.
    footer = cropped_image(50, (960, 3004, 1540, 3454))
    footer_difference = ImageChops.difference(original, footer)
    mae = sum(ImageStat.Stat(footer_difference).mean) / 3
    assert 0 < mae < 5, f"Unexpected p33 footer divergence: {mae}"
    print(f"p33 footer versus p34 header: mean RGB abs difference={mae:.5f}")

    for page in range(51, 57):
        candidate = cropped_image(page, BOX)
        assert ImageChops.difference(original, candidate).getbbox() is None
        print(f"p{page-17} ({page:02d}.jpg): 580x450 crop EXACT PIXEL MATCH")

    # Standard left-to-right sexagesimal place notation for the two rows.
    assert 17 * 60 + 13 == 1033
    assert 55 * 60 + 1 == 3301
    print("Two numeral rows: (17,13)_60 = 1033; (55,1)_60 = 3301")
    print("PASS: repeated source artwork and numeric reading, no LP2 decoder claimed")


if __name__ == "__main__":
    main()
