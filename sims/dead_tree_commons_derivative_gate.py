#!/usr/bin/env python3
"""Compare exact Wikimedia Commons DeadTree derivatives with LP2 p32/p55.

This bounded source-art test uses fixed transforms from earlier tree studies.
It does not fit new crops, scales, or translations to the derivative variants.
Requires Python 3, NumPy, and OpenCV.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import urllib.request
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]

ASSETS = {
    "original": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/7/7e/DeadTree.jpg",
        "sha256": "608288991f92b8ab901a9fbb39937f93ebdfeb5fd84edeecfa637d5262ff7b29",
        "size": [1894, 2606],
    },
    "salt_pepper": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/3/32/Dead_tree_salt_and_pepper.png",
        "size": [320, 440],
    },
    "gaussian_3x3": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Dead_tree_salt_and_pepper_gauss_3x3.png",
        "size": [318, 438],
    },
    "median_3x3": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/d/db/Dead_tree_salt_and_pepper_median_3x3.png",
        "size": [318, 438],
    },
}

PAGE_HASHES = {
    "49.jpg": "c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72",
    "72.jpg": "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
}

# Frozen source-to-p55 fit from the earlier Commons photograph comparison.
P55 = {
    "source_crop": [100, 500, 1750, 1950],
    "target_crop": [550, 1300, 1850, 2550],
    "scale": 0.55, "x": 230, "y": 94, "width": 908, "height": 798,
    "sigma": 7.0, "source_response": [170.0, 130.0],
    "target_response": [250.0, 45.0],
}

# Secondary chained prediction: source -> p55, then the existing p55 -> p32
# same-orientation fit. Restrict y>=602 so the entire crop maps inside the
# p55 source crop [600,1450,1800,2500] used by that second alignment.
P32 = {
    "source_crop": [100, 602, 1750, 1950],
    "target_crop": [550, 2000, 1850, 3500],
    "scale": 0.495, "x": 285, "y": 186, "width": 817, "height": 667,
    "sigma": 15.0, "source_response": [170.0, 130.0],
    "target_response": [230.0, 160.0],
}

def digest(data: bytes, algorithm: str = "sha256") -> str:
    h = hashlib.new(algorithm)
    h.update(data)
    return h.hexdigest()

def fetch_asset(spec: dict) -> bytes:
    request = urllib.request.Request(
        spec["url"],
        headers={"User-Agent": "LiberPrimusResearch/1.0 (public reproducibility test)"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read()
    if "sha256" in spec:
        assert digest(data) == spec["sha256"], f"SHA-256 mismatch: {spec['url']}"
    return data

def decode(data: bytes, flags: int) -> np.ndarray:
    image = cv2.imdecode(np.frombuffer(data, np.uint8), flags)
    assert image is not None
    return image

def dark_response(image: np.ndarray, level: float, span: float) -> np.ndarray:
    return np.clip((level - image.astype(np.float32)) / span, 0.0, 1.0)

def pearson(first: np.ndarray, second: np.ndarray) -> float:
    x = first.ravel().astype(np.float64)
    y = second.ravel().astype(np.float64)
    x -= x.mean()
    y -= y.mean()
    denominator = np.sqrt(np.dot(x, x) * np.dot(y, y))
    return float(np.dot(x, y) / denominator) if denominator else 0.0

def derivative_crop(image: np.ndarray, original_crop: list[int], valid_filter: bool) -> np.ndarray:
    # The noise image is 320x440. The two 3x3 derivative files are 318x438;
    # valid-filter outputs map pixel (i,j) to noise-image pixel (i+1,j+1).
    x1, y1, x2, y2 = original_crop
    sx, sy = 320.0 / 1894.0, 440.0 / 2606.0
    shift = 1 if valid_filter else 0
    x1d, x2d = round(x1 * sx) - shift, round(x2 * sx) - shift
    y1d, y2d = round(y1 * sy) - shift, round(y2 * sy) - shift
    assert 0 <= x1d < x2d <= image.shape[1]
    assert 0 <= y1d < y2d <= image.shape[0]
    return image[y1d:y2d, x1d:x2d]

def score_fixed(
    source_gray: np.ndarray,
    target_page: np.ndarray,
    config: dict,
    variant: str,
    reflected: bool,
) -> dict:
    x1, y1, x2, y2 = config["source_crop"]
    if variant == "original":
        source_crop = source_gray[y1:y2, x1:x2]
    else:
        source_crop = derivative_crop(
            source_gray, config["source_crop"],
            valid_filter=variant in ("gaussian_3x3", "median_3x3"),
        )
    source_level, source_span = config["source_response"]
    template = dark_response(source_crop, source_level, source_span)
    if reflected:
        template = cv2.flip(template, 1)
    template = cv2.resize(
        template, (config["width"], config["height"]),
        interpolation=cv2.INTER_LINEAR,
    )
    template = cv2.GaussianBlur(template, (0, 0), config["sigma"])

    tx1, ty1, tx2, ty2 = config["target_crop"]
    target_crop = target_page[ty1:ty2, tx1:tx2]
    target_level, target_span = config["target_response"]
    target = cv2.GaussianBlur(
        dark_response(target_crop, target_level, target_span),
        (0, 0), config["sigma"],
    )
    x, y, w, h = config["x"], config["y"], config["width"], config["height"]
    patch = target[y:y+h, x:x+w]
    assert patch.shape == template.shape, (variant, patch.shape, template.shape)
    split = int(h * 0.60)
    return {
        "full": pearson(template, patch),
        "upper_60": pearson(template[:split], patch[:split]),
        "lower_40": pearson(template[split:], patch[split:]),
        "orientation": "horizontal_reflection" if reflected else "original",
        "fixed_transform": {
            "scale": config["scale"], "x": x, "y": y,
            "width": w, "height": h, "sigma": config["sigma"],
        },
    }

def pixel_metrics(actual: np.ndarray, predicted: np.ndarray) -> dict:
    assert actual.shape == predicted.shape
    diff = np.abs(actual.astype(np.int16) - predicted.astype(np.int16))
    return {
        "mean_absolute_channel_error": float(diff.mean()),
        "exact_channel_fraction": float(np.mean(diff == 0)),
        "exact_pixel_fraction": float(np.mean(np.all(diff == 0, axis=2))),
        "max_absolute_channel_error": int(diff.max()),
    }

def filter_reconstruction(noisy: np.ndarray, gaussian: np.ndarray, median: np.ndarray) -> dict:
    gaussian_prediction = cv2.GaussianBlur(noisy, (3, 3), 0)[1:-1, 1:-1]
    box_kernel = np.ones((3, 3), dtype=np.float32) / 9.0
    box_prediction = cv2.filter2D(
        noisy.astype(np.float32), cv2.CV_32F, box_kernel
    )[1:-1, 1:-1]
    median_prediction = cv2.medianBlur(noisy, 3)[1:-1, 1:-1]
    return {
        "gaussian_3x3_standard_kernel": pixel_metrics(gaussian, gaussian_prediction),
        "box_3x3_control": pixel_metrics(
            gaussian, np.clip(np.rint(box_prediction), 0, 255).astype(np.uint8)
        ),
        "median_3x3": pixel_metrics(median, median_prediction),
        "note": "Predictions use the salt-and-pepper image as input and compare only the valid 3x3 interior.",
    }

def run() -> dict:
    assets = {name: fetch_asset(spec) for name, spec in ASSETS.items()}
    decoded = {name: decode(data, cv2.IMREAD_GRAYSCALE) for name, data in assets.items()}
    metadata = {}
    for name, data in assets.items():
        spec = ASSETS[name]
        width, height = spec["size"]
        assert decoded[name].shape == (height, width), (name, decoded[name].shape)
        metadata[name] = {
            "url": spec["url"], "sha256": digest(data), "sha1": digest(data, "sha1"),
            "dimensions": [width, height], "expected_sha256": spec.get("sha256"),
        }

    page32_bytes = (ROOT / "resources/liber-primus/49.jpg").read_bytes()
    page55_bytes = (ROOT / "resources/liber-primus/72.jpg").read_bytes()
    assert digest(page32_bytes) == PAGE_HASHES["49.jpg"]
    assert digest(page55_bytes) == PAGE_HASHES["72.jpg"]
    page32 = decode(page32_bytes, cv2.IMREAD_GRAYSCALE)
    page55 = decode(page55_bytes, cv2.IMREAD_GRAYSCALE)
    assert page32.shape == page55.shape == (3600, 2400)

    p55_results, p32_results = {}, {}
    for name, image in decoded.items():
        p55_results[name] = {
            "reflected": score_fixed(image, page55, P55, name, True),
            "unreflected_control": score_fixed(image, page55, P55, name, False),
        }
        p32_results[name] = {
            "reflected": score_fixed(image, page32, P32, name, True),
            "unreflected_control": score_fixed(image, page32, P32, name, False),
        }

    baseline = p55_results["original"]["reflected"]
    # Positive control: reproduce the previously published fit before
    # interpreting the fixed-transform derivative comparisons.
    assert abs(baseline["upper_60"] - 0.8128721117973328) < 1e-3, baseline
    assert abs(baseline["lower_40"] - 0.45640168561356637) < 1e-3, baseline

    noisy = decode(assets["salt_pepper"], cv2.IMREAD_COLOR)
    gaussian = decode(assets["gaussian_3x3"], cv2.IMREAD_COLOR)
    median = decode(assets["median_3x3"], cv2.IMREAD_COLOR)
    filters = filter_reconstruction(noisy, gaussian, median)

    ranked = sorted(
        (
            {"variant": name,
             "upper_60": values["reflected"]["upper_60"],
             "lower_40": values["reflected"]["lower_40"],
             "delta_upper_vs_original": values["reflected"]["upper_60"] - baseline["upper_60"],
             "delta_lower_vs_original": values["reflected"]["lower_40"] - baseline["lower_40"]}
            for name, values in p55_results.items()
        ),
        key=lambda item: item["upper_60"], reverse=True,
    )

    return {
        "schema": "liber-primus-dead-tree-commons-derivative-gate-v1",
        "question": "Do the exact Commons image-processing derivative files improve the fixed, reflected DeadTree-to-LP2 alignment?",
        "historical_source": {
            "photograph": "R. Neil Marshman / Brookie, DeadTree.jpg, Wikimedia Commons, CC BY-SA 3.0",
            "source_page": "https://commons.wikimedia.org/wiki/File:DeadTree.jpg",
            "noise_page": "https://commons.wikimedia.org/wiki/File:Dead_tree_salt_and_pepper.png",
            "gaussian_page": "https://commons.wikimedia.org/wiki/File:Dead_tree_salt_and_pepper_gauss_3x3.png",
            "median_page": "https://commons.wikimedia.org/wiki/File:Dead_tree_salt_and_pepper_median_3x3.png",
        },
        "inputs": {
            "commons": metadata,
            "lp2_p32": {"path": "resources/liber-primus/49.jpg", "sha256": PAGE_HASHES["49.jpg"]},
            "lp2_p55": {"path": "resources/liber-primus/72.jpg", "sha256": PAGE_HASHES["72.jpg"]},
        },
        "p55_fixed_alignment": {
            "method": "No refit for derivative variants. Source crop [100,500,1750,1950], reflected; target crop [550,1300,1850,2550]; fixed scale .55, translation (230,94); source darkness clip((170-L)/130), target darkness clip((250-L)/45), Gaussian sigma 7.",
            "results": p55_results, "ranked_by_reflected_upper_60": ranked,
            "positive_control": {
                "expected_upper_60": 0.8128721117973328,
                "expected_lower_40": 0.45640168561356637,
                "observed_upper_60": baseline["upper_60"],
                "observed_lower_40": baseline["lower_40"],
            },
        },
        "p32_chained_alignment": {
            "method": "Secondary, non-independent composition of the fixed source-to-p55 reflected fit and the previously recorded p55-to-p32 same-orientation fit. Source crop [100,602,1750,1950]; target crop [550,2000,1850,3500]; fixed scale .495, translation (285,186); source darkness clip((170-L)/130), target darkness clip((230-L)/160), Gaussian sigma 15. No derivative-specific refit.",
            "results": p32_results,
        },
        "filter_reconstruction": filters,
        "interpretation_limits": [
            "The p55 transform and crops were selected in earlier visual exploration; this is not a blind source-identification test.",
            "The p32 transform composes two earlier selected fits and is secondary, not an independent validation.",
            "A higher correlation supports similarity to a particular derivative under the fixed mapping, not proof that the puzzle author used that file.",
            "A negative result excludes only these exact Commons derivatives under these fixed source-to-page transforms; other processing, crops, resolutions, or source assets remain open.",
            "This test does not decode runes, recover a key, or establish a cipher operation.",
        ],
    }

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    result = run()
    rendered = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")

if __name__ == "__main__":
    main()
