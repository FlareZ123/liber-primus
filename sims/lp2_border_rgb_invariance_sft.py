"""Exact original LP2 pp40–55 five-dot border RGB channel check.

Run from repository root with Pillow installed:
python sims/lp2_border_rgb_invariance_sft.py
"""
from hashlib import sha256
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "resources" / "liber-primus"
PAGES = range(57, 73)
WIDTH, HEIGHT = 2400, 3600
BORDER = 520
EXPECTED_SHA256 = "b32ebfc7de0e07e5a695c65a707c6970e49f8f5cfa8a110df11e7b7caf5e1089"


def main():
    middle_hashes = set()
    source_modes = {}
    for image_number in PAGES:
        with Image.open(ROOT / f"{image_number}.jpg") as source:
            assert source.size == (WIDTH, HEIGHT), image_number
            source_modes[image_number] = source.mode
            rgb = source.convert("RGB")
            borders = Image.new("RGB", (2 * BORDER, HEIGHT))
            borders.paste(rgb.crop((0, 0, BORDER, HEIGHT)), (0, 0))
            borders.paste(rgb.crop((WIDTH - BORDER, 0, WIDTH, HEIGHT)), (BORDER, 0))
            border_hash = sha256(borders.tobytes()).hexdigest()
            assert border_hash == EXPECTED_SHA256, (image_number, border_hash)
            middle_hashes.add(sha256(rgb.crop((BORDER, 0, WIDTH - BORDER, HEIGHT)).tobytes()).hexdigest())
    assert len(middle_hashes) == len(PAGES), "Source central panels must be distinct"
    print({
        "original_jpegs": ["57.jpg", "72.jpg"],
        "source_pages": "LP2 physical pp40–55 inclusive",
        "identical_decoded_RGB_border_sha256": EXPECTED_SHA256,
        "border_pixels_per_page": 2 * BORDER * HEIGHT,
        "identical_border_images": len(PAGES),
        "unique_middle_images": len(middle_hashes),
        "jpeg_source_modes": source_modes,
        "interpretation": "No per-page decoded RGB payload in either repeated 520px border; DCT-domain variants and other image regions remain untested."
    })


if __name__ == "__main__":
    main()
