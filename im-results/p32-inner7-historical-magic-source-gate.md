# Signed tree-page original inverses: centered seven-square, source folding and 2D transport

**Status, 11 November 2026: finite original-cipher negative.** The historically published 7×7 OpenPuff square and the source-selected 11×11 tree-page matrix give a precise 49-position experiment. Forty direct centered-seven interpretations, sixty-six physically folded centered-seven interpretations and six edge-seeded 10×10 difference transports fail to recover original English-like plaintext. **No unknown LP2 plaintext, authentic key, cipher mechanism or final destination was recovered.**

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

## Source-guided p14 FOLD → 11×11 tree → 7×7 overlay

The original LP2 p14 ciphertext visibly includes the complete GP-transliterated word **FOLD**. An independent but provisional arithmetic reading of the signed 2016 sentence sends its repeated word “the” (GP-prime sum72) to p14's FOLD under `page=sum mod58; word=floor(sum/58)`. This selector remains retrospective; the earlier original-source phase null shows 19 of 58 shifted page phases also yield exactly one missing word from the full 43-word signed text. Its value here is to motivate a **physical folding test** distinct from simply extracting the inner seven square.

Fold the two top and bottom rows and the two left and right columns of the 11×11 p32 tree matrix inward around its centered 7×7 square. The exact source-position map is `f(i)=1−i` for `i=0,1`; `f(i)=i−2` for `i=2..8`; `f(i)=15−i` for `i=9,10`. Every one of the **72 outer runes** maps to a 7×7 cell, with 3 source-rune overlays in each 2×2 corner, one at the other border positions and zero over the central 3×3. The 49 inner original runes are the unknown payload; the 72 retained outer rune values provide a fully known GP29 additive folding pad. No outer rune is discarded or fitted.

**Frozen reversible inverse:** `P[r,c] = (C[r,c] ± Σ_outer(r,c)) mod29`, optionally also `±historical_magic[r,c] mod29` or `±Euler_phi(historical_magic[r,c]) mod29`. The historical square is the original 2014 7×7/1033 OpenPuff artifact, with eight physical rotations/reflections included rather than fitting an orientation. This gives **66 parameterized candidates**: 2 direct fold-only, plus 64 fold+magic. The same source-canonical GP alphabet, Emerson training prefix, smoothing and seven-row local trigram score as the independent 40-model centered-seven gate are used. Native English holdouts are drawn from an independent 1,000-window sequence under the exact seven-row, seven-column geometry.

| 49-rune folded 7×7 interpretation | Mean row-local GP trigram score |
|---|---:|
| Untouched center | **−11.95613** |
| Best direct fold only, subtract overlay | **−11.49458** |
| Strongest of all 66, subtract overlay and original magic rotated | **−10.83740** |
| Worst among 1,000 matched native-GP-English controls | **−9.13854** |
| Matched native-control median | **−7.89257** |
| Separate native English control | **−7.97761** |

The best GP transliteration begins `WLOWNGWEA / UUAEAIJI / YOGSTHAN / GURATNGH / GIANSTWJ`, with no plausible plaintext. **Zero** of the 66 original variants beats even the least-English holdout. All **3,234/3,234 source interior glyphs** recover exactly under the paired forward inverse for the 66 candidate models, with their other 72 p32 glyphs preserved as key material; all **3,234/3,234 independent synthetic native-GP plant glyphs** are recovered by the same operators. This finite source motivated overlay hypothesis therefore does not produce a direct GP-English decoder. The result does not rule out nonadditive folding or any hidden author instruction that would determine a different way to combine overlaid glyphs.

**Reproduction:** [`sims/p32_tree_two_ring_fold_magic_sft.cjs`](../sims/p32_tree_two_ring_fold_magic_sft.cjs), manually selected `tree-fold7` in the existing no-auto-run workflow. [Successful source-original GitHub Actions run 42964232948](https://github.com/FlareZ123/liber-primus/actions/runs/42964232948) includes all exact source mappings, positive-control inverses and control thresholds.

## Overall decision

Retire the direct source-aligned GP29 scalar and Hill7 2014 square inverses, the exact two-ring additive FOLD overlays (alone or with the 2014 square), and border-initialized first-order / mixed two-dimensional prefix-sum transports under the tested natural-GP plaintext registers. Preserve the unproven visual ring alignment as an independent clue for any future source-specified operation. The broad original-cipher decoding problem remains unchanged.
