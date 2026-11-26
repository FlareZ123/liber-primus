"""Dedicated CNF backend for the unresolved p56 shared outer-alphabet case.

Uses the exact pair projection from lp2_p56_primeclock_pair_projection_sft.cjs.
Projection clauses are necessary (not a standalone full inverse). The full CNF
is identical to the previous exact segmented F-clock encoding.
"""
import argparse
import itertools
import json
import random
import re
import subprocess
import sys
import time
from pathlib import Path
from pysat.solvers import Solver
from lp2_nonperiodic_fhold_outer_sat import ROOT, inputs, build, reach
from lp2_nonperiodic_fhold_outer_scope_sat import prime_clock

def cnf(rows,K,q=29):
    smt,nvars,nclauses=build(rows,K,q)
    ids={}
    clauses=[]
    token=re.compile(r'\(not ([^ ()]+)\)|([^ ()]+)')
    for line in smt.splitlines():
        if line.startswith('(declare-const '):
            ids[line.split()[1]]=len(ids)+1
        elif line.startswith('(assert (or '):
            literals=token.findall(line[len('(assert (or '):-2])
            clauses.append([-ids[negative] if negative else ids[positive] for negative,positive in literals])
        else:
            raise ValueError(line)
    assert len(ids)==nvars and len(clauses)==nclauses
    return ids,clauses

def key_from_model(model,ids,q):
    positive=set(x for x in model if x>0)
    b=[next(k for k in range(q) if ids[f'b{c}_{k}'] in positive) for c in range(q)]
    assert sorted(b)==list(range(q))
    return b

def controls(solver_name):
    rng=random.Random(5603301)
    for trial in range(24):
        q=4
        K=[rng.randrange(q) for _ in range(11)]
        rows=[[rng.randrange(q) for _ in range(5+trial%8)] for _ in range(1+trial%3)]
        expected=any(all(reach(row,K,B)['legal'] for row in rows) for B in itertools.permutations(range(q)))
        ids,clauses=cnf(rows,K,q)
        with Solver(name=solver_name,bootstrap_with=clauses) as solver:
            got=solver.solve()
            assert got==expected
            if got:
                b=key_from_model(solver.get_model(),ids,q)
                assert all(reach(row,K,b)['legal'] for row in rows)
    return 24

def main(args):
    rows,_,_=inputs('ordinal','original')
    K=prime_clock(max(map(len,rows)))
    ids,clauses=cnf(rows,K)
    p=json.loads((ROOT/'im-results/lp2-p56-primeclock-pair-projection-output.json').read_text(encoding='utf8'))
    assert p['runes']==sum(map(len,rows)) and p['schedule']=='p56 prime-minus-one, chapter reset zero, literal F hold'
    domains=p['domains']; compat=p['compat']; q=29
    extra=[]
    for c in range(q):
        for k in range(q):
            a=ids[f'b{c}_{k}']
            if not domains[c]&(1<<k):
                extra.append([-a])
                continue
            for d in range(c+1,q):
                for l in range(q):
                    if l!=k and domains[d]&(1<<l) and not compat[(c*q+k)*q+d]&(1<<l):
                        extra.append([-a,-ids[f'b{d}_{l}']])
    check=controls(args.solver)
    print('MODEL',len(ids),len(clauses),len(extra),'controls',check,flush=True)
    # Isolate the bounded solve; even backends without interruption APIs can
    # be stopped by the parent without inventing an UNSAT result.
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        infile=Path(tmp)/'model.cnf'
        keyfile=Path(tmp)/'key.json'
        outfile=Path(tmp)/'result.json'
        keyfile.write_text(json.dumps({f'b{c}_{k}':ids[f'b{c}_{k}'] for c in range(q) for k in range(q)}),encoding='utf8')
        with infile.open('w',encoding='ascii') as f:
            f.write(f'p cnf {len(ids)} {len(clauses)+len(extra)}\n')
            for row in itertools.chain(clauses,extra):
                f.write(' '.join(map(str,row))+' 0\n')
        t=time.monotonic()
        try:
            subprocess.run([sys.executable,__file__,'--child',str(infile),str(keyfile),str(outfile),'--solver',args.solver],timeout=args.seconds,check=True)
            result=json.loads(outfile.read_text(encoding='utf8'))
        except subprocess.TimeoutExpired:
            result={'status':'unknown','reason':'timeout'}
        result.update(solver=args.solver,seconds=time.monotonic()-t,variables=len(ids),baseClauses=len(clauses),projectionClauses=len(extra),smallExactChecks=check)
    if result['status']=='sat':
        result['reach']=[reach(row,K,result['beta']) for row in rows]
        assert all(x['legal'] for x in result['reach'])
    out=ROOT/'im-results'/f'lp2-p56-primeclock-projected-{args.solver}.json'
    out.write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
    print('RESULT',json.dumps(result),flush=True)

def child(args):
    from pysat.formula import CNF
    infile,keyfile,outfile=map(Path,args.child)
    ids=json.loads(keyfile.read_text(encoding='utf8'))
    with Solver(name=args.solver,bootstrap_with=CNF(from_file=str(infile)).clauses) as solver:
        ok=solver.solve()
        result={'status':'sat' if ok else 'unsat'}
        if ok:
            result['beta']=key_from_model(solver.get_model(),ids,29)
    outfile.write_text(json.dumps(result),encoding='utf8')

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--solver',choices=['cadical195','kissat404'],required=True)
    p.add_argument('--seconds',type=int,default=600)
    p.add_argument('--child',nargs=3)
    args=p.parse_args()
    child(args) if args.child else main(args)
