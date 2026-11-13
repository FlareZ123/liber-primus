"""Original LP2 p56 black-dot-to-hex-column selector capacity (Python SFT).

Operates on 73.jpg original physical p56. Windows-compatible; no writes.
Pillow and SciPy are the same conventional libraries used by image-source
investigations elsewhere in the repository.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
IMAGE = ROOT / "resources" / "liber-primus" / "73.jpg"
a = np.asarray(Image.open(IMAGE).convert("L"))

# Five genuine printed hex lines with black-ink glyph runs.
hash_row_y = [(1235, 1315), (1340, 1425), (1445, 1535),
              (1550, 1645), (1660, 1745)]
runs = []
for y0, y1 in hash_row_y:
    ink = (a[y0:y1, 575:1820] < 128).any(axis=0)
    starts = np.flatnonzero(ink & ~np.pad(ink[:-1], (1, 0)))
    ends = np.flatnonzero(ink & ~np.pad(ink[1:], (0, 1)))
    runs.append([(int(s + 575), int(e + 575)) for s, e in zip(starts, ends)])
assert [len(row) for row in runs] == [26, 25, 25, 27, 24]

# The five large original black dots beneath the terminal hex digest.
roi = a[2350:2850, 700:1900] < 130
labels, _ = ndimage.label(roi, structure=np.ones((3, 3), dtype=np.uint8))
dots = []
for i, slc in enumerate(ndimage.find_objects(labels), 1):
    if slc is None:
        continue
    mask = labels[slc] == i
    area = int(mask.sum())
    if not 150 < area < 4000:
        continue
    ys, xs = np.where(mask)
    dots.append({
        "x": float(xs.mean() + slc[1].start + 700),
        "y": float(ys.mean() + slc[0].start + 2350),
        "xmin": int(xs.min() + slc[1].start + 700),
        "xmax": int(xs.max() + slc[1].start + 700),
        "area": area
    })
assert len(dots) == 5
dots.sort(key=lambda dot: dot["x"])
assert [round(d["x"]) for d in dots] == [873, 921, 1104, 1408, 1604]
assert [d["area"] for d in dots] == [3560, 3542, 3559, 3623, 3604]

for order in ("x", "y"):
    ordered = sorted(dots, key=lambda dot: dot[order])
    candidate_counts = [
        sum(right >= dot["xmin"] and left <= dot["xmax"]
            for left, right in hash_row)
        for dot, hash_row in zip(ordered, runs)
    ]
    expected = [2, 2, 2, 2, 3] if order == "x" else [3, 2, 2, 2, 2]
    assert candidate_counts == expected
    print(order, "dot spans touch hex ink-runs:", candidate_counts)

# A hypothetical 1-pixel pointer on a real character tests that our
# original selection routine can distinguish a uniquely selected glyph.
pointer = {"xmin": 615, "xmax": 615}
assert sum(right >= pointer["xmin"] and left <= pointer["xmax"]
           for left, right in runs[0]) == 1
print("PASS: original five dots do not each uniquely select a hex glyph.")
