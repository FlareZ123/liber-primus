#!/usr/bin/env python3
"""Compare the p55 pale central tree with p53-p57 image controls.

This measures fixed original-image crops only. It does not generate overlays,
search arbitrary thresholds, or infer a traversal/key from the illustration.
"""
from pathlib import Path
import json

import numpy as np
from PIL import Image
from scipy import ndimage

IMAGE_DIR = Path("resources/liber-primus")
CENTRAL_CROP = (650, 1410, 1760, 2480)  # x0,y0,x1,y1; fixed from p55 source bounds
STIPPLE_CROP = (350, 1900, 2050, 3450)


def component_stats(mask):
    labels, count = ndimage.label(mask, structure=np.ones((3, 3), dtype=np.uint8))
    sizes = np.bincount(labels.ravel())[1:]
    return {
        "pixels": int(mask.sum()),
        "components_8_connected": int(count),
        "largest_component": int(sizes.max()) if len(sizes) else 0,
        "top_five_component_sizes": sorted(map(int, sizes), reverse=True)[:5],
    }


out = {
    "central_midgray_control": {
        "crop_xyxy": CENTRAL_CROP,
        "mask": "180 <= gray < 245",
    }
}
for scan in range(70, 75):  # physical LP2 pages 53-57
    gray = np.asarray(Image.open(IMAGE_DIR / f"{scan:02d}.jpg").convert("L"))
    x0, y0, x1, y1 = CENTRAL_CROP
    crop = gray[y0:y1, x0:x1]
    out["central_midgray_control"][str(scan)] = component_stats(
        (crop >= 180) & (crop < 245)
    )
    out["central_midgray_control"][str(scan)]["gray_percentiles"] = [
        round(float(x), 1)
        for x in np.percentile(crop, [0, 5, 25, 50, 75, 95, 100])
    ]

# Separate known p57 GIMP-stipple control, not the p55 tree crop.
gray57 = np.asarray(Image.open(IMAGE_DIR / "74.jpg").convert("L"))
x0, y0, x1, y1 = STIPPLE_CROP
stipple = gray57[y0:y1, x0:x1] < 128
out["p57_stipple_control"] = {
    "crop_xyxy": STIPPLE_CROP,
    "mask": "gray < 128",
    **component_stats(stipple),
}
print(json.dumps(out, indent=2))
