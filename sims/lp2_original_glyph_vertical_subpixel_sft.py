#!/usr/bin/env python3
"""LP2 matched-rune fractional vertical translation experiment.

Dependencies: NumPy, OpenCV, Pillow. Input: original 75-image archive or extracted
image directory. Frozen p0 labels: master blob ba553b1d43bc491a1bab66ebd02534249263ae90.
"""
from __future__ import annotations
import argparse
import io
import json
from collections import defaultdict
from pathlib import Path
import zipfile
import cv2
import numpy as np
from PIL import Image

RUNES = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
P0 = [
    'ᛋᛈᛏᚠᛈᚢᛝᚣᛝᛉᛡ-ᚣᚻ-ᛒᚢ-ᚷᚩᛈ-ᛝᚫᚦ-ᛁ/',
    'ᚫᚻᛉᚦᛈᚷ-ᚣᚠᛝᚳᛄ-ᚦᚪᛗᛁᛝᛁᛡᚣ-ᚻᛇ-ᛏᚻᚫ/',
    'ᛡ-ᛉᚣ-ᛖᚢᛝ-ᚳᚠᚾ-ᛇᚦᛄᛁᚦ-ᚦᛈ-ᚣᛝᛠ-ᚣᚾ/',
    'ᛖᚣ-ᛞᛉᛝᚹ-ᛒᚳᛉᛞᛒᚠ-ᛗᛏᚾᛖ-ᛠᛄᚾᛚᚷ/',
    'ᛒ-ᛉᚷᚦ.ᚣᛁᛞᚪ-ᛝᚷᛗᛄᚱᚩᛚᛇ-ᚣᛏᛈᛁᚦᛞᛄ-/',
    'ᛟᚻᛚ-ᛠ-ᚠᛉᚫᛈᚷᛉ-ᚠᛚᚹᛇᛏᚫ-ᚠᚷᚾ-ᛗᛇᛚᚾ-/',
    'ᛝᛗᚠᚱᛡ-ᚪᛋ-ᛠᛗᛝᛉᛉᛇᛞᛒ-ᛟᛞᛗᚩ-ᛠ/',
    'ᛇᚻ-ᛞᛝᚷ-ᛟᛝᛚᚢᚱᚾᛏ-ᚫᛋᚣᚢᚻᚱᛏ-ᚻᚳ-ᛋᛟ/',
    'ᛏᛟᛝᚢᚱ-ᛋ-ᚠᚩᛖᚹᛠᛟᛚᚠᚫ-ᛗᚱᛝ-ᛞᚪᛗᚱ-ᚹ/',
]
STARTS = [1234,1422,1610,1798,1986,2174,2362,2550,2738]
GRID = np.linspace(-3,3,241)
Y = np.arange(144,dtype=float)

def groups(a, gap=1):
    result=[]
    for x in a:
        x=int(x)
        if not result or x>result[-1][1]+gap: result.append([x,x])
        else: result[-1][1]=x
    return result

def bands(gray):
    counts=np.count_nonzero(gray[:,850:1960]<150,axis=1)
    return [a-4 for a,b in groups(np.flatnonzero(counts>80),2) if 85<=b-a+1<=145 and max(counts[a:b+1])>200]

def segments(gray,y):
    ink=gray[y:y+118,600:2100]<150
    return [(a+600,b+600) for a,b in groups(np.flatnonzero(np.count_nonzero(ink,axis=0)>=7)) if np.count_nonzero(np.any(ink[:,a:b+1],axis=1))>=100 and b-a+1<=92]

def feature(gray,y,a,b):
    ink=(gray[y:y+118,a:b+1]<150).astype(np.float32)
    active=np.flatnonzero(np.any(ink,axis=1));ink=ink[active[0]:active[-1]+1]
    canvas=np.zeros((120,96),np.float32);h,w=ink.shape;canvas[:h,:w]=ink
    return cv2.resize(canvas,(48,60),interpolation=cv2.INTER_AREA).ravel()

def profile(gray,y,a,b):
    crop=gray[y-8:y+136,a-1:b+2].astype(float);v=(255-crop).sum(axis=1)
    assert len(v)==144
    return v/v.sum()

def stat(x):
    a=np.asarray(x,dtype=float)
    if not len(a):return {'n':0}
    return {'n':len(a),'mean':float(a.mean()),'sd':float(a.std()),'rmse':float(np.sqrt(np.mean(a*a))),
            'abs_quantiles':np.quantile(np.abs(a),[.5,.9,.95,.99,1]).tolist(),
            'abs_exceed':[float(np.mean(np.abs(a)>t)) for t in (.05,.1,.25,.5)]}

