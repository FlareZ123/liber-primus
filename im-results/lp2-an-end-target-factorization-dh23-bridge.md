# AN-END target factorization and DH23 reconstruction

**Status:** exact cross-page arithmetic under a retrospective extraction grammar; no recovered page, plaintext, or identified hash algorithm.

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

Deliberate multiplicative/state encoding is a candidate, but the grouped factors, role assignments and arithmetic were selected retrospectively. The conditional null below constrains its evidential strength. The p56 text does not specify a hash algorithm.

## Reproduction

Run:

```bash
python sims/lp2_an_end_target_factorization_dh23_bridge.py
```

The script factors the exact printed integer, checks the product and prime factors, computes all residues and inverses, and verifies the DH equations.

## What this does and does not establish

**Established arithmetic:** the factorization and every displayed modular equality are exact and reproducible. The displayed mapping reproduces the prior p28 DH23 tuple; grouping, roles and operations were retrospective.

**Not established:** the hash algorithm, why the page hash was constructed this way, the page/preimage referred to by p56, or a unique original-LP2 ciphertext receiver. No unknown LP2 plaintext has been recovered. Existing p50 DH23 and p6/p7 DH-state receiver investigations are extensive; do not repeat their already-tested direct, affine, cube, or fixed-root consumers merely because this relation exists.

**Decision:** the bounded review below found no full-factor receiver. Preserve the exact arithmetic and physical small-factor extraction; a new independent selector is required.


## Conditional null and printed-row selector

**Agent8, 24 November 2026, #2492.** The historical DH tuple and modulus 23 preceded the factor interpretation; the signed 2013 worked example neither selects factoring nor establishes an LP2 key. The exact factorization was previously known. The equations a=bg and K=aA are dependent on the matched fields.

### Factor-profile calibration

Condition on a 510-bit integer with small factors 2,2,3,7 and three larger factors of bit sizes 9,32,465. With C=84 fixed, b=15 follows; fixed roles require the three other residues 5,8,9, not six independent successes. Enumerate all 22^3 nonzero residue triples; role freedom permutes three factors, grouping freedom distributes all seven labeled factors into four nonempty groups (8,400 assignments before deduplication). Operation freedom admits a fourth residue representing B directly or a one-operation arithmetic relation to b (multiplication, division, addition or subtraction): {4,9,11,12,19}. This is a finite retrospective grammar, not the full look-elsewhere domain.

For each 9-bit prime x, the exact 510-bit condition restricts normalized larger factor mantissas to a product below T=32768/(84x); under continuous uniform approximation the allowed area is T ln T - T +1 for T>1. Only 23 of 43 9-bit primes are possible, and residue5 has weighted mass 0.08362056. The large-prime residues are modeled as uniform nonzero modulo23. Exact enumeration under this approximation gives:

| Grammar | Residue triples | Profile-conditioned rate | Matched integer controls /50,000 |
|---|---:|---:|---:|
| Fixed roles, fixed 84, bB | 1 | 0.01728% | 16 |
| Free roles, fixed 84 | 6 | 0.06198% | 37 |
| Free grouping and roles | 18 | 0.15710% | 87 |
| Free roles and five extraction options, fixed 84 | 30 | 0.35665% | 184 |
| Free grouping, roles and five extraction options | 129 | 1.38022% | 699 |

Integer controls use exact 9-bit primes and odd coprime-to-23 large integers, accepting only 510-bit products. Separately, 128 width-conditioned probable-prime controls give 1,1,1,2,3 hits respectively; too small for rare-event calibration. The conditional rates are not global p-values and the factor profile was not predicted in advance. For uniform unconditioned integers, exact small-prime valuations v2=2,v3=1,v7=1 have probability about 1/294; do not multiply this by the conditional rates as if preregistered. All literal bB successes already imply H mod23=18; conditioning on that product residue multiplies the literal rates by22 under the uniform-large-residue model. Modulus23 is prior selected, so no modulus search penalty applies to the exact historical tuple. As a distinct exploratory target, any valid nontrivial DH exchange with the fixed extraction under visible candidate prime moduli 13,23,29,43,59,83 occurs 33/50,000; this is not a second estimate for the specific historical tuple.

### Physical printed rows

The original scan 73.jpg (LP2 p56) contains five actual variable-width hex rows and five scattered dots below the text. Direct visual reading gives:

```
36367763ab73783c7af284446c
59466b4cd653239a311cb7116
d4618dee09a8425893dc7500b
464fdaf1672d7bef5e891c6e227
4568926a49fb4f45132c2a8b4
```

Lengths 26,25,25,27,25 reproduce H exactly. GCD of each row integer with H gives **12,14,1,1,4**; their lcm is **84**, independently extracting the small cofactor without factoring H fully. No larger factor appears. The GCD operation is analyst-selected; no author opcode authenticates it.

Under a matched CRT residue surrogate conditioned on H's small-prime valuations, the final row necessarily carries 4 because radix16 is divisible by4. For an odd prime q dividing H, five uniform row residues satisfy one weighted sum zero; the no-zero probability is ((q-1)^5-(q-1))/q^5. Coverage rates for3 and7 are .87654 and .53769; absence of281 is .98233. The 465-bit factor exceeds every row and 32-bit absence is near certain. Approximate combined rate for this exact small cofactor is **46.30%**. The extraction is exact but weakly distinctive.

Row residues mod23 are [5,19,6,16,0]; the first three happen to be g,B,a in retrospective order. The actual concatenation coefficients are [2,1,12,2,1] mod23. Of all 23^4 residue tuples conditioned on H mod23=18, 23/279841 match that ordered first triple, 138 match any ordering in first three, 1208 contain those three values anywhere, and 19365 (6.92%) contain any three distinct values of the six prior DH fields anywhere. No independent instruction selects the order or interprets 16 and0. Do not multiply these dependent conditional rates.

### Receiver decision

The physical rows offer an exact new route to C but no unique full-factor serialization, state law, or original receiving interval. The original p56 instruction asks for a page hashing to H; the signed 2013 BASE29 and DH commands specify radix conversion and a participant-selected exchange, not this extraction. The five dots and signed 2016 guidance do not fix a larger-factor decoder. Agent12's exact 95-rune p57 known-receiver transplant already failed; no further source-unselected key sweep was undertaken. Retire the bounded branch until a genuinely independent full-factor selector or prospective original prediction appears. No endpoint probing or guessed retrieval.

Reproduce: [matched-profile SFT](../sims/lp2_an_end_factor_residue_null_sft.cjs), [null output](lp2-an-end-factor-residue-null-output.json), [physical-row SFT](../sims/lp2_an_end_original_hex_row_factor_sft.cjs), [row output](lp2-an-end-original-hex-row-factor-output.json). Exact printed target tested in isolated JavaScript; no Windows CI claimed.
