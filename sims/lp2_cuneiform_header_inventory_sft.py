#!/usr/bin/env python3
"""Verify the repeated two-row header mark in the original LP2 JPEGs.

The canonical mapping is LP2 page p -> original scan (p + 17). The fixed
source-coordinate crop is intentionally not a fitted image-search template.
"""
from __future__ import annotations

import argparse
from hashlib import sha256
from pathlib import Path

from PIL import Image

HEADER_BOX = (1029, 157, 1391, 546)  # 362 x 389 pixels


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "resources" / "liber-primus",
        help="directory containing original JPEGs 17.jpg through 74.jpg",
    )
    args = parser.parse_args()

    hashes: dict[int, str] = {}
    for page in range(56):
        scan = page + 17
        with Image.open(args.source_dir / f"{scan}.jpg") as image:
            crop = image.convert("RGB").crop(HEADER_BOX)
        if crop.size != (362, 389):
            raise AssertionError(f"unexpected crop size on LP2 p{page}: {crop.size}")
        hashes[page] = sha256(crop.tobytes()).hexdigest()

    target_digest = hashes[34]
    matches = [page for page, digest in hashes.items() if digest == target_digest]
    expected = list(range(34, 40))
    if matches != expected:
        raise AssertionError(f"expected exact copies on {expected}, got {matches}")

    print(f"header_box={HEADER_BOX}")
    print("header_crop_size=362x389")
    print(f"header_raw_rgb_sha256={target_digest}")
    print(f"exact_same_coordinate_pages={matches}")
    print("page_to_scan=" + ",".join(f"{page}:{page + 17}.jpg" for page in matches))


if __name__ == "__main__":
    main()
