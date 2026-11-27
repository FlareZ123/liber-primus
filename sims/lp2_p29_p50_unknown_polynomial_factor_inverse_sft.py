"""Exact factor-split attack on p29 and p50, ordinary GF(29)[X] convolution.
python sims/lp2_p29_p50_unknown_polynomial_factor_inverse_sft.py
  resources/liber-primus/lp2-corpus.json resources/liber-primus/lp2-grid-256.json
  resources/derived/dukotah-r37-lp1-map-runes.json
Optional --local input_json partial_corpus_json training_json for identical vectors.
"""
import itertools,json,math,sys,warnings
from pathlib import Path
from collections import Counter
import numpy as np
import sympy as sp
from sympy.utilities.exceptions import SymPyDeprecationWarning
warnings.filterwarnings('ignore',category=SymPyDeprecationWarning)
Q=29;X=sp.symbols('X'); MINLEN=40
G=np.array([1,10,25],dtype=np.int64) # (X-24)^2

def conv(a,b): return np.convolve(a,b)%Q

def factor(a):
    p=sp.Poly.from_list([int(x)%Q for x in a],X,modulus=Q)
    u,ff=sp.factor_list(p)
    return int(u)%Q,[(np.array([int(x)%Q for x in f.all_coeffs()],dtype=np.int64),e) for f,e in ff]

def trigram_model(t):
    c1=Counter(t);c2=Counter(zip(t,t[1:]));c3=Counter(zip(t,t[1:],t[2:]));p1=Counter(t[:-1]);p2=Counter(zip(t[:-2],t[1:-1]));W=np.zeros((Q,Q,Q))
    for i,j,k in itertools.product(range(Q),repeat=3):
        a=(c1[k]+.5)/(len(t)+Q*.5);b=(c2[j,k]+5*a)/(p1[j]+5);W[i,j,k]=math.log((c3[i,j,k]+5*b)/(p2[i,j]+5))
    return W

def attack(source,W,truth=None):
    src=np.array(source,dtype=np.int64)%Q
    pad=next(i for i,v in enumerate(src) if v!=0);C=src[pad:]
    unit,ff=factor(C); assert unit==C[0]
    powers=[]
    for f,e in ff:
        ps=[np.array([1],dtype=np.int64)]
        for _ in range(e):ps.append(conv(ps[-1],f))
        powers.append(ps)
    div={}
    for exps in itertools.product(*(range(e+1) for _,e in ff)):
        d=np.array([1],dtype=np.int64)
        for ps,e in zip(powers,exps):d=conv(d,ps[e])
        div[exps]=d
    def score(p):return float(W[p[:-2],p[1:-1],p[2:]].mean())
    cand={}; validG=set();replay=0
    for exps,d in div.items():
        other=tuple(e-k for (_,e),k in zip(ff,exps));k=div[other]*unit%Q
        assert np.array_equal(conv(d,k),C);replay+=1
        if len(d)<MINLEN:continue
        hasG=any(len(f)==2 and f[1]==5 and e-i>=2 for (f,e),i in zip(ff,exps))
        for scale in range(1,Q):
            p=d*scale%Q
            # Rescaling d moves its inverse scale into k; both coefficient orientations tested.
            for rev in (False,True):
                t=p[::-1] if rev else p
                b=t.astype(np.uint8).tobytes()
                if b not in cand:cand[b]=(score(t),exps,scale,rev)
                if hasG:validG.add(b)
    def show(b):
        sc,e,s,r=cand[b];other=tuple(f[1]-i for f,i in zip(ff,e));k=div[other]*unit*pow(s,-1,Q)%Q
        p=np.array(list(b),dtype=np.int64);assert np.array_equal(conv(p[::-1] if r else p,k),C)
        return {'score':sc,'length':len(b),'exponents':list(e),'scale':s,'reverse':r,'key_degree':len(k)-1,'key_contains_G':b in validG,'indices':list(b)}
    ordered=sorted(cand,key=lambda b:cand[b][0],reverse=True)
    topG=[b for b in ordered if b in validG][:3]
    ans={'physical_length':len(src),'effective_degree':len(C)-1,'leading_zero_pad':pad,'unit':unit,'factors':[{'degree':len(f)-1,'multiplicity':e,'indices':f.tolist()} for f,e in ff], 'monic_divisors':len(div),'factor_replays':replay,'candidate_count':len(cand),'candidate_G_count':len(validG),'best':[show(b) for b in ordered[:5]],'best_G':[show(b) for b in topG], 'best_by_minlen':{str(n):show(next(b for b in ordered if len(b)>=n)) for n in (40,75,120,175) if any(len(b)>=n for b in ordered)}}
    if truth is not None:
        b=np.array(truth,dtype=np.uint8).tobytes();ans['truth']={'retained':b in cand,'rank':1+sum(cand[k][0]>cand[b][0]+1e-12 for k in cand),'score':cand[b][0],'key_contains_G':b in validG,'exact':b==ordered[0]}
    return ans

def run(original,corpus,ref):
    W=trigram_model(ref['key']);page=lambda n:next(p['indices'] for p in corpus['pages'] if p['page']==n)
    p56=[];p=1
    for i,v in enumerate(page(56)):
        if i==56:assert v==0;p56.append(0)
        else:p=int(sp.nextprime(p));p56.append((v-p+1)%Q)
    assert p56[:5]==[24,9,18,9,23] and p56.count(0)==1 and len(p56)==85
    known=np.array(p56+page(57),dtype=np.int64)
    assert len(known)==180 and len(original['p29'])==277 and len(original['grid'])==256
    results={n:attack(v,W) for n,v in original.items()}
    # Blind factor split on fixed independent solved-text windows (some overlapping).
    # The unknown factor key contains exactly the source-motivated G multiplier.
    controls=[]
    for seed,offset,n,length,rev in [(3301,0,60,277,False),(1033,28,121,256,True),(2016,5,175,277,False)]:
        t=known[offset:offset+n];assert len(t)==n
        a=t[::-1] if rev else t;assert a[0]!=0
        # Degree K = length-n; after G remove 2 degrees, so random key length = length-n-1.
        rng=np.random.default_rng(seed);r=rng.integers(0,Q,size=length-n-1,dtype=np.int64);r[0]=rng.integers(1,Q)
        key=conv(G,r);C=conv(a,key);assert len(C)==length
        ans=attack(C,W,t);ans['control_spec']={'seed':seed,'offset':offset,'plaintext_length':n,'ciphertext_length':length,'reverse':rev};controls.append(ans)
    return {'original':results,'controls':controls}

if __name__=='__main__':
    read=lambda p:json.loads(Path(p).read_text())
    if sys.argv[1]=='--local': original,corpus,ref=map(read,sys.argv[2:])
    else:
        corpus,grid,ref=map(read,sys.argv[1:4]);original={'p29':next(p['indices'] for p in corpus['pages'] if p['page']==29),'grid':grid['bytes']}
    print(json.dumps(run(original,corpus,ref),indent=2))
