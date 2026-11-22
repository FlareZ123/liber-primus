#!/usr/bin/env python3
"""Reproduce fitted p24-image to p57 GIMP-Dissolve opacity transfer.

This is a target-trained reconstruction with a disjoint within-image holdout,
not a source-locked key or exact reconstruction of the original artwork.

Python3, NumPy, OpenCV. Run from repository root:
    python sims/lp2_stipple_p24_opacity_transfer_sft.py

Depends on original 41.jpg and 74.jpg and the native-GIMP SFT next to it.
Fitted by scipy.optimize.differential_evolution on training F1 only, seed3301,
maxiter110, popsize10, polish=True, with 11 continuous parameters. The
integer component count / split were not fitted or used as an objective.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

from lp2_stipple_native_gimp_sft import CROP, ROOT, SOURCE, gimp_field, native_grid

REFERENCE = ROOT / "resources" / "liber-primus" / "41.jpg"
REFERENCE_SHA = "62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80"
FITTED = np.array([
    1.6000479049955045, 1.5553730263224002,
    715.90089942562338, 219.77679029450974,
    0.9702914444413222, 1.0132047795846602,
    15.950948323808944, -3.6464456415513258,
    -0.027483414409424478, 1.2051984847765596,
    -20.063310879322014,
], dtype=np.float64)


def f1(pred: np.ndarray, reference: np.ndarray, selection: np.ndarray) -> dict:
    tp = int(np.count_nonzero(pred & reference & selection))
    fp = int(np.count_nonzero(pred & ~reference & selection))
    fn = int(np.count_nonzero(~pred & reference & selection))
    return {
        "true_positive": tp, "false_positive": fp, "false_negative": fn,
        "f1": 2 * tp / (2 * tp + fp + fn),
        "predicted_black": int(np.count_nonzero(pred & selection)),
        "source_black": int(np.count_nonzero(reference & selection)),
    }


def main() -> None:
    assert hashlib.sha256(REFERENCE.read_bytes()).hexdigest() == REFERENCE_SHA
    source = cv2.imread(str(REFERENCE), cv2.IMREAD_GRAYSCALE)
    target_jpeg = cv2.imread(str(SOURCE), cv2.IMREAD_GRAYSCALE)
    assert source is not None and source.shape == (3600, 2400)
    assert target_jpeg is not None and target_jpeg.shape == (3600, 2400)
    observed_cells, xnative, lattice = native_grid(target_jpeg)
    phase_y, pitch_y = lattice["phase_y"], lattice["pitch_y"]
    ycoords = phase_y + pitch_y * np.arange(900)
    y_native = ycoords[(ycoords >= CROP[1]) & (ycoords < CROP[3])]
    yidx, xidx = np.mgrid[28:321, 70:350]
    x = xnative[xidx].astype(np.float32)
    y = y_native[yidx].astype(np.float32)
    black = observed_cells[28:321, 70:350].astype(bool)
    threshold = gimp_field()[yidx - 28, xidx - 70]
    training = ((xidx // 16 + 3 * (yidx // 16)) % 4 != 0)

    sx, sy, tx, ty, k, gamma, shear, bend, stretch, vshear, vbend = FITTED
    a = (y - 2300) / 900
    b = (x - 1210) / 900
    mapx = ((x - tx - shear * a - bend * a * a)
            / (sx * (1 + stretch * a))).astype(np.float32)
    mapy = ((y - ty - vshear * b - vbend * b * b) / sy).astype(np.float32)
    art = cv2.remap(source, mapx, mapy, cv2.INTER_LINEAR,
                    borderMode=cv2.BORDER_CONSTANT, borderValue=255)
    art[(mapx < 10) | (mapx > 575) | (mapy < 1150) | (mapy > 2150)] = 255
    alpha = (np.maximum(0, 255 - art).astype(np.float32) / 255)**gamma * k
    predicted = threshold < 255 * np.minimum(1, alpha)

    count, _, stats, centers = cv2.connectedComponentsWithStats(
        predicted.astype(np.uint8), connectivity=8)
    areas = stats[1:, cv2.CC_STAT_AREA]
    keep = np.ones(len(areas), dtype=bool)
    keep[np.argsort(areas)[-2:]] = False
    left = int(np.count_nonzero(centers[1:, 0][keep] + 70 < 205))
    right = int(np.count_nonzero(centers[1:, 0][keep] + 70 >= 205))
    train = f1(predicted, black, training)
    heldout = f1(predicted, black, ~training)
    all_pixels = f1(predicted, black, np.ones_like(training, dtype=bool))
    assert (round(train["f1"], 4), round(heldout["f1"], 4)) == (0.8303, 0.8383)
    assert (count - 1, left, right) == (636, 271, 363)
    print(json.dumps({
        "status": "partial reference-image opacity transfer; count mismatch and no LP2 cipher",
        "source_image": "resources/liber-primus/41.jpg",
        "target_image": "resources/liber-primus/74.jpg",
        "fitted_parameters": FITTED.tolist(),
        "training": train, "heldout": heldout, "whole": all_pixels,
        "predicted_components": count - 1,
        "predicted_small_left_right": [left, right],
        "actual_components": 574,
        "actual_small_left_right": [241, 331],
        "limits": "Geometry and tone optimized on target training pixels, not source-only. No pixelwise fitting, component-count optimization or holdout tuning. Neither exact opacity nor residual cell mask was recovered.",
    }, indent=2))


if __name__ == "__main__":
    main()
