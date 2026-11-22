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

## Stronger original-source pair-alignment decision (exact, all secret bijections)

Both original red three-rune inscriptions begin after exactly **119** runes on physical pages **p3 and p39**. The untouched preceding 119-rune prefixes furnish a uniquely observable 119×2 GP29 source lane: at each offset `i=0..118`, pair `(p3[i],p39[i])` in the original reading direction. Compare this to the 119 nonleading GF841 coefficient pairs of either factor, whose order can independently be reversed or whose coordinates can be swapped. Any **fixed injective pair substitution**, including an arbitrary unknown affine GL2 map, field multiplication, or nonlinear 841-symbol bijection, preserves the multiset of duplicate multiplicities, even under arbitrary positional reordering. Therefore this is a genuine all-secret invariant.

The two source-rune prefixes contain **99 unique singleton pairs and 10 repeated doublets**, i.e. a duplicate spectrum **`{1:99, 2:10}`** and **109 distinct** pairs. Each independently derived GF841 factor instead contains **96 singleton pairs, 10 doublets, and one triplet**, spectrum **`{1:96, 2:10, 3:1}`**, **107 distinct** pairs. The second factor is a coefficientwise Frobenius conjugate, so its spectrum is necessarily identical. Consequently **no injective stationary mapping whatsoever can turn either 119-factor coefficient lane into the aligned original p3/p39 prefixes in full**, regardless of coefficient traversal direction, factor orientation or secret symbol relabeling. This is an exact equality-pattern obstruction; it is more decisive for this specifically marked layout than an English-frequency score or three fitted anchors.

A further **source-locked linear-state test** uses the same 119 paired runes as `X_i` and the factor coefficients as `F_i`. If the correspondence were a simple field-additive stream cipher, the extracted pad would be `F_i−X_i` over GF841. For a multiplicative stream cipher, the mask would be `F_i/X_i` (all 119 original prefix pairs are nonzero field elements). Full Berlekamp–Massey on both masks under eight natural interpretations (two conjugate factors × ascending/reversed coefficients × p3/p39 channel order) returns **linear complexity 60/119 in all 16 tests**, the generic random-like half-length. An independently constructed degree-two GF841 recurrence yields exact complexity two with the same implementation, establishing detector sensitivity. This rules out a **short GF841 linear-recursive additive or multiplicative pad** under these specific source-selected pair clocks, with no parameter fitting. It does not preclude high-degree recurrence, alternative state clock, nonlinear key, or encrypted non-GP register.

The argument has an important scope limit. There is no independent authentic instruction that says the factors and the two page prefixes are meant to be equivalent symbols, and the test does **not** exclude using those prefixes as a keystream, external index, one-time pad, permutation instruction, or within-position changing cipher. It does close the simplest fully invertible fixed symbol-register interpretation of the unique 119-offset coincidence. The updated SFT asserts the original 119 source offsets, both duplicate spectra and the impossibility for a fixed bijection without fitting any key.

## p36-seeded relative-trace keystream gate (Agent 13, 11 November 2026)

**Question.** Does the p36 page become a source-derived seed for the degree-119 extension over the p3 field, with the canonical relative trace supplying a two-rune additive keystream?

The original 256-byte table gives the irreducible degree-238 residual Q238 over GF29. The p3 red triad [13,23,2] fixes K=GF29[u]/(u²−3u−8)=GF841. Over K, Q238 splits into the exact conjugate factors F119 and F119^(29). This equal-degree split is mathematically forced by the field extension; it is not independent evidence of authorial design.

Physical p36 contains exactly 238 runes. Pairing adjacent runes in reading order as a+29b gives 119 elements of K. For each factor F119, interpret those 119 elements as the coefficient vector of S0 in L=K[X]/F119, with α=X. The candidate mask is the canonical relative trace K_n=Tr(L/K)(S0·αⁿ). The p36 page is reserved as seed positions n=0…118 and is not decrypted; the 4,353 pairs before p36 use n=−4353…−1, and the 2,006 pairs after p36 use n=119…2124.

The finite model tests both conjugate factors, forward/reversed p36 coefficient order, and both additive signs: **8 variants**, with no fitted phase, free basis, or post-selected offset. Each variant exactly re-encrypts the original 12,718-rune stream outside p36 and exactly recovers a 12,718-rune native-GP Shakespeare plant. These round trips validate implementation only; they do not select a historical key.

**Original result: negative.** Raw outside-p36 IoC is 0.03447201; the eight decoded outputs range 0.03444905–0.03456562. Matched 12,718-rune native-GP control windows have IoC ranges 0.05746–0.06228 (Shakespeare), 0.05957–0.06294 (Gibran), and 0.06124–0.06422 (Emerson). With the trigram model trained on Shakespeare, raw ciphertext scores −13.28185 and the eight candidates score −13.38201 to −13.25699; the matched native windows range from −8.40093 to −7.70762. The best candidate remains far below every native-text control and its decoded preview is nonlinguistic.

The p36-as-seed interpretation and additive use of the relative trace are hypotheses, not an authenticated Cicada instruction. This test retires only this exact p36-seeded GF841^119 relative-trace additive construction under the two conjugates, two seed orders, p36-anchored clock and two signs. It does not exclude a distinct nonlinear state, a non-GP intermediate, or an independently recovered external key.

Reproducer: [lp2_p36_gf841_q238_relative_trace_sft.cjs](../sims/lp2_p36_gf841_q238_relative_trace_sft.cjs). A manual job is included in [the GF841 pair-phase workflow](../.github/workflows/lp2-gf841-pair-phase-allsecret-manual.yml); no automatic commit/PR trigger was added.

## Consequence and stopping rule

The **new reproducible objects** are the exact unordered F119/conjugate pair and the bounded p36-seeded relative-trace negative. The latter closes one canonical relative-trace additive stream from p36; it does not turn the degree-119 factors into a key. The 119 pairing may be revisited only if an original illustration, punctuation sequence, or historical instruction independently selects a different reversible state/readout. Do not repeat direct coordinate, p36 relative-trace, or arbitrary change-of-basis/offset sweeps; any successor needs a genuinely new source instruction or independently fixed non-GP/variable-rate register.

Reproduction: run the [single CommonJS file](../sims/lp2_grid_q238_gf841_split_sft.cjs) against the canonical repository table. It explicitly checks the hash, original small-factor divisions, 119/119 split, exact coefficient product, and all six reported coordinate statistics.
