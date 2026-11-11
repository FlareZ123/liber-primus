# LP2 grid residual: exact degree-119 conjugate factors in the marked GF(29²) field

**11 November 2026 · Agent 35 · exact finite-field factorization with source-basis direct-readout negatives. No unknown LP2 plaintext, key, cipher, or intended route recovered.** [Reproducer](../sims/lp2_grid_q238_gf841_split_sft.cjs).

## Source-selected algebra and result

The original p49–51 32×8 base-60 table is exactly 256 bytes (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). Read its bytes in original forward row-major order as decreasing polynomial coefficients modulo29. Its leading 203 vanishes; the degree-254 polynomial has the previously established full factorization

```
P(X) = 28 (X+5)^2
       (X²+18X+11)
       (X³+14X²+16X+24)
       (X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11)
       Q238(X)    over GF(29).
```

The last factor `Q238` is monic, irreducible of degree238 over GF29, as separately certified in [the complete factorization](lp2-grid-complete-gf29-factorization.md). Independently, physical p3's three-rune red inscription fixes a concrete field presentation `K=GF29[u]/(u²−3u−8)` of GF841. Over `K`, **Q238 factors as F119(X) × F119^(29)(X)**, with two monic irreducible conjugate factors each of degree119. The coefficient Frobenius is `a+bu ↦ (a+3b)−bu`. The complete product equals the original 239 coefficients of Q238 **exactly**, without any secret key, index fitting, candidate plaintext, or statistical scoring.

This factorization is **mathematically forced by the degree**: every irreducible F29 polynomial of even degree 238 splits into `gcd(238,2)=2` equal-degree irreducibles over GF(29²). Its existence therefore supplies **no independent evidence of authorial design** beyond the original degree238 observation. It supplies a unique unordered pair of exact source-derived 119-coordinate objects. The coincidence with the local **119-rune offsets of the two original red triads** is likewise a known retrospective alignment, not a cipher rule.

To compute the pair without guessing a field embedding, the CommonJS reproducer removes the four *already established* small factors; over K it uses the deterministic Cantor–Zassenhaus auxiliary `X+(2+u)` and exponent `(841^119−1)/2` to split the residual. The auxiliary value is merely a deterministic algorithm seed and **cannot be presented as a historical key**. The script asserts the full Frobenius-norm reconstruction, the degree119/119 result, and the immutable source-byte hash. No extra NPM dependencies.

The first twelve of the factor's 120 coefficients in the `a+29b` integer encoding (ascending polynomial degree, constant coefficient first) are:

```
[11,463,506,493,731,492,162,503,102,171,647,452]
```

This is an algorithmically chosen member of the conjugate pair. The other member is its coefficient Frobenius conjugate; the authentic manuscript does not select one orientation.

## Source-constrained plaintext readout test

Each monic degree119 factor has 119 nonleading coefficients, each with two original-field coordinates `(a,b)`; these yield 238 direct GP29 symbols per factor, before unknown further encryption. The screen is intentionally finite, restricted to the marked p3 basis `(1,u)`, the 2013 BASE29-derived quadratic root basis `(1,z)` with `z=23−2u`, and the independently published 2014 7×7/1033 eigenbasis `(1,mu)` with `mu=14+2u`.

**Index of coincidence, 119 symbols per lane and 238 per combined readout:**

| Basis | F: lane a | F: lane b | F combined | Conjugate combined |
| --- | ---: | ---: | ---: | ---: |
| p3 `u` | 0.03503774 | 0.03788634 | 0.03705280 | 0.03630819 |
| 2013 `z` | 0.03290130 | 0.03788634 | 0.03637911 | 0.03538631 |
| 2014 `mu` | 0.03318616 | 0.03788634 | 0.03410985 | 0.03428713 |

The source-derived six combined readouts lie near the independent uniform-GP29 baseline `1/29≈0.03448276`, and neither coordinate lane exhibits the repeated-symbol concentration ordinarily expected from native GP-English. This is a **negative for simple direct coordinate-as-plaintext extraction** under these three independently available field bases. It cannot exclude encryption applied to F119, a non-GP register, a different source-specified basis, a distinct segment order, or the possibility that Q238 itself is just a random-looking byproduct of table construction.

The full original table **cannot** be a GF841 polynomial norm: its irreducible *cubic* factor has odd multiplicity. This independent exact obstruction is already proved in [the complete factorization report](lp2-grid-complete-gf29-factorization.md). The norm split applies **only to Q238**, not the total 256-byte polynomial.

## Consequence and stopping rule

The **new reproducible object** is the exact unordered F119/conjugate pair; its direct coordinate readouts do not decrypt unknown LP2. The 119 pairing may be worth revisiting if an original illustration, punctuation sequence, or historical instruction independently selects one conjugate, an ordering of its coefficients and a reversible decoding operation. In the absence of such a rule, scanning arbitrary change-of-basis matrices, offsets, and language scorers would reopen the same unconstrained key search under another name.

Reproduction: run the [single CommonJS file](../sims/lp2_grid_q238_gf841_split_sft.cjs) against the canonical repository table. It explicitly checks the hash, original small-factor divisions, 119/119 split, exact coefficient product, and all six reported coordinate statistics.
