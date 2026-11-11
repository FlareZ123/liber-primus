"""Original-source emblem orientation test for LP2 physical pages 0–2.

Requirements: numpy, opencv-python, Pillow.
Default: python sims/lp2_p0_p2_emblem_orientation_sft.py
ZIP: python sims/lp2_p0_p2_emblem_orientation_sft.py --assets liber-primus-jpegs.zip
"""

from __future__ import annotations

import argparse
import io
import json
import zipfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROIS = {
    0: (0, 1400, 800, 3100),
    1: (0, 1400, 800, 3100),
    2: (1800, 500, 2399, 2050),
}


def read_scan(assets: Path, page: int) -> np.ndarray:
    name = f"{page + 17:02d}.jpg"
    if assets.is_file():
        with zipfile.ZipFile(assets) as archive:
            content = archive.read(f"liber-primus-jpegs/{name}")
    else:
        content = (assets / name).read_bytes()
    with Image.open(io.BytesIO(content)) as im:
        return np.asarray(im.convert("L"))


def emblem_mask(assets: Path, page: int) -> np.ndarray:
    x0, y0, x1, y1 = ROIS[page]
    gray = read_scan(assets, page)[y0:y1, x0:x1]
    dark = (gray < 100).astype(np.uint8)
    _, labels, stats, _ = cv2.connectedComponentsWithStats(dark, 8)
    index = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    x, y, width, height = (int(v) for v in stats[index, :4])
    return np.uint8(labels[y:y + height, x:x + width] == index)


def register(mask_a: np.ndarray, mask_b: np.ndarray) -> dict[str, object]:
    height = max(mask_a.shape[0], mask_b.shape[0]) + 100
    width = max(mask_a.shape[1], mask_b.shape[1]) + 100
    canvas = np.zeros((height, width), dtype=np.uint8)
    canvas[50:50 + mask_a.shape[0], 50:50 + mask_a.shape[1]] = mask_a
    correlation = cv2.matchTemplate(canvas, mask_b, cv2.TM_CCORR)
    y, x = (int(v) for v in np.unravel_index(correlation.argmax(), correlation.shape))
    intersection = int(correlation[y, x])
    area_a = int(mask_a.sum())
    area_b = int(mask_b.sum())
    return {
        "shift_x": x - 50,
        "shift_y": y - 50,
        "intersection": intersection,
        "area_a": area_a,
        "area_b": area_b,
        "iou": intersection / (area_a + area_b - intersection),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets", type=Path, default=Path(__file__).resolve().parent.parent / "resources" / "liber-primus")
    args = parser.parse_args()
    masks = {page: emblem_mask(args.assets, page) for page in ROIS}
    pairs = {
        "p0_p1_original": register(masks[0], masks[1]),
        "p1_p2_original": register(masks[1], masks[2]),
        "p1_p2_rotated_180": register(masks[1], np.rot90(masks[2], 2)),
        "p0_p2_rotated_180": register(masks[0], np.rot90(masks[2], 2)),
    }
    for key, value in pairs.items():
        print(f"{key}: {json.dumps(value, sort_keys=True)}")
    assert pairs["p1_p2_rotated_180"]["iou"] > 0.98
    assert pairs["p1_p2_original"]["iou"] < 0.30
    assert pairs["p0_p1_original"]["iou"] > 0.96
    print("PASS: repeated source emblem reverses 180 degrees at p2; no cipher inverse implied.")


if __name__ == "__main__":
    main()
