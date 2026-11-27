#!/usr/bin/env python3
"""Count two-tape affine solutions exactly conditional on a fixed third tape.
Usage: python count.py input.txt gac2-weighted.log
Input from lp2_tree_moth_triple_affine_gac_input.cjs; log from native solver case2 mode1.
All counts are distinct rune tapes, not counts of keys or English sentences.
"""
from collections import defaultdict
from pathlib import Path
import sys,json
Q=29
ALPH='0123456789abcdefghijklmnopqrs'

def parse(s):return tuple(ALPH.index(c) for c in s)
def read_input(path):
    lines=Path(path).read_text().splitlines();n=int(lines[0]);d=defaultdict(set)
    for line in lines[1:n+1]:
        w,_=line.split();d[len(w)].add(parse(w))
    assert int(lines[n+1])==3
    cases=[[line.split() for line in lines[n+2+3*i:n+5+3*i]] for i in range(3)]
    return d,cases

def layout(words,dict_,free=False):
    skip=sum(map(len,words))-76;domains=[];sites=[];p=[]
    for j,w in enumerate(words):
        if skip>=len(w):skip-=len(w);continue
        v=len(domains)
        if free and j==0 and len(w)==1:domain={(i,) for i in range(Q)}
        else:domain={a[skip:] for a in dict_[len(w)]}
        domains.append(domain);a=parse(w)[skip:];p.extend(a)
        sites.extend((v,k) for k in range(len(a)));skip=0
    assert len(p)==76
    return domains,sites,p

def count(c,layouts,fixed,known):
    a,b=[k for k in range(3) if k!=fixed]
    D={};adj=defaultdict(list);unary=defaultdict(list);edges=defaultdict(list)
    for k in (a,b):
        for v,domain in enumerate(layouts[k][0]):D[k,v]=domain
    for i,(ca,cb,cc,pc) in enumerate(zip(c[a],c[b],c[fixed],known)):
        va,ia=layouts[a][1][i];vb,ib=layouts[b][1][i]
        A,B=(a,va),(b,vb)
        unary[A].append((ia,pc,ca==cc));unary[B].append((ib,pc,cb==cc))
        if ca!=cc and cb!=cc:
            r=(cb-cc)*pow((ca-cc)%Q,-1,Q)%Q
            edges[A,B].append((ia,ib,pc,r))
    D={v:[w for w in domain if all((w[i]==p)==eq for i,p,eq in unary[v])] for v,domain in D.items()}
    for (A,B),slots in edges.items():adj[A].append((B,slots));adj[B].append((A,slots))
    def sig(v,w,slots):
        return tuple((pc+r*(w[ia]-pc))%Q if v[0]==a else w[ib] for ia,ib,pc,r in slots)
    seen=set();components=[]
    def visit(v,parent):
        assert v not in seen,'overlap graph cycle'
        seen.add(v);weights=[1]*len(D[v])
        for u,slots in adj[v]:
            if u==parent:continue
            child=visit(u,v);sums=defaultdict(int)
            for w,n in zip(D[u],child):sums[sig(u,w,slots)]+=n
            weights=[n*sums[sig(v,w,slots)] for w,n in zip(D[v],weights)]
        return weights
    total=1
    for v in D:
        if v in seen:continue
        n=sum(visit(v,None));components.append(n);total*=n
    return {'fixed_track':fixed,'pair_count':str(total),'components':len(components),'component_counts':[str(x) for x in components], 'unary_domain_sizes':[len(D[v]) for v in D]}

def main():
    d,cases=read_input(sys.argv[1]);log=Path(sys.argv[2]).read_text().splitlines();i=next(i for i,l in enumerate(log) if l.startswith('SOLUTION'))
    witness=[parse(''.join(l.split(' accuracy')[0].split())) for l in log[i+1:i+4]]
    results=[]
    for ix,words in enumerate(cases):
        L=[layout(w,d,ix==2 and k==2) for k,w in enumerate(words)];P=[x[2] for x in L]
        if ix<2:
            K=[(1+(7*j*j+11*j+3+ix*9)%28,(13*j*j+5*j+17+ix*7)%29) for j in range(76)]
            c=[[(a*p+b)%Q for p,(a,b) in zip(t,K)] for t in P];known=P
        else:c=P;known=witness
        for k in range(3):
            r=count(c,L,k,known[k]);assert int(r['pair_count'])>0,'lost known witness';results.append({'case':ix,**r})
    print(json.dumps(results,indent=2))
if __name__=='__main__':main()
