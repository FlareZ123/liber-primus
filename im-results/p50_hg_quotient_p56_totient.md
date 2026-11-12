# Direct 252-slot p50 H/G quotient under the solved p56 prime-totient inverse

**Agent 49, 12 November 2026. Status: frozen complete source-derived decoder tested; no unknown plaintext recovered.** This is one actual original-input decipherment proposal with exact GP29 arithmetic and a source-native positive control. It cannot establish that the creator intended the relation between these otherwise separate clues.

## Causal plaintext hypothesis

The authenticated 2013 `BASE29 3301 → 3QO` example yields a monic quadratic `H(X)=X²+18X+11` over GF(29). The p39 three-rune red source inscription yields the independently established second factor `G(X)=(X+5)²`, with the p39 scalar already handled by existing work. Both divide the *printed* original LP2 32×8 base-60 table polynomial, independently established in [the full original factorization](lp2-grid-complete-gf29-factorization.md). The 2013 code relation is a mathematical observation; source authorization of a cipher transfer remains absent.

A direct human-solvable continuation is to divide the original 256-cell GF29 polynomial by the two quadratics, interpret the resulting **252 GF29 coefficient slots** as a hidden GP text, and apply the **actual p56 solved-page totient-prime cipher** to recover its plaintext. This would be a useful discovery because it would identify a complete rule without searching a secret or guessing a phrase.

Under the original printed ordering, let `P(X)=sum(B_i mod29)*X^(255-i)`, where `B_i` are the source's base-60 bytes. The monic quartic divisor is

`H(X)*G(X) = X⁴ + 28X³ + 13X² + 9X + 14`.

Divide exactly in GF29. Its remainder is `[0,0,0,0]`. The quotient has 252 coefficient *slots* (one leading formal zero, as already established in the code-structure report). The only two directly defined coefficient readings are printed-descending and polynomial-ascending. For either, fix the source-solved p56 operation

`plain_i = (coefficient_i - (prime_(i+1)-1)) mod29`

with first prime `2`, physical start phase zero, no key fitting and no F-specific interruption because the quotient has no p56-identified interrupt location. The exact p56 red source prefix `AE J OE S R` decodes under these same first five key values `1,2,4,6,10` to **ANEND** before the unknown material is examined.

## Original-source outcomes

| Coefficient order | GP29 positions | Quotient IoC | Decoded IoC | Decoded first transliteration |
|---|---:|---:|---:|---|
| Printed descending | 252 | 0.0363308670 | **0.0346550307** | `EAYBJXIAEATHLEMDMAEEYYECXISNEOMJOE...` |
| Ascending | 252 | 0.0363308670 | **0.0336115854** | `PBNGEAEAJHAEDJTRHEOMNGCDRAELAEINYPH...` |

The outputs remain random-looking GP29 symbol sequences, with IoCs close to `1/29`; neither is coherent native-GP English. The arithmetic is fully reversible: reapplying the same prime-totient shifts reproduces all **252/252** original quotient positions for each direction. A separate 252-rune plant built from known clear solved p57 GP text encodes and decodes **252/252** under the same rule. These are correctness controls, rather than evidence of the unknown plaintext. The earlier source-derived 252-slot quotient itself still exists and may have a different role.

## Decision and reproduction

**Retire this literal H/G-division-then-p56-totient decoder.** The strongest missing premise is an original direction to consume the GF29 polynomial quotient as text and carry the solved p56 cipher into this table. Repeating the operation at arbitrary phase offsets, switching signs or adding secret substitutions to rescue accidental English-looking substrings would lose the source-selected advantage.

[Standalone CommonJS original-input SFT](../sims/p50_hg_quotient_p56_totient_sft.cjs) reads the fixed 256 table bytes and GP corpus, reconstructs both quadratics, checks exact factor divisibility, verifies the historical p56 prefix, runs both coefficient orders, proves original-source re-encoding and runs a source-native positive plant. The exact checked script was also executed against the repository's current original-input JSON with the expected outputs.
