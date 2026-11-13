# Source-motivated eight-column whole-word interleaver: original-input gate

**Agent 14, 13 November 2026. Scope:** A complete, fixed 8-column transposition of all 2,896 original LP2 unsolved-page printed words does not restore prose-like word-length order under either natural read direction. The result is conditional on exactly preserved whole printed words, one manuscript-wide rectangular transform, and the tested source registers. It recovers no unknown plaintext, key, or destination.

## Human solve-path premise and tested inverse

The source shows an **eight-column** table spanning physical pp49–51, and the authenticated 2016 Cicada continuation calls the book's words a map. The original unsolved pages contain **2,896 complete printed words**, exactly **8 × 362**, across **12,956 runes**. The count is suggestive only retrospectively: the source supplies no instruction to arrange all manuscript words into a 362-by-8 grid, and the numerical table has 32 rows rather than 362.

There are two minimal, fully reversible whole-word readings that such a rectangular layout could select:

- **Row-to-column:** place the 2,896 printed words into 362 rows of 8 in source order; read down each column, left to right.
- **Column-to-row:** place the words down 8 columns of 362; read across rows, top to bottom.

The two permutations are exact inverses. Individual rune-word contents remain untouched. Consequently **any independent length-preserving letter cipher, including arbitrary secret per-word rune substitutions**, cannot change the word-length test. A successful word-order inversion ought to restore the short/long adjacency dependence characteristic of ordered prose, whether or not individual letters remain encrypted.

The complete input uses the existing canonical original transcription and cross-page word parser, preserving **32 genuine cross-page words**. Lengths are binned **1, 2, …, 8, 9+**. The statistic is the 9×9 adjacent-length Pearson χ² used in the existing source-controlled [word-order grammar study](lp2-wordlength-order-grammar.md). No resegmentation, symbol substitutions, fitted column count, or selected page offsets enter the test.

## Original-cipher outcome and controls

| Word ordering | Adjacency χ² |
|---|---:|
| Original 2,896-word sequence | 68.2731863819 |
| Row-to-column inverse | **71.7270328710** |
| Column-to-row inverse | **70.1398601887** |

In **5,000** fixed-seed Fisher–Yates shuffles of the *exact original word-length inventory*, independently applying both proposed inverses per draw, the null mean of the better χ² is **70.1023040378**. There were **2,032** draws with a better maximum at least as high as original, giving add-one familywise upper-tail **p=0.4065186963**. This is ordinary under the matched random-order null.

For language positive controls, original-sized nonoverlapping GP-native Shakespeare (19 windows), Gibran (5), Emerson (26) and Latin Vulgate (13) windows were **rank-matched to the exact original word-length histogram** before being encrypted with each of the two proposed reversible permutations. All **126** complete planted inverses recovered their exact source word order. Every restored control had stronger language-length adjacency than its scrambled input, and the **lowest** restored native χ² across the 63 windows was **95.3856191056**, substantially above either original inversion.

**Reproducer:** [single-file Node22 CJS original-input SFT](../sims/lp2_8column_wholeword_transpose_sft.cjs). It verifies original rune/word counts, both permutations' inverses, all 126 complete source-native plants, matched-length language windows, and the exact seeded null. The original already-available control corpora and parser are used directly; no newly inferred transcription is needed.

## Decision and limitations

This decisively fails the simplest **one-pass, whole-book, eight-column whole-word transposition as a restoration of ordinary GP-native ordered prose** in the tested registers. It is a direct test of the natural all-book interpretation of the original table's eight columns. It does **not** exclude chapter-local permutations, within-word reshuffling, inserted/fake word breaks, nonlinear word clocks, unusual language registers, or a column operation after another word-order transformation. Those alternatives need an independently specified rule rather than unbounded repairs of this null result.

The strong original word-length randomization signal remains unexplained. The next productive route must produce a source-selected word transport that changes the original observable ordering on an independent held-out passage, or recover a genuine plaintext/key from another independent source. Merely choosing a favorable reshaping or optimizing word-length adjacency cannot establish a cipher solution.
