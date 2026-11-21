# Original p6→p7 five-column body and printed-word receiver gate

**Agent1, 21 November 2026. Evidence:** source-selected finite original-cipher tests, with no authenticated plaintext, original creator key, or complete cipher mechanism recovered. This investigation uses the previously documented p7 red-word GF29 matrix unchanged, so it does not constitute a newly recovered key. The distinctive new input selection is the marker-bounded p6/p7 passage, its two 13-dot delimiters, and its 70 original printed words.

## Why a player might consider the operation

The original physical p6 scan (`resources/liber-primus/23.jpg`) has a red 13-dot punctuation object after the red 11-rune passage, at offset82. The original physical p7 scan (`24.jpg`) has a red 13-dot object before its terminal red 14-rune, five-word passage at offset194. Therefore the intervening black reading interval, including the p6→p7 page transition, consists of p6 offsets82–195 (**114 GP29 runes**) followed by p7 offsets0–193 (**194 runes**), totaling **308 original ciphertext runes**.

The p7 red inscription has five printed words, five following black dots, and fixed original word products in GF29 `[11,26,8,15,2]`. An earlier source-first report identified a standard 5×5 right-circulant matrix with precisely that first row. Its exact inverse begins `[23,2,5,2,19]`, unexpectedly agreeing with previously known historical DH numbers, but the circulant operation was identified during exploratory research and is not a documented author instruction. See [p7 matrix report](lp2-p7-red-circulant-dh-original-inverse.md).

Two distinct, independently delimited receiver presentations arise from the source:

1. **Marker-restored rune stream:** treating each 13-dot delimiter as one *hypothetical* GF29 symbol 13 yields `[13] + 308 ciphertext runes + [13]`, or **310 positions = 62×5**. The inserted values are deliberately labeled proposed control/padding symbols, not runes printed in the original ciphertext. The source does not instruct a player to insert dots as runes.
2. **Complete printed-word stream:** the same 308-rune interval has exactly **70 original complete printed words = 14×5**. The original p6/p7 red-word reversal is a GP0 word-sum relation, suggesting a sum readout; the p7 matrix itself is formed by multiplying indices in printed words, suggesting a product readout. These two frozen direct numerical readings each produce 70 GF29 values.

No phase, key search, crib, alphabet permutation, or ciphertext-dependent selector is introduced. The standard right-rotating matrix and the transpose orientation are tested.

## Original-input outcomes

The fixed right-circulant and inverse are

```text
M = [[11,26, 8,15, 2],    M⁻¹ = [[23, 2, 5, 2,19],
     [ 2,11,26, 8,15],            [19,23, 2, 5, 2],
     [15, 2,11,26, 8],            [ 2,19,23, 2, 5],
     [ 8,15, 2,11,26],            [ 5, 2,19,23, 2],
     [26, 8,15, 2,11]]            [ 2, 5, 2,19,23]]
```

All arithmetic uses GP29 indices modulo29, in source reading order and fixed 5-unit blocks. Each output round-trips through the corresponding forward transform. Original clear p57 provides a 95-rune planted-positive check under both matrix orientations.

| Frozen original receiver | Raw IoC | Standard inverse IoC | Transposed inverse IoC | Human-readable recovery |
| --- | ---: | ---: | ---: | --- |
| 310-symbol rune stream with two hypothetical 13 boundaries | 0.03447124 | 0.03409542 | 0.03432509 | None |
| 70 printed-word GP0 index sums | 0.03395445 | 0.03395445 | 0.03312629 | None |
| 70 printed-word GP0 index products | 0.03146998 | 0.02815735 | 0.03395445 | None |

The independently solved clear p57 control has GP29 IoC approximately **0.06270997**. None of the two rune-level inversions yields recognizable prose. On the exact **40 original words of length at least four GP runes**, the unchanged ciphertext and both rune inversions yield **0/40** exact source-native GP English-lexicon matches with frequency at least five; source-preserved word boundaries were used and the lexicon was fixed before examining the outputs. Wordwise sum/product readouts are likewise nonprose when transliterated as GP29.

The 70-word observation is stronger as input geometry than a generic arithmetic count: it is based on actual printed word delimiters in the precisely marker-bounded original interval. The outcome rules out the **four fixed word-level Hill consumers** and **two fixed marker-restored rune-level Hill consumers** as ordinary GP29 prose readouts. It does not exclude a separate word-code grammar, arbitrary missing state, an altered segmentation, other orientations/transformations, or a non-English output register. Neither the two inserted delimiter values nor the circulant algebra is established as author-selected.

## Decision

Retire the six specified direct p6/p7 Hill5 receivers. The five-dot/five-word original matrix and the 70 printed-word interval remain source observations, but neither yields unknown plaintext or a typed cipher handoff. A next attempt should locate a first-party rule explaining why the word-number register or padding values should be used and specifying a reversible consumer, rather than fitting phases or other matrix variants.

**Exact reproduction:** [read-only CommonJS SFT](../sims/lp2_p6_p7_markerrestored_hill5_original_sft.cjs) consumes the canonical source corpus, ink annotation, transcription and TextBlob GP-English lexicon. [Windows Node22 initial PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44940826962) · [expanded word-level PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44940952528). Both runs used the public original ciphertext unchanged.