def estimate(v,labels,templates):
    x=v-v.mean(axis=-1,keepdims=True);x/=np.maximum(np.linalg.norm(x,axis=-1,keepdims=True),1e-15)
    out=np.empty(len(v));score=np.empty(len(v))
    for cls in range(29):
        ix=np.flatnonzero(labels==cls)
        if not len(ix):continue
        s=x[ix]@templates[cls].T;k=np.argmax(s,axis=1);delta=GRID[k].copy()
        mid=(k>0)&(k<len(GRID)-1);i=np.arange(len(ix))[mid];j=k[mid]
        lo=s[i,j-1];ce=s[i,j];hi=s[i,j+1];curv=lo-2*ce+hi
        delta[mid]+=np.where(abs(curv)>1e-15,.5*(lo-hi)/np.where(abs(curv)>1e-15,curv,1)*(GRID[1]-GRID[0]),0)
        out[ix]=delta;score[ix]=s[np.arange(len(ix)),k]
    return out,score

def template_bank(profiles,labels,pages):
    bank=[]
    for cls in range(29):
        subset=profiles[(labels==cls)&(pages==0)];assert len(subset)>=3,(cls,len(subset))
        v=np.median(subset,axis=0)
        arr=np.stack([np.interp(Y-d,Y,v,left=0,right=0) for d in GRID]);arr-=arr.mean(axis=1,keepdims=True);arr/=np.linalg.norm(arr,axis=1,keepdims=True);bank.append(arr)
    return np.asarray(bank)

