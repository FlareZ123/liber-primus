"""Bigram stage for the independent-alphabet periodic receiver."""
import numpy as np
from numba import njit
from lp2_fibonacci_independent_alphabet_em import viterbi
@njit(cache=True)
def qscore(B,L,a):
    s=0.
    for i in range(29):
        for j in range(29):s+=B[i,j]*L[a[i],a[j]]
    return s
@njit(cache=True)
def change(B,L,a,i,j):
    ai=a[i];aj=a[j];s=0.
    for k in range(29):
        if k==i or k==j:continue
        ak=a[k]
        s+=(B[i,k]-B[j,k])*(L[aj,ak]-L[ai,ak])+(B[k,i]-B[k,j])*(L[ak,aj]-L[ak,ai])
    s+=(B[i,i]-B[j,j])*(L[aj,aj]-L[ai,ai])+(B[i,j]-B[j,i])*(L[aj,ai]-L[ai,aj])
    return s
@njit(cache=True)
def anneal(B,L,initial,seed,restarts=50,steps=10000):
    np.random.seed(seed);best=initial.copy();bestscore=qscore(B,L,best)
    for r in range(restarts):
        a=best.copy() if r%4 else initial.copy()
        if r>0:
            for i in range(1,29):
                j=np.random.randint(1,29);a[i],a[j]=a[j],a[i]
        sc=qscore(B,L,a)
        for s in range(steps):
            T=20.*(0.005**(s/steps));i=np.random.randint(1,29);j=np.random.randint(1,29)
            if i==j:continue
            d=change(B,L,a,i,j)
            if d>=0 or np.random.random()<np.exp(d/T):
                a[i],a[j]=a[j],a[i];sc+=d
                if sc>bestscore:bestscore=sc;best=a.copy()
    assert abs(qscore(B,L,best)-bestscore)<1e-5
    return bestscore,best
@njit(cache=True)
def viterbi_bi(C,beta,K,rev_alpha,L,uni,initial_phase=-1,initial_prev=-1):
    n=C.size;q=K.size;v=np.full((q,29),-np.inf);backT=np.zeros((n,q,29),np.int8);backP=np.zeros((n,q,29),np.int8)
    for t in range(q):
        if initial_phase>=0 and t!=initial_phase:continue
        if initial_prev>=0:v[t,initial_prev]=0
        else:v[t,:]=0.
    for i in range(n):
        c=C[i];vv=np.full((q,29),-np.inf)
        for t in range(q):
            r=(beta[c]-K[t])%29;p=rev_alpha[r];u=(t+1)%q
            for old in range(29):
                z=v[t,old]
                if not np.isfinite(z):continue
                if c==0:
                    s=z+(uni[0] if i==0 and initial_prev<0 else L[old,0])
                    if s>vv[t,0]:vv[t,0]=s;backT[i,t,0]=t;backP[i,t,0]=old
                if r:
                    s=z+(uni[p] if i==0 and initial_prev<0 else L[old,p])
                    if s>vv[u,p]:vv[u,p]=s;backT[i,u,p]=t;backP[i,u,p]=old
        v=vv
    x=np.argmax(v);t=x//29;p=x%29;score=v[t,p];end=t;endp=p
    out=np.empty(n,np.int32)
    if not np.isfinite(score):return score,out,t,end,endp
    for i in range(n-1,-1,-1):
        out[i]=p;nt=backT[i,t,p];p=backP[i,t,p];t=nt
    return score,out,t,end,endp
def optimize_alpha(C,beta,K,alpha,p,L,seed,restarts=100):
    _,rr,_=viterbi(C,beta,K,p[np.argsort(alpha)]);rev=np.argsort(alpha)
    prev=-np.inf;hist=[]
    for j in range(3):
        B=np.zeros((29,29),np.int64);np.add.at(B,(rr[:-1],rr[1:]),1)
        sc,rev=anneal(B,L,rev,seed+j,restarts if j==0 else 20,8000)
        sc,P,ph,ed,ep=viterbi_bi(C,beta,K,rev,L,np.log(p));hist.append(float(sc));rr=np.argsort(rev)[P]
        if sc<=prev+1e-6:break
        prev=sc
    return sc,rev,P,ph,ed,ep,hist
