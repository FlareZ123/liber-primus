"""Exact GP29 bootstrap feasibility, p0 body -> p1..19.
Run from repo root: python sims/agent14_lp2_decrypted_opening_fhold_sat.py
Requires z3-solver (or Linux libz3 via ctypes). No language score.
"""
import ctypes as ct
import ctypes.util
import json
import pathlib
import random
import time

def make(pages, s, timeout=20000, witness=None, root_hold=True):
    lines=['(set-logic QF_BV)',f'(set-option :timeout {timeout})']
    bv=lambda x,n=5:f'(_ bv{x} {n})'
    def decl(v,n): lines.append(f'(declare-fun {v} () (_ BitVec {n}))')
    def ass(e): lines.append(f'(assert {e})')
    def eq(a,b): return f'(= {a} {b})'
    def ne(a,b): return f'(not {eq(a,b)})'
    def ands(xs): return '(and '+' '.join(xs)+')' if xs else 'true'
    def implies(a,b): return f'(=> {a} {b})'
    def count(prefix,seq):
        fs=sum(x==0 for x in seq)
        assert fs<64
        hh=[f'{prefix}h{j}' for j in range(fs)]
        cc=[f'{prefix}c{j}' for j in range(fs+1)]
        for h in hh: lines.append(f'(declare-fun {h} () Bool)')
        for j,c in enumerate(cc):
            decl(c,6)
            if j==0: ass(eq(c,bv(0,6)))
            else: ass(eq(c,f'(bvadd {cc[j-1]} (ite {hh[j-1]} {bv(1,6)} {bv(0,6)}))'))
        return hh,cc
    def difference(a,x):
        v=bv(a)
        # 5-bit intermediates may wrap, but the final difference is in 0..28.
        return f'(ite (bvuge {v} {x}) (bvsub {v} {x}) (bvsub (bvadd {v} {bv(29)}) {x}))'
    for j in range(13):
        decl(f'x{j}',5); ass(f'(bvult x{j} {bv(29)})')
    root=pages[0][14:]
    assert len(root)==248 and len(pages)==20
    if root_hold:
        h,c=count('r',root); n=0
        for i,a in enumerate(root[:247]):
            k=f'k{i}'; decl(k,5); ass(f'(bvult {k} {bv(29)})')
            if a==0: ass(implies(h[n],eq(k,bv(0))))
            for m in range(n+1):
                x=f'x{(i-m)%13}'
                cond=eq(c[n],bv(m,6))
                if a==0: cond=ands([cond,f'(not {h[n]})'])
                ass(implies(cond,ands([eq(k,difference(a,x)),ne(k,bv(0))])))
            if a==0: n+=1
        i=247; a=root[i]
        for m in range(n+1):
            cond=eq(c[n],bv(m,6))
            if a==0: cond=ands([cond,f'(not {h[n]})'])
            ass(implies(cond,ne(f'x{(i-m)%13}',bv(a))))
    else:
        for i,a in enumerate(root[:247]):
            k=f'k{i}'; decl(k,5)
            ass(eq(k,difference(a,f'x{i%13}')))
    for pg,seq in enumerate(pages[1:20],1):
        h,c=count(f'p{pg}_',seq); n=0
        for i,a in enumerate(seq):
            for m in range(n+1):
                cond=eq(c[n],bv(m,6))
                if a==0: cond=ands([cond,f'(not {h[n]})'])
                ass(implies(cond,ne(f'k{13*(pg-1)+(i-m)%13}',bv((s*a)%29))))
            if a==0: n+=1
    if witness:
        for j,a in enumerate(witness[0]): ass(eq(f'x{j}',bv(a)))
        for prefix,hs in witness[1]:
            for j,h in enumerate(hs): ass(f'{prefix}h{j}' if h else f'(not {prefix}h{j})')
    return '\n'.join(lines)

def run(pages,s,timeout=20000,witness=None,root_hold=True):
    src=make(pages,s,timeout,witness,root_hold)
    start=time.monotonic()
    try:
        import z3
    except ImportError:
        lib=ct.CDLL(ctypes.util.find_library('z3') or 'libz3.so.4')
        lib.Z3_mk_config.restype=ct.c_void_p
        lib.Z3_mk_context.argtypes=[ct.c_void_p]; lib.Z3_mk_context.restype=ct.c_void_p
        lib.Z3_del_config.argtypes=[ct.c_void_p]
        lib.Z3_del_context.argtypes=[ct.c_void_p]
        lib.Z3_eval_smtlib2_string.argtypes=[ct.c_void_p,ct.c_char_p]
        lib.Z3_eval_smtlib2_string.restype=ct.c_char_p
        cfg=lib.Z3_mk_config(); ctx=lib.Z3_mk_context(cfg); lib.Z3_del_config(cfg)
        out=lib.Z3_eval_smtlib2_string(ctx,(src+'\n(check-sat)').encode()).decode().strip()
        lib.Z3_del_context(ctx)
    else:
        solver=z3.SolverFor('QF_BV')
        solver.from_string(src)
        solver.set(timeout=timeout)
        out=str(solver.check())
    return dict(sign=s,root_hold=root_hold,result=out,seconds=time.monotonic()-start)

def enc(p,key,s,hold):
    c=[]; h=[]; j=0
    for a in p:
        if hold and a==0: c.append(0); h.append(True)
        else:
            v=(a+s*key[j%13])%29; c.append(v); j+=1
            if v==0: h.append(False)
    return c,h

def main(pages):
    r=random.Random(140028)
    for root_hold in [True,False]:
        for s in [-1,1]:
            bank=[r.randrange(29) for _ in range(248)]
            mask=[r.randrange(29) for _ in range(13)]
            root,h=enc(bank,mask,1,root_hold)
            control=[pages[0][:14]+root]
            w=[('r',h)] if root_hold else []
            for i,page in enumerate(pages[1:],1):
                c,h=enc([r.randrange(29) for _ in page],bank[13*(i-1):13*i],s,True)
                control.append(c); w.append((f'p{i}_',h))
            result=run(control,s,witness=(mask,w),root_hold=root_hold)
            print(json.dumps(dict(control='fixed_witness',**result)),flush=True)
            assert result['result']=='sat'
    for root_hold in [True,False]:
        for s in [-1,1]:
            result=run(pages,s,root_hold=root_hold)
            print(json.dumps(dict(control='original',**result)),flush=True)
            assert result['result']=='unsat'

if __name__=='__main__':
    corpus=json.loads(pathlib.Path('resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
    main([p['indices'] for p in corpus['pages'][:20]])
