#!/usr/bin/env python3
"""Audit the original LP2 p57 stipple against historical GIMP pixel RNG.

Run from repository root: python sims/lp2_p57_gimp_native_threshold_sft.py
This is an independent source-artifact control, not a recovered LP2 cipher.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources" / "liber-primus" / "74.jpg"
SHA256 = "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"
SEED = 314159265
NATIVE_WIDTH, NATIVE_HEIGHT = 576, 864
X0, Y0, WIDTH, HEIGHT = 158, 475, 267, 293
GIMP_DX, GIMP_DY = 4, -9


def gimp_thresholds(width: int) -> np.ndarray:
    """Historical GLib GRand v2.2: MT19937 + rejection modulo 255."""
    rng = np.random.RandomState(SEED)
    seeds = rng.randint(0, 2**32, size=4096, dtype=np.uint32)
    assert seeds[:8].tolist() == [
        3721122731, 618219707, 807213306, 3144837749,
        3447982176, 3230631767, 755972506, 1398685501,
    ]
    first_raw = np.random.RandomState(int(seeds[0])).randint(
        0, 2**32, size=8, dtype=np.uint32
    )
    assert first_raw.tolist() == [
        505524582, 4277517655, 1702989131, 912900261,
        1432505218, 4108960502, 2270003630, 316039421,
    ]
    assert (first_raw % 255).tolist() == [87, 10, 191, 6, 133, 152, 5, 71]

    field = np.empty((4096, width), dtype=np.uint8)
    for y, seed in enumerate(seeds):
        generator = np.random.RandomState(int(seed))
        raw = generator.randint(0, 2**32, size=width, dtype=np.uint32)
        # GLib's int_range rejects uint32 == 2**32 - 1. No rejections
        # occur in this exact source-locked slice.
        assert np.all(raw != np.iinfo(np.uint32).max), (
            f"GIMP rejection handling needed for row {y}"
        )
        field[y, :] = raw % 255
    return field


def main() -> None:
    image_bytes = IMAGE.read_bytes()
    assert hashlib.sha256(image_bytes).hexdigest() == SHA256
    img = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
    assert img.shape == (3600, 2400)
    crop_masks = []
    for threshold in (40, 64, 100, 128, 192, 200):
        binary = (img < threshold).astype(np.uint8)
        native = cv2.resize(binary, (NATIVE_WIDTH, NATIVE_HEIGHT),
                            interpolation=cv2.INTER_AREA)
        crop_masks.append((native[Y0:Y0 + HEIGHT, X0:X0 + WIDTH] > 0).astype(np.uint8))
    mask = crop_masks[2]
    assert all(np.array_equal(mask, other) for other in crop_masks)
    assert mask.shape == (293, 267)
    assert np.count_nonzero(mask) == 2033

    n, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
    assert n - 1 == 574
    exclude = 1 + np.argsort(stats[1:, cv2.CC_STAT_AREA])[-2:]
    keep = np.ones(n, dtype=bool)
    keep[0] = False
    keep[exclude] = False
    left = int(np.count_nonzero(keep & (centroids[:, 0] < 130)))
    right = int(np.count_nonzero(keep)) - left
    assert (left, right) == (241, 331)
    print("Native JPEG raster: 293 x 267, 2033 black cells, 574 components")
    print("After excluding two largest components, left/right:", left, right)

    singleton_labels = np.where(stats[1:, cv2.CC_STAT_AREA] == 1)[0] + 1
    assert len(singleton_labels) == 391
    ys = stats[singleton_labels, cv2.CC_STAT_TOP].astype(np.int32)
    xs = stats[singleton_labels, cv2.CC_STAT_LEFT].astype(np.int32)
    field = gimp_thresholds(291)
    offset_mean = []
    for dy in range(-20, 21):
        for dx in range(-20, 21):
            values = field[(ys + GIMP_DY + dy) % 4096, xs + GIMP_DX + dx]
            offset_mean.append((float(np.mean(values)), dx, dy))
    offset_mean.sort()
    best, runnerup = offset_mean[:2]
    assert (best[1], best[2]) == (0, 0)
    assert abs(best[0] - (3664 / 391)) < 1e-12, best
    assert abs(runnerup[0] - (44506 / 391)) < 1e-12, runnerup
    vals = field[(ys + GIMP_DY) % 4096, xs + GIMP_DX]
    assert np.count_nonzero(vals == 0) == 65
    print("Singleton pixels:", len(singleton_labels))
    print("Fixed GIMP offset x+4, y-9: mean threshold", round(best[0], 6),
          "; zero-threshold singletons", int(np.count_nonzero(vals == 0)))
    print("Best of 1680 other offsets within +/-20:", runnerup)
    for x, y in ((53, 250), (44, 256), (41, 265), (57, 269)):
        assert mask[y, x] == 1
        assert field[(y + GIMP_DY) % 4096, x + GIMP_DX] == 0
    print("Four independently reported isolated dots: all GIMP threshold zero")
    print("PASS. Rendering source-control only; no LP2 plaintext recovered.")


if __name__ == "__main__":
    main()
