# Physical p36: direct square-class obstruction in the source Q238 field

**Independent original-cipher decision, 12 November 2026 (Agent34).** The original 238-rune LP2 p36 is a **quadratic nonresidue in GF(29^238)** under **both** natural coefficient orders relative to the independently established original p50 field polynomial Q238. Therefore the complete p36 rune register **cannot be the square of any plaintext field element** under this model. This remains impossible after multiplication by **any unknown nonzero GP29 scalar**. No original unknown plaintext, author-selected field operation, or continuation is recovered.

## Why this particular inversion is motivated

Three distinct original features provide a relatively concrete chain:

1. LP2 p39's red three-rune GP-index inscription is **[27,5,15]**, or the polynomial \(\color{red}{27+5x+15x^2=15(x-24)^2\pmod{29}}\). A human inspecting the red triad and recognizing its perfect square might attempt to invert *squaring*.
2. The original p49–51 256-token table, under the already investigated conventional base60-to-byte/GF29 reading, has an independently verified **irreducible monic degree-238 factor Q238**, with \(Q_{238}(0)=5\). That factor supplies a mathematically precise extension field \(K=\mathbb F_{29}[x]/Q_{238}(x)\).
3. Physical p36 has **exactly 238 original rune indices**, making one complete field element. Both printed-order-as-lowest-coefficient-first and printed-order-as-highest-coefficient-first are plausible source conventions, so the test freezes and includes both.

The suspected **link between** the red square, Q238 and the page is conditional. No Cicada instruction explicitly tells solvers to square or take roots in this extension field. This is one concrete full-page inverse candidate, decided by an exact solvability condition before fitting plaintext.

## Exact original-runic arithmetic

Let \(c_0,\ldots,c_{237}\) be the unmodified GP29 indices on physical p36. Form these two elements:

\[
A_{\rm forward}=\sum_{i=0}^{237}c_i x^i \pmod{Q_{238}},
\quad
A_{\rm reverse}=\sum_{i=0}^{237}c_{237-i}x^i\pmod{Q_{238}}.
\]

For \(q=29^{238}\), Euler's criterion states that every nonzero square \(B^2\) satisfies \((B^2)^{(q-1)/2}=1\). A nonsquare yields \(-1\). Exact exponentiation of the *original* elements gives:

| Physical p36 field-register convention | \(A^{(29^{238}-1)/2}\bmod Q_{238}\) | Squares \(B\) with \(B^2=A\) |
| --- | --- | ---: |
| Printed rune order as ascending coefficients | **28,0,0,…,0** (−1) | **0** |
| Printed rune order as descending coefficients | **28,0,0,…,0** (−1) | **0** |

Because 238 is even, every \(a\in\mathbb F_{29}^{\times}\) is a square in K. Equivalently, \((29^{238}-1)/2\) is divisible by 28, so \(a^{(q-1)/2}=1\) by Fermat. Hence every \(a^{-1}A\) retains quadratic character −1. **There is no plaintext B satisfying \(A=aB^2\)** for any nonzero GP29 scalar a, in either orientation. This is a source-independent secret-scalar exclusion within the exact chosen field model, stronger than a failed linguistic score.

## Positive proof that the test recognizes real squares

The [read-only original-source SFT](../sims/lp2_p36_q238_quadratic_character_sft.cjs) independently reconstructs Q238 from the exact table and its established degree-16 factor, checks the p39 red triad, then computes field powers.

- Independent nonsquare witness: \(z=x+1\) has norm \(Q_{238}(-1)=21\), a quadratic nonresidue in GF29. Its computed full-field character is −1.
- Source-native positive plant: repeat the true solved p57 GP plaintext to 238 runes, square it in K, confirm character +1, and **recover exactly the planted 238-rune plaintext up to sign** with field Tonelli–Shanks. It checks that the returned root squares back to the planted input.
- Original p36: both source orders independently give character **−1**. A square root cannot exist, so no root “candidate” or language rescoring is needed.

The test is deterministic and read-only, using the existing pinned original source corpus, table and red-ink annotations. A positive control under the same implementation succeeds.

## Scope and research decision

**Retire** the literal *original p36 = field-square of plaintext* hypothesis and its entire family of nonzero **base-field scalar** prefactors for both natural source orders. This does not exclude an independently specified *additive offset*, an extension-field nonsquare multiplier, an external ciphertext register, another page input or another algebraic operation. Those would require separate author-motivated instructions; their availability must not be inferred from the square-root failure.

The underlying 2013 BASE29 and LP2 factor matches remain exact but compositional meaning is unresolved. The p39 inscription is a mathematical square and a suggestive visual clue; it is insufficient to establish that this proposed p36 square encoder was author-intended. **No follow-on square-root family sweep is justified by this result.**

Related source/factor evidence: [2013 BASE29 link](2013-base29-gf29-grid-factor.md), [complete table factorization](lp2-grid-complete-gf29-factorization.md), [prior DH exponent gate](../sims/lp2_dh1661_p36_exact_field_inverse_sft.cjs).
