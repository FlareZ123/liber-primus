"""From repository root: python sims/lp2_opening_stave_linekey_geometry.py [optional owner JPEG ZIP].
Dependencies: Pillow, numpy, scipy. No OCR. Coordinates are zero-based, half-open.
"""
import json, sys, zipfile
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label

ZIP = zipfile.ZipFile(sys.argv[1]) if len(sys.argv) > 1 else None
STRIPS = [(310, 330, 1900, 2110), (380, 410, 2120, 2300), (470, 500, 2470, 2680)]
out = []
for p in range(3):
    name = f"{17+p}.jpg"
    source = ZIP.open("liber-primus-jpegs/" + name) if ZIP else Path("resources/liber-primus") / name
    with Image.open(source) as im:
        a = np.asarray(im.convert("L"))
    assert a.shape == (3600, 2400)
    v = (a[:, 800:1650] < 100).sum(1)
    lab, n = label(v > 15)
    bands = []
    for i in range(1, n+1):
        q = np.flatnonzero(lab == i)
        if 100 <= len(q) <= 125:
            bands.append((int(q[0]), int(q[-1])))
    assert len(bands) == [12,12,9][p]
    record = {"page": p, "bands": bands, "thresholds": {}}
    for t in (64,100,128,192):
        sides = {}
        for side in ("L","R"):
            rows = []
            for x0,x1,y0,y1 in STRIPS:
                if side == "R":
                    x0,x1,y0,y1 = 2400-x1,2400-x0,3600-y1,3600-y0
                yy = np.where(a[y0:y1,x0:x1] < t)[0] + y0
                y = float(np.median(yy))
                hits = [i+1 for i,(lo,hi) in enumerate(bands) if lo <= y <= hi]
                rows.append({"y": y, "lines": hits})
            sides[side] = rows
        assert [r["lines"] for r in sides["L"]] == [[8],[9],[11] if p<2 else []]
        assert all(not r["lines"] for r in sides["R"])
        record["thresholds"][t] = sides
    out.append(record)
print(json.dumps(out,indent=2))
