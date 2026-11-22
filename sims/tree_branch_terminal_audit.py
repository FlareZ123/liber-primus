"""Audit whether the LP2 tree silhouette supplies a unique branch endpoint.

Requires NumPy, OpenCV, and scikit-image. This is a source-geometry audit only.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from skimage.morphology import skeletonize

ROOT = Path(__file__).resolve().parents[1]
THRESHOLDS = (0.10, 0.20, 0.30, 0.40, 0.50, 0.60)


def audit(image_path: str | Path) -> dict:
    image = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400)
    crop = image[1410:2480, 650:1760]
    count, labels, stats, _ = cv2.connectedComponentsWithStats(
        np.uint8(crop < 240), 8
    )
    assert count >= 2
    component = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    outline = np.uint8(labels == component)
    contours, _ = cv2.findContours(
        outline, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    assert len(contours) == 1
    filled = np.zeros_like(outline)
    cv2.drawContours(filled, contours, -1, 255, thickness=cv2.FILLED)

    reduced = cv2.resize(
        filled.astype(np.float32), None, fx=0.30, fy=0.30,
        interpolation=cv2.INTER_AREA
    )
    blurred = cv2.GaussianBlur(reduced, (0, 0), 6.0)

    rows = []
    for threshold in THRESHOLDS:
        skeleton = skeletonize(blurred > threshold * 255.0)
        padded = np.pad(skeleton.astype(np.uint8), 1)
        degree = np.zeros_like(skeleton, dtype=np.uint8)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dx == 0 and dy == 0:
                    continue
                degree += padded[
                    1 + dy:1 + dy + skeleton.shape[0],
                    1 + dx:1 + dx + skeleton.shape[1]
                ]
        endpoints = np.argwhere(skeleton & (degree == 1))
        rows.append({
            "threshold_fraction": threshold,
            "terminal_tips": int(len(endpoints)),
        })

    representative = rows[2]
    assert [row["terminal_tips"] for row in rows] == [11, 14, 13, 12, 11, 12]
    return {
        "source": "72.jpg (physical LP2 p55 sharpened tree silhouette)",
        "source_crop": {"x": [650, 1760], "y": [1410, 2480]},
        "outline_threshold": 240,
        "resize_scale": 0.30,
        "gaussian_sigma_reduced_pixels": 6.0,
        "terminal_tip_counts": rows,
        "representative_terminal_tips": representative["terminal_tips"],
        "decision": (
            "The tree topology has many terminal branches. Even if the root is "
            "granted as the start, the art does not select a unique endpoint or route."
        ),
    }


if __name__ == "__main__":
    print(json.dumps(audit(ROOT / "resources" / "liber-primus" / "72.jpg"), indent=2))
