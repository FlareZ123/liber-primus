# LP2 floral chapter: complete order-four and fifth-order sparse F-marker recurrence exclusions

**Status (14–16 November 2026, Agents20 and41):** A complete finite GF(29) inverse test on the canonical original ciphertext rejects a specific, potentially key-revealing mechanism. **No unknown Liber Primus plaintext, authentic key, or destination was recovered.** This report concerns a previously untested family of arbitrary fourth-order homogeneous recurrence coefficients. It extends the earlier [two-polynomial H·G marker gate](lp2-hg-doublet-fmarker-fiveevent-certificate.md) and is separate from the [native-English fixed-letter positional test](lp2-fixed-reserved-rune-doublet-source-gate.md).

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

## Fifth-order extension: exhaustive 20,511,149-key elimination (16 November 2026, Agent41)

The manuscript has a conspicuous five-part numeric vocabulary, including the original five-by-five squares from the preceding Cicada round. While no authorial instruction selects a fifth-order recurrence or the *doublet means plaintext F* hypothesis, extending the previous four-state test by one state offers a source-conditioned, fully finite question. This extension permits **all 29⁵ = 20,511,149 fifth-order homogeneous recurrence coefficient vectors and every five-GP-symbol seed** on the same entire 3,008-rune physical p40–53 chapter. Lower-order recurrences are contained as degenerate cases. Each vector is considered even if its characteristic polynomial is reducible or singular.

Precisely, impose K[t+5] = Σ(a[j] K[t+j],j=0..4) mod29, continuous through printed page boundaries and across the zero-rune p50. Each original within-physical-page adjacent-identical ciphertext rune at chapter-local index t conditionally leaks K[t] = C[t]. To evaluate every possible starting state **without guessing one**, compute the GF29 remainder of x^t on division by x⁵−Σ(a[j]x^j), forming a linear equation in five unknown initial key symbols. Incremental exact Gaussian elimination accepts underdetermined seeds and rejects a coefficient tuple only when the observed marker value contradicts every possible seed. No GP-English model, key phase, cipher-plaintext crib or image repair participates.

The actual source-ordered marker values at the first eleven offsets are:

| Event index | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11, withheld |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chapter rune offset | 277 | 500 | 526 | 868 | 929 | 972 | 1110 | 1121 | 1202 | 1314 | **1463** |
| Repeated GP29 value | 10 | 22 | 7 | 28 | 9 | 22 | 10 | 25 | 22 | 14 | **18** |

Across the **entire** coefficient family, survivors after the first 1 through 11 constraints are respectively **20,511,148; 20,511,121; 20,508,303; 20,438,692; 19,122,319; 682,518; 23,665; 866; 31; 4; 0**. No candidate reaches any of the seven further original markers. The first ten constraints force exactly four still-possible coefficient/seed pairs, and all four predict a wrong eleventh value:

| Fifth-order recurrence coefficients (a0…a4) | Forced K0…K4 | K1463 prediction | Original K1463 |
| --- | --- | ---: | ---: |
| 8,18,15,12,14 | 20,1,2,20,26 | 28 | **18** |
| 5,13,5,19,15 | 7,24,22,13,28 | 17 | **18** |
| 1,0,27,6,24 | 20,4,18,12,5 | 15 | **18** |
| 14,28,17,0,26 | 13,14,28,22,21 | 9 | **18** |

All four predicted values were independently checked by direct forward generation from their fitted initial seeds, confirming that each exactly reproduces the first ten markers and contradicts the untouched eleventh original site. A separately generated 18-marker positive plant with coefficients (9,4,10,6,8) and seed (7,1,12,23,5) passes all constraints and reconstructs its known seed. The source-locked [single-file Node22 SFT](../sims/lp2_doublet_marker_allcoeff_order5_original_sft.cjs) reads the canonical original GP29 source, asserts the full 18-event inventory, traverses all coefficient tuples, performs independent direct forward checks for the four fits, and verifies the positive control. The same entire-key enumeration was separately executed in C++17 and agreed on all counts and four predictions.

**Decision:** the entire homogeneous order-at-most-five continuous GF29 additive keystream architecture is mathematically inconsistent with the original chapter **conditional on the unproven doublet→plaintext-F leak**. This supersedes the earlier order-four family limit while retaining its separate original-data certificate. It cannot establish what doublets really mean, and it says nothing about a dynamic/changing key, per-page reinitialization, actual solved-page F-transparency, nonhomogeneous recurrences, an order-six-or-higher recurrence, or encipherment with a different register. A new manuscript instruction must motivate a different recurrence family before this search should grow.

## Positive control and limits

The [single-file CommonJS SFT](../sims/lp2_doublet_marker_allcoeff_order4_original_sft.cjs) constructs a completely separate **3,008-rune synthetic cipher** under coefficients \((9,4,10,6)\) and key seed \((7,1,12,23)\). It places 18 repeated-rune marker events at precisely the original chapter's observed positions, avoids extra repeats, recovers all four original seed values from the marked sites, obtains plaintext F at all 18 markers, and verifies every rune by forward re-encryption (**3,008/3,008**). That positive test checks the algebra, completeness of source-constrained marker extraction and the asserted reversible cipher family; it is not a proposed LP2 decryption.

The SFT freezes the canonical **56 physical unknown pages**, **55 nonempty**, **12,956 runes**, **86 within-page equality events**, the p40 chapter offsets **9,640–12,648**, all 18 chapter marker events and the ninth-site certificate. It **passed directly against the checked-out original canonical corpus**, under Windows Node.js 22 in [read-only GitHub Actions run 43562934887](https://github.com/FlareZ123/liber-primus/actions/runs/43562934887) (job 132350414293). The original-source result reproduced the exact three eighth-event survivors, ninth-event contradiction, and synthetic positive control. The committed source file has Git blob SHA **2ac233430741322a201841e7be0fab86e38b8537**.

**Historical order-four decision:** Retire the homogeneous order-at-most-four additive GF29 keystream family under the hypothesized repeat→plaintext-F leak, with a continuous per-rune clock across original p40–53. The fifth-order extension above enlarges this exclusion to all homogeneous order-at-most-five models. The contradiction does **not** apply to page-by-page key resets, plaintext-F skip clocks, nonlinear or inhomogeneous recurrences, order-six-or-higher state, nonadditive transport, or to doublets representing something other than plaintext F. The source does not presently select any of those escape mechanisms. Broadening to arbitrary larger states or locally adjusted clocks solely to fit these eight observations would reintroduce ungrounded degrees of freedom; a new source instruction is required to make such an extension an authentic solve path.
