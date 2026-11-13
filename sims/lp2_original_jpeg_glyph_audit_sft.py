"""Original LP2 JPEG glyph audit. Input: resources/liber-primus/{17..74}.jpg and lp2-corpus.json.
Uses a single full 29-glyph type specimen on p9. Touching runes, oversized
initials, artwork and ambiguous components are explicitly excluded.
"""
from __future__ import annotations
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
DIR=Path(__file__).resolve().parents[1]/"resources"/"liber-primus"
ALPHABET="ABCDEFGHIJKLMNOPQRSTUVWXYZabc"
BITS=np.array([i.bit_count() for i in range(256)],dtype=np.uint8)
def extract(page:int)->list[np.ndarray]:
    im=np.array(Image.open(DIR/f"{page+17:02}.jpg").convert("L"))
    row=(im[:,500:1900]<120).sum(axis=1)>30
    row=np.convolve(row.astype(np.int16),np.ones(7,dtype=np.int16),mode="same")>0
    bounds=np.flatnonzero(np.diff(np.pad(row.astype(np.int8),(1,1))))
    glyphs=[]
    for y0,y1 in zip(bounds[::2],bounds[1::2]):
        if not 110<=y1-y0<=135:continue
        area=im[y0:y1,580:1900];c=(area<120).any(axis=0)
        edges=np.flatnonzero(np.diff(np.pad(c.astype(np.int8),(1,1))))
        for x0,x1 in zip(edges[::2],edges[1::2]):
            if not 7<=x1-x0<=92:continue
            glyph=area[:,x0:x1];rows=np.flatnonzero((glyph<120).any(axis=1))
            if not len(rows) or rows[-1]-rows[0]+1<80:continue
            glyph=glyph[rows[0]:rows[-1]+1]
            normal=cv2.resize((glyph<125).astype(np.uint8),(48,96),interpolation=cv2.INTER_NEAREST)
            glyphs.append(np.packbits(normal.ravel()))
    return glyphs
def train(corpus:dict[int,str])->np.ndarray:
    samples=extract(9);reference=corpus[9]
    assert len(samples)==len(reference)+1 and set(reference)==set(ALPHABET)
    samples=samples[:len(reference)]  # rightmost twig is not a rune
    result=[]
    for letter in ALPHABET:
        v=np.stack([s for s,ch in zip(samples,reference) if ch==letter])
        diffs=np.array([BITS[np.bitwise_xor(v,s)].sum(axis=1) for s in v])
        result.append(v[int(np.argmin(diffs.sum(axis=1)))])
    return np.stack(result)
def classify(samples:list[np.ndarray],model:np.ndarray)->str:
    chars=[]
    for sample in samples:
        d=BITS[np.bitwise_xor(model,sample)].sum(axis=1);best=int(np.argmin(d))
        if d[best]<=314:chars.append(ALPHABET[best])
    return "".join(chars)
def align(a:str,b:str)->tuple[int,int,int,int]:
    n,m=len(a),len(b)
    cost=np.empty((n+1,m+1),dtype=np.int32);way=np.zeros((n+1,m+1),dtype=np.uint8)
    cost[:,0]=np.arange(n+1)*3;cost[0,:]=np.arange(m+1)*3
    for i in range(1,n+1):
        for j in range(1,m+1):
            values=(cost[i-1,j-1]+(-9 if a[i-1]==b[j-1] else 5),cost[i-1,j]+3,cost[i,j-1]+3)
            q=min(values);cost[i,j]=q;way[i,j]=values.index(q)
    matched=bad=extra=omitted=0
    while n or m:
        step=way[n,m] if n and m else (1 if n else 2)
        if step==0:
            matched+=a[n-1]==b[m-1];bad+=a[n-1]!=b[m-1];n-=1;m-=1
        elif step==1:extra+=1;n-=1
        else:omitted+=1;m-=1
    return matched,bad,extra,omitted
def main()->None:
    d=json.loads((DIR/"lp2-corpus.json").read_text(encoding="utf-8"))
    corpus={p["page"]:"".join(ALPHABET[i] for i in p["indices"]) for p in d["pages"]}
    assert set(corpus)==set(range(58))
    model=train(corpus);totals=np.zeros(4,dtype=np.int64)
    for page in range(58):
        observed=classify(extract(page),model);result=align(observed,corpus[page])
        totals+=result
        print(f"p{page:02}: image={len(observed)}, source={len(corpus[page])}, "
              f"matches={result[0]}, contrary={result[1]}, extras={result[2]}, omitted={result[3]}")
    print("TOTAL matches/contrary/extras/omitted",*totals)
    assert tuple(map(int,totals))==(11796,0,0,1340)
if __name__=="__main__":main()
