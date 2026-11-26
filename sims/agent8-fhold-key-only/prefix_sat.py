"""Exact zero-free-prefix receiver: BV table mux, merged prefix trie, and explicit short nogoods.
Local experiment uses libz3 via its SMT-LIB2 C API. Each node corresponds to a
prefix of ciphertext differences. The observed C is nonzero throughout, so no
literal F branch is legal and the recurrence is deterministic.
"""
import ctypes as c
import itertools
import json
import math
import pathlib
import random
import sys
import time

z=c.CDLL('libz3.so.4')
def api(name, args, ret):
    f=getattr(z,name); f.argtypes=args; f.restype=ret; return f
P=c.c_void_p; S=c.c_char_p
mk_config=api('Z3_mk_config',[],P)
set_param=api('Z3_set_param_value',[P,S,S],None)
mk_context=api('Z3_mk_context',[P],P)
del_config=api('Z3_del_config',[P],None)
del_context=api('Z3_del_context',[P],None)
eval_smt=api('Z3_eval_smtlib2_string',[P,S],S)
version=api('Z3_get_full_version',[],S)

def solve(expr, timeout_ms=10000):
    cfg=mk_config(); set_param(cfg,b'timeout',str(timeout_ms).encode()); ctx=mk_context(cfg); del_config(cfg)
    try:
        out=eval_smt(ctx,expr.encode()).decode()
        return out
    finally: del_context(ctx)

def deltas(pages,n):
    return [[(b-a)%n for a,b in zip(page,page[1:])] for page in pages]

def valid(ds,k):
    n=len(k)
    for dseq in ds:
        q=0
        for d in dseq:
            q=(d+k[q])%n
            if not q:return False
    return True

def short_nogoods(ds,n,k0,depth):
    # Every violation is derived from an exact partial key, with all-different enforced.
    # A failing transition requires that partial key to be absent in any full solution.
    out=set()
    for dseq in ds:
        path=dseq[:depth]
        keys={0:k0};used={k0}
        def visit(i,q):
            if i==len(path):return
            d=path[i]
            if q in keys:
                p=(d+keys[q])%n
                if not p:out.add(tuple(sorted((r,k) for r,k in keys.items() if r!=0)))
                else:visit(i+1,p)
                return
            for k in range(n):
                if k in used:continue
                keys[q]=k;used.add(k)
                p=(d+k)%n
                if p:visit(i+1,p)
                else:out.add(tuple(sorted((r,k) for r,k in keys.items() if r!=0)))
                used.remove(k);del keys[q]
        visit(0,0)
    # Remove clauses subsumed by a shorter exact nogood.
    return sorted(x for x in out if not any(sub in out for m in range(len(x)) for sub in itertools.combinations(x,m)))

