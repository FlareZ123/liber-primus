# p10 7G / p50 table / p33–p39: current source bridge

## Source facts

- p10 contains an isolated numeral **7** immediately followed by the single-rune word **G**.
- The p49–p51 numerical table is a continuous 32×8 base-60 grid.
- The established candidate product reading is \(7\times17=119\), using G's Gematria Primus prime 17. The one-based 119th table cell is \`0Z\`, base-60 value 35; it is global row 15 / column 7 and page-local row 5 / column 7 on p50.
- The p33–p39 chapter contains exactly 1,680 runes.

## Additional coordinate hypothesis

A second reading treats “7 G” as global row 7 / column G (seventh column) of the continuous table. That selects \`2a\`, base-60 value 156, with \(\varphi(156)=48\). Together with the 119th-cell value 35:

\[
48\times35=1680.
\]

This is an attractive structural match, but not an established instruction. The table does not print A–H column labels or global row numbers. If the coordinate is page-local to p50, row 7 / column G instead selects \`1C\` = 72 and \(\varphi(72)=24\). The 48 result therefore depends on a global-grid interpretation and a chosen row origin. The 48 and 35 readings also reuse the same “7 G” clue; they are not independent confirmations.

## Tested consumers

1. **Direct period-256 table key at phase 119.** The source-shaped additive/subtractive GP29 key, both signs, fails on the original p0–p55 stream. All 50 complete candidate windows fall below even the worst held-out native-GP window. The fixed phase is not exceptional against shuffled-key controls. See [the direct phase-119 gate](../im-results/p10-7g-p50-cell119-phase119-gate.md).
2. **One 48×35 rectangle.** A single row-major/column-major transpose combined with the solved p56 prime-minus-one schedule was tested in both layer orders, both signs, and with literal-F skipping on/off. Best chapter bigram score is −4.616359, versus raw −4.707453 and held-out native −2.656791. No plaintext.
3. **48 blocks of 35, each 5×7.** The historical 2014 column order 1736254 and its inverse were combined with the p56 prime schedule. The best score is −4.608520. Exhaustive comparison over all 5,040 column orders and eight non-key variants gives familywise \(p=0.153\); the historical order is not exceptional.
4. **5×7 magic-square tensor inverse.** Already tested separately and rejected; see [the tensor report](../im-results/lp2-p33-39-stage10-magic-tensor5x7.md).
5. **Pointer chase.** The coordinate/product-derived starts enter the already documented 11-cycle with a 252/256-state basin. This does not provide a discriminating new key; see [the pointer-cycle gate](../im-results/lp2-terminal-ps-prime-mean-dual-pointer-gate.md).

The exact planted inverses pass for the new transpose tests. Their outputs remain nonlinguistic, so the negative results are not implementation failures.

## Current decision

The \(48\times35\) factorization is worth preserving as a provisional structural observation, but it has not selected a cipher or recovered plaintext. The simplest consumers motivated by the table dimensions and the known 2014/p56 operations fail. Do not continue with arbitrary permutations, phases, or extra layers. Reopen this branch only if an independent original clue selects a different reversible operation or supplies key material.

The 2014 archive's 1736254 column order is an authentic earlier-stage operation, but its transfer to LP2 is not established. Likewise, the p56 prime schedule is verified on p56, not on p33–p39. The “SKY/UDP” reading remains unsupported and must not be used to infer a port or send network traffic.
