#!/usr/bin/env python3
"""Exclude TeX allrunes Type-1 faces against solved LP2 page 57.

The matcher is intentionally permissive: rune labels and aspect ratio are
ignored, and each observed rune may map to any distinct printable glyph slot.
"""
import argparse, io, json
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image, ImageFont
from scipy.optimize import linear_sum_assignment

BOX=96
LINES=[
 (1285,1464,885,"ᚹᛖ-ᛗᚢᛋᛏ-ᛋᚻᛖᛞ-ᚩᚢᚱ-ᚩᚹᚾ-ᚳ"),
 (1537,1652,885,"ᛁᚱᚳᚢᛗᚠᛖᚱᛖᚾᚳᛖᛋ.ᚠᛁᚾᛞ-ᚦ"),
 (1725,1840,590,"ᛖ-ᛞᛁᚢᛁᚾᛁᛏᚣ-ᚹᛁᚦᛁᚾ-ᚪᚾᛞ-ᛖᛗᛖᚱᚷᛖ."),
]
EXPECTED=[17,18,23]

def rune(c): return "\u16a0" <= c <= "\u16ff"

def crop(a):
    y,x=np.where(a>0)
    return None if not len(y) else a[y.min():y.max()+1,x.min():x.max()+1]

def box(a,n=BOX):
    im=Image.fromarray((a*255).astype(np.uint8)).resize((n,n),Image.Resampling.BILINEAR)
    return (np.asarray(im)>127).astype(np.uint8)

def dist(a,b):
    i=np.logical_and(a,b).sum(); u=np.logical_or(a,b).sum()
    return 1.0 if not u else 1.0-float(i)/float(u)

def comps(ink,y0,y1,x0,x1=1900):
    sub=ink[y0:y1,x0:x1]; xs=np.where(sub.sum(axis=0)>0)[0]+x0
    spans=[]
    if not len(xs): return spans
    s=p=int(xs[0])
    for xx in xs[1:]:
        x=int(xx)
        if x>p+1: spans.append((s,p)); s=x
        p=x
    spans.append((s,p))
    out=[]
    for l,r in spans:
        reg=sub[:,l-x0:r-x0+1]; ys,_=np.where(reg)
        if len(ys) and ys.max()-ys.min()+1>=100:
            out.append((l,r,int(ys.min())+y0,int(ys.max())+y0))
    return out

def observed(path):
    rgb=np.asarray(Image.open(path).convert("RGB"))
    assert rgb.shape[:2]==(3600,2400), rgb.shape
    ink=np.min(rgb,axis=2)<100
    occ=defaultdict(list); counts=[]
    for y0,y1,x0,text in LINES:
        rr=[c for c in text if rune(c)]
        cc=comps(ink,y0,y1,x0); counts.append(len(cc))
        assert len(cc)==len(rr)
        for c,(l,r,t,b) in zip(rr,cc):
            occ[c].append(ink[t:b+1,l:r+1].astype(np.uint8))
    assert counts==EXPECTED
    med={}
    for c,gg in occ.items():
        bb=[box(g) for g in gg]
        score=[sum(dist(bb[i],bb[j]) for j in range(len(bb))) for i in range(len(bb))]
        med[c]=gg[int(np.argmin(score))]
    assert len(med)==18
    return med,occ

def slots(path):
    f=ImageFont.truetype(str(path),200); out={}; seen=set()
    for cp in list(range(33,127))+list(range(160,256)):
        m=f.getmask(chr(cp),mode="L"); w,h=m.size
        if not w or not h: continue
        g=crop((np.asarray(m,dtype=np.uint8).reshape(h,w)>127).astype(np.uint8))
        if g is None or g.size<20: continue
        b=box(g); key=np.packbits(b).tobytes()
        if key in seen: continue
        seen.add(key); out[cp]=(g,b)
    return out

def assign(obs,bank):
    rr=list(obs); cp=list(bank)
    C=np.array([[dist(obs[r],bank[c][1]) for c in cp] for r in rr])
    i,j=linear_sum_assignment(C)
    return float(C[i,j].mean()),[
      {"rune":rr[a],"distance":round(float(C[a,b]),6),
       "slot_codepoint":cp[b],"slot_char":chr(cp[b])} for a,b in zip(i,j)]

def degrade(g):
    im=Image.fromarray(((1-g)*255).astype(np.uint8))
    s=114/g.shape[0]
    im=im.resize((max(1,int(round(g.shape[1]*s))),114),Image.Resampling.LANCZOS)
    buf=io.BytesIO(); im.convert("L").save(buf,"JPEG",quality=92); buf.seek(0)
    return crop((np.asarray(Image.open(buf).convert("L"))<128).astype(np.uint8))

def noise(occ):
    v=[]
    for gg in occ.values():
        bb=[box(g) for g in gg]
        v += [dist(bb[i],bb[j]) for i in range(len(bb)) for j in range(i+1,len(bb))]
    return {"pairs":len(v),"mean":round(float(np.mean(v)),6),
            "median":round(float(np.median(v)),6),
            "p95":round(float(np.percentile(v,95)),6),"max":round(float(np.max(v)),6)}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--image",default="resources/liber-primus/74.jpg")
    ap.add_argument("--font-dir",default="/usr/share/texlive/texmf-dist/fonts/type1/public/allrunes")
    ap.add_argument("--output",default="-")
    a=ap.parse_args()
    fonts=sorted(Path(a.font_dir).glob("*.pfb"))
    assert len(fonts)==216, f"expected 216 faces, found {len(fonts)}"
    obs,occ=observed(a.image); ob={r:box(g) for r,g in obs.items()}
    rank=[]; cache={}
    for p in fonts:
        b=slots(p); sc,mp=assign(ob,b); rank.append((sc,p.name,len(b),mp)); cache[p.name]=b
    rank.sort()
    sc,name,n,mp=rank[0]; best=cache[name]; clean=[b for _,b in best.values()]
    ctl=[min(dist(box(degrade(g)),b) for b in clean) for g,_ in best.values()]
    out={
      "test":"allrunes unordered Type-1 slot gate",
      "observed_classes":len(obs),"segmentation_line_counts":EXPECTED,
      "font_faces_tested":len(fonts),
      "matching_rule":"injective Hungarian assignment over distinct printable ASCII+Latin-1 slots; labels/aspect ignored",
      "lp2_repeat_noise":noise(occ),
      "best_face":{"font":name,"mean_iou_distance":round(sc,6),"distinct_slots":n,"mapping":mp},
      "best_face_render_jpeg_control":{"n_slots":len(ctl),
        "mean_nearest_iou_distance":round(float(np.mean(ctl)),6),
        "p95":round(float(np.percentile(ctl,95)),6),"max":round(float(np.max(ctl)),6)},
      "top_20":[{"font":nm,"mean_iou_distance":round(s,6),"distinct_slots":nn}
                for s,nm,nn,_ in rank[:20]],
      "verdict":"EXCLUDED: oracle slot match is far outside LP2 repeat noise and same-face JPEG control."
    }
    data=json.dumps(out,indent=2,ensure_ascii=False)+"\n"
    if a.output=="-": print(data,end="")
    else: Path(a.output).write_text(data,encoding="utf-8")

if __name__=="__main__": main()
