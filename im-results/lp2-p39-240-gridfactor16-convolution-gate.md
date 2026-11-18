# Original p39 as the unique 240-rune consumer of the 256-cell grid's factor-16 quotient

**Agent46 (12 November 2026); GF(841) extension by Agent21 (14 November); all-secret printed-word and source-geometric phase transfer by Agent10 (18 November). Classification: source-exact arithmetic and bounded original-cipher exclusions. No unknown LP2 plaintext, authentic key, or intended decoding instruction recovered.**

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

4. **Pointwise GF(841) multiplicative/divisive key, using the independent p3 red field.** The p3 red triad at original offsets119–121 is `[13,23,2]` and selects the fixed presentation GF(29)[u]/(u^2-3u-8). Pair the 240 Q240 coefficients and the 240 p39 runes in printed order as a+bu, giving 120 field elements. The p39 red triad remains at the same midpoint offsets `[27,5,15]`. All 120 Q240 key elements are nonzero, so pointwise division is defined. Field addition/subtraction reproduce the already-reported forward GF29 additive cases; the new multiplicative readings P_i=C_i*K_i and P_i=C_i/K_i have IoCs **0.033368201** and **0.035320781**, respectively, against source p39 **0.035774059** and solved p57 **0.062709966**. Neither output is readable plaintext. A repeated-p57 synthetic positive control round-trips exactly under all four fixed operations. This tests only direct pointwise field keying, not a nonlocal/stateful recurrence. [GF(841) SFT](../sims/lp2_p39_q240_gf841_pointwise_key_sft.cjs).


