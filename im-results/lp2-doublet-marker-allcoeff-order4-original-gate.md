# LP2 floral chapter: complete order-four sparse F-marker recurrence exclusion

**Status (14 November 2026, Agent 20):** A complete finite GF(29) inverse test on the canonical original ciphertext rejects a specific, potentially key-revealing mechanism. **No unknown Liber Primus plaintext, authentic key, or destination was recovered.** This report concerns a previously untested family of arbitrary fourth-order homogeneous recurrence coefficients. It extends the earlier [two-polynomial H·G marker gate](lp2-hg-doublet-fmarker-fiveevent-certificate.md) and is separate from the [native-English fixed-letter positional test](lp2-fixed-reserved-rune-doublet-source-gate.md).

## Why this mechanism could have recovered a key

The manuscript has only 86 equal adjacent cipher-rune events among 12,901 within-page adjacent pairs, and authentic solved Cicada texts use special treatment of plaintext GP F (rune index zero). One **unproven** candidate is that a repeated ciphertext rune flags a plaintext F. If the rest of the cipher is ordinary additive GP29 encryption at a continuous per-rune clock, each marked site leaks the corresponding keystream value exactly:

\[
C_i=P_i+K_i\pmod{29},\qquad
(C_i=C_{i-1})\Longrightarrow P_i=0\Longrightarrow K_i=C_i.
\]

The implication is one-way: unmarked positions may also encode F. The model does **not** establish that this indicator was used by the authors. It also differs from the known solved-page F-interrupter skip convention, which may not consume a key symbol.

To grant a very broad yet executable key family, let the keystream satisfy **any** homogeneous recurrence of order at most four over GF(29):

\[
K_{i+4}=a_0K_i+a_1K_{i+1}+a_2K_{i+2}+a_3K_{i+3}\pmod{29}.
\]

All four coefficients and all four starting key values are free. Every homogeneous recurrence of order one, two, or three can be embedded in this order-four form. The model is motivated by the four-state cipher question and p15's original four-by-four number square; the source supplies no instruction selecting a recurrence or binding doublets to F. We therefore test this finite family as a **conditional inverse**, rather than asserting it as a likely puzzle design.

## Source-frozen target and decisive original prediction

Use the single original **p40–53 floral visual chapter**, which contains **3,008 runes**. Physical p50 contributes zero runes. Derive equal-rune sites strictly **within physical pages**, with a continuous chapter rune index beginning at zero on p40. Original runes are read from [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json), without alteration to indices, positions or ciphertext. There are **18** equality sites in this chapter. These first nine source-observed pairs are sufficient to decide the entire family:

| Equality event | Chapter-local zero-based rune index | Original repeated GP29 index |
| --- | ---: | ---: |
| 1 | 277 | 10 |
| 2 | 500 | 22 |
| 3 | 526 | 7 |
| 4 | 868 | 28 |
| 5 | 929 | 9 |
| 6 | 972 | 22 |
| 7 | 1110 | 10 |
| 8 | 1121 | 25 |
| **9, held out** | **1202** | **22** |

For each of the **29⁴ = 707,281** possible monic order-four characteristic polynomials, compute the exact four initial-state coefficients of \(K_i\) by reducing \(x^i\) modulo the polynomial. Incremental Gaussian elimination over GF(29) incorporates the observed \(K_i=C_i\) constraints and detects inconsistency. This grants the unknown starting state arbitrarily; no language score, plaintext guess, key-source selection or stochastic search is used.

Exactly **three** characteristic polynomials can satisfy the first eight source observations, each with a uniquely forced four-rune starting state. All three predict the wrong value at the ninth original position:

| \((a_0,a_1,a_2,a_3)\) | Forced \((K_0,K_1,K_2,K_3)\) | Predicted \(K_{1202}\) | Original \(C_{1202}\) |
| --- | --- | ---: | ---: |
| (18, 5, 27, 1) | (17, 21, 24, 23) | **6** | **22** |
| (22, 18, 10, 3) | (20, 25, 4, 5) | **13** | **22** |
| (10, 5, 27, 27) | (1, 2, 0, 0) | **25** | **22** |

Thus **zero** of 707,281 polynomials, even with unrestricted four-rune seeds, fits the first nine, and zero fits all 18. This is an exact finite contradiction on the unchanged original ciphertext. Requiring coherence on the rest of the book could not rescue a candidate already failing inside this one chapter. In particular, even a **fresh independent starting key state at the chapter boundary** cannot restore this model.

## Positive control and limits

The [single-file CommonJS SFT](../sims/lp2_doublet_marker_allcoeff_order4_original_sft.cjs) constructs a completely separate **3,008-rune synthetic cipher** under coefficients \((9,4,10,6)\) and key seed \((7,1,12,23)\). It places 18 repeated-rune marker events at precisely the original chapter's observed positions, avoids extra repeats, recovers all four original seed values from the marked sites, obtains plaintext F at all 18 markers, and verifies every rune by forward re-encryption (**3,008/3,008**). That positive test checks the algebra, completeness of source-constrained marker extraction and the asserted reversible cipher family; it is not a proposed LP2 decryption.

The SFT freezes the canonical **56 physical unknown pages**, **55 nonempty**, **12,956 runes**, **86 within-page equality events**, the p40 chapter offsets **9,640–12,648**, all 18 chapter marker events and the ninth-site certificate. Local Node.js 22 execution of the complete program against a marker-exact synthetic fixture passed, and the canonical original marker locations and values were separately computed directly from the repository's live source JSON. The committed source file has Git blob SHA **2ac233430741322a201841e7be0fab86e38b8537**; executing it within the checked-out repository runs the same certificate against its canonical source.

**Decision:** Retire the whole homogeneous order-at-most-four additive GF29 keystream family under the hypothesized repeat→plaintext-F leak, with a continuous per-rune clock across original p40–53. The contradiction does **not** apply to page-by-page key resets, plaintext-F skip clocks, nonlinear or inhomogeneous recurrences, order-five-or-higher state, nonadditive transport, or to doublets representing something other than plaintext F. The source does not presently select any of those escape mechanisms. Broadening to arbitrary larger states or locally adjusted clocks solely to fit these eight observations would reintroduce ungrounded degrees of freedom; a new source instruction is required to make such an extension an authentic solve path.
