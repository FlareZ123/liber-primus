"""One-hot SAT inverse of the strict q8 shared GP29 action.
Uses the same frozen data/plant generator as the independent CP-SAT model.
https://pysathq.github.io/docs/html/api/solvers.html
"""
import argparse
import json
import time
from threading import Timer

from pysat.card import CardEnc, EncType
from pysat.formula import IDPool
from pysat.solvers import Solver

from lp2_shared_gp29_unknown_q8_cpsat import N,Q,TRAIN,load,plant,decode,rotations

class Encoder:
    def __init__(self, solver):
        self.s = solver
        self.pool = IDPool()
        self.count = 0

    def var(self):
        return self.pool.id()

    def add(self, clause):
        self.s.add_clause(clause)
        self.count += 1

    def exactly_one(self, lits):
        self.add(lits)
        for c in CardEnc.atmost(lits, bound=1, vpool=self.pool,encoding=EncType.seqcounter).clauses:
            self.add(c)

    def atmost(self,lits,bound):
        for c in CardEnc.atmost(lits,bound=bound,vpool=self.pool,encoding=EncType.seqcounter).clauses:
            self.add(c)

    def matrix(self,n,m):
        return [[self.var() for _ in range(m)] for _ in range(n)]

    def perm(self):
        p=self.matrix(N,N)
        for row in p:
            self.exactly_one(row)
        for col in zip(*p):
            self.exactly_one(list(col))
        return p

    def disjunction(self, options, gate=None):
        # Every option is a conjunction of literals. A trie of edge sets shares
        # prefixes. Root requires at least one supported path; selectors imply
        # their literal and a child. A terminal prefix subsumes longer options.
        trie={}
        for seq in options:
            node=trie
            for edge in sorted(set(seq)):
                if None in node:
                    break
                node=node.setdefault(edge,{})
            else:
                node.clear()
                node[None]={}
        def descend(node):
            if None in node:
                return None
            children=[]
            for edge,child in node.items():
                if None in child:
                    children.append(edge)
                else:
                    sel=self.var()
                    self.add([-sel,edge])
                    below=descend(child)
                    if below is not None:
                        self.add([-sel]+below)
                    children.append(sel)
            return children
        root=descend(trie)
        if root is not None:
            self.add(([] if gate is None else [-gate])+root)

def choices(cipher,words,maps):
    found=set()
    for w in words:
        for start in range(Q):
            phase=start
            cp,pc,zero={}, {}, {}
            edges=[]
            for c,p in zip(cipher,w):
                if p==0:
                    if c!=0:
                        break
                    continue
                if (phase,c) in cp and cp[phase,c]!=p:
                    break
                if (phase,p) in pc and pc[phase,p]!=c:
                    break
                z=(p==c)
                if (phase==0 and z) or (phase in zero and zero[phase]!=z):
                    break
                cp[phase,c]=p
                pc[phase,p]=c
                zero[phase]=z
                edges.append(maps[phase][c][p])
                phase=(phase+1)%Q
            else:
                found.add(tuple(sorted(set(edges))))
    return sorted(found)

def unrestricted_paths(cipher,maps):
    options=[]
    for start in range(Q):
        def walk(i,phase,edges):
            if i==len(cipher):
                options.append(edges)
                return
            c=cipher[i]
            if c==0:
                walk(i+1,phase,edges)
            walk(i+1,(phase+1)%Q,edges+[-maps[phase][c][0]])
        walk(0,start,[])
    return options

