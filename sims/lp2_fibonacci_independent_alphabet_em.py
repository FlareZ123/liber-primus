"""Independent GP29 alphabet receiver: exact periodic phase posterior and M steps."""
import numpy as np
from scipy.optimize import linear_sum_assignment
from numba import njit
@njit(cache=True)
def stats(C,beta,K,p,eps):
    n=C.size;q=K.size
    emit=np.empty((29,q))
    for c in range(29):
        for t in range(q):
            r=(beta[c]-K[t])%29
            emit[c,t]=p[r] if r else eps*p[0]
    f=np.empty((n+1,q));f[0]=1/q;sc=np.empty(n);ll=0.
    for i in range(n):
        c=C[i]
        for t in range(q):
            f[i+1,t]=f[i,(t-1)%q]*emit[c,(t-1)%q]
            if c==0:f[i+1,t]+=f[i,t]*p[0]
        z=np.sum(f[i+1]);sc[i]=z
        if z<=0:return -np.inf,np.zeros((29,q)),0.
        f[i+1]/=z;ll+=np.log(z)
    G=np.zeros((29,q));H=0.;b=np.ones(q)
    for i in range(n-1,-1,-1):
        c=C[i];bb=np.empty(q)
        for t in range(q):
            v=emit[c,t]*b[(t+1)%q];G[c,t]+=f[i,t]*v/sc[i]
            if c==0:
                h=p[0]*b[t];H+=f[i,t]*h/sc[i];v+=h
            bb[t]=v/sc[i]
        b=bb
    return ll,G,H
@njit(cache=True)
def viterbi(C,beta,K,p):
    n=C.size;q=K.size;logp=np.log(p);v=np.zeros(q);back=np.zeros((n,q),np.int32);out=np.zeros((n,q),np.int32)
    for i in range(n):
        c=C[i];vv=np.full(q,-np.inf)
        for t in range(q):
            if c==0 and v[t]+logp[0]>vv[t]:vv[t]=v[t]+logp[0];back[i,t]=t;out[i,t]=0
            r=(beta[c]-K[t])%29;u=(t+1)%q
            if r and v[t]+logp[r]>vv[u]:vv[u]=v[t]+logp[r];back[i,u]=t;out[i,u]=r
        v=vv
    t=np.argmax(v);P=np.empty(n,np.int32);score=v[t]
    for i in range(n-1,-1,-1):P[i]=out[i,t];t=back[i,t]
    return score,P,t
def fit(C,K,p0,restarts=200,iterations=50,seed=10):
    rng=np.random.default_rng(seed);best=(-np.inf,None);top=[];ix=np.arange(29);delta=(ix[:,None]-K[None,:])%29
    for start in range(restarts):
        beta=np.r_[0,rng.permutation(np.arange(1,29))];alpha=np.r_[0,rng.permutation(np.arange(1,29))]
        stable=0
        for it in range(iterations):
            eps=10.**(-min(12,1+it//5))
            p=p0[np.argsort(alpha)];ll,G,H=stats(C,beta,K,p,eps)
            if not np.isfinite(ll):break
            logp=np.log(p);logp[0]+=np.log(eps)
            W=G[1:]@logp[delta[1:]].T
            _,j=linear_sum_assignment(W,maximize=True);nbeta=np.r_[0,j+1]
            mass=np.zeros(29)
            for c in range(29):np.add.at(mass,delta[nbeta[c]],G[c])
            mass[0]+=H
            na=np.zeros(29,dtype=np.int64);na[np.argsort(p0[1:])+1]=np.argsort(mass[1:])+1
            if np.array_equal(nbeta,beta) and np.array_equal(na,alpha):stable+=1
            else:stable=0
            beta,alpha=nbeta,na
            if stable>=4 and eps<=1e-10:break
        p=p0[np.argsort(alpha)];ll,G,H=stats(C,beta,K,p,0.)
        if np.isfinite(ll):
            sc,rank,ph=viterbi(C,beta,K,p);P=np.argsort(alpha)[rank]
            if ll>best[0]:
                best=(ll,dict(alpha=alpha.tolist(),beta=beta.tolist(),phase=int(ph),P=P.tolist(),viterbi=float(sc),hold=float(H),start=start))
        top.append(float(ll))
    return best,top
def encrypt(P,K,alpha,beta,t):
    C=[];rb=np.argsort(beta)
    for p in P:
        if p==0:C.append(0)
        else:C.append(rb[(alpha[p]+K[t])%29]);t=(t+1)%len(K)
    return np.array(C,dtype=np.int32)
