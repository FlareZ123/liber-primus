"""Audit #3258: exhaustive completion of every consistent affine leaf.
Standalone Python 3, no packages. Native GP indices are pinned from
resources/external/relikd-solved-gp29-native-v1.json; anchor indices and
seed scheme from sims/agent31_q8_seven_crib_gf29_receiver_sft.py and
sims/lp2_shared_gp29_q8_multichapter_pool_sft.py.
Only the four original calibration cases are tested.
"""
from itertools import product
from collections import Counter
import random

M, N = 29, 51
A = [
    (1,13,[5,10,4,5,1,19,0,18,4,18,9,5,18,15]),
    (0,1,[10,9,15,16,4,1,5,16,27,9]),
    (2,19,[13,10,20,6,4,10,19]),
    (0,5,[23,10,15,5,3,1,18,4]),
    (0,7,[10,9,15,10,23,18]),
    (2,2,[7,10,2,10,9]),
    (2,18,[18,1,18,4,26]),
]

def primitive(k):
    return any(k[i] != k[i+4] for i in range(4))

def orbit(a,b):
    return any(a == [x*s%M for x in b[t:]+b[:t]]
               for t in range(8) for s in range(1,M))

def rk(r):
    while True:
        k = [r.randrange(M) for _ in range(8)]
        if primitive(k):
            return k

def chart(r):
    a = list(range(1,M))
    r.shuffle(a)
    return [0]+[v*pow(a[0],-1,M)%M for v in a]

def enc(p,c,k,t):
    out = []
    for x in p:
        if x == 0:
            out.append(0)
        else:
            out.append(c.index((c[x]+k[t])%M))
            t = (t+1)%8
    return out

def fixtures(seed,ind):
    r = random.Random(3301+seed)
    ks, starts = [], []
    for i in range(3):
        k = r.sample(range(1,M),8) if i == 0 else rk(r)
        while any(orbit(k,o) for o in ks):
            k = rk(r)
        ks.append(k)
    for i,(n,anchor) in enumerate(zip([18,20,25],[1,13,19])):
        k = ks[i]
        st = [r.randrange(8) for _ in range(n)]
        rot = next(j for j,v in enumerate(k) if v)
        st[anchor] = rot
        ks[i] = k[rot:]+k[:rot]
        starts.append([(x-rot)%8 for x in st])
    if ind:
        r = random.Random(20000+seed)
        cs = [chart(r) for _ in range(3)]
        # Verify the first three candidates already meet the generator's
        # independent subgroup criterion; no rejection-loop draw omitted.
        maps = [[c.index((c[i]-k[0])%M) for i in range(M)]
                for c,k in zip(cs,ks)]
        for i,a in enumerate(maps):
            v = list(range(M))
            for t in range(1,M):
                v = [a[x] for x in v]
                assert all(v != b for b in maps[:i])
    else:
        cs = [chart(random.Random(10000+seed))]*3
    return [(ci,p,enc(p,cs[ci],ks[ci],starts[ci][j])) for ci,j,p in A]

def add(B,row,rhs):
    row = list(row)
    rhs %= M
    for i,(old,rr) in sorted(B.items()):
        if (v := row[i]):
            row = [(a-v*b)%M for a,b in zip(row,old)]
            rhs = (rhs-v*rr)%M
    i = next((i for i,v in enumerate(row) if v),None)
    if i is None:
        return rhs == 0
    z = pow(row[i],-1,M)
    B[i] = ([a*z%M for a in row],rhs*z%M)
    return True

def solve(B,x):
    for i,(row,rhs) in sorted(B.items(),reverse=True):
        x[i] = (rhs-sum(row[j]*x[j] for j in range(i+1,N)))%M
    return x

def audit(seed,ind):
    groups = fixtures(seed,ind)
    ranks,valid = Counter(),Counter()
    branches = unresolved = 0
    def walk(i,B,phases):
        nonlocal branches,unresolved
        if i == len(groups):
            rank = len(B)
            ranks[rank] += 1
            free = [j for j in range(N) if j not in B]
            if len(free)>3:
                unresolved += 1
                return
            for vals in product(range(M),repeat=len(free)):
                x = [0]*N
                for j,v in zip(free,vals):
                    x[j] = v
                solve(B,x)
                pi = [0,1]+x[:27]
                if len(set(pi)) != M:
                    continue
                keys = [x[27+j*8:35+j*8] for j in range(3)]
                if not all(primitive(k) for k in keys):
                    continue
                assert all(enc(p,pi,keys[c],t)==ct
                           for (c,p,ct),t in zip(groups,phases))
                valid[rank] += 1
            return
        ci,p,ct = groups[i]
        for start in ([0] if i<3 else range(8)):
            branches += 1
            C = B.copy()
            t = start
            for a,b in zip(p,ct):
                if a == 0:
                    assert b == 0
                    continue
                row = [0]*N
                if b>=2:
                    row[b-2] += 1
                if a>=2:
                    row[a-2] -= 1
                row[27+8*ci+t] -= 1
                if not add(C,row,int(a==1)-int(b==1)):
                    break
                t = (t+1)%8
            else:
                walk(i+1,C,phases+[start])
    B = {}
    assert add(B,[1]*27+[0]*24,28)
    walk(0,B,[])
    print(seed,ind,'branches',branches,'ranks',dict(ranks),
          'valid',dict(valid),'unresolved',unresolved,flush=True)
    return branches,dict(ranks),dict(valid),unresolved

if __name__ == '__main__':
    expected = [
        (3051,{51:18,50:4},{51:1},0),
        (2323,{49:9,50:18},{},0),
        (3131,{51:20,50:3,49:1},{51:1},0),
        (2923,{51:15,49:3,50:5},{},0),
    ]
    observed = [audit(seed,ind) for seed in range(2) for ind in (False,True)]
    assert observed == expected
