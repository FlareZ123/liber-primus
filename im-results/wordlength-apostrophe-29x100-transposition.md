# Original apostrophe-completed 100×29 word route: exact reversible test

**Status:** bounded original-cipher negative. No unknown Liber Primus plaintext, key, or intended transposition recovered. The candidate is motivated by original punctuation and the 29-symbol GP alphabet, and does not rely on ciphertext-fitted page or word offsets.

## Cryptanalytic hypothesis

The original unsolved LP2 transcription has **12,956 runes and 2,896 canonical whole words**. Four separately annotated original apostrophes occur immediately before the final rune of their respective three- or four-rune words, at book-global rune offsets **1,110, 5,138, 8,515, 10,089**. Treat each apostrophe as a source-visible split before the final rune. This gives exactly **2,900 tokens = 100×29**, including **87 singleton tokens = 3×29**. A recognizable human operation would now be to arrange the 2,900 tokens in a 100-row, 29-column rectangle, then read the columns instead of the rows (or its reverse), possibly alternating direction. This is a testable reversible *whole-token* transposition: it preserves all rune spellings and token lengths.

The exact original source data are `resources/lp2-transcription.txt` and `resources/liber-primus/lp2-quote-punctuation-spans.json`; the transcriber deliberately treats original physical page and printed line breaks as layout, not lexical separators. The four apostrophes are recorded in richer original-image annotations, whereas the compact transcription omits their glyphs.

## Frozen original-input inverse

The [standalone CommonJS test](../sims/apostrophe_29x100_wordtranspose_sft.cjs) derives the 2,900 lengths directly from those sources. It tests both 100×29 and 29×100 matrix orientations, column read and its reverse direction, alternating-direction column read and its inverse, and alternating-direction row read: **ten fully specified index permutations**, including equivalent readings where the two rectangle orientations induce the same mapping. Each candidate is an exact permutation of all 2,900 original tokens; none drops a word or guesses an offset.

The output is scored by the same three-category consecutive GP-word-length Pearson statistic already defined in [the established word-order comparison](wordlength-order.md): short 1–2, medium 3–5, long 6 or more. For native prose preserving the printed word boundaries and merely changing their order, a genuine inverse should restore the excess consecutive word-length dependence found in comparable authentic prose.

| Sequence / candidate | Adjacent length-category χ², df 4 |
| --- | ---: |
| Original 2,896 canonical LP2 words | **3.949446** |
| Same original words after four apostrophe splits | **4.015945** |
| Best of all ten direct 29×100 / 100×29 candidate inverses | **6.761395** |
| Exact native 2,900-word Latin Vulgate reference | **132.264098** |

The best original setting is **100×29 forward alternating-direction column read**. Every other candidate scores between **0.829464 and 5.842624**. There is no native-Latin-like recovery on the original manuscript by these direct permutations. This is a descriptive source comparison, rather than a familywise probability of arbitrary English or Latin prose. The ten tested routes include overlapping inverse/transpose descriptions and should not be counted as independent evidence.

**Positive control:** For each candidate, the test takes the first 2,900 actual word lengths of the checked-in independent, GP-encoded Latin Vulgate reference, applies the exact inverse permutation as a synthetic cipher, then recovers **all 2,900 original native word lengths** with the matching candidate and restores χ²=**132.264098**. This confirms full-length invertibility and the ability of the length statistic to identify genuine source-order restoration under the declared model. It is not an original-LP2 decipherment.

## Decision

The unusually exact 100×29 token count does **not** by itself select an effective conventional rectangular whole-word transposition. These ten natural source-constrained routes fail to recover sentence-like word-length order despite the original four apostrophe splits, so a full-book ordinary row/column route should not be repeated without a new, original-source-specified operation.

This bounded test leaves **keyed column ordering**, nonrectangular or section-local layouts, word splitting beyond the four original apostrophes, changed plaintext word boundaries, non-English/Latin plaintext, inserted cipher tokens, and non-GP payload registers unaddressed. There is no claim of a cryptographic key or decrypted passage. The next decision-grade avenue would require a source-readable rule fixing a less conventional word traversal *before* consulting ciphertext-derived linguistic scores, followed by a held-out original decryption that covers full words and repeat-bearing spans.

**Reproduction:** `node sims/apostrophe_29x100_wordtranspose_sft.cjs` on Node 22; input resources named above and `resources/control/latin-vulgate-gp-wholewords.txt`. The program asserts exact original counts, the source-native planted inverse, and the reported original χ² extrema.