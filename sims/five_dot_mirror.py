"""Find exact reflected five-dot motifs in original Liber Primus JPEGs.

The full book uses scan filenames 00.jpg..74.jpg; LP2 page = scan - 17.
Reproduce with numpy + opencv-python-headless: python sims/five_dot_mirror.py.
Prints JSON only and never writes files.
"""
from __future__ import annotations

import itertools
import json
from pathlib import Path

import cv2
import numpy as np

SOURCE = Path(__file__).resolve().parent.parent / "resources" / "liber-primus"
PAGES = (24, 40, 73)
THRESHOLD = 100


def dot_centers(page: int) -> np.ndarray:
    """Detect the five ≈70px filled black circles, independent of layout."""
    gray = cv2.imread(str(SOURCE / f"{page:02d}.jpg"), cv2.IMREAD_GRAYSCALE)
    if gray is None:
        raise FileNotFoundError(SOURCE / f"{page:02d}.jpg")
    n, labels, stats, centers = cv2.connectedComponentsWithStats(
        np.uint8(gray < THRESHOLD), connectivity=8
    )
    selected = []
    for index in range(1, n):
        _, _, width, height, area = (int(x) for x in stats[index])
        if (
            60 <= width <= 80
            and 60 <= height <= 80
            and 2500 <= area <= 4800
            and area / (width * height) > 0.58
        ):
            selected.append(centers[index])
    return np.array(selected, dtype=np.float64).reshape(-1, 2)


def fit(source: np.ndarray, target: np.ndarray) -> list[dict]:
    """Exact minimum RMS over four axis-aligned reflections and 5! pairings.

    For each reflection the translation is fixed by the centroids. The data
    comprise exactly five 2D points on each scan, so brute-force 5! matching
    is tiny and avoids arbitrary visually chosen point labels.
    """
    if source.shape != (5, 2) or target.shape != (5, 2):
        raise ValueError("Five centers per page required")
    results = []
    for sx, sy in itertools.product((1, -1), repeat=2):
        flipped = source * np.array([sx, sy])
        translation = np.mean(target, axis=0) - np.mean(flipped, axis=0)
        residual = flipped + translation
        best_score = float("inf")
        best_permutation = ()
        for permutation in itertools.permutations(range(5)):
            paired = target[np.array(permutation)]
            mean_sq = float(np.mean(np.sum((residual - paired) ** 2, axis=1)))
            if mean_sq < best_score:
                best_score = mean_sq
                best_permutation = permutation
        results.append(
            {
                "x_sign": sx,
                "y_sign": sy,
                "translation_px": translation.round(4).tolist(),
                "rms_error_px": round(float(np.sqrt(best_score)), 6),
                "matching": list(best_permutation),
            }
        )
    return sorted(results, key=lambda r: r["rms_error_px"])


def main() -> None:
    catalog = {
        page: dot_centers(page) for page in range(75)
    }
    counts = {str(p): len(v) for p, v in catalog.items() if len(v)}
    if counts != {"24": 5, "40": 5, "50": 3, "73": 5}:
        raise AssertionError(f"Unexpected full-book circle inventory: {counts}")
    fits = {}
    for p, q in ((24, 40), (24, 73), (40, 73)):
        transforms = fit(catalog[p], catalog[q])
        if transforms[0]["rms_error_px"] >= 0.5:
            raise AssertionError(f"Five-dot transformation not recovered: {p} -> {q}")
        if transforms[1]["rms_error_px"] <= 100:
            raise AssertionError(f"Mirror alternative unexpectedly close: {p} -> {q}")
        fits[f"scan{p}_to_scan{q}"] = transforms
    print(
        json.dumps(
            {
                "source": "resources/liber-primus/{00..74}.jpg",
                "scan_size": [2400, 3600],
                "detection_threshold": THRESHOLD,
                "qualifying_circle_count_by_scan": counts,
                "lp2_pages": {str(p - 17): p for p in PAGES},
                "centers_px": {
                    str(p): np.round(catalog[p], 4).tolist() for p in PAGES
                },
                "axis_reflection_matches": fits,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
