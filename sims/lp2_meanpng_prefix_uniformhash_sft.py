#!/usr/bin/env python3
"""Exact conditional HASH160 null for the pinned fifth-column Bitcoin address."""
from hashlib import sha256

B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
ADDRESS = '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK'
PREFIX = 'Meanpng'
B = 2**32


def num(chars):
    n = 0
    for c in chars:
        n = 58*n + B58.index(c)
    return n


def checksum(hash160):
    digest = sha256(sha256(b'\x00'+hash160.to_bytes(20, 'big')).digest()).digest()
    return int.from_bytes(digest[:4], 'big')


assert ADDRESS.startswith('1'+PREFIX) and len(ADDRESS) == 34
address_n = num(ADDRESS[1:])
assert checksum(address_n >> 32) == address_n % B  # authentic Base58Check
A = num(PREFIX)
count = 0
rows = []
# Exactly one initial '1' means the 20-byte HASH160's first byte is nonzero.
# Then a seven-digit prefix is possible only with 32 or 33 Base58 digits.
for tail in (25, 26):
    lower = max(A*58**tail, 2**184)
    upper = min((A+1)*58**tail-1, 2**192-1)
    first_full = (lower+B-1)//B
    last_full = (upper-(B-1))//B
    interior = max(0, last_full-first_full+1)
    boundary = 0
    for h in {lower//B, upper//B}:
        if first_full <= h <= last_full:
            continue
        if 0 <= h < 2**160 and lower <= h*B+checksum(h) <= upper:
            boundary += 1
    rows.append((tail+8, interior, boundary))
    count += interior + boundary
assert rows == [(33, 28362204090837958306195533214643208, 2),
                (34, 1645007837268601581759340926449306120, 0)]
assert count == 1673370041359439540065536459663949330
# Model: uniformly distributed 160-bit HASH160, fixed seven-character target.
p_exact = count / 2**160
# Conservative bound holds for *any* prelisted seven-character prefix with
# one leading '1'; it permits all N in either fixed-width prefix interval and
# both endpoint checksums without assuming key independence.
p_any_max = (58**25 + 58**26) / 2**192 + 4 / 2**160
assert p_exact <= p_any_max
print('Exact P[prefix 1Meanpng | uniform HASH160] =', format(p_exact, '.17g'))
print('P[any fixed address among 8 columns x 2 radices x 2 encodings]',
      '<=', format(32*p_any_max, '.17g'))
for possible_strings in (1000,100000,1000000):
    print('Predeclared 7-character target list', possible_strings,
          'conditional union bound <=', format(32*possible_strings*p_any_max, '.17g'))
print('Ex-post pattern choice / untested algorithm families not calibrated.')
