# Original LP2 word-length register: raw-Latin alternatives and a terminal-source crib

**Agent43, 12 November 2026. Evidence status:** original printed morphology + three independent reference comparisons and two explicit phrase hypotheses. **No decrypted source rune, key, author-selected alphabet or reversible original decoder.** This is a decision about what kind of plaintext register an eventual source-specified cipher needs to permit.

## Why the plain-Latin alternative deserves a finite test

The original final unknown page p55 ends with the complete repeated ciphertext words **`DJU-BEI.`**, immediately before red terminal marks. The same two complete cipher words occur at physical p27, local offset28; the final-page copy begins at p55 offset70. On p27 they are immediately preceded by `BF` and followed by `AEF-P`, so the original five-word length shape is **2,3,3,2,1**. The next already-solved physical p56 opens with the title **AN END**. In an **uncontracted Latin-letter** plaintext register, the source morphology admits the tentative reading:

- p27 **`BF-DJU-BEI-AEF-P` → `AT THE END OF A`**, length shape 2,3,3,2,1.
- p55 terminal **`DJU-BEI.` → `THE END.`**, 3+3 uncontracted letters.

These are **plausible English cribs, not solved words**. Under native GP29 transliteration, **THE** normally uses the single TH rune plus E, so its native GP word length is **two**, incompatible with a 3-rune ciphertext word under *length-preserving native-GP plaintext*. An alternate reading `AT ONE END OF A` matches the printed 2,3,3,2,1 even under native GP, demonstrating that word lengths alone cannot distinguish the candidates. A varying-state or symbol-expanding cipher could encode THE as three output runes while retaining GP-native plaintext; consequently the distinction here is only for explicitly length-preserving models.

Even under raw26 plaintext, **one stationary monoalphabetic substitution cannot yield this crib**: on p27 the same published cipher rune `B` occurs at positions26 and31, where `ATTHEENDOFA` predicts plaintext **A** and **E**, respectively. The original `F` likewise appears at positions27 and35, corresponding to **T** and **F**. A changing alphabet or keyed state is mandatory if that particular guess is right. The independent [p27/p55 state crib gate](p27-p55-ciphertext-state-crib-gate.md) rejects a different extended reused-pad model. Neither result identifies a decoder.

## Exact first-order register comparison

Use the unaltered original 2014 transcription and ignore line and page wraps, so all original hyphen-separated words remain intact. Across 55 unknown rune-bearing pages, the **2,896** printed words contain **12,956** ciphertext runes. The complete word-length histogram for lengths 1–12 and 13+ is **[83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 18, 7]**. This matches the source corpus used for previous exact word-length studies.

For three independent checked-in English references, tokenize unmodified alphabetic words, then compare **raw Latin26 character counts** against **GP29-contracted lengths**. The latter uses source-attested `ING, TH, NG, EO, OE, AE, IA, EA` contractions plus standard GP spellings. Treat each reference's histogram as a prospective fixed word-length distribution with Jeffreys half-count smoothing. The log-score difference `log P(original histogram | raw Latin) − log P(original histogram | GP29)` is:

| Reference | Number of source words | Original raw26 minus GP29 log-score, nats |
| --- | ---: | ---: |
| Shakespeare | 55,407 | **+23.15280350** |
| Gibran's *The Prophet* | 15,733 | **+67.04741483** |
| Emerson's *Essays* | 77,932 | **+91.54830708** |

A positive number means the entire original *marginal* word-length profile is closer to the uncontracted 26-letter profile **within that source**, before inspecting any cipher rune identity. The consistent preference across all three corpora gives a concrete reason to retain raw26 spelling as an alternate latent plaintext register when testing a newly source-selected cipher, especially at p27/p55. The solved p57, by contrast, unambiguously uses native GP contractions; it does **not** prove every other page must use that register.

