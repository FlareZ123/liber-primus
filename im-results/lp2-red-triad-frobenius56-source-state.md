# Twisted-Frobenius order-56 state: corrected bounded original-cipher inverse

**Classification:** exact field arithmetic, a source-motivated state hypothesis, and a finite original-input negative. No unknown LP2 plaintext, authentic key, complete cipher, or destination recovered.

**Correction to the initial checkpoint:** the first version indexed the 56-state stream with a modulo-29 helper, and treated the annotation's rune string as an array. This revision fixes both issues: state positions now use modulo 56, and red-span runes are decoded from their Unicode string. All global and page-state figures below supersede the first checkpoint. The page-reset all-secret figures happen to remain unchanged.

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
| Global rune clock | 840 | −17.130538 (k₀,k₁)=(15,25) | −17.131577 |
| Page-reset rune clock | 840 | −17.135171 (k₀,k₁)=(5,9) | −17.131577 |

The global best is only 0.001039 nats per letter above raw, and its preview remains gibberish; exactly one of 840 keys edges the raw score. The page-reset search has no key above raw. The known solved p57 text scores −10.178885 under the same reference, about seven nats per letter better than the best candidate.

The source-fixed trace sequence begins (19,14) and ranks 370/840 globally, 395/840 with page resets. The source-fixed norm sequence begins (25,3) and ranks 163/840 and 239/840, respectively.

The canonical source-fixed trace/norm additive and affine projections were also tested with a global rune clock, a page-reset clock, and one state per physical page (18 reversible cases). The best score is −17.131486, just 0.000091 above raw, from a page-state affine map with trace as multiplier and norm as offset. Its preview is not language. Because that variant applies one affine substitution per page, it preserves within-page symbol equality; its tiny score edge is not evidence of plaintext.

A 95-rune solved-p57 plant encrypted and decrypted exactly under a synthetic member of the 840-key family. All candidate transformations re-encrypt exactly by construction. That is an implementation check, not evidence that a candidate key is authentic.

## Source-fixed multiplicative norm page key

The same field construction gives a second, distinct output rule: assign one multiplicative GP29 key to each page using the norm of its source-anchored field state, k_p = N(T^(p-54)(24,0)) mod 29. This is the most direct page-level use of the order-56 state cycle because LP2 has 56 pages and p54 supplies the Ac24 anchor. The resulting norm sequence starts **25, 3**, repeats every **28** pages, and has no fitted phase or scale. Test the standard multiplicative inverse P = C * k_p^(-1) mod 29 on all 12,956 original LP2 runes.

The result is negative: the raw Duko Round 27 score is **−17.131577** per letter (IoC **0.034478**); the multiplicative page-norm output scores **−17.199143** (IoC **0.034456**), a **−0.067566** change. The 95-rune solved-p57 positive control, encrypted and decrypted with its corresponding source-cycle page key (**18**), recovers exactly. As expected for a nonzero scalar multiplication, within-page IoC is invariant; only cross-page symbol labels change.

**Decision:** retire this direct source-fixed multiplicative norm page-key. This does not exclude other nonlinear outputs, a different state clock, or a non-GP use of the field element. Reproduction is included in [the existing field SFT](../sims/lp2_red_triad_frobenius56_source_state.cjs).

## Interpretation and limits

This test retires only:

1. A direct additive GP29 pad whose stream is any nonzero linear observation of T(x)=u x²⁹, under the exhaustive 840-key global or page-reset clock.
2. The source-fixed trace/norm additive and affine projections, under the tested global-rune, page-reset, and one-state-per-page clocks.
3. The direct source-fixed multiplicative norm page key, one scalar per page, under the p54-anchored 56-page clock.

It does **not** exclude other nonlinear output functions, nonlinear state transitions, non-GP intermediate registers, different source-derived clocks, or a different use of the red polynomials. The exact order-56 construction is a hypothesis, not a recovered Cicada mechanism. The apparent 56-page and norm-79 matches must not be multiplied as independent probabilities.

**Reproduction:** node sims/lp2_red_triad_frobenius56_source_state.cjs  
**Inputs:** resources/liber-primus/lp2-corpus.json, resources/liber-primus/lp2-ink-annotations.json, and resources/control/duko_round27_english_quadgrams.txt.  
**Workflow:** .github/workflows/lp2-red-triad-primitive-field-manual.yml (manual-only).