def build(e,cipher,by,budget):
    x=e.perm()
    k=e.matrix(Q,N)
    for row in k:
        e.exactly_one(row)
    e.add([x[0][0]])
    e.add([k[0][1]])
    different=[e.var() for _ in range(Q//2)]
    e.add(different)
    for j,diff in enumerate(different):
        for v in range(N):
            e.add([-diff,-k[j][v],-k[j+4][v]])
    maps=[]
    for j in range(Q):
        y=e.perm()
        row=e.perm()   # rows are c; columns p; every phase is a permutation
        maps.append(row)
        for c in range(N):
            for v in range(N):
                for d in range(N):
                    e.add([-x[c][v],-k[j][d],y[c][(v-d)%N]])
            for p in range(N):
                for v in range(N):
                    e.add([-row[c][p],-x[p][v],y[c][v]])
    domains=[]
    flags=[]
    for c in cipher:
        opts=choices(c,by[len(c)],maps)
        domains.append(len(opts))
        if budget:
            flag=e.var()
            flags.append(flag)
            # At least one lexical option unless the arbitrary OOV path is selected.
            e.disjunction(opts,gate=-flag)
            e.disjunction(unrestricted_paths(c,maps),gate=flag)
        else:
            e.disjunction(opts)
    if flags:
        e.atmost(flags,budget)
    return x,k,domains

def result(s,seconds,assumptions=None):
    timer=Timer(seconds,s.interrupt)
    timer.start()
    start=time.monotonic()
    try:
        status=s.solve_limited(assumptions=assumptions or [],expect_interrupt=True)
    finally:
        timer.cancel()
        timer.join()
        s.clear_interrupt()
    return status,time.monotonic()-start

def decode_assignment(s,x,k,cipher,dictionary):
    positives={v for v in s.get_model() if v>0}
    pi=[next(v for v,xv in enumerate(row) if xv in positives) for row in x]
    key=[next(v for v,kv in enumerate(row) if kv in positives) for row in k]
    train=[decode(w,pi,key,dictionary) for w in cipher[:TRAIN]]
    hold=[decode(w,pi,key,dictionary) for w in cipher[TRAIN:]]
    return {"pi":pi,"key":key,"train_supported":sum(bool(v) for v in train),"holdout_supported":sum(bool(v) for v in hold),"holdout_candidates":[sorted(v) for v in hold]},hold

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--case",choices=["gibran","emerson","original"],required=True)
    p.add_argument("--seconds",type=float,default=480)
    p.add_argument("--solver",default="glucose4")
    args=p.parse_args()
    original,dictionary,by,pools,_=load()
    if args.case=="original":
        cipher=original
        truth=pi=key=None
        budget=3
    else:
        i=0 if args.case=="gibran" else 1
        cipher,truth,pi,key=plant(original,pools[i],[3301,20141125][i])
        budget=0
    out={"case":args.case,"solver":args.solver,"training_groups":TRAIN,"training_runes":222,"holdout_groups":66-TRAIN,"dictionary":len(dictionary),"budget":budget}
    with Solver(name=args.solver) as s:
        e=Encoder(s)
        start=time.monotonic()
        x,k,domains=build(e,cipher[:TRAIN],by,budget)
        out.update(build_seconds=time.monotonic()-start,variables=e.pool.top,clauses=e.count,domains=domains)
        print(json.dumps({"build":out}),flush=True)
        # Solve blind FIRST. A later truth-pinned test cannot teach the solver
        # anything during this search. It is used only to detect encoding errors.
        status,elapsed=result(s,args.seconds)
        blind={"status":"SAT" if status is True else "UNSAT" if status is False else "UNKNOWN","seconds":elapsed,"stats":s.accum_stats()}
        if status is True:
            recovered,hold=decode_assignment(s,x,k,cipher,dictionary)
            blind.update(recovered)
            if truth is not None:
                blind["effective_exact"]=tuple(recovered["pi"]+recovered["key"]) in rotations(pi,key)
                blind["holdout_truth"]=sum(w in v for w,v in zip(truth[TRAIN:],hold))
                blind["holdout_unique_truth"]=sum(v=={w} for w,v in zip(truth[TRAIN:],hold))
        out["blind"]=blind
        if truth is not None:
            assumptions=[x[r][v] for r,v in enumerate(pi)]+[k[j][v] for j,v in enumerate(key)]
            oracle,elapsed=result(s,30,assumptions)
            out["oracle"]={"status":"SAT" if oracle is True else "UNSAT" if oracle is False else "UNKNOWN","seconds":elapsed}
            assert oracle is True,"fixed-map model did not validate"
        if status is True:
            # For uniqueness, block exactly the gauge-equivalent rotations of
            # the returned map. No truth hints are used in the alternate solve.
            for row in rotations(blind["pi"],blind["key"]):
                s.add_clause([-x[r][v] for r,v in enumerate(row[:N])]+[-k[j][v] for j,v in enumerate(row[N:])])
            alternative,elapsed=result(s,min(args.seconds,120))
            out["alternative"]={"status":"SAT" if alternative is True else "UNSAT" if alternative is False else "UNKNOWN","seconds":elapsed}
            if alternative is True:
                rec,hold=decode_assignment(s,x,k,cipher,dictionary)
                out["alternative"].update(rec)
                if truth is not None:
                    out["alternative"]["effective_exact"]=tuple(rec["pi"]+rec["key"]) in rotations(pi,key)
                    out["alternative"]["holdout_truth"]=sum(w in v for w,v in zip(truth[TRAIN:],hold))
    print(json.dumps(out,separators=(",",":")),flush=True)

if __name__=="__main__":
    main()
