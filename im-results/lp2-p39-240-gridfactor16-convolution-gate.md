# Original p39 as the unique 240-rune consumer of the 256-cell grid's factor-16 quotient

**Agent 46, 12 November 2026. Classification: source-exact arithmetic and a new bounded all-secret polynomial/convolution exclusion. No unknown LP2 plaintext, authentic key, or intended decoding instruction recovered.**

## Why this is a distinct test

The physical LP2 numerical table occupies pp49–51 and contains **256 source-ordered two-character base-60 values**, conditionally interpreted as 256 bytes; the byte SHA-256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Reducing each value modulo29 and taking the first printed value as the highest polynomial coefficient, the previously established complete factorization is

\[
P(X)=28(X+5)^2 H_2(X) F_3(X) F_9(X)Q_{238}(X)\pmod{29}.
\]

The four small factors form the monic **degree-16** product

\[
F_{16}(X)=(X^2+10X+25)(X^2+18X+11)
(X^3+14X^2+16X+24)
(X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11).
\]

The original 256 coefficient slots start with a zero modulo29, since the first printed byte is 203=7×29. Divide the **full 256-slot coefficient vector** by the monic degree-16 factor: the quotient has **240 coefficient slots**, one of which is its leading zero. Its other 239 coefficients are the previously documented monic \(Q_{238}\) multiplied by 28. This 240-slot view preserves the original row-major byte count without silently discarding a leading zero.

Only **physical LP2 p39** has exactly **240 runes** among the 55 rune-bearing unknown pages. This page independently contains one of the **two isolated red three-rune inscriptions**, at original offsets **119–121**, which is the source of the proportional \((X+5)^2\) factor: original ascending coefficients \([27,5,15]=15(X-24)^2\). Thus p39 is a concrete source-motivated potential consumer for the 240-slot quotient. The red inscription straddles the midpoint of its page, at positions119–121, but this observation by itself does not specify a cipher.

**Critical independence limit:** a degree-16 factor yielding 240 formal quotient coefficients is a consequence of 256−16=240. The selection of *all* four small factors, including the cubic and nonic, came from exploratory factorization. The 240-length match was noticed afterward. Neither the p39 image nor a historical instruction says to use the quotient as a p39 key. This relationship is a hypothesis selector, not evidence of decrypted language.

## Decisive original-cipher tests

All original GP29 indexes, all 256 table cells and all factor coefficients are source-pinned in the [single-file reproducer](../sims/lp2_p39_240_gridfactor16_convolution_sft.cjs).

1. **Direct reversible additive key, both original orientations.** Align the quotient's 240 coefficients with p39's 240 runes either first-printed to first-printed or reversed. With both arithmetic signs \(P_i=C_i\pm Q_i\pmod{29}\), the four complete 240-rune inverses have IoCs **0.034797768**, **0.033612273**, **0.032775453**, **0.034693166**. The source p39 IoC is **0.035774059**. All output rune sequences remain near the uniform value \(1/29\), without recovered prose. Exact re-encryption of such additive models alone is tautological.
2. **Any stationary mapping from the quotient value to the observed rune.** Give the decoder a completely unknown, arbitrary lookup for each of the 29 possible quotient symbols, with no restriction to affine maps. Every identical quotient symbol must map to one identical p39 symbol. For source-forward high-to-low alignment the actual 240 pairs have at least **188 unavoidable conflicts**; for reverse alignment they have **189**. A synthetic affine mapping over the same 240 original quotient symbols produces zero conflicts, confirming the test is sensitive to a valid codebook. Thus even a fully secret static 29-way function cannot directly map this quotient into the original p39 glyph stream.
3. **Any unknown degree-16 GF29 polynomial/convolution multiplier.** Treat the *unaltered* 240-rune p39 as the entire input polynomial \(C_{39}(X)\) (first rune highest degree), and ask whether any unknown 17-tap kernel \(K(X)\) could satisfy the full 256-source-coefficient identity \(P(X)=K(X)C_{39}(X)\pmod{29}\). The exact Euclidean algorithm gives
   \[
   \gcd(P(X),C_{39}(X))=1.
   \]
   Therefore **no such polynomial kernel exists**, of any degree. This is a strict algebraic exclusion independent of language, scoring, iteration count or whether the 17 taps are secret. The original table genuinely satisfies \(P=F_{16}Q\), and the synthetic 240-coefficient \(Q\) passes the same convolution/gcd test. As an immediate corroboration, \(P(24)=0\) while \(C_{39}(24)=7\), preventing p39 from containing the source p39-red root factor.

The test differentiates a factor-16 *quotient used as a source-derived key* from a factor-16 *kernel mapping the original p39 rune polynomial to the source grid*. Both simplest original-cipher readings are rejected at their exact scope.

## Consequence for the solve path

The 240-slot/240-rune coincidence identifies **one named target page** from the full grid factorization without searching every target and phase. The marked red polynomial supplies a plausible reason to consider it. However, the full direct-additive, all-secret stationary lookup and all-secret convolution interpretations are excluded. A meaningful successor must supply an **independent original-source operation** linking the quotient to p39 through a nonstationary or nonlocal transform, or explain the red factor and page match by a different route. An arbitrary further key/phase search is not justified by the observed lengths.

**Reproduction:** [\`sims/lp2_p39_240_gridfactor16_convolution_sft.cjs\`](../sims/lp2_p39_240_gridfactor16_convolution_sft.cjs). [Manual Actions execution passed on original repo inputs](https://github.com/FlareZ123/liber-primus/actions/runs/43290960341). The script verifies the original byte SHA-256; the unique p39 page length and red indices; complete factor multiplication, division and leading-zero accounting; four IoCs; both exact arbitrary-codebook conflict bounds; the original coprimality; and a full positive synthetic factor-product and affine lookup.
