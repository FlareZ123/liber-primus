"""Agent5: F-transparent masked p55 historical crib, affine reversible key orders 1..5.
Derived recurrence search from Agent31 sims/lp2_p55_masked_affine_recurrence.py.
Run this standalone against the embedded canonical p55 indices or check them
against the original source corpus at resources/liber-primus/lp2-corpus.json.
"""
import numpy as np
from time import perf_counter
from itertools import product
Q=29
GP='F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()
C=np.array([21,25,19,10,7,15,17,14,19,15,12,6,23,2,25,0,27,24,17,5,1,7,4,17,28,0,14,10,19,1,5,13,8,21,20,12,19,15,23,27,13,0,17,8,12,5,12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10],dtype=np.int16)
PHRASE='CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT'

def tokenize(phrase):
    tokens=[]
    for word in phrase.split(' '):
        if tokens: tokens.append(-1)
        while word:
            s=next(s for s in sorted(GP,key=len,reverse=True) if word.startswith(s))
            tokens.append(GP.index(s));word=word[len(s):]
    return np.array(tokens,dtype=np.int16)

def masks(c,p):
    """All legal skip masks for known and unknown plaintext positions."""
    forced=np.flatnonzero(p==0)
    if np.any(c[forced]!=0): return
    optional=np.flatnonzero((c==0)&(p<0))
    for bits in product((False,True),repeat=len(optional)):
        skip=np.zeros(len(c),dtype=bool);skip[forced]=True;skip[optional]=bits
        cc,pp=c[~skip],p[~skip]
        masked=np.where(pp>=0,(cc-pp)%Q,-1)
        yield skip,masked,cc

def recover(masked, c_consumed, d, batch=250_000):
    """Exhaust all coefficients; anchor determines constant and initial state.
    The F rule forbids zero decoded plaintext at every consumed position,
    including unknown crib slots. A valid candidate must satisfy K_i != C_i.
    """
    known=masked>=0;n=len(masked)
    starts=[i for i in range(n-d) if np.all(known[i:i+d+1])]
    if not starts: raise ValueError('no known d+1 run')
    anchor=max(starts,key=lambda i:sum(known[max(0,i-4):min(n,i+d+5)]))
    base=masked[anchor:anchor+d].astype(np.int32)
    inv=np.array([0]+[pow(i,-1,Q) for i in range(1,Q)],dtype=np.int32)
    all_count=0;after_windows=0;after_fwd=0;survivors=[]
    offsets=np.array([Q**i for i in range(d)],dtype=np.int64)
    window_x=np.stack([masked[i:i+d] for i in starts]).astype(np.int32)
    window_y=masked[np.array(starts)+d].astype(np.int32)
    for lo in range(0,Q**d,batch):
        ids=np.arange(lo,min(lo+batch,Q**d),dtype=np.int64)
        a=((ids[:,None]//offsets)%Q).astype(np.int32)
        a=a[a[:,0]!=0];all_count+=len(a)
        if not len(a):continue
        b=(int(masked[anchor+d])-a@base)%Q
        for x,y in zip(window_x,window_y):
            ok=(a@x+b)%Q==y;a,b=a[ok],b[ok]
            if not len(a):break
        after_windows+=len(a)
        if not len(a):continue
        state=np.repeat(base[None,:],len(a),axis=0)
        for j in range(anchor+d,n):
            v=(np.sum(state*a,axis=1)+b)%Q
            state=np.column_stack((state[:,1:],v))
            ok=v!=c_consumed[j]
            if known[j]:ok&=v==masked[j]
            a,b,state=a[ok],b[ok],state[ok]
            if not len(a):break
        after_fwd+=len(a)
        if not len(a):continue
        state=np.repeat(base[None,:],len(a),axis=0)
        for j in range(anchor-1,-1,-1):
            v=((state[:,-1]-b-np.sum(state[:,:-1]*a[:,1:],axis=1))*inv[a[:,0]])%Q
            state=np.column_stack((v,state[:,:-1]))
            ok=v!=c_consumed[j]
            if known[j]:ok&=v==masked[j]
            a,b,state=a[ok],b[ok],state[ok]
            if not len(a):break
        for coeff,const,first in zip(a,b,state):
            tape=list(map(int,first))
            while len(tape)<n:tape.append(int((const+np.dot(coeff,tape[-d:]))%Q))
            assert np.array_equal(np.array(tape)[known],masked[known])
            assert np.all(np.array(tape)!=c_consumed)
            survivors.append((list(map(int,coeff)),int(const),tape))
    return dict(order=d,anchor=anchor,fully_known_windows=len(starts),enumerated=all_count,window_survivors=after_windows,forward_survivors=after_fwd,solutions=survivors)

def encrypt(p,key):
    out=[];i=0
    for x in p:
        if x==0:out.append(0)
        else:out.append((int(x)+key[i])%Q);i+=1
    return np.array(out,dtype=np.int16)

def plant(p,d):
    rng=np.random.default_rng(5100+d)
    plain=np.where(p>=0,p,rng.integers(0,Q,len(p))).astype(np.int16)
    # Force an unknown F to exercise both skip branches on at least one control.
    plain[np.flatnonzero(p<0)[0]]=0
    a=rng.integers(0,Q,d);a[0]=rng.integers(1,Q);b=int(rng.integers(0,Q))
    s=list(map(int,rng.integers(0,Q,d)))
    while len(s)<np.sum(plain!=0):s.append(int((b+np.dot(a,s[-d:]))%Q))
    c=encrypt(plain,s);skip=plain==0
    true_masks=[(m,k,cc) for m,k,cc in masks(c,p) if np.array_equal(m,skip)]
    assert len(true_masks)==1
    _,k,cc=true_masks[0]
    res=recover(k,cc,d)
    assert (a.tolist(),b,s) in res['solutions']
    assert np.array_equal(encrypt(plain,s),c)
    print('plant',d,'survivors',len(res['solutions']),'true full tape and F mask included',flush=True)

if __name__=='__main__':
    p=tokenize(PHRASE);assert len(p)==75 and np.sum(p>=0)==59
    assert list(np.flatnonzero(p==0))==[40]
    orig=list(masks(C[1:],p));assert len(orig)==2
    for skip,m,cc in orig:
        print('original skip',np.flatnonzero(skip).tolist(),'consumed',len(m),'known',int(np.sum(m>=0)),flush=True)
        for d in range(1,6):
            t=perf_counter();r=recover(m,cc,d)
            print('original',r,'seconds',round(perf_counter()-t,3),flush=True)
    for d in range(1,6):plant(p,d)
