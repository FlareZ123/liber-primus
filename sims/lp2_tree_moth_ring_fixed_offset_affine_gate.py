#!/usr/bin/env python3
"""Exact paired lexical inverse for shared affine C=aP+b with source-fixed b."""
import json,sys
from functools import lru_cache
from collections import defaultdict
from lp2_tree_moth_triple_affine_conditional_count import read_input,parse,Q

def schedule(grid):
    ring=[*range(8),*[r*8+7 for r in range(1,32)],*[31*8+c for c in range(6,-1,-1)],*[r*8 for r in range(30,0,-1)]]
    assert len(ring)==76 and len(set(ring))==76
    tokens=[t for p in grid['pages'] for t in p['tokens']];assert len(tokens)==256
    for radix in (59,60):
        alpha=grid['alphabet'].replace('f','') if radix==59 else grid['alphabet']
        raw=[alpha.index(tokens[i][0])*radix+alpha.index(tokens[i][1]) for i in ring]
        assert all(0<=x<256 for x in raw)
        yield radix,[x%29 for x in raw]

def setup(D):
    @lru_cache(maxsize=None)
    def domain(n,l,r,mask,free):
        words={(i,) for i in range(Q)} if free else {w[l:r] for w in D[n]}
        return tuple(sorted(w for w in words if sum(1<<j for j,v in enumerate(w) if v==0)==mask))
    def frame(words,off,b,free=False,plant=None):
        p=[x for w in words for x in parse(w)][off:off+76];assert len(p)==76
        c=p if plant is None else [(a*x+z)%Q for a,x,z in zip(plant,p,b)]
        c=[(x-z)%Q for x,z in zip(c,b)]
        at=0;ds=[];sites=[];segments=[]
        for j,w in enumerate(words):
            n=len(w);l=max(0,off-at);r=min(n,off+76-at)
            if l<r:
                v=len(ds);start=at+l-off;mask=sum(1<<i for i in range(r-l) if not c[start+i])
                ds.append(domain(n,l,r,mask,free and j==0 and n==1));sites.extend((v,i) for i in range(r-l));segments.append([j,l,r])
            at+=n
        assert len(sites)==76
        if plant is not None:assert all(tuple(parse(words[j])[l:r]) in d for (j,l,r),d in zip(segments,ds))
        return ds,sites,c,segments
    return frame

def paired(A,B):
    if any(not d for d in A[0]+B[0]):return 0
    D={(k,v):d for k,f in enumerate((A,B)) for v,d in enumerate(f[0])};edges=defaultdict(list);adj=defaultdict(list)
    for i,(a,b) in enumerate(zip(A[2],B[2])):
        if a and b:
            va,ia=A[1][i];vb,ib=B[1][i];edges[(0,va),(1,vb)].append((ia,ib,b*pow(a,-1,Q)%Q))
    for (u,v),s in edges.items():adj[u].append((v,s));adj[v].append((u,s))
    def sig(v,w,s):return tuple(w[a]*r%Q if v[0]==0 else w[b] for a,b,r in s)
    seen=set()
    def visit(v,parent):
        assert v not in seen;seen.add(v);d=D[v];weight=[1]*len(d)
        for u,s in adj[v]:
            if u==parent:continue
            w=visit(u,v);sums=defaultdict(int)
            for p,n in zip(D[u],w):
                if n:sums[sig(u,p,s)]+=n
            if not sums:return [0]*len(d)
            weight=[n*sums[sig(v,p,s)] if n else 0 for p,n in zip(d,weight)]
            if not any(weight):return weight
        return weight
    total=1
    for v in D:
        if v not in seen:
            total*=sum(visit(v,None))
            if total==0:return 0
    return total

def main():
    D,cases=read_input(sys.argv[1]);frame=setup(D);grid=json.load(open(sys.argv[2]));out=[]
    for radix,raw in schedule(grid):
        for orient,b0 in [('cw',raw),('reverse',raw[::-1])]:
            for sign in (1,-1):
                b=[sign*x%Q for x in b0];controls=[]
                for ix,case in enumerate(cases[:2]):
                    a=[1+(7*j*j+11*j+3+ix*9)%28 for j in range(76)]
                    F=[frame(w,sum(map(len,w))-76,b,plant=a) for w in case]
                    counts=[paired(F[2],F[k]) for k in (0,1)]
                    assert all(counts);controls.append(counts)
                case=cases[2];p55=frame(case[2],0,b,free=True);results=[]
                for words in case[:2]:
                    r=[]
                    for off in range(sum(map(len,words))-75):
                        p=frame(words,off,b);r.append(paired(p55,p))
                    results.append(r)
                rec=dict(radix=radix,orientation=orient,sign=sign,controls=controls,p55_word_domains=[len(d) for d in p55[0]],surviving_offsets=[[i for i,n in enumerate(r) if n] for r in results],pair_counts=results)
                out.append(rec);print(json.dumps(rec),flush=True)
    assert len(out)==8
if __name__=='__main__':main()
