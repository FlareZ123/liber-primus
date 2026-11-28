#!/usr/bin/env python3
"""Source-JPEG rune OCR gate: 29 source-labelled glyph templates; no language model.

Runs on the original 2400x3600 LP2 JPEGs. Page 50 has no conventional runes.
Shape templates come from isolated p16 and p41 rune anchors. Other image
positions (including solved p57) are read from raster pixels, then edit-aligned
against the canonical indices only for discrepancy reporting. This does not
decrypt ciphertext and does not assert that an image/corpus mismatch is a
confirmed error.

python sims/lp2_raster_anchor_ocr_sft.py
python sims/lp2_raster_anchor_ocr_sft.py --zip /path/to/liber-primus-jpegs.zip
"""
from __future__ import annotations
from collections import Counter, defaultdict
from pathlib import Path
import argparse
import hashlib
import io
import json
import zipfile

import numpy as np
from PIL import Image

GP = ('F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
      'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA')
# Original source glyphs: (physical page, first black pixel row, first pixel col).
# All are p16 samples except EO, which is an isolated p41 second-line sample.
ANCHORS = (
    (16,1050,1047),(16,861,1010),(16,673,1736),(16,673,850),
    (16,861,1253),(16,861,815),(16,861,751),(16,861,869),
    (16,1050,1647),(16,673,1644),(16,861,800),(16,1050,1216),
    (41,861,954),(16,1238,837),(16,673,1125),(16,861,1308),
    (16,673,797),(16,861,1068),(16,673,601),(16,861,601),
    (16,1050,804),(16,861,1604),(16,861,907),(16,673,660),
    (16,673,719),(16,673,757),(16,861,1347),(16,1050,950),
    (16,673,887))
assert len(GP)==len(ANCHORS)==29
SHIFTS=(-106,-105,-104,-1,0,1,104,105,106)

def segments(v):
    if len(v)==0:return
    a=b=int(v[0])
    for z in v[1:]:
        q=int(z)
        if q>b+1:
            yield a,b
            a=q
        b=q
    yield a,b

def components(jpeg,p):
    ink=np.asarray(Image.open(io.BytesIO(jpeg)).convert('L'))<180
    rows=np.flatnonzero(ink[500:3200,590:1810].sum(1)>30)+500
    for y0,y1 in segments(rows):
        h=y1-y0+1
        if not 113<=h<=115:continue
        cols=np.flatnonzero(ink[y0:y1+1,590:1810].sum(0)>0)+590
        for x0,x1 in segments(cols):
            w=x1-x0+1
            if not 8<=w<=95:continue
            glyph=ink[y0:y1+1,x0:x1+1]
            if w<=12:
                ys=np.flatnonzero(glyph.sum(1)>0)
                if len(ys)==0 or int(ys[-1]-ys[0])<80:continue
            canvas=np.zeros((118,105),dtype=np.uint8)
            canvas[1:1+h,2:2+w]=glyph
            hsh=hashlib.sha1(canvas.tobytes()).hexdigest()
            yield dict(page=p,x=x0,y=y0,width=w,hash=hsh,
                       bits=int.from_bytes(np.packbits(canvas).tobytes(),'big'))

def distance(a,b):
    if abs(a['width']-b['width'])>2:return 1.0
    x,y=a['bits'],b['bits']
    nx,ny=x.bit_count(),y.bit_count()
    if abs(nx-ny)>0.14*max(nx,ny):return 1.0
    d=min((x^(y<<s)).bit_count() if s>=0
          else ((x<<(-s))^y).bit_count() for s in SHIFTS)
    # Half the Jaccard distance of the optimally translated silhouettes.
    return d/(nx+ny+d)

def nearest(x,groups):
    scores=sorted((min(distance(x,t) for t in g),i)
                  for i,g in enumerate(groups))
    return scores[0],scores[1]

