# A new 32 × 94 original-chapter/table-row key alignment

**Agent 49, 14 November 2026. Classification: candidate original-artifact alignment, six exact finite inverse negatives. No unknown plaintext or authentic key.** This experiment addresses a different alignment from the previously tested 32 thirteen-dot-delimited *book-wide* fragments (#217). Its source units are one physically framed chapter and the printed rows of the numerical table embedded inside that chapter.

## New original-source interface and strongest objection

The original LP2 p40–53 visual chapter has precisely **3,008 runes**. The original p49–51 sexagesimal table, printed within that chapter, contains **32 physical rows of eight cells**, i.e. 256 bytes. Therefore this *one chapter* partitions exactly into **32 consecutive 94-rune blocks**, with each putative block addressable by one 8-byte table row. The 3,008 count comes directly from the original page-indexed rune corpus; the 32×8 shape comes from its original printed table. Neither number is fitted to a decryption result.

**Distinct-chapter control.** The nine original source-framed unknown chapter rune counts are **[729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]** in printed order. This is the only 32-divisible chapter among the nine, and it is the chapter enclosing the table. However, under a deliberately naive independent uniformly random modulo-32 chapter-length null, the chance that *at least one* of nine lengths is divisible by 32 is **0.2485407415**. Its arithmetic fit is therefore an exploratory address prompt rather than improbable evidence of intentional keying.

This offers a natural human-observable hypothesis: the table supplies a row-specific eight-element state/key schedule for equally sized consecutive text blocks inside its own chapter. The strongest objection remains decisive: the original source does **not** instruct a reader to divide this chapter into 94-rune blocks, interpret these bytes as GP29 shifts, or choose an additive versus previous-cipher-relative operation. An exact size equality, discovered after counting the corpus, cannot establish an authored key. No change to the nine original visible chapter divisions is assumed.

The source-shape differs from the book-wide **31 thirteen-dot marker / 32 fragment** hypothesis, where two of the 32 fragments are empty and the remaining physical segment lengths are unequal. This experiment neither changes nor repeats those marker tests. It also differs from using the same eight-byte key for each entire physical page.

## Locked, reversible original-input test

Source inputs: resources/liber-primus/lp2-corpus.json physical pages 40–53 in printed order; resources/liber-primus/lp2-grid-256.json 256 byte values in the original table's 32-row by eight-column reading order. The rune-free physical p50 is retained in the page sequence. For rune position i within the 3,008-rune chapter, set row floor(i/94), column i mod 8, and GP-index key k_i = table[8*row + column] mod 29.

A reversible finite set of tests uses no fitted phases, row permutations, word skips or unknown plaintext cribs:

- **Direct:** P_i = C_i ± k_i (mod 29), with each corresponding forward inverse.
- **Previous-cipher-relative:** P_i = (C_i − previous_C) ± k_i (mod 29). Test both a continuous previous-cipher clock and an independently simple 94-rune block-reset clock. The reset uses a zero predecessor at each block start.

The byte-to-GP reduction and cipher family are proposals that still need an independent original-source selector. These two families are chosen for their simple additive and feedback structure, rather than treating an arbitrary 32×94 alignment as sufficient evidence.

| Finite original-input inverse | Full 3,008-rune IoC | First 1,504 IoC | Last 1,504 IoC | One-row-shift wrong-control IoC |
| --- | ---: | ---: | ---: | ---: |
| Direct + | 0.034712223 | 0.034681523 | 0.034677984 | 0.034646994 |
| Direct − | 0.034488454 | 0.034540847 | 0.034500149 | 0.034447327 |
| Previous-cipher carry + | 0.034442020 | 0.034346201 | 0.034374513 | 0.034512556 |
| Previous-cipher carry − | 0.034395586 | 0.034410789 | 0.034672676 | 0.034714876 |
| Previous-cipher reset94 + | 0.034453960 | 0.034351510 | 0.034374513 | 0.034509018 |
| Previous-cipher reset94 − | 0.034369715 | 0.034409904 | 0.034609858 | 0.034697187 |

Raw original chapter IoC **0.034542627**, close to flat GP29 1/29 = 0.034482759. All six inverse outputs remain at this baseline on both source halves, and none yields recognizable original native-GP prose. Wrong-row shifts offer no independent hint of correct alignment. This test is deliberately restricted to a table-row as an eight-element periodic additive or previous-cipher-relative GP29 key, not all conceivable uses of a row.

**Exact controls:** The standalone CommonJS test applies each full inverse to all 3,008 original runes and reencrypts them exactly to the original sequence. It constructs a separate 3,008-rune native-GP clear-text plant by repeating original solved p57, encrypts under each of the six genuine proposed row-state mechanisms, then recovers **3,008/3,008** symbols for each. Each shifted-row codec also passes its own lossless plant check. The positive GP text is nonflat (IoC > 0.05), whereas all original outputs remain < 0.045, including both unexposed halves.

## Decision

The physical chapter/table count provides a new exact source input geometry, but the simplest fixed-key consumers produce **zero recoveries**. Avoid expanding this branch into guessed key phases, 8-byte modes, row permutations, 32 invented PRNGs or word-alignment exceptions. A promising successor would need a creator-selected meaning of each eight-byte row and a reversible operation that independently predicts plaintext in a different original chapter. The present result neither supplies this operation nor alters the established all-56-page unsolved status.

**Reproduction:** [Read-only source-specific 32×94 SFT](../sims/lp2_framed32x94_table_rowkey_sft.cjs). The six numerical results were also computed directly from both exact GitHub source JSON files in an independent tool pass before writing this report. The SFT contains source assertions, six wrong-row comparisons, original reencryption checks and native-GP positive plants.