def formula(ds,n,k0,timeout_ms,depth=4,form='mux',cut=10000,extra=(),getmodel=False):
    w=(n-1).bit_length(); B=f'(_ BitVec {w})'
    b=lambda i:f'(_ bv{i} {w})'
    lines=['(set-option :produce-models true)',f'(set-option :timeout {timeout_ms})','(set-logic QF_BV)']
    for q in range(n):lines.extend([f'(declare-fun k{q} () {B})',f'(assert (bvule k{q} {b(n-1)}))'])
    lines.append('(assert (distinct '+' '.join(f'k{i}' for i in range(n))+'))')
    lines.append(f'(assert (= k0 {b(k0)}))')
    ng=short_nogoods(ds,n,k0,depth) if depth else []
    for no in [*ng,*extra]:
        if not no:lines.append('(assert false)');continue
        xs=[f'(not (= k{q} {b(k)}))' for q,k in no]
        lines.append('(assert '+(xs[0] if len(xs)==1 else '(or '+' '.join(xs)+')')+')')
    # balanced decision-tree mux is a Boolean circuit over a 5-bit state.
    def mux(lo,hi):
        if hi-lo==1:return f'k{lo}' if lo<n else b(0)
        mid=(lo+hi)//2
        bit=(hi-lo).bit_length()-2
        return f'(ite (= ((_ extract {bit} {bit}) q) #b0) {mux(lo,mid)} {mux(mid,hi)})'
    lines.append(f'(define-fun lookup ((q {B})) {B} {mux(0,1<<w)})')
    nodes={():None}; trans=0
    # Increasing-depth order is deterministic; shared prefixes use the same variable.
    for seq in sorted(set(tuple(x[:cut]) for x in ds)):
        par=()
        for d in seq:
            child=par+(d,)
            if child in nodes:par=child;continue
            j=len(nodes);q=f'q{j}';s=f's{j}';p=nodes[par] or b(0)
            # First transition is already numerically fixed by k0.
            lines.append(f'(declare-fun {q} () {B})')
            lines.append(f'(assert (and (bvugt {q} {b(0)}) (bvule {q} {b(n-1)})))')
            if not par:
                lines.append(f'(assert (= {q} {b((d+k0)%n)}))')
            else:
                lines.append(f'(declare-fun {s} () {B})')
                # K[q] = q'-d. Range < n and no wrap at 2^w.
                if form=='mux':lines.append(f'(assert (= {s} (lookup {p})))')
                elif form=='direct':
                    for i in range(1,n):lines.append(f'(assert (=> (= {p} {b(i)}) (= {s} k{i})))')
                elif form=='inverse':
                    # Use equivalence from K's permutation; propagation both ways.
                    for i in range(1,n):lines.append(f'(assert (= (= {p} {b(i)}) (= {s} k{i})))')
                else:raise ValueError(form)
                lines.append(f'(assert (bvule {s} {b(n-1)}))')
                if d:rhs=f'(ite (bvuge {s} {b(n-d)}) (bvsub {s} {b(n-d)}) (bvadd {s} {b(d)}))'
                else:rhs=s
                lines.append(f'(assert (= {q} {rhs}))')
            nodes[child]=q;par=child;trans+=1
    lines.append('(check-sat)')
    if getmodel:lines.append('(get-value ('+' '.join(f'k{i}' for i in range(n))+'))')
    return '\n'.join(lines),len(ng),trans

def run_control():
    rng=random.Random(8063056); results=[]
    for n in [3,4,5,6]:
        for trial in range(10):
            ds=[[rng.randrange(n) for _ in range(rng.randint(1,8))] for _ in range(rng.randint(1,5))]
            # Some positive instances from genuine non-F plaintext recurrence.
            if trial%2==0:
                k=list(range(n));rng.shuffle(k);ds=[]
                for _ in range(rng.randint(1,5)):
                    q=0;seq=[]
                    for _ in range(rng.randint(1,8)):
                        p=rng.randrange(1,n);seq.append((p-k[q])%n);q=p
                    ds.append(seq)
            for k0 in range(n):
                truth=sum(valid(ds,(k0,*rest)) for rest in itertools.permutations([i for i in range(n) if i!=k0]))
                for mode in ['mux','direct','inverse']:
                    f,ng,m=formula(ds,n,k0,10000,4,mode)
                    out=solve(f,10000).splitlines()[0].strip()
                    assert out==('sat' if truth else 'unsat'),(n,trial,k0,mode,truth,out)
                    results.append([n,trial,k0,mode,truth,out])
    print(json.dumps({'z3':version().decode(),'cases':len(results),'sat':sum(x[-1]=='sat' for x in results),'unsat':sum(x[-1]=='unsat' for x in results)}))

if __name__=='__main__':
    if sys.argv[1]=='controls':run_control();sys.exit()
    file,k0,mode,cap,cut,depth=sys.argv[1:7];k0,cap,cut,depth=map(int,(k0,cap,cut,depth));pages=[[int(x,29) for x in line] for line in pathlib.Path(file).read_text().splitlines()]
    assert len(pages)==55 and sum(len(p)-1 for p in pages)==1428 and all(0 not in p[1:] for p in pages)
    ds=deltas(pages,29);t=time.monotonic();f,ng,nodes=formula(ds,29,k0,cap,depth,mode,cut)
    print(json.dumps({'z3':version().decode(),'k0':k0,'mode':mode,'cap_ms':cap,'cut':cut,'depth':depth,'nogoods':ng,'nodes':nodes,'formula_bytes':len(f),'build_s':time.monotonic()-t}),flush=True)
    out=solve(f,cap);print(json.dumps({'status':out.strip(),'elapsed_s':time.monotonic()-t}),flush=True)
