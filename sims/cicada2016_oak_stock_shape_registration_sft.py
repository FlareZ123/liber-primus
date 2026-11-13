"""Compare the historically linked stock oak silhouette to the authenticated 2016 JPG.

Single-source visual test. Source URL is fixed by the historical community page.
Dimension/crop uncertainty is resolved only by isotropic scale and translation;
the resulting registration must remain source-shaped and explain spatial detail.
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


def main() -> None:
    raw = urlopen(Request(STOCK, headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read()
    stock = image_bytes_and_gray(raw, STOCK_SHA)
    target = image_bytes_and_gray(SIGNED.read_bytes(), SIGNED_SHA)
    assert stock.shape == (1600, 1222)
    assert target.shape == (569, 563)
    direct = find_matching_scale(stock, target)
    mirrored = find_matching_scale(cv2.flip(stock, 1), target)
    vertical = find_matching_scale(cv2.flip(stock, 0), target)
    print(json.dumps({
        "source": STOCK,
        "source_native": [1222, 1600],
        "target_native": [563, 569],
        "method": "no rotations; unrotated isotropic resizing, all image translations; Gaussian1; NCC",
        "stock_direct": direct,
        "stock_horizontal_flip": mirrored,
        "stock_vertical_flip": vertical,
        "conclusion": "Correlation geometry only; this cannot recover rune plaintext or prove 2016 dimensions authored",
    }, indent=2))


if __name__ == "__main__":
    main()
