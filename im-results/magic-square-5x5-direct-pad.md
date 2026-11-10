# LP1 5x5 magic square as a direct GP29 pad and Hill matrix for the LP2 five-dot pages

**Classification:** two source-motivated, positive-control-backed bounded negatives. No unknown LP2 plaintext, authentic key, or continuation recovered.

## Human-visible solve-path hypothesis

LP1 original scan 05 contains a concealed 5x5 numerical magic square. LP2 physical pages 7 and 23 reuse the same five-dot stencil under an exceptionally close vertical reflection: original scans 24 and 40. The shared five-point artwork is documented in black-dot-template-reflections.md; the numerical square and its reversed-hex container are documented in jpeg05-palindromic-magic-square.md.

A solver could reasonably connect the two five-based structures and ask whether the LP1 square supplies a 25-symbol key. The most economical direct GP29 interpretation is to reduce each square cell modulo 29, read p7 in the original row-major orientation, and vertically reflect that key for p23. This is a hypothesis, not an established authorial instruction.

## Frozen source key

The LP1 square is:

| 272 | 138 | 341 | 131 | 151 |
|---:|---:|---:|---:|---:|
| 366 | 199 | 130 | 320 | 18 |
| 226 | 245 | 91 | 245 | 226 |
| 18 | 320 | 130 | 199 | 366 |
| 151 | 131 | 341 | 138 | 272 |

All five rows, five columns, and both diagonals sum to 1033.

The row-major GP29 key is:

**[11,22,22,15,6,18,25,14,1,18,23,13,4,13,23,18,1,14,25,18,6,15,22,22,11]**

The vertical-reflection key used on p23 is:

**[6,15,22,22,11,18,1,14,25,18,23,13,4,13,23,18,25,14,1,18,11,22,22,15,6]**

The square begins and ends with the same cell value, so both natural key lengths were tested: 24 (omit the repeated closing cell) and 25 (include all cells). No arbitrary starting phase or unknown rune permutation was fitted.

## Exact inverse tested

For each original page, the tested model is:

C_i = (P_i + s K_j) mod 29

where s is either sign and the key pointer starts at the square's first cell on each page. A key draw is rejected only when it would reproduce the previous published ciphertext rune; the pointer then advances and tries the next key cell. The Viterbi inverse allows zero, one, or two rejected draws per output rune and penalizes each rejection by 3.5 log units.

The page-7 and page-23 orientations are fixed by the source artwork, not chosen from ciphertext scores. The language model is a Gematria Primus bigram model trained on the first 78% of the repository's Shakespeare reference; the final 22% supplies independent synthetic controls. GP digraphs use their corresponding single runes. For scoring only, Q/K map to C, V to U, and Z to S.

## Original LP2 results

| Page | Source-fixed orientation | Best period | Sign | Best score (nats/rune) | Inferred rejected draws |
|---|---|---:|---:|---:|---:|
| 7 (208 runes) | Original row-major | 24 | +1 | **−4.963645** | 4 |
| 23 (213 runes) | Vertical reflection | 24 | −1 | **−4.784409** | 2 |

The best previews remain nonlinguistic. Page 7 begins **YEAIATJYNTRXRWUIALGHIAEIPIAHHWIAP...**; page 23 begins **WIFXBOALGGRAELURSALTXAFEOXEYCFME...**.

## Positive controls and decision

Twenty-four synthetic controls use 12 independent held-out Shakespeare GP windows of the same 208/213-rune lengths, encrypted with the exact candidate key, both periods, both signs, and the same collision-rejection rule. The unchanged inverse recovers **18/24 controls exactly**; every remaining control is within four runes. Mean planted score is **−2.717337 nats/rune** (range −2.841743 to −2.619932). The original best scores are about 2.1–2.2 nats/rune worse than the planted mean.

**Decision:** the direct, source-locked interpretation of the LP1 square as a repeating additive GP29 key for p7/p23 is not supported. This is a useful rejection of the simplest five-dot ↔ 5x5-square solve path. It does not exclude using the square as a transposition, state seed, nonlinear key source, or part of a further cipher layer; those would require independent instructions rather than free parameter expansion.

## Second natural interpretation: 5×5 Hill cipher over F29

The same 5×5 object is not only a 25-symbol sequence; it is also a literal square matrix. Reducing its entries modulo 29 gives:

| 11 | 22 | 22 | 15 | 6 |
|---:|---:|---:|---:|---:|
| 18 | 25 | 14 | 1 | 18 |
| 23 | 13 | 4 | 13 | 23 |
| 18 | 1 | 14 | 25 | 18 |
| 6 | 15 | 22 | 22 | 11 |

Its determinant is **3 mod 29**, so it is invertible and a valid 5-symbol Hill key over the GP29 field. This is a more natural use of the 5×5 square than treating its entries only as a repeating pad. The source-fixed p7 key is row-major; p23 uses the vertically reflected matrix indicated by the five-dot mirror.

Tested 40 bounded inverses: for each page, the source-fixed matrix and its transpose (row/column-vector convention), direct multiplication and inverse multiplication, and all five possible 5-symbol block phases. Incomplete leading/trailing symbols are left unchanged; no padding is guessed.

| Page | Best of 20 | Best bigram score (nats/rune) | IoC |
|---|---|---:|---:|
| 7 | Printed matrix, direct, phase 3 | **−4.864048** | 0.037022 |
| 23 | Transpose of reflected matrix, direct, phase 1 | **−4.858036** | 0.034458 |

These are not source-consistent settings: the two pages prefer different operations and phases, and the best scores remain far below held-out English GP controls (−2.6823 and −2.6903 nats/rune; IoC 0.06429 and 0.06506). The natural phase-zero results are weaker still: p7 −5.109939 and p23 −4.906512 nats/rune.

All **40/40** synthetic Hill plants recover exactly under the same matrix, orientation, operation and phase used to encrypt them. Thus the inverse is functional; the original outputs are the failure.

**Decision:** the direct additive pad and the 5×5 Hill-matrix interpretation are both unsupported for the p7/p23 five-dot pages. The determinant and visual five-based correspondence are real structural facts, not evidence that either proposed cipher was intended.

## Reproduction

Run node sims/magic_square_5x5_gp_pad_inverse.cjs from the repository root with Node.js 22. The script reads only resources/liber-primus/lp2-corpus.json and resources/control/shakespeare_first300k.txt, asserts the square's 12 magic sums and the two original page lengths, executes the four source-fixed additive-pad models per page with 24 deterministic planted controls, then tests 40 source-oriented Hill inverses with 40 exact synthetic controls. It has no external dependencies and does not write files.

This is intermediate evidence, not an established decryption; the authoritative results/README.md is therefore unchanged.
