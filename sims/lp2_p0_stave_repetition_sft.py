#!/usr/bin/env python3
"""Check whether the two p0 marginal stave crops repeat on LP2 pages 0–2.

This tests only image repetition, not the Cistercian interpretation.
"""
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "resources" / "liber-primus"
PAGES = {
    "p0": IMAGE_DIR / "17.jpg",
    "p1": IMAGE_DIR / "18.jpg",
    "p2": IMAGE_DIR / "19.jpg",
}
BOXES = {
    "lower_left": (80, 1600, 500, 2800),
    "upper_right": (1900, 400, 2350, 1700),
}
THRESHOLD = 110
RESIZE = (200, 500)


def crop_mask(path: Path, box: tuple[int, int, int, int]) -> np.ndarray:
    gray = Image.open(path).convert("L").crop(box)
    binary = (np.asarray(gray) < THRESHOLD).astype(np.uint8) * 255
    normalized = Image.fromarray(binary).resize(RESIZE, Image.Resampling.NEAREST)
    return np.asarray(normalized) > 0


def iou(a: np.ndarray, b: np.ndarray) -> float:
    union = np.logical_or(a, b).sum()
    return float(np.logical_and(a, b).sum() / union) if union else 1.0


def main() -> None:
    masks = {
        side: {page: crop_mask(path, box) for page, path in PAGES.items()}
        for side, box in BOXES.items()
    }
    results = {}
    for side, page_masks in masks.items():
        results[side] = {
            "p0_p1": iou(page_masks["p0"], page_masks["p1"]),
            "p0_p2": iou(page_masks["p0"], page_masks["p2"]),
            "p1_p2": iou(page_masks["p1"], page_masks["p2"]),
        }
        assert results[side]["p0_p1"] > 0.95
        assert results[side]["p0_p2"] > 0.95
        assert results[side]["p1_p2"] == 1.0

    print({
        "threshold_grayscale_lt": THRESHOLD,
        "crop_boxes_xyxy": BOXES,
        "nearest_resize_wh": RESIZE,
        "iou": results,
        "interpretation": "The stave crops repeat; this does not identify their symbol system.",
    })


if __name__ == "__main__":
    main()
