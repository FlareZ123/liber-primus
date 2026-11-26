"""Spacing-free known nonperiodic GP29 schedule, exact outer alphabet/hold-clock SAT.

The source-fixed key is the 2797-rune corrected LP1 plaintext (ordinal or
sacred-prime residues), cyclic, reset to index 0 at each illustrated chapter.
For an arbitrary independent inner alphabet normalized alpha(F)=0:
    consuming: beta[C_i] != K[i-h]
    hold: C_i=F, h increments
The legality model is iff a spacing-free inverse exists for some inner
permutation; no lexicon, English model, or plaintext word boundaries.
"""
import argparse
import itertools
import json
import random
import re
import time
from pathlib import Path
import z3

ROOT = Path(__file__).resolve().parents[1]
Q = 29
STARTS = [0,729,1874,3603,5506,6527,7960,9640,12648,12956]
R = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA']
RI = {s:i for i,s in enumerate(R)}

def gp(text):
    out = []
    for w in re.findall('[A-Z]+', text.upper()):
        w = w.replace('QU','CW').replace('ING','NG').replace('IO','IA').translate(str.maketrans('VKQZ','UCCS'))
        i = 0
        while i < len(w):
            s = w[i:i+2]
            if s not in RI:
                s = w[i]
            out.append(RI[s])
            i += len(s)
    return out

def inputs(schedule, target):
    corpus = json.loads((ROOT/'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf8'))
    native = json.loads((ROOT/'resources/external/relikd-solved-gp29-native-v1.json').read_text(encoding='utf8'))
    lp1 = (ROOT/'resources/transcriptions/lp1_wulfic_canonical.txt').read_text(encoding='utf8')
    index = {r:i for i,r in enumerate(corpus['runes'])}
    extract = lambda text: [index[r] for r in text if r in index]
    ss = [extract(x['source_text']) for x in native['sections'][:7]]
    ss[3] = [(31-c)%29 for c in extract(''.join(lp1.split('%')[4:8]))]
    K = sum(ss, [])
    assert len(K) == 2797
    if schedule == 'prime':
        K = [corpus['prime'][x]%29 for x in K]
    tape = sum([x['indices'] for x in corpus['pages'][:56]], [])
    assert len(tape) == 12956
    truth = None
    if target == 'control':
        name, offset, seed = ('shakespeare_first300k.txt', 30000, 2026112601) if schedule == 'ordinal' else ('gibran_prophet_58585.txt', 10000, 2026112602)
        P = gp((ROOT/'resources/control'/name).read_text(encoding='utf8'))[offset:offset+12956]
        assert len(P) == 12956
        rng = random.Random(seed)
        alpha = [0] + rng.sample(list(range(1,29)), 28)
        beta = rng.sample(list(range(29)),29)
        inv = [beta.index(k) for k in range(29)]
        tape = []
        for a,b in zip(STARTS, STARTS[1:]):
            j = 0
            for p in P[a:b]:
                if p == 0:
                    tape.append(0)
                else:
                    tape.append(inv[(alpha[p]+K[j%len(K)])%29])
                    j += 1
        truth = {'beta':beta, 'alpha':alpha, 'plain':P, 'source':name, 'offset':offset, 'seed':seed}
    return [tape[a:b] for a,b in zip(STARTS,STARTS[1:])], K, truth

def reach(C, K, B):
    """Exact number of hidden-hold paths at each endpoint for a fixed beta."""
    paths = {0:1}
    for i,c in enumerate(C):
        nxt = {}
        for h,count in paths.items():
            if B[c] != K[(i-h)%len(K)]:
                nxt[h] = nxt.get(h,0) + count
            if c == 0:
                nxt[h+1] = nxt.get(h+1,0) + count
        paths = nxt
        if not paths:
            return {'legal':False, 'firstImpossible':i, 'endStates':0, 'pathCount':'0'}
    return {'legal':True, 'firstImpossible':None, 'endStates':len(paths),
            'minHolds':min(paths), 'maxHolds':max(paths), 'pathCount':str(sum(paths.values()))}

def build(rows, K, q=29):
    """Pure Boolean CNF. One-hot beta, and one hold-count state per visible-F boundary.
    Sequential AMO avoids cubic clause growth over chapter hold counts.
    """
    decl = []
    clauses = []
    B = [[f'b{c}_{k}' for k in range(q)] for c in range(q)]
    aux = 0
    def declare(v):
        decl.append(f'(declare-const {v} Bool)')
    def clause(*xs):
        clauses.append('(assert (or '+' '.join(xs)+'))')
    def neg(x):
        return f'(not {x})'
    def exactly_one(xs, sequential=False):
        nonlocal aux
        clause(*xs)
        if not sequential or len(xs) < 4:
            for a,b in itertools.combinations(xs,2):
                clause(neg(a),neg(b))
            return
        prev = None
        for x in xs[:-1]:
            s = f'a{aux}'
            aux += 1
            declare(s)
            clause(neg(x),s)
            if prev is not None:
                clause(neg(prev),s)
                clause(neg(x),neg(prev))
            prev = s
        clause(neg(xs[-1]),neg(prev))
    for row in B:
        for x in row:
            declare(x)
        exactly_one(row)
    for k in range(q):
        exactly_one([B[c][k] for c in range(q)])
    for j,C in enumerate(rows):
        zeros = [i for i,c in enumerate(C) if c == 0]
        bounds = [-1]+zeros+[len(C)]
        H = [[f'h{j}_{s}_{h}' for h in range(s+1)] for s in range(len(zeros)+1)]
        for s,hs in enumerate(H):
            for x in hs:
                declare(x)
            exactly_one(hs, sequential=True)
            for h,x in enumerate(hs):
                start,end = bounds[s]+1,bounds[s+1]
                forbidden = {(C[i],K[(i-h)%len(K)]) for i in range(start,end)}
                for c,k in sorted(forbidden):
                    clause(neg(x),neg(B[c][k]))
                if s < len(zeros):
                    consume,hold = H[s+1][h:h+2]
                    clause(neg(x),consume,hold)
                    clause(neg(x),neg(consume),neg(B[0][K[(end-h)%len(K)]]))
    return '\n'.join(decl+clauses), len(decl), len(clauses)

