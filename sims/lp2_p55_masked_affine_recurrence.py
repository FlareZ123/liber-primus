"""Exact short affine recurrence recovery from a masked GF(29) crib.
The original C data are from repo resources/liber-primus/lp2-corpus.json
blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, physical p55.
No space symbol is assigned. All coefficients and constant are private.
"""
import numpy as np
from time import perf_counter

Q=29
GP='F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split()
C=np.array([21,25,19,10,7,15,17,14,19,15,12,6,23,2,25,0,27,24,17,5,1,7,4,17,28,0,14,10,19,1,5,13,8,21,20,12,19,15,23,27,13,0,17,8,12,5,12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10],dtype=np.int16)
PHRASE='CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT'

def tokenize(phrase, contract):
    tokens=[]
    for word in phrase.split(' '):
        if tokens: tokens.append(-1)
        while word:
            s=next(s for s in sorted(GP,key=len,reverse=True) if word.startswith(s)) if contract else word[0]
            tokens.append(GP.index(s)); word=word[len(s):]
    return np.array(tokens,dtype=np.int16)

def recover(masked, d, batch=250_000):
    """Recover s[n+d]=b+sum(a[i]*s[n+i]) mod Q, with a[0]!=0.
    Choose known run of d+1 terms. Its equation fixes b. Enumerate all d
    coefficients, reject a[0]=0 (reversible recurrence requirement), use anchor d states
    to determine entire forward/back tape.
    """
    known=masked>=0; n=len(masked)
    starts=[i for i in range(n-d) if np.all(known[i:i+d+1])]
    if not starts: raise ValueError('no known d+1 run')
    anchor=max(starts,key=lambda i: sum(known[max(0,i-4):min(n,i+d+5)]))
    base=masked[anchor:anchor+d].astype(np.int32)
    inv=np.array([0]+[pow(i,-1,Q) for i in range(1,Q)],dtype=np.int32)
    all_count=0; after_windows=0; after_fwd=0; survivors=[]
    offsets=np.array([Q**i for i in range(d)],dtype=np.int64)
    window_x=np.stack([masked[i:i+d] for i in starts]).astype(np.int32)
    window_y=masked[np.array(starts)+d].astype(np.int32)
    for lo in range(0,Q**d,batch):
        ids=np.arange(lo,min(lo+batch,Q**d),dtype=np.int64)
        a=((ids[:,None]//offsets)%Q).astype(np.int32)
        a=a[a[:,0]!=0]; all_count+=len(a)
        if not len(a): continue
        b=(int(masked[anchor+d])-a@base)%Q
        for x,y in zip(window_x,window_y):
            ok=(a@x+b)%Q==y
            a,b=a[ok],b[ok]
            if not len(a): break
        after_windows+=len(a)
        if not len(a): continue
        state=np.repeat(base[None,:],len(a),axis=0)
        for j in range(anchor+d,n):
            v=(np.sum(state*a,axis=1)+b)%Q
            state=np.column_stack((state[:,1:],v))
            if known[j]:
                ok=v==masked[j]; a,b,state=a[ok],b[ok],state[ok]
                if not len(a): break
        after_fwd+=len(a)
        if not len(a): continue
        state=np.repeat(base[None,:],len(a),axis=0)
        for j in range(anchor-1,-1,-1):
            v=((state[:,-1]-b-np.sum(state[:,:-1]*a[:,1:],axis=1))*inv[a[:,0]])%Q
            state=np.column_stack((v,state[:,:-1]))
            if known[j]:
                ok=v==masked[j]; a,b,state=a[ok],b[ok],state[ok]
                if not len(a): break
        for coeff,const,first in zip(a,b,state):
            tape=list(map(int,first))
            while len(tape)<n: tape.append(int((const+np.dot(coeff,tape[-d:]))%Q))
            assert np.array_equal(np.array(tape)[known],masked[known])
            survivors.append((list(map(int,coeff)),int(const),tape))
    return dict(order=d,anchor=anchor,fully_known_windows=len(starts),enumerated=all_count,window_survivors=after_windows,forward_survivors=after_fwd,solutions=survivors)

def plant(p, d):
    rng=np.random.default_rng(3100+d)
    a=rng.integers(0,Q,d);a[0]=rng.integers(1,Q);b=int(rng.integers(0,Q))
    s=list(map(int,rng.integers(0,Q,d)))
    while len(s)<len(p):s.append(int((b+np.dot(a,s[-d:]))%Q))
    m=np.where(p>=0,np.array(s),-1)
    res=recover(m,d)
    assert (a.tolist(),b,s) in res['solutions']
    print('plant',d,'survivors',len(res['solutions']), 'exact full tape included',flush=True)

if __name__=='__main__':
    p=tokenize(PHRASE,True); assert len(p)==75 and np.sum(p>=0)==59
    for d in range(1,6):
        t=perf_counter(); m=np.where(p>=0,(C[1:]-p)%Q,-1)
        r=recover(m,d); print('original',r,'seconds',round(perf_counter()-t,3),flush=True)
        plant(p,d)