def pair_array(meta,labels,values):
    ix=defaultdict(list)
    for i,(p,line,y,a,b) in enumerate(meta):ix[(p,line,int(labels[i]))].append(i)
    pairs=[]
    for (p,line,cls),ids in ix.items():
        for u,i in enumerate(ids):
            for j in ids[u+1:]:pairs.append((p,line,cls,i,j,values[j]-values[i]))
    return np.asarray(pairs)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('source',type=Path);parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
    if args.source.is_dir():
        read=lambda p:Image.open(args.source/f'{p+17}.jpg')
    else:
        archive=zipfile.ZipFile(args.source);names={Path(x).name:x for x in archive.namelist() if x.endswith('.jpg')};read=lambda p:Image.open(io.BytesIO(archive.read(names[f'{p+17}.jpg'])))
    p0=np.asarray(read(0).convert('L'));tf=[];tl=[]
    for y,s in zip(STARTS,P0):
        seg=segments(p0,y);chars=[RUNES.index(c) for c in s if c in RUNES];assert len(seg)==len(chars),(y,len(seg),len(chars))
        for (a,b),cls in zip(seg,chars):tf.append(feature(p0,y,a,b));tl.append(cls)
    tf=np.stack(tf);tl=np.asarray(tl);assert len(set(tl.tolist()))==29
    meta=[];fs=[];ps=[]
    for p in range(58):
        img=read(p);gray=np.asarray(img.convert('L'));rgb=np.asarray(img) if img.mode=='RGB' else None
        for l,y in enumerate(bands(gray)):
            for a,b in segments(gray,y):
                if rgb is not None:
                    crop=rgb[y:y+118,a:b+1].astype(np.int16)
                    if np.count_nonzero((crop[:,:,0]-crop[:,:,1]>16)&(crop[:,:,1]<180))>50:continue
                meta.append((p,l,y,a,b));fs.append(feature(gray,y,a,b));ps.append(profile(gray,y,a,b))
    X=np.stack(fs);P=np.stack(ps);meta=np.asarray(meta);dist=((X*X).sum(1)[:,None]+(tf*tf).sum(1)[None,:]-2*X@tf.T)/X.shape[1];j=dist.argmin(1);score=dist[np.arange(len(X)),j];accept=score<.02
    meta=meta[accept];labels=tl[j[accept]];P=P[accept];pages=meta[:,0]
    bank=template_bank(P,labels,pages);shifts,correlations=estimate(P,labels,bank)
    pairs=pair_array(meta,labels,shifts);train=pairs[:,0]<40;test=~train;matchblock=(meta[pairs[:,3].astype(int),3]%8)==(meta[pairs[:,4].astype(int),3]%8)
    # Frozen rune/x-block-phase corrections fitted only to p0..39.
    line_groups=defaultdict(list)
    for i,(p,l,*_) in enumerate(meta):line_groups[(p,l)].append(i)
    centered=shifts.copy()
    for ids in line_groups.values():centered[ids]-=np.median(shifts[ids])
    train_g=pages<40;offsets=np.zeros((29,8))
    for c in range(29):
        for x in range(8):
            ix=train_g&(labels==c)&(meta[:,3]%8==x)
            if ix.any():offsets[c,x]=np.median(centered[ix])
    residual=shifts-offsets[labels,meta[:,3]%8];rp=pair_array(meta,labels,residual)
    # Synthetic profiles: isolate estimator sensitivity without JPEG.
    rng=np.random.default_rng(3301);ids=rng.choice(np.flatnonzero(pages>=40),600,replace=False)
    base,_=estimate(P[ids],labels[ids],bank);profile_controls={}
    for amplitude in (.05,.1,.25,.5):
        shifted=np.stack([np.interp(Y-amplitude,Y,v,left=0,right=0) for v in P[ids]])
        got,_=estimate(shifted,labels[ids],bank);profile_controls[str(amplitude)]=stat(got-base-amplitude)
    # Real source-glyph shifts, in-memory JPEG Q92 round trip; fixed coordinates.
    controls=[]
    for p in (44,47,52):
        ix=np.flatnonzero(pages==p);g=np.asarray(read(p).convert('L'));selected=[];local=defaultdict(list)
        for i in ix:local[(meta[i,1],labels[i])].append(i)
        for same in local.values():
            if len(same)>1:selected.append(same[-1])
        selected=set(selected)
        def recompress(a):
            buff=io.BytesIO();Image.fromarray(a).save(buff,format='JPEG',quality=92);return np.asarray(Image.open(io.BytesIO(buff.getvalue())).convert('L'))
        baseline=recompress(g);basep=np.stack([profile(baseline,*meta[i,2:]) for i in ix]);base_shift,_=estimate(basep,labels[ix],bank)
        for amplitude in (.1,.25,.5):
            planted=g.copy()
            for i in selected:
                _,_,y,a,b=meta[i];crop=planted[y-5:y+126,a-1:b+2].copy();m=np.array([[1.,0.,0.],[0.,1.,amplitude]],np.float32);planted[y-5:y+126,a-1:b+2]=cv2.warpAffine(crop,m,(crop.shape[1],crop.shape[0]),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT,borderValue=255)
            result=recompress(planted);plantp=np.stack([profile(result,*meta[i,2:]) for i in ix]);got,_=estimate(plantp,labels[ix],bank);delta=got-base_shift;mask=np.asarray([i in selected for i in ix]);expect=mask*amplitude
            bp=pair_array(meta[ix],labels[ix],base_shift);pp=pair_array(meta[ix],labels[ix],got)
            controls.append({'page':p,'amplitude':amplitude,'n_glyphs':len(ix),'planted':int(mask.sum()),'target_delta':stat(delta[mask]),'other_delta':stat(delta[~mask]),'estimation_error':stat(delta-expect),'baseline_pairs':stat(bp[:,5]),'plant_pairs':stat(pp[:,5])})
    result={'input':'Original LP2 17.jpg..74.jpg; black glyphs, p0 fixed training labels','counts':{'glyphs':len(meta),'train_glyphs':int(train_g.sum()),'holdout_glyphs':int((~train_g).sum()),'pairs':len(pairs),'train_pairs':int(train.sum()),'holdout_pairs':int(test.sum()),'same_x_block_phase_pairs':int(matchblock.sum())},'raw_same_rune_same_line_pairs':{'train':stat(pairs[train,5]),'holdout':stat(pairs[test,5]),'same_block_holdout':stat(pairs[test&matchblock,5]),'solved':stat(pairs[pairs[:,0]>=56,5])},'rune_xblock_corrected_pairs':{'train':stat(rp[train,5]),'holdout':stat(rp[test,5])},'template_correlation_quantiles':np.quantile(correlations,[0,.01,.1,.5,.9,1]).tolist(),'profile_controls':profile_controls,'jpeg_controls':controls,'per_page':{str(p):stat(pairs[pairs[:,0]==p,5]) for p in range(58)}}
    # A visually adjudicated body margin excludes the duplicated right-hand branch
    # at x=2076 on p9/p13; keep the unfiltered measurements above as diagnostics.
    body=meta[:,4]<1850
    bp=pair_array(meta[body],labels[body],shifts[body]);bt=bp[:,0]<40
    result['restricted_body']={'right_edge_exclusive':1850,'glyphs':int(body.sum()),'excluded':int((~body).sum()),'train':stat(bp[bt,5]),'holdout':stat(bp[~bt,5]),'outside_body':[{ 'page':int(m[0]),'line':int(m[1]),'x0':int(m[3]),'x1':int(m[4]),'rune':RUNES[int(c)],'correlation':float(co)} for m,c,co in zip(meta[~body],labels[~body],correlations[~body])]}
    result['outliers'] = [{'page':int(row[0]),'line':int(row[1]),'rune':RUNES[int(row[2])], 'first':meta[int(row[3])].tolist(),'second':meta[int(row[4])].tolist(),'shifts':[float(shifts[int(row[3])]),float(shifts[int(row[4])])],'correlations':[float(correlations[int(row[3])]),float(correlations[int(row[4])])],'delta':float(row[5])} for row in pairs if abs(row[5])>.25]
    args.output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,indent=2))
if __name__=='__main__':main()
