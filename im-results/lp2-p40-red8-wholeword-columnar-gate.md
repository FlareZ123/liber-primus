# LP2 p40–53: original red-eight key on whole-word columnar order

**Decision, 12 November 2026, Agent 7:** A frozen, 2014-style eight-column inverse applied to **complete printed rune words** in the original p40–53 chapter does not restore ordinary source-native English word-length ordering. The complete reverse and forward mapping works, including a planted genuine-prose example. No original LP2 plaintext, authentic key or further instruction is recovered.

## Distinct proposed operation and authentic input

The original page p40 opens with eight red GP29 runes, indices **[0,9,19,26,6,23,25,8]**, occupying exactly two complete printed words of lengths **3 and 5**. Sorting the eight distinct runes by GP29 index selects the fixed column order **[0,4,7,1,2,5,6,3]**. The source-visible p40–53 chapter is **3,008 runes in 669 printed words** when physical page/line wraps are treated correctly. Removing those two marked heading words leaves exactly **3,000 GP29 runes in 667 complete words**.

These counts motivate a fully specified, different test from the existing [rune-level red-eight columnar experiment](lp2_p40_red8_allsecret_columnar_entropy.md) and the separately assigned eight-column **rune** transposition plus grid-key task [#657](https://github.com/FlareZ123/liber-primus/issues/657). A whole-word rearrangement preserves every rune identity and every word length, while potentially recovering grammatical *adjacency* that the original printed sequence lacks. The same repository's [native word-length order gate](lp2-wordlength-order-architecture.md) previously found little grammatical adjacency evidence in the unchanged original.

One predeclared inverse, with no search over widths, offsets, orientations or keys:

1. Keep the source red heading as a two-word key and take the following **667 whole words** as the ciphertext.
2. Allocate eight plaintext columns of lengths **[84,84,84,83,83,83,83,83]** for an 84-row, eight-column row-major writing grid with its three last-row cells in columns 0–2.
3. In the ascending source-key order **[0,4,7,1,2,5,6,3]**, assign contiguous blocks of 84/83 original ciphertext words to the corresponding numbered columns.
4. Read the restored columns across rows to produce 667 rearranged rune words. The exact forward operation writes row-major then reads consecutive columns by the same key order. Every full word survives unchanged.

The historical 2014 solved stage demonstrates a column permutation on *characters*. It does **not** authenticate this new word-unit transfer; testing it once is a source-constrained hypothesis.

## Original-cipher result and native positive controls

Only word lengths are scored, using the repository's existing **seven-category GP word-length-bigram log-odds** detector: lengths 1, 2, 3, 4, 5–6, 7–8, 9+. The independent model texts are solved LP1 (904 GP words), Gibran (15,733), and Emerson (77,932). For each model, **2,000 fixed-seed whole-multiset shuffles of the original 667 length values** define a null distribution. A positive z would indicate restored adjacent word-length syntax. The reported upper tail is the empirical proportion scoring at least as well as the original transformed candidate, with plus-one correction.

| Fixed independently trained model | Original bits/pair | Word-columnar inverse bits/pair | z relative to original-word multiset shuffles | Upper tail |
| --- | ---: | ---: | ---: | ---: |
| Solved Cicada LP1 | −0.070485 | **−0.041811** | +0.682 | 0.250 |
| Gibran | −0.079514 | **−0.094003** | −1.942 | 0.975 |
| Emerson | −0.063229 | **−0.064049** | −0.994 | 0.838 |

The LP1-only numerical improvement is well within chance for this locked transform; two independent literary models show no improvement. In comparison, actual native 667-word controls score **+0.061444** (LP1 model), **+0.074361** (Gibran model) and **+0.009049** (Emerson model), and the artificial word-columnar encoder depresses those scores before exact recovery. Every native plant restores **all 667 whole words**, with exact reverse/forward operation on the unchanged original.

This is a grammar-discrimination failure for a particular original source-selected ordering, **not a statistical proof that the printed words are random**, that the text is non-English, or that other whole-word permutations cannot work. It does not change the previously established rune-entropy obstruction for static per-column substitutions. A different operation would require an independent instruction choosing its key, unit, clock or grid, rather than a search for a permutation with a high grammar score.

**Self-contained reproducer:** [sims/lp2_p40_red8_word_columnar_sft.cjs](../sims/lp2_p40_red8_word_columnar_sft.cjs). It reads the original fixed corpus, red-heading indices from the original corpus's p40, canonical word boundaries across page/line wraps and the three pinned control sources. Prints all numerical scores and verifies exact original and planted forward/reverse identity. No web fetch or file writes.
