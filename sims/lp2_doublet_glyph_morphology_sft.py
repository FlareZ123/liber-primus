"""Glyph-conditioned side-channel screen at the 86 LP2 equal-rune pairs.

Requires original 58 JPEGs, lp2-corpus.json and the independent image-audit
segmentation/font model. Only exact source-to-raster aligned runes count.
A glyph-shaped flag could permit a decoder otherwise noninjective at a repeat.
This is a negative/positive *source channel* test, not a guessed plaintext.
"""
from __future__ import annotations
from pathlib import Path
import json
import numpy as np
from lp2_original_jpeg_glyph_audit_sft import ALPHABET, BITS, DIR, extract, train

def h(a,b):
    return int(BITS[np.bitwise_xor(a,b)].sum())

def map_rasters(samples,ref,model):
    kept=[]
    for sample in samples:
        dist=BITS[np.bitwise_xor(model,sample)].sum(axis=1)
        ix=int(np.argmin(dist))
        if dist[ix]<=314:kept.append((ALPHABET[ix],int(dist[ix]),sample))
    a=''.join(q[0] for q in kept)
    n,m=len(a),len(ref)
    cost=np.empty((n+1,m+1),np.int32)
    way=np.zeros((n+1,m+1),np.uint8)
    cost[:,0]=np.arange(n+1)*3;cost[0,:]=np.arange(m+1)*3
    for i in range(1,n+1):
        for j in range(1,m+1):
            z=[cost[i-1,j-1]+(-9 if a[i-1]==ref[j-1] else 5),
               cost[i-1,j]+3,cost[i,j-1]+3]
            q=int(np.argmin(z));cost[i,j]=z[q];way[i,j]=q
    result={};counts=[0,0,0,0]
    while n or m:
        z=int(way[n,m]) if n and m else (1 if n else 2)
        if z==0:
            if a[n-1]==ref[m-1]:
                result[m-1]=kept[n-1][1:];counts[0]+=1
            else:counts[1]+=1
            n-=1;m-=1
        elif z==1:counts[2]+=1;n-=1
        else:counts[3]+=1;m-=1
    return result,counts

def percentile(v,arr):
    a=np.asarray(arr)
    return (np.count_nonzero(a<v)+.5*np.count_nonzero(a==v))/len(a)

def main():
    d=json.loads((DIR/'lp2-corpus.json').read_text(encoding='utf8'))
    source={p['page']:''.join(ALPHABET[x] for x in p['indices']) for p in d['pages']}
    model=train(source)
    totals=np.zeros(4,int)
    events=[];total_doublets=0;mapped_doublets=0;comparable=0;coverage=[]
    for p in range(56):
        s=source[p]
        if p==50:
            assert not s
            continue
        mapped,counts=map_rasters(extract(p),s,model)
        totals+=counts
        observed=0;both=0;comps=0
        # Compare each repeat's raster and template deviation against
        # nonadjacent pairs of the same glyph *on the same physical page*.
        # The exact repeat itself is excluded from its control inventory.
        for i in range(len(s)-1):
            if s[i]!=s[i+1]:continue
            total_doublets+=1;observed+=1
            if i not in mapped or i+1 not in mapped:continue
            mapped_doublets+=1;both+=1
            ch=s[i];d0,r0=mapped[i];d1,r1=mapped[i+1]
            controls=[(j,dist,r) for j,(dist,r) in mapped.items()
                      if s[j]==ch and j not in (i,i+1)]
            pairnull=[h(v[2],w[2]) for k,v in enumerate(controls)
                      for w in controls[k+1:] if abs(v[0]-w[0])>1]
            if len(pairnull)<5:continue
            comparable+=1;comps+=1
            tempnull=[z[1] for z in controls]
            events.append({
                'page':p,'source_offset':i,'letter':ch,
                'pair_hamming':h(r0,r1),
                'pair_quantile':round(percentile(h(r0,r1),pairnull),4),
                'template_errors':[d0,d1],
                'template_quantiles':[round(percentile(d0,tempnull),4),
                                      round(percentile(d1,tempnull),4)],
                'within_page_controls':len(pairnull)})
        coverage.append((p,observed,both,comps))
    assert sum(len(source[p]) for p in range(56))==12956
    assert total_doublets==86
    assert totals[1]==0 and totals[2]==0, ('image audit mismatch',totals.tolist())
    ranks=np.array([e['pair_quantile'] for e in events])
    templ=np.array([e['template_quantiles'] for e in events])
    print('Input LP2 runes 12956, equal-rune source sites',total_doublets)
    print('Image match counts (match,mismatch,insert,omitted):',totals.tolist())
    print('Doublets both raster-mapped',mapped_doublets,'with >=5 controls',comparable)
    print('PAGE event/paired/comparable coverage',json.dumps(coverage))
    if len(ranks):
        print('PAIR: mean rank',float(np.mean(ranks)),'median',float(np.median(ranks)),
              'top decile',int(np.count_nonzero(ranks>=.9)),
              'bottom decile',int(np.count_nonzero(ranks<=.1)))
        print('TEMPLATE: means first/second',np.mean(templ,axis=0).tolist())
        # Diagnostic only: ties and dependence across events make an iid
        # uniform-rank p-value non-authoritative. Preserve source coordinates
        # so any visually anomalous glyph can be checked against original.
        print('HIGHEST 20 EVENT OUTLIERS:',json.dumps(
            sorted(events,key=lambda e:-e['pair_quantile'])[:20]))
        print('LOWEST 20 EVENT OUTLIERS:',json.dumps(
            sorted(events,key=lambda e:e['pair_quantile'])[:20]))
        print('HIGHEST 20 TEMPLATE OUTLIERS:',json.dumps(
            sorted(events,key=lambda e:-max(e['template_quantiles']))[:20]))
    print('No new plaintext, authenticated key, or cipher selection is implied.')

if __name__=='__main__':
    main()
