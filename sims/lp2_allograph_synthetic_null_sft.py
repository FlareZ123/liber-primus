#!/usr/bin/env python3
"""Source-compatible no-message control for LP2 same-rune outline splits."""
import argparse, io, json
from collections import defaultdict
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "resources" / "liber-primus"
CORPUS = json.loads((SRC / "lp2-corpus.json").read_text(encoding="utf-8"))
TRANS = CORPUS["translit"]
PAGES = (29, 34, 35, 47, 52, 55)
H, W = 72, 60
SEED = 0x74220261113


def load(page):
    im = Image.open(SRC / f"{page+17:02d}.jpg")
    return np.asarray(im.convert("L")), im.quantization[0]


def extract(page):
    gray, _ = load(page)
    x0, x1, y0, y1 = 530, 1880, 470, 3190
    ink = gray[y0:y1, x0:x1] < 110
    ys = np.flatnonzero(ink.sum(1) >= 18)
    bands = np.split(ys, np.flatnonzero(np.diff(ys) > 20)+1)
    out = []
    for band in bands:
        if len(band) <= 40 or band[-1]-band[0] < 40:
            continue
        line = ink[int(band[0]):int(band[-1])+1]
        xs = np.flatnonzero(line.sum(0) >= 2)
        for run in np.split(xs, np.flatnonzero(np.diff(xs) > 1)+1):
            if not len(run):
                continue
            left, right = int(run[0]), int(run[-1])+1
            pts = np.argwhere(line[:, left:right])
            if len(pts) < 100 or np.ptp(pts[:,0]) < 32:
                continue
            if not (595 <= left+x0 <= 1800 and np.ptp(pts[:,0])+1 >= 70):
                continue
            crop = line[:, left:right]
            rr, cc = np.where(crop)
            glyph = crop[rr.min():rr.max()+1, cc.min():cc.max()+1]
            if page == 55 and (glyph.shape[0] < 110 or glyph.shape[1] > 90):
                continue
            box = (x0+left+int(cc.min()), y0+int(band[0])+int(rr.min()),
                   int(glyph.shape[1]), int(glyph.shape[0]))
            out.append((glyph, box))
    labels = CORPUS["pages"][page]["indices"]
    assert len(out) == len(labels), (page, len(out), len(labels))
    return out, labels


def extract_p57_black():
    rgb = np.asarray(Image.open(SRC / "74.jpg").convert("RGB"))
    gray = np.asarray(Image.open(SRC / "74.jpg").convert("L"))
    black = (rgb[:,:,0] < 110) & (rgb[:,:,1] < 110) & (rgb[:,:,2] < 110)
    proj = (gray[:,595:1800] < 160).sum(1)
    centers, _ = find_peaks(gaussian_filter1d(proj.astype(float),5), prominence=40, distance=100)
    centers = [int(c) for c in centers if 450 < c < 1700][:4]
    assert centers == [944,1132,1378,1569], centers
    out, counts = [], []
    for c in centers:
        y0, y1 = c-60, c+65
        ink = black[y0:y1,870:1880]
        xs = np.flatnonzero(ink.sum(0) >= 2)
        row = []
        for run in np.split(xs,np.flatnonzero(np.diff(xs)>1)+1):
            if not len(run):
                continue
            l,r = int(run[0]),int(run[-1])+1
            pts = np.argwhere(ink[:,l:r])
            if len(pts)<100 or np.ptp(pts[:,0])<32 or np.ptp(pts[:,0])+1<70:
                continue
            crop=ink[:,l:r]; rr,cc=np.where(crop)
            glyph=crop[rr.min():rr.max()+1,cc.min():cc.max()+1]
            box=(870+l+int(cc.min()),y0+int(rr.min()),int(glyph.shape[1]),int(glyph.shape[0]))
            row.append((glyph,box))
        counts.append(len(row)); out.extend(row)
    labels=CORPUS["pages"][57]["indices"]
    black_labels=labels[7:20]+labels[20:37]+labels[37:54]+labels[54:72]
    assert counts==[13,17,17,18] and len(out)==len(black_labels)==65
    return out,black_labels


