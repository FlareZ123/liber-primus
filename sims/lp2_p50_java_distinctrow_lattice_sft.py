#!/usr/bin/env python3
"""Exact Java Random.nextInt(256) ordered distinct-row inversion.
First eight raw draws have a restricted-growth pattern. Enumerate Bell(8)=4140
patterns; invert with certified lattice; replay later rejects with no cap.
Requires sympy. Run from repo root, optional original resource path argv[1].
"""
import hashlib, json, math, random, sys
from fractions import Fraction as F
from pathlib import Path
from sympy import Matrix
M, A, C, W, N = 1<<48, 0x5DEECE66D, 11, 1<<40, 8
EXPECTED={60:'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',59:'511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79'}
def advance(s):
    return (A*s+C)%M
def dot(a,b):
    return sum(x*y for x,y in zip(a,b))
def patterns(n):
    def visit(p,k):
        if len(p)==n:
            yield p
        else:
            for j in range(k+1):
                yield from visit(p+(j,),max(k,j+1))
    return list(visit((0,),1))
class Inverse:
    def __init__(self):
        self.offsets=[]; powers=[]; a=1; b=0
        for _ in range(N):
            powers.append(a);self.offsets.append(b)
            a=a*A%M;b=(b*A+C)%M
        basis=[powers]+[[M if i==j else 0 for i in range(N)] for j in range(1,N)]
        red=Matrix(basis).lll()
        self.rows=[list(map(int,red.row(i))) for i in range(N)]
        gs=[];self.proj=[];norm=[]
        for row in self.rows:
            q=list(map(F,row))
            for v in gs:
                k=dot(q,v)/dot(v,v);q=[a-k*b for a,b in zip(q,v)]
            s=dot(q,q);gs.append(q);norm.append(s)
            proj=[x/s for x in q];d=math.lcm(*(x.denominator for x in proj))
            self.proj.append(([int(x*d) for x in proj],d))
        assert min(norm)>N*W*W
        self.margin=float(min(norm)/(N*W*W))
    def solve(self,values):
        v=[x*W+W//2-b for x,b in zip(values,self.offsets)]
        t0=v[0]
        for row,(p,d) in zip(reversed(self.rows),reversed(self.proj)):
            num=dot(v,p);k,rem=divmod(num,d)
            if 2*rem>d or (2*rem==d and k%2):k+=1
            v=[x-k*y for x,y in zip(v,row)]
        s=t0-v[0]
        if not 0<=s<M:return None
        x=s
        for y in values:
            if x>>40!=y:return None
            x=advance(x)
        return s
def produce(s):
    row=[];raw=[]
    while len(row)<N:
        x=s>>40;raw.append(x)
        if x not in row:row.append(x)
        s=advance(s)
    return row,raw,s
def replay(s,row):
    seen=set();raw=[];j=0
    while j<N:
        x=s>>40;raw.append(x);s=advance(s)
        if x in seen:continue
        if x!=row[j]:return None
        seen.add(x);j+=1
    return raw,s
def solve_row(row,inv,pp):
    states=[];prefix=0
    for pat in pp:
        v=[row[j] for j in pat]
        s=inv.solve(v)
        if s is None:continue
        prefix+=1
        ans=replay(s,row)
        if ans is not None:states.append({'first_state':s,'raw_draws':len(ans[0]),'next_state':ans[1],'raw':ans[0]})
    assert len({x['first_state'] for x in states})==len(states)
    return {'prefix_states':prefix,'full_states':states}
def main():
    p=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'resources/liber-primus/lp2-grid-256.json'
    g=json.loads(p.read_text());tokens=[t for page in g['pages'] for t in page['tokens']]
    pp=patterns(N);assert len(pp)==4140
    inv=Inverse();rr=random.Random(3301);controls=[]
    for minimum in (0,1,2):
        while True:
            s=rr.randrange(M);row,raw,nxt=produce(s)
            rejects=N-len(set(raw[:N]))
            if rejects==minimum:break
        got=solve_row(row,inv,pp)
        assert any(x['first_state']==s and x['raw']==raw and x['next_state']==nxt for x in got['full_states'])
        controls.append({'first_state':s,'row':row,'raw':raw,'rejects_in_first8':rejects,**got})
    out={'patterns':len(pp),'radius_margin':inv.margin,'controls':controls,'radices':{}}
    for radix in (60,59):
        alphabet=g['alphabet'] if radix==60 else g['alphabet'].replace('f','')
        vals=[radix*alphabet.index(t[0])+alphabet.index(t[1]) for t in tokens]
        assert len(vals)==256 and hashlib.sha256(bytes(vals)).hexdigest()==EXPECTED[radix]
        rows=[vals[i:i+8] for i in range(0,256,8)]
        assert all(len(set(r))==8 for r in rows)
        result=[]
        for j,row in enumerate(rows):
            result.append({'row':j,'values':row,**solve_row(row,inv,pp)})
            print(f'radix={radix} row={j} prefix={result[-1]["prefix_states"]} full={len(result[-1]["full_states"])}',file=sys.stderr,flush=True)
        out['radices'][str(radix)]=result
    print(json.dumps(out,indent=2))
if __name__=='__main__':main()
