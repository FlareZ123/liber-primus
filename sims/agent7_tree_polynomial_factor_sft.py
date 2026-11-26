"""Complete GF(29) factor/divisor inverse for the seven tree pages. Requires SymPy."""
import argparse
import hashlib
import json
import math
import random
import numpy as np
from collections import Counter
from pathlib import Path
from sympy.polys.domains import ZZ
from sympy.polys.galoistools import gf_factor, gf_mul, gf_quo, gf_rem

Q = 29
MIN = 50
HELD = ('0_wisdom', 'jpg229', 'p56_an_end', 'p57_parable')


def run(corpus, native, part="all"):
    rune_index = {r:i for i,r in enumerate(corpus['runes'])}
    pages = {p['page']:p['indices'] for p in corpus['pages'] if 8 <= p['page'] <= 14}
    sections = {s['name']:[rune_index[r] for r in s['source_text'] if r in rune_index] for s in native['sections']}
    training = [v for k,v in sections.items() if k not in HELD]
    u, b, t = Counter(), Counter(), Counter()
    for a in training:
        u.update(a); b.update(zip(a,a[1:])); t.update(zip(a,a[1:],a[2:]))
    bc,tc=Counter(),Counter()
    for (x,y),n in b.items():bc[x]+=n
    for (x,y,z),n in t.items():tc[x,y]+=n
    size=sum(u.values())
    p1=[(u[x]+.5)/(size+Q*.5) for x in range(Q)]
    p2=[[ (b[x,y]+16*p1[y])/(bc[x]+16) for y in range(Q)] for x in range(Q)]
    lp3=[[[math.log((t[x,y,z]+32*p2[y][z])/(tc[x,y]+32)) for z in range(Q)] for y in range(Q)] for x in range(Q)]

    l1=np.log(np.asarray(p1));l2=np.log(np.asarray(p2));l3=np.asarray(lp3)
    def scores(a):
        return (l1[a[:,0]]+l2[a[:,0],a[:,1]]+l3[a[:,:-2],a[:,1:-1],a[:,2:]].sum(axis=1))/a.shape[1]
    def score(a):return float(scores(np.asarray([a],dtype=np.int64))[0])

    def mul(a,b):
        return [int(x) for x in gf_mul(a,b,Q,ZZ)]

    def candidates(c, truth=None):
        assert c[0] != 0
        scalar,factors=gf_factor(c,Q,ZZ)
        fs=[([int(x) for x in f],int(e)) for f,e in factors]
        product=[int(scalar)]
        powers=[]
        for f,e in fs:
            row=[[1]]
            for _ in range(e):row.append(mul(row[-1],f))
            powers.append(row);product=mul(product,row[-1])
        assert product==c
        best=[]; count=0
        true_score=score(truth) if truth is not None else None
        true_rank=1; found=False
        scales=np.arange(1,Q,dtype=np.int64)[:,None]
        # Generate each monic divisor once by recursive polynomial products.
        def divisors(i,a):
            if i==len(powers):
                yield a
                return
            for factor in powers[i]:
                yield from divisors(i+1,a if len(factor)==1 else np.convolve(a,np.asarray(factor,dtype=np.int64))%Q)
        for a in divisors(0,np.array([1],dtype=np.int64)):
            if len(a)<MIN:continue
            p=(scales*a)%Q;ss=scores(p);count+=Q-1
            if truth is not None:
                same=np.all(p==np.asarray(truth),axis=1) if len(a)==len(truth) else np.zeros(Q-1,dtype=bool)
                if same.any():found=True
                true_rank+=int(((ss>true_score)&~same).sum())
            for k in np.argsort(-ss,kind="stable")[:3]:
                z=(float(ss[k]),p[k].tolist())
                if len(best)<3 or z[0]>best[-1][0]:
                    best.append(z);best.sort(key=lambda z:z[0],reverse=True);best=best[:3]
        best.sort(key=lambda z:z[0],reverse=True)
        top=[]
        for s,p in best[:3]:
            assert not gf_rem(c,p,Q,ZZ)
            assert mul(p,gf_quo(c,p,Q,ZZ))==c
            top.append(dict(score=s,n=len(p),indices=p,translit=''.join(corpus['translit'][x] for x in p)))
        result=dict(n=len(c),factor_degrees=[[len(f)-1,e] for f,e in fs],scalar=int(scalar),divisors=math.prod(e+1 for f,e in fs),tested=count,top=top)
        if truth is not None:
            assert found
            result.update(true_rank=true_rank,true_score=true_score,exact_top=best[0][1]==truth)
        return result

    original={str(k):candidates(v) for k,v in pages.items()} if part in ("all","original") else {}
    rng=random.Random(3301)
    controls={}
    for k in HELD:
        truth=sections[k];assert len(truth)>=MIN and truth[0]!=0
        # One independently sampled private cofactor, chosen to match p10's length.
        key=[rng.randrange(1,Q)]+[rng.randrange(Q) for _ in range(263-len(truth)-1)]+[rng.randrange(Q)]
        c=mul(truth,key);assert len(c)==263
        if part in ("all","controls",k): controls[k]=candidates(c,truth)
    hashes={str(k):hashlib.sha256(bytes(v)).hexdigest() for k,v in pages.items()}
    hashes.update({k:hashlib.sha256(bytes(v)).hexdigest() for k,v in sections.items()})
    return dict(source_tape_sha256=hashes,training_runes=size,min_candidate_runes=MIN,seed=3301,original=original,controls=controls)


if __name__=='__main__':
    root=Path(__file__).resolve().parent.parent
    ap=argparse.ArgumentParser()
    ap.add_argument('--corpus',type=Path,default=root/'resources/liber-primus/lp2-corpus.json')
    ap.add_argument('--native',type=Path,default=root/'resources/external/relikd-solved-gp29-native-v1.json')
    ap.add_argument("--part",default="all",choices=["all","original","controls",*HELD])
    args=ap.parse_args()
    print(json.dumps(run(json.loads(args.corpus.read_text(encoding='utf8')),json.loads(args.native.read_text(encoding='utf8')),args.part),indent=2))