def normalize(mask):
    ys,xs=np.where(mask)
    if not len(ys): raise ValueError("empty glyph")
    crop=mask[ys.min():ys.max()+1,xs.min():xs.max()+1].astype(np.uint8)*255
    h,w=crop.shape; nw=max(1,round(w*H/h))
    if nw>W: nw=W; nh=max(1,round(h*W/w))
    else: nh=H
    interp=cv2.INTER_AREA if nh<h or nw<w else cv2.INTER_CUBIC
    resized=cv2.resize(crop,(nw,nh),interpolation=interp)>=127
    out=np.zeros((H,W),bool); y=(H-nh)//2; x=(W-nw)//2
    out[y:y+nh,x:x+nw]=resized
    return out


def patch_score(items):
    n=len(items)
    if n<12 or len({p for _,p,_ in items})<3:
        return {"n":n,"score":0.0,"eligible":False}
    patch=stride=6
    positions=[(y,x) for y in range(0,H-patch+1,stride) for x in range(0,W-patch+1,stride)]
    masks=np.stack([m for _,_,m in items]).astype(np.uint8)
    win=np.lib.stride_tricks.sliding_window_view(masks,(patch,patch),axis=(1,2))
    mat=win[:,::stride,::stride].sum(axis=(-1,-2)).reshape(n,-1).astype(np.float32)/(patch*patch)
    pages=np.asarray([p for _,p,_ in items],dtype=np.int16)
    msize=max(4,int(np.ceil(.15*n))); best={"n":n,"score":0.0,"eligible":False}
    for col,(y,x) in enumerate(positions):
        order=np.argsort(mat[:,col],kind="stable"); vals=mat[order,col]; gaps=np.diff(vals)
        if len(gaps)<2*msize-1: continue
        valid=np.arange(msize-1,n-msize); k=int(valid[np.argmax(gaps[valid])])+1
        gap=float(gaps[k-1])
        if gap<=0: continue
        a,b=order[:k],order[k:]
        pa,pb=sorted(set(map(int,pages[a]))),sorted(set(map(int,pages[b])))
        if len(pa)<2 or len(pb)<2: continue
        effect=abs(float(vals[k:].mean()-vals[:k].mean()))
        balance=2*min(k,n-k)/n; score=effect*balance*gap
        if score>best["score"]:
            best={"n":n,"score":score,"effect":effect,"adjacent_gap":gap,
                  "balance":balance,"sizes":[int(k),int(n-k)],"pages":[pa,pb],
                  "patch_xy":[int(x),int(y)],"patch_size":patch,"eligible":True}
    return best


def score_dataset(samples):
    groups=defaultdict(list)
    for label,page,mask in samples: groups[int(label)].append((int(label),int(page),mask))
    rows=[]
    for label in range(29):
        r=patch_score(groups[label]); r.update(rune_index=label,rune=TRANS[label]); rows.append(r)
    rows.sort(key=lambda x:x["score"],reverse=True)
    return {"max_score":rows[0]["score"],"top":rows[:8],"all":rows}


def original_samples():
    samples=[]; targets={}; red_count=0
    for page in PAGES:
        glyphs,labels=extract(page)
        rgb=np.asarray(Image.open(SRC/f"{page+17:02d}.jpg").convert("RGB")).astype(np.int16)
        for _,(x,y,w,h) in glyphs:
            c=rgb[y:y+h,x:x+w]
            red=(c[:,:,0]>100)&(c[:,:,0]>c[:,:,1]+40)&(c[:,:,0]>c[:,:,2]+40)
            red_count+=int(red.sum())
        targets[page]=(glyphs,labels)
        samples.extend((int(label),page,normalize(g)) for (g,_),label in zip(glyphs,labels))
    assert red_count==0
    return samples,targets,red_count


def prototype_pool():
    pool=defaultdict(list); p43,l43=extract(43); p57,l57=extract_p57_black()
    for (g,_),label in list(zip(p43,l43))+list(zip(p57,l57)):
        pool[int(label)].append(g.astype(np.uint8))
    assert len(p43)==274 and len(p57)==65 and len(pool)==29
    return pool,{"p43":274,"p57_black":65,"p57_total_known":95,"p57_black_classes":len(set(l57))}