def compare_page(visual,expected):
    """Unit-cost global edit alignment; substitutions require exact flanks."""
    n,m=len(visual),len(expected)
    dp=[[0]*(m+1) for _ in range(n+1)]
    for i in range(n+1):dp[i][0]=i
    for j in range(m+1):dp[0][j]=j
    for i in range(1,n+1):
        x=visual[i-1]['rune']
        for j in range(1,m+1):
            dp[i][j]=min(dp[i-1][j-1]+(x!=expected[j-1]),
                         dp[i-1][j]+1,dp[i][j-1]+1)
    i,j=n,m;back=[]
    while i or j:
        if i and j and dp[i][j]==dp[i-1][j-1]+(visual[i-1]['rune']!=expected[j-1]):
            back.append(('match' if visual[i-1]['rune']==expected[j-1] else 'sub',i-1,j-1))
            i-=1;j-=1
        elif i and dp[i][j]==dp[i-1][j]+1:
            back.append(('insert',i-1,None));i-=1
        else:
            back.append(('delete',None,j-1));j-=1
    back.reverse()
    ctr=Counter(k for k,_,_ in back)
    hits=[]
    for k,(kind,vi,ci) in enumerate(back):
        if kind!='sub':continue
        flankL=sum(x[0]=='match' for x in back[max(k-3,0):k])
        flankR=sum(x[0]=='match' for x in back[k+1:k+4])
        g=visual[vi]
        hits.append(dict(page=g['page'],x=g['x'],y=g['y'],
                         visually=GP[g['rune']],canonical=GP[expected[ci]],
                         offset=ci,distance=round(g['distance'],5),
                         margin=round(g['margin'],5),
                         left_exact=flankL,right_exact=flankR))
    return ctr,hits,dp[n][m]


