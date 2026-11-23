"""LP2 p50: exact all-secret recovery of every fixed 8-bit slice of four LCGs.
Read-only Python 3 + SymPy 1.14 SFT. No seed sampling or plaintext fitting.
"""
from __future__ import annotations
from fractions import Fraction as F
from hashlib import sha256
from pathlib import Path
from math import isqrt
from functools import lru_cache
import json
from sympy import Matrix

SRC = json.loads((Path(__file__).resolve().parent.parent/'resources/liber-primus/lp2-grid-256.json').read_text(encoding='utf8'))
TOKENS = [x for page in SRC['pages'] for x in page['tokens']]
assert len(TOKENS) == 256 and len(SRC['bytes']) == 256

def decode(radix: int, order: str) -> list[int]:
    alpha = SRC['alphabet'] if radix == 60 else SRC['alphabet'].replace('f', '')
    raw = [radix*alpha.index(t[0]) + alpha.index(t[1]) for t in TOKENS]
    assert all(0 <= x < 256 for x in raw)
    expected = {60:'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
                59:'511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79'}
    assert sha256(bytes(raw)).hexdigest() == expected[radix]
    if radix == 60: assert raw == SRC['bytes']
    return raw if order=='row' else [raw[8*r+c] for c in range(8) for r in range(32)]

@lru_cache(maxsize=128)
def make_basis(a: int, c:int, bits: int, N:int = 8):
    mod = 1 << bits
    aa=[1];bb=[0]
    for _ in range(1,N):
        aa.append((aa[-1]*a)%mod)
        bb.append((bb[-1]*a+c)%mod)
    base = Matrix([aa] + [[mod if i==j else 0 for j in range(N)] for i in range(1,N)])
    reduced = base.lll()
    assert abs(int(reduced.det())) == mod**(N-1)
    basis = [[int(x) for x in row] for row in reduced.tolist()]
    for row in basis:
        assert all((row[j]-aa[j]*row[0])%mod == 0 for j in range(N))
    orth = []
    norm = []
    mu = [[F(0) for _ in range(N)] for _ in range(N)]
    for i in range(N):
        b = basis[i]
        v = [F(x) for x in b]
        for j in range(i):
            mu[i][j] = sum(x*y for x,y in zip(b,orth[j]))/norm[j]
            v = [x-mu[i][j]*y for x,y in zip(v,orth[j])]
        norm.append(sum(x*x for x in v))
        orth.append(v)
    return basis, aa, bb, orth, norm, mu

def solve8(y:list[int], a:int, c:int, slice_low:int):
    """Enumerate every generator state matching first eight output bytes exactly.

    Hidden state modulo 2^(slice_low+8) is a lattice of affine observations.
    Every true output gives a lattice point in a closed eight-dimensional
    cube; its circumscribed sphere has exact rational radius N*(Q-1)^2/4.
    Enumerate every point of that sphere using exact Gram-Schmidt arithmetic.
    """
    assert len(y) >= 8
    N = 8
    mod = 1 << (slice_low + 8)
    Q = 1 << slice_low
    basis,aa,bb,orth,norm,mu = make_basis(a,c,slice_low+8)
    half = F(Q-1,2)
    center=[F(y[i]*Q) + half - bb[i] for i in range(N)]
    alpha=[sum(u*v for u,v in zip(center,orth[i]))/norm[i] for i in range(N)]
    R2=N*half*half
    zs=[0]*N
    result=[]
    count = [0]*N
    def visit(i:int,remaining:F):
        if i<0:
            vec0=sum(zs[k]*basis[k][0] for k in range(N)) % mod
            if all((((aa[j]*vec0+bb[j])%mod)>>slice_low)==y[j] for j in range(N)):
                result.append(vec0)
            return
        middle=alpha[i]-sum(zs[j]*mu[j][i] for j in range(i+1,N))
        fraction=remaining/norm[i]
        upper=(fraction.numerator+fraction.denominator-1)//fraction.denominator
        bound=isqrt(upper)+2
        floor=middle.numerator//middle.denominator
        for k in range(floor-bound, floor+bound+2):
            loss=(F(k)-middle)**2*norm[i]
            if loss<=remaining:
                zs[i]=k
                count[i]+=1
                visit(i-1,remaining-loss)
    visit(N-1,R2)
    return sorted(set(result)),count

def sequence(first:int,a:int,c:int,s:int,n:int=256):
    mod=1<<(s+8)
    x=first%mod
    arr=[]
    for _ in range(n):
        arr.append(x>>s)
        x=(x*a+c)%mod
    return arr

FAMILIES = {
 'java-drand48': (0x5DEECE66D, 11, 48),
 'glibc-type0-ansi': (1103515245, 12345, 31),
 'msvc-rand': (214013, 2531011, 32),
 'numerical-recipes': (1664525, 1013904223, 32),
}

for name,(a,c,width) in FAMILIES.items():
    for s in (0,1,8,min(16,width-8),width-8):
        first=(0x123456789ABC ^ (s*3301))&((1<<(s+8))-1)
        truth=sequence(first,a,c,s)
        recovered,_=solve8(truth,a,c,s)
        assert first in recovered, (name,s,first,recovered)
        assert any(sequence(k,a,c,s)==truth for k in recovered)
    print(f'{name}: all five nonadjacent positive seed/slice controls PASS')

for name,(a,c,width) in FAMILIES.items():
    initial_hits=0
    full_hits=0
    sample=[]
    for s in range(width-7):
        for radix in (60,59):
            for order in ('row','column'):
                b=decode(radix,order)
                cands,nodes=solve8(b,a,c,s)
                initial_hits += len(cands)
                complete=[seed for seed in cands if sequence(seed,a,c,s)==b]
                full_hits += len(complete)
                for seed in complete: sample.append((s,radix,order,seed))
    print(f'{name}: {width-7} byte slices x 4 source readings = {4*(width-7)} all-secret exact gates; first8 states={initial_hits}; full256 states={full_hits}; survivors={sample}')

# Eight distinct 32-byte printed columns also align in count and width with
# eight authentic $-terminated LP2 sections. Grant an entirely independent
# unknown seed/state to each column: every first-eight-byte test is all-key.
# This is strictly more flexible than the continuous 256-byte model above.
for name, (a, c, width) in FAMILIES.items():
    first8_states = 0
    complete32_states = 0
    cases = 0
    for shift in range(width - 7):
        for radix in (59, 60):
            flat = decode(radix, 'row')
            for col in range(8):
                column = flat[col::8]
                assert len(column) == 32
                candidates, _ = solve8(column, a, c, shift)
                cases += 1
                first8_states += len(candidates)
                complete32_states += sum(1 for seed in candidates if
                                         sequence(seed, a, c, shift, 32) == column)
    assert first8_states == complete32_states == 0
    print(f'{name}: {cases} independent-column / state / byte-slice original cases; '
          f'first8 states={first8_states}, full32 states={complete32_states}')

# Exact eight-independent-seed positive: 32 bytes of each constructed
# generator, eight different starts, one source-facing printed column each.
for name, (a, c, width) in FAMILIES.items():
    shift = width - 8
    for col in range(8):
        seed = (0x123456789ABC + 3301 * col) & ((1 << (shift + 8)) - 1)
        plant = sequence(seed, a, c, shift, 32)
        candidates, _ = solve8(plant, a, c, shift)
        assert seed in candidates and any(
            sequence(candidate, a, c, shift, 32) == plant for candidate in candidates)
    print(f'{name}: eight independently seeded 32-byte planted column streams PASS')
