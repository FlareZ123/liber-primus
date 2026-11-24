"""Exact max-plus cyclic trigram optimization with closure branch-and-bound.
Usage: python sims/lp2_chapter_private_affine_bounded.py .
"""
import json, time, sys, heapq
import numpy as np
from lp2_chapter_private_affine_rank import *
from lp2_chapter_private_affine_exact_map import factors,solve_cycle

def bound_cycle(F,opt):
    q=len(F);sizes=[len(o) for o in opt]
    assert q>=4
    def cost(r):
        ds=sizes[r:]+sizes[:r];return ds[0]*sum(ds[i-2]*ds[i-1]*ds[i] for i in range(2,q))
    r=min(range(q),key=cost);ff=F[r:]+F[:r];oo=opt[r:]+opt[:r];d=[len(o) for o in oo]
    best=-np.inf;winner=None;nodes=0;pruned=0;heap=[]
    def test(a,bs):
        nonlocal best,winner,nodes,pruned
        nodes+=1
        cur=ff[2][a,bs,:];backs=[]
        for j in range(3,q):
            f=ff[j][bs,:,:] if j==3 else ff[j]
            val=cur[:,:,None]+f;idx=val.argmax(axis=0);cur=val.max(axis=0);backs.append(idx)
        closure=ff[1][:,a,bs].max(axis=1)
        cur=cur+ff[0][:,:,a]+closure[None,:]
        flat=int(cur.argmax());ub=float(cur.flat[flat]);k=list(np.unravel_index(flat,cur.shape))
        if ub<best-1e-9:pruned+=1;return
        for idx in backs[::-1]:k.insert(0,int(idx[k[0],k[1]]))
        k=[a,int(bs[k[0]])]+k[1:];assert len(k)==q
        z=sum(float(ff[j][k[(j-2)%q],k[(j-1)%q],k[j]]) for j in range(q))
        assert z<=ub+1e-8
        if z>best:best=z;winner=k
        if len(bs)>1 and ub>best+1e-9:heapq.heappush(heap,(-ub,nodes,a,bs))
    for a in range(d[0]):test(a,np.arange(d[1]))
    while heap:
        negub,_,a,bs=heapq.heappop(heap)
        if -negub<=best+1e-9:pruned+=1;continue
        half=len(bs)//2;test(a,bs[:half]);test(a,bs[half:])
    key=np.roll(np.array([oo[j][winner[j]] for j in range(q)]),r)
    return best,key,nodes,pruned

def run(C,ss,M,q,n):
    C=C[:n];ss={i for i in ss if i<n};L,_,cap=schedules(C,ss,q);assert not cap
    best=None;start=time.monotonic()
    for k,(slots,D,phase) in enumerate(L):
        opts=[ids(d) for d in D];F,c=factors(C,slots,opts,M,q)
        z,key,nodes,pruned=bound_cycle(F,opts);z+=c
        P=np.zeros(len(C),dtype=np.int16)
        for j in range(q):P[slots==j]=INV[key[j],C[slots==j]]
        assert abs(score(P,M)-z)<1e-7
        assert np.array_equal(enc(P,key,q),C)
        if q==8:
            x,y,*_=solve_cycle(F,opts);assert abs(x+c-z)<1e-7
        if best is None or z>best['z']:best=dict(z=z,key=ROWS[key].tolist(),P=P.tolist(),holds=np.flatnonzero(slots<0).tolist(),k=k)
        print(json.dumps(dict(q=q,n=n,k=k,nodes=nodes,pruned=pruned,score=z/n,best=best['z']/n,elapsed=time.monotonic()-start)),flush=True)
    print(json.dumps(dict(q=q,n=n,summary=best,score=best['z']/n,seconds=time.monotonic()-start)),flush=True)
    return best,len(L)

def main():
    C,ss,data=fromrepo(sys.argv[1]);M=model(data,None)
    rng=np.random.default_rng(153)
    for q in [8,13]:
        for _ in range(8):
            opt=[np.arange(rng.integers(2,6)) for j in range(q)]
            F=[rng.normal(size=tuple(len(opt[(j+d)%q]) for d in [-2,-1,0])) for j in range(q)]
            z,k,*_=bound_cycle(F,opt);v,*_=solve_cycle(F,opt);assert abs(z-v)<1e-7
    results=[]
    for q,n in [(8,308),(13,308),(13,232)]:
        best,leaves=run(C,ss,M,q,n);results.append((leaves,best['z']/n))
        if n==232:
            P=np.array(best['P']);key=np.array([(a-1)*29+b for a,b in best['key']])
            f={'P':P,'key':key,'phase':int(np.count_nonzero(P))%q}
            x=extend(C[n:],{i-n for i in ss if i>=n},M,f,q);assert x is None
    for (leaves,z),(el,ez) in zip(results,[(28,-4.483797517817217),(63,-3.9176798120063143),(8,-3.693371970539474)]):
        assert leaves==el and abs(z-ez)<1e-8
if __name__=='__main__':main()
