# Twisted-Frobenius order-56 state: bounded original-cipher inverse

**Classification:** exact field arithmetic, a source-motivated state hypothesis, and a finite original-input negative. No unknown LP2 plaintext, authentic key, complete cipher, or destination recovered.

## Human-visible solve-path hypothesis

The only two red three-rune spans are at the same local position (119):

- p3: GP indices [13, 23, 2], read as the polynomial 13 + 23u + 2u².
- p39: GP indices [27, 5, 15], read as 27 + 5X + 15X² = 15(X−24)².

The p3 polynomial gives u² = 3u + 8 in GF(29²). Its Frobenius conjugate is u²⁹ = 3−u, and its norm is u³⁰ = 21 = 79 mod 29. The p39 factor and the first rune on p54 both select 24 (Ac). This suggests, but does not establish, a source-seeded state at p54.

A simple operation available once a solver recognizes the quadratic field is the twisted Frobenius map:

\[
T(x)=u\,x^{29}.
\]

Writing x=a+bu gives T(a,b)=(21b,a), so

\[
T^2=21I,\qquad 21^{14}=-1,\qquad 21^{28}=1.
\]

Therefore T has exact order 56. The order matches the 56 physical unsolved pages (p0–p55), while 21 matches the selected p15 prime 79 modulo 29. Both correspondences are retrospective clues, not independent evidence that the creator intended this operation.

The source anchor is p54's first rune, global offset 12,648, with state S₅₄=24. This fixes the phase for the trace/norm examples below.

## Exhaustive direct-additive family

For any nonzero initial state S and any nonzero GF29-linear observation L, the output key kᵢ=L(TⁱS) satisfies

\[
k_{i+2}=21k_i\pmod{29}.
\]

Because 21 is a nonsquare in GF29, T has no eigenvector over GF29; hence S and T(S) are linearly independent. Every nonzero pair (k₀,k₁) is attainable, and the 840 nonzero pairs exhaust every hidden initial state and nonzero linear projection in this model. No additional phase or sign remains outside this family.

The original 12,956 runes (55 rune-bearing pages plus runeless p50) were tested under all 840 keys for both a book-continuous rune clock anchored at p54 and a page-reset rune clock. English scoring uses the repository's 79,495-entry Duko Round 27 quadgram table (7,266,795 total counts), expanding each GP rune through the corpus transliteration. This is a discriminator, not a proof of language.

| Candidate | Keys | Best quadgram log score / letter | Raw ciphertext |
|---|---:|---:|---:|
| Global rune clock | 840 | −17.149508 (k₀,k₁)=(26,24) | −17.131577 |
| Page-reset rune clock | 840 | −17.135171 (k₀,k₁)=(5,9) | −17.131577 |

Neither best candidate improves on the original ciphertext. The source-fixed trace sequence begins (19,14) and ranks 86/840 globally, 395/840 with page resets. The source-fixed norm sequence begins (25,3) and ranks 298/840 and 239/840, respectively.

The canonical source-fixed trace/norm additive and affine projections were also tested with a global rune clock and with one state per physical page. The best of these 12 reversible cases scores −17.208490 per letter, again below the raw ciphertext. The known solved p57 text scores −10.178885 under the same reference, a positive language control. A 95-rune solved-p57 plant encrypted and decrypted exactly under a synthetic member of the 840-key family.

All candidate transformations re-encrypt exactly by construction. That is an implementation check, not evidence that a candidate key is authentic.

## Interpretation and limits

This test retires only:

1. A direct additive GP29 pad whose stream is any nonzero linear observation of T(x)=u x²⁹, under the exhaustive 840-key global or page-reset clock.
2. The source-fixed trace/norm additive and affine projections, under the tested global-rune and one-state-per-page clocks.

It does **not** exclude other nonlinear output functions, nonlinear state transitions, non-GP intermediate registers, different source-derived clocks, or a different use of the red polynomials. The exact order-56 construction is a hypothesis, not a recovered Cicada mechanism. The apparent 56-page and norm-79 matches must not be multiplied as independent probabilities.

**Reproduction:** node sims/lp2_red_triad_frobenius56_source_state.cjs  
**Inputs:** resources/liber-primus/lp2-corpus.json, resources/liber-primus/lp2-ink-annotations.json, and resources/control/duko_round27_english_quadgrams.txt.  
**Workflow:** .github/workflows/lp2-red-triad-primitive-field-manual.yml (manual-only).
