"""Compare the first-party p32 tree with the independently dated 2005 Wikimedia tree.

Single-file bounded image-registration test. No rune search, OCR, secret key, or
output-guided adjustment. Windows 11 / Python 3.12; requires numpy and opencv-python.
"""
from __future__ import annotations

import hashlib
import json
import urllib.request
from urllib.error import HTTPError
from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parent.parent
SOURCE = "https://upload.wikimedia.org/wikipedia/commons/7/7e/DeadTree.jpg"
EXPECTED_SHA1 = "b0e0850ecfadac435eb45881252a146c9f5cc21b"
SIGNED_2016_SOURCE = "https://raw.githubusercontent.com/scream314/cicada3301/master/assets/2016/4gq25.jpg"
SIZE = 256
SHIFTPAD = 65


def read_original(page: int) -> np.ndarray:
    src = ROOT / "resources" / "liber-primus" / f"{page}.jpg"
    result = cv2.imread(str(src), cv2.IMREAD_GRAYSCALE)
    assert result is not None and result.shape == (3600, 2400), src
    return result


def to_canvas(image: np.ndarray) -> np.ndarray:
    return cv2.resize(image, (SIZE, SIZE), interpolation=cv2.INTER_AREA).astype(np.float32)


def normalize(image: np.ndarray) -> np.ndarray:
    return cv2.GaussianBlur(image.astype(np.float32), (0, 0), 7)


def fit(template: np.ndarray, target: np.ndarray) -> dict:
    padded = cv2.copyMakeBorder(
        normalize(target), SHIFTPAD, SHIFTPAD, SHIFTPAD, SHIFTPAD,
        cv2.BORDER_CONSTANT, value=0
    )
    best = {"score": -1.0}
    for orientation in ("upright", "mirrored"):
        current = template if orientation == "upright" else cv2.flip(template, 1)
        for scale in (0.76, 0.84, 0.92, 1.0, 1.08, 1.16):
            length = round(SIZE * scale)
            variant = cv2.resize(current, (length, length), interpolation=cv2.INTER_AREA)
            if length >= padded.shape[0]:
                continue
            scores = cv2.matchTemplate(
                padded, normalize(variant), cv2.TM_CCOEFF_NORMED
            )
            _, high, _, xy = cv2.minMaxLoc(scores)
            if float(high) > best["score"]:
                best = {
                    "score": round(float(high), 6),
                    "orientation": orientation,
                    "scale": scale,
                    "xy": list(xy)
                }
    return best



def sift_consistency(first: np.ndarray, second: np.ndarray) -> dict:
    """Original-geometry SIFT inliers, separate from broad blur-correlation fits."""
    sift = cv2.SIFT_create(nfeatures=1800, contrastThreshold=0.006,
                           edgeThreshold=20)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    a = clahe.apply(cv2.resize(first, (640, 640), interpolation=cv2.INTER_AREA))
    b = clahe.apply(cv2.resize(second, (640, 640), interpolation=cv2.INTER_AREA))
    key_a, des_a = sift.detectAndCompute(a, None)
    key_b, des_b = sift.detectAndCompute(b, None)
    result = {"keypoints": [len(key_a), len(key_b)], "ratioPairs": 0,
              "inliers": 0, "inlierFraction": 0.0}
    if des_a is None or des_b is None or len(des_b) < 2:
        return result
    pairs = cv2.BFMatcher(cv2.NORM_L2).knnMatch(des_a, des_b, k=2)
    good = [left for left, right in pairs if left.distance < right.distance * 0.73]
    result["ratioPairs"] = len(good)
    if len(good) < 4:
        return result
    points_a = np.float32([key_a[m.queryIdx].pt for m in good])
    points_b = np.float32([key_b[m.trainIdx].pt for m in good])
    homography, mask = cv2.findHomography(points_a, points_b,
        cv2.RANSAC, ransacReprojThreshold=4)
    if mask is not None and homography is not None:
        result["inliers"] = int(np.sum(mask))
        result["inlierFraction"] = round(result["inliers"] / len(good), 5)
    return result


