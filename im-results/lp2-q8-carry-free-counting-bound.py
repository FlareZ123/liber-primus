"""Finite union bound under IID uniform ciphertext at the fixed p54 lengths.
No original glyph values, no plaintext score, no independence between keys assumed.
"""
import math
from fractions import Fraction
from collections import Counter

length_counts={1:1,2:6,3:12,4:7,5:9,6:4,7:1,8:5,10:2}
dictionary_counts={1:25,2:188,3:776,4:2303,5:4169,6:5926,7:6573,8:6036,10:3479}
N,Q=29,8
# pi(0)=0; quotient by scaling and rotating the primitive phase vector.
A=math.factorial(28)*(29**8-29**4)//(28*8)
assert sum(length_counts.values())==47
assert sum(n*c for n,c in length_counts.items())==213
p=[min(Fraction(1),Fraction(Q*dictionary_counts[n],N**n)) for n,c in length_counts.items() for _ in range(c)]
e=[Fraction(1)]+[Fraction(0)]*len(p)
for x in p:
    for j in range(len(p),0,-1):
        e[j]+=e[j-1]*x
for B in (0,3,11,12,13):
    u=min(Fraction(1),A*e[len(p)-B])
    print(B,math.log10(u.numerator)-math.log10(u.denominator),float(u))
