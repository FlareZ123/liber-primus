"""Exact literal-red-rubric GP29 F-hold legality using Z3 SMT-LIB2 C API.
Run on repository corpus JSON, or nine base29 chapter lines (local transfer).
"""
import argparse
import ctypes as ct
import ctypes.util
import itertools
import json
import random
import time
from pathlib import Path
ABC = '0123456789abcdefghijklmnopqrs'
CUTS = [0,729,1874,3603,5506,6527,7960,9640,12648,12956]
HEAD = [13,16,12,20,16,19,10,8,9]
def load_rows(path):
    s=Path(path).read_text(encoding='utf-8')
    if s.lstrip().startswith('{'):
        t=[x for p in json.loads(s)['pages'][:56] for x in p['indices']]
        full=[t[a:b] for a,b in zip(CUTS,CUTS[1:])]
    else:
        full=[list(map(ABC.index,x)) for x in s.split()]
    assert [len(x) for x in full]==[b-a for a,b in zip(CUTS,CUTS[1:])]
    return [(x[:h],x[h:]) for h,x in zip(HEAD,full)]
def smt(rows,free=False,n=29,timeout=30000):
    lines=[f'(set-option :timeout {timeout})','(set-logic QF_FD)']
    def decl(x):lines.append(f'(declare-const {x} Bool)');return x
    def clause(*args):lines.append('(assert (or '+' '.join(args)+'))')
    def neg(x):return f'(not {x})'
    def one(xs):
        clause(*xs)
        for a,b in itertools.combinations(xs,2):clause(neg(a),neg(b))
    B=[[decl(f'b_{c}_{v}') for v in range(n)] for c in range(n)]
    for row in B:one(row)
    for col in zip(*B):one(col)
    for idx,(k,c) in enumerate(rows):
        segs=[[]]
        for x in c:
            if x==0:segs.append([])
            else:segs[-1].append(x)
        L=len(k)
        assert L>1
        P=[[decl(f'p_{idx}_{i}_{j}') for j in range(L)] for i in range(len(segs))]
        for row in P:one(row)
        if not free:clause(P[0][0])
        for i,seg in enumerate(segs):
            for j,p in enumerate(P[i]):
                for x,v in sorted(set((x,k[(j+t)%L]) for t,x in enumerate(seg))):clause(neg(p),neg(B[x][v]))
                if i+1<len(segs):
                    h=(j+len(seg))%L; nxt=P[i+1][(h+1)%L]
                    clause(neg(p),P[i+1][h],nxt)
                    clause(neg(p),neg(nxt),neg(B[0][k[h]]))
    return '\n'.join(lines+['(check-sat)'])
def solve(s,libpath=None):
    lib=ct.CDLL(libpath or ctypes.util.find_library('z3') or 'libz3.so.4');P=ct.c_void_p
    for name,rest,args in [('Z3_mk_config',P,[]),('Z3_mk_context',P,[P]),('Z3_del_config',None,[P]),('Z3_del_context',None,[P]),('Z3_eval_smtlib2_string',ct.c_char_p,[P,ct.c_char_p])]:
        f=getattr(lib,name);f.restype=rest;f.argtypes=args
    cfg=lib.Z3_mk_config();ctx=lib.Z3_mk_context(cfg);lib.Z3_del_config(cfg)
    t=time.monotonic();res=lib.Z3_eval_smtlib2_string(ctx,s.encode()).decode().strip();elapsed=time.monotonic()-t;lib.Z3_del_context(ctx)
    return {'status':res,'seconds':elapsed,'smt_chars':len(s)}
def legal(k,c,B,free):
    L=len(k);S=set(range(L)) if free else {0}
    for x in c:
        S={j for j in S if x==0}|{(j+1)%L for j in S if B[x]!=k[j]}
        if not S:return False
    return True
def controls(libpath):
    rng=random.Random(28112810);out=[]
    for i in range(8):
        n=5;rows=[];B=list(range(n));rng.shuffle(B);A=[0]+rng.sample(range(1,n),n-1);IB=[B.index(x) for x in range(n)]
        for frame in range(3):
            k=[rng.randrange(n) for _ in range(2+i%2)];p=[rng.randrange(n) for _ in range(27)];j=0;c=[]
            for x in p:
                if x==0:c.append(0)
                else:c.append(IB[(A[x]+k[j])%n]);j=(j+1)%len(k)
            if i>=4:c=[rng.randrange(n) for _ in c]
            rows.append((k,c))
        for free in [False,True]:
            count=sum(all(legal(k,c,b,free) for k,c in rows) for b in itertools.permutations(range(n)))
            z=solve(smt(rows,free,n),libpath)
            assert z['status']==('sat' if count else 'unsat'),(i,free,count,z)
            if i<4:assert count>0
            out.append({'fixture':i,'free':free,'complete_permutations':count,**z})
    return out
def main():
    parser=argparse.ArgumentParser();parser.add_argument('corpus');parser.add_argument('--lib');parser.add_argument('--timeout',type=int,default=30000);a=parser.parse_args();rows=load_rows(a.corpus)
    test=controls(a.lib);print(json.dumps({'controls':test}),flush=True)
    for ids in [[6],[7],list(range(9))]:
        for free in ([False,True] if len(ids)==1 else [False]):
            result=solve(smt([rows[i] for i in ids],free,timeout=a.timeout),a.lib);print(json.dumps({'chapters':ids,'free':free,**result}),flush=True)
if __name__=='__main__':main()
