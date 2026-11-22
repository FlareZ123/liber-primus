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

## Alternative 25-rune matrix on this new receiver (21 November)

The same two colored spans supply a materially different *complete* source key: p6 has eleven consecutive red runes at offsets71–81 and p7 has fourteen at offsets194–207, making **25 = 5×5 original red symbols**. An [independent p8/pp8–14 study](lp2-p6p7-red25-hill5-pp8pp14-original-gate.md) had already rejected this direct Hill matrix as a decoder of the next seven-page chapter. Its application to the **separately discovered p6/p7 marker-bounded 310-symbol receiver and the 70 printed-word scalar receivers** was not part of that study.

Keep all twenty-five original GP29 rune values in page reading order, without a new numeral/word offset. Form the row-major GF29 matrix:

```text
K = [[24,16,14,17,19],
     [ 6,27,15,17,14],
     [12,23, 3,22,16],
     [ 2,25, 5, 7,11],
     [14,28, 6,28,19]]
det(K) = 12 (mod 29)
```

Its determinant is invertible and the exact source-key inverse is fixed. On each of the three already selected 5-aligned registers above, freeze precisely four natural Hill5 directions: `K^{-1}`, `K`, `(K^{-1})^T`, `K^T`. All twelve operations are reversible and reencrypt their *original source registers* exactly, without secret phases, cipher fitting, additional padding or alphabet changes.

| Original p6/p7 register | Four GP29 output IoCs, in the order above | Direct GP29 prose recovered? |
| --- | --- | --- |
| 310 including hypothetical two 13-dot values | 0.035244, 0.034555, 0.034116, 0.033970 | **No; each 0/40 long printed-word lexicon hits** |
| 70 whole-word GP0 sums | 0.036025, 0.040580, 0.035611, 0.037681 | No |
| 70 whole-word GP0 products | 0.032712, 0.034369, 0.044306, 0.029400 | No |

The largest value 0.044306 is on **70 symbols**, selected from twelve alternatives; its rune string is incoherent as continuous native-GP text, so it is not a decryption. The strongest 310-rune result is only 0.035244, still close to the source ciphertext's 0.034471 and distant from solved p57's 0.062710. This source-red25 matrix therefore supplies no missing inverse on the new body/word receivers; the older pp8–14 recipient is independently negative. A source-authored further operation is needed before trying nonlinear/polyalphabetic extensions.

The expanded [single-file SFT](../sims/lp2_p6_p7_markerrestored_hill5_original_sft.cjs) now asserts the original red25 values, the exact inverse, all twelve reversals and source-first output summaries. **Windows Node.js 22 PASS:** [run 44942920631](https://github.com/FlareZ123/liber-primus/actions/runs/44942920631).

## Decision

Retire the six specified direct p6/p7 Hill5 receivers. The five-dot/five-word original matrix and the 70 printed-word interval remain source observations, but neither yields unknown plaintext or a typed cipher handoff. A next attempt should locate a first-party rule explaining why the word-number register or padding values should be used and specifying a reversible consumer, rather than fitting phases or other matrix variants.

**Exact reproduction:** [read-only CommonJS SFT](../sims/lp2_p6_p7_markerrestored_hill5_original_sft.cjs) consumes the canonical source corpus, ink annotation, transcription and TextBlob GP-English lexicon. [Windows Node22 initial PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44940826962) · [expanded word-level PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44940952528). Both runs used the public original ciphertext unchanged.
