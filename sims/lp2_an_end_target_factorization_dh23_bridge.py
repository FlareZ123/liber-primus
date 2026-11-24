#!/usr/bin/env python3
"""Reproduce the AN-END target factorization and its DH23 residue encoding.

Requires SymPy. The large factor is reported prime by SymPy's strong
probable-prime test; this script does not provide a formal primality certificate.
"""
from math import prod
from sympy import factorint, isprime, primerange

H_HEX = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
P_DEC = "55812325423949613300755009981997267441449219998640920324797192527488468767743421540113477457407900522923390269433267875411539939719636763371"
H = int(H_HEX, 16)
P = int(P_DEC)

expected = {
    2: 2,
    3: 1,
    7: 1,
    281: 1,
    2_155_279_523: 1,
    P: 1,
}
actual = factorint(H)
assert actual == expected, (actual, expected)
assert prod(int(p) ** int(e) for p, e in actual.items()) == H
assert all(isprime(int(p)) for p in actual)
assert H.bit_length() == 510
assert P.bit_length() == 465
assert 2_155_279_523.bit_length() == 32

p = 23
C = 2**2 * 3 * 7
g = 281 % p
b = C % p
A = 2_155_279_523 % p
P_mod = P % p
B = (P_mod * pow(C, -1, p)) % p
a = (C * 281) % p
K = (C * 281 * 2_155_279_523) % p

assert (g, a, b, A, B, K) == (5, 6, 15, 8, 19, 2)
assert P_mod == (b * B) % p == 9
assert pow(g, a, p) == A
assert pow(g, b, p) == B
assert pow(A, b, p) == K
assert pow(B, a, p) == K
assert C == 84

prime_list = list(primerange(1, 282))
assert len(prime_list) == 60 and prime_list[-1] == 281
assert 281 == 256 + 25

print(f"H bits: {H.bit_length()}")
print("factorization:", " * ".join(
    (f"{prime}^{exponent}" if exponent != 1 else str(prime))
    for prime, exponent in actual.items()
))
print(f"C=2^2*3*7={C}; residues mod 23:")
print(f"g={g}, a={a}, b={b}, A={A}, B={B}, K={K}")
print(f"P mod 23={P_mod}; P/C mod 23={B}")
print("DH checks: g^a=A, g^b=B, A^b=B^a=K")
print("secondary alignment: 281 is prime #60 and 256+25")
