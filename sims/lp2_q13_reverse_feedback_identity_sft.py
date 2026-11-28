#!/usr/bin/env python3
"""Deterministic algebraic SFT, no LP2 plaintext or original-cipher fitting.

q13 reverse: C[i] = pi_r(P[i]) + B_r*C[i+1] (mod29)
For invertible B: C[i+1]-B^-1*C[i] = -B^-1*pi_r(P[i]).
"""
from random import Random
p=29
add=lambda x,y: ((x[0]+y[0])%p,(x[1]+y[1])%p)
neg=lambda x:((-x[0])%p,(-x[1])%p)
sub=lambda x,y:add(x,neg(y))
def mv(M,x):
    return ((M[0]*x[0]+M[1]*x[1])%p,(M[2]*x[0]+M[3]*x[1])%p)
def inverse(B):
    a,b,c,d=B
    det=(a*d-b*c)%p
    if not det: return None
    inv=pow(det,-1,p)
    return (d*inv%p, -b*inv%p, -c*inv%p, a*inv%p)
def invertible_phase_test(seed=33013264,n=104):
    rng=Random(seed)
    B=[]
    for _ in range(13):
        while True:
            M=tuple(rng.randrange(29) for _ in range(4))
            if inverse(M) is not None: break
        B.append(M)
    maps=[]
    for _ in range(13):
        while True:
            M=tuple(rng.randrange(29) for _ in range(4))
            if inverse(M): break
        b=(rng.randrange(29),rng.randrange(29))
        maps.append((M,b))
    P=[(rng.randrange(29),rng.randrange(29)) for _ in range(n)]
    C=[None]*(n+1)
    C[n]=(rng.randrange(29),rng.randrange(29))
    for i in range(n-1,-1,-1):
        M,b=maps[i%13]
        C[i]=add(add(mv(M,P[i]),b),mv(B[i%13],C[i+1]))
    for i in range(n):
        r=i%13; A=inverse(B[r]); M,b=maps[r]
        E=sub(C[i+1],mv(A,C[i]))
        transformed=neg(mv(A,add(mv(M,P[i]),b)))
        assert E==transformed, (i,E,transformed)
        assert C[i+1]==add(E,mv(A,C[i]))
    invertibles=sum(inverse((a,b,c,d)) is not None
                   for a in range(29) for b in range(29)
                   for c in range(29) for d in range(29))
    assert invertibles==682080
    print(f'invertible q13 reverse->ordinary: PASS {n} exact transitions, 13 independent lanes')
    print('GF29 matrices: 707281 total, 682080 invertible, 25200 rank1, 1 zero')
def same_position_direction_counterexample():
    N=52
    C=[(0,0)]*(N+1)
    selected=[5,18,31,44]
    for t,i in enumerate(selected,1):
        C[i]=C[i+1]=(t,0)
    P=[sub(C[i],C[i+1]) for i in range(N)]
    assert all(P[i]==(0,0) and C[i-1]==(0,0) for i in selected)
    assert len({C[i] for i in selected})==4
    for A in [(0,0,0,0),(1,0,0,1),(3,7,4,11)]:
        assert len({sub(C[i],mv(A,C[i-1])) for i in selected})==4
    for j in range(1,N+1):
        assert sub(C[j],C[j-1])==neg(P[j-1])
    print('fixed-position reverse != forward: PASS four-repeat q13 lane-5 witness')
    print('one-block delayed plaintext restores exact forward inverse: PASS')
if __name__=='__main__':
    invertible_phase_test()
    same_position_direction_counterexample()
