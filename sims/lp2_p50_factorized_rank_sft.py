"""Factor each original p49-51 ordered row into subset rank and permutation rank.
Usage: python sims/lp2_p50_factorized_rank_sft.py [path/to/lp2-grid-256.json]
Python 3 standard library only. Reads source, writes JSON to stdout.
"""
import hashlib
import itertools
import json
import math
import random
import sys
from pathlib import Path

ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'
TARGET = bytes.fromhex('36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4')
N, K = 256, 8
WIDTH = math.comb(N, K).bit_length()

def subset_rank(s, n):
    """Zero-based lexicographic combination rank."""
    out, lo = 0, 0
    for i, a in enumerate(s):
        rem = len(s) - i - 1
        for v in range(lo, a):
            out += math.comb(n-v-1, rem)
        lo = a+1
    return out

def subset_unrank(rank, n, k):
    assert 0 <= rank < math.comb(n,k)
    result, lo = [], 0
    for rem in range(k-1,-1,-1):
        for v in range(lo, n-rem):
            count = math.comb(n-v-1, rem)
            if rank < count:
                result.append(v)
                lo = v+1
                break
            rank -= count
    assert rank == 0
    return result

def perm_rank(row):
    pool = sorted(row)
    out = 0
    for v in row:
        i = pool.index(v)
        out = out * len(pool) + i
        pool.pop(i)
    return out

def perm_unrank(rank, subset):
    assert 0 <= rank < math.factorial(len(subset))
    pool, out = list(subset), []
    while pool:
        i, rank = divmod(rank, math.factorial(len(pool)-1))
        out.append(pool.pop(i))
    assert rank == 0
    return out

def pack(values, width):
    x = 0
    for v in values:
        assert 0 <= v < 1 << width
        x = (x << width) | v
    assert len(values)*width % 8 == 0
    return x.to_bytes(len(values)*width//8, 'big')

def unpack(data, width):
    assert len(data)*8 % width == 0
    x = int.from_bytes(data, 'big')
    return [(x >> shift) & ((1 << width)-1) for shift in range(len(data)*8-width,-1,-width)]

def factor(rows):
    a = [subset_rank(sorted(row), N) for row in rows]
    b = [perm_rank(row) for row in rows]
    a_bytes, b_bytes = pack(a, WIDTH), pack(b, 16)
    restored = [perm_unrank(p, subset_unrank(s,N,K)) for s,p in zip(unpack(a_bytes,WIDTH),unpack(b_bytes,16))]
    assert restored == rows
    return a, b, a_bytes, b_bytes

def desc(data):
    try:
        data.decode('utf-8', errors='strict')
        utf8 = True
    except UnicodeDecodeError:
        utf8 = False
    return {'bytes':len(data),'hex':data.hex(),'sha256':hashlib.sha256(data).hexdigest(),'sha512':hashlib.sha512(data).hexdigest(),'literal_p56':data==TARGET,'sha512_p56':hashlib.sha512(data).digest()==TARGET,'printable_ascii':sum(32<=x<=126 for x in data),'strict_utf8':utf8}

def main():
    path = Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]/'resources/liber-primus/lp2-grid-256.json'
    grid=json.loads(path.read_text(encoding='utf8'))
    tokens=[t for p in grid['pages'] for t in p['tokens']]
    assert len(tokens)==256
    # Exhaustively verify rank order and inverse on independent small domains.
    for n in range(1,10):
        for k in range(n+1):
            for i,s in enumerate(itertools.combinations(range(n),k)):
                assert subset_rank(s,n)==i and subset_unrank(i,n,k)==list(s)
    for k in range(1,8):
        for i,p in enumerate(itertools.permutations(range(k))):
            assert perm_rank(p)==i and perm_unrank(i,list(range(k)))==list(p)
    rng=random.Random(3301)
    # Planted factor lanes: exact independently selected ranks, including extrema.
    a0=[0, math.comb(N,K)-1]+[rng.randrange(math.comb(N,K)) for _ in range(30)]
    b0=[0, math.factorial(K)-1]+[rng.randrange(math.factorial(K)) for _ in range(30)]
    planted=[perm_unrank(p,subset_unrank(s,N,K)) for s,p in zip(a0,b0)]
    a,b,ab,bb=factor(planted)
    assert a==a0 and b==b0
    assert hashlib.sha512(b'abc').hexdigest()=='ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
    target_words=unpack(TARGET,16)
    out={'subset_space':math.comb(N,K),'subset_width':WIDTH,'permutation_space':math.factorial(K),'p56_invalid_perm_word_positions':[i for i,x in enumerate(target_words) if x>=math.factorial(K)],'p56_target':TARGET.hex(),'control':'all small combinations n<=9; all permutations k<=7; 32 independently planted full-width rows; SHA512 abc KAT','radices':{}}
    for radix in (60,59):
        alphabet=ALPHABET if radix==60 else ALPHABET.replace('f','')
        vals=[radix*alphabet.index(t[0])+alphabet.index(t[1]) for t in tokens]
        assert all(0<=v<256 for v in vals)
        rows=[vals[i:i+8] for i in range(0,256,8)]
        assert all(len(set(r))==8 for r in rows)
        a,b,ab,bb=factor(rows)
        out['radices'][str(radix)]={'source_byte_sha256':hashlib.sha256(bytes(vals)).hexdigest(),'roundtrip_cells':256,'subset_ranks':a,'permutation_ranks':b,'subset':desc(ab),'permutation':desc(bb),'concatenation':desc(ab+bb),'permutation_is_sha512_subset':bb==hashlib.sha512(ab).digest()}
    print(json.dumps(out,indent=2))

if __name__=='__main__':
    main()
