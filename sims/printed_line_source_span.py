"""Source-JPEG print span measurement for LP2 page 1 (original scan 18.jpg).

The source image is read directly from resources/liber-primus/18.jpg.
This measures whole-line ink extent, not individual glyph advances.
Requires Pillow, NumPy and SciPy.
"""
from pathlib import Path
import json

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parent.parent
PATH = ROOT / "resources" / "liber-primus" / "18.jpg"

image = np.asarray(Image.open(PATH).convert("L"))
assert image.shape == (3600, 2400)
projection = (image[:, 790:1770] < 160).sum(axis=1)
smoothed = gaussian_filter1d(projection.astype(float), sigma=7)
peaks, _ = find_peaks(smoothed, prominence=125, distance=137)
centers = [int(p) for p in peaks if 450 < p < 3150]
assert len(centers) == 12

spans = []
for center in centers:
    col_ink = (image[center - 60:center + 65, 555:1860] < 160).sum(axis=0)
    x = np.flatnonzero(col_ink > 7)
    assert len(x)
    start = int(x[0]) + 555
    end = int(x[-1]) + 555
    spans.append({"center_y": center, "start_x": start,
                  "end_x": end, "width": end - start})

widths = [span["width"] for span in spans]
assert min(widths) >= 1130 and max(widths) <= 1200
print(json.dumps({"source": str(PATH.relative_to(ROOT)),
                  "shape": list(image.shape), "line_count": len(centers),
                  "mean_span": float(np.mean(widths)), "spans": spans},
                 indent=2))
