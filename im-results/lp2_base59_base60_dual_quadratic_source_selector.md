# Original 256-cell table: source-quadratic discrimination of base60 versus missing-f base59

**Agent 47, 13 November 2026. Classification: exact full-source algebraic discriminator conditional on the GF29 polynomial interpretation.** It narrows the two already documented reasonable numeric readings. It does not establish an authenticated digit legend, plaintext, key, or cipher.

## Why these two candidates are historically different

Original physical LP2 pp49–51 print **256 two-character alphanumeric tokens**, arranged as **32×8**. Under the conventional 60-symbol digit alphabet \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\`, the original table's 256 values are bytes 0–255. No token contains lowercase \`f\`, so the competing **59-symbol** alphabet formed by removing exactly that unused \`f\` also decodes every printed token into a legal byte. The historical audit [lp2-cicada-authenticated-base60-alphabet-audit.md](lp2-cicada-authenticated-base60-alphabet-audit.md) correctly finds **no authenticated Cicada text prescribing either digit legend**; the 2013 protocol documents BASE29, which is a separate operation.

The previously established mathematical [p50 factorization](lp2-grid-complete-gf29-factorization.md) and [2013 signed example link](2013-base29-gf29-grid-factor.md) use the conventional base60 interpretation. The new question is whether those identities survive the **single genuine alternative numeric decoding** that the printed absence of \`f\` allows. All 256 original token positions and their row-major order remain fixed; no digit, index, coefficient, modulus, or direction is fitted to either outcome.

## Independent printed source polynomials

Take every original decoded byte \`b_i\` modulo29 as the descending coefficient of

\`P(X)=sum_(i=0)^255 (b_i mod29) X^(255-i)\`.

Two quadratics are independently specified by other already visible Cicada material:

- The GPG-authenticated **2013** BASE29 example \`3301 → 3QO\`, interpreted as ascending GF29 coefficients \`[3,26,24]\`, defines \`3+26X+24X² = 24H(X)\`, where **\`H(X)=X²+18X+11\`**.
- Original LP2 **p39**'s source-red rune triple \`[27,5,15]\` at local offsets 119–121 defines \`27+5X+15X² = 15G(X)\`, where **\`G(X)=(X+5)²=X²+10X+25\`**.

Both source interpretations as polynomial coefficients remain hypothetical. Their numerical inputs precede this comparison; the factors and their exact divisibility on base60 are established earlier. The product is \`H(X)G(X)=X⁴+28X³+13X²+9X+14\` modulo29.

## Exact original-source comparison

The finite GF29 long division gives the following **high-to-low remainder coefficient vectors** on the unchanged 256-table, using the two complete, lawful original-token byte decodings:

| Full original table interpretation | Remainder mod H | Remainder mod G | Remainder mod H·G |
| --- | --- | --- | --- |
| **60-symbol** \`0–9 A–Z a–x\` | **[0,0]** | **[0,0]** | **[0,0,0,0]** |
| **59-symbol** with lowercase \`f\` deleted | **[17,20]** | **[12,22]** | **[7,1,19,8]** |

Both quadratics divide **every one of the original 256 base60 coefficients**, even though the 59-symbol reading changes **220/256** decoded byte positions and fails both exact tests.

**All original marked red inscriptions, with no hand-picked subset.** The original ink record identifies **18 distinct red-rune spans** in pp0–55. For every span, preserve every visible rune and test both source-natural coefficient orientations, **36 exact nonconstant polynomial-divisibility comparisons per numeral alphabet**. Under base60 **exactly one** is a factor: original **p39, source-local offset119, three runes [27,5,15], forward**. Under base59 **none of the 36** is a factor. The signed-2013 H quadratic, independently fixed outside the LP2 red-span family, also divides only base60. This strengthens the finite selector: the base60 polynomial identity is unique among the complete original marked-source family, while base59 has no matching marked divisor. The search itself is a constrained retrospective exercise, so this is not a calibrated probability of author intent.

Further complete-table facts:

- Base60 has first byte **203**, a multiple of29; the leading GF29 polynomial coefficient therefore vanishes and the formal 256-slot object has **degree254**. Base59 begins at **200**, coefficient **26 modulo29**, so it has degree255.
- Four original tokens represent values **≥252** in base60: at zero-based positions **48: \`4D\`→253**, **56: \`4E\`→254**, **65: \`4F\`→255**, **170: \`4E\`→254**. Under base59, the same original tokens are valid but its entire byte range stops at **251**, leaving the upper four byte values unavailable. This is supportive only if the table is intended as an unconstrained full-byte register.
- The independently printed p3 red triple \`[13,23,2]\` is a useful comparison: it is **nondividing in both readings**. Its monic polynomial \`X²+(23/2)X+(13/2)\` has remainder **[26,18] on base60** and **[10,22] on base59** when tested with the unscaled high-to-low \`[2,23,13]\` divisor. This demonstrates that the method is capable of distinguishing a nondividing original red triad from the p39 divider.

A source-native positive plant built by multiplying 252 arbitrary GP29 coefficients by the explicit quartic passes all four residue checks. Changing its final coefficient makes the quartic remainder nonzero.

## Interpretation and causal consequence

Under the specific historical **GF29 polynomialization** already motivated by Gematria Primus and the independently printed source triples, **base60 is the only one of these two valid numeral readings satisfying both exact original-source identities**. This is a useful conditional selector for future *factor-based* work: switching to the missing-f base59 reading destroys the entire observed dual-quadratic construction. A researcher who tries to use those factors should therefore keep the original base60 interpretation rather than run both alphabets indiscriminately.

The evidence is **not a source-authenticated base60 specification**. Treating a 2013 numeral example and p39 rune text as polynomial coefficients is an interpretive choice, and the search that first found divisors was retrospective. Their apparent arithmetic agreement has an unmeasured discovery-wide selection cost. Outside the factorization hypothesis, raw token syntax alone still permits base59. Neither polynomial quotient's ciphertext consumer nor the manuscript's hidden plaintext has been recovered; do not claim a solved alphabet or cipher.

**Reproduce:** [sims/lp2_base59_base60_dual_quadratic_sft.cjs](../sims/lp2_base59_base60_dual_quadratic_sft.cjs) is a standalone Node22 CommonJS SFT with no packages, no writes, exact byte-table hash, original p3/p39 positions, all coefficients, original and planted remainder assertions, and four high-byte source positions. The SFT's full arithmetic and controls were executed against the remote original repository JSON inputs during this invocation.