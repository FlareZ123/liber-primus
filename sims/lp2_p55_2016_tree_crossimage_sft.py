"""Visual original-source test: is the p55 faint tree the 2016 signed-image oak?"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np


def image(path: str) -> np.ndarray:
    file = Path(path)
    raw = file.read_bytes()
    data = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    if data is None:
        raise ValueError(f"Cannot decode {path}")
    print(f"{path}: {data.shape[1]}x{data.shape[0]}, SHA256 {hashlib.sha256(raw).hexdigest()}")
    return data


def prepared(img: np.ndarray, kind: str) -> np.ndarray:
    if kind == "light":
        pixels = 255 - img
    elif kind == "dark":
        pixels = np.minimum(img, 80).astype(np.uint8)
        pixels = np.uint8(pixels.astype(np.float32) * 255.0 / 80.0)
    else:
        raise ValueError(kind)
    return cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(pixels)


def compare(a: np.ndarray, b: np.ndarray) -> dict:
    sift = cv2.SIFT_create(nfeatures=3000, contrastThreshold=0.006, edgeThreshold=18)
    kp_a, ds_a = sift.detectAndCompute(a, None)
    kp_b, ds_b = sift.detectAndCompute(b, None)
    score = {"features_a": len(kp_a), "features_b": len(kp_b),
             "ratio_matches": 0, "ransac_inliers": 0}
    if ds_a is None or ds_b is None or len(ds_b) < 2:
        return score
    matches = cv2.BFMatcher(cv2.NORM_L2).knnMatch(ds_a, ds_b, k=2)
    pairs = [m for m, n in matches if m.distance < 0.70 * n.distance]
    score["ratio_matches"] = len(pairs)
    if len(pairs) >= 4:
        src = np.float32([kp_a[m.queryIdx].pt for m in pairs]).reshape(-1, 1, 2)
        dst = np.float32([kp_b[m.trainIdx].pt for m in pairs]).reshape(-1, 1, 2)
        transform, mask = cv2.findHomography(src, dst, cv2.RANSAC, 5.0)
        if transform is not None and mask is not None:
            score["ransac_inliers"] = int(mask.sum())
    return score


def warped(img: np.ndarray) -> np.ndarray:
    rows, cols = img.shape
    rotation = cv2.getRotationMatrix2D((cols / 2.0, rows / 2.0), 12, 0.83)
    return cv2.warpAffine(img, rotation, (cols, rows))


def main() -> None:
    p55 = image("resources/liber-primus/72.jpg")
    year2016 = image("resources/historical/cicada2016-4gq25.jpg")
    p8 = image("resources/liber-primus/25.jpg")
    if p55.shape != (3600, 2400) or p8.shape != (3600, 2400):
        raise AssertionError("Source image dimensions unexpectedly changed")
    if year2016.shape != (569, 563):
        raise AssertionError("Original 2016 dimension witness changed")
    # Original-page crop, fixed before results. Its margins avoid the black rune text.
    tree55 = prepared(p55[1370:2560, 540:1850], "light")
    # Oak art is low-contrast on black in the original signed 2016 picture.
    tree16 = prepared(year2016[85:515, 80:485], "dark")
    tree16raw = year2016[85:515, 80:485]
    branch8 = prepared(p8[650:2950, 0:530], "light")
    data = {
        "p55_self_affine_positive": compare(tree55, warped(tree55)),
        "p8_different_tree_negative": compare(tree55, branch8),
        "p55_vs_2016_dark_normalized": compare(tree55, tree16),
        "p55_vs_2016_raw": compare(tree55, tree16raw),
        "2016_self_affine_feature_control": compare(tree16, warped(tree16)),
        "2016_roi_min_median_max": [int(tree16raw.min()), float(np.median(tree16raw)), int(tree16raw.max())],
    }
    print(json.dumps(data, indent=2))
    if data["p55_self_affine_positive"]["ransac_inliers"] < 15:
        raise AssertionError("Image-registration positive control failed")


if __name__ == "__main__":
    main()
