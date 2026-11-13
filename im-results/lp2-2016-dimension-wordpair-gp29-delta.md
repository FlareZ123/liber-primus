# A provisional GP29 subtraction pattern between the dimension-matched source words

**13 November 2026, Agent44. Source-derived structural observation, no plaintext, authentic key, full decipherment method or historical endpoint.**

The archived 2016 signed tree carrier measures **563×569**. The previously established word-prime census fixes exactly one original LP2 printed word with each sum: physical **p0 word6**, length11, `ᚾᛖᚹᛒᚪᛋᛟᛇᛁᛝᚢ`, sum563; and **p1 word33**, length10, `ᛄᚠᛁᚾᛡᚳᚣᛠᛁᛡ`, sum569. The same carrier dimensions also match p32's top-row/left-column sums; these are correlated source selectors and are not independent authorship confirmations. See [first-two-word dimension census](lp2-2016-image-first-two-wordsum-gate.md).

## One simple pairwise readout

Because the first of these printed words is exactly one rune longer than the second, align the **last ten** of p0 word6 with all ten of p1 word33. This drops the initial original p0 rune **N** (its GP prime weight is 29, congruent to zero modulo29), while leaving every remaining rune untouched. The length alignment and choice of *GP ordinal subtraction* are **inferences**, with no source instructing their use.

Subtract the pairs by their canonical GP ordinal indices, in the original word order, modulo29:

```text
p0 suffix  E  W  B  A  S OE EO  I NG  U
p1 whole   J  F  I  N IA  C  Y EA  I IA
GP delta   W  W  W  S  B  B  S  J  J  O
indices    7  7  7 15 17 17 15 11 11  3
```

The exact source-derived readout is **`WWWSBBSJJO`**, with **four adjacent equal pairs**, including an initial `WWW`. This pattern is conspicuous but fails to form a coherent LP2 instruction or a fully source-identified key. The alternative head-ten alignment, `p0[0:10]−p1`, reads `IAEYHYIAEPFD`, which is unstructured. This makes the unprovided alignment rule consequential.

## Matched-source word-permutation comparison

To keep the source-word *selection itself* constant, fix p0's initial N, separately shuffle the **remaining ten original p0 runes and all ten p1 runes** without replacement, thus preserving both exact word histograms and their GP prime sums. Repeat their positional GP-index difference. Deterministic xorshift32 seed `0x7a35090f`, **200,000** surrogate pairs:

| Exact frozen statistic | Count / 200,000 |
|---|---:|
| First three differences are equal, regardless of symbol | **176** |
| First three are all GP-W (index7) | **15** |
| At least four adjacent equal differences, any symbol | **21** |
| First three equal, plus at least four adjacent equal differences | **5** |
| Exact GP-W prefix plus at least four adjacent equal differences | **1** |

The last event has empirical frequency **1/200,000 under this very specific null**. **It is not an authorship probability:** the choice of suffix alignment, subtraction rather than addition, the initial WWW prefix, the four-adjacency threshold and the focus on these two selected words were evaluated after seeing existing original data. The null retains exactly the two identified word sums, so it cannot correct for searching other historical numbers, page pairs or interpretations. It does suggest preserving this unusual particular readout for a future *independent source-selector* test instead of dismissing it solely as a random character run.

A direct independent cross-artifact control asks whether the same ten-difference key appears from p32's **11 original top-row** and **11 original left-column** runes, which also sum to 563 and569. Comparing the two natural ten-token trims of each axis and either additive sign gives **at most 3/10 identical source rune positions**, nowhere near an exact shared Vigenère pad equality.

## Operational consequence

If a dated source independently prescribes subtracting these two image-dimension-matched original rune words, or selecting the length difference as a key/state, this exact ten-rune output becomes a useful *withheld test*. The known 2016 text only says that words and numbers lead through the book; no authenticated source directs this pairwise subtraction or selects its use on unknown LP2 ciphertext. The string's three leading W's can tempt a web-address reading, but **no exact historically authenticated URL is supplied or recovered**. No unknown manuscript runes decrypt under this observation.

**Reproducer:** [read-only CommonJS original-source SFT](../sims/lp2_563_569_wordpair_delta_source_sft.cjs) reconstructs the exact two words from physical original transcription, checks both 2016 sums, tests the canonical GP difference, executes all 200,000 fixed-word surrogates and compares p32's authentic rune axes. It preserves the original 29-symbol rune inventory and does not fit a plaintext or cipher parameter.

**Decision:** Keep as a provisional original-source clue outside the authoritative results synthesis, with the missing author-specified pairing operation explicitly stated. A successor requires a truly **independent historical operation selector** or an **original unknown-page 40+ rune plaintext prediction**; avoid arbitrary shifts, source reinterpretations or treating a synthetic 16-character concatenation as a real onion address.
