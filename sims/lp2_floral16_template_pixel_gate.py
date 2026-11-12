"""Source-original shared floral-art gate, physical LP2 pages 40--55.

Run from repository root: python sims/lp2_floral16_template_pixel_gate.py
Requires Pillow. All comparisons decode original archive JPEGs; it does not
claim to measure hidden DCT coefficients.
"""
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "resources" / "liber-primus"
# Archive scan N+17 corresponds to physical LP2 page N.
PAGES = tuple(range(40, 56))
REGIONS = {
    "left_ornament": (70, 600, 550, 2950),
    "right_ornament": (1850, 600, 2380, 2950),
}
TEXT_REGION = (650, 650, 1750, 2850)


def main() -> None:
    covers = {}
    source = {}
    for p in PAGES:
        image_path = IMAGES / f"{p + 17:02d}.jpg"
        with Image.open(image_path) as image:
            source[p] = image.convert("RGB")
    for label, region in REGIONS.items():
        baseline = source[40].crop(region)
        count = 0
        for p in PAGES[1:]:
            difference = ImageChops.difference(baseline, source[p].crop(region))
            assert difference.getbbox() is None, f"{label} differs at p{p}"
            count += 1
        covers[label] = count
    base_text = source[40].crop(TEXT_REGION)
    assert all(
        ImageChops.difference(base_text, source[p].crop(TEXT_REGION)).getbbox()
        is not None for p in PAGES[1:]
    ), "Control: text should change between pages"
    original = source[40].crop(REGIONS["left_ornament"])
    modified = original.copy()
    value = modified.getpixel((100, 100))
    modified.putpixel((100, 100), ((value[0] + 1) % 256, value[1], value[2]))
    assert ImageChops.difference(original, modified).getbbox() is not None
    print({
        "physical_pages": [40, 55],
        "decoded_ornament_regions": REGIONS,
        "exact_ornament_comparisons": covers,
        "different_text_comparisons": 15,
        "positive_control_single_pixel_delta_detected": True,
        "scope": "decoded RGB crop equality only, not coefficient or hidden-payload extraction",
    })


if __name__ == "__main__":
    main()
