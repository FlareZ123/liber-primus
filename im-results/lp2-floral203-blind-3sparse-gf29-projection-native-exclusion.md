# LP2 flower16 × 203: exhaustive secret three-row GF29 plaintext projection

**Agent9, 23 November 2026. Decision:** the original 3,248 black floral runes cannot yield a 203-rune solved-style native GP29 prose stream under **any field-linear combination of up to three original logical source rows**, even with all secret coefficients, field-scaling, an unknown constant shift and a fixed symbol relabeling. The exact source-restricted family is exhaustively excluded by original collision counts. The intended readout, if any, remains unknown. No unknown plaintext or key recovered.

[Source-only read-only SFT](../sims/lp2_floral203_blind_sparse_linear_original_sft.cjs) · [Windows Node22 successful run 45248888032](https://github.com/FlareZ123/liber-primus/actions/runs/45248888032).

## Why this inverse is a plausible independent path

The original table's first token, conditional conventional base60 **3N=203**, and the source floral p40–p55 count **3,248 black=16×203** define one 203-position register per sixteen source rows (after excluding red8, red51, red9 exactly as visibly marked). The p39 source red triplet is three runes, with a second-order GF29 polynomial `15(x−24)²`; a limited three-input algebraic **cross-row** decoding is a natural alternative to the already excluded *within-row two-register 203-period additive stream*. The three-operand operation itself is not specified by an original Cicada instruction. This test is exploratory, designed to prevent private-coefficient fishing when the 16-row source structure is considered.

If one unknown English-like plaintext line were a secret GF29 linear projection of the original sixteen rows, it would have the precise form

`P[j] = b + Σ_{r∈S} a[r] C[r,j] (mod29)`, for all j=0..202,

with unknown subset S of cardinality1,2,3, unknown nonzero coefficients a[r] in1..28 and any unknown shift b in0..28. This deliberately allows **arbitrary source row indices, nonlocal pairings and totally secret per-row weights**, broader than a neighboring-row convolution. Any nonzero global scalar, shift and stationary GP29 alphabet permutation preserve the symbol-collision statistic, so fix the earliest nonzero coefficient to **1** without loss. A permutation of the 203 output positions also cannot increase its collision count. The test exhausts all candidate projective forms and does not fit individual language words.

## Exhaustive original-source result

Take the exact black source in original reading order, grouped into sequential 203-rune rows, **which may cross original physical page boundaries**. For each candidate output `P`, calculate unordered equal-GP-symbol pairs `E=Σ_s binomial(count(P=s),2)`. There are `binomial(203,2)=20,503` possible pairs. No dictionary or language model enters the original cryptanalysis; language is used only to calibrate the output against genuine solved rune plaintext.

| Secret nonzero source rows | Entire projective search | Largest original E | Best possible original IoC |
| --- | ---: | ---: | ---: |
| 1 | 16 | **758** | **0.0369702** |
| 2 | 3,360 | **836** | **0.0407745** |
| 3 | 439,040 | **896** | **0.0437019** |
| **Total** | **442,416** | **896** | **0.0437019** |

The best three-row original projection uses logical source rows **3,7,14**, coefficients **[1,20,6]**. Even this optimized maximum remains far below the weakest authentic solved-native sample. The table is an **exact whole-search maximum** and therefore does not require a multiple-testing-adjusted significance assertion for the claimed family ceiling.

For a separate original-language reference, enumerate all **1,561 within-source-section contiguous 203-rune windows** of the nine already solved, exact GP29 rune texts in [the pinned solved corpus](../resources/external/relikd-solved-gp29-native-v1.json). Only four sections exceed203 runes; no cross-section splice or invented synthetic word is included. Their minimum E is **1,096**, with maximum **1,529**. Therefore **all 442,416 original projections** fall below **all 1,561 genuinely solved GP-native windows**, even allowing arbitrary stationary alphabet relabeling or rune-position permutation of each 203-long projection.

The SFT independently constructs a planted positive by taking genuine 203-rune solved WELCOME text, keeping fifteen original-shaped source rows, and replacing the sixteenth row to guarantee exactly `P = C[3] + 20 C[7] + 6 C[14]` modulo29. It recovers the full planted 203-rune text with zero mistakes and finds a triple projection at least as language-collision-rich as that planted source. This is a test of sensitivity to a real sparse source mixing, in addition to exact arithmetic assertions.

## Boundary and next decision

This is a **complete key-independent negative only within at-most-three-row GF29 cross-row linear mixtures**, regardless of the selected secret coefficients. It does not constrain four-to-sixteen-row dense mixers, nonlinear emission, a change of rune numeral representation, an unknown binary layer, a genuinely keyed algorithm, or a different framing of the source. The book has not authenticated the 16×203 register or selected cross-row mixing; the analysis is not evidence that a *dense* unknown mixer exists.

For decision-making, **do not invest in deeper secret two-/three-row weight searches** expecting ordinary original GP29 prose on this register; source-independent fields cannot improve upon its exact maximum. Recover an author-selected operation, missing source operand or actual plaintext before escalating to the combinatorially much larger dense GF29 linear transformation space. The earlier independent two-state 203-period family has its [own original allseed exclusion](lp2-floral203-p39-16independent-twoseed-original-exclusion.md).
