"""Raster recheck of two residual line wraps; Python 3, numpy, Pillow.
Usage: python lp2_vine_residual_exact_glyph_spacing_sft.py liber-primus-jpegs.zip
All coordinates are original-resolution half-open pixel intervals.
"""
from collections import Counter
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
import json
import sys
import numpy as np
from PIL import Image


def runs(mask):
    return np.flatnonzero(np.diff(np.r_[False, mask, False])).reshape(-1, 2)


def getrows(archive, p, threshold):
    suffix = f'/{p+17:02}.jpg'
    name = next(n for n in archive.namelist() if ('/' + n).endswith(suffix))
    a = np.asarray(Image.open(BytesIO(archive.read(name))).convert('RGB'))
    assert a.shape == (3600, 2400, 3)
    g = a.max(2) < threshold
    out = []
    for y, y2 in runs(g[:, 600:1805].sum(1) > 20):
        if y2-y <= 30:
            continue
        xs = runs(g[y:y2, 590:1810].any(0)) + 590
        out.append([(int(l), int(r), g[y:y2,l:r]) for l,r in xs])
    return out


def norm(a):
    return np.asarray(Image.fromarray(a).resize((64,128), Image.Resampling.NEAREST), dtype=bool)


def sim(a,b):
    if abs(a.shape[1]-b.shape[1]) > 2 or abs(a.shape[0]-b.shape[0]) > 2:
        return 0
    a,b = norm(a),norm(b)
    return (a&b).sum()/(a|b).sum()


def analyze(archive, threshold):
    rows = {p:getrows(archive,p,threshold) for p in range(40,49)}
    results = []
    for p,j in [(40,8),(42,5)]:
        last = rows[p][j][-1]
        following = rows[p][j+1][0]
        pairs = []
        for pp,rs in rows.items():
            for jj,row in enumerate(rs):
                for k,(left,right,glyph) in enumerate(row[:-1]):
                    l2,r2,g2 = row[k+1]
                    if sim(last[2],glyph)>=.9 and sim(following[2],g2)>=.9:
                        pairs.append((pp,jj,k,l2-right))
        width = following[1]-following[0]
        results.append(dict(page=p,line=j,last_ink=list(last[:2]),next_ink=list(following[:2]),pairs=pairs,appended_ink_ends=sorted(set(last[1]+gap+width for _,_,_,gap in pairs))))
    if threshold==140:
        F=rows[40][9][0][2]
        starts=[r[0] for rs in rows.values() for r in rs if r and r[0][0] in range(597,604)]
        right=[]
        for rs in rows.values():
            for row in rs:
                for k,(_,r,g) in enumerate(row[:-1]):
                    l2,_,g2=row[k+1]
                    if sim(F,g)<.9:continue
                    matches=[(a-600,sim(g2,h)) for a,b,h in starts if sim(g2,h)>.9]
                    if not matches:continue
                    maxsim=max(s for _,s in matches)
                    left=Counter(l for l,s in matches if s>=maxsim-.005).most_common(1)[0][0]
                    right.append(l2-r-left)
        results[0]['estimated_F_right_bearings'] = dict(Counter(right))
    return results


with ZipFile(Path(sys.argv[1])) as archive:
    results={t:analyze(archive,t) for t in (100,140,180)}
for t,res in results.items():
    assert res[0]['appended_ink_ends']==[1798],res
    assert res[1]['appended_ink_ends']==[1839],res
assert results[140][0]['estimated_F_right_bearings']=={2:31,3:56,4:7}
print(json.dumps(results,indent=2))
