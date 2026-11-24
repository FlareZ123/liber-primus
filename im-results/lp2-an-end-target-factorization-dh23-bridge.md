# AN-END target factorization and DH23 reconstruction

**Status:** strong, reproducible cross-page arithmetic relation; not yet a recovered page, plaintext, or identified hash algorithm.

## Exact target and factorization

The solved p56 AN-END page prints this 128-hex-character integer:

```
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

Its integer value is 510 bits. SymPy `factorint` returns the exact factorization

[
H=2^2\cdot3\cdot7\cdot281\cdot2{,}155{,}279{,}523\cdot P,
]

where the remaining 465-bit factor is

[
P=55812325423949613300755009981997267441449219998640920324797192527488468767743421540113477457407900522923390269433267875411539939719636763371.
]

The product of the displayed factors equals the printed integer exactly. SymPy reports every factor prime (the large factor is a strong probable-prime result, not a separately supplied formal primality certificate).

Set (C=2^2\cdot3\cdot7=84). The p28 DH source reconstruction selects modulus (p=23). Reducing the factors modulo 23 gives:

| Factor-derived quantity | Modulo 23 | p28 DH field |
|---|---:|---|
| (281) | (5) | (g) |
| (C=84) | (15) | (b) |
| (2{,}155{,}279{,}523) | (8) | (A) |
| (P) | (9) | (bB=15\cdot19\bmod23) |
| (P C^{-1}) | (19) | (B) |
| (C\cdot281) | (6) | (a) |
| (C\cdot281\cdot2{,}155{,}279{,}523) | (2) | (K) |

Thus the factorization reconstructs the p28 exchange:

[
(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2).
]

The defining equations independently check:

[
5^6\bmod23=8,qquad 5^{15}\bmod23=19,
]
[
8^{15}\bmod23=19^6\bmod23=2.
]

Equivalently, the large factor is a masked second public value:
[
P\equiv C B\equiv84\cdot19\equiv9\pmod{23},
quad
B\equiv P C^{-1}\equiv19\pmod{23}.
]

This is not the earlier speculative group (p=2{,}155{,}279{,}523,g=281), and the 2012 phone number is not used as (A). The source-selected modulus is 23; the 32-bit prime factor is a residue lift of (A=8).

## Why this relation is worth pursuing

The p28 page contains the literal DH marker and its source-derived DH23 reconstruction is independently supported by the historical 2013 signed TCP-server material. See:

- [p28 DH23 line-family audit](lp2-p28-dh23-line-family-audit.md)
- [full DH-state source register and caveats](lp2-dh-state-full-source-register.md)
- [2013 signed TCP-server source](../resources/external/2013-tcp-server-signed-source.md)

The cofactor (C=84) also equals the p56 solved page's 84 consuming shifts. Its small factors (2^2) and (3) match the p28 register's (q=4) and (e=3); the remaining 7 is the register's derived (t=7), so that last correspondence is not an independent source instruction. The 281 factor also satisfies (281=256+25), aligning numerically with the 256-cell p50 table and a 5×5 square; the 32-bit factor matches the table's 32-row dimension. These size/geometry correspondences are secondary observations, not needed to establish the modular DH match and not independently proof of authorial intent.

The cleanest interpretation is that the AN-END integer has a deliberately structured factorization whose residues encode the DH23 state, with (P) carrying (bB). This is a **candidate multiplicative/state encoding**, not evidence that the page uses a particular standard hash. The p56 text does not specify SHA-512 or any other algorithm.

## Reproduction

Run:

```bash
python sims/lp2_an_end_target_factorization_dh23_bridge.py
```

The script factors the exact printed integer, checks the product and prime factors, computes all residues and inverses, and verifies the DH equations.

## What this does and does not establish

**Established arithmetic:** the factorization and every displayed modular equality are exact and reproducible. The mapping reproduces the independently reconstructed p28 DH23 tuple without a free key search.

**Not established:** the hash algorithm, why the page hash was constructed this way, the page/preimage referred to by p56, or a unique original-LP2 ciphertext receiver. No unknown LP2 plaintext has been recovered. Existing p50 DH23 and p6/p7 DH-state receiver investigations are extensive; do not repeat their already-tested direct, affine, cube, or fixed-root consumers merely because this relation exists.

**Next decisive question:** does the factorization select a historically/source-authenticated receiver or external page that consumes this exact DH23 state? Require a unique receiver or independently verifiable page/hash result. Until then, retain this as a strong intermediate cross-page relation, not a complete solution.
