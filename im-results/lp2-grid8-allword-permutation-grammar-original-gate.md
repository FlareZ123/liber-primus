# Entire 8! repeated whole-word row-permutation family: source-native language gate

**Agent 26 and Agent 14, 16 November 2026. Evidence class:** two bounded original-cipher architecture results, covering stationary arbitrary eight-word permutations and a source-derived changing 32-row key. No unknown plaintext, authentic key or continuation is recovered. Reproducer: [single-file CommonJS SFT](../sims/lp2_grid8_allwordperm_original_sft.cjs).

## Causal candidate and its weakest premise

The manuscript visibly prints a **32-row × 8-column** rectangle on LP2 physical pp49–51. Separately, the 2014 puzzle used a real seven-position row transposition at an earlier stage. One possible explanation for LP2's unusually weak ordered-word-length grammar is that each consecutive **eight whole encrypted rune words** was printed in a fixed but unknown column order. If original GP-native English words remained whole, the inverse permutation would restore a detectable statistical relationship between *successive word lengths*, before any rune-level key was known.

This is a stronger and distinct test from the existing direct 32×8 *256-word block* row/column transposition and the whole-book 362×8 *columnar* transpose: grant **every one of the 8! = 40,320 row-local permutations**, not just the source's left-to-right or top-down routes. Test a single hidden order throughout the manuscript and then grant **nine independently chosen hidden permutations**, one for each image-defined visual chapter. The source does not actually instruct either word-level operation; no permutation is assumed to be authored.

Original data: [canonical 12,956-rune LP2 corpus](../resources/liber-primus/lp2-corpus.json) with [source-preserving word parser](../sims/lp2_word_pages.cjs): **2,896 complete printed words** after joining line and page continuations, including 32 words that cross physical page cuts. Thus there are exactly **362 complete eight-word rows**. The nine visual chapters have [158,255,383,437,224,326,378,669,66] complete words; incomplete final eight-word rows in chapter-local mode remain unchanged, with the preceding-to-trailing bridge preserved.

## Frozen key-independent test

Train a seven-bin GP-native word-length Markov reference on **55,407 Shakespeare words**, normalized with the already-established Gematria Primus digraphs. Bins are lengths 1,2,3,4,5,6,7+. Each adjacent-word score is the log likelihood of that class transition divided by the class's independent base rate, with uniform 0.5-count smoothing. An ordinary native-language adjacent-length signal should produce a positive improvement relative to an exact-inventory shuffle. The scorer inspects **word lengths only**, so every possible unknown GP29 rune substitution is irrelevant.

For a fixed candidate permutation \(p\) on eight slots, its total score is a sum of seven within-row edges plus the transition between successive rows. Pre-accumulate all 8×8 possible edge contributions and enumerate **40,320** orders exactly. In chapter mode, independently optimize each image-defined chapter, keeping incomplete rows untouched. No search over alphabet keys, guessed plaintext, or source-specific words occurs.

Crucially, fit the same full set of hidden orders on **each null source**. In global mode, generate 300 seed-fixed Fisher–Yates shuffles of the **exact 2,896-word length multiset**. In chapter mode, generate 120 seed-fixed shuffles *within the same nine chapter inventories* and optimize all nine 40,320-key choices for each null. This corrects the considerable ability of an unrestricted permutation search to overfit chance.

| Fixed row-permutation hypothesis | Original best log-likelihood excess | Matched optimized nulls at least as good | Plus-one tail |
| --- | ---: | ---: | ---: |
| One hidden 8-slot order for all 362 rows | **−17.063088** (unchanged source: −51.217535) | **156/300** | **157/301 = 0.521595** |
| Independent hidden 8-slot order at each of nine visual chapters | **+33.036774** (unchanged chapter scores sum: −50.767613) | **72/120** | **73/121 = 0.603306** |

The nominal best *global* source permutation is slot order **[6,2,5,0,3,4,1,7]**, zero-based. Its best score is completely ordinary under the identically optimized null. The nine chapter-local winners differ and their aggregate score is likewise ordinary under the stronger nine-key null. These keys are **search artifacts, not candidate decryption keys**.

## Source-native positive and exact invertibility

