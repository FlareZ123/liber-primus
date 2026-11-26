#!/usr/bin/env python3
"""Source-image D/M adjudication for LP2 global rune position 9877."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "58.jpg"
BOXES = {
    "M_adjacent_local5": (855, 673, 908, 787),
    "D_target_gpos9877": (914, 673, 967, 787),
    "D_control_local10": (1126, 673, 1179, 787),
    "D_control_local12": (1236, 673, 1289, 787),
}
THRESHOLD = 100


def mask_for(image: Image.Image, box: tuple[int, int, int, int]) -> np.ndarray:
    crop = np.asarray(image.crop(box).convert("L"))
    return crop < THRESHOLD


def iou(a: np.ndarray, b: np.ndarray) -> float:
    union = np.logical_or(a, b).sum()
    return float(np.logical_and(a, b).sum() / union) if union else 1.0


def main() -> None:
    raw = IMAGE.read_bytes()
    image = Image.open(IMAGE)
    masks = {name: mask_for(image, box) for name, box in BOXES.items()}

    target = masks["D_target_gpos9877"]
    d1 = masks["D_control_local10"]
    d2 = masks["D_control_local12"]
    m = masks["M_adjacent_local5"]

    results = {
        "target_vs_D_control_local10_iou": iou(target, d1),
        "target_vs_D_control_local12_iou": iou(target, d2),
        "D_controls_iou": iou(d1, d2),
        "target_vs_adjacent_M_iou": iou(target, m),
        "threshold": THRESHOLD,
        "boxes_xyxy_right_bottom_exclusive": BOXES,
        "image_size_bytes": len(raw),
        "image_sha256": hashlib.sha256(raw).hexdigest(),
    }
    assert results["D_controls_iou"] == 1.0
    assert results["target_vs_D_control_local10_iou"] > results["target_vs_adjacent_M_iou"]
    assert results["target_vs_D_control_local12_iou"] > results["target_vs_adjacent_M_iou"]
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