def spacing_gate(visual):
    """Test a visible multi-pixel inter-glyph spacing channel.

    Consecutive x-components are treated as within printed word only when
    their source-pixel empty horizontal gap is in 0..12. No canonical word
    boundaries or original plaintext are used here.
    """
    by_line=defaultdict(list)
    for x in visual:
        by_line[(x['page'],x['y'])].append(x)
    pairs=defaultdict(list)
    obs=[]
    for line in by_line.values():
        line.sort(key=lambda z:z['x'])
        for a,b in zip(line,line[1:]):
            gap=b['x']-a['x']-a['width']
            if not (0<=gap<=12):continue
            label=(a['rune'],b['rune'])
            pairs[label].append(gap)
            obs.append((a['rune'],b['rune'],b['x']-a['x']))
    frequent={key:gaps for key,gaps in pairs.items() if len(gaps)>=7}
    ranges=Counter(max(gaps)-min(gaps) for gaps in frequent.values())
    if not obs:
        raise AssertionError('No source glyph pairs survived')
    X=np.zeros((len(obs),58),dtype=np.float64)
    y=np.zeros((len(obs),),dtype=np.float64)
    for i,(left,right,advance) in enumerate(obs):
        X[i,left]=1.0
        X[i,29+right]=1.0
        y[i]=advance
    coef=np.linalg.lstsq(X,y,rcond=None)[0]
    residual=y-X@coef
    mse=float(np.mean(residual**2))
    r2=1-mse/float(np.var(y))
    out=dict(observed_pairs=len(obs),distinct_digraphs=len(pairs),
             at_least_seven_observations=len(frequent),
             gap_range_frequencies=dict(sorted(ranges.items())),
             pairs_with_span_ge_3=sum(v>=3 for gaps in frequent.values()
                                      for v in [max(gaps)-min(gaps)]),
             additive_glyph_advance_R2=round(r2,8),
             additive_glyph_advance_RMSE_px=round(mse**0.5,8),
             additive_glyph_advance_MAE_px=round(float(np.mean(np.abs(residual))),8),
             max_abs_residual_px=round(float(np.max(np.abs(residual))),8))
    return out

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--zip',type=Path,default=None)
    ap.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[1])
    ap.add_argument('--json-out',type=Path,default=None)
    opts=ap.parse_args()
    folder=opts.repo/'resources'/'liber-primus'
    archive=zipfile.ZipFile(opts.zip) if opts.zip else None
    data=[]
    for p in range(58):
        if p==50:continue
        name=f'{p+17:02d}.jpg'
        raw=(archive.read('liber-primus-jpegs/'+name) if archive
             else (folder/name).read_bytes())
        data.extend(components(raw,p))
    if archive:archive.close()
    lookup={(x['page'],x['y'],x['x']):x for x in data}
    sources=[]
    for name,loc in zip(GP,ANCHORS):
        if loc not in lookup:
            raise RuntimeError(f'Original source anchor missing: {name}: {loc}')
        sources.append(lookup[loc])
    templates=[[x] for x in sources]
    train={x['hash']:x for x in data if 16<=x['page']<=21}
    for _ in range(2):
        accepted={x['hash'] for group in templates for x in group}
        for x in train.values():
            if x['hash'] in accepted:continue
            (d,r),(e,_)=nearest(x,templates)
            if d<=0.065 and e>d+0.01:
                templates[r].append(x);accepted.add(x['hash'])
    unique={x['hash']:x for x in data}
    calls={}
    for key,x in unique.items():
        (d,r),(e,_)=nearest(x,templates)
        calls[key]=(d,r,e-d)
    visual=[];bad=[]
    for x in data:
        d,r,margin=calls[x['hash']]
        if d<=0.06 and margin>=0.01:
            visual.append(dict(page=x['page'],x=x['x'],y=x['y'],width=x['width'],
                               rune=r,distance=d,margin=margin))
        else:
            bad.append(dict(page=x['page'],x=x['x'],y=x['y'],
                            width=x['width'],closest=GP[r],
                            distance=round(d,5),margin=round(margin,5)))
    # The lone disputed R47 symbol at global index 9877 is p41 rune6.
    target=lookup[(41,673,914)]
    m=lookup[(41,673,855)];d=lookup[(41,673,1126)]
    tscore,call,tmargin=calls[target['hash']]
    assert call==23, ('p41 rune6 no longer classifies as D',GP[call])
    source_check=dict(
        observed=GP[call],target_x=914,target_y=673,
        D_same_line_distance=round(distance(target,d),6),
        M_same_line_distance=round(distance(target,m),6))
    report=dict(components=len(data),rune_components=len(visual),
                outside_rune_model=len(bad),stencil_variants=[len(x) for x in templates],
                source_check=source_check,nonmatches=bad)
    print('PIXEL_CENSUS',len(data),'MATCHED',len(visual),'OUTLIERS',len(bad))
    print('P41_ORIGINAL_GPOS9877',json.dumps(source_check))
    report['source_pixel_spacing']=spacing_gate(visual)
    print('SOURCE_PIXEL_SPACING',json.dumps(report['source_pixel_spacing']))
    canonical=folder/'lp2-corpus.json'
    if canonical.exists():
        book=json.loads(canonical.read_text(encoding='utf-8'))
        pages={x['page']:x['indices'] for x in book['pages']}
        edit_ctr=Counter();all_sub=[];per_page=[]
        for p in range(58):
            if p==50 or not pages.get(p):continue
            seen=sorted((x for x in visual if x['page']==p),
                        key=lambda x:(x['y'],x['x']))
            ctr,sub,lev=compare_page(seen,pages[p])
            edit_ctr.update(ctr);all_sub.extend(sub)
            per_page.append((p,len(seen),len(pages[p]),lev,len(sub)))
        high=[x for x in all_sub if x['left_exact']>=2 and x['right_exact']>=2
              and x['distance']<=0.045 and x['margin']>=0.015]
        report['canonical_compare']=dict(edits=dict(edit_ctr),
                                         high_confidence_differences=high,
                                         all_substitutions=all_sub,per_page=per_page)
        print('ALIGNMENT_EDITS',dict(edit_ctr))
        print('HIGH_CONFIDENCE_DISCREPANCIES',json.dumps(high))
        print('PAGE_ALIGNMENTS',json.dumps(per_page))
    if opts.json_out:
        opts.json_out.parent.mkdir(parents=True,exist_ok=True)
        opts.json_out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
        print('REPORT',opts.json_out)

if __name__=='__main__':
    main()
