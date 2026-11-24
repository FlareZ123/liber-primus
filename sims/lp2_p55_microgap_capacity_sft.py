"""p55 conditional one-sided microgap pattern count. numpy, Pillow.
Run from repository checkout: python sims/lp2_p55_microgap_capacity_sft.py
Optional first arg: original JPEG ZIP.
"""
import io, json, zipfile, sys, math, itertools
from pathlib import Path
import numpy as np
from PIL import Image

def groups(a):
    return np.split(a,np.flatnonzero(np.diff(a)>1)+1) if len(a) else []

def load(page, raw, lines):
    image=np.asarray(Image.open(io.BytesIO(raw)).convert('L'))
    out=[]
    for row,line in enumerate(lines):
        y=673+188*row
        xmax=1032 if page==55 and row==3 else 1810
        crop=image[y-10:y+125,590:xmax]
        ink=crop<155
        spans=[]
        for g in groups(np.flatnonzero(ink.sum(axis=0)>=2)):
            ys=np.flatnonzero(ink[:,g].any(axis=1))
            if len(ys) and ys[-1]-ys[0]+1>=93:
                left,right=int(g[0]),int(g[-1])
                weights=np.maximum(0,200-crop[:,left:right+1].astype(float)).sum(axis=0)
                cent=np.dot(weights,np.arange(left,right+1))/weights.sum()
                spans.append((left,right,cent))
        indices=[i for i,c in enumerate(line) if 'A'<=c<=']']
        ids=[ord(line[i])-65 for i in indices]
        if len(ids)!=len(spans):
            raise ValueError((page,row,len(ids),len(spans)))
        v=np.zeros(58); design=[]; coords=[]; dots=[]
        for i,(left,right,cent) in enumerate(spans):
            if i:
                gap=ink[:,spans[i-1][1]+1:left]
                n=len(groups(np.flatnonzero(gap.sum(axis=0)>=2)))
                dots.append(n)
                v[ids[i-1]]+=1
                between=line[indices[i-1]+1:indices[i]]
                # p46 row4 gap9 is visibly a three-dot zigzag (two columns).
                v[-1]+=between.count('-')+3*between.count('.')-(page==46 and row==4 and i==10)
            x=v.copy()
            if ids[i]: x[28+ids[i]]+=1
            design.append(x)
            coords.append([left+590,cent+590])
        out.append((np.array(design),np.array(coords),dots))
    return out

