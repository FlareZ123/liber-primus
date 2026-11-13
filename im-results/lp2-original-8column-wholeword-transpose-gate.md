# Source-motivated eight-column whole-word interleaver: exhaustive permutation and grammar gate

**Agent 14 and Agent 5, 13 November 2026. Scope:** The two initial natural 8-column whole-word reading directions fail, and a follow-up tests all **40,320** permutations of the eight columns with full-family matched controls and an independently trained English word-length grammar. The original remains below every held-out planted-English specimen. This is conditional on exactly preserved original whole printed words and a single manuscript-wide 362×8 word grid. It recovers no unknown plaintext, authentic key, or destination.

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

## Exhaustive eight-column permutations and held-out grammar decision (Agent 5, 13 November 2026)

The 32×8 table is a source-visible clue for **eight** columns; the observed **2,896=362×8** complete words make a 362-row word grid possible, but neither the table's 32 rows nor the signed 2016 wording selects that reshaping. The stronger test deliberately grants the model **every one of the 8! = 40,320** orders for the eight contiguous 362-word source columns, then reads across rows. A successful result could have recovered a column order even while an independent cipher obscured the letters within each word.

1. **Direct 9-class word-length association.** At each of the 40,320 orders, compute the exact 9×9 adjacent-length Pearson χ² on classes 1 through 8 and 9+. The original's optimum is **116.1555893102** at zero-based order **[6,1,7,0,4,3,5,2]**, versus original untreated χ² **68.2731863819**. The optimizer can raise the score through selection alone. In **100 fixed-histogram Fisher–Yates shuffles**, each independently optimizing all 40,320 orders with xorshift32 seed `0x3301c043`, **56/100** maxima meet/exceed this optimum; add-one full-search upper-tail **57/101 = 0.564356** (null mean **117.8353**, median **117.8891**). Thus the attractive 116-point original score is ordinary under the same exhaustive selection.
2. **Independent English-length grammar.** Train a fixed smoothed 9×9 log-adjacency association model on **19** nonoverlapping 2,896-word windows of Shakespeare, each rank-matched to the **exact original word-length histogram** before training. No original ciphertext ordering is used to learn the grammar or key. Exhaustively optimize all 40,320 source-column orders by the sum of learned adjacent-word log association. The original's maximum is **−8.1682265954**, at **[1,2,5,4,0,3,7,6]**, different from the best χ² order. In **500** fresh exact-histogram shuffled manuscripts, each reoptimized over all 40,320 orders (seed `0x3301c044`), **405/500** score at least this highly. Add-one full-family upper-tail **406/501 = 0.810379**, with null mean **−3.67878**, median **−3.67924** and 95th percentile **4.98783**. The maximized original ranks below most randomized originals.
3. **Independent positive controls.** Rank-match **5** Gibran and **26** Emerson nonoverlapping native-GP English word-length windows to the same original inventory, scramble each 2,896-word passage using a fixed unseen column key **[6,1,7,0,4,3,5,2]**, and test the complete 40,320-order inverse. The planted true key restores the exact source order in **31/31** cases. Optimizing the held-out grammar finds the true key uniquely in only **16/31**, illustrating key ambiguity, but **every one of 31/31** best genuine-English scores exceeds the original's best (**plant minimum 18.45809**, original −8.16823). This is a controlled language separation and reversible transport plant, not a recovered original plaintext.

**Decision:** The proposed 362×8 *whole-word permutation* does not reveal native-GP ordered prose, even when all column orders are permitted and selected using a separately trained word-length grammar. Optimized χ² gains are selection artifacts. An eight-column key cannot be identified from these observations. Reopening this route requires a source-visible word-layout rule or a convincingly original plaintext passage, rather than fitted word order, language, punctuation or page phases. Other segmentations, transformations of word length, or unusual plaintext languages remain outside this experiment.

**Reproduce:** [complete one-file CommonJS SFT](../sims/lp2_8column_allperm_wordgrammar_sft.cjs) uses only the shared original transcription/word parser and existing Shakespeare, Gibran and Emerson controls. It checks the complete 40,320-order search, exact histogram nulls, all 31 independently prepared planted controls and source counts. The full Node.js 22 test ran successfully under [Windows GitHub Actions 43362819027](https://github.com/FlareZ123/liber-primus/actions/runs/43362819027), including all source/corpus assertions, 100 χ²-null permutations and 500 grammar-null permutations.
## Decision and limitations

The two direct read orders and all 40,320 source-column orders are unconvincing as **one-pass, whole-book, eight-column whole-word transpositions restoring ordinary GP-native prose** under the tested controls. The exhaustive results above apply only to the specified down-column input, across-row output, and intact printed word lengths. It does **not** exclude chapter-local permutations, within-word reshuffling, inserted/fake word breaks, nonlinear word clocks, unusual language registers, or a column operation after another word-order transformation. Those alternatives need an independently specified rule rather than unbounded repairs of this null result.

The strong original word-length randomization signal remains unexplained. The next productive route must produce a source-selected word transport that changes the original observable ordering on an independent held-out passage, or recover a genuine plaintext/key from another independent source. Merely choosing a favorable reshaping or optimizing word-length adjacency cannot establish a cipher solution.
