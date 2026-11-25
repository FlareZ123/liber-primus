"""Exact Shamir consistency obstruction, independent stationary field label per lane.
Run from repo: python sims/lp2_p2_p23_independent_field_labels_sft.py
Optional --fixture accepts two base29 ASCII strings exported from the pinned corpus.
No dependencies beyond Python 3.10+. No source files are modified.
"""
import argparse
import hashlib
import json
import math
import random
from pathlib import Path

EXPECTED = '50ac9d025ddbd12063488ce08ba6c18af1722d1e16a8a80aad6fb44dcd35f084'


def load(fixture):
    if fixture:
        s, b = Path(fixture).read_text().splitlines()
        s, b = [int(x, 36) for x in s], [int(x, 36) for x in b]
    else:
        c = json.loads((Path(__file__).resolve().parents[1] / 'resources/liber-primus/lp2-corpus.json').read_text(encoding='utf-8'))
        s = c['pages'][2]['indices']
        b = [x for page in c['pages'][23:27] for x in page['indices']][16:]
    assert len(s) == 201 and len(b) == 1005
    assert hashlib.sha256(bytes(s+b)).hexdigest() == EXPECTED
    return s, b


def matrix(lanes):
    """Gauge out 5 lane-constant null directions and all unseen labels."""
    maps = []
    n = 1
    for lane in lanes:
        alphabet = sorted(set(lane))
        codes = {alphabet[0]: None}
        for a in alphabet[1:]:
            codes[a] = n
            n += 1
        maps.append(codes)
    result = []
    for column in zip(*lanes):
        row = [1]+[0]*(n-1)
        for a, codes in zip(column, maps):
            i = codes[a]
            if i is not None:
                row[i] = 1
        result.append(row)
    return result


def determinant(a):
    """Exact Bareiss determinant of a square integer matrix."""
    a = [row[:] for row in a]
    n = len(a)
    d,sign = 1,1
    for k in range(n-1):
        p = next((i for i in range(k,n) if a[i][k]),None)
        if p is None: return 0
        if p != k:
            a[k],a[p] = a[p],a[k]
            sign = -sign
        pivot = a[k][k]
        for i in range(k+1,n):
            for j in range(k+1,n):
                value = a[i][j]*pivot-a[i][k]*a[k][j]
                assert value % d == 0
                a[i][j] = value//d
            a[i][k] = 0
        d = pivot
    return sign*a[-1][-1] if n else 1


def modular_independent_rows(matrix,p):
    basis = {}
    used = []
    for i,row in enumerate(matrix):
        r = [x%p for x in row]
        for k,a in enumerate(r):
            if not a: continue
            if k in basis:
                r[k:] = [(x-a*y)%p for x,y in zip(r[k:],basis[k])]
            else:
                inv = pow(a,-1,p)
                basis[k] = [(x*inv)%p for x in r[k:]]
                used.append(i)
                break
        if len(used)==len(row): break
    return used


def integer_unit_pivots(matrix):
    """Unit pivot elimination followed by coprime exact maximal-minor certificate."""
    rows = [{j:v for j,v in enumerate(row) if v} for row in matrix]
    width = len(matrix[0]); remaining = set(range(width))
    max_bits = 1
    for k in range(width):
        counts = {}
        for row in rows:
            for j in row:
                counts[j] = counts.get(j,0)+1
        best = min((( (len(row)-1)*(counts[j]-1), i, j)
                      for i,row in enumerate(rows) for j,v in row.items() if abs(v)==1),default=None)
        if best is None: break
        _,i,col = best
        remaining.remove(col)
        pivot = rows.pop(i)
        scale = pivot.pop(col)
        for row in rows:
            f = row.pop(col,0)*scale
            if not f: continue
            for j,v in pivot.items():
                x = row.get(j,0)-f*v
                if x:
                    row[j] = x
                    max_bits = max(max_bits,abs(x).bit_length())
                else: row.pop(j,None)
    cols = sorted(remaining)
    core = [[row.get(j,0) for j in cols] for row in rows]
    if not cols: return width,1,max_bits,[]
    cert = []
    g = 0
    rng = random.Random(3301)
    primes = (2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97)
    for attempt in range(100):
        p = primes[attempt % len(primes)]
        # Selecting full-rank rows mod p ensures a nonzero exact minor.
        order = list(range(len(core)))
        if attempt: rng.shuffle(order)
        used = [order[i] for i in modular_independent_rows([core[i] for i in order],p)]
        if len(used) < len(cols): continue
        d = determinant([core[i] for i in used])
        assert d % p
        cert.append({'prime':p,'rows':used,'det':str(d)})
        g = math.gcd(g,d)
        if g == 1: break
    return width-len(cols),g,max_bits,cert


