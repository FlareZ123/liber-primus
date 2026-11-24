import json,time,sys,math
import numpy as np
from lp2_chapter_private_affine_rank import *

def factors(C,slots,opt,M,q):
    u,b,t=M
    F=[np.zeros(tuple(len(opt[(j+d)%q]) for d in [-2,-1,0]),dtype=float) for j in range(q)]
    constant=0.
    for i in range(len(C)):
        end=i;start=max(0,i-2);seq=list(range(start,end+1));used=[slots[k] for k in seq if slots[k]>=0]
        M_i=u if i==0 else b if i==1 else t
        if not used:
            constant+=float(M_i[(0,)*len(seq)]);continue
        j=int(used[-1]); axes=[(j-2)%q,(j-1)%q,j];args=[]
        for k in seq:
            p=int(slots[k])
            if p<0:args.append(0);continue
            a=axes.index(p); shape=[1,1,1];shape[a]=len(opt[p]);args.append(INV[opt[p],C[k]].reshape(shape))
        F[j]+=M_i[tuple(args)]
    return F,constant

def solve_cycle(F,opt):
    q=len(F);sizes=[len(o) for o in opt]
    def cost(r):
        ds=sizes[r:]+sizes[:r];return ds[0]*ds[1]*sum(ds[i-2]*ds[i-1]*ds[i] for i in range(2,q))
    r=min(range(q),key=cost);ff=F[r:]+F[:r];oo=opt[r:]+opt[:r];d=[len(o) for o in oo]
    best=None
    for a in range(d[0]):
        for b in range(d[1]):
            cur=ff[2][a,b,:][None,:];backs=[]
            for j in range(3,q):
                if j==3:
                    val=cur.T+ff[j][b,:,:];cur=val;continue
                val=cur[:,:,None]+ff[j];idx=val.argmax(axis=0);cur=val.max(axis=0);backs.append(idx)
            cur=cur+ff[0][:,:,a]+ff[1][:,a,b][None,:]
            flat=int(cur.argmax());z=float(cur.flat[flat]);k=list(np.unravel_index(flat,cur.shape))
            if best is None or z>best[0]:
                for idx in backs[::-1]:k.insert(0,int(idx[k[0],k[1]]))
                k=[a,b]+k;assert len(k)==q
                key=np.array([oo[j][k[j]] for j in range(q)]);key=np.roll(key,r)
                best=(z,key,r,cost(r))
    return best

def exact(C,ss,M,q=8):
    leaves,nodes,cap=schedules(C,ss,q);assert not cap;best=None;info=[]
    for k,(slots,D,phase) in enumerate(leaves):
        opt=[ids(d) for d in D];F,const=factors(C,slots,opt,M,q);z,key,r,cost=solve_cycle(F,opt);z+=const
        P=np.zeros(len(C),dtype=np.int16)
        for j in range(q):P[slots==j]=INV[key[j],C[slots==j]]
        direct=score(P,M);assert abs(z-direct)<1e-7,(z,direct)
        assert np.array_equal(enc(P,key,q),C)
        info.append(dict(k=k,holds=np.flatnonzero(slots<0).tolist(),domains=[len(o) for o in opt],score=z/len(C),rotation=r,ops=cost))
        if best is None or z>best['score']:best=dict(score=z,key=key,P=P,phase=phase,slots=slots)
    return best,info

if __name__=='__main__':
    C,ss,data=fixture(sys.argv[1]) if sys.argv[1].endswith('.json') else fromrepo(sys.argv[1]);M=model(data,None);start=time.monotonic();f,info=exact(C[:SPLIT],{i for i in ss if i<SPLIT},M)
    x=extend(C[SPLIT:],{i-SPLIT for i in ss if SPLIT<=i<TOTAL},M,f)
    if x:assert np.array_equal(enc(np.concatenate([f['P'],x[1]]),f['key']),C)
    print(json.dumps(dict(exact=True,info=info,key=ROWS[f['key']].tolist(),prefix_score=f['score']/SPLIT,prefix=f['P'].tolist(),suffix_score=x[0]/76 if x else None,suffix=x[1].tolist() if x else None,seconds=time.monotonic()-start)))
