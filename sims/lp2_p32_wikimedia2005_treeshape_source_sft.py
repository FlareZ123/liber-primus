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
    mirror = fit(cv2.flip(outline, 1), target)
    print(json.dumps({
        "wikipedia2005": wikipedia,
        "signed2016Cover": {
            "source": SIGNED_2016_SOURCE,
            "sha256": hashlib.sha256(signed_data).hexdigest(),
            "dimensions": [width, height],
            "centralTreeToP32": cover_results,
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
