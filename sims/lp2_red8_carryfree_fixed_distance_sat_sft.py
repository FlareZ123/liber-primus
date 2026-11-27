"""Fixed source-heading increments, carry-independent exact distance SAT.
No original run before both blind matched-profile controls pass for that vector.
"""
import argparse
import json
import random
import sys
import time
from pathlib import Path
from threading import Timer
from functools import lru_cache
from pysat.formula import IDPool
from pysat.card import CardEnc, EncType
from pysat.solvers import Solver

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'sims/lp2_q8_smt_calibration'))
from q8_smt import register, inverse, S

N,Q,B=29,8,3
def load(variant):
    raw=(ROOT/'resources/control/english_wordfreq_textblob.txt').read_text(encoding='utf-8')
    words,_=register(raw)
    fixture=json.loads((ROOT/'im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json').read_text(encoding='utf-8'))
    words.update(fixture['added'].split())
    assert len(words)==38938
    by={n:sorted(w for w in words if len(w)==n) for n in set(map(len,words))}
    profile=json.loads((ROOT/'resources/liber-primus/lp2-page-groups-54-55-derived.json').read_text(encoding='utf-8'))
    body=profile['p54']['body_groups']
    hold=profile['p55']['groups']
    assert len(body)==48 and sum(map(len,body[:47]))==213 and len(body[-1])==10
    assert len(hold)==17 and len(hold[0])==1
    c=body[:47]
    h=[body[-1]+hold[0]]+hold[1:]
    key=[S.index(x) for x in 'jlnr2eaj' if x in S]
    if variant=='prime':
        corpus=json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
        key=[corpus['prime'][x]%N for x in key]
    assert len(key)==8 and all(key)
    return words,by,c,h,key

def encode(w,pi,k,start):
    inv=[pi.index(i) for i in range(N)]
    j=start
    out=[]
    for x in w:
        p=S.index(x)
        if p==0:
            out.append('0')
        else:
            out.append(S[inv[(pi[p]+k[j])%N]])
            j=(j+1)%Q
    return ''.join(out)

def plant(words,by,c,h,key,seed):
    rng=random.Random(seed)
    pi=[0]+rng.sample(list(range(1,N)),N-1)
    truth=[rng.choice(by[len(w)]) for w in c]
    held=[rng.choice(by[len(w)]) for w in h]
    # Three actual unsupported longest groups, no mandatory carry prefix.
    order=sorted(range(len(c)),key=lambda j:(-len(c[j]),j))
    phase=[rng.randrange(Q) for _ in c]
    bad=order[:3]
    for j in bad:
        while True:
            w=''.join(rng.choice(S) for _ in c[j])
            if not (inverse(encode(w,pi,key,phase[j]),pi,key)&words):
                truth[j]=w
                break
    cc=[encode(w,pi,key,j) for w,j in zip(truth,phase)]
    assert [j for j,w in enumerate(cc) if not (inverse(w,pi,key)&words)]==sorted(bad)
    prefixes={w[:10] for w in by[11]}
    while True:
        carry=''.join(rng.choice(S) for _ in h[0])
        hc0=encode(carry,pi,key,rng.randrange(Q))
        if not (inverse(hc0[:10],pi,key)&prefixes):
            held[0]=carry
            break
    hh=[hc0]+[encode(w,pi,key,rng.randrange(Q)) for w in held[1:]]
    return cc,hh,truth,held,pi,bad

class CNF:
    def __init__(self,s):
        self.s=s; self.pool=IDPool();self.clauses=0
    def v(self):return self.pool.id()
    def add(self,clause):
        self.s.add_clause(clause);self.clauses+=1
    def atmost(self,lits,b):
        for cl in CardEnc.atmost(lits,bound=b,vpool=self.pool,encoding=EncType.seqcounter).clauses:
            self.add(cl)
    def one(self,lits):
        self.add(lits);self.atmost(lits,1)

# Local relative-coordinate graph with exact distinctness within components.
def compatible(edges):
    root=list(range(N));off=[0]*N;members=[[x] for x in range(N)]
    for p,c,d in edges:
        a,b=root[p],root[c]
        delta=(off[p]+d-off[c])%N
        if a==b:
            if delta:return False
            continue
        a_values={off[i] for i in members[a]}
        if any((off[i]+delta)%N in a_values for i in members[b]):return False
        for i in members[b]:
            root[i]=a;off[i]=(off[i]+delta)%N
        members[a]+=members[b];members[b]=[]
    return True

def options(c,ws,key,start):
    for w in ws:
        j=start;edges=[]
        for px,cx in zip(w,c):
            p,x=S.index(px),S.index(cx)
            if p==0:
                if x!=0:break
                continue
            if p==x:break
            edges.append((p,x,key[j]))
            j=(j+1)%Q
        else:
            if compatible(edges):yield edges

