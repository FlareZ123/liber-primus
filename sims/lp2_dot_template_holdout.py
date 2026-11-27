#!/usr/bin/env python3
"""Native dot centroid gate #3148. Usage: python this.py liber-primus-jpegs.zip
Requires numpy, opencv-python, Pillow."""
from PIL import Image
from zipfile import ZipFile
from io import BytesIO
import sys
import numpy as np
import cv2

z = ZipFile(sys.argv[1])
def read(n):
    paths = [p for p in z.namelist() if p.rsplit('/', 1)[-1] == f'{n:02}.jpg']
    assert len(paths) == 1, paths
    return Image.open(BytesIO(z.read(paths[0]))).convert('RGB')

def comps(n, box=None):
    im = read(n)
    box = box or (0, 0, *im.size)
    x0, y0, _, _ = box
    a = np.array(im.crop(box), dtype=np.int16)
    r, g, b = a.transpose(2, 0, 1)
    _, _, st, cent = cv2.connectedComponentsWithStats(
        ((r-g > 100) & (r-b > 100)).astype('uint8'), connectivity=4)
    return np.array([(round(x+x0, 2), round(y+y0, 2))
                     for (_, _, w, h, area), (x, y) in zip(st[1:], cent[1:])
                     if 15 <= area <= 200 and 4 <= w <= 15 and 4 <= h <= 15])

def groups(pts, radius=25):
    remaining = set(range(len(pts)))
    out = []
    while remaining:
        i = remaining.pop()
        queue, grp = [i], [i]
        while queue:
            j = queue.pop()
            candidates = [k for k in remaining if np.linalg.norm(pts[k]-pts[j]) <= radius]
            remaining.difference_update(candidates)
            queue.extend(candidates)
            grp.extend(candidates)
        out.append(pts[grp])
    return out

def order(points):
    bands = []
    for p in points[points[:, 0].argsort()]:
        if not bands or abs(p[0]-np.mean(np.array(bands[-1])[:, 0])) > 3:
            bands.append([p])
        else:
            bands[-1].append(p)
    return np.vstack([np.array(b)[np.array(b)[:, 1].argsort()] for b in bands])

def norm(p):
    return order(p)-np.mean(p, axis=0)

def errors(p, q):
    d = np.linalg.norm(norm(p)-norm(q), axis=1)
    return float(max(d)), float(np.sqrt(np.mean(d*d)))

t13 = comps(74, (1135, 925, 1185, 1030))
t10 = comps(73, (1030, 1050, 1110, 1160))
t23 = comps(74, (1635, 1730, 1720, 1830))
assert [len(t13), len(t10), len(t23)] == [13, 10, 23]
for n, nt in [(17, 13), (19, 13), (53, 10), (55, 10), (66, 10), (3, 13), (5, 13)]:
    gs = groups(comps(n))
    tmpl = t13 if nt == 13 else t10
    found = [(np.round(g.mean(axis=0), 2).tolist(), *errors(g, tmpl))
             for g in gs if len(g) == nt]
    print('scan', n, 'count', nt, 'candidates', len(found), sorted(found, key=lambda f: f[1]))
    if n in (17, 19, 53, 55, 66):
        assert len(found) == 1 and found[0][1] <= 2
p = order(t23)
sub = np.concatenate([p[:4]+[15, 0], p[9:14], p[19:]-[15, 0]])
print('23->13', errors(sub, t13))
assert errors(sub, t13)[0] <= 2
