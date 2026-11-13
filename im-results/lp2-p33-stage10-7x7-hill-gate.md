# Direct Hill-7 transfer from the 2014 Stage10 7×7/1033 square to LP2 p33 [0,91)

**Disposition: negative; retain as a closed, bounded test.**

## Hypothesis and selection

The original 2014 Stage10 material supplies a 7×7 magic square with every row and column summing to 1033. LP2 p33 has a source-visible 91-rune titled unit, exactly 13 blocks of seven. Treating the 7×7 square as a Hill key over the 29-symbol Gematria Primus alphabet is therefore a recognizable, finite operation worth one direct test.

This is only a hypothesis: the historical source asks for a 7×7 square but does not explicitly say to use it as a Hill key. The test was deliberately restricted to direct block-Hill interpretations. It does not justify adding a Stage05 transposition or another cipher layer after failure.

## Frozen inputs

- Key source: resources/cicada2014-openpuff-magic-squares.txt, the unique 7×7 block (all row and column sums 1033).
- Ciphertext source: resources/liber-primus/lp2-corpus.json, page 33, original interval [0,91).
- Input length: 91 GP29 symbols; 13 complete seven-symbol blocks; no padding.
- Input byte SHA-256: b1b5e2158180d53991b59b4063955f9dd29b36c273d6bc96c14d766934ed7b2a.
- Language control: resources/control/duko_round27_english_quadgrams.txt (Git blob SHA da56c2e11e004ad24454750dba8fbe2e19abbc71).
- Scoring is the repository's existing Duko quadgram score: concatenate the corpus's native GP transliterations, sum log10((count || 0.01) / total) over four-letter windows, and divide by the number of windows.

## Fixed operations

Two matrices were considered:

1. K = square mod 29.
2. Kφ = φ(each square cell) mod 29, motivated by the manuscript's explicit prime/totient language.

Both are invertible over GF(29): det(K)=2 mod 29; det(Kφ)=9 mod 29.

For each matrix, test only the standard finite Hill variants: apply K or K⁻¹, with row-vector or column-vector convention, independently to each seven-rune block. No fitted offsets, phase search, padding, word-boundary changes, or chained ciphers.

## Results

| Key matrix | Operator | Vector convention | Mean log10 quadgram score |
|---|---|---|---:|
| Raw K | K⁻¹ | Column | **−7.1963379338** |
| Totient Kφ | K⁻¹ | Column | −7.3084933646 |
| Raw K | K | Column | −7.3441650190 |
| Raw K | K | Row | −7.3711358283 |
| Totient Kφ | K | Column | −7.6547138925 |
| Totient Kφ | K | Row | −7.6674422945 |
| Totient Kφ | K⁻¹ | Row | −7.7045923153 |
| Raw K | K⁻¹ | Row | −8.0235848005 |

Controls:

- Original p33 [0,91) ciphertext: **−7.5142604490**.
- Solved p57 positive control (95 runes): **−4.4206334171**.
- The best Hill-7 output is still 2.776 log10 units per quadgram below the solved control and does not form readable text.

The modest improvement over raw p33 is not discriminating. A deterministic control generated 500 random invertible 7×7 matrices (seed 0x3301), testing each matrix and its inverse under both vector conventions: 2,000 scores.

| Random-control statistic | Score |
|---|---:|
| Minimum | −8.2330898094 |
| 5th percentile | −7.9226414105 |
| Median | −7.5165355839 |
| 95th percentile | −7.0635655459 |
| 99th percentile | −6.8945623701 |
| Maximum | −6.5740147042 |

The best source-selected Hill-7 score is at the **88.45th percentile** of random controls; random matrices exceed it, including the random maximum. The score gain is therefore ordinary search variance, not evidence of plaintext.

## Decision

Reject the direct Hill-7 transfer from the Stage10 7×7/1033 square to p33 [0,91), for both raw and totient-derived matrices and both standard vector conventions. This does not rule out every possible role for the 7×7 square; it rules out this natural, clue-motivated direct Hill interpretation.

Do not rescue the branch by composing it with the already-tested Stage05 seven-column permutation. That would add a cipher layer without an independent source instruction.

## Reproduction

Run from the repository root:

node sims/lp2_p33_stage10_7x7_hill_gate.cjs

The script verifies the p33 input hash, 1033 row/column sums, pinned p33/p57 baseline scores, all eight source variants, and the seeded 500-matrix negative control.

Supporting context: im-results/lp2-p33-stage05-exact-seven-column-gate.md documents the separate, source-selected Stage05 seven-column permutation test on the same p33 91-rune unit.
