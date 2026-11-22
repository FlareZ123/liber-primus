"""Quantify the shared tree illustration in original LP2 page images.

The original, deliberately blurred LP2 p32 tree (49.jpg) is compared to the
solid silhouette of the pale p55 outline (72.jpg). No cipher is inferred.
Requires numpy, scipy and opencv-python-headless.
Run: python sims/tree_outline_blur_registration.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from scipy.optimize import differential_evolution

ROOT = Path(__file__).resolve().parents[1]
SCALE = 0.30
SMOOTH = 6.0


def source(name: str) -> tuple[np.ndarray, str]:
    data = (ROOT / "resources" / "liber-primus" / name).read_bytes()
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image is not None and image.shape == (3600, 2400)
    return image, hashlib.sha256(data).hexdigest()


def filled_tree(image: np.ndarray) -> tuple[np.ndarray, int, int]:
    crop = image[1410:2480, 650:1760]
    n, labels, stats, _ = cv2.connectedComponentsWithStats(
        np.uint8(crop < 240), 8
    )
    assert n >= 2
    component = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    mask = np.uint8(labels == component)
    contours, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    assert len(contours) == 1
    filled = np.zeros_like(mask)
    cv2.drawContours(filled, contours, -1, 255, thickness=cv2.FILLED)
    return filled, int(mask.sum()), int((filled > 0).sum())


def correlation(first: np.ndarray, second: np.ndarray) -> float:
    a = first[30:-25, 20:-20].ravel()
    b = second[30:-25, 20:-20].ravel()
    return float(np.corrcoef(a, b)[0, 1])


def fit(target: np.ndarray, reference: np.ndarray, mirror: bool) -> tuple[float, np.ndarray]:
    height, width = target.shape
    direction = -1 if mirror else 1

    def transform(parameters: np.ndarray) -> np.ndarray:
        sx, sy, dx, dy = parameters
        matrix = np.array([
            [direction * sx, 0, width / 2 * (1 - direction * sx) + dx],
            [0, sy, height / 2 * (1 - sy) + dy]
        ], dtype=np.float32)
        return cv2.warpAffine(
            reference, matrix, (width, height),
            flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT,
            borderValue=0
        )

    result = differential_evolution(
        lambda v: -correlation(target, transform(v)),
        [(0.70, 1.20), (0.70, 1.20), (-30, 30), (-30, 30)],
        seed=13, maxiter=70, popsize=10, polish=True, workers=1
    )
    return float(-result.fun), result.x


def run() -> dict:
    page32, digest32 = source("49.jpg")
    page55, digest55 = source("72.jpg")
    p32_crop = page32[2060:3130, 650:1760]
    p55_mask, stroke_area, filled_area = filled_tree(page55)
    assert p32_crop.shape == p55_mask.shape == (1070, 1110)

    blurred = np.maximum(0, 252 - p32_crop.astype(float))
    a = cv2.resize(
        blurred, None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_AREA
    )
    b = cv2.resize(
        p55_mask.astype(float), None, fx=SCALE, fy=SCALE,
        interpolation=cv2.INTER_AREA
    )
    a = cv2.GaussianBlur(a, (0, 0), SMOOTH)
    b = cv2.GaussianBlur(b, (0, 0), SMOOTH)
    baseline = correlation(a, b)
    matched, parameters = fit(a, b, False)
    reflected, _ = fit(a, b, True)

    sx, sy, dx, dy = [float(v) for v in parameters]
    height, width = p55_mask.shape
    affine = np.array([
        [sx, 0, width / 2 * (1 - sx) + dx / SCALE],
        [0, sy, height / 2 * (1 - sy) + dy / SCALE]
    ], dtype=np.float32)
    registered = cv2.warpAffine(
        p55_mask, affine, (width, height), flags=cv2.INTER_LINEAR
    )
    ink32 = p32_crop < 220
    ink55 = registered > 127
    intersection = np.count_nonzero(ink32 & ink55)
    union = np.count_nonzero(ink32 | ink55)

    return {
        "original_scans": ["49.jpg (LP2 p32)", "72.jpg (LP2 p55)"],
        "sha256": {"49.jpg": digest32, "72.jpg": digest55},
        "source_crops": {
            "x": [650, 1760],
            "p32_y": [2060, 3130],
            "p55_y": [1410, 2480]
        },
        "p55_outline_threshold": 240,
        "p55_outline_pixels": stroke_area,
        "p55_filled_pixels": filled_area,
        "blur_sigma_fullres": SMOOTH / SCALE,
        "unaligned_pearson": baseline,
        "aligned_pearson": matched,
        "mirror_control_pearson": reflected,
        "aligned_scales": [sx, sy],
        "aligned_shifts_original_pixels": [dx / SCALE, dy / SCALE],
        "binary_intersection_over_union_threshold220": intersection / union,
        "claim": "Source-graphic correspondence only; no decoded LP2 content."
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
