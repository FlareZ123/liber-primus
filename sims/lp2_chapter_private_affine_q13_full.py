import json,sys,time,math,tempfile,subprocess
from pathlib import Path
import numpy as np
from lp2_chapter_private_affine_rank import *
from lp2_chapter_private_affine_exact_map import factors,solve_cycle
from lp2_chapter_private_affine_q13 import opening_data
def run(C,ss,data,leafpath,q=13):
    M=model(data,None);zero=np.flatnonzero(C==0);best=[];total=0;n=0;start=time.monotonic();maxcost=0
    for line in open(leafpath):
        fields=line.split();mask=int(fields[0]);opt=[np.array([int(v) for v in x.split(',')],dtype=np.int16) for x in fields[1:]];assert len(opt)==q
        holds={int(zero[t]) for t in range(len(zero)) if mask>>t&1};slots=np.full(len(C),-1,dtype=np.int16);p=0
        for i in range(len(C)):
            if i not in holds:slots[i]=p;p=(p+1)%q
        for j,o in enumerate(opt):
            d=np.ones(812,dtype=bool)
            for i in np.flatnonzero(slots==j):d&=VALID[int(i in ss),:,C[i]]
            assert np.array_equal(o,np.flatnonzero(d))
        F,const=factors(C,slots,opt,M,q);score_,key,rot,cost=solve_cycle(F,opt);score_+=const;maxcost=max(maxcost,cost);P=np.zeros(len(C),dtype=np.int16)
        for j in range(q):P[slots==j]=INV[key[j],C[slots==j]]
        assert abs(score_-score(P,M))<1e-7 and np.array_equal(enc(P,key,q),C)
        total+=math.prod(len(o) for o in opt);n+=1
        cand=dict(score=score_/len(C),holds=sorted(holds),rows=ROWS[key].tolist(),P=P.tolist())
        best.append(cand);best.sort(key=lambda x:x['score'],reverse=True);best=best[:5]
    return dict(clocks=n,key_clock_pairs=total,max_cost=maxcost,best=best,seconds=time.monotonic()-start)
if __name__=='__main__':
    C,ss,data=fixture(sys.argv[1]) if sys.argv[1].endswith('.json') else opening_data(sys.argv[1]);assert len(C)==729 and ss=={176,244,350,530,644}
    with tempfile.TemporaryDirectory() as td:
        ip=Path(td)/'input.txt';op=Path(td)/'leaves.txt'
        ip.write_text(''.join('0123456789abcdefghijklmnopqrs'[int(x)] for x in C)+'\n'+' '.join(map(str,sorted(ss)))+'\n')
        subprocess.run([str(Path(sys.argv[2]).resolve()),str(ip),str(op)],check=True)
        x=run(C,ss,data,op)
    assert x['clocks']==536 and x['key_clock_pairs']==1028184
    print(json.dumps(x))
