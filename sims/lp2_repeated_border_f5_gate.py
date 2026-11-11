"""Exact repeated-background pixel audit for original LP2 p40–55.

Reads the repository's original JPEGs 57–72 (corresponding to physical LP2
p40–55), or the local puzzle ZIP when the standalone dataset is mounted.
No steganography key search. No files are written.
"""
from __future__ import annotations

from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZipFile

import numpy as np
from PIL import Image
from scipy.fft import dctn


ROOT = Path(__file__).resolve().parents[1]
JPEG_DIR = ROOT / "resources" / "liber-primus"
ZIP_PATH = ROOT / "liber-primus-jpegs.zip"
PAGES = tuple(range(57, 73))


def read_source(number: int) -> bytes:
    path = JPEG_DIR / f"{number:02d}.jpg"
    if path.is_file():
        return path.read_bytes()
    with ZipFile(ZIP_PATH) as archive:
        return archive.read(f"liber-primus-jpegs/{number:02d}.jpg")


def rgb_and_y(data: bytes) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    with Image.open(BytesIO(data)) as img:
        rgb = np.asarray(img.convert("RGB"))
        y = np.asarray(img.convert("YCbCr"))[:, :, 0]
        q = np.asarray(img.quantization[0], dtype=np.float32).reshape(8, 8)
    return rgb, y, q


def main() -> None:
    first = read_source(PAGES[0])
    baseline, y, q = rgb_and_y(first)
    height, width, channels = baseline.shape
    assert (width, height, channels) == (2400, 3600, 3)

    identical = np.ones((height, width), dtype=np.bool_)
    source_hashes = {f"{PAGES[0]:02d}.jpg": sha256(first).hexdigest()}
    for page in PAGES[1:]:
        raw = read_source(page)
        source_hashes[f"{page:02d}.jpg"] = sha256(raw).hexdigest()
        image, _, _ = rgb_and_y(raw)
        identical &= np.all(image == baseline, axis=2)

    yy, xx = np.where(~identical)
    assert len(xx) > 0
    left, top, right, bottom = (
        int(xx.min()), int(yy.min()), int(xx.max()), int(yy.max())
    )

    # This is the union of all source changes, computed before inspecting
    # DCT estimates; entire blocks strictly outside are exactly invariant.
    block_rows, block_cols = height // 8, width // 8
    xs = np.arange(block_cols, dtype=np.int32)[None, :] * 8
    ys = np.arange(block_rows, dtype=np.int32)[:, None] * 8
    outside = (xs + 7 < left) | (xs > right) | (ys + 7 < top) | (ys > bottom)
    assert np.all(
        identical.reshape(block_rows, 8, block_cols, 8)
        .transpose(0, 2, 1, 3)[outside]
    )

    # A decoded-pixel DCT is an approximation to the stored JPEG
    # coefficients. It estimates available signal-bearing AC blocks, but
    # never purports to recover the original coefficient stream.
    yblocks = y.reshape(block_rows, 8, block_cols, 8).transpose(0, 2, 1, 3)
    coefficients = dctn(
        yblocks.astype(np.float32) - 128,
        type=2,
        norm="ortho",
        axes=(-2, -1),
    )
    quantized_estimate = np.rint(coefficients / q).astype(np.int16)
    quantized_estimate[:, :, 0, 0] = 0
    nonzero_ac_per_block = (quantized_estimate != 0).sum(axis=(-2, -1))

    report = {
        "source_images": "archive JPEGs 57–72 = physical LP2 p40–55",
        "page_count": len(PAGES),
        "dimensions_rgb": [width, height, channels],
        "changing_pixel_bbox_xyxy_inclusive": [left, top, right, bottom],
        "all_16_rgb_identical_pixel_count": int(identical.sum()),
        "total_pixel_count": int(identical.size),
        "whole_blocks_strictly_outside_bbox": int(outside.sum()),
        "pixels_in_those_blocks": int(outside.sum()) * 64,
        "outside_blocks_with_estimated_nonzero_luma_ac":
            int(((nonzero_ac_per_block > 0) & outside).sum()),
        "estimated_nonzero_luma_ac_outside":
            int(nonzero_ac_per_block[outside].sum()),
        "estimated_nonzero_luma_ac_entire_first_image":
            int(nonzero_ac_per_block.sum()),
        "jpeg_hashes_sha256": source_hashes,
    }

    assert report["changing_pixel_bbox_xyxy_inclusive"] == [591, 624, 1831, 3183]
    assert report["whole_blocks_strictly_outside_bbox"] == 85080
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
