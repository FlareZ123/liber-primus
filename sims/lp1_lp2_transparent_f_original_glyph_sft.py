"""Plaintext-conditioned F glyph production-order test on original solved images.

Run from the repository with Python 3, numpy, Pillow and opencv-python:
    python sims/lp1_lp2_transparent_f_original_glyph_sft.py
Optional --archive path to the maintainer's original 75-image ZIP.
No unknown ciphertext is fitted.
"""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import argparse
import json
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GP = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
AB = '0123456789abcdefghijklmnopqrs'
ROWS = {
    3: [680,860,1040,1240,1420,1620,1800,2000,2180,2360,2560,2740],
    4: [680,860,1040,1240,1420,1620,1800,2040,2240,2420,2620,2800,2950],
    14: [680,860,1080,1280,1500,1680,1880,2100,2320,2540,2740],
    73: [680,860,1040,1880,2080]
}
DROPS={(3,0),(4,7),(14,0),(73,0)}
P56_ROWS='pbmf4jqk383p52677kpe 3odjnn167kn9qb50rpg dco25p 5n09ri095l40pa4nifqbs1 l7e3js7046rl4hp91f'

def gp(s):
    return [GP.index(c) for c in s if c in GP]

def data():
    gold=json.loads((ROOT/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf-8'))
    native=(ROOT/'resources/transcriptions/lp1_wulfic_canonical.txt').read_text(encoding='utf-8').split('$')
    corp=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    out={}
    for section,base,key in [(1,3,'DIUINITY'),(5,14,'FIRFUMFERENFE')]:
        p=gp(gold['sections'][section]['source_text'])
        c=gp(native[section])
        k=[corp['translit'].index(x) for x in key]
        j=0; replay=[]
        for v in p:
            if v==0: replay.append(0)
            else:
                replay.append((v+k[j%len(k)])%29);j+=1
        assert c==replay
        off=0
        for page,src in enumerate([s for s in native[section].split('%') if gp(s)],base):
            rows=[gp(s) for s in src.split('/') if gp(s)]
            n=sum(map(len,rows))
            labels={i:int(p[off+i]==0) for i,v in enumerate(c[off:off+n]) if v==0}
            if page in ROWS:out[page]=([''.join(AB[x] for x in row) for row in rows],labels)
            off+=n
    p=gp(gold['sections'][7]['source_text']);c=corp['pages'][56]['indices']
    primes=[]
    for n in range(2,1000):
        if not any(n%q==0 for q in primes if q*q<=n):primes.append(n)
    j=0; replay=[]
    for v in p:
        if v==0: replay.append(0)
        else:replay.append((v+primes[j]-1)%29);j+=1
    assert c==replay and j==84
    assert [AB.index(ch) for ch in P56_ROWS if ch!=' ']==c
    out[73]=(P56_ROWS.split(),{i:int(p[i]==0) for i,v in enumerate(c) if v==0})
    return out

def measure(load, known):
    records=[]
    for n,(seq,labels) in known.items():
        rgb=load(n)
        gray=cv2.cvtColor(rgb,cv2.COLOR_RGB2GRAY)
        g=(gray[:,550:1850]<150).astype('uint8')
        _,_,stats,_=cv2.connectedComponentsWithStats(g,8)
        cand=[(int(x+550),int(y),int(w),int(h),int(a)) for x,y,w,h,a in stats[1:] if 65<=h<=140 and 6<=w<=130 and a>150 and 500<=y<=3100]
        off=0
        for i,(s,y) in enumerate(zip(seq,ROWS[n])):
            row=sorted(t for t in cand if abs(t[1]-y)<=35)
            drop=(n,i) in DROPS
            real=s[1:] if drop else s
            if len(row)==len(real):
                for j,(v,(x,yy,w,h,a)) in enumerate(zip(real,row)):
                    if v!='0':continue
                    pos=off+j+int(drop);lab=labels[pos]
                    crop=rgb[yy:yy+h,x:x+w]
                    mask=(gray[yy:yy+h,x:x+w]<150).astype('uint8')
                    patch=cv2.resize(mask.astype('float32'),(16,32),interpolation=cv2.INTER_AREA)
                    mean=crop[mask.astype(bool)].astype(float).mean(axis=0)
                    records.append(dict(n=n,pos=pos,lab=lab,box=[x,yy,w,h],raw=mask,mask=patch,features=np.array([w/h,mask.mean(),float(mean[0]-mean[1]),float(mean.mean())]),gray=gray[yy:yy+h,x:x+w]))
            off+=len(s)
    return records

def evaluate(records):
    tests=[]
    for train,test in [([3,4],[14]),([3,4,14],[73]),([14],[3,4])]:
        a=[r for r in records if r['n'] in train];b=[r for r in records if r['n'] in test]
        for metric in ['mask','features']:
            A=np.stack([r[metric] for r in a]);B=np.stack([r[metric] for r in b])
            Y=np.array([r['lab'] for r in a]);T=np.array([r['lab'] for r in b])
            if metric=='features':
                scale=A.std(axis=0);scale[scale<1e-9]=1;A=A/scale;B=B/scale
            axes=tuple(range(1,B.ndim))
            d0=np.mean((B-A[Y==0].mean(axis=0))**2,axis=axes)
            d1=np.mean((B-A[Y==1].mean(axis=0))**2,axis=axes)
            pred=(d1<d0).astype(int)
            tests.append(dict(train=train,test=test,metric=metric,pred=pred.tolist(),truth=T.tolist(),correct=int(sum(pred==T))))
    collisions=[]
    for n,a,b in [(3,47,48),(73,47,56)]:
        x=next(r for r in records if (r['n'],r['pos'])==(n,a))
        y=next(r for r in records if (r['n'],r['pos'])==(n,b))
        assert x['lab']!=y['lab'] and np.array_equal(x['raw'],y['raw'])
        collisions.append(dict(image=n,positions=[a,b],labels=[x['lab'],y['lab']],shape=list(x['raw'].shape),mask_difference=int(np.count_nonzero(x['raw']!=y['raw'])),mean_absolute_gray_difference=float(np.mean(np.abs(x['gray'].astype(float)-y['gray'])))))
    return dict(count=len(records),glyphs=[{k:r[k] for k in ['n','pos','lab','box']} for r in records],tests=tests,collisions=collisions)

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--archive',type=Path);args=ap.parse_args()
    z=ZipFile(args.archive) if args.archive else None
    def load(n):
        name=f'{n:02}.jpg'
        src=BytesIO(z.read('liber-primus-jpegs/'+name)) if z else ROOT/'resources/liber-primus'/name
        return np.array(Image.open(src).convert('RGB'))
    result=evaluate(measure(load,data()))
    assert result['count']==22
    print(json.dumps(result,indent=2))
    if z:z.close()

if __name__=='__main__':main()
