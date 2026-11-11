# Signed tree-page original inverses: inner seven-square and border-seeded 2D transport

**Status, 11 November 2026: finite original-cipher negative.** The historically published 7×7 OpenPuff square and the source-selected 11×11 tree-page matrix give a precise 49-position experiment. Forty centered-seven standard reversible GP29 interpretations and six independent 10×10 edge-seeded difference transports fail to recover original English-like plaintext. **No unknown LP2 plaintext, authentic key, cipher mechanism or final destination was recovered.**

## Why a solver might try this

The independently PGP-signed 2016 tree illustration reuses the tree visible on original LP2 `49.jpg`, physical **p32**. Page 32 contains **121=11²** unmodified ciphertext runes. In their unchanged order, the first row of 11 Gematria Primus *prime weights* sums **563** and the first column sums **569**, exactly the signed image's **563×569** pixel dimensions. That establishes a reproducible, naturally oriented 11×11 source matrix, although it does not authenticate a particular decoding step.

The genuinely solved LP2 PARABLE says to “shed our own circumferences” and “find the divinity within.” Removing **two complete outer rings** from this 11×11 square leaves a centered **7×7 (49-rune)** matrix. A Cicada 2014 OpenPuff stage separately published an independently original **7×7 numeric magic square**, with all seven row/column sums **1033** and central element **331**. The choice to remove *two* rings to match the historical square is ours; an original 2016 instruction does not specify it. This source-alignment hypothesis is distinct from earlier direct readings of p32's central **5×5** and from previously tested 7×7 Hill models on *other* LP2 pages.

Canonical inputs:
- `resources/liber-primus/lp2-corpus.json`: original p32 rune ordinals, mapped row-major to coordinates `(r,c)=(2..8,2..8)` of the established 11×11 square, with no omitted glyph inside the selected 49.
- `resources/cicada2014-openpuff-magic-squares.txt`: the historical second square, rows `[7,375,236,190,27,17,181]` through `[181,17,27,190,236,375,7]`.
- `resources/control/emerson_essays_2944.txt`: pinned independent natural-language training and controls.

## Fixed finite inverse

For the 49 *original* cipher runes, test 32 direct square-cell masks: `raw square element mod29` or `Euler φ(square element) mod29`, both additive signs, under each of eight rotations/reflections of the historical square. Every operation has a known inverse.

Separately reduce the full historical 7×7 square modulo29 and use it as a GF(29) linear map, on either the **left or right**, original or transposed orientation, forward or inverse direction. The historical matrix is invertible mod29, so these **eight** Hill7 models preserve all 49 glyphs and offer exact forward re-encipherment. No secret offset, language-selected phase, extra nonce, skip or fitted key was supplied.

Language scoring uses 29-symbol GP trigrams from the first 50,000 separately converted Emerson runes, smoothed by 0.2. Each row's five trigrams are evaluated separately, preserving the *source's seven-row segmentation* and avoiding manufactured trigrams across removed border glyphs. A matched pool of 1,000 GP-English holdout 7×7 matrices uses identical original positions, score and training weights. The natural source-native additive/totient and Hill positive controls encode independent GP-English matrices under the exact square and decode them back with **49/49** accuracy.

## Executed results

| Input / family | Mean row-local GP trigram log likelihood |
|---|---:|
| Original 49-rune central square | **−11.9561** |
| Best original of all **40** inversions: raw square subtraction, rotation1/3 | **−11.13793** |
| Best 7×7 Hill inverse/forward reading: original matrix, forward, right | **−11.45910** |
| Worst-scoring among **1,000 original-layout GP-English holdouts** | **−9.08856** |
| Median original-layout GP-English holdout | **−7.87420** |
| Independent native GP-English control | **−7.87513** |

**0/40 candidate decryptions exceed even the worst of 1,000 English controls** under this fixed, admittedly short-text row-local test. All 40 variants reverse to the original ciphertext: **1,960/1,960** original-cipher glyphs are exactly re-enciphered. Both source-keyed control families recover **49/49** GP-English glyphs. This is a calibrated negative for the specified original 49-rune native-GP interpretations; it is not a mathematical proof against more elaborate codecs, non-GP registers, transpositions, altered plaintext segmentation or use of the square elsewhere.

