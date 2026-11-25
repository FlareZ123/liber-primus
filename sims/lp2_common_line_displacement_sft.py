#!/usr/bin/env python3
"""Issue #2751: fixed-grid whole-line translation; original archive or directory.
Requires numpy, Pillow, OpenCV. No original file modified.
"""
import argparse, io, json, zipfile
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

RUNES='ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
P0=['ᛋᛈᛏᚠᛈᚢᛝᚣᛝᛉᛡ-ᚣᚻ-ᛒᚢ-ᚷᚩᛈ-ᛝᚫᚦ-ᛁ/', 'ᚫᚻᛉᚦᛈᚷ-ᚣᚠᛝᚳᛄ-ᚦᚪᛗᛁᛝᛁᛡᚣ-ᚻᛇ-ᛏᚻᚫ/', 'ᛡ-ᛉᚣ-ᛖᚢᛝ-ᚳᚠᚾ-ᛇᚦᛄᛁᚦ-ᚦᛈ-ᚣᛝᛠ-ᚣᚾ/', 'ᛖᚣ-ᛞᛉᛝᚹ-ᛒᚳᛉᛞᛒᚠ-ᛗᛏᚾᛖ-ᛠᛄᚾᛚᚷ/', 'ᛒ-ᛉᚷᚦ.ᚣᛁᛞᚪ-ᛝᚷᛗᛄᚱᚩᛚᛇ-ᚣᛏᛈᛁᚦᛞᛄ-/', 'ᛟᚻᛚ-ᛠ-ᚠᛉᚫᛈᚷᛉ-ᚠᛚᚹᛇᛏᚫ-ᚠᚷᚾ-ᛗᛇᛚᚾ-/', 'ᛝᛗᚠᚱᛡ-ᚪᛋ-ᛠᛗᛝᛉᛉᛇᛞᛒ-ᛟᛞᛗᚩ-ᛠ/', 'ᛇᚻ-ᛞᛝᚷ-ᛟᛝᛚᚢᚱᚾᛏ-ᚫᛋᚣᚢᚻᚱᛏ-ᚻᚳ-ᛋᛟ/', 'ᛏᛟᛝᚢᚱ-ᛋ-ᚠᚩᛖᚹᛠᛟᛚᚠᚫ-ᛗᚱᛝ-ᛞᚪᛗᚱ-ᚹ/']
PAGES=[1,5,9,11,12,13,16,17,18,19,20,24,25,26,28,29,30,31,34,44,45,46,47,48,52]
# Fixed geometry from source-seven-page baseline SFT; no held-out refit.
def nominal(r): return 673+188*r+(r+1)//3

def segments(g,y,hi=1810,lo=590):
    ink=g[y-10:y+125,lo:hi]<155
    cols=np.flatnonzero(ink.sum(axis=0)>=2)
    out=[]
    for c in np.split(cols,np.where(np.diff(cols)>1)[0]+1):
        if not len(c):continue
        rows=np.flatnonzero(ink[:,c].any(axis=1))
        if len(rows) and 93<=rows[-1]-rows[0]+1<=125 and len(c)<=92:out.append((lo+int(c[0]),lo+int(c[-1])))
    return out

def feature(g,y,a,b):
    ink=(g[y-10:y+125,a:b+1]<155).astype(np.float32)
    active=np.flatnonzero(np.any(ink,axis=1));ink=ink[active[0]:active[-1]+1]
    f=cv2.resize(ink,(48,96),interpolation=cv2.INTER_LINEAR).ravel();return f/np.linalg.norm(f)

def centroid(g,y,a,b):
    # Dark-ink mass with weak background/antialias contribution clipped.
    v=np.maximum(0,230-g[y-12:y+132,a:b+1].astype(float)).sum(1)
    return float(np.dot(v,np.arange(-12,132))/v.sum())

def read_source(path):
    if path.is_dir():return lambda n:np.array(Image.open(path/f'{n:02}.jpg').convert('L'))
    z=zipfile.ZipFile(path);names={Path(n).name:n for n in z.namelist() if n.endswith('.jpg')}
    return lambda n:np.array(Image.open(io.BytesIO(z.read(names[f'{n:02}.jpg']))).convert('L'))

def q92(g):
    ok,b=cv2.imencode('.jpg',g,[cv2.IMWRITE_JPEG_QUALITY,92]);assert ok
    return cv2.imdecode(b,cv2.IMREAD_GRAYSCALE)

def summarize(a):
    a=np.asarray(a);return {'n':len(a),'mean':float(a.mean()),'sd':float(a.std()),'median':float(np.median(a)), 'abs_quantiles':np.quantile(abs(a),[.5,.9,.95,.99,1]).tolist(), 'above':{str(t):int(np.sum(abs(a)>=t)) for t in (.0625,.125,.25,.5,1)}}

