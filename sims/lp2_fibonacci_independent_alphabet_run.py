"""Reproduce periodic controls, frozen original fit/holdout and full-chapter exploratory run.
Run from repository root: python sims/lp2_fibonacci_independent_alphabet_run.py
"""
import json
from pathlib import Path
import numpy as np
from lp2_fibonacci_independent_alphabet_em import fit,encrypt
from lp2_fibonacci_independent_alphabet_bigram import optimize_alpha,viterbi_bi
ROOT=Path(__file__).resolve().parents[1]
R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
RI={s:i for i,s in enumerate(R)}
def gp(s):
    import re
    out=[]
    for w in re.findall('[A-Z]+',s.upper()):
        w=w.replace('QU','CW').replace('ING','NG').replace('IO','IA').translate(str.maketrans('VKQZ','UCCS'))
        i=0
        while i<len(w):
            x=w[i:i+2]
            if x not in RI:x=w[i]
            out.append(RI[x]);i+=len(x)
    return np.array(out,np.int32)
def sources():
    src=ROOT/'resources/control';E=gp((src/'emerson_essays_2944.txt').read_text(encoding='utf-8'));assert len(E)==321327
    p=np.bincount(E,minlength=29).astype(float)+.5;p/=p.sum();B=np.full((29,29),.5);np.add.at(B,(E[:-1],E[1:]),1);L=np.log(B/B.sum(axis=1,keepdims=True))
    Q=[gp((src/'gibran_prophet_58585.txt').read_text(encoding='utf-8'))[10000:11903],gp((src/'shakespeare_first300k.txt').read_text(encoding='utf-8'))[30000:31903]]
    corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'));C=np.array(sum([x['indices'] for x in corpus['pages'] if 15<=x['page']<=22],[]),np.int32);assert len(C)==1903
    return p,L,Q,C
def run(C,K,p,L,seed,restarts=150,cut=1200,truth=None):
    best,top=fit(C[:cut],K,p,restarts=restarts,seed=seed^0x129a)
    r={'unigramFit':float(best[0]) if np.isfinite(best[0]) else None,'finiteRestarts':int(np.isfinite(top).sum())}
    if not best[1]:return r
    A=np.array(best[1]['alpha']);B=np.array(best[1]['beta']);sc,rev,pp,ph,ed,ep,hist=optimize_alpha(C[:cut],B,K,A,p,L,seed^0x3301)
    if cut<len(C):hs,hold,_,_,_=viterbi_bi(C[cut:],B,K,rev,L,np.log(p),ed,ep)
    else:hs,hold=0.,np.empty(0,np.int32)
    legal=bool(np.isfinite(hs));r.update(fitScore=float(sc),heldScore=float(hs) if legal else None,legalHeld=legal,exactReplay=bool(legal and np.array_equal(encrypt(np.r_[pp,hold],K,np.argsort(rev),B,ph),C)),alpha=np.argsort(rev).tolist(),beta=B.tolist())
    if truth is not None:
        P,alpha,beta=truth;gs=[s for s in range(1,29) if any(np.array_equal(K*s%29,np.roll(K,j)) for j in range(len(K)))];g=max(gs,key=lambda s:int(np.sum(B==beta*s%29)));obs=np.bincount(P[:cut],minlength=29)>0
        r.update(fitCorrect=int(np.sum(pp==P[:cut])),heldCorrect=int(np.sum(hold==P[cut:])) if legal else None,gauge=g,betaMatches=int(np.sum(B==beta*g%29)),alphaObservedMatches=int(np.sum((np.argsort(rev)==alpha*g%29)&obs)),alphaObserved=int(obs.sum()))
    return r
if __name__=='__main__':
    import argparse
    a=argparse.ArgumentParser();a.add_argument('--full',action='store_true');args=a.parse_args()
    p,L,Q,C=sources()
    keys=[np.array([5,27,3,1,4,5,9,14,23,8,2,10,12,22]),np.array([1,6,7,13,20,4,24,28,23,22,16,9,25,5])]
    for i,K in enumerate(keys):
        seed=202611260+i
        if not args.full:
            rng=np.random.default_rng(seed);alpha=np.r_[0,rng.permutation(np.arange(1,29))];beta=np.r_[0,rng.permutation(np.arange(1,29))];phase=int(rng.integers(14));E=encrypt(Q[i],K,alpha,beta,phase)
            print(json.dumps({'control':i,**run(E,K,p,L,seed,truth=(Q[i],alpha,beta))}),flush=True)
        print(json.dumps({'original':i,**run(C,K,p,L,seed if not args.full else (0x330100+i)^0x129a,2000 if args.full else 150,len(C) if args.full else 1200)}),flush=True)
