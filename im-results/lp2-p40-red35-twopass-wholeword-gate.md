# Original p40 red 3|5 heading: source-ranked two-pass whole-word columnar inverse

**Intermediate result, 12 November 2026, Agent 7.** A source-constrained two-pass whole-word columnar reading yields a small exploratory syntax increase against two literary controls, but **no convincing three-control familywise result**, authentic plaintext or source-derived crypto key. Full original-word and native-source plants invert exactly. Keep this as a bounded candidate retirement, not an established decipherment.

## Why this is a different cipher decision

The original red p40 eight-rune heading is already recognized as a key-like set of distinct runes, GP29 **[0,9,19,26,6,23,25,8]**, with an exact 3|5 break between two *complete printed words*. The full p40–53 chapter contains 669 complete source-preserved rune words / 3,008 runes. Removing those two heading words leaves 667 source words / exactly 3,000 runes. The distinct 3+5 grouping motivates trying its two respective column orders rather than treating all eight runes as one key. This is a hypothetical transfer of the historically attested 2014 character-level columnar operation to whole LP2 words; no independent Cicada direction says to perform that transfer.

Rank the red triples by the actual GP alphabet, obtaining 3-column order **[0,1,2]** and 5-column order **[1,4,2,3,0]**. Each word operation is the exact classical ragged-column inverse: under a hypothetical original row-major plaintext of 667 words, the three-column layout has column lengths [223,222,222], while the five-column layout has lengths [134,134,133,133,133]. Read source ciphertext columns in sorted red-rune key order, then restore original rows. Keep each printed rune word intact.

Apply the following fixed finite set, with no free cipher key, offset, reset or reorder learned from word scores:

1. Original 667 words, unchanged.
2. One 3-column inverse.
3. One 5-column inverse.
4. **3-column inverse followed by 5-column inverse** (natural 3|5 written order).
5. 5-column inverse followed by 3-column inverse.

The two-pass 3→5 result is the nominal candidate. A source-shaped planted forward encoder and both exact inverses recover **all 667 words** for the original and an independent 667-word slice from each of three GP-normalized English sources. Every rune word and boundary is accounted for. This family is distinct from [the original p40 eight-column whole-word test](lp2-p40-red8-wholeword-columnar-gate.md), Agent39's eight-column *rune*-level table-key inversion, and the separate static-column-alphabet entropy obstruction.

## Frozen original-word order test

Evaluate exactly the existing seven-category word-length bigram log-odds model (length groups 1,2,3,4,5–6,7–8,9+) trained separately on held-out GP-native controls: solved Cicada LP1, Gibran and Emerson. Each original candidate has the same 667 words and identical length multiset. Use a **20,000-trial xorshift32 seed 0x33553355 exact-original-word-length-multiset shuffle null**, applying *all four operators* and all three models to the same shuffle. We compare the three-model mean of standardized scores, then take the **largest improvement across all four transformations** in each shuffle as the familywise statistic.

| Independently trained model | Original score (bits/pair) | Two-pass 3→5 (bits/pair) | Two-pass z vs matched null | Single-model upper tail |
| --- | ---: | ---: | ---: | ---: |
| Solved Cicada LP1 | −0.070485 | −0.056398 | **−0.302** | 0.62022 |
| Gibran | −0.079514 | −0.030213 | **+2.340** | 0.01030 |
| Emerson | −0.063229 | −0.022473 | **+2.368** | 0.00920 |

The two literary models move in the same positive direction. The author-native LP1-trained model does **not** detect an improvement over the matched shuffle background. It is essential to include this discordant author-native model in the final result rather than cherry-pick two impressive values.

- Three-model mean normalized score: **+1.46848472**.
- If 3→5 alone had been predeclared, the matched upper tail is **0.03094845**.
- Across the source-plausible family of *four* full-word operators, the calibrated **familywise upper tail is 0.11584421** (20,000 matched trials).
- A retrospectively selected Gibran/Emerson-only average would produce a much smaller tail; that choice was inspected after seeing the model results, so it is **not** an independently justified discovery or plaintext prediction.

The original is therefore within the familywise null range under the primary three-reference criterion. These statistics are conditional on the finite family and exact control selection, not puzzle-wide discovery significance. Changing the punctuation, sorting direction, word clock, reference texts or boundary resets after observing the result would turn this into a new fitted search.

## Research decision and boundary

**Do not advance this word-level two-pass route as a direct native-English source recovery** on current evidence. A strong future update would require a separately source-selected reason that original LP2 encodes two sequential *whole-word* columnar operations plus an independently predicted segment or decoder, followed by substantial original plaintext or source-selected key recovery. The symbolic page architecture remains unknown, and this word-order test does not constrain other encryptions of letters or different intermediate languages. Numerical improvement of word lengths alone is insufficient.

**Reproduce:** [single-file original-source and three-English-control SFT](../sims/lp2_p40_red35_twopass_word_columnar_sft.cjs); run manually in [Manual Cryptanalysis - Word Lengths](../.github/workflows/manual-word-length-probe.yml) with scan_mode 'p40-word-red35', which also executes the initial eight-column whole-word gate. Original-source data are read directly from resources/liber-primus/lp2-transcription.txt and the canonical rune index corpus. No file writes during the test.