def main():
    pa=argparse.ArgumentParser();pa.add_argument('source',type=Path);pa.add_argument('--output',type=Path,required=True);args=pa.parse_args();read=read_source(args.source)
    p0=read(17);fs=[];ls=[]
    # p0 source labels from Agent2 subpixel SFT. Use its original segment rule for labels.
    for y,s in zip([1234,1422,1610,1798,1986,2174,2362,2550,2738],P0):
        ink=p0[y:y+118,600:2100]<150;cols=np.flatnonzero(ink.sum(axis=0)>=7);seg=[]
        for c in np.split(cols,np.where(np.diff(cols)>1)[0]+1):
            if len(c) and len(c)<=92 and np.count_nonzero(ink[:,c].any(axis=1))>=100:seg.append((int(c[0])+600,int(c[-1])+600))
        keys=[RUNES.index(c) for c in s if c in RUNES];assert len(seg)==len(keys),(y,len(seg),len(keys))
        for (a,b),k in zip(seg,keys):fs.append(feature(p0,y,a,b));ls.append(k)
    fs=np.stack(fs);ls=np.array(ls);assert set(ls)==set(range(29));proto=np.stack([fs[ls==k].mean(0) for k in range(29)]);proto/=np.linalg.norm(proto,axis=1,keepdims=True)
    def records(g,y):
        seg=segments(g,y);out=[]
        for a,b in seg:
            sims=proto@feature(g,y,a,b);k=int(sims.argmax())
            if sims[k]>=.88:out.append((a,b,k,centroid(g,y,a,b)))
        return out
    # Ordinary pages only: exact frozen 25-page set from Agent47.
    lines={};images={}
    for p in PAGES:
        g=read(p+17);images[p]=g
        for r in range(12):
            rec=records(g,nominal(r));assert len(rec)>=8,(p,r,len(rec));lines[p,r]=rec
    # Fit glyph-specific offsets and row phase on development pages only.
    train=[(r,k,v) for (p,r),rec in lines.items() if p<40 for a,b,k,v in rec]
    offsets=np.empty((29,3))
    for k in range(29):
        for phase in range(3):
            values=[v for r,j,v in train if j==k and r%3==phase];assert len(values)>=3,(k,phase,len(values));offsets[k,phase]=np.median(values)
    def estimate(rec,r):return float(np.median([v-offsets[k,r%3] for a,b,k,v in rec]))
    def from_fixed(g,r,rec):return estimate([(a,b,k,centroid(g,nominal(r),a,b)) for a,b,k,_ in rec],r)
    original={k:estimate(v,k[1]) for k,v in lines.items()}
    # Independently report page-local common offsets, but do not use them in primary fit.
    fit=[v for (p,r),v in original.items() if p<40];held=[v for (p,r),v in original.items() if p>=40]
    # Solved source pages: same fixed grid wherever eligible, no adaptive row fit.
    solved={}
    for n in [*range(1,17),73,74]:
        g=read(n);rr=[]
        for r in range(13):
            rec=records(g,nominal(r))
            if len(rec)>=8:rr.append((r,len(rec),estimate(rec,r)))
        solved[str(n)]=rr
    rng=np.random.default_rng(3301);plants=[];all_deltas=[]
    for p in [44,47,52]:
        g=images[p];base=q92(g);baseline=np.array([from_fixed(base,r,lines[p,r]) for r in range(12)])
        for amp in [.25,.5,1.]:
            bits=np.array([-1,1]*6);rng.shuffle(bits);d=bits*amp;shifted=g.copy()
            for r,delta in enumerate(d):
                y=nominal(r);lo,hi=y-18,y+138;crop=g[lo:hi].copy();M=np.array([[1,0,0],[0,1,delta]],np.float32)
                shifted[lo:hi]=cv2.warpAffine(crop,M,(crop.shape[1],crop.shape[0]),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            marked=q92(shifted);measured=np.array([from_fixed(marked,r,lines[p,r]) for r in range(12)]);change=measured-baseline
            blind=np.array([estimate(records(marked,nominal(r)),r) for r in range(12)])
            plants.append({'redetected':blind.tolist(),'page':p,'amplitude':amp,'sign_correct_absolute':int(np.sum(np.sign(measured)==bits)),'sign_correct_paired':int(np.sum(np.sign(change)==bits)), 'absolute_threshold_correct':int(np.sum((measured*bits)>=amp/2)), 'paired_error':summarize(change-d),'baseline':summarize(baseline),'deltas':change.tolist(),'measured':measured.tolist(),'bits':bits.tolist()});all_deltas.extend(change-d)
    # Frozen ordinary-jitter nulls: distribution comparison only; no selection from holdout.
    # Add Gaussian continuous line jitter to observed training residuals; compare threshold and two-level fit.
    nulls={}
    for sigma in [.05,.15,.25,.5]:
        draws=np.asarray(fit)[rng.integers(len(fit),size=(10000,len(held)))]+rng.normal(0,sigma,(10000,len(held)))
        nulls[str(sigma)]={'median_abs_quantiles':np.quantile(np.median(abs(draws),axis=1),[.025,.5,.975]).tolist(),'fraction_abs_ge_0125_quantiles':np.quantile(np.mean(abs(draws)>=.125,axis=1),[.025,.5,.975]).tolist()}
    result={'source':'original 75-image archive; fixed 25 clean LP2 pages, glyph offsets from p0-39 only','fit_pages':[p for p in PAGES if p<40],'holdout_pages':[p for p in PAGES if p>=40], 'glyph_count':sum(map(len,lines.values())), 'train':summarize(fit),'holdout':summarize(held),'solved_fixed_grid':solved,'per_line':[{'p':p,'r':r,'n':len(lines[p,r]),'residual':v} for (p,r),v in original.items()],'plants':plants,'jitter_nulls':nulls,'offsets':offsets.tolist()}
    # Secondary row-locked model: motivated by development's repeated row signature.
    # First 72 original test lines were inspected before this amendment. A separate
    # unseen p40-55 set tests it without reusing those pages. Coarse eligibility
    # uses only full-height glyph count and frozen geometry, never residuals.
    row_offsets=np.array([np.median([v for (p,r),v in original.items() if p<40 and r==rr]) for rr in range(12)])
    correction={k:v-row_offsets[k[1]] for k,v in original.items()}
    extra={}; extra_records={}; extra_images={}
    for p in range(40,56):
        if p in PAGES:continue
        g=read(p+17)
        for r in range(12):
            rec=records(g,nominal(r))
            if len(rec)>=8:
                extra[p,r]=estimate(rec,r)-row_offsets[r]
                extra_records[p,r]=rec;extra_images[p]=g
    secondary_plants=[]
    for p in sorted(extra_images):
        g=extra_images[p];rr=sorted(r for pp,r in extra if pp==p)
        base=q92(g);b=np.array([from_fixed(base,r,extra_records[p,r])-row_offsets[r] for r in rr])
        for amp in [.25,.5,1.]:
            bits=rng.choice([-1,1],len(rr));shifted=g.copy()
            for r,bit in zip(rr,bits):
                y=nominal(r);lo,hi=y-18,y+138;crop=g[lo:hi].copy();M=np.array([[1,0,0],[0,1,bit*amp]],np.float32)
                shifted[lo:hi]=cv2.warpAffine(crop,M,(crop.shape[1],crop.shape[0]),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            m=q92(shifted);v=np.array([from_fixed(m,r,extra_records[p,r])-row_offsets[r] for r in rr]);change=v-b
            blind=np.array([estimate(records(m,nominal(r)),r)-row_offsets[r] for r in rr])
            secondary_plants.append({'blind_sign_correct':int(sum(blind*bits>0)),'blind_threshold_correct':int(sum(blind*bits>=amp/2)),'page':p,'amplitude':amp,'n':len(rr),'sign_correct':int(sum(v*bits>0)),'threshold_correct':int(sum(v*bits>=amp/2)),'paired_sign_correct':int(sum(change*bits>0)),'paired_error':summarize(change-bits*amp)})
    result['secondary_row_model']={'row_offsets':row_offsets.tolist(),'train':summarize([v for (p,r),v in correction.items() if p<40]),'previous_holdout':summarize([v for (p,r),v in correction.items() if p>=40]),'fresh_holdout':summarize(list(extra.values())),'fresh_lines':[{'p':p,'r':r,'n':len(extra_records[p,r]),'residual':v} for (p,r),v in extra.items()],'fresh_plants':secondary_plants,'previous_plants':[{**{k:x[k] for k in ['page','amplitude']},'sign_correct':int(sum((np.array(x['measured'])-row_offsets)*x['bits']>0)),'threshold_correct':int(sum((np.array(x['measured'])-row_offsets)*x['bits']>=x['amplitude']/2)),'blind_sign_correct':int(sum((np.array(x['redetected'])-row_offsets)*x['bits']>0)),'blind_threshold_correct':int(sum((np.array(x['redetected'])-row_offsets)*x['bits']>=x['amplitude']/2))} for x in plants]}
    corrected_train=np.array([v for (p,r),v in correction.items() if p<40]);result['secondary_row_model']['corrected_jitter_nulls']={}
    for sigma in [.05,.15,.25,.5]:
        sample=corrected_train[rng.integers(len(corrected_train),size=(10000,100))]+rng.normal(0,sigma,(10000,100));result['secondary_row_model']['corrected_jitter_nulls'][str(sigma)]={str(a):np.quantile(np.mean(abs(sample)>=a/2,axis=1),[.025,.5,.975]).tolist() for a in [.25,.5,1.]}
    args.output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ('per_line','offsets','solved_fixed_grid','plants','secondary_row_model')},indent=2));print('solved eligible',[(n,len(v)) for n,v in solved.items()]);print('plants',[(x['page'],x['amplitude'],x['sign_correct_absolute'],x['absolute_threshold_correct'],x['paired_error']['sd']) for x in plants])
if __name__=='__main__':main()
