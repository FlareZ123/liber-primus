"""Source-locked visual test: is the signed 2016 Cicada oak the Fox Talbot
"Oak Tree in Winter" photograph?

The source candidate is fixed by the exact title in the archived 2016 image
inventory and the Fox Talbot archive. The 2016 carrier ROI is reused unchanged
from the earlier p55/2016 registration test. No rune text or candidate plaintext
enters the comparison.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

import cv2
import numpy as np

TALBOT_URL = "https://foxtalbot.dmu.ac.uk/resources/LrgeImg/oakTree.jpg"
TALBOT_SHA256 = "904b6b4000758211789e94747f8c8ddf68b1e6c3909a4236d306023dc52fcbf4"
TALBOT_SHAPE = (689, 600)
SIGNED = Path("resources/historical/cicada2016-4gq25.jpg")
P55 = Path("resources/liber-primus/72.jpg")
P8 = Path("resources/liber-primus/25.jpg")


def read_gray(path: Path) -> tuple[np.ndarray, str]:
    raw = path.read_bytes()
    image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise ValueError(f"Cannot decode {path}")
    return image, hashlib.sha256(raw).hexdigest()


def decode_remote() -> tuple[np.ndarray, str]:
    request = Request(TALBOT_URL, headers={"User-Agent": "Mozilla/5.0"})
    raw = urlopen(request, timeout=30).read()
    image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise ValueError("Cannot decode the Fox Talbot source image")
    sha = hashlib.sha256(raw).hexdigest()
    if sha != TALBOT_SHA256:
        raise AssertionError(f"Fox Talbot source bytes changed: {sha}")
    if image.shape != TALBOT_SHAPE:
        raise AssertionError(f"Fox Talbot source dimensions changed: {image.shape}")
    return image, sha


def prepared(image: np.ndarray, kind: str) -> np.ndarray:
    if kind == "dark":
        pixels = np.minimum(image, 80).astype(np.uint8)
        pixels = np.uint8(pixels.astype(np.float32) * 255.0 / 80.0)
    elif kind == "light":
        pixels = 255 - image
    else:
        raise ValueError(kind)
    return cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(pixels)


def compare(a: np.ndarray, b: np.ndarray) -> dict:
    sift = cv2.SIFT_create(nfeatures=3000, contrastThreshold=0.006, edgeThreshold=18)
    kp_a, ds_a = sift.detectAndCompute(a, None)
    kp_b, ds_b = sift.detectAndCompute(b, None)
    score = {
        "features_a": len(kp_a),
        "features_b": len(kp_b),
        "ratio_matches": 0,
        "ransac_inliers": 0,
        "inlier_ratio": 0.0,
        "coverage_a": 0.0,
        "coverage_b": 0.0,
        "median_reprojection_error": None,
    }
    if ds_a is None or ds_b is None or len(ds_b) < 2:
        return score
    matches = cv2.BFMatcher(cv2.NORM_L2).knnMatch(ds_a, ds_b, k=2)
    pairs = [m for m, n in matches if m.distance < 0.70 * n.distance]
    score["ratio_matches"] = len(pairs)
    if len(pairs) < 4:
        return score

    src = np.float32([kp_a[m.queryIdx].pt for m in pairs]).reshape(-1, 1, 2)
    dst = np.float32([kp_b[m.trainIdx].pt for m in pairs]).reshape(-1, 1, 2)
    transform, mask = cv2.findHomography(src, dst, cv2.RANSAC, 5.0)
    if transform is None or mask is None:
        return score

    keep = mask.ravel().astype(bool)
    count = int(keep.sum())
    score["ransac_inliers"] = count
    score["inlier_ratio"] = round(count / len(pairs), 5)
    if count:
        src_kept = src[keep]
        dst_kept = dst[keep]
        hull_a = cv2.contourArea(cv2.convexHull(src_kept))
        hull_b = cv2.contourArea(cv2.convexHull(dst_kept))
        score["coverage_a"] = round(float(hull_a / (a.shape[0] * a.shape[1])), 5)
        score["coverage_b"] = round(float(hull_b / (b.shape[0] * b.shape[1])), 5)
        projected = cv2.perspectiveTransform(src_kept, transform)
        errors = np.linalg.norm(projected - dst_kept, axis=2).ravel()
        score["median_reprojection_error"] = round(float(np.median(errors)), 4)
    return score


def warped(image: np.ndarray) -> np.ndarray:
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


def main() -> None:
    signed, signed_sha = read_gray(SIGNED)
    p55, p55_sha = read_gray(P55)
    p8, p8_sha = read_gray(P8)
    talbot, talbot_sha = decode_remote()

    if signed.shape != (569, 563):
        raise AssertionError(f"2016 carrier dimensions changed: {signed.shape}")
    if p55.shape != (3600, 2400) or p8.shape != (3600, 2400):
        raise AssertionError("LP2 source image dimensions unexpectedly changed")

    # This 2016 ROI is frozen in the earlier original-source p55/2016 test.
    signed_roi = signed[85:515, 80:485]
    # Fixed original-page controls; crops match the earlier p55/2016 test.
    p55_roi = p55[1370:2560, 540:1850]
    p8_roi = p8[650:2950, 0:530]

    signed_dark = prepared(signed_roi, "dark")
    signed_light = prepared(signed_roi, "light")
    talbot_dark = prepared(talbot, "dark")
    talbot_light = prepared(talbot, "light")
    p55_light = prepared(p55_roi, "light")
    p8_light = prepared(p8_roi, "light")

    results = {
        "source": {
            "url": TALBOT_URL,
            "sha256": talbot_sha,
            "dimensions": [int(talbot.shape[1]), int(talbot.shape[0])],
            "2016_carrier_sha256": signed_sha,
            "2016_carrier_dimensions": [int(signed.shape[1]), int(signed.shape[0])],
            "p55_sha256": p55_sha,
            "p8_sha256": p8_sha,
        },
        "positive_controls": {
            "signed2016_self_affine": compare(signed_dark, warped(signed_dark)),
            "talbot_self_affine": compare(talbot_dark, warped(talbot_dark)),
        },
        "negative_controls": {
            "p55_vs_talbot": compare(p55_light, talbot_dark),
            "p8_vs_talbot": compare(p8_light, talbot_dark),
        },
        "signed2016_vs_talbot": {},
    }

    for orientation, oriented in dihedral(talbot).items():
        for polarity, source_view, target_view in (
            ("dark_dark", talbot_dark if orientation == "r0" else prepared(oriented, "dark"), signed_dark),
            ("light_dark", prepared(oriented, "light"), signed_dark),
            ("dark_light", prepared(oriented, "dark"), signed_light),
            ("light_light", prepared(oriented, "light"), signed_light),
        ):
            results["signed2016_vs_talbot"][f"{orientation}_{polarity}"] = compare(
                target_view, source_view
            )

    print(json.dumps(results, indent=2))
    if results["positive_controls"]["signed2016_self_affine"]["ransac_inliers"] < 15:
        raise AssertionError("2016 positive image-registration control failed")
    if results["positive_controls"]["talbot_self_affine"]["ransac_inliers"] < 15:
        raise AssertionError("Talbot positive image-registration control failed")


if __name__ == "__main__":
    main()