5. **Composition with the authenticated prime-totient/F-bypass stream, including every F interpretation (Agent23, 16 November 2026).** One plausible authored precedent is the *actual* p56 prime-totient cipher. Fix the previously established 240-slot quotient as a one-time additive GP29 operand (either physical source orientation) and append the **genuine consecutive-prime totient key, beginning at prime 2, with plaintext-F transparent skip**. Exhaust all **eight combinations** of quotient order and the two independent additive signs. The exact inverse retains *both* legal interpretations when a ciphertext F is observed: a literal plaintext F that does **not** advance the prime clock, or an encrypted non-F that **does** advance the clock. At all other ciphertext runes it requires a consumed non-F. States sharing a prime-consumption count can be merged without losing existence of a complete plaintext. **Every one of the eight models becomes mathematically impossible on original p39 before rune 82**: maximum viable prefix lengths are **3,5,8,31** (printed quotient, signs ordered −/−, −/+, +/−, +/+) and **1,81,30,15** (reversed quotient). The eight independent complete 240-rune authentic-GP *source-native p57* positive plants all invert successfully, and the original 256-byte table, marked p39 triad and full factorization are asserted. [Source-exact standalone SFT](../sims/lp2_p39_q240_plus_phi_ftransparent_sft.cjs) · [passing Windows Node22 run 43965247083](https://github.com/FlareZ123/liber-primus/actions/runs/43965247083). This strictly retires the specified **direct Q240 plus source-authenticated phi-prime clock** at source phase zero without selecting an F-skip history. It does **not** exclude a separately author-selected starting prime, phase, source wrapper or genuinely different receiver. No unknown plaintext or key was recovered.

The test differentiates a factor-16 *quotient used as a source-derived key* from a factor-16 *kernel mapping the original p39 rune polynomial to the source grid*. Both simplest original-cipher readings are rejected at their exact scope.

## Fixed Q240 GP28 nonrepeat inverse (Agent35, 18 November 2026)

The foregoing direct GP29 additive inverse does not test the source's striking suppression of adjacent identical ciphertext runes. A different, **fully reversible** candidate combines three independently printed structures: (a) the same established degree-16 factor of the p49–51 source table, leaving 240 exact GF29 quotient coefficient **slots**, (b) the unique 240-rune p39 original page with its red factor, and (c) the original unknown-book near-exclusion of repeated adjacent runes. The conjectural consumer labels each nonrepeating step among the 28 nonzero GP29 predecessor differences, with the remaining GP symbol EA reserved as an equal-ciphertext marker. The original source does **not** prescribe this 28-way receiver, EA marker, quotient-to-cipher clock or alignment.

Let `Q[0..239]` be the exact source quotient in printed high-to-low order, including its leading zero. The original p39 first rune `C[0]` is a transmitted IV; for every `i=1..239`, compute `d=(C[i]-C[i-1]) mod29`. The proposed plaintext rune is `P[i]=28` (EA) if `d=0`, otherwise `P[i]=(d-1+s*Q[i]) mod28`, where `s=+1` or `-1`. Read the complete quotient either printed high-to-low or reversed. These **four** source-fixed variants have no fitted word-boundary state, key offset, secret alphabet, additional stream, or crib. The inverse is exact: an ordinary `P in0..27` emits nonzero step `1+(P-s*Q[i]) mod28`; `EA` emits zero. A real 239-rune source-native GP plant from the actually clear p57 page, repeated without modification to cover the whole source layout, recovers **239/239** symbols for each sign and direction. All four original decoded strings re-encode the **original 240/240 p39 ciphertext runes**, but that is a model bookkeeping property, not evidence the candidate is the historical cipher.

| Source quotient reading | Arithmetic | Original decoded 239-rune GP29 IoC | Sustained plaintext |
| --- | --- | ---: | --- |
| Printed high-to-low | Subtract | **0.034879223656** | None |
| Printed high-to-low | Add | **0.036004359903** | None |
| Fully reversed | Subtract | **0.034597939594** | None |
| Fully reversed | Add | **0.035758236349** | None |

Exactly **one** original p39 within-page same-rune successor becomes the conjectural EA for every variant. The four full outputs have only uniform-like rune frequencies; none contains readable full words or a contiguous passage. The original p39 IoC is about **0.035774**, and independently clear p57 is about **0.062710**; those figures illustrate the candidate's failure to restore native-language concentration without claiming that IoC alone proves impossibility. This retires **only** these four literal Q240→GP28-step consumers, not other state-dependent or source-selected cipher architectures. It does not provide authentic unknown plaintext, an original author key, or a continuation.

[Standalone read-only Windows-compatible original-input SFT](../sims/lp2_p39_q240_nonrepeat_original_sft.cjs), with an exact 256-byte table hash, GF29 zero-remainder assertion, complete original reciphering and independent native-GP plant, **passed on Node22 Windows** in [Actions run 44269462541](https://github.com/FlareZ123/liber-primus/actions/runs/44269462541).

## All-secret printed-word transfer, including arbitrary within-word rearrangement (Agent10, 18 November 2026)

A 240-coefficient table quotient matching the **one original 240-rune page** invites a narrower alternative to the previously excluded *book-global* lookup: perhaps Q240 is a separate representation of the same underlying printed p39 words, and each word independently uses a secret changing alphabet. This hypothesis has the uniquely named p39 target, exactly fixed 240:240 alignment and its 55 original printed word boundaries. It does **not** claim that the artwork instructs a wordwise codebook or that the quotient has printed words of its own.

The new test eliminates keys analytically. For each p39 word permit an **independent secret** GP29 Caesar shift, any invertible affine GP29 map (28×29 options per word), or an *entirely unrestricted* 29-symbol bijection (29! options per word). A secret bijection must preserve every within-word equality relationship, regardless of key. A still more permissive model gives each word an **arbitrary secret permutation of its rune positions** as well as a separate secret 29-symbol bijection: this must preserve the multiset of **symbol multiplicities** in the word, regardless of both secrets. These invariants are exact, so no factorial search or plaintext scorer is required.

| Whole 240-slot quotient reading | Secret Caesar-compatible words | Secret affine-compatible words | Arbitrary bijection-compatible words | Bijection plus free word-local transposition |
| --- | ---: | ---: | ---: | ---: |
| Original printed order | 2/55 | 7/55 | 34/55 | **39/55** |
| Entire quotient reversed | 3/55 | 7/55 | 35/55 | **38/55** |
| Each printed word span reversed | 2/55 | 7/55 | 34/55 | **39/55** |

There are **25 genuine p39 words of at least five runes**. Among these, **none** admits even an arbitrary word-specific affine key for any of the three orientations. Under unrestricted **word-local** bijections without reordering, only **8/25** long words admit a map for each orientation. Even granting arbitrary word-internal rearrangement and unrelated bijections for **every word**, the original permits only **13/25** long words in source order, or **10/25** when the complete quotient is reversed. Thus **at least twelve original long words** obstruct this entire generously keyed, word-boundary-preserving transfer from Q240 to p39, even with arbitrary different secrets per word.

The [standalone original-source CJS SFT](../sims/lp2_p39_q240_allsecret_wordmap_sft.cjs) recovers the exact 240 quotient coefficients from the unchanged 256 numerical bytes and degree-16 factor, asserts all source word boundaries against the indexed original p39, and tests all declared families. A **positive** first takes 240 GP runes repeated from the genuinely clear p57, applies an independent secret invertible affine transform to every one of the 55 p39-sized word slots, then multiplies by the exact 17-term original-source factor to produce 256 GF29 table residues. The program reverses that *entire 256→240 factor operation* and recognizes all **55/55** planted secret wordwise bijections, including all **25/25** long words. [Successful read-only Windows Node22 run 44278976056](https://github.com/FlareZ123/liber-primus/actions/runs/44278976056).

**Decision:** p39 and the quotient cannot be two literal word-by-word encodings of the same 240 symbols under an arbitrary position-invariant monoalphabet per word, even with completely unconstrained inside-word letter reordering. This says nothing about a cipher whose alphabet changes *within a word*, transfers information across words, changes segmentation, or uses the quotient as a key rather than another rendering of p39. No unknown plaintext is recovered.

## Periodic all-secret alphabets, with the printed p15 spiral (Agent10, 18 November)

The original p15 **4×4** numerical spiral names sixteen ordered source cells, and the p50 table has **8 columns** and **32 rows**. The 240-slot p50 quotient can be read as fifteen rows of sixteen cells. Before introducing language scoring or secret keys, ask whether the quotient and actual p39 240-rune inscription are related by an arbitrary **phase-specific 29-symbol alphabet bijection**, repeated with period `k` over those exact printed runes. Grant an unrelated unknown key for **every phase**. Any single phase whose same source rune would have to map to two different original p39 runes, or two different source runes to one original p39 rune, falsifies all 29! phase-key choices.

The [same source-exact SFT](../sims/lp2_p39_q240_allsecret_wordmap_sft.cjs) tests only the **originally present** matrix dimensions `k=4,8,16,32`, with three fixed quotient readings: original source order, full reverse, and applying the original p15 center-start spiral `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]` independently in each successive sixteen-coefficient block. No fitted phase start, altered page, symbol re-labeling or score-based sorting enters the calculation.

| Quotient readout | k=4 conflicting phases | k=8 | k=16 | k=32 |
| --- | ---: | ---: | ---: | ---: |
| Original printed | **4/4** | **8/8** | **16/16** | **28/32** |
| Fully reversed | **4/4** | **8/8** | **16/16** | **26/32** |
| Printed p15 spiral inside 16-blocks | **4/4** | **8/8** | **16/16** | **28/32** |

For the apparently strongest source period, `k=16`, all sixteen phases independently contradict the existence of *any* one-to-one alphabet, even with every alphabet secret and freely chosen. This eliminates the source-defined **periodic positionwise substitution** itself rather than just the simple Caesar/affine special cases. A distinct positive plants sixteen independent arbitrary modular shifts on the exact 240 table coefficients and recognizes **zero** contradictory phases, demonstrating what compatible keyed data would look like.

This gate does not exclude a keyed operation whose alphabet changes *within a phase period*, a nonperiodic state machine, a change to the 240-slot alignment, a cipher that derives its keystream from Q240 rather than directly relabeling it, or a different printed-page receiver. The original art has not authenticated the 16-block spiral as a decoding order. **No unknown plaintext or secret is recovered.**

## All-secret first- through sixteen-stage changing-state transfer (Agent10, 18 November)

The printed **p15 4×4 16-number square**, the **source table's degree-16 factor**, and the exact **Q240/p39 240:240 registration** motivate a more flexible alternative to the foregoing wordwise and periodic-static alphabets. The same source quotient could be an input to a **time-invariant 16-stage affine feedback system**, whose ciphertext at time `i` depends on both the previous sixteen ciphertext runes and the current/previous fifteen quotient values. This has genuine nonperiodic dependence on the original ciphertext; its coefficients are completely unspecified by the source. Rather than fit a handful of secret coefficients and score language, this test grants the adversary **every possible secret coefficient in GF29** and asks whether *any* such system can reproduce the whole untouched p39 source.

For a stage count `k` let the hypothetical source relation be

```text
C[i] = d + a1*C[i-1] + ... + ak*C[i-k]
         + b0*Q[i] + ... + b(k-1)*Q[i-k+1]  (mod 29)
```

The `2k+1` intercept and memory/input coefficients are completely free and unknown. Retain exactly the physical source alignment, and three predeclared quotient readouts: printed high-first, complete reverse, and independent printed-p15 spiral traversal of each consecutive 16-coefficient group. For every `k in {1,2,4,8,16}`, build all `240-k` linear constraints on these parameters and compare the exact GF29 coefficient-matrix rank with the augmented matrix rank. Unlike language scoring, **rank mismatch makes the complete model mathematically impossible under every possible secret coefficient assignment.**

| Stages | Number of original equations | Coefficient rank, all three orientations | Augmented rank, all three |
| ---: | ---: | ---: | ---: |
| 1 | 239 | 3 | **4** |
| 2 | 238 | 5 | **6** |
| 4 | 236 | 9 | **10** |
| 8 | 232 | 17 | **18** |
| **16** | **224** | **33** | **34** |

Thus **even an arbitrary secret 16-stage affine state transition cannot map Q240 to the original 240-rune p39 ciphertext under these fixed source orders**. The k=16 case includes every lower-order linear recurrence by setting extra coefficients to zero. The source p15 grid and table degree select a defensible upper bound, but the maker has never instructed the player to apply this equation.

A complete source-shaped positive uses the genuinely clear GP29 p57 PARABLE runes repeated to 240 positions as the target, freezes **sixteen independent secret ciphertext-feedback taps**, **sixteen independent quotient taps**, and a nonzero offset, then solves the input quotient successively so this same original-sized recurrence holds. Multiplying that quotient by the **exact original factor16** generates a new 256-cell GF29 table-shaped source; dividing it recovers all **240/240** quotient coefficients, and the rank condition passes **33=33**. The [existing original-source CommonJS SFT](../sims/lp2_p39_q240_allsecret_wordmap_sft.cjs) now runs all 15 original rank tests and this complete planted control, with [Windows Node22 successful run 44284806712](https://github.com/FlareZ123/liber-primus/actions/runs/44284806712).

**Bounded decision:** Retire the entire secret linear time-invariant 16-stage Q240→p39 **feedback architecture**, including the eight- and four-stage special cases. This leaves nonlinear changes of state, time-varying keys, transformations across other source registers, and the possibility that Q240 serves as independent key material rather than a direct ciphertext antecedent. No unknown p39 plaintext or authentic author key is recovered. A new successor needs a first-party nonlinear opcode/key or a genuinely different consumer, not more guessed linear taps.

## Consequence for the solve path

The 240-slot/240-rune coincidence identifies **one named target page** from the full grid factorization without searching every target and phase. The marked red polynomial supplies a plausible reason to consider it. However, the full direct-additive, all-secret stationary lookup, all-secret convolution, and both the **word-local arbitrary-bijection plus arbitrary within-word transposition** **source-geometric, periodic all-secret alphabet**, and **all-secret linear changing-state feedback through order16** transfers are excluded. A meaningful successor must supply an **independent original-source operation** linking the quotient to p39 through a state changing *within words* or across original word boundaries, or explain the red factor and page match by a different route. Direct additive, static lookup, convolutional, pointwise GF(841) multiply/divide, and the four fixed reversible GP28 nonrepeat-step readings are now bounded negatives. An arbitrary further key/phase search is not justified by the observed lengths.

**Reproduction:** [\`sims/lp2_p39_240_gridfactor16_convolution_sft.cjs\`](../sims/lp2_p39_240_gridfactor16_convolution_sft.cjs). [Manual Actions execution passed on original repo inputs](https://github.com/FlareZ123/liber-primus/actions/runs/43290960341). The script verifies the original byte SHA-256; the unique p39 page length and red indices; complete factor multiplication, division and leading-zero accounting; four IoCs; both exact arbitrary-codebook conflict bounds; the original coprimality; and a full positive synthetic factor-product and affine lookup.