A separate, contiguous **2,896-word Gibran** GP-normalized text (starting at reference word 1,000) is permuted in each eight-word row by the deliberately hidden order **[2,5,0,7,1,6,3,4]**. The search over all 40,320 possible inverse keys independently identifies **[2,4,0,6,7,1,5,3]**, restores the identical **2,896/2,896** source word lengths, and produces log-likelihood excess **+50.061352** under the Shakespeare-trained model. The same global source permutations re-encode and invert all original **2,896/2,896** length positions; no insertions, deletions or guessed boundaries are used.

### Changing eight-word keys from the original 32 numeric rows

The stationary-key test above permits every possible **one fixed** eight-slot permutation, including a separate key per visual chapter. A distinct, source-derived mechanism varies the word-order key on **every row**, an important uncovered possibility if a 32×8 number table really directs the manuscript's words.

For each of the original table's **32 printed rows**, sort its eight preserved base60 byte values in ascending order and break any ties by the original column index. The resulting eight column indices form a reproducible permutation. Apply row0 to the first eight complete printed words, row1 to the next eight, cycling back to row0 after 32 rows. Interpret either the sorted-column *read order* or its exact inverse, resetting its 32-row key clock either book-globally or at the nine original visual chapters. All 2,896 complete source words are retained intact. The derived first key is **[4,6,2,7,3,0,1,5]**, the second **[5,0,2,6,7,3,4,1]**. No word meanings, arbitrary keys, grid offsets or phase tuning are used.

The exact same nine-chapter adjacent word-length mutual information statistic from the original-language gate is computed in nats:

| Source-fixed order | Original whole-book word-length MI |
| --- | ---: |
| Original 2,896 printed words | **0.012156100973** |
| Numeric row-rank read, 32-row clock across book | **0.011648629641** |
| Numeric row-rank inverse, book clock | **0.011670020404** |
| Numeric row-rank read, chapter-restarting clock | **0.009963629090** |
| Numeric row-rank inverse, chapter clock | **0.008304222761** |

Every candidate is below the unchanged original language-order signal. The strongest of the four still falls within an exact-input comparison against **1,000 seeded shuffles of the eight original byte values within each numeric row**. For every shuffled table, all four inverse conventions are recalculated and the same best-of-four selection applied. **827/1,000** shuffled-table maxima equal or exceed the actual table's best score, giving plus-one **0.827173**. These nulls retain each printed numeric row's full byte multiset, including ties, while scrambling its order.

A genuinely ordered **2,896-word independent Gibran** control has GP-normalized word-length MI **0.05264067**. The actual source-table row-rank operation reduces its MI to **0.01470244**; the mathematical inverse recovers every original word length and restores **0.05264067**. Full forward/inverse identity also passes on all 2,896 original ciphertext word lengths under both reset conventions. Thus the source-table inverse is implemented correctly and has power to restore natural word order under the exact planted model.

**Decision:** the table's literal rowwise rank does not furnish a decoder for original LP2 whole-word ordering under these four source-defined arrangements. This closes a different changing-row-key branch from the stationary 8! search. Its chief unsupported premise remains the missing author instruction to rank base60 numeric cells and apply them to consecutive eight-word blocks. Future row-key modifications require new independent source selection rather than additional fitted clocks.

[Self-contained original-input CommonJS reproducer](../sims/lp2_p50_ranked32x8_wholeword_source_inverse_sft.cjs) · [successful Windows Node22 original-cipher run](https://github.com/FlareZ123/liber-primus/actions/runs/43854736421).

## Cryptanalytic decision

**Retire the entire stationary eight-word row-permutation family under preserved native-GP words, even allowing unrelated secret eight-position keys per illustrated chapter, and the separate literal 32-row numeric-rank changing-key arrangement tested above.** This is a finite, all-secret word-order obstruction. It does **not** exclude varying the key each row, true columnar transpositions, breaking/replacing word boundaries, a non-GP plaintext register, or multi-layer ciphers; no original instruction currently selects those operations.

The manuscript's numeric rectangle remains a genuine visible eight-column clue candidate, but there is no evidence that its columns permute complete words. A new route would need an independently selected *unit and operation* capable of restoring language and producing actual plaintext, rather than another fitted eight-way order. The finding complements the existing [256-word block gate](lp2-grid256-block-word-columnar-inverse.md) and [whole-book eight-column gate](lp2-original-8column-wholeword-transpose-gate.md), without redoing their source-specific tests.
