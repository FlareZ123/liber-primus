"""Check whether the sixteen original LP2 vine-margin illustrations vary.

Read-only original-JPEG pixel gate: compare actual 2400x3600 RGB
pixels on both side vines for all p40..p55, plus the changing central
rune-bearing region. Results are independent of threshold choices.
Windows CPython 3.12 and Pillow 11.3.0, no network or file writes.

Repository manual workflow: manual-readonly-python-image-sft.yml
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "resources" / "liber-primus"
FIRST_PAGE = 40
LAST_PAGE = 55
SIZE = (2400, 3600)
# Coordinate rectangles (left, top, right, bottom), exclusive right/bottom.
LEFT_VINE = (0, 560, 560, 2890)
RIGHT_VINE = (1840, 560, 2400, 2890)
CENTRAL_TEXT = (630, 680, 1770, 2800)


def digest_crop(image: Image.Image, box: tuple[int, int, int, int]) -> str:
    """Hash the exact RGB pixel channel bytes of a fixed original crop."""
    return hashlib.sha256(image.crop(box).tobytes()).hexdigest()


def main() -> None:
    """Compare original artwork directly without segmentation or OCR."""
    rows: list[dict[str, object]] = []
    for p in range(FIRST_PAGE, LAST_PAGE + 1):
        jpeg = p + 17
        source = IMAGES / f"{jpeg:02d}.jpg"
        with Image.open(source) as jpg:
            assert jpg.format == "JPEG", source
            assert jpg.size == SIZE, (source, jpg.size)
            image = jpg.convert("RGB")
        rows.append(
            {
                "lp2_page": p,
                "jpg": source.name,
                "left_vine_sha256": digest_crop(image, LEFT_VINE),
                "right_vine_sha256": digest_crop(image, RIGHT_VINE),
                "central_text_sha256": digest_crop(image, CENTRAL_TEXT),
            }
        )
    left = {str(row["left_vine_sha256"]) for row in rows}
    right = {str(row["right_vine_sha256"]) for row in rows}
    center = {str(row["central_text_sha256"]) for row in rows}
    assert len(rows) == 16
    assert len(left) == 1, "Page-dependent image pixels in left vine"
    assert len(right) == 1, "Page-dependent image pixels in right vine"
    assert len(center) == 16, "Unexpected duplicate central text crops"
    pixels_per_margin = (560 - 0) * (2890 - 560)
    assert pixels_per_margin == 1304800
    print(
        json.dumps(
            {
                "classification": "exact original-image template check",
                "pages": "p40..p55",
                "source_jpegs": "57.jpg..72.jpg",
                "original_size": list(SIZE),
                "source_crops": {
                    "left_vine": LEFT_VINE,
                    "right_vine": RIGHT_VINE,
                    "central_text": CENTRAL_TEXT,
                },
                "unique_left_vine_RGB_bytes": len(left),
                "unique_right_vine_RGB_bytes": len(right),
                "unique_central_text_RGB_bytes": len(center),
                "RGB_pixels_per_page_in_both_vines": 2 * pixels_per_margin,
                "vine_left_sha256": rows[0]["left_vine_sha256"],
                "vine_right_sha256": rows[0]["right_vine_sha256"],
                "control_center_first": rows[0]["central_text_sha256"],
                "control_center_last": rows[-1]["central_text_sha256"],
                "result": (
                    "The two fixed side-vine strips are pixel-for-pixel "
                    "identical across all sixteen original page scans, "
                    "while every corresponding central text strip differs. "
                    "The side-vine templates contain no page-varying "
                    "visual/LSB signal within these bounds; a shared "
                    "template payload or changes outside the crop remain open."
                ),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
