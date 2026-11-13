# Source-moth 1033 square: 25-cell rank transposition on LP2 p55

**Agent 1, 13 November 2026. Bounded original-cipher negative.** No unknown original plaintext, independently sourced LP2 key, or cipher operation is recovered.

## Source-typed route and its strongest objection

Solved LP1 physical p5 and original unknown LP2 physical p55 share a recognizable moth illustration. LP1 p5 includes a **5×5 numeric magic square**, independently reconstructed from the original 2013 `0_wisdom` 13 rune-word GP-prime sums, with five row totals of 1033. Physical LP2 p55 contains 76 original runes: its first rune closes a cross-page word from p54, followed by **exactly 75** runes in 16 complete words. The **75 = 3×25** geometry suggests a basic transposition of the three 25-rune source blocks under the reused moth-square key.

This is a different operation from the already tested source-square GF29 Hill substitution (and all-secret period25 substitution) on the source-linked seven-word conjectural plaintext crib. The new test requires no proposed p55 plaintext at all. The key objection is that neither original image instructs a *numeric rank ordering* of the square. Its repeated values also make naive rank sorting ambiguous unless a deterministic tie rule is supplied. This finite test explicitly uses original numeric value ascending, then printed row-major to resolve ties, with the full descending order as the single symmetric sensitivity.

The frozen source square is:

```text
272  138  341  131  151
366  199  130  320   18
226  245   91  245  226
 18  320  130  199  366
151  131  341  138  272
```

Sorting all 25 cell positions, zero-based row-major, gives the unique tie-broken route:

`[9,15,12,7,17,3,21,1,23,4,20,6,18,10,14,11,13,0,24,8,16,2,22,5,19]`.

For each of three 25-rune blocks, test taking the original runes at those route positions and the exact inverse placement, in both ascending and reversed rank order. This is **four** complete fixed layouts, no block phase, alphabet, language-fit key, word changes, inserted runes or custom tie optimization.

## Original p55 and independent native controls

A fixed GP29 trigram model built from the repository's Shakespeare original text uses an independently authored language source and the canonical GP spellings, including native `IO→IA`. It gives:

| Source block | GP trigram log probability, nats/rune |
| --- | ---: |
| Original p55 75-rune body, unchanged | **−4.54270447** |
| Inverse using ascending rank path | **−4.71547232** |
| Direct ascending rank path | **−5.04122069** |
| Inverse descending rank path | **−4.71979159** |
| Direct descending rank path | **−4.79569159** |
| Actual solved p57 first 75 GP runes, language control | **−2.54084238** |

All four candidate p55 transformed outputs remain far outside the independent source-native text score. Their first 40 GP graphemes are included in the executable output and are not sustained recognizable prose.

For every candidate, an authentic independently solved p57 **75-rune native GP plant** is transposed with the exact complementary direction and recovered **75/75**. The complete p55 ciphertext is reconstructed **75/75** using the inverse source square path; the incoming p54 carry rune is not modified. This validates the permutation and correct interval, not the historical cipher hypothesis. The same script pins all four score values, source row sums, canonical runes, and routes.

## Decision

The direct **25-cell ascending/descending numerical-rank readout** of the moth-linked p55 75-rune body is a negative under these frozen instructions. It produces no usable key or unknown plaintext. The visual motif and 75-rune geometry remain source facts, though neither currently selects an authorial transposition grammar. New p55 work should require a genuinely source-indicated operation rather than more fitted permutations, offsets or 5×5 variants.

**SFT:** [`sims/lp2_p55_moth_square25_transposition_sft.cjs`](../sims/lp2_p55_moth_square25_transposition_sft.cjs), using [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), [2013 reconstructed square resource](../resources/cicada2014-openpuff-magic-squares.txt), [previous source-moth crib analysis](lp2-p55-moth-p5-terminal-sevenword-crib.md).
