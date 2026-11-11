#!/usr/bin/env python3
"""Repair solved red-heading registration; compare unknown source-native red glyphs."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
J = json.loads((ROOT/"im-results/lp2-full-source-rune-assignment-audit.json").read_text(encoding="utf-8"))
REDS = J["red_positions"]
CTRL = J["controls"]["red_template_model"]["control_records"]
SHIFTS = [(3,0,16),(3,119,3),(15,9,11),(27,0,19),(33,91,8),(39,119,3),(54,0,9)]
DECORATIVE = {(0,0),(6,71),(8,0),(23,0),(33,0),(40,0)}
PHOTOS = {}

def photo(p):
    if p not in PHOTOS:
        PHOTOS[p] = np.asarray(Image.open(ROOT/"resources/liber-primus"/f"{p+17:02}.jpg").convert("RGB"))
    return PHOTOS[p]

def mask(p,b):
    x0,y0,x1,y1=b
    a=photo(p)[y0:y1+1,x0:x1+1].astype(np.float32)
    m=(a[:,:,0]>80)&(a[:,:,0]>1.45*a[:,:,1])&(a[:,:,0]>1.45*a[:,:,2])
    ys,xs=np.where(m)
    assert len(ys), (p,b)
    crop=np.uint8(m[ys.min():ys.max()+1,xs.min():xs.max()+1])*255
    return np.asarray(Image.fromarray(crop).resize((50,50),Image.Resampling.BOX))>128

def overlap(a,b):
    best=0.
    for dy in range(-2,3):
        for dx in range(-2,3):
            shifted=np.roll(b,(dy,dx),axis=(0,1))
            best=max(best,float(np.count_nonzero(a&shifted)/np.count_nonzero(a|shifted)))
    return best

by_ctrl={p:sorted((x for x in CTRL if x["page"]==p),key=lambda x:x["page_local_offset"]) for p in (56,57)}
assert [[x["expected"] for x in by_ctrl[p]] for p in (56,57)] == [
    ["AE","J","OE","S","R"],["P","A","R","A","B","L","E"]]
train=[]
for p,rows in by_ctrl.items():
    assert rows[-1]["p43_nearest"]=="I" and rows[-1]["box"][2]-rows[-1]["box"][0]<=10
    for i in range(len(rows)-1):
        assert rows[i]["p43_nearest"]==rows[i+1]["expected"],(p,i)
        train.append((p,rows[i+1]["expected"],mask(p,rows[i]["box"])))
classes={lab for _,lab,_ in train}
assert len(train)==10 and classes=={"J","OE","S","R","A","B","L","E"}
lookup={(r["page"],r["page_local_offset"]):r for r in REDS}
heldout=[]
for r in REDS:
    p,i=r["page"],r["page_local_offset"]
    if (p,i) in DECORATIVE:continue
    lab=r["expected"]
    shift=next((s for s in SHIFTS if p==s[0] and s[1]<=i<s[1]+s[2]),None)
    if shift:
        if i==shift[1]+shift[2]-1:continue
        lab=lookup[(p,i+1)]["expected"]
    elif p==0 and 8<=i<=12:
        if i in (8,12):continue
        lab=lookup[(p,i+1)]["expected"]
    if lab not in classes:continue
    glyph=mask(p,r["box"])
    best=max((overlap(glyph,t),l,src) for src,l,t in train)
    heldout.append((p,i,lab,best[1],round(best[0],6),best[2]))

assert len(heldout)==41
wrong=[r for r in heldout if r[2]!=r[3]]
assert [(r[0],r[1],r[2],r[3]) for r in wrong]==[(15,14,"B","R")],wrong
p53=[r for r in heldout if r[0]==53]
assert len(p53)==11 and all(r[2]==r[3] for r in p53)
print("Solved controls: raw 0/12, corrected ordinary 10/10; 2 decorative initials excluded")
print("Eight-class solved-red dictionary: original unknown source glyphs 40/41, p53 11/11")
print("Source-original by page:",sorted(Counter(r[0] for r in heldout).items()))
print("Visible original B on p15 misclassified by nearest solved red:",wrong)
