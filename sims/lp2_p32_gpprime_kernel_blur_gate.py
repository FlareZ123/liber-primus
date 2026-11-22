#!/usr/bin/env python3
"""Test whether p32's 11x11 GP-prime matrix is the blur kernel from p55 to p32.

Run from the repository root:
  python sims/lp2_p32_gpprime_kernel_blur_gate.py

Dependencies: numpy, opencv-python.
The crops and affine registration are frozen from the existing p32/p55
cross-page tree correspondence report; this script does not refit them.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

import cv2
import numpy as np

PRIMES = np.array([
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
    53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109,
], dtype=np.float64)

# The established p32/p55 image correspondence fixes this crop and transform.
P32_CROP = (2070, 3230, 650, 1810)   # y0,y1,x0,x1 in scan 49.jpg
P55_CROP = (1430, 2510, 625, 1735)   # y0,y1,x0,x1 in scan 72.jpg
SCALE, DX, DY = 0.88, 10, 24
REGION = (slice(30, 335), slice(20, 340))


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def fill_largest_outline(crop: np.ndarray) -> np.ndarray:
    binary = (crop < 240).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, 8)
    if n <= 1:
        raise RuntimeError("No connected p55 tree outline found in fixed crop")
    component_id = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    component = (labels == component_id).astype(np.uint8)
    contours, _ = cv2.findContours(
        component, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    filled = np.zeros_like(component)
    cv2.drawContours(filled, contours, -1, 1, thickness=cv2.FILLED)
    return filled.astype(np.float32)


def affine_fixed(image: np.ndarray) -> np.ndarray:
    # Scale about the 360x360 centre, then apply the already-frozen translation.
    m = np.array([
        [SCALE, 0, 180 * (1 - SCALE) + DX],
        [0, SCALE, 180 * (1 - SCALE) + DY],
    ], dtype=np.float32)
    return cv2.warpAffine(
        image.astype(np.float32), m, (360, 360),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0,
    )


def pearson(a: np.ndarray, b: np.ndarray, smooth: float = 0.0) -> float:
    if smooth:
        a = cv2.GaussianBlur(a.astype(np.float32), (0, 0), smooth)
        b = cv2.GaussianBlur(b.astype(np.float32), (0, 0), smooth)
    aa = a[REGION].astype(np.float64).ravel()
    bb = b[REGION].astype(np.float64).ravel()
    return float(np.corrcoef(aa, bb)[0, 1])


def shifted_source(image: np.ndarray, dy: int, dx: int) -> np.ndarray:
    out = np.zeros_like(image, dtype=np.float32)
    y0, y1 = max(0, -dy), min(image.shape[0], image.shape[0] - dy)
    x0, x1 = max(0, -dx), min(image.shape[1], image.shape[1] - dx)
    out[y0:y1, x0:x1] = image[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
    return out


def design_matrix(source: np.ndarray, target: np.ndarray):
    """Exact linear design for filter2D(source,K) followed by fixed affine map."""
    t = target[REGION].astype(np.float64).ravel()
    t -= t.mean()
    columns = []
    for dy in range(-5, 6):
        for dx in range(-5, 6):
            shifted = shifted_source(source, dy, dx)
            transformed = affine_fixed(shifted)
            columns.append(transformed[REGION].astype(np.float64).ravel())
    x = np.column_stack(columns)
    xc = x - x.mean(axis=0, keepdims=True)
    return xc.T @ xc, xc.T @ t, float(t @ t)


def correlation_from_kernel(kernel: np.ndarray, a, b, tnorm: float) -> float:
    k = np.asarray(kernel, dtype=np.float64).reshape(-1)
    return float((k @ b) / math.sqrt(tnorm * (k @ a @ k)))


def permutation_null(kernel: np.ndarray, a, b, tnorm: float,
                     permutations: int, seed: int) -> dict:
    flat = np.asarray(kernel, dtype=np.float64).reshape(-1)
    observed = max(
        correlation_from_kernel(flat, a, b, tnorm),
        correlation_from_kernel(flat[::-1], a, b, tnorm),
    )
    rng = np.random.default_rng(seed)
    samples = np.stack(
        [rng.permutation(flat) for _ in range(permutations)]
    ).astype(np.float64)
    numerator = samples @ b
    quadratic = np.einsum("ij,ij->i", samples @ a, samples)
    forward = numerator / np.sqrt(tnorm * quadratic)

    reversed_samples = (
        samples.reshape(-1, 11, 11)[:, ::-1, ::-1].reshape(-1, 121)
    )
    reverse_quadratic = np.einsum(
        "ij,ij->i", reversed_samples @ a, reversed_samples
    )
    reverse = (reversed_samples @ b) / np.sqrt(tnorm * reverse_quadratic)
    family_max = np.maximum(forward, reverse)
    exceed = int(np.sum(family_max >= observed))
    return {
        "permutations": permutations,
        "seed": seed,
        "observed_max_over_convolution_and_correlation": observed,
        "null_max_mean": float(family_max.mean()),
        "null_max_sd": float(family_max.std(ddof=1)),
        "null_max_q05_q95": [
            float(v) for v in np.quantile(family_max, [0.05, 0.95])
        ],
        "null_maximum": float(family_max.max()),
        "permutations_at_least_observed": exceed,
        "empirical_upper_tail_plus1": (exceed + 1) / (permutations + 1),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--p32-image", type=Path)
    parser.add_argument("--p55-image", type=Path)
    parser.add_argument("--corpus", type=Path)
    parser.add_argument("--permutations", type=int, default=20_000)
    parser.add_argument("--seed", type=int, default=20261120)
    args = parser.parse_args()

    image_dir = args.root / "resources" / "liber-primus"
    p32_path = args.p32_image or image_dir / "49.jpg"
    p55_path = args.p55_image or image_dir / "72.jpg"
    corpus_path = args.corpus or image_dir / "lp2-corpus.json"

    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    p32 = next(page["indices"] for page in corpus["pages"] if page["page"] == 32)
    if len(p32) != 121:
        raise RuntimeError(f"Expected 121 p32 runes, found {len(p32)}")
    matrix = np.asarray(p32, dtype=np.int64).reshape(11, 11)
    prime_matrix = PRIMES[matrix]
    ordinal_matrix = matrix.astype(np.float64)

    p32_image = cv2.imread(str(p32_path), cv2.IMREAD_GRAYSCALE)
    p55_image = cv2.imread(str(p55_path), cv2.IMREAD_GRAYSCALE)
    if p32_image is None or p55_image is None:
        raise RuntimeError("Could not read original p32/p55 JPEGs")
    y0, y1, x0, x1 = P32_CROP
    p32_crop = p32_image[y0:y1, x0:x1]
    y0, y1, x0, x1 = P55_CROP
    p55_crop = p55_image[y0:y1, x0:x1]

    target = np.maximum(0, 252 - p32_crop.astype(np.float32))
    target = cv2.resize(target, (360, 360), interpolation=cv2.INTER_AREA)
    source = cv2.resize(
        fill_largest_outline(p55_crop), (360, 360),
        interpolation=cv2.INTER_AREA,
    )

    def filtered(kernel: np.ndarray) -> np.ndarray:
        normalized = (kernel / kernel.sum()).astype(np.float32)
        image = cv2.filter2D(
            source, -1, normalized, anchor=(-1, -1),
            borderType=cv2.BORDER_CONSTANT,
        )
        return affine_fixed(image)

    gaussian11 = cv2.getGaussianKernel(11, 2.0)
    gaussian11 = gaussian11 @ gaussian11.T
    candidates = {}
    for name, kernel in [
        ("prime", prime_matrix),
        ("ordinal", ordinal_matrix),
        ("uniform11", np.ones((11, 11), dtype=np.float64)),
        ("gaussian11_sigma2", gaussian11),
    ]:
        for orientation, oriented in [
            ("correlation", kernel),
            ("convolution", kernel[::-1, ::-1]),
        ]:
            out = filtered(oriented)
            candidates[f"{name}_{orientation}"] = {
                "raw": pearson(target, out),
                "smoothed6": pearson(target, out, 6.0),
            }

    candidates["identity"] = {
        "raw": pearson(target, affine_fixed(source)),
        "smoothed6": pearson(target, affine_fixed(source), 6.0),
    }
    generic_gaussian = affine_fixed(
        cv2.GaussianBlur(source, (0, 0), 9.0)
    )
    candidates["generic_gaussian_sigma9"] = {
        "raw": pearson(target, generic_gaussian),
        "smoothed6": pearson(target, generic_gaussian, 6.0),
    }

    a, b, tnorm = design_matrix(source, target)
    null = permutation_null(
        prime_matrix, a, b, tnorm, args.permutations, args.seed
    )

    yy, xx = np.indices((11, 11), dtype=np.float64)
    total = float(prime_matrix.sum())
    cy = float((yy * prime_matrix).sum() / total)
    cx = float((xx * prime_matrix).sum() / total)
    stats = {
        "sum": total,
        "first_row_sum": int(prime_matrix[0].sum()),
        "first_column_sum": int(prime_matrix[:, 0].sum()),
        "centroid_yx": [cy, cx],
        "variance_yx": [
            float((((yy - cy) ** 2) * prime_matrix).sum() / total),
            float((((xx - cx) ** 2) * prime_matrix).sum() / total),
        ],
        "symmetric_l1_fraction": float(
            np.abs(prime_matrix - prime_matrix[::-1, ::-1]).sum() / total
        ),
    }

    print(json.dumps({
        "hypothesis": "p32 row-major GP-prime 11x11 matrix is the p55-to-p32 spatial blur kernel",
        "p32_image_sha256": sha256(p32_path),
        "p55_image_sha256": sha256(p55_path),
        "p32_runes": len(p32),
        "prime_kernel": stats,
        "fixed_registration": {
            "scale": SCALE, "translation_xy": [DX, DY],
            "p32_crop_yx": [2070, 3230, 650, 1810],
            "p55_crop_yx": [1430, 2510, 625, 1735],
            "resize": [360, 360],
        },
        "candidate_correlations": candidates,
        "prime_kernel_random_order_control": null,
    }, indent=2))


if __name__ == "__main__":
    main()
