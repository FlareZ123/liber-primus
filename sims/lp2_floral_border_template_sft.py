#!/usr/bin/env python3
"""SFT: the LP2 pp40-55 floral side-border artwork is one exact RGB template."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

ARCHIVE_IMAGES = tuple(range(57, 73))  # physical LP2 pp40-55 = archive images N+17
IMAGE_SIZE = (2400, 3600)
LEFT = (0, 0, 500, 3600)
RIGHT = (1900, 0, 2400, 3600)
BODY = (500, 0, 1900, 3600)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def inspect(source: Path) -> dict:
    source_hashes: dict[int, str] = {}
    crop_hashes: dict[str, dict[int, str]] = {"left": {}, "right": {}, "body": {}}
    crop_bytes: dict[str, dict[int, bytes]] = {"left": {}, "right": {}, "body": {}}

    for number in ARCHIVE_IMAGES:
        path = source / f"{number:02}.jpg"
        raw = path.read_bytes()
        image = Image.open(path).convert("RGB")
        assert image.size == IMAGE_SIZE, (path, image.size)
        source_hashes[number] = digest(raw)
        for name, bounds in (("left", LEFT), ("right", RIGHT), ("body", BODY)):
            pixels = image.crop(bounds).tobytes()
            crop_bytes[name][number] = pixels
            crop_hashes[name][number] = digest(pixels)

    # The 16 pages are distinct source images with distinct central/body crops.
    assert len(set(source_hashes.values())) == 16
    assert len(set(crop_hashes["body"].values())) == 16

    # Each complete side strip, including any dots in the margin, is byte-identical
    # after RGB decoding at identical coordinates on all 16 original page images.
    for side in ("left", "right"):
        reference = crop_bytes[side][57]
        assert all(crop_bytes[side][n] == reference for n in ARCHIVE_IMAGES)
        assert len(set(crop_hashes[side].values())) == 1

    return {
        "physical_pages": [40, 55],
        "archive_images": list(ARCHIVE_IMAGES),
        "image_dimensions": list(IMAGE_SIZE),
        "rgb_crop_bounds_xyxy": {"left": LEFT, "right": RIGHT, "body_control": BODY},
        "unique_source_jpegs": len(set(source_hashes.values())),
        "unique_body_control_crops": len(set(crop_hashes["body"].values())),
        "unique_left_border_crops": len(set(crop_hashes["left"].values())),
        "unique_right_border_crops": len(set(crop_hashes["right"].values())),
        "left_border_rgb_sha256": crop_hashes["left"][57],
        "right_border_rgb_sha256": crop_hashes["right"][57],
        "source_jpeg_sha256": {str(k): v for k, v in source_hashes.items()},
        "body_crop_sha256": {str(k): v for k, v in crop_hashes["body"].items()},
        "decision": "Both full-height side-border RGB crops are pixel-identical across all 16 pages; no per-page state is present in these border strokes.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "resources" / "liber-primus",
        help="Directory containing the original 00.jpg through 74.jpg archive images",
    )
    args = parser.parse_args()
    print(json.dumps(inspect(args.source_dir), indent=2))


if __name__ == "__main__":
    main()
