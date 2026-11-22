#!/usr/bin/env python3
"""Original-pixel p22 collar spacing compared with established p15 primes.

This is a geometric hypothesis, not LP2 plaintext/key recovery.
Python 3, Pillow and NumPy. No OCR, trained recognizer or tuned decoder.
"""
import argparse
import io
import json
from pathlib import Path
from zipfile import ZipFile

import numpy as np
from PIL import Image

WINDOWS = ((660, 870), (940, 1120), (1400, 1620))
ROI = (580, 2215, 1840, 2630)
THRESHOLDS = (70, 90, 110, 130, 150, 170)
# These values are established from p15's exact Fibonacci-indexed-prime
# spiral, not estimated from the p22 artwork.
P15_PRIMES = (2, 3, 5, 7, 13, 23, 43, 79,
              149, 263, 463, 829, 1481, 2593, 4507, 7817)


def load_original(zip_path):
    if zip_path is None:
        image_path = Path(__file__).resolve().parent.parent / (
            "resources/liber-primus/39.jpg"
        )
        with Image.open(image_path) as img:
            return np.asarray(img.convert("L"), dtype=np.uint8)
    with ZipFile(zip_path) as archive:
        entry = next(name for name in archive.namelist()
                     if name.endswith("/39.jpg"))
        with Image.open(io.BytesIO(archive.read(entry))) as img:
            return np.asarray(img.convert("L"), dtype=np.uint8)


def centers(arr, threshold):
    """Source-visible, fixed-region high-ink-density collar centroids."""
    assert arr.shape == (3600, 2400), arr.shape
    x0, y0, x1, y1 = ROI
    densities = (arr[y0:y1, x0:x1] < threshold).sum(axis=0)
    out = []
    for left, right in WINDOWS:
        xs = np.arange(left, right)
        column_counts = densities[left-x0:right-x0].astype(float)
        # Subtract low common shaft ink to prioritize the three collars.
        weights = np.maximum(column_counts -
                             np.quantile(column_counts, 0.20), 0)
        out.append(float(np.dot(xs, weights)/weights.sum()))
    return out


def evaluate(arr):
    results = []
    for threshold in THRESHOLDS:
        x = centers(arr, threshold)
        measured = np.diff(x)
        pairs = [(i, P15_PRIMES[i], P15_PRIMES[i+1],
                  float(np.linalg.norm(measured -
                      [P15_PRIMES[i], P15_PRIMES[i+1]])))
                 for i in range(len(P15_PRIMES)-1)]
        best = min(pairs, key=lambda pair: pair[3])
        # Source-shaped conditional prediction: choose a Fibonacci-prime
        # step using gap one alone, then predict the unseen third collar.
        chosen = min(range(len(P15_PRIMES)-1),
                     key=lambda i: abs(measured[0]-P15_PRIMES[i]))
        predicted_third_x = x[1] + P15_PRIMES[chosen+1]
        results.append(dict(threshold=threshold,
                            first_gap_nearest_prime_step=chosen,
                            predicted_third_collar_x=predicted_third_x,
                            band_centers_x=x,
                            measured_gaps_px=measured.tolist(),
                            withheld_third_x_error_px=x[2]-predicted_third_x,
                            closest_fibonacci_prime_pair=list(best),
                            p9_p10_error_px=(measured -
                                np.array((263, 463))).tolist()))
    assert all(r["closest_fibonacci_prime_pair"][0] == 9 for r in results)
    assert all(r["first_gap_nearest_prime_step"] == 9 for r in results)
    # This is an observational regression guard, not a discovery threshold.
    assert all(r["closest_fibonacci_prime_pair"][3] < 6 for r in results)
    return {"source_scan": "original Stage11 scan39.jpg, LP2 physical p22",
            "hypothesis": "p22 collar spacings could visualize p15"
                          " consecutive Fibonacci-indexed primes 263,463",
            "coordinate_units": "pixels in original 2400x3600 JPEG",
            "regions_x": WINDOWS, "region_y": [ROI[1], ROI[3]],
            "measurements": results, "recovered_plaintext": False,
            "authenticated_operator": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", help="optional archive of original JPGs")
    args = parser.parse_args()
    print(json.dumps(evaluate(load_original(args.zip)), indent=2))
