# Original red225/mark31 product-parity gate

**17 November 2026, Agent18. Decision:** The original 256-cell pp49–51 number table is not the direct unweighted row/column parity extension of 225 red runes in a 15×15 interior, under either of two natural printed-grid foldings and either source-compatible numeric radix. No unknown LP2 plaintext or authentic key was recovered.

## Why this is a bounded human-solve-path test

Original-image independent censuses give **225 physically red GP29 rune glyphs** and **31 physical thirteen-dot marks** across all 58 JPEGs, including the solved last two. Therefore 225=15² and 31=2×15+1, so their sum is 16²=256. This matches the separate physical 32×8 table on pp49–51. A conventional 15×15 data square extended to 16×16 by one check symbol for every original row and column, plus a corner check, uses **exactly 31 check symbols**. The clear terminal p57 says to shed circumferences. These are reasons a human might contemplate a 16×16 product-check framing, although the 31 identical dot marks do not directly communicate variable checksum values, the three competing 256-event classes are observationally distinct, and the original page prints **32×8**, not 16×16. The premise remains exploratory.

The falsifiable direct-consumer test treats the 256 physical table cells themselves as values of that 16×16 product code. A direct XOR-byte extension requires **XOR of every 16-symbol row and column = 0**; a native-GP arithmetic extension requires **sum of every row and column mod29 = 0**. These necessary conditions are invariant to which edge carries each checksum and to transposing/rotating/reversing a completed square. They are independent of the ordering of the 225 red rune glyphs.

## Original values and exact outcome

Source: [p50 canonical base60 table](../resources/liber-primus/base60-grid.json) (32 printed rows of 8 two-character tokens). Two legal readings: base60 with the source's 60-character alphabet, and base59 with lowercase `f` omitted. Two direct page-preserving folds into 16×16: combine each successive *pair* of printed rows, or concatenate original printed row `r` with row `r+16`. Both preserve the eight-cell order inside every source row.

| Radix | 16×16 fold | XOR-zero rows / cols | mod29-zero rows / cols |
|:--|:--|--:|--:|
| 60 | adjacent row pairs | 0 / 0 | 1 / 1 |
| 60 | upper/lower row halves | 0 / 0 | 0 / 0 |
| 59 | adjacent row pairs | 0 / 0 | 0 / 1 |
| 59 | upper/lower row halves | 0 / 0 | 0 / 1 |

All eight tests reject a **complete unweighted 15×15→16×16 product checksum**; a complete positive would have 16 zero rows **and** 16 zero columns. The source-native checks were independently executed in a JavaScript runtime; [the single-file CommonJS reproducer](../sims/lp2_red225_mark31_p50_product_parity_sft.cjs) also generates known 15×15 byte and mod29 plaintext controls, adds the 31 check symbols, recovers their original data, and asserts every positive row/column condition.

## Decision and scope

**Retire** direct XOR-byte or mod29-sum 2D-product-check readings of the original p50 value table under the two literal folds; do not widen to arbitrary permutations, secret weights or invented delimiters merely to preserve the numerical coincidence. A changing-value table cipher, independently authored alternate folding, nontrivial error-correcting code, or different original event class remains open. The only decisive next input for this branch would be a first-party instruction specifying a *nontrivial receiver* for the original 225+31 events and p50 cell values.

This is a bounded negative and belongs in supporting research, rather than the authoritative established plaintext index.
