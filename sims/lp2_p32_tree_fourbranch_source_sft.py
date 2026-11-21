"""Read-only original JPEG 49.jpg / physical p32 tree four-branch source gate.

Windows Python 3.12 with NumPy and opencv-python-headless.
A ciphertext-blind segmentation of the original p32 illustration.
No source pixels, crop geometry, thresholds or scans are fitted to graph values.
"""
import hashlib
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
IMAGE = ROOT / "resources/liber-primus/49.jpg"
EXPECTED_SHA = "c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72"
assert hashlib.sha256(IMAGE.read_bytes()).hexdigest() == EXPECTED_SHA
source = cv2.imread(str(IMAGE), cv2.IMREAD_GRAYSCALE)
assert source is not None and source.shape == (3600, 2400)

# Original-pixel ROI fixed once, enclosing entire tree below the text.
X0, Y0, X1, Y1 = 750, 1900, 2000, 3200
roi = source[Y0:Y1, X0:X1]
cutoff, binary = cv2.threshold(
    roi, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU
)
labels_total, labels, stats, _ = cv2.connectedComponentsWithStats(
    binary, connectivity=8
)
assert labels_total > 1
largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
major = labels == largest
ys, xs = np.nonzero(major)
miny, maxy = int(ys.min()), int(ys.max())
minx, maxx = int(xs.min()), int(xs.max())


def intervals(line, minimum_width=8):
    """Contiguous scan-line crossings of the thresholded largest tree body."""
    edges = np.diff(
        np.concatenate(([0], line.astype(np.uint8), [0])).astype(np.int8)
    )
    starts = np.flatnonzero(edges == 1)
    ends = np.flatnonzero(edges == -1)
    return [
        [int(a + X0), int(b - 1 + X0)]
        for a, b in zip(starts, ends)
        if b - a >= minimum_width
    ]


# Relative heights fixed independently of the four graph child addresses.
heights = [0.20, 0.23, 0.25, 0.30, 0.35, 0.50, 0.75]
sections = []
for fraction in heights:
    y = int(round(miny + (maxy - miny) * fraction))
    crossings = intervals(major[y, :])
    sections.append({
        "fraction": fraction,
        "globalY": int(Y0 + y),
        "crossings": len(crossings),
        "xIntervals": crossings,
    })
assert [r["crossings"] for r in sections] == [3, 4, 3, 3, 2, 2, 1]
report = {
    "classification": "P32 original tree has no preselected unique 4-branch ordering",
    "originalScan": "resources/liber-primus/49.jpg",
    "imageSha256": EXPECTED_SHA,
    "cropOriginalPixels": [X0, Y0, X1, Y1],
    "thresholdAlgorithm": "cv2 Otsu, binary-inverted",
    "threshold": float(cutoff),
    "majorComponentPixelArea": int(stats[largest, cv2.CC_STAT_AREA]),
    "treeBBoxOriginalPixels": [
        X0 + minx, Y0 + miny, X0 + maxx, Y0 + maxy
    ],
    "minimumCrossingWidth": 8,
    "fixedHeightCrossings": sections,
    "decision": "A transient four-crossing scan is height-dependent. "
                "No authored mark selects a stable four-way grouping or order.",
}
assert report["threshold"] == 192
assert report["majorComponentPixelArea"] == 235550
print(json.dumps(report, indent=2))