def main() -> None:
    image49 = read_original(49)
    image72 = read_original(72)

    # Source-registered target crops, from the project p32-p55 correspondence report.
    p32 = image49[2070:3230, 650:1810]
    p55 = image72[1430:2510, 625:1735]

    target = to_canvas((255 - p32).astype(np.uint8))
    source_outline = to_canvas((255 - p55).astype(np.uint8))
    outline = cv2.dilate(source_outline, cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (9, 9)))
    native = fit(outline, target)

    request = urllib.request.Request(
        SOURCE, headers={"User-Agent": "LiberPrimusResearch/1.0 (historical image comparison)"}
    )
    # Wikimedia's original image host can rate-limit cloud CI clients with 429.
    # Treat such a retrieval failure as missing data, never as a negative match.
    wikipedia = {"source": SOURCE, "comparison": "source inaccessible"}
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = response.read()
    except HTTPError as error:
        if error.code != 429:
            raise
        wikipedia["status"] = "HTTP 429; exact-source comparison postponed"
    else:
        digest = hashlib.sha1(data).hexdigest()
        assert digest == EXPECTED_SHA1, ("Source Wikimedia photo changed", digest)
        photo = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
        assert photo is not None and photo.shape == (2606, 1894)
        field = photo[:round(photo.shape[0] * 0.77), :]
        large_blur = cv2.GaussianBlur(field, (0, 0), 45)
        variants = {
            "black100": to_canvas((field < 100).astype(np.uint8) * 255),
            "black150": to_canvas((field < 150).astype(np.uint8) * 255),
            "localcontrast30": to_canvas(((large_blur.astype(np.int16)
                - field.astype(np.int16)) > 30).astype(np.uint8) * 255)
        }
        wikipedia = {"sha1": digest,
                     "comparison": {name: fit(a, target) for name, a in variants.items()}}

    # Independent, first-party 2016 Cicada cover: the source authenticated its
    # OutGuess plaintext. Test the *visible* faint central tree artwork directly.
    request2016 = urllib.request.Request(
        SIGNED_2016_SOURCE, headers={"User-Agent": "LiberPrimusResearch/1.0"}
    )
    with urllib.request.urlopen(request2016, timeout=30) as response:
        signed_data = response.read()
    cover = cv2.imdecode(np.frombuffer(signed_data, dtype=np.uint8),
                         cv2.IMREAD_GRAYSCALE)
    assert cover is not None and cover.shape[0] >= 400 and cover.shape[1] >= 400
    height, width = cover.shape
    cover_tree = cover[round(height * 0.39):round(height * 0.79),
                       round(width * 0.19):round(width * 0.81)]
    ghost = cover_tree.astype(np.float32)
    background = cv2.GaussianBlur(cover_tree, (0, 0), 14).astype(np.float32)
    faint = {
        "band2to60": to_canvas(((ghost >= 2) & (ghost <= 60)).astype(np.uint8) * 255),
        "band5to90": to_canvas(((ghost >= 5) & (ghost <= 90)).astype(np.uint8) * 255),
        "localcontrast3": to_canvas(((ghost - background) > 3).astype(np.uint8) * 255)
    }
    cover_results = {name: fit(a, target) for name, a in faint.items()}
    feature_geometry = {
        "p55ToP32": sift_consistency((255 - p55).astype(np.uint8),
                                     (255 - p32).astype(np.uint8)),
        "coverToP32": sift_consistency(
            (faint["band2to60"] * 255 / max(1, np.max(faint["band2to60"]))).astype(np.uint8),
            (255 - p32).astype(np.uint8)),
        "coverToP55": sift_consistency(
            (faint["band2to60"] * 255 / max(1, np.max(faint["band2to60"]))).astype(np.uint8),
            (255 - p55).astype(np.uint8))
    }

    # Scan all 12 predeclared same-size positions across the signed 2016 image.
    # Some noncentral windows overlap the tree: retain their scores rather than
    # pretending that every neighboring window is an independent negative.
    ch, cw = cover_tree.shape
    control_crops = {}
    for y in (0, (height - ch) // 3, 2 * (height - ch) // 3, height - ch):
        for x in (0, (width - cw) // 2, width - cw):
            patch = cover[y:y + ch, x:x + cw]
            filtered = ((patch >= 2) & (patch <= 60)).astype(np.uint8) * 255
            control_crops[f"x{x}_y{y}"] = {
                "fractionActive": round(float(np.mean(filtered > 0)), 6),
                "fit": fit(to_canvas(filtered), target)
            }

    # Frozen 3301-seed morphology control: shuffle original 16x16 blocks,
    # preserving local JPEG radiometry but destroying global tree geometry.
    rng = np.random.default_rng(3301)
    central = faint["band2to60"].astype(np.float32)
    blocks = central.reshape(16, 16, 16, 16).transpose(0, 2, 1, 3).reshape(256, 16, 16)
    nulls = []
    for iteration in range(32):
        rearranged = blocks[rng.permutation(256)].reshape(16, 16, 16, 16).transpose(
            0, 2, 1, 3).reshape(SIZE, SIZE)
        nulls.append(fit(rearranged, target)["score"])
    mirror = fit(cv2.flip(outline, 1), target)
    print(json.dumps({
        "wikipedia2005": wikipedia,
        "signed2016Cover": {
            "source": SIGNED_2016_SOURCE,
            "sha256": hashlib.sha256(signed_data).hexdigest(),
            "dimensions": [width, height],
            "centralTreeToP32": cover_results,
            "featureGeometry": feature_geometry,
            "sourceCropPositions": control_crops,
            "blockShuffleNull": {
                "seeds": 32,
                "max": max(nulls),
                "mean": round(float(np.mean(nulls)), 6),
                "original": cover_results["band2to60"]["score"],
                "aboveOrEqualOriginal": sum(x >= cover_results["band2to60"]["score"] for x in nulls)
            },
            "centralTreeGrayQuantiles": np.percentile(cover_tree, [0, 25, 50, 75, 90, 99]).tolist()
        },
        "originalP32": "resources/liber-primus/49.jpg",
        "originalP55": "resources/liber-primus/72.jpg",
        "positiveP55ToP32": native,
        "mirroredP55ToP32": mirror,
        "interpretation": "Matching artwork requires a specific original-shape fit; no key or cipher is inferred"
    }, indent=2))


if __name__ == "__main__":
    main()