def make_solver(rows,K,q=29,timeout=60000):
    smt,variables,clauses = build(rows,K,q)
    solver = z3.SolverFor('QF_FD')
    solver.set(timeout=timeout)
    solver.from_string(smt)
    return solver, variables, clauses

def recover(solver,q=29):
    model = solver.model()
    beta = [next(k for k in range(q) if z3.is_true(model.eval(z3.Bool(f'b{c}_{k}'),model_completion=True))) for c in range(q)]
    assert sorted(beta) == list(range(q))
    return beta

def small_controls():
    """Check complete 4-symbol feasibility against all 4! keys, incl. all-zero cases."""
    rng = random.Random(330129)
    q = 4
    perms = list(itertools.permutations(range(q)))
    for trial in range(24):
        K = [rng.randrange(q) for _ in range(11)]
        rows = [[rng.randrange(q) for _ in range(5+trial%8)] for _ in range(1+trial%3)]
        expected = any(all(reach(C,K,B)['legal'] for C in rows) for B in perms)
        solver,_,_ = make_solver(rows,K,q,10000)
        status = solver.check()
        assert status != z3.unknown and (status == z3.sat) == expected, (trial,status,expected)
        if status == z3.sat:
            B = recover(solver,q)
            assert all(reach(C,K,B)['legal'] for C in rows)
    return 24

def experiment(args):
    rows,K,truth = inputs(args.schedule,args.target)
    tiny = small_controls()
    print('SMALL_EXHAUSTIVE',tiny,flush=True)
    prefix_rows = [r[:min(args.prefix,len(r))] for r in rows] if args.prefix else rows
    if truth is not None:
        truth_reach = [reach(C,K,truth['beta']) for C in rows]
        assert all(x['legal'] for x in truth_reach)
    else:
        truth_reach = None
    start = time.monotonic()
    solver,variables,clauses = make_solver(prefix_rows,K,timeout=args.timeout)
    print('MODEL',variables,clauses,'buildSeconds',time.monotonic()-start,flush=True)
    start = time.monotonic()
    status = solver.check()
    out = {'schedule':args.schedule,'target':args.target,'prefix':args.prefix,
           'lengths':[len(r) for r in prefix_rows],'visibleF':[r.count(0) for r in prefix_rows],
           'smallExhaustiveChecks':tiny,'variables':variables,'clauses':clauses,
           'status':str(status),'seconds':time.monotonic()-start,'truthReach':truth_reach}
    if truth is not None:
        out['truthBeta'] = truth['beta']
        out['truthAlpha'] = truth['alpha']
        out['controlSource'] = truth['source']
        out['controlOffset'] = truth['offset']
        out['controlSeed'] = truth['seed']
    print('FIRST',json.dumps({k:v for k,v in out.items() if k!='truthReach'}),flush=True)
    if status == z3.sat:
        beta = recover(solver)
        check = [reach(C,K,beta) for C in prefix_rows]
        assert all(x['legal'] for x in check)
        full = [reach(C,K,beta) for C in rows]
        out.update(beta=beta, fitReach=check, fullReach=full, betaMatches=sum(a==b for a,b in zip(beta,truth['beta'])) if truth else None)
        print('KEY',json.dumps({'beta':beta,'betaMatches':out['betaMatches'],'fullLegal':[x['legal'] for x in full]}),flush=True)
        solver.add(z3.Or(*[z3.Not(z3.Bool(f'b{c}_{k}')) for c,k in enumerate(beta)]))
        solver.set(timeout=args.alternate_timeout)
        start = time.monotonic()
        alternative = solver.check()
        out.update(alternative=str(alternative),alternativeSeconds=time.monotonic()-start)
        if alternative == z3.sat:
            alt = recover(solver)
            assert all(reach(C,K,alt)['legal'] for C in prefix_rows)
            out['alternativeBeta'] = alt
        elif alternative == z3.unknown:
            out['alternativeUnknownReason'] = solver.reason_unknown()
    elif status == z3.unknown:
        out['unknownReason'] = solver.reason_unknown()
    assert not (truth is not None and status == z3.unsat), 'control false exclusion'
    print('RESULT',json.dumps(out,separators=(',',':')),flush=True)
    path = ROOT/'im-results'/f'lp2-nonperiodic-outer-sat-{args.target}-{args.schedule}-{args.prefix}.json'
    path.write_text(json.dumps(out,indent=2)+'\n',encoding='utf8')
    return out

if __name__ == '__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--schedule',choices=['ordinal','prime'],required=True)
    p.add_argument('--target',choices=['control','original'],required=True)
    p.add_argument('--prefix',type=int,default=0,help='0=entire nine chapters')
    p.add_argument('--timeout',type=int,default=420000)
    p.add_argument('--alternate-timeout',type=int,default=90000)
    experiment(p.parse_args())
