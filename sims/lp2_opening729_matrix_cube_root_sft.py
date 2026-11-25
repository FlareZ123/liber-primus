"""Exact GF(29) cube roots of the opening 27x27 matrix.
Dependencies: numpy, sympy. Read-only; run from repository root.
"""
import json
from itertools import product
from pathlib import Path
import numpy as np
import sympy as s

x = s.symbols("x")
N = 27
Q = 29
I = s.Poly(1, x, modulus=Q)
X = s.Poly(x, x, modulus=Q)
Id = np.eye(N, dtype=np.int64)

def ppow(a, b, m):
    r = I
    while b:
        if b & 1:
            r = (r*a).rem(m)
        a = (a*a).rem(m)
        b >>= 1
    return r

def matpoly(A, f):
    y = np.zeros_like(A)
    for c in f.all_coeffs():
        y = (y@A + int(c)*Id) % Q
    return y

def roots_in_factor(f):
    order = Q**f.degree()-1
    d = 1
    while (order//d) % 3 == 0:
        d *= 3
    m = order//d
    if d == 1:
        return [ppow(X, pow(3, -1, order), f)]
    e1 = d*pow(d, -1, m) % order
    a1 = ppow(X, e1, f)
    a2 = ppow(X, (1-e1)%order, f)
    root1 = ppow(a1, pow(3, -1, m), f)
    # Find a generator of the 3-primary subgroup. The fixed trial bank
    # suffices for these original/control factors; fail rather than cap.
    for c in range(Q):
        z = ppow(X+s.Poly(c, x, modulus=Q), m, f)
        if ppow(z, d//3, f) != I:
            break
    else:
        raise RuntimeError("no subgroup generator in trial bank")
    return [(root1*ppow(z,k,f)).rem(f) for k in range(d)
            if ppow(ppow(z,k,f),3,f)==a2]

def all_roots(A):
    p = s.Poly(s.Matrix(A.tolist()).charpoly(x).as_expr(), x, modulus=Q)
    factors0 = s.factor_list(p)[1]
    assert p.nth(0) and all(k==1 for _,k in factors0)
    assert not np.any(matpoly(A,p))
    factors = [f for f,_ in factors0]
    R = [roots_in_factor(f) for f in factors]
    E = [(p.exquo(f)*s.invert(p.exquo(f),f)).rem(p) for f in factors]
    roots = []
    for rs in product(*R):
        poly = sum((a*b for a,b in zip(rs,E)), s.Poly(0,x,modulus=Q)).rem(p)
        z = matpoly(A,poly)
        assert np.array_equal(z@z%Q@z%Q,A)
        roots.append(z)
    return p, factors, [len(r) for r in R], roots

def ioc(a):
    f = np.bincount(a.ravel(),minlength=Q)
    return float(sum(f*(f-1))/(a.size*(a.size-1)))

gp = json.loads(Path("resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
tape = [i for p in gp["pages"] if p["page"]<=2 for i in p["indices"]]
assert len(tape)==729
C=np.array(tape,dtype=np.int64).reshape(N,N)
for reflect in (False,True):
    A=C[::-1,:].copy() if reflect else C
    p,factors,counts,roots=all_roots(A)
    print("reflect",reflect,"degrees",[f.degree() for f in factors],"root counts",counts)
    print("square residue tests",[ppow(X,(Q**f.degree()-1)//2,f).as_expr()==1 for f in factors])
    for j,z in enumerate(roots):
        if reflect:
            z=z[::-1,:]
        print("root",j,"ioc",ioc(z),"head","".join(gp["translit"][i] for i in z.ravel()[:100]))
    for title,z in [("inverse",matpoly(A,s.invert(X,p))),("square",A@A%Q),("cube",A@A%Q@A%Q)]:
        if reflect:
            z=z[::-1,:]
        print(title,"ioc",ioc(z),"head","".join(gp["translit"][i] for i in z.ravel()[:100]))
    if not reflect:
        assert [f.degree() for f in factors]==[9,18] and counts==[1,3]
    else:
        assert not roots
gold=json.loads(Path("resources/external/relikd-solved-gp29-native-v1.json").read_text(encoding="utf8"))
ix={g:i for i,g in enumerate(gp["runes"])}
sec=next(v for v in gold["sections"] if v["name"]=="0_koan_1")
P=np.array([ix[c] for c in sec["source_text"] if c in ix][:729],dtype=np.int64).reshape(N,N)
_,_,counts,roots=all_roots(P@P%Q@P%Q)
assert len(roots)==27 and sum(np.array_equal(z,P) for z in roots)==1
print("native control roots",len(roots),"true ioc",ioc(P),"exact match 729/729")
