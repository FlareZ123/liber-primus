#!/usr/bin/env python3
"""LP2 T7 clean-line source-geometry predictor gate.

Uses only original page images, canonical transcription/corpus, the already frozen
clean-page detector and four predeclared compositor features.  No plaintext,
language score, key, or post-hoc feature threshold enters the test.
"""
from __future__ import annotations
import json, math
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CORPUS = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
TRANSCRIPTION = (ROOT / "resources/lp2-transcription.txt").read_text(encoding="utf-8")
RUNES = set(CORPUS["runes"])
INDEX = {r:i for i,r in enumerate(CORPUS["runes"])}

CLEAN_EXPECTED = [4,5,9,10,11,12,13,16,17,18,19,20,21,24,25,26,28,29,30,31,41,42,43,44,45,46,47,48,52]
FEATURES = ("right_slack", "edge_outside4", "extra_lead", "left_dev")
SEED = 33012027
DRAWS = 100000

def image_path(p: int) -> Path:
    # Physical LP2 p0 is archive/resource 17.jpg.
    return ROOT / "resources/liber-primus" / f"{p+17:02d}.jpg"

def detect_rows(p: int):
    arr = np.asarray(Image.open(image_path(p)).convert("L"))
    y0,y1 = 450,3250
    x0,x1 = 720,1640
    dark = (arr[y0:y1,x0:x1] < 135).sum(axis=1)
    ys = np.where(dark > 35)[0] + y0
    bands=[]
    if len(ys):
        s=prev=int(ys[0])
        for yy in ys[1:]:
            yy=int(yy)
            if yy-prev <= 25:
                prev=yy
            else:
                bands.append((s,prev)); s=prev=yy
        bands.append((s,prev))
    rows=[]
    for a,b in bands:
        xx0,xx1=590,1830
        cnt=(arr[a:b+1,xx0:xx1] < 135).sum(axis=0)
        xs=np.where(cnt >= 3)[0] + xx0
        if len(xs):
            rows.append({
                "y0":a, "y1":b, "height":b-a+1,
                "left":int(xs.min()), "right":int(xs.max()),
                "center":(a+b)/2.0,
            })
    return rows

def source_page_lines():
    records = TRANSCRIPTION.split("%")[:55]
    out={}
    for rec,rawpage in enumerate(records):
        p=rec if rec < 50 else rec+1
        lines=[]
        for rawline in rawpage.split("/"):
            a=[INDEX[ch] for ch in rawline if ch in RUNES]
            if a: lines.append(a)
        out[p]=lines
    return out

src=source_page_lines()
geom={}
clean=[]
for p in range(56):
    if p==50: continue
    rows=detect_rows(p)
    is_clean=(len(rows)==12 and
              all(109 <= r["height"] <= 117 for r in rows) and
              all(597 <= r["left"] <= 608 for r in rows))
    if is_clean:
        clean.append(p)
        geom[p]=rows
assert clean == CLEAN_EXPECTED, clean

records=[]
event_total=0
opp_total=0
for p in clean:
    lines=src[p]
    assert len(lines)==12
    centers=[r["center"] for r in geom[p]]
    for l,a in enumerate(lines):
        opp=max(0,len(a)-1)
        ev=sum(a[i]==a[i+1] for i in range(len(a)-1))
        if l+1 < len(lines):
            opp += 1
            ev += int(a[-1] == lines[l+1][0])
        r=geom[p][l]
        pitch=None if l==0 else centers[l]-centers[l-1]
        rec={
            "page":p, "line":l, "op":opp, "ev":ev,
            "right_slack":1792-r["right"],
            "edge_outside4":int(abs(1792-r["right"]) > 4),
            "extra_lead":int(pitch is not None and pitch > 210),
            "left_dev":abs(r["left"]-601),
        }
        records.append(rec)
        event_total += ev
        opp_total += opp

assert event_total == 50
assert opp_total == 7771

observed={f:sum(r["ev"]*r[f] for r in records) for f in FEATURES}
page_arrays={}
page_k={}
for p in clean:
    rr=[r for r in records if r["page"]==p]
    page_k[p]=sum(r["ev"] for r in rr)
    page_arrays[p]={}
    for f in FEATURES:
        values=[]
        for r in rr:
            values.extend([r[f]]*r["op"])
        page_arrays[p][f]=np.asarray(values,dtype=float)

rng=np.random.default_rng(SEED)
sims={f:np.empty(DRAWS,dtype=float) for f in FEATURES}
for z in range(DRAWS):
    totals={f:0.0 for f in FEATURES}
    for p in clean:
        k=page_k[p]
        if not k: continue
        n=len(page_arrays[p][FEATURES[0]])
        ids=rng.choice(n,size=k,replace=False)
        for f in FEATURES:
            totals[f] += page_arrays[p][f][ids].sum()
    for f in FEATURES:
        sims[f][z]=totals[f]

summary={}
means={}
sds={}
for f in FEATURES:
    a=sims[f]
    mean=float(a.mean())
    sd=float(a.std(ddof=1))
    z=(observed[f]-mean)/sd
    p=(int(np.sum(np.abs(a-mean) >= abs(observed[f]-mean)))+1)/(DRAWS+1)
    means[f]=mean; sds[f]=sd
    summary[f]={
        "observed":observed[f], "null_mean":mean, "null_sd":sd,
        "z":z, "two_sided_p":p,
    }

obsmax=max(abs((observed[f]-means[f])/sds[f]) for f in FEATURES)
nullmax=np.max(np.vstack([np.abs((sims[f]-means[f])/sds[f]) for f in FEATURES]),axis=0)
family_p=(int(np.sum(nullmax >= obsmax))+1)/(DRAWS+1)

result={
    "status":"PASS bounded source-geometry predictor gate",
    "clean_pages":clean,
    "clean_lines":len(records),
    "pair_opportunities":opp_total,
    "doublet_events":event_total,
    "draws":DRAWS,
    "seed":SEED,
    "features":summary,
    "max_abs_z":obsmax,
    "familywise_max_abs_z_p":family_p,
    "conclusion":"Frozen ordinary compositor geometry does not predict the doublet line occupancy on the 29 clean original pages.",
}
print(json.dumps(result,indent=2))