def jpeg_roundtrip(gray,qtable):
    b=io.BytesIO(); Image.fromarray(gray.astype(np.uint8),mode="L").save(b,format="JPEG",qtables=[qtable],optimize=False)
    b.seek(0); im=Image.open(b); assert im.quantization[0]==qtable
    return np.asarray(im.convert("L"))


def synthetic_samples(rng,targets,pool,plant=False,mixed=False):
    samples=[]; planted=0
    canonical={i:pool[i][int(rng.integers(0,len(pool[i])))] for i in range(29)}
    for page in PAGES:
        glyphs,labels=targets[page]; gray,qt=load(page)
        xs=[b[0] for _,b in glyphs]; ys=[b[1] for _,b in glyphs]
        xe=[b[0]+b[2] for _,b in glyphs]; ye=[b[1]+b[3] for _,b in glyphs]
        ox,oy=max(0,min(xs)-8),max(0,min(ys)-8)
        ex,ey=min(gray.shape[1],max(xe)+8),min(gray.shape[0],max(ye)+8)
        canvas=gray[oy:ey,ox:ex].copy()
        for _,(x,y,w,h) in glyphs: canvas[y-oy:y-oy+h,x-ox:x-ox+w]=255
        rendered=[]
        for offset,((_,box),label) in enumerate(zip(glyphs,labels)):
            x,y,w,h=box; x-=ox; y-=oy
            src=(pool[int(label)][int(rng.integers(0,len(pool[int(label)])))] if mixed else canonical[int(label)])
            interp=cv2.INTER_AREA if h<src.shape[0] or w<src.shape[1] else cv2.INTER_CUBIC
            mask=cv2.resize(src*255,(w,h),interpolation=interp)>=127
            z=rng.random()
            if z<.10: mask=cv2.dilate(mask.astype(np.uint8),np.ones((3,3),np.uint8),iterations=1)>0
            elif z<.20: mask=cv2.erode(mask.astype(np.uint8),np.ones((3,3),np.uint8),iterations=1)>0
            dx,dy=int(rng.integers(-1,2)),int(rng.integers(-1,2)); shifted=np.zeros_like(mask)
            sy0,sy1=max(0,-dy),min(h,h-dy); sx0,sx1=max(0,-dx),min(w,w-dx)
            shifted[sy0+dy:sy1+dy,sx0+dx:sx1+dx]=mask[sy0:sy1,sx0:sx1]
            if plant and int(label)==16 and (page*101+offset)%2==0:
                shifted[:min(h,20),max(0,w-20):w]=True; planted+=1
            canvas[y:y+h,x:x+w]=np.where(shifted,0,255)
            rendered.append((int(label),page,(x,y,w,h)))
        decoded=jpeg_roundtrip(canvas,qt)
        for label,p,(x,y,w,h) in rendered:
            samples.append((label,p,normalize(decoded[y:y+h,x:x+w]<110)))
    return samples,planted


