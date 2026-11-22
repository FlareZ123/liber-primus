"""Original-source five-position affine-feedback Fourier scan.

Find linear relations among five consecutive ciphertext runes without guessing
the F29 coefficients. The FFT searches all 29^5 frequency vectors, then scores
candidate projective lines on a withheld half of the original manuscript.
Distinct from fixed nonoverlapping Hill block tests.
Run: python sims/sliding_five_linear_recurrence_fft.py
"""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
from hill_fourier_blind_inverse import M,ROOT,canonical,contrast

def sliding(sequences: list[np.ndarray]) -> np.ndarray:
    return np.concatenate([np.lib.stride_tricks.sliding_window_view(page,5)
                           for page in sequences if len(page)>=5])

def select(train: np.ndarray, top: int=16000) -> list[tuple[int,...]]:
    from scipy.fft import fftn
    hist=np.zeros((M,)*5,dtype=np.float32)
    np.add.at(hist,tuple(train.T),1)
    z=fftn(hist,workers=2,overwrite_x=True)
    power=np.square(z.real)+np.square(z.imag)
    flat=power.ravel()
    flat[0]=0
    idx=np.argpartition(flat,-top)[-top:]
    idx=idx[np.argsort(flat[idx])[::-1]]
    rows={}
    for index in idx:
        row=canonical(tuple(int(x) for x in np.unravel_index(int(index),hist.shape)))
        if sum(bool(x) for x in row)>=3:
            rows[row]=None
    return sorted(rows,key=lambda row:contrast(train,row),reverse=True)

def score(blocks: np.ndarray) -> dict:
    split=len(blocks)//2
    train,test=blocks[:split],blocks[split:]
    rows=select(train)
    out=[]
    for row in rows[:30]:
        a=(train@np.array(row))%M
        b=(test@np.array(row))%M
        h=np.bincount(a,minlength=M)
        peak=int(np.argmax(h))
        out.append({'row':list(row),'train':round(contrast(train,row),7),
                    'heldout':round(contrast(test,row),7),
                    'training_peak':peak,
                    'training_peak_rate':round(float(np.mean(a==peak)),6),
                    'heldout_peak_rate':round(float(np.mean(b==peak)),6)})
    return {'windows':len(blocks),'train':len(train),'heldout':len(test),
            'null_chisquare':round(28/len(test),7),
            'candidates':len(rows),'top':out[:12]}

def plant(size: int=12956) -> dict:
    rng=np.random.default_rng(0x24555)
    c=rng.integers(0,M,size,dtype=np.int64)
    q=.07
    for i in range(4,size):
        if rng.random()<q:
            c[i]=(3*c[i-1]+5*c[i-2]+7*c[i-3]+11*c[i-4]+13)%M
        else:
            c[i]=(c[i-1]+1+int(rng.integers(28)))%M
    blocks=sliding([c])
    result=score(blocks)
    true=canonical(tuple((-11,-7,-5,-3,1)))
    found=[tuple(e['row']) for e in result['top']]
    result.update({'q':q,'true_projective_row':list(true),
                   'recovered':true in found})
    assert result['recovered'],result
    return result

def main() -> None:
    data=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text('utf8'))
    pages=[np.asarray(p['indices'],dtype=np.int64) for p in data['pages']
           if p['status']=='unsolved' and p['indices']]
    assert len(pages)==55 and sum(len(p) for p in pages)==12956
    for mode in ('book','page'):
        groups=[np.concatenate(pages)] if mode=='book' else pages
        print('ORIGINAL '+json.dumps({'mode':mode,**score(sliding(groups))}),flush=True)
    print('PLANTED '+json.dumps(plant()),flush=True)

if __name__=='__main__':
    main()
