"""Exact no-repeat rank inverse + blind 5x5 Hill Fourier cryptanalysis.

This composite model first maps each GP output rune to its index among
the 28 successors excluding the previous printed rune, while representing
a repeated rune by special digit 28. Unlike simply deleting doubles, both
sorted-exclusion and cyclic-exclusion transforms are bijections on all 29
symbols at each known preceding-rune state. FFT then tests an unknown dense
five-rune Hill layer over F29 without fitting the secret matrix.
"""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
from hill_fourier_blind_inverse import (
    M,ROOT,analyze,blocks_from_pages,canonical,rank_mod29,inverse_mod29)

def rank_decode(glyphs: np.ndarray,kind: str,prev: int|None=None) -> np.ndarray:
    out=[]
    for c in glyphs:
        x=int(c)
        if prev is not None:
            if kind=='cyclic':
                out.append((x-prev-1)%M)
            else:
                out.append(x-(x>prev) if x!=prev else M-1)
        prev=x
    return np.asarray(out,dtype=np.int64)

def rank_encode(symbols: np.ndarray,kind: str,rng: np.random.Generator,
                initial: int=0,repair: float=.81) -> tuple[np.ndarray,int]:
    out=np.empty(len(symbols),dtype=np.int64)
    prev=initial
    edits=0
    for i,z in enumerate(symbols):
        v=int(z)
        if kind=='cyclic':
            c=(prev+v+1)%M
        elif v==M-1:
            c=prev
        else:
            c=v+(v>=prev)
        if c==prev and rng.random()<repair:
            c=(prev+1+int(rng.integers(0,M-1)))%M
            edits+=1
        out[i]=c
        prev=c
    return out,edits

def plant(kind: str,seed: int=0x24888) -> dict:
    rng=np.random.default_rng(seed)
    prob=np.ones(M)*.008
    prob[[18,16,24,3,9,10,15,4,20,17,1]]=[.128,.086,.09,.082,.075,.074,.065,.06,.055,.047,.041]
    prob=.8*prob/prob.sum()+.2/M
    n=2580
    plain=rng.choice(M,size=(n,5),p=prob)
    while True:
        matrix=rng.integers(0,M,size=(5,5),dtype=np.int64)
        if rank_mod29(matrix)==5:
            break
    mixed=(plain@matrix.T)%M
    encoded,edits=rank_encode(mixed.ravel(),kind,rng)
    rank=rank_decode(encoded,kind,prev=0)
    result=analyze(rank.reshape(-1,5),5)
    true={canonical(tuple(map(int,v))) for v in inverse_mod29(matrix)}
    found={tuple(x['row']) for x in result['inverse_rows']}
    matched=len(true&found)
    assert matched==5,(kind,matched,result)
    return {'kind':kind,'nblocks':n,'rewritten_repeats':edits,
            'recovered_true_rows':matched,'leading_heldout':result['leading'][0]['heldout'],
            'all_true_rows':list(map(list,sorted(true)))}

def main() -> None:
    corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text('utf8'))
    pages=[np.asarray(p['indices'],dtype=np.int64) for p in corpus['pages']
           if p['status']=='unsolved' and p['indices']]
    assert len(pages)==55 and sum(len(p) for p in pages)==12956
    for kind in ('cyclic','sorted'):
        for reset in ('book','page'):
            groups=[rank_decode(np.concatenate(pages),kind)] if reset=='book' else [
                rank_decode(p,kind) for p in pages]
            for phase in range(5):
                blocks=blocks_from_pages(groups,5,phase,reset)
                result=analyze(blocks,5)
                print('ORIGINAL '+json.dumps({
                  'kind':kind,'reset':reset,'phase':phase,
                  'blocks':result['blocks'],
                  'null_heldout':result['expected_null_heldout_chisquare'],
                  'leading':result['leading'][:5],
                  'inverse_rows':result['inverse_rows']
                }),flush=True)
    for kind in ('cyclic','sorted'):
        print('PLANTED '+json.dumps(plant(kind)),flush=True)

if __name__=='__main__':
    main()
