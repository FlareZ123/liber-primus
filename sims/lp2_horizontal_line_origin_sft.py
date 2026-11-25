#!/usr/bin/env python3
"""Absolute horizontal whole-line origin, complementary to vertical and relative-gap tests."""
import argparse, json
from pathlib import Path
from collections import Counter
import cv2
import numpy as np
from lp2_common_line_displacement_sft import RUNES,P0,PAGES,nominal,segments,feature,read_source,q92,summarize

def profile(g,y):
    # Frozen left-edge strip; do not include the neighboring glyph.
    return np.maximum(0,230-g[y-12:y+132,590:614].astype(float)).sum(0)

def main():
    pa=argparse.ArgumentParser();pa.add_argument('source',type=Path);pa.add_argument('--output',type=Path,required=True);args=pa.parse_args();read=read_source(args.source)
    p0=read(17);fs=[];ls=[]
    for y,s in zip([1234,1422,1610,1798,1986,2174,2362,2550,2738],P0):
        ink=p0[y:y+118,600:2100]<150;cols=np.flatnonzero(ink.sum(axis=0)>=7);seg=[]
        for c in np.split(cols,np.where(np.diff(cols)>1)[0]+1):
            if len(c) and len(c)<=92 and np.count_nonzero(ink[:,c].any(axis=1))>=100:seg.append((int(c[0])+600,int(c[-1])+600))
        keys=[RUNES.index(c) for c in s if c in RUNES];assert len(seg)==len(keys)
        for (a,b),k in zip(seg,keys):fs.append(feature(p0,y,a,b));ls.append(k)
    fs=np.stack(fs);ls=np.array(ls);assert set(ls)==set(range(29));proto=np.stack([fs[ls==k].mean(0) for k in range(29)]);proto/=np.linalg.norm(proto,axis=1,keepdims=True)
    def observe(g,r):
        y=nominal(r);seg=segments(g,y)
        if len(seg)<8:return None
        a,b=seg[0]
        if not 595<=a<=605:return None
        sims=proto@feature(g,y,a,b);k=int(sims.argmax())
        if sims[k]<.88:return None
        return dict(k=k,a=a,b=b,profile=profile(g,y))
    lines={};images={}
    for p in sorted(set(PAGES)|set(range(40,56))):
        g=read(p+17);images[p]=g
        for r in range(12):
            obs=observe(g,r)
            if obs is not None:lines[p,r]=obs
    counts=Counter(v['k'] for (p,r),v in lines.items() if p<40)
    offsets={k:np.median([v['profile'] for (p,r),v in lines.items() if p<40 and v['k']==k],axis=0) for k,n in counts.items() if n>=3}
    shifts=np.arange(-2,2.0001,.0125);xx=np.arange(24);use=np.arange(2,18)
    templates={}
    for k,v in offsets.items():
        templates[k]=np.array([np.interp(use-d,xx,v) for d in shifts])
        templates[k]/=np.linalg.norm(templates[k],axis=1,keepdims=True)
    def residual(obs):
        if obs is None or obs['k'] not in templates:return None
        y=obs['profile'][use];return float(shifts[np.argmax(templates[obs['k']]@y/np.linalg.norm(y))])
    lines={k:v for k,v in lines.items() if residual(v) is not None}
    for v in lines.values():v['residual']=residual(v)
    fit=[v['residual'] for (p,r),v in lines.items() if p<40];held=[v['residual'] for (p,r),v in lines.items() if p>=40]
    controls={}
    for n in [*range(1,17),73,74]:
        g=read(n);vals=[]
        for r in range(12):
            v=residual(observe(g,r))
            if v is not None:vals.append(v)
        if vals:controls[str(n)]=summarize(vals)
    rng=np.random.default_rng(253301);plants=[]
    for amp in [.25,.5,1.]:
        for p in sorted({p for p,r in lines if p>=40}):
            g=images[p];rows=[r for pp,r in lines if pp==p];bits=rng.choice([-1,1],len(rows));base=q92(g);shifted=g.copy()
            for r,bit in zip(rows,bits):
                y=nominal(r);lo,hi=y-18,y+138;crop=g[lo:hi,580:1820].copy();M=np.array([[1,0,float(bit*amp)],[0,1,0]],np.float32)
                shifted[lo:hi,580:1820]=cv2.warpAffine(crop,M,(crop.shape[1],crop.shape[0]),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            marked=q92(shifted)
            for r,bit in zip(rows,bits):
                orig=lines[p,r];a=observe(base,r);b=observe(marked,r);x=residual(b);y=residual(a)
                same=bool(b is not None and b['k']==orig['k'] and a is not None and a['k']==orig['k'])
                plants.append(dict(p=p,r=r,amp=amp,bit=int(bit),same_class=same,residual=x,baseline=y,sign_correct=bool(same and x*bit>0),threshold_correct=bool(same and x*bit>=amp/2),error=None if not same else float(x-y-bit*amp)))
    stats={str(a):{'n':sum(p['amp']==a for p in plants),'same_class':sum(p['amp']==a and p['same_class'] for p in plants),'sign':sum(p['amp']==a and p['sign_correct'] for p in plants),'threshold':sum(p['amp']==a and p['threshold_correct'] for p in plants),'paired_error':summarize([p['error'] for p in plants if p['amp']==a and p['error'] is not None])} for a in [.25,.5,1.]}
    out=dict(train=summarize(fit),holdout=summarize(held),counts=dict(counts),offsets={k:v.tolist() for k,v in offsets.items()},control=controls,plants_summary=stats,per_line=[dict(p=p,r=r,**{k:x for k,x in v.items() if k!="profile"}) for (p,r),v in lines.items()],plants=plants)
    args.output.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k not in ('per_line','plants','offsets')},indent=2))
if __name__=='__main__':main()
