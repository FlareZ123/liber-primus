"""Source-visible cross-release moth/logo registration against a January-2014 article.

Image pixels are fetched at execution, checked, compared to an unchanged original
Liber Primus JPEG, then summarized without copying external copyrighted artwork.
"""
from __future__ import annotations

import hashlib
import json
import os
from io import BytesIO
from pathlib import Path
import tempfile
from urllib.request import Request, urlopen
from uuid import uuid4

import cv2
import numpy as np
from filelock import FileLock

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "resources/liber-primus/72.jpg"
ARTICLE = "https://www.cicadamania.com/cicadas/cicada-3301-logo/"
IMAGE = "https://www.cicadamania.com/cicadas/wp-content/uploads/2014/01/Cicada_3301_logo1.jpg"
CONTROL = "https://www.cicadamania.com/cicadas/wp-content/uploads/2014/01/cicadawings.jpg"
OUT = ROOT / "im-results" / "lp2-moth-jan2014-logo-registration.json"
ROI = (650, 2600, 1850, 3300)
ORIGINAL_SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"


def load_image(url: str) -> tuple[np.ndarray, str]:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 (Research reproduction; image identity audit)"})
    with urlopen(req, timeout=60) as response:
        data = response.read()
    image = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image is not None and min(image.shape) > 150, "Source image could not be decoded"
    return image, hashlib.sha256(data).hexdigest()


def get_original() -> tuple[np.ndarray, str]:
    data = ORIGINAL.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    assert digest == ORIGINAL_SHA256, "Original p55 image changed"
    image = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image.shape == (3600, 2400)
    x0, y0, x1, y1 = ROI
    return image[y0:y1, x0:x1].copy(), digest


def align(source: np.ndarray, target: np.ndarray) -> dict:
    detector = cv2.SIFT_create(nfeatures=4000, contrastThreshold=0.006)
    kp0, des0 = detector.detectAndCompute(source, None)
    kp1, des1 = detector.detectAndCompute(target, None)
    assert des0 is not None and des1 is not None
    pairs = cv2.BFMatcher(cv2.NORM_L2).knnMatch(des0, des1, k=2)
    passed = [p for p in pairs if len(p) == 2 and p[0].distance < 0.75 * p[1].distance]
    good = [p[0] for p in passed]
    src = np.float32([kp0[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([kp1[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    if len(good) < 6:
        return {"keypoints_source": len(kp0), "keypoints_target": len(kp1),
                "matches_ratio75": len(good), "affine_inliers": 0, "fuzzy_f1": 0.0}
    transform, inlier = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC,
                                                     ransacReprojThreshold=6.0,
                                                     maxIters=2500, confidence=0.995)
    if transform is None:
        return {"keypoints_source": len(kp0), "keypoints_target": len(kp1),
                "matches_ratio75": len(good), "affine_inliers": 0, "fuzzy_f1": 0.0}
    src_ink = (source < 160).astype(np.uint8)
    target_ink = target < 160
    predicted = cv2.warpAffine(src_ink, transform, (target.shape[1], target.shape[0]),
                                flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT,
                                borderValue=0).astype(bool)
    src_dil = cv2.dilate(predicted.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    dest_dil = cv2.dilate(target_ink.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    precision = float((predicted & dest_dil).sum() / max(1, int(predicted.sum())))
    recall = float((target_ink & src_dil).sum() / max(1, int(target_ink.sum())))
    f1 = float(2 * precision * recall / max(1e-9, precision + recall))
    return {"keypoints_source": len(kp0), "keypoints_target": len(kp1),
            "matches_ratio75": len(good), "affine_inliers": int(inlier.sum()),
            "affine_source_to_original_crop": np.round(transform, 6).tolist(),
            "source_ink_pixels_warped": int(predicted.sum()),
            "target_ink_pixels": int(target_ink.sum()),
            "fuzzy_precision7": round(precision, 8),
            "fuzzy_recall7": round(recall, 8),
            "fuzzy_f1": round(f1, 8)}


def atomic_report(data: dict) -> None:
    with FileLock(str(OUT) + ".lock"):
        path = OUT.with_name(OUT.name + "." + uuid4().hex + ".tmp")
        try:
            path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf8")
            os.replace(path, OUT)
        finally:
            path.unlink(missing_ok=True)


def main() -> None:
    target, original_sha = get_original()
    page, page_sha = load_image(IMAGE)
    control, control_sha = load_image(CONTROL)
    result = {"classification": "dated external logo source registration; no ciphertext inverse",
              "article_url": ARTICLE,
              "source_date_printed": "2014-01-12",
              "logo_url": IMAGE,
              "wing_control_url": CONTROL,
              "source_sha256": page_sha, "control_sha256": control_sha,
              "original_path": str(ORIGINAL.relative_to(ROOT)),
              "original_sha256": original_sha,
              "crop_xyxy": list(ROI),
              "original_crop_size": list(target.shape[::-1]),
              "logo_image_size": list(page.shape[::-1]),
              "control_image_size": list(control.shape[::-1]),
              "logo_registration": align(page, target),
              "wrong_source_registration": align(control, target)}
    print(json.dumps(result, indent=2), flush=True)
    atomic_report(result)


if __name__ == "__main__":
    main()
