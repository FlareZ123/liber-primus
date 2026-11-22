#!/usr/bin/env python3
"""Original LP2 pp40–55 floral side-border bilateral-mirror geometry gate.

A fixed mirror motif can be a human-visible operation cue, but the geometric
invariant does not identify an artist, edition, cipher, key or plaintext.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image

from lp2_floral_border_template_sft import inspect

LEFT = (0, 0, 500, 3600)
RIGHT = (1900, 0, 2400, 3600)
THRESHOLD = 180


def dark_mask(image: Image.Image, bounds: tuple[int, int, int, int]) -> bytes:
    """Return one byte per grayscale pixel after fixed thresholding."""
    pixels = image.crop(bounds).convert("L").tobytes()
    return bytes(pixel < THRESHOLD for pixel in pixels)


def flip(mask: bytes, width: int, height: int, horizontal: bool, vertical: bool) -> bytes:
    """Permute binary pixels reversibly, without interpolation or resampling."""
    img = Image.frombytes("L", (width, height), mask)
    if horizontal:
        img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if vertical:
        img = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    return img.tobytes()


def overlap(a: bytes, b: bytes) -> dict[str, float | int]:
    assert len(a) == len(b)
    a_count = a.count(1)
    b_count = b.count(1)
    both = sum(x == 1 and y == 1 for x, y in zip(a, b))
    total = a_count + b_count - both
    return {
        "left_ink": a_count,
        "right_ink": b_count,
        "intersection": both,
        "union": total,
        "iou": both / total,
        "f1": 2 * both / (a_count + b_count),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "resources" / "liber-primus",
    )
    args = parser.parse_args()
    # Reuse existing, fully original-source verified 16-image template census.
    prior = inspect(args.source_dir)
    image = Image.open(args.source_dir / "59.jpg").convert("RGB")
    assert image.size == (2400, 3600)
    a = dark_mask(image, LEFT)
    b = dark_mask(image, RIGHT)
    controls = {
        "no_reflection": overlap(a, b),
        "horizontal_reflection": overlap(a, flip(b, 500, 3600, True, False)),
        "vertical_reflection": overlap(a, flip(b, 500, 3600, False, True)),
        "both_reflections": overlap(a, flip(b, 500, 3600, True, True)),
    }
    mirrored = controls["horizontal_reflection"]
    assert mirrored["iou"] > 0.95
    assert all(mirrored["iou"] > controls[k]["iou"] + 0.75
               for k in ("no_reflection", "vertical_reflection", "both_reflections"))
    print(json.dumps({
        "original_image": "59.jpg",
        "physical_lp2_page": 42,
        "native_pixels": [2400, 3600],
        "threshold_grayscale_lt": THRESHOLD,
        "bounds_xyxy": {"left": LEFT, "right": RIGHT},
        "existing_16page_census_unique_side_crops": [
            prior["unique_left_border_crops"], prior["unique_right_border_crops"]
        ],
        "controls": controls,
        "decision": (
            "The static left/right floral art is a near-exact horizontal "
            "mirror after original JPEG compression. A visible reflection "
            "does not specify a historical source or decipherment."
        )
    }, indent=2))


if __name__ == "__main__":
    main()
