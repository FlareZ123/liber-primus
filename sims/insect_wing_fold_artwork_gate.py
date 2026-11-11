#!/usr/bin/env python3
"""Reproduce the native-scale LP2 insect-art fold-axis gate.

Original inputs:
  44.jpg (physical p27), 70.jpg (p53), 72.jpg (p55), 74.jpg (solved p57).
Requires Pillow, NumPy and OpenCV.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

SCANS = {27: "44.jpg", 53: "70.jpg", 55: "72.jpg", 57: "74.jpg"}


def load(directory: Path, page: int) -> np.ndarray:
    return np.asarray(Image.open(directory / SCANS[page]).convert("L"))


def pca_angle(mask: np.ndarray) -> float:
    ys, xs = np.where(mask)
    points = np.column_stack((xs, ys)).astype(np.float64)
    _, eigenvectors, _ = cv2.PCACompute2(points, mean=None)
    return float(np.degrees(np.arctan2(eigenvectors[0, 1], eigenvectors[0, 0])))


def mirror_mismatch(mask: np.ndarray, axis: str) -> float:
    height, width = mask.shape
    if axis == "horizontal":
        left = mask[:height // 2, :]
        right = mask[height - left.shape[0]:, :][::-1, :]
    else:
        left = mask[:, :width // 2]
        right = mask[:, width - left.shape[1]:][:, ::-1]
    return float(np.mean(left ^ right))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image-dir", type=Path, required=True)
    args = parser.parse_args()
    p27, p53, p55, p57 = (load(args.image_dir, page) for page in (27, 53, 55, 57))

    # Native-scale p53 insect crop searched in p55.
    template = p53[2700:3300, 600:1800]
    search = p55[2600:3500, 500:1900]
    matches = cv2.matchTemplate(search, template, cv2.TM_CCOEFF_NORMED)
    _, ncc, _, location = cv2.minMaxLoc(matches)
    x55, y55 = 500 + location[0], 2600 + location[1]
    dx, dy = x55 - 600, y55 - 2700
    aligned = p55[y55:y55 + template.shape[0], x55:x55 + template.shape[1]]
    mask_a, mask_b = template < 100, aligned < 100
    intersection = int(np.count_nonzero(mask_a & mask_b))
    union = int(np.count_nonzero(mask_a | mask_b))
    black_iou = intersection / union
    black_dice = 2 * intersection / (int(mask_a.sum()) + int(mask_b.sum()))
    gray_mae = float(np.abs(template.astype(np.int16) - aligned.astype(np.int16)).mean())

    # Reused side ornaments at unchanged page coordinates.
    vines = {}
    for name, box in {
        "left": (0, 600, 500, 3000),
        "right": (1900, 600, 2400, 3000),
    }.items():
        x0, y0, x1, y1 = box
        a, b = p53[y0:y1, x0:x1], p55[y0:y1, x0:x1]
        vines[name] = {
            "exact_pixel_identity": bool(np.array_equal(a, b)),
            "mean_absolute_difference": float(np.abs(a.astype(np.int16) - b.astype(np.int16)).mean()),
        }

    # p27 isolated wing.
    wing = p27[516:856, 643:1787] < 100
    wing_metrics = {
        "bbox_xyxy_exclusive": [643, 516, 1787, 856],
        "major_axis_degrees_from_horizontal": pca_angle(wing),
        "horizontal_axis_mirror_mismatch_threshold_100": mirror_mismatch(wing, "horizontal"),
        "vertical_axis_mirror_mismatch_threshold_100": mirror_mismatch(wing, "vertical"),
    }

    # p53 body axis by minimum left/right binary reflection mismatch.
    best_axis = None
    for x0 in range(1100, 1301):
        left = p53[2700:3250, x0 - 450:x0] < 100
        right = p53[2700:3250, x0 + 1:x0 + 451][:, ::-1] < 100
        score = float(np.mean(left ^ right))
        if best_axis is None or score < best_axis["mismatch"]:
            best_axis = {"x": x0, "mismatch": score}
    p55_axis_x = best_axis["x"] + dx
    p53_body_angle = pca_angle(p53[2700:3200, 1100:1300] < 100)
    p57_body_angle = pca_angle(p57[1900:2850, 1120:1280] < 100)

    # Fixed p55 fourth text-line rectangle.
    line = p55[1238:1352, 550:1850] < 120
    ys, xs = np.where(line)
    line_x0, line_x1 = 550 + int(xs.min()), 550 + int(xs.max())

    print(json.dumps({
        "source_scans": SCANS,
        "p53_to_p55_insect_registration": {
            "template_p53_xyxy": [600, 2700, 1800, 3300],
            "best_p55_top_left": [x55, y55],
            "translation_xy": [dx, dy],
            "normalized_cross_correlation": float(ncc),
            "black_foreground_iou_threshold_100": black_iou,
            "black_foreground_dice_threshold_100": black_dice,
            "grayscale_mean_absolute_difference_0_255": gray_mae,
        },
        "p53_p55_border_vines": vines,
        "p27_isolated_wing": wing_metrics,
        "p53_moth_body_axis": best_axis,
        "p53_moth_body_pca_degrees_from_horizontal": p53_body_angle,
        "p55_moth_body_axis_x": p55_axis_x,
        "p57_solved_stippled_insect_body_pca_degrees_from_horizontal": p57_body_angle,
        "p27_to_p53_body_axis_angle_difference_degrees": abs(p53_body_angle - wing_metrics["major_axis_degrees_from_horizontal"]),
        "p55_last_text_line": {
            "y_range_inclusive": [1238, 1351],
            "x_range_inclusive": [line_x0, line_x1],
            "moth_axis_x": p55_axis_x,
            "entire_line_left_of_axis": line_x1 < p55_axis_x,
        },
    }, indent=2))


if __name__ == "__main__":
    main()