def build(e,c,by,key):
    x=[[e.v() for _ in range(N)] for _ in range(N)]
    for row in x:e.one(row)
    for col in zip(*x):e.one(list(col))
    e.add([x[0][0]])
    # True cyclic-distance indicator for every nonzero fixed increment.
    # One-hot relations are redundant semantically but add direct propagation.
    E={}
    for d in sorted(set(key)):
        for p in range(N):
            for c0 in range(N):
                if p==c0:continue
                v=e.v();E[p,c0,d]=v
                for r in range(N):
                    e.add([-v,-x[p][r],x[c0][(r+d)%N]])
                    e.add([-v,-x[c0][(r+d)%N],x[p][r]])
        for p in range(N):e.one([E[p,c0,d] for c0 in range(N) if c0!=p])
        for c0 in range(N):e.one([E[p,c0,d] for p in range(N) if p!=c0])
    for p in range(N):
        for c0 in range(N):
            if p!=c0:e.atmost([E[p,c0,d] for d in sorted(set(key))],1)
    # For a conjunction of fixed-distance literals, intern an exact Boolean
    # gate. Lexical alternatives remain complete; shared suffix subtrees merge.
    @lru_cache(None)
    def conjunct(seq):
        if not seq:return None
        if len(seq)==1:return seq[0]
        v=e.v()
        for a in seq:e.add([-v,a])
        e.add([v]+[-a for a in seq])
        return v
    @lru_cache(None)
    def disj(seq):
        if len(seq)==1:return seq[0]
        v=e.v()
        for a in seq:e.add([-a,v])
        e.add([-v]+list(seq))
        return v
    def dnf(opts):
        # Reduce a sorted edge-set trie into interned AND/OR nodes.
        tree={}
        for seq in opts:
            node=tree
            for a in seq:
                if None in node:break
                node=node.setdefault(a,{})
            else:
                node.clear();node[None]={}
        def rec(t):
            if None in t:return None
            children=[]
            for a,child in sorted(t.items()):
                tail=rec(child)
                children.append(a if tail is None else conjunct(tuple(sorted((a,tail)))))
            return disj(tuple(sorted(set(children))))
        return rec(tree)
    flags=[];domains=[]
    for g,w in enumerate(c):
        f=e.v();flags.append(f)
        phases=[e.v() for _ in range(Q)];e.one(phases)
        sizes=[]
        for j,phase in enumerate(phases):
            opts={tuple(sorted(set(E[a] for a in es))) for es in options(w,by[len(w)],key,j)}
            sizes.append(len(opts))
            v=dnf(sorted(opts))
            if v is not None:e.add([-phase,f,v])
            # Even omitted lexical words must have a legal transparent-F inverse.
            paths=[]
            def walk(i,h,lits):
                if i==len(w):
                    paths.append(tuple(sorted(set(lits))));return
                a=S.index(w[i])
                if a==0:walk(i+1,h,lits)
                if a==0:walk(i+1,(h+1)%Q,lits)
                else:walk(i+1,(h+1)%Q,lits+[-E[0,a,key[h]]])
            walk(0,j,[])
            v=dnf(sorted(set(paths)))
            if v is not None:e.add([-phase,-f,v])
        domains.append(sizes)
    e.atmost(flags,B)
    return x,domains

def solve(s,seconds,assumptions=None):
    timer=Timer(seconds,s.interrupt);timer.start();t=time.monotonic()
    try:status=s.solve_limited(assumptions=assumptions or [],expect_interrupt=True)
    finally:timer.cancel();timer.join();s.clear_interrupt()
    return status,time.monotonic()-t

def maps(pi,key):
    return tuple(tuple(pi.index((pi[c]-d)%N) for c in range(N)) for d in key)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--variant',choices=['ordinal','prime'],required=True)
    ap.add_argument('--seed',type=int,default=7311)
    ap.add_argument('--seconds',type=int,default=420)
    ap.add_argument('--original',action='store_true')
    a=ap.parse_args()
    words,by,c,h,key=load(a.variant)
    truth=held=pi=bad=None
    if not a.original:c,h,truth,held,pi,bad=plant(words,by,c,h,key,a.seed)
    out=dict(variant=a.variant,seed=a.seed,original=a.original,key=key,groups=len(c),runes=sum(map(len,c)),bad=bad)
    with Solver(name='glucose4') as s:
        e=CNF(s);t=time.monotonic()
        x,domains=build(e,c,by,key)
        out.update(build_seconds=time.monotonic()-t,variables=e.pool.top,clauses=e.clauses,domains=domains)
        print(json.dumps({k:v for k,v in out.items() if k!='domains'}),flush=True)
        status,elapsed=solve(s,a.seconds)
        out.update(status='SAT' if status is True else 'UNSAT' if status is False else 'UNKNOWN',seconds=elapsed,stats=s.accum_stats())
        if status is True:
            pos=set(v for v in s.get_model() if v>0)
            pp=[next(i for i,v in enumerate(row) if v in pos) for row in x]
            train=[inverse(w,pp,key)&words for w in c]
            hh=[inverse(w,pp,key) for w in h]
            assert sum(not t for t in train)<=B
            out['held_legal']=sum(map(bool,hh))
            out.update(pi=pp,support=sum(map(bool,train)),held_candidates=[sorted(q&words) for q in hh])
            if pi is not None:
                m,tm=maps(pp,key),maps(pi,key)
                out.update(exact_action=any(m==tm[j:]+tm[:j] for j in range(Q)),held_correct=sum(w in q for w,q in zip(held,hh)),train_truth=sum(w in inverse(v,pp,key) for w,v in zip(truth,c)))
            else:out['train_candidates']=[sorted(q) for q in train]
        if pi is not None:
            oracle,t=solve(s,30,[x[j][v] for j,v in enumerate(pi)])
            out.update(oracle=oracle,oracle_seconds=t)
            assert oracle is True
    out['passed']=out.get('exact_action',False) and out.get('held_correct')==17
    name=f'im-results/lp2-red8-fixed-distance-{a.variant}-'+('original' if a.original else str(a.seed))+'.json'
    (ROOT/name).write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in out.items() if k!='domains'}),flush=True)

if __name__=='__main__':main()
