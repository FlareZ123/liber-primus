# Physical word navigation under the authenticated 2016 clue

**Agent 2, 18 November 2026. Status: precise original-input exclusion of one literal word-walk architecture. No recovered plaintext.**

The signature-verified 2016 Cicada message describes Liber Primus's words as a map and its numbers as a direction. The solved 2014 Wisdom square provides a genuine historical precedent for assigning GP prime sums to complete words. A direct source-motivated reading is to treat each original illustrated chapter as a circular list of its printed words and move from index i to (i ± GPPrimeSum(word[i])) mod N, with N the original chapter word count. This operation and its sign **are hypotheses**: the author does not specify either a modulo index grammar or a starting word.

The intact original p0–55 source contains **2,896 complete printed words, 12,956 runes, 32 real page-crossing words**. The nine chapters have word counts **158,255,383,437,224,326,378,669,66** and rune counts **729,1145,1729,1903,1021,1433,1680,3008,308**. All are taken from the original GP29 resource, retaining the word carries.

## Exact original results

| Original chapter | Words | Duplicate destinations (minus / plus) | Longest reachable unique rune count (minus / plus) |
| --- | ---: | ---: | ---: |
| p0–2 | 158 | 65 / 62 | 94 / 161 |
| p3–7 | 255 | 98 / 84 | 144 / 294 |
| p8–14 | 383 | 147 / 140 | 207 / 185 |
| p15–22 | 437 | 158 / 159 | 241 / 250 |
| p23–26 | 224 | 86 / 83 | 190 / 274 |
| p27–32 | 326 | 122 / 117 | 216 / 185 |
| p33–39 | 378 | 137 / 138 | 191 / 225 |
| p40–53 | 669 | 245 / 237 | 291 / 327 |
| p54–55 | 66 | **25 / 22** | **85 / 132** |

Every graph has duplicate destinations. Consequently, neither sign defines a reversible permutation of all the chapter's printed words. The best start of **all 66 possible** for the physically final p54–55 chapter reaches only 85/308 (minus) or 132/308 (plus) original runes before revisiting a word. The first-printed-word starts reach still fewer, 37 and 94 respectively. The original 150-rune plaintext requirement cannot be met on that chapter by a single walk even if its starting word is hindsight-optimized. A skip-visited or deletion/reinsertion convention would be a **new operation** that requires a separate source instruction; it is not excluded.

On the independently solved p57 PARABLE body, the same literal GP-prime modular graph yields 15 distinct destinations with minus and 13 with plus among 19 original printed words. This is a source and parsing control rather than a successful historic decoder. An artificial 66-word single-cycle positive verifies the walk code can traverse every node when the transformation actually is a permutation.

[Reproducible source-only CJS](../sims/lp2_2016_physical_word_navigation_sft.cjs) asserts the actual transcript, nine chapter partitions, all eighteen destination counts, the p54–55 reachability limit and the solved-page control. It was executed on the current canonical GitHub source bytes in a V8 compatibility harness with strict assertions and passed. No native Node22 CI run is claimed.

**Decision:** Retire the exact one-step GP-prime-sum, fixed-sign, cyclic word-address model as a **lossless** nine-chapter reader. No hidden keyword, ciphertext key or plaintext can be inferred from this result. The signed instruction may refer to a selected subset, a separately declared stateful walk, or a wholly different semantic map; those possibilities remain open. The missing author-authored start, successor, skip and stop rules prevent expanding this branch into unconstrained path fitting. This is distinct from #1329's ongoing secret key-pointer search, which does not physically reorder printed words.