The highest-scoring output's seven GP-transliterated rows are `ILEFIYOE / THWLFDAOE / XAGSTHNC / OBRATNS / IPNSTXI / INGNGLCFIA / XFIAUSTH`; no recognizable statement emerges. The original source's word breaks are not fitted or interpreted as row boundaries in this test. A valid new theory must derive a distinct operation and state independently of this result, and predict untouched original ciphertext or recovered plaintext.

**Reproduction:** `node sims/p32_inner7_historical_magic_inverse_sft.cjs` (Node22, CommonJS). [Committed exact source](../sims/p32_inner7_historical_magic_inverse_sft.cjs) · [passed manual GitHub Actions run 42961426789](https://github.com/FlareZ123/liber-primus/actions/runs/42961426789), probe `tree-inner7` in the existing workflow-dispatch-only grid regression. The raw CI output records variant scores, all 1,000-control bounds, positive-control recovery and original forward round trips.

## Sibling original-input test: the 11×11 image-axis border as a two-dimensional initialization vector

The exact source row/column checksums **563/569** assign additional, natural structure to the **21 first-row/first-column runes** of p32. Treat them provisionally as a fixed two-dimensional cipher initializer, leaving the **100 remaining interior runes** as a 10×10 payload. A historically plausible operation to try is **two-dimensional prefix integration** over the 29-element GP ordinal field. Its inverse is a mixed finite difference, with the initial row/column supplying all state required to decode and reconstruct the interior:

```
horizontal: P[r,c] = s * (C[r,c] - C[r,c-1])                 (mod 29)
vertical:   P[r,c] = s * (C[r,c] - C[r-1,c])                 (mod 29)
mixed:      P[r,c] = s * (C[r,c] - C[r-1,c] - C[r,c-1] + C[r-1,c-1]) (mod 29)
```

Here `r,c=1..10` and `s∈{+1,−1}`. The six models are completely invertible given the original border and preserve all 121 glyphs; no hidden table, fitted key, rotation or arbitrary 2D kernel was introduced. The zero-based ordinal GP alphabet is bijective. The non-bijective mapping `GP prime value mod29` was deliberately **excluded** from the candidate family, since it cannot generally recover the source glyph without extra information.

The six exact original inverses score as follows against the same fixed Emerson 29-symbol trigram model, measured within the ten 10-rune rows:

| 100-rune 10×10 stream | Mean row-local GP trigram log likelihood |
|---|---:|
| Original untransformed interior | **−11.83642** |
| Strongest of six, positive mixed difference | **−11.64031** |
| Worst independent English matrix of 1,000 matched 10×10 controls | **−8.76050** |
| Median independent English 10×10 control | **−7.88494** |
| Separate native English control | **−8.00707** |

No original variant beats any of the 1,000 matched controls. The best output begins `BTLWTHPWIOEF / WEAHICMGEOHX / EWEMIUDCGA`, without recognizable prose. All **726/726 original source runes** were correctly regenerated by the six forward transports; six independent native-GP plants were recovered **600/600** exactly. The source dimensions remain verified at 563 and 569 in every run. This rejects these literal horizontal, vertical and two-dimensional discrete-integration interpretations, leaving nonlinear and other specified operations open.

**Reproduction:** `node sims/p32_source_axis_2d_prefix_inverse_sft.cjs`, a standalone CommonJS source asserting both source edges and the full inverse. [Exact executable](../sims/p32_source_axis_2d_prefix_inverse_sft.cjs) · [successful manual Actions run 42962185273](https://github.com/FlareZ123/liber-primus/actions/runs/42962185273), probe `tree-2d-prefix`.

## Overall decision

Retire literal source-aligned scalar GP29 additive/totient and standard Hill7 uses of this 2014 square on p32's centered seven-grid. Preserve the unproven visual ring alignment as an independent clue for any future source-specified operation. The broad original-cipher decoding problem remains unchanged.
