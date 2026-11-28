#!/usr/bin/env python3
"""Physical punctuation-dot topology in the original 58 LP2 JPEGs.

Usage: python sims/lp2_punctuation_dot_topology_original_sft.py
Requires opencv-python-headless, numpy, Pillow and scipy.
Returns exact original-image census and fixed-template residuals as JSON.
This excludes visible missing-dot/altered-layout channels, NOT subtle JPEG
coefficient, colorimetric, or antialiasing steganography.
"""
import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

R13 = [(15,0),(0,12),(30,12),(15,19.5),(0,29.5),(30,29.5),
       (15,38),(0,46.5),(30,46.5),(15,57.5),(0,63.5),(30,63.5),(15,76)]
R10 = [(15,0),(0,5.5),(30,5.5),(15,17.5),(0,26),(30,26),
       (15,34.5),(0,46),(30,46),(15,51.5)]
R23 = [(15,0),(45,0),(30,0),(0,12),(60,12),(15,19.1),
       (45,19.1),(30,19.1),(0,29),(60,29),(30,38),(15,38),
       (45,38),(0,46.5),(60,46.5),(45,57.1),(15,57.1),
       (30,57.1),(0,63.1),(60,63.1),(15,76),(45,76),(30,76)]
# Source-typed glyph shapes (not learned from other ciphertext).
REF = {13: [(x-15,y) for x,y in R13],
       10: [(x-15,y) for x,y in R10],
       23: [(x-15,y) for x,y in R23]}

def components(im, ink):
    a = im.astype(np.int16)
    if ink == 'red':
        mask = (a[:,:,0]-a[:,:,1]>80)&(a[:,:,0]-a[:,:,2]>80)&(a[:,:,0]>80)
    else:
        assert ink == 'black'
        mask = a.max(axis=2)<95
    n, _, stats, centers = cv2.connectedComponentsWithStats(
        mask.astype(np.uint8), connectivity=8)
    ids = np.asarray([j for j in range(1,n)
        if 25<=stats[j,cv2.CC_STAT_AREA]<=250
        and 5<=stats[j,cv2.CC_STAT_WIDTH]<=14
        and 5<=stats[j,cv2.CC_STAT_HEIGHT]<=14], dtype=int)
    return ids,stats,centers

def find_shapes(ids,stats,centers,im,typ,page,ink):
    if len(ids)<typ:return []
    pts=centers[ids]
    tree=cKDTree(pts)
    template=np.asarray(REF[typ],float)
    hits=[]
    for base in pts:
        distances, which=tree.query(base+template,k=1)
        if distances.max()>3.15 or len(set(which))!=typ:
            continue
        c=centers[ids[which]]
        offset=(c-template).mean(axis=0)
        error=np.linalg.norm(c-offset-template,axis=1)
        if error.max()>2:
            continue
        areas=[int(x) for x in stats[ids[which],cv2.CC_STAT_AREA]]
        intensity=[]
        for x,y in c:
            x,y=round(x),round(y)
            intensity.append(int(np.median(im[y-1:y+2,x-1:x+2,0])))
        hits.append(dict(page=page,ink=ink,typ=typ,
            offset=[round(float(z),2) for z in offset],
            meanRMS=round(float(np.sqrt(np.mean(error**2))),4),
            maxError=round(float(error.max()),4),
            area=areas,centerR=intensity))
    # Dedupe equivalent anchors (the top of the 23-dot compound has three dots).
    uniq={}
    for hit in hits:
        key=(round(hit['offset'][0]),round(hit['offset'][1]))
        if key not in uniq or uniq[key]['maxError']>hit['maxError']:
            uniq[key]=hit
    return list(uniq.values())

def run(images,ink):
    data=json.loads(ink.read_text(encoding='utf8'))
    expected=defaultdict(Counter)
    for p in data['pages']:
        for _,typ,color in p.get('large_punctuation',[]):
            expected[p['page']][(typ,color)]+=1
    found=[]
    # Blindly enumerate every source scan, both visible ink classes and all
    # three learned glyph geometries. Compare to the separately derived
    # transcription only AFTER detection; a missing/extra ornament fails.
    for page in range(58):
        img=np.asarray(Image.open(images/f'{page+17:02d}.jpg').convert('RGB'))
        for color in ('red','black'):
            ids,stats,centers=components(img,color)
            for typ in (10,13,23):
                hits=find_shapes(ids,stats,centers,img,typ,page,color)
                assert len(hits)==expected[page][(typ,color)], (
                    page,typ,color,len(hits),expected[page][(typ,color)])
                found.extend(hits)
    counts=Counter((h['typ'],h['ink']) for h in found)
    assert counts=={(13,'red'):30,(10,'red'):4,(13,'black'):1,(23,'red'):1}
    unsolved=[h for h in found if h['page']<56]
    assert len(unsolved)==31 and sum(h['typ'] for h in unsolved)==394
    reds=[r for h in found if h['ink']=='red' for r in h['centerR']]
    return {
      'source':'Original LP2 scanned JPEG 17.jpg..74.jpg; source image count 58',
      'source_annotations':'resources/liber-primus/lp2-ink-annotations.json',
      'glyphs':{f'{typ}-{color}':v for (typ,color),v in sorted(counts.items())},
      'bookOriginalPhysicalDots':sum(h['typ'] for h in found),
      'unsolved0to55Marks':len(unsolved),
      'unsolved0to55PhysicalDots':sum(h['typ'] for h in unsolved),
      'glyphsFailingTemplate':0,
      'maxFittedDotErrorPx':round(float(max(h['maxError'] for h in found)),4),
      'centerRedChannel':{'samples':len(reds),'mean':round(float(np.mean(reds)),3),
        'sd':round(float(np.std(reds)),3),'min':min(reds),'max':max(reds)},
      'negativeScope':'No dot missing/reordered/relocated beyond observed subpixel geometry; no claim about subtle per-pixel intensities, JPEG DCT or keys.',
      'positions':[{'page':h['page'],'type':h['typ'],'ink':h['ink'],
        'x':h['offset'][0],'y':h['offset'][1],
        'maxErrorPx':h['maxError']} for h in sorted(found,key=lambda h:(h['page'],h['offset'][1],h['offset'][0]))]
    }

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--images',type=Path,default=Path('resources/liber-primus'))
    p.add_argument('--ink',type=Path,default=Path('resources/liber-primus/lp2-ink-annotations.json'))
    a=p.parse_args()
    print(json.dumps(run(a.images,a.ink),indent=2))