def modular_rank(matrix, p):
    basis = {}
    for row in matrix:
        r = [x % p for x in row]
        for k, a in enumerate(r):
            if not a:
                continue
            if k in basis:
                r[k:] = [(x-a*y)%p for x,y in zip(r[k:],basis[k])]
            else:
                inv = pow(a,-1,p)
                basis[k] = [(x*inv)%p for x in r[k:]]
                break
    return len(basis)


def gf256_mul(a,b):
    r = 0
    while b:
        if b & 1: r ^= a
        a = (a << 1) ^ (0x11b if a & 128 else 0)
        b >>= 1
    return r


def controls():
    rng = random.Random(3301)
    # Six independently substituted rune streams of five independently drawn
    # GP29 operands. Their sixth value is the missing interpolation evaluation.
    weights = [1,-5,10,-10,5,-1]
    lanes = [[] for _ in range(6)]
    encoders = [rng.sample(range(29),29) for _ in range(6)]
    plain = []
    for j in range(201):
        vals = [rng.randrange(29) for _ in range(5)]
        vals.append(sum(a*b for a,b in zip(weights,vals))%29)
        plain.append(vals)
        for i,v in enumerate(vals): lanes[i].append(encoders[i][v])
    M = matrix(lanes)
    rank = modular_rank(M,29)
    assert rank < len(M[0])
    assert all(sum(a*b for a,b in zip(weights,vals))%29==0 for vals in plain)
    # Characteristic-two control: five random values in 0..7 plus their XOR.
    # Coefficients already absorbed in the six independent field labelings.
    # Fixed GF256 multiplication by a distinct nonzero coefficient is bijective.
    labels = [rng.sample(range(29),8) for _ in range(6)]
    coeff = [1,2,3,4,5,6]
    lanes = [[] for _ in range(6)]
    plain = []
    for j in range(201):
        vals = [rng.randrange(8) for _ in range(5)]
        vals.append(vals[0]^vals[1]^vals[2]^vals[3]^vals[4])
        for i,v in enumerate(vals): lanes[i].append(labels[i][v])
        # Multiplicative inverse recovers independent underlying field labels.
        native = [next(x for x in range(256) if gf256_mul(coeff[i],x)==v) for i,v in enumerate(vals)]
        assert all(gf256_mul(coeff[i],x)==v for i,(x,v) in enumerate(zip(native,vals)))
        assert gf256_mul(coeff[0],native[0])^gf256_mul(coeff[1],native[1])^gf256_mul(coeff[2],native[2])^gf256_mul(coeff[3],native[3])^gf256_mul(coeff[4],native[4])^gf256_mul(coeff[5],native[5])==0
    M2 = matrix(lanes)
    rank2 = modular_rank(M2,2)
    assert rank2 < len(M2[0])
    return {'GP29': [rank,len(M[0])], 'GF256': [rank2,len(M2[0])]}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--fixture')
    args = parser.parse_args()
    s,b = load(args.fixture)
    print('native arithmetic planted controls:', controls(), flush=True)
    for layout in ('quintet','blocks'):
        raw = [s]+[b[i::5] if layout=='quintet' else b[201*i:201*(i+1)] for i in range(5)]
        results = []
        for mask in range(32):
            lanes = [raw[0]]+[raw[i+1][::-1] if mask & (1<<i) else raw[i+1] for i in range(5)]
            M = matrix(lanes)
            k,pivot,bits,cert = integer_unit_pivots(M)
            results.append({'mask':mask,'unit_pivots':k,'width':len(M[0]),'minor_gcd':pivot,'max_bits':bits,'minors':cert})
        print(json.dumps({'layout':layout,'distinct':[len(set(lane)) for lane in raw],'results':results}),flush=True)
        assert all(row['minor_gcd']==1 for row in results)

if __name__=='__main__':
    main()
