#!/usr/bin/env python3
"""Source-gated p55 tree-tip count under explicit binary-image thresholds.

This tests only the tempting 29-tip alphabet lookup. A connected source tree
whose number of raster skeleton terminals changes across plausible intensity
thresholds has no parameter-free tip index. No cipher key or prose is inferred.

Requires Pillow, NumPy, SciPy and scikit-image. Read-only.
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.morphology import closing, disk, skeletonize


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources" / "liber-primus" / "72.jpg"
SHA256 = "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"
THRESHOLDS = (205, 210, 215, 220, 225, 230, 235, 240, 245)
# Counts are source-pinned at 370x360 with 2-pixel closing and largest component.
EXPECTED = (
    (205, 74, 29), (210, 71, 26), (215, 65, 35),
    (220, 61, 32), (225, 55, 30), (230, 60, 33),
    (235, 58, 31), (240, 53, 32), (245, 39, 21),
)


def terminals(skeleton: np.ndarray) -> int:
    neighbors = np.ones((3, 3), dtype=np.int16)
    neighbors[1, 1] = 0
    degree = ndimage.convolve(skeleton.astype(np.int16), neighbors, mode="constant")
    return int((skeleton & (degree == 1)).sum())


def main_component(image: np.ndarray, threshold: int) -> np.ndarray:
    mask = ndimage.binary_fill_holes(closing(image < threshold, disk(2)))
    labels, _ = ndimage.label(mask, structure=np.ones((3, 3), dtype=np.int8))
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    return labels == np.argmax(sizes)


def pruned_terminals(skeleton: np.ndarray, steps: int) -> int:
    pruned = skeleton.copy()
    neighbors = np.ones((3, 3), dtype=np.int16)
    neighbors[1, 1] = 0
    for _ in range(steps):
        degree = ndimage.convolve(pruned.astype(np.int16), neighbors, mode="constant")
        pruned[pruned & (degree == 1)] = False
    return terminals(pruned)


def positive_control() -> int:
    # A planted comb with exactly 29 branch tips and one trunk root.
    planted = np.zeros((360, 370), dtype=bool)
    planted[300, 40:321] = True
    planted[300:341, 180] = True
    for j in range(29):
        planted[40:301, 40 + 10*j] = True
    tips = terminals(skeletonize(ndimage.binary_fill_holes(closing(planted, disk(2)))))
    assert tips == 30, ("Synthetic 29 tips plus root", tips)
    return tips


def main() -> None:
    raw = SOURCE.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == SHA256
    source = Image.open(io.BytesIO(raw)).convert("L")
    assert source.size == (2400, 3600)
    crop = np.asarray(source)[1430:2510, 625:1735]
    field = np.asarray(Image.fromarray(crop).resize((370, 360)))
    observed = []
    for threshold in THRESHOLDS:
        skeleton = skeletonize(main_component(field, threshold))
        observed.append((threshold, terminals(skeleton), pruned_terminals(skeleton, 12)))
    assert tuple(observed) == EXPECTED, {"expected": EXPECTED, "observed": observed}
    assert min(row[1] for row in observed) == 39
    assert max(row[1] for row in observed) == 74
    assert len({row[1] for row in observed}) > 1
    assert positive_control() == 30
    print(json.dumps({
        "source_sha256": SHA256, "source": str(SOURCE.relative_to(ROOT)),
        "threshold_results": [{"threshold": row[0], "raw_tips": row[1],
                               "after_12_endpoint_prunes": row[2]}
                              for row in observed],
        "source_raw_tip_range": [39, 74],
        "source_pruned_tip_range": [21, 35],
        "planted_29_leaf_tree_plus_root": 30,
        "result": "No source-determined 29-tip alphabet from this fixed raster procedure",
    }, indent=2))


if __name__ == "__main__":
    main()
