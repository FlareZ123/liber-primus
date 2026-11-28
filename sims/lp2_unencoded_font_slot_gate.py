#!/usr/bin/env python3
"""Oracle-slot gate for arbitrary TTF/OTF rune-font candidates.

Every distinct renderable cmap codepoint in a candidate face is allowed to stand
for any of the 18 observed solved-LP2 rune classes.  Rune labels, advance widths,
aspect ratios and keyboard mappings are deliberately ignored; the Hungarian
assignment asks only whether the face contains a one-to-one set of matching
shapes.
"""
import argparse, glob, io, json
from collections import defaultdict
from pathlib import Path

import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageFont
from scipy.optimize import linear_sum_assignment

BOX=96
LINES=[
 (1285,1464,885,"ᚹᛖ-ᛗᚢᛋᛏ-ᛋᚻᛖᛞ-ᚩᚢᚱ-ᚩᚹᚾ-ᚳ"),
 (1537,1652,885,"ᛁᚱᚳᚢᛗᚠᛖᚱᛖᚾᚳᛖᛋ.ᚠᛁᚾᛞ-ᚦ"),
 (1725,1840,590,"ᛖ-ᛞᛁᚢᛁᚾᛁᛏᚣ-ᚹᛁᚦᛁᚾ-ᚪᚾᛞ-ᛖᛗᛖᚱᚷᛖ."),
]
EXPECTED=[17,18,23]

def is_rune(c): return "\u16a0" <= c <= "\u16ff"

def crop(a):
    y,x=np.where(a>0)
    return None if not len(y) else a[y.min():y.max()+1,x.min():x.max()+1]

def to_box(a,n=BOX):
    im=Image.fromarray((a*255).astype(np.uint8)).resize((n,n),Image.Resampling.BILINEAR)
    return (np.asarray(im)>127).astype(np.uint8)

def dist(a,b):
    i=np.logical_and(a,b).sum(); u=np.logical_or(a,b).sum()
    return 1.0 if not u else 1.0-float(i)/float(u)

def comps(ink,y0,y1,x0,x1=1900):
    sub=ink[y0:y1,x0:x1]; xs=np.where(sub.sum(axis=0)>0)[0]+x0
    if not len(xs): return []
    spans=[]; s=p=int(xs[0])
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
        rr=[c for c in text if is_rune(c)]
        cc=comps(ink,y0,y1,x0); counts.append(len(cc))
        assert len(cc)==len(rr)
        for c,(l,r,t,b) in zip(rr,cc):
            occ[c].append(ink[t:b+1,l:r+1].astype(np.uint8))
    assert counts==EXPECTED
    med={}
    for c,gg in occ.items():
        bb=[to_box(g) for g in gg]
        score=[sum(dist(bb[i],bb[j]) for j in range(len(bb))) for i in range(len(bb))]
        med[c]=gg[int(np.argmin(score))]
    assert len(med)==18
    return med,occ

def names(path):
    t=TTFont(path,lazy=True)
    out={}
    for nid,key in [(1,"family"),(2,"subfamily"),(3,"unique"),(5,"version")]:
        vals=set()
        for n in t["name"].names:
            if n.nameID==nid:
                try: vals.add(n.toUnicode())
                except Exception: pass
        out[key]=sorted(vals)
    out["created_mac_epoch"]=int(t["head"].created)
    t.close()
    return out

def glyph_bank(path,size=300):
    t=TTFont(path,lazy=True); cps=set()
    for tab in t["cmap"].tables:
        if tab.isUnicode(): cps.update(tab.cmap)
    t.close()
    f=ImageFont.truetype(str(path),size)
    out={}; seen=set()
    for cp in sorted(cps):
        if cp>0x10ffff or chr(cp).isspace(): continue
        try: m=f.getmask(chr(cp),mode="L")
        except Exception: continue
        w,h=m.size
        if not w or not h: continue
        g=crop((np.asarray(m,dtype=np.uint8).reshape(h,w)>127).astype(np.uint8))
        if g is None or g.size<20: continue
        b=to_box(g); key=np.packbits(b).tobytes()
        if key in seen: continue
        seen.add(key); out[cp]=(g,b)
    return out

def assign(obs,bank):
    rr=list(obs); cp=list(bank)
    if len(cp)<len(rr): return None,[]
    C=np.array([[dist(obs[r],bank[c][1]) for c in cp] for r in rr])
    ii,jj=linear_sum_assignment(C)
    return float(C[ii,jj].mean()),[
      {"rune":rr[i],"slot_codepoint":cp[j],"slot_char":chr(cp[j]),
       "distance":round(float(C[i,j]),6)} for i,j in zip(ii,jj)]

def degrade(g):
    im=Image.fromarray(((1-g)*255).astype(np.uint8))
    s=114/g.shape[0]
    im=im.resize((max(1,int(round(g.shape[1]*s))),114),Image.Resampling.LANCZOS)
    buf=io.BytesIO(); im.convert("L").save(buf,"JPEG",quality=92); buf.seek(0)
    return crop((np.asarray(Image.open(buf).convert("L"))<128).astype(np.uint8))

def repeat_noise(occ):
    v=[]
    for gg in occ.values():
        bb=[to_box(g) for g in gg]
        v += [dist(bb[i],bb[j]) for i in range(len(bb)) for j in range(i+1,len(bb))]
    return {"pairs":len(v),"mean":round(float(np.mean(v)),6),
            "p95":round(float(np.percentile(v,95)),6),"max":round(float(np.max(v)),6)}

def expand(items):
    out=[]
    for x in items:
        h=glob.glob(x)
        out.extend(h if h else [x])
    return sorted(dict.fromkeys(out))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--image",default="resources/liber-primus/74.jpg")
    ap.add_argument("--font",action="append",required=True)
    ap.add_argument("--output",default="-")
    a=ap.parse_args()
    med,occ=observed(a.image); obs={r:to_box(g) for r,g in med.items()}
    rows=[]
    for p in expand(a.font):
        bank=glyph_bank(p)
        score,mapping=assign(obs,bank)
        control=[]
        for g,b in bank.values():
            control.append(min(dist(to_box(degrade(g)),bb) for _,bb in bank.values()))
        rows.append({"font":Path(p).name,"path":p,"metadata":names(p),
                     "distinct_rendered_cmap_slots":len(bank),
                     "mean_iou_distance":None if score is None else round(score,6),
                     "mapping":mapping,
                     "render_jpeg_control":None if not control else {
                        "mean_nearest_iou_distance":round(float(np.mean(control)),6),
                        "p95":round(float(np.percentile(control,95)),6),
                        "max":round(float(np.max(control)),6)}})
    rows.sort(key=lambda r: 9 if r["mean_iou_distance"] is None else r["mean_iou_distance"])
    payload={"test":"unencoded-font full-cmap injective oracle slot gate",
             "observed_classes":len(obs),"segmentation_line_counts":EXPECTED,
             "lp2_repeat_noise":repeat_noise(occ),"ranking":rows}
    data=json.dumps(payload,indent=2,ensure_ascii=False)+"\n"
    if a.output=="-": print(data,end="")
    else: Path(a.output).write_text(data,encoding="utf-8")

if __name__=="__main__": main()