**Critical negative control: author variation is large.** Under a cross-author, nonoverlapping-window control using 2,896-word *genuine GP-transliterated Shakespeare passages*, a classifier trained on Emerson's reference mislabels **17/19** windows as raw26. Similarly, among five *genuinely raw-letter Gibran windows*, a classifier trained on Shakespeare mislabels **4/5** as GP29. Therefore the large original log-score gaps are **not validated source-independent odds or a proof of raw26 plaintext**. They cannot exclude deliberate unusual prose, another language, a printed-word permutation, padded text, unrelated punctuation, or the native GP register itself. The manuscript's previously measured absence of native-English adjacent word-length syntax signal [is documented separately](lp2-wordlength-order-architecture.md); this unary comparison cannot repair that missing syntax.

## New exact per-word affine constraint on the source-clued terminal pair

A 29-symbol **affine GP-letter substitution independently keyed at every printed word**, `P=(a·C+b) mod29`, `a∈1..28`, `b∈0..28`, is more flexible than the stationary monoalphabetic cipher already excluded for the proposed p27 clause. It nevertheless provides a complete, exact **third-letter consistency test** for each three-rune ciphertext word, without guessing any of the 812 invertible keys.

For original `DJU` indices **[23,11,1]**, **no** affine key maps the three glyphs to raw uncontracted `THE` (GP index values `[16,8,18]`). By contrast, original `BEI` **[17,18,10]** maps **exactly** to `END` **[18,9,23]** under `a=20, b=26`. This is a fitted three-character correspondence and has no independent key selection. The apparent semantic temptation `THE END` therefore **requires a nonaffine or more complex first-word encoder**. Neither a stationary GP alphabet nor an arbitrary *separately chosen affine alphabet per word* can deliver it.

To avoid guessing alternate three-letter words, perform **every invertible a,b key** for both exact source words and compare against independently preserved raw English three-letter words from Shakespeare, Gibran and Emerson. Among all **149,072** original reference words, only **nine distinct** three-letter first-word spellings occur anywhere that could be affine decodings of `DJU`: `DEN` (6 occurrences), `MAR` (5), `TOY` (3), `HEW` (2), and `ROW, AYE, OWL, PAN, WAX` (one each). `BEI` admits **14** source-spelled second words, dominated by `END` (72), `WAR` (44), `YEA` (20), `WEB` (19), and `ARM` (15). Yet **zero** adjacent actual source three-plus-three word pairs from those three files satisfy both exact independently affine three-rune inverses. This is a finite-source negative; it does not exclude author-written phrases missing from those corpora.

The [updated original-cipher SFT](../sims/lp2_original_rawlatin_vs_gp_wordlength_register_sft.cjs) enumerates all nonzero 29-field affine scales and translations, asserts `DJU→THE` is impossible, reproduces the exact `BEI→END` key, tallies the raw-English words and all source adjacency matches, and maintains the original length-profile/cross-author controls.

**Updated decision:** this stronger **whole-word affine necessary condition** rules out one additional simple explanation of the potential final `THE END` phrase. The Latin26 crib remains a source-motivated but unverified candidate only if a genuinely different cipher source selects the operation. Do not generate new keys to rescue the first word.

## Decision and reproducibility

Retain **two live possibilities** for future **independently key-selected** decryptions: native GP29 writing as on solved pages, and raw uncontracted 26-letter writing with additional 29-rune cipher states. The original final-word analogy **THE END → AN END** supplies an attractive but currently unconfirmed original-puzzle crib; challenge it against an actual source-selected **full-page forward encoder and untouched context** before calling it plaintext. Do not use the phrase to fit arbitrary key phases or promote its semantics without cryptographic evidence.

[Standalone CommonJS original-input SFT](../sims/lp2_original_rawlatin_vs_gp_wordlength_register_sft.cjs) asserts the complete 2,896/12,956 book inventory and original word histogram, the exact original p27/p55 indices and collision, full three-reference log differences, the two cross-author failure modes, and the specific monoalphabetic crib contradiction. No unknown ciphertext position is modified.