def run(tapes,read):
    train=[9,12,19,28]
    hold=[13,26,29,31,46,47]
    targets=[55,57]
    data={}; skipped={}
    for page in train+hold+targets:
        try: data[page]=load(page,read(page),tapes[page].split('/'))
        except ValueError as e: skipped[page]=str(e)
    assert all(p in data for p in train+hold+[55]), skipped
    center=lambda x:x-x.mean(axis=0)
    X=np.concatenate([center(a) for p in train for a,b,d in data[p]])
    Y=np.concatenate([center(b) for p in train for a,b,d in data[p]])
    coeff,_,rank,_=np.linalg.lstsq(X,Y,rcond=None)
    assert rank==58,rank
    residuals={p:[center(b-a@coeff) for a,b,d in rows] for p,rows in data.items()}
    def stats(rows):
        a=np.concatenate(rows)
        return dict(n=len(a),rmse=np.sqrt(np.mean(a*a,axis=0)).tolist(),max_line_range=np.max([np.ptp(r,axis=0) for r in rows],axis=0).tolist(),line_ranges=[np.ptp(r,axis=0).tolist() for r in rows])
    threshold=np.max([np.ptp(r,axis=0) for p in hold for r in residuals[p]],axis=0)
    rng=np.random.default_rng(3301)
    plants={}
    for amp,offset in [(1,0),(1,.5),(.5,0),(.5,.5)]:
        maxima=np.zeros((10000,2))
        for r in residuals[55]:
            bits=rng.integers(0,2,size=(10000,len(r)-1))
            shift=np.column_stack([np.zeros(10000),amp*np.cumsum(bits-offset,axis=1)])
            maxima=np.maximum(maxima,np.ptp(r[None,:,:]+shift[:,:,None],axis=1))
        plants[f'{amp}:{offset}']=np.mean(maxima>threshold,axis=0).tolist()
    capacity={}
    for amp in (1,.5):
        counts=[]; maxones=[]; forced=[]; hist=[]
        for r in residuals[55]:
            n=len(r)-1
            bound=min(n,int(np.floor(np.min((threshold+r[-1]-r[0])/amp))))
            feasible=0; occupied=np.zeros(n,dtype=np.int64); h=[0]*(bound+1)
            for k in range(bound+1):
                for ix in itertools.combinations(range(n),k):
                    bits=np.zeros(n);bits[list(ix)]=1
                    sh=np.r_[0,amp*np.cumsum(bits)]
                    if np.all(np.ptp(r-sh[:,None],axis=0)<=threshold):
                        feasible+=1;occupied[list(ix)]+=1;h[k]+=1
            counts.append(feasible);maxones.append(max(i for i,v in enumerate(h) if v));hist.append(h)
            forced.append([i for i,v in enumerate(occupied) if v==0])
        product=math.prod(counts)
        capacity[str(amp)]=dict(line_counts=counts,maxones=maxones,histograms=hist,forced_zero_offsets=forced,patterns=product,log2_patterns=math.log2(product))
    signbytes=[]
    for col in range(2):
        bits=np.concatenate([np.diff(r[:,col])>0 for r in residuals[55]])
        signbytes.append(np.packbits(bits).tobytes().hex())
    return dict(train=train,hold=hold,skipped=skipped,rank=int(rank),training=stats([r for p in train for r in residuals[p]]),heldout=stats([r for p in hold for r in residuals[p]]),targets={p:stats(residuals[p]) for p in targets if p in data},threshold=threshold.tolist(),plant_detection=plants,capacity=capacity,p55_sign_hex=signbytes,p55_gap_residuals=[np.diff(r,axis=0).tolist() for r in residuals[55]],model=coeff.tolist())

if __name__=='__main__':
    root=Path(__file__).resolve().parent.parent
    gp=json.loads((root/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    pages=(root/'resources/lp2-transcription.txt').read_text(encoding='utf-8').split('%')
    ids={r:chr(65+i) for i,r in enumerate(gp['runes'])}
    tapes={}
    expected={9:0xf21dd6bb,12:0x351ea163,19:0xeeb44408,28:0xf838f521,13:0x3817b491,26:0xba39c4d5,29:0xa514627f,31:0x484d6b8f,46:0xfc85e25f,47:0xf0a28541,55:0xe7486dae,57:0xb43ef3df}
    for p,h0 in expected.items():
        lines=[''.join(ids.get(c,c) for c in line if c in ids or c in '-.') for line in pages[p-(p>=51)].split('/')]
        tape='/'.join(line for line in lines if any('A'<=c<=']' for c in line))
        h=2166136261
        for c in tape: h=((h^ord(c))*16777619)&0xffffffff
        assert h==h0,(p,hex(h),hex(h0))
        tapes[p]=tape
    if len(sys.argv)>1:
        with zipfile.ZipFile(sys.argv[1]) as z:
            result=run(tapes,lambda p:z.read(f'liber-primus-jpegs/{p+17:02d}.jpg'))
    else:
        result=run(tapes,lambda p:(root/'resources/liber-primus'/f'{p+17:02d}.jpg').read_bytes())
    assert result['training']['n']==1069 and result['heldout']['n']==1627
    assert result['capacity']['1']['line_counts']==[1744,196,42,43]
    assert result['capacity']['0.5']['line_counts']==[310592,19343,2702,114]
    print(json.dumps(result,indent=2))
