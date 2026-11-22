#!/usr/bin/env python3
"""Original-image control for the LP2 p57 241/331 stipple selector.

Run at repository root:
    python sims/lp2_stipple_component_selector_sft.py

Measures how a claimed source-key selector changes with legitimate image-
component definitions. This is not a decryption or a model of GIMP Dissolve.
"""
from __future__ import annotations

import hashlib
from math import isqrt
from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "74.jpg"
SHA256 = "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"
CROP = (350, 1900, 2050, 3450)
THRESHOLD = 100
MIDLINE = 1200


def isprime(n: int) -> bool:
    return n >= 2 and all(n % d for d in range(2, isqrt(n) + 1))


def components(mask: np.ndarray, connectivity: int):
    count, _labels, stats, centroids = cv2.connectedComponentsWithStats(
        mask, connectivity=connectivity
    )
    areas = stats[1:, cv2.CC_STAT_AREA]
    order = np.argsort(areas)[::-1]
    return count - 1, areas, order, centroids[1:, 0] + CROP[0], centroids


def split(xs: np.ndarray, order: np.ndarray, removed: int, axis: int):
    keep = np.ones(len(xs), dtype=bool)
    keep[order[:removed]] = False
    left = int(np.count_nonzero(xs[keep] < axis))
    return left, int(np.count_nonzero(keep) - left)


def main() -> None:
    raw = IMAGE.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == SHA256, f"Image differs from original archive: {digest}"
    image = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert image.shape == (3600, 2400)
    x0, y0, x1, y1 = CROP
    mask = (image[y0:y1, x0:x1] < THRESHOLD).astype(np.uint8)
    counts = {}

    print("Source", IMAGE, "SHA256", digest)
    print("Original crop", CROP, "midline", MIDLINE, "threshold", THRESHOLD)
    for connectivity in (4, 8):
        count, areas, order, xs, centroids = components(mask, connectivity)
        counts[connectivity] = count
        print(f"Connectivity {connectivity}: {count} components; largest areas:",
              [int(areas[i]) for i in order[:8]])
        for removed in (0, 1, 2, 3, 10):
            left, right = split(xs, order, removed, MIDLINE)
            print(f"  remove {removed:2d}: {left}/{right}; "
                  f"both prime = {isprime(left) and isprime(right)}")
        if connectivity == 8:
            assert count == 574
            assert split(xs, order, 2, MIDLINE) == (241, 331)
            assert split(xs, order, 3, MIDLINE) == (241, 330)
            original = [axis for axis in range(1150, 1251)
                        if split(xs, order, 2, axis) == (241, 331)]
            print("  Axes retaining 241/331 in 1150..1250:", original)
            largest = int(order[0] + 1)
            print("  Main-component centroid in original page coordinates:",
                  (float(centroids[largest, 0] + x0),
                   float(centroids[largest, 1] + y0)))
            assert original == list(range(1198, 1206))
            assert split(xs, order, 2, 1213) == (248, 324)
        else:
            assert count == 814
            assert split(xs, order, 2, MIDLINE) == (337, 475)

    assert counts == {4: 814, 8: 574}
    print("PASS: source-sensitive image selector audited; no plaintext recovered.")


if __name__ == "__main__":
    main()
