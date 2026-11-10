"""Blind finite-field Fourier recovery of stationary width-5 Hill cipher inverse.

Reads the exact 55 original ciphertext rune-bearing LP2 pages (12,956 runes).
For C = M P in F29^w, each inverse row exposes a skewed plaintext marginal:
the full 29^w Fourier transform of ciphertext block frequencies identifies the
line through the inverse row without guessing M. Analyze original phases with
frozen half-book heldout scores and test a fully mixed planted known key.
Only a conditional model test; apparent directions are not plaintext recovery.
Run: python sims/hill_fourier_blind_inverse.py
"""
from __future__ import annotations

import json
from pathlib import Path
import numpy as np
from scipy.fft import fftn

M = 29
ROOT = Path(__file__).resolve().parent.parent

def rank29(a: np.ndarray) -> int:
    z = np.asarray(a, dtype=np.int64).copy() % M
    rank = 0
    for j in range(z.shape[1]):
        if rank == z.shape[0]:
            break
        piv = np.flatnonzero(z[rank:,j])
        if not len(piv):
            continue
        k = rank + int(piv[0])
        z[[rank,k]] = z[[k,rank]]
        z[rank] = (z[rank] * pow(int(z[rank,j]), -1, M)) % M
        for i in range(rank+1,len(z)):
            z[i] = (z[i]-z[i,j]*z[rank]) % M
        rank += 1
    return rank

def inverse29(a: np.ndarray) -> np.ndarray:
    n = len(a)
    z = np.concatenate((a.copy()%M,np.eye(n,dtype=np.int64)),axis=1)
    for j in range(n):
        k = next(i for i in range(j,n) if z[i,j])
        z[[j,k]] = z[[k,j]]
        z[j] = (z[j]*pow(int(z[j,j]),-1,M))%M
        for i in range(n):
            if i != j:
                z[i] = (z[i]-z[i,j]*z[j])%M
    return z[:,n:]

def canonical(v: tuple[int,...]) -> tuple[int,...]:
    a = np.asarray(v,dtype=np.int64)
    lead = next(int(x) for x in a if x)
    return tuple(map(int,(a*pow(lead,-1,M))%M))

def blockify(pages: list[np.ndarray], width: int, phase: int, mode: str) -> np.ndarray:
    groups = [np.concatenate(pages)] if mode == 'book' else pages
    blocks = []
    for group in groups:
        s = group[phase:]
        n = len(s)//width
        if n:
            blocks.append(s[:n*width].reshape(-1,width))
    return np.concatenate(blocks)

def contrast(blocks: np.ndarray, row: tuple[int,...]) -> float:
    p = (blocks @ np.asarray(row,dtype=np.int64))%M
    h = np.bincount(p,minlength=M).astype(float)/len(blocks)
    return float(M*np.square(h).sum()-1)

def inverse_candidates(train: np.ndarray, width: int, top: int=1200) -> list[tuple[int,...]]:
    hist=np.zeros((M,)*width,dtype=np.float32)
    np.add.at(hist,tuple(train.T),1)
    transformed=fftn(hist,workers=2,overwrite_x=True)
    magnitude=np.square(transformed.real)+np.square(transformed.imag)
    flat=magnitude.ravel()
    flat[0]=0
    indices=np.argpartition(flat,-top)[-top:]
    indices=indices[np.argsort(flat[indices])[::-1]]
    rows={}
    for index in indices:
        v=tuple(int(x) for x in np.unravel_index(int(index),hist.shape))
        rows[canonical(v)]=None
    return sorted(rows,key=lambda row:contrast(train,row),reverse=True)

def investigate(blocks: np.ndarray,width: int) -> dict:
    mid=len(blocks)//2
    train,test=blocks[:mid],blocks[mid:]
    candidates=inverse_candidates(train,width)
    leaders=[]
    selected=[]
    for row in candidates[:40]:
        item={'row':list(row),'train':round(contrast(train,row),7),
              'heldout':round(contrast(test,row),7)}
        if len(leaders)<10:
            leaders.append(item)
        if len(selected)<width and rank29(np.array([r['row'] for r in selected]+[list(row)]))==len(selected)+1:
            selected.append(item)
    return {'blocks':len(blocks),'distinct_projective_candidates':len(candidates),
            'null_train_contrast':round(28/len(train),7),
            'null_heldout_contrast':round(28/len(test),7),
            'top10':leaders,'full_rank_inverse_rows':selected}

def planted(width: int,nblocks: int) -> dict:
    rng=np.random.default_rng(0x24444)
    weights=np.ones(M)*0.008
    weights[[18,16,24,3,9,10,15,4,20,17,1]]=[0.128,0.086,0.09,0.082,0.075,0.074,0.065,0.06,0.055,0.047,0.041]
    weights/=weights.sum()
    plaintext=rng.choice(M,size=(nblocks,width),p=weights)
    while True:
        key=rng.integers(0,M,size=(width,width),dtype=np.int64)
        if rank29(key)==width:
            break
    ciphertext=(plaintext @ key.T)%M
    flat=ciphertext.ravel()
    edits=0
    for i in range(1,len(flat)):
        if flat[i]==flat[i-1] and rng.random()<.81:
            flat[i]=(flat[i-1]+1+int(rng.integers(M-1)))%M
            edits+=1
    diagnosis=investigate(ciphertext,width)
    true={canonical(tuple(map(int,row))) for row in inverse29(key)}
    got={tuple(item['row']) for item in diagnosis['full_rank_inverse_rows']}
    diagnosis.update({'synthetic_source':'nonuniform GP-like iid; fully random invertible 5x5 mixing key',
      'overwrite_rate':.81,'rewritten_symbols':edits,
      'true_rows':list(map(list,sorted(true))),
      'recovered_true_rows':len(true&got),'positive':len(true&got)==width})
    assert diagnosis['positive'],diagnosis
    return diagnosis

def main() -> None:
    corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text('utf8'))
    pages=[np.asarray(p['indices'],dtype=np.int64) for p in corpus['pages']
           if p['status']=='unsolved' and p['indices']]
    assert len(pages)==55 and sum(len(p) for p in pages)==12956
    for width in (4,5):
        for mode in ('book','page'):
            for phase in range(width):
                output=investigate(blockify(pages,width,phase,mode),width)
                print('ORIGINAL '+json.dumps({'width':width,'mode':mode,'phase':phase,**output}),flush=True)
    for width,nblocks in [(4,3230),(5,2580)]:
        output=planted(width,nblocks)
        print('PLANTED '+json.dumps({'width':width,**output}),flush=True)

if __name__=='__main__':
    main()
