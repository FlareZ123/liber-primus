#!/usr/bin/env python3
"""Measure the two large marginal ink components on original LP2 physical p2.

Usage: python sims/lp2_p2_marginal_sign_rotation_sft.py resources/liber-primus/19.jpg
Dependencies: Pillow, NumPy, SciPy.
This tests geometric pairing only; it does not infer a cipher/key mapping.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

if len(sys.argv) != 2:
    raise SystemExit("usage: python sims/lp2_p2_marginal_sign_rotation_sft.py path/to/19.jpg")

path = Path(sys.argv[1])
raw = path.read_bytes()
gray = np.asarray(Image.open(path).convert("L"))
height, width = gray.shape


def find_pair(threshold):
    foreground = gray < threshold
    labels, _ = ndimage.label(foreground, structure=np.ones((3, 3), dtype=np.uint8))
    objects = ndimage.find_objects(labels)
    candidates = []
    for label_id, slc in enumerate(objects, start=1):
        if slc is None:
            continue
        ys, xs = slc
        x, y = int(xs.start), int(ys.start)
        w, h = int(xs.stop - xs.start), int(ys.stop - ys.start)
        area = int(np.count_nonzero(labels[slc] == label_id))
        if area > 10000 and (x < 700 or x > 1700):
            candidates.append({"label": label_id, "x": x, "y": y, "w": w, "h": h, "area": area})
    left = max((c for c in candidates if c["x"] < 700), key=lambda c: c["area"])
    right = max((c for c in candidates if c["x"] > 1700), key=lambda c: c["area"])
    left_mask = labels == left["label"]
    right_mask = labels == right["label"]
    rotated = np.rot90(right_mask, 2)

    union = np.logical_or(left_mask, rotated).sum()
    intersection = np.logical_and(left_mask, rotated).sum()
    return {
        "threshold": threshold,
        "left": {k: v for k, v in left.items() if k != "label"},
        "right": {k: v for k, v in right.items() if k != "label"},
        "iou_rotation_180_about_page_center": float(intersection / union),
    }


thresholds = [96, 128, 144, 176, 192, 208, 224]
output = {
    "source_path": str(path),
    "source_sha256": hashlib.sha256(raw).hexdigest(),
    "image_width": width,
    "image_height": height,
    "connectivity": 8,
    "candidate_rule": "largest connected component area>10000 with x<700 and largest with x>1700",
    "results": [find_pair(t) for t in thresholds],
    "interpretation_limit": "A 180-degree geometric pairing does not by itself assign a key slot, sum/difference sign, or privileged direction.",
}
print(json.dumps(output, indent=2))