def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--null-reps",type=int,default=100)
    ap.add_argument("--plant-reps",type=int,default=20); ap.add_argument("--seed",type=lambda x:int(x,0),default=SEED)
    a=ap.parse_args(); assert len(CORPUS["pages"])==58 and len(CORPUS["pages"][57]["indices"])==95
    q92=None
    for p in (43,*PAGES,57):
        _,q=load(p); q92=q if q92 is None else q92; assert q==q92,p
    b=io.BytesIO(); Image.new("L",(8,8),255).save(b,format="JPEG",quality=92); b.seek(0)
    assert Image.open(b).quantization[0]==q92
    actual,targets,red=original_samples(); pool,srcinfo=prototype_pool()
    classes=sorted({x[0] for x in actual}); assert classes==list(range(29))
    observed=score_dataset(actual); rng=np.random.default_rng(a.seed); canon=[]; mixed=[]
    for _ in range(a.null_reps):
        s,n=synthetic_samples(rng,targets,pool,mixed=False); assert n==0 and len(s)==len(actual)
        canon.append(score_dataset(s)["max_score"])
        s,n=synthetic_samples(rng,targets,pool,mixed=True); assert n==0 and len(s)==len(actual)
        mixed.append(score_dataset(s)["max_score"])
    planted_scores=[]; planted_counts=[]
    for _ in range(a.plant_reps):
        s,n=synthetic_samples(rng,targets,pool,plant=True); assert n>0 and len(s)==len(actual)
        planted_scores.append(score_dataset(s)["max_score"]); planted_counts.append(n)
    def summary(v):
        e=int(np.count_nonzero(v>=observed["max_score"]))
        return {"min":float(np.min(v)),"median":float(np.median(v)),"q95":float(np.quantile(v,.95)),
                "q99":float(np.quantile(v,.99)),"max":float(np.max(v)),"exceedances_ge_observed":e,
                "familywise_p_plus_one":(e+1)/(len(v)+1)}
    csum,msum=summary(np.asarray(canon)),summary(np.asarray(mixed)); ps=np.asarray(planted_scores)
    report={"source":"original Stage11 LP2 JPEGs, physical pages 29,34,35,43,47,52,55,57",
      "registration":{"unknown_target_pages":list(PAGES),"target_glyphs":len(actual),"target_rune_classes":len(classes),
        "target_counts":{str(p):len(targets[p][0]) for p in PAGES},"reference_page":43,"reference_glyphs":274,
        "solved_p57_known_plaintext":95,"solved_p57_black_source_labeled_prototypes":srcinfo["p57_black"],
        "p57_red_initial_and_final_line_excluded":True,"p57_black_classes":srcinfo["p57_black_classes"]},
      "image_controls":{"all_luma_quantization_tables_identical":True,"jpeg_quality":92,
        "target_box_positions_reused_in_synthetic_pages":True,"red_ink_stratified_out":True,
        "red_pixels_inside_target_glyph_boxes":red,"stroke_width_jitter":"independent 10% one-pixel dilation / 10% erosion",
        "position_jitter":"independent +/-1 pixel before Q92 recompression",
        "normalization":f"aspect-preserving {H}x{W} binary masks; 6x6 local occupancy scan"},
      "decision_rule":{"detector":"scan 6x6 normalized outline patches at stride 6; split at largest adjacent occupancy gap",
        "minimum_cluster_size":"max(4, ceil(0.15*n))","replication":"both split sides on at least two target pages",
        "familywise_statistic":"maximum patch occupancy effect x split balance x adjacent gap across all 29 rune identities",
        "null_models":["one canonical source-native exemplar per rune per synthetic book","random same-rune source-native exemplar per glyph"],
        "null_replicates_per_model":a.null_reps,"positive_replicates":a.plant_reps,"seed":a.seed},
      "observed":observed,"null_max_score":{"canonical_prototype_model":csum,"mixed_source_exemplar_model":msum},
      "positive_control":{"planted_variant":"20x20 terminal-corner mark on alternating T glyphs across pages",
        "planted_glyphs_per_replicate":{"min":int(min(planted_counts)),"max":int(max(planted_counts))},
        "detected_at_canonical_null_q95":int(np.count_nonzero(ps>csum["q95"])),
        "detected_at_canonical_null_q99":int(np.count_nonzero(ps>csum["q99"])),
        "detected_at_mixed_null_q95":int(np.count_nonzero(ps>msum["q95"])),
        "detected_at_mixed_null_q99":int(np.count_nonzero(ps>msum["q99"])),
        "replicates":a.plant_reps,"scores":ps.round(6).tolist()},
      "conclusion":"Observed allograph score is below every source-compatible no-message replicate; the 20x20 positive control is detected. No discrete source-fixed intra-rune split is supported in this tested corpus." if observed["max_score"]<min(min(canon),min(mixed)) and np.all(ps>max(csum["q99"],msum["q99"])) else "Registered allograph gate inconclusive; inspect candidate and calibration before bitstream interpretation."}
    print(json.dumps(report,indent=2))

if __name__=="__main__": main()
