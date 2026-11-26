"""Scope extension of the fixed nonperiodic outer-alphabet SAT inverse.
The previous original whole-book LP1 cases are NOT rerun. Test each illustrated
chapter alone, permitting independent alphabets, and the authentic first-prime
clock (prime_j - 1) at zero chapter origin, previously capped in Agent 3's search.
"""
import argparse
import json
import random
import time
from lp2_nonperiodic_fhold_outer_sat import ROOT, STARTS, gp, inputs, make_solver, recover, reach, small_controls, z3

def prime_clock(n):
    primes=[]
    candidate=2
    while len(primes)<n:
        if all(candidate%p for p in primes if p*p<=candidate):
            primes.append(candidate)
        candidate+=1
    return [(p-1)%29 for p in primes]

def run(rows,K,timeout):
    t=time.monotonic()
    solver,v,c=make_solver(rows,K,timeout=timeout)
    st=solver.check()
    result={'status':str(st),'variables':v,'clauses':c,'seconds':time.monotonic()-t}
    if st==z3.sat:
        b=recover(solver)
        checks=[reach(row,K,b) for row in rows]
        assert all(x['legal'] for x in checks)
        result.update(beta=b,reach=checks)
    elif st==z3.unknown:
        result['reason']=solver.reason_unknown()
    return result

def main(args):
    rows,K,_=inputs('ordinal' if args.schedule=='p56' else args.schedule,'original')
    controls=small_controls()
    if args.schedule=='p56':
        K=prime_clock(max(map(len,rows)))
        donor=gp((ROOT/'resources/control/gibran_prophet_58585.txt').read_text(encoding='utf8'))[12000:12000+STARTS[-1]]
        rng=random.Random(2026112603)
        A=[0]+rng.sample(list(range(1,29)),28)
        B=rng.sample(list(range(29)),29)
        inv=[B.index(k) for k in range(29)]
        plant=[]
        for a,b in zip(STARTS,STARTS[1:]):
            j=0
            C=[]
            for p in donor[a:b]:
                if p==0: C.append(0)
                else:
                    C.append(inv[(A[p]+K[j])%29]);j+=1
            plant.append(C)
        assert all(reach(row,K,B)['legal'] for row in plant)
        control=run(plant,K,args.timeout)
        assert control['status']!='unsat'
        if control['status']=='sat':
            control['betaMatches']=sum(a==b for a,b in zip(B,control['beta']))
        full=run(rows,K,args.timeout)
        print('p56 pooled control/original',control['status'],full['status'],flush=True)
    else:
        control=full=None
    private=[]
    for j,row in enumerate(rows):
        item=run([row],K,args.timeout)
        item.update(chapter=j,start=STARTS[j],length=len(row),visibleF=row.count(0))
        print(args.schedule,j,item['status'],item['seconds'],flush=True)
        private.append(item)
    out={'schedule':args.schedule,'smallExhaustiveChecks':controls,'pooledControl':control,'pooledOriginal':full,'privateOriginal':private}
    (ROOT/'im-results'/f'lp2-nonperiodic-outer-scope-{args.schedule}.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf8')
if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--schedule',choices=['ordinal','prime','p56'],required=True)
    p.add_argument('--timeout',type=int,default=60000)
    main(p.parse_args())
