"""Register the historically linked stock oak to the 2016 carrier and test p55 art.

The original NCC test is retained unchanged. A bounded SIFT/RANSAC comparison
asks whether the same stock silhouette is also a source for LP2 p55 tree art.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

import cv2
import numpy as np

STOCK = "https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg"
SIGNED = Path("resources/historical/cicada2016-4gq25.jpg")
STOCK_SHA = "6fc875c099081908587fed6f1b3ac96bceece97f276e9fdd5cd52ec5ea791a34"
SIGNED_SHA = "a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe"


def image_bytes_and_gray(data: bytes, expected_sha: str) -> np.ndarray:
    actual = hashlib.sha256(data).hexdigest()
    assert actual == expected_sha, (actual, expected_sha)
    gray = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert gray is not None
    return gray


def find_matching_scale(stock: np.ndarray, target: np.ndarray) -> dict:
    """Compute best unrotated, isotropically scaled silhouette NCC per fixed scale."""
    # The 2016 black field has ordinary JPEG noise and bright English text.
    # Remove text and very dark background; preserve faint grey tree branches.
    signal = target.astype(np.float32)
    signal[signal > 75] = 0
    signal = cv2.GaussianBlur(signal, (3, 3), 0.75)

    # The stock JPG has a white field and black tree; invert that polarity.
    inverted = 255 - stock
    # Match at source-informed physical sizes, no synthetic image rotation.
    # Stock is 1222x1600, target 563x569.
    transforms = []
    for scale in np.linspace(0.125, 0.35, 46):
        resized = cv2.resize(
            inverted, None, fx=float(scale), fy=float(scale), interpolation=cv2.INTER_AREA
        )
        h, w = resized.shape
        if h >= signal.shape[0] or w >= signal.shape[1]:
            continue
        template = cv2.GaussianBlur(resized.astype(np.float32), (3, 3), 0.75)
        if np.std(template) < 0.1:
            continue
        cc = cv2.matchTemplate(signal, template, cv2.TM_CCOEFF_NORMED)
        _, peak, _, pt = cv2.minMaxLoc(cc)
        transforms.append({
            "scale": round(float(scale), 5),
            "x": int(pt[0]), "y": int(pt[1]),
            "width": int(w), "height": int(h),
            "ncc": round(float(peak), 7),
        })
    return max(transforms, key=lambda x: x["ncc"])



P55 = Path("resources/liber-primus/72.jpg")
P8 = Path("resources/liber-primus/25.jpg")


def gray_file(path: Path) -> tuple[np.ndarray, str]:
    raw = path.read_bytes()
    gray = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    if gray is None:
        raise ValueError(f"Cannot decode {path}")
    return gray, hashlib.sha256(raw).hexdigest()


def feature_view(image: np.ndarray, kind: str) -> np.ndarray:
    if kind == "dark":
        pixels = np.minimum(image, 80).astype(np.uint8)
        pixels = np.uint8(pixels.astype(np.float32) * 255.0 / 80.0)
    elif kind == "light":
        pixels = 255 - image
    else:
        raise ValueError(kind)
    return cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(pixels)


def sift_registration(a: np.ndarray, b: np.ndarray) -> dict:
    sift = cv2.SIFT_create(nfeatures=3000, contrastThreshold=0.006, edgeThreshold=18)
    kp_a, ds_a = sift.detectAndCompute(a, None)
    kp_b, ds_b = sift.detectAndCompute(b, None)
    result = {"features_a": len(kp_a), "features_b": len(kp_b),
              "ratio_matches": 0, "ransac_inliers": 0, "inlier_ratio": 0.0,
              "coverage_a": 0.0, "coverage_b": 0.0}
    if ds_a is None or ds_b is None or len(ds_b) < 2:
        return result
    matches = cv2.BFMatcher(cv2.NORM_L2).knnMatch(ds_a, ds_b, k=2)
    pairs = [m for m, n in matches if m.distance < 0.70 * n.distance]
    result["ratio_matches"] = len(pairs)
    if len(pairs) < 4:
        return result
    src = np.float32([kp_a[m.queryIdx].pt for m in pairs]).reshape(-1, 1, 2)
    dst = np.float32([kp_b[m.trainIdx].pt for m in pairs]).reshape(-1, 1, 2)
    transform, mask = cv2.findHomography(src, dst, cv2.RANSAC, 5.0)
    if transform is None or mask is None:
        return result
    keep = mask.ravel().astype(bool)
    count = int(keep.sum())
    result["ransac_inliers"] = count
    result["inlier_ratio"] = round(count / len(pairs), 5)
    if count:
        result["coverage_a"] = round(float(cv2.contourArea(
            cv2.convexHull(src[keep])) / (a.shape[0] * a.shape[1])), 5)
        result["coverage_b"] = round(float(cv2.contourArea(
            cv2.convexHull(dst[keep])) / (b.shape[0] * b.shape[1])), 5)
    return result


def affine_warp(image: np.ndarray) -> np.ndarray:
    rows, cols = image.shape
    rotation = cv2.getRotationMatrix2D((cols / 2.0, rows / 2.0), 12, 0.83)
    return cv2.warpAffine(image, rotation, (cols, rows))


def dihedral(image: np.ndarray) -> dict[str, np.ndarray]:
    return {
        "r0": image,
        "r90": cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE),
        "r180": cv2.rotate(image, cv2.ROTATE_180),
        "r270": cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE),
        "flip_h": cv2.flip(image, 1),
        "flip_v": cv2.flip(image, 0),
        "flip_h_r90": cv2.rotate(cv2.flip(image, 1), cv2.ROTATE_90_CLOCKWISE),
        "flip_h_r270": cv2.rotate(cv2.flip(image, 1), cv2.ROTATE_90_COUNTERCLOCKWISE),
    }


def compare_stock_to_page_art(stock: np.ndarray, page_crop: np.ndarray) -> dict:
    rows = []
    for orientation, oriented in dihedral(stock).items():
        for polarity, stock_kind, page_kind in (
            ("dark_dark", "dark", "dark"),
            ("light_dark", "light", "dark"),
            ("dark_light", "dark", "light"),
            ("light_light", "light", "light"),
        ):
            rows.append({
                "orientation": orientation,
                "polarity": polarity,
                **sift_registration(feature_view(page_crop, page_kind),
                                    feature_view(oriented, stock_kind)),
            })
    rows.sort(key=lambda item: (item["ransac_inliers"], item["coverage_a"],
                                item["coverage_b"]), reverse=True)
    return {"variants": len(rows), "best": rows[:5],
            "max_ratio_matches": max(item["ratio_matches"] for item in rows),
            "max_ransac_inliers": max(item["ransac_inliers"] for item in rows)}


def main() -> None:
    raw = urlopen(Request(STOCK, headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read()
    stock = image_bytes_and_gray(raw, STOCK_SHA)
    target = image_bytes_and_gray(SIGNED.read_bytes(), SIGNED_SHA)
    p55, p55_sha = gray_file(P55)
    p8, p8_sha = gray_file(P8)
    assert stock.shape == (1600, 1222)
    assert target.shape == (569, 563)
    assert p55.shape == (3600, 2400) and p8.shape == (3600, 2400)
    direct = find_matching_scale(stock, target)
    mirrored = find_matching_scale(cv2.flip(stock, 1), target)
    vertical = find_matching_scale(cv2.flip(stock, 0), target)

    # Fixed source crops match the existing p55/2016 SIFT cross-image gate.
    p55_tree = p55[1370:2560, 540:1850]
    p8_branch = p8[650:2950, 0:530]
    stock_vs_p55 = compare_stock_to_page_art(stock, p55_tree)
    stock_vs_p8 = compare_stock_to_page_art(stock, p8_branch)
    p55_view = feature_view(p55_tree, "dark")
    stock_view = feature_view(stock, "dark")
    controls = {
        "p55_self_affine": sift_registration(p55_view, affine_warp(p55_view)),
        "stock_self_affine": sift_registration(stock_view, affine_warp(stock_view)),
    }
    print(json.dumps({
        "source": STOCK,
        "source_native": [1222, 1600],
        "source_sha256": STOCK_SHA,
        "target_native": [563, 569],
        "target_sha256": SIGNED_SHA,
        "stock_direct": direct,
        "stock_horizontal_flip": mirrored,
        "stock_vertical_flip": vertical,
        "p55_original_sha256": p55_sha,
        "p8_original_sha256": p8_sha,
        "p55_vs_stock_sift": stock_vs_p55,
        "p8_vs_stock_sift_negative": stock_vs_p8,
        "sift_positive_controls": controls,
        "conclusion": "ClipartBest-to-2016 NCC is shape evidence only; SIFT test checks whether p55 tree art shares that source",
    }, indent=2))
    if controls["p55_self_affine"]["ransac_inliers"] < 15:
        raise AssertionError("p55 feature-registration positive control failed")
    if controls["stock_self_affine"]["ransac_inliers"] < 15:
        raise AssertionError("stock feature-registration positive control failed")


if __name__ == "__main__":
    main()
