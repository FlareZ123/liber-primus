"""Source-image SFT for Director #1624.

Tests whether the five-dot left/right tree asymmetry on original JPEG 67
(physical p50) is p50-specific or a reused page-frame motif.

Requires Pillow 12.3.0. Reads original JPEGs 57..72 from resources/liber-primus.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = ROOT / "resources" / "liber-primus"

LEFT_BOX = (250, 1350, 550, 1650)
RIGHT_BOX = (1850, 1350, 2150, 1650)
EXPECTED_SIZE = (2400, 3600)

# SHA-256 of decoded RGB crop bytes, not JPEG container bytes.
EXPECTED_LEFT_CROP_SHA256 = (
    "bc10e7ebb2e4ac88abce02e5b2a423302c0bd731486abc30aafb906e197063b9"
)
EXPECTED_RIGHT_CROP_SHA256 = (
    "9365a806a5a14d3d9a82d43257603f9941f526a791a7fbf3da1604929fc9be00"
)

# Nominal centers in original JPEG 67, locked from the source pixels before
# interpretation. Slot order is top, upper-left, upper-right, lower-left,
# lower-right in each page's own orientation.
LEFT_CENTERS = [
    (396, 1476),
    (366, 1498),
    (424, 1499),
    (380, 1540),
    (419, 1533),
]
RIGHT_CENTERS = [
    (2003, 1476),
    (1975, 1499),
    (2033, 1498),
    (1980, 1533),
    (2020, 1540),
]
RADIUS = 13
DARK_THRESHOLD = 192
FILLED_MIN_DARK_PIXELS = 100


def sha256_rgb_crop(image: Image.Image, box: tuple[int, int, int, int]) -> str:
    """Hash decoded RGB pixels in one fixed crop."""
    crop = image.convert("RGB").crop(box)
    return hashlib.sha256(crop.tobytes()).hexdigest()


def disk_dark_count(
    image: Image.Image,
    center: tuple[int, int],
    radius: int = RADIUS,
) -> int:
    """Count dark pixels inside a circular sample around one locked dot center."""
    gray = image.convert("L")
    cx, cy = center
    pixels = gray.load()
    count = 0

    for y in range(cy - radius, cy + radius + 1):
        for x in range(cx - radius, cx + radius + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 > radius**2:
                continue
            if pixels[x, y] < DARK_THRESHOLD:
                count += 1

    return count


def classify(image: Image.Image, centers: list[tuple[int, int]]) -> tuple[list[int], str]:
    """Return per-dot dark counts and H/F pattern."""
    counts = [disk_dark_count(image, center) for center in centers]
    pattern = "".join("F" if count >= FILLED_MIN_DARK_PIXELS else "H" for count in counts)
    return counts, pattern


def main() -> None:
    left_hashes: dict[int, str] = {}
    right_hashes: dict[int, str] = {}

    for jpeg in range(57, 73):
        path = IMAGE_DIR / f"{jpeg:02d}.jpg"
        with Image.open(path) as image:
            assert image.size == EXPECTED_SIZE
            left_hashes[jpeg] = sha256_rgb_crop(image, LEFT_BOX)
            right_hashes[jpeg] = sha256_rgb_crop(image, RIGHT_BOX)

    # The entire 300x300 motif crops are byte-identical after JPEG decode across
    # all sixteen original source images, including p50 JPEG 67.
    assert set(left_hashes.values()) == {EXPECTED_LEFT_CROP_SHA256}
    assert set(right_hashes.values()) == {EXPECTED_RIGHT_CROP_SHA256}

    with Image.open(IMAGE_DIR / "67.jpg") as p50:
        left_counts, left_pattern = classify(p50, LEFT_CENTERS)
        right_counts, right_pattern = classify(p50, RIGHT_CENTERS)

    assert left_pattern == "HFFHF"
    assert right_pattern == "FFFFF"
    assert left_counts == [0, 487, 502, 0, 402]
    assert right_counts == [463, 502, 487, 402, 448]

    # Natural horizontal reflection of the left five-center geometry matches
    # the right geometry to within one source pixel after the fixed crops are
    # placed in their own 300x300 coordinate systems.
    left_local = [(x - LEFT_BOX[0], y - LEFT_BOX[1]) for x, y in LEFT_CENTERS]
    right_local = [(x - RIGHT_BOX[0], y - RIGHT_BOX[1]) for x, y in RIGHT_CENTERS]
    mirrored = [(299 - x, y) for x, y in left_local]

    # Reflection pairs: top->top, upper-left->upper-right,
    # upper-right->upper-left, lower-left->lower-right,
    # lower-right->lower-left.
    pairs = [(0, 0), (1, 2), (2, 1), (3, 4), (4, 3)]
    residuals = []
    for left_index, right_index in pairs:
        lx, ly = mirrored[left_index]
        rx, ry = right_local[right_index]
        residuals.append((abs(lx - rx), abs(ly - ry)))

    assert max(max(dx, dy) for dx, dy in residuals) <= 1

    print(
        {
            "status": "PASS",
            "jpeg_range": "57..72",
            "physical_pages": "40..55",
            "p50_jpeg": 67,
            "left_crop_sha256": EXPECTED_LEFT_CROP_SHA256,
            "right_crop_sha256": EXPECTED_RIGHT_CROP_SHA256,
            "left_pattern": left_pattern,
            "right_pattern": right_pattern,
            "left_dark_counts": left_counts,
            "right_dark_counts": right_counts,
            "reflection_residual_pixels": residuals,
            "decision": (
                "The 3-filled/2-hollow left versus 5-filled right motif is "
                "real but is copied unchanged across all sixteen original "
                "JPEGs 57..72; it is a reused page-frame motif, not a p50-"
                "specific table cue."
            ),
        }
    )


if __name__ == "__main__":
    main()
