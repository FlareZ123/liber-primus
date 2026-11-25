"""Historical SSSS: exact exclusion of arbitrary invertible common binary share mixing."""
from itertools import combinations
from pathlib import Path
import hashlib
import json
import random

ROOT = Path(__file__).resolve().parents[1]
MOD = (1 << 256) | 0x425

def mul(a, b):
    p = 0
    while b:
        if b & 1:
            p ^= a
        a <<= 1
        b >>= 1
    while p.bit_length() > 256:
        p ^= MOD << (p.bit_length() - 257)
    return p

def basis(vectors):
    pivots = {}
    for v in vectors:
        while v:
            i = v.bit_length() - 1
            if i in pivots:
                v ^= pivots[i]
            else:
                pivots[i] = v
                break
    return list(pivots.values())

def weights(ids):
    assert len(ids) == 7 and len(set(ids)) == 7
    out = []
    for i in range(7):
        w = 1
        for a, b in combinations([j for j in range(7) if j != i], 2):
            w = mul(w, ids[a] ^ ids[b])
        out.append(w)
    assert any(out) and not xor(out)
    return out

def xor(xs):
    v = 0
    for x in xs:
        v ^= x
    return v

def syndrome_rank(words, ids):
    b = basis(weights(ids))
    return len(b), len(basis(mul(z, w) for z in words for w in b))

def dependencies(cols):
    pivots = {}
    null = []
    for i, v in enumerate(cols):
        u = 1 << i
        while v:
            k = v.bit_length() - 1
            if k in pivots:
                x, y = pivots[k]
                v ^= x
                u ^= y
            else:
                pivots[k] = (v, u)
                break
        if not v:
            null.append(u)
    return null

def rows(bits):
    return [(bits >> (8*i)) & 255 for i in range(8)]

def mix(words, matrix):
    return [xor(v for j, v in enumerate(words) if row >> j & 1) for row in matrix]

def positive():
    rng = random.Random(3301)
    coef = [rng.getrandbits(256) for _ in range(5)] + [1]
    ids = list(range(1, 9))
    y = []
    for x in ids:
        p = 0
        for c in reversed(coef):
            p = mul(p, x) ^ c
        y.append(p)
    assert len(basis(y)) == 8
    z = y.copy()
    ops = []
    for _ in range(80):
        a, b = rng.sample(range(8), 2)
        z[a] ^= z[b]
        ops.append((a,b))
    inv = [1 << j for j in range(8)]
    for a, b in reversed(ops):
        inv[a] ^= inv[b]
    assert mix(z, inv) == y
    w0 = weights(ids[:7]) + [0]
    w1 = [0] + weights(ids[1:])
    cols = [mul(w0[i], z[j]) | (mul(w1[i], z[j]) << 256) for i in range(8) for j in range(8)]
    null = dependencies(cols)
    actual = sum(row << (8*i) for i,row in enumerate(inv))
    assert len(basis(null+[actual])) == len(null)
    r, rank = syndrome_rank(z, ids[:7]); assert rank < 8*r
    assert len(null) == 9
    count = 0
    for bits in range(1, 1 << len(null)):
        a = rows(xor(v for i,v in enumerate(null) if bits >> i & 1))
        if len(basis(a)) == 8:
            out = mix(z, a)
            assert xor(mul(w,v) for w,v in zip(w0,out)) == 0
            assert xor(mul(w,v) for w,v in zip(w1,out)) == 0
            count += 1
    assert count == 128
    print(json.dumps(dict(control=True, weight_rank=r, product_rank=rank, nullity=len(null), invertible_solutions=count, actual_inverse_in_space=True)))

def main():
    d = json.loads((ROOT/'resources/liber-primus/lp2-grid-256.json').read_text(encoding='utf8'))
    tokens = [t for p in d['pages'] for t in p['tokens']]
    assert len(tokens) == 256
    for radix in (59,60):
        alphabet = d['alphabet'].replace('f','') if radix == 59 else d['alphabet']
        g = bytes(radix*alphabet.index(t[0])+alphabet.index(t[1]) for t in tokens)
        if radix == 60:
            assert hashlib.sha256(g).hexdigest() == '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
        for layout in ('vertical','contiguous'):
            shares = [g[j::8] if layout == 'vertical' else g[32*j:32*j+32] for j in range(8)]
            for order in ('big','little'):
                z = [int.from_bytes(v,order) for v in shares]
                counts = {}
                for ids in combinations(range(1,11),7):
                    r, rank = syndrome_rank(z, ids)
                    counts[(r,rank)] = counts.get((r,rank),0)+1
                print(json.dumps(dict(radix=radix,layout=layout,order=order,rank_counts={str(k):v for k,v in counts.items()})))
                assert counts == {(3,24):2, (5,40):24, (6,48):92, (2,16):2}
    positive()

if __name__ == '__main__':
    main()
