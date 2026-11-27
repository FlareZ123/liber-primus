"""Exact global histogram-fiber repeat tail and side-information capacity.

No cipher fitting. Run from repository root with Python 3.
"""
from collections import Counter
from fractions import Fraction
from itertools import permutations
from math import comb, factorial, log2
from pathlib import Path
import json

def counts(h, r):
    n = sum(h)
    poly = [1]
    den = 1
    for m in h:
        den *= factorial(m)
        f = [comb(m-1,k)*factorial(m)//factorial(m-k) for k in range(m)]
        q = [0]*(len(poly)+len(f)-1)
        for k,b in enumerate(f):
            for i,a in enumerate(poly):
                q[i+k] += a*b
        poly = q
    total = factorial(n)//den
    fact = factorial(n)
    num = total
    for k,v in enumerate(poly):
        if k:
            fact //= n-k+1
        if k <= r:
            continue
        b,rem = divmod(v*fact,den)
        assert rem == 0
        num += (-1)**(k+r)*comb(k-1,r)*b
    assert 0 <= num <= total
    return num,total

def repeats(t):
    return sum(a==b for a,b in zip(t,t[1:]))

def ceil_log2_ratio(a,b):
    assert a>0 and b>0
    m=(a+b-1)//b
    return (m-1).bit_length()

def main():
    for h in ([2,2,1],[3,1],[3,2,2]):
        words=set(permutations(x for x,m in enumerate(h) for _ in range(m)))
        for r in range(sum(h)):
            assert counts(h,r)==(sum(repeats(w)<=r for w in words),len(words))
    data=json.loads(Path("resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    tape=[i for page in data["pages"] if 40<=page["page"]<=53 for i in page["indices"]]
    h=[Counter(tape)[i] for i in range(29)]
    r=repeats(tape)
    assert len(tape)==3008 and r==18
    num,total=counts(h,r)
    print(json.dumps({"n":len(tape),"histogram":h,"repeats":r,
        "probability":float(Fraction(num,total)),
        "surprise_bits":log2(total)-log2(num),
        "fixed_bits_half_coverage":ceil_log2_ratio(total,2*num),
        "fixed_bits_full_coverage":ceil_log2_ratio(total,num)}))

if __name__=="__main__":
    main()
