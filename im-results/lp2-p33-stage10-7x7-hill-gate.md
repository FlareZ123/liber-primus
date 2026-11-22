# Historical Stage10 7×7/1033 square on original p33: opening rune, word-value and four-square receivers

**Disposition: all three direct original-source receivers are negative.** The 91-rune opening, the independently distinct 49-word body-to-symbol reading, and a complete 196-rune/four-square reading have now been evaluated. Neither yields any authenticated unknown-page plaintext or key. The 49-word experiment uses the actual 21+28 printed black-word split and no fitted seed. These are bounded operations only; the source does not identify a Hill cipher or a word-value alphabet.

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

Reject the direct Hill-7 transfer from the Stage10 7×7/1033 square to p33 [0,91), for both raw and totient-derived matrices and both standard vector conventions. The separate 49-word sum and length readout below also fails to decode a source-selected secondary plaintext. Subsequent full-book analysis establishes that this raw 7×7 matrix has exact order 280 = 5×56 over GF(29) (determinant 2); fixed, page-indexed, block-indexed, and matrix-orbit consumers over all 12,956 LP2 runes are also negative. See [the Stage 10 matrix-order/key-schedule report](lp1-p16-order56-pagepower-gate.md). This does not alter the bounded p33 decision. This does not rule out every possible role for the 7×7 square; it rules out this natural, clue-motivated direct Hill interpretation.

Do not rescue the branch by composing it with the already-tested Stage05 seven-column permutation. That would add a cipher layer without an independent source instruction.

## Distinct complete 49-word body receiver (Agent50, 22 November 2026)

The printed p33 source supplies **two black-text groups of exactly 21 and 28 words**, separated by its red headings. The 2014 original Stage10 square has **49 cells** in seven rows and seven columns, with each of its seven rows and columns summing to **1033**. This gives a different source-shaped operand from the raw first-91-rune Hill test above: seven consecutive rows of seven complete *words*, with the original p33 group break after row three. The **49 intact black words contain 196 actual GP runes**. Unlike the 91-rune experiment, this receiver computes one numeric symbol per printed word first and applies the historically printed square to *those 49 numbers*.

The simplest GP-specific word scalar is its **Gematria Primus prime-weight sum modulo29**, yielding the unchanged source vector:

[8,14,10,11,21,4,5,10,13,21,22,28,20,12,5,7,12,13,23,26,23,2,27,15,15,22,19,13,16,22,1,9,14,6,19,20,13,15,16,3,15,21,0,26,20,22,3,10,3]

The only two additional fixed public definitions tested are GP **index sum modulo29** and **printed word length**. Treat each successive seven-value group as a source vector; the 7×7 matrix K is the historical square reduced modulo29. Four natural orientations/operators are fully specified: each of K and K inverse, applied with the vector on the left or right. All twelve outputs are 49 GP symbols. A print-word aggregation and a 7-wide virtual line wrap are proposals; the book provides no explicit word-to-Hill instruction.

**Windows original-input execution [PASS 44974617194](https://github.com/FlareZ123/liber-primus/actions/runs/44974617194).** All twelve original outputs are nonlinguistic, with GP29 empirical IoCs from **0.025510 to 0.045918**. The especially motivated prime-word-sum K-inverse column output begins, in the standard GP transliteration:

TH C NG R X G TH U B Y S L S F J NG G T T J R I O W H A L I F E ...

Its entire 49-symbol IoC is **0.0272108844**. Reversing the matrix direction, left/right vector convention, or using the two alternative literal per-word scalars produces no recognizable phrase; all **twelve exact 49-rune reads**, including their numerical symbols, are printed by the reproducible SFT. One orientation among the index-sum reads starts W I TH T, which becomes WITH under a multigraph convention, but its next symbols D AE F J J Y ... do not continue into an intelligible message. A four-token fragment among twelve tried outputs is not independently authenticated plaintext.

Every source output passes the exact matrix forward/reverse reconstruction. A separate independently solved **p57 49-GP-rune plant** is encrypted under the *unchanged* historical matrix and recovered **49/49**, for both row- and column-vector conventions. Thus the implementation can recover a genuine instance of this operation. That positive does not select the operation for p33.

**Interpretation:** the 49-word/7×7 source alignment is real, and this historical matrix inverse is a concrete value-changing consumer that was not covered by the 91-rune or per-word Caesar experiments. Its original outputs do **not** supply an English message, key, page destination or further selected action. This retires the direct 49-word Hill readout. Further matrix transformations on these numbers require an independent author-supplied rule rather than output-guided tuning.

[Full Windows/CommonJS SFT](../sims/lp2_p33_word49_hill7_original_sft.cjs) · [Dedicated manual runner](../.github/workflows/agent50-p33-word49-hill7.yml).

## Full 196-rune four-square receiver (Agent50, 22 November 2026)

The same exact p33 typography supplies one more geometrically coherent **complete original-symbol receiver**. Its 49 black printed words have exactly **196 GP29 runes** after removing the two actual red headings, so the source's black rune stream fits **four successive 7×7 arrays of rune indices** without padding. Unlike the 49-word value reading above, this uses every printed black rune unchanged. The coincidence is moderately motivated: an independent 49-word block count and a 7×7 historical numeric square were already visible, although an ordinary word-length total near 49×4 can arise without deliberate cipher geometry.

For each of the **four complete row-major 7×7 blocks**, write the actual original GP29 index values into matrix A. Take the unchanged authentic historical 7×7 square reduced modulo29 as K. Test the exact standard finite matrix operators K or K-inverse acting on A **from the left**, from the **right**, and their literal transposes, plus K or K-inverse from **both** sides (and one right-transposed option per direction). These are **12 full 196-rune original readouts**, with no fitted key, shift, phase, row reset, punctuation normalization or ciphertext edit. This matrix-on-matrix operation differs from both a word sum or raw 91-rune direct Hill vector cipher.

The source GP29 four-square baseline IoC is **0.033543**. The full-readout IoCs span **0.032391–0.037206**, and all twelve complete original outputs are nonprose. Illustrative two naturally motivated original inverses:

- K-inverse applied to each square from the left: IoC **0.035217**, starts GP **EA AE B EO EA M L NG EA E NG G X X A D B M N U AE T A EO ...**
- K-inverse applied from the right: IoC **0.032810**, starts GP **A NG R W OE S W E Y IA A A E U EA E B G N EO Y J ...**

The best collision rate occurs for K-transposed from the right (IoC **0.037206**), still far from the solved clear-GP language signal, with prefix **E N G Y IA IA I O T EA L M O NG IA IA M P N O E S C F ...**. None yields an authenticated plaintext sentence, URL or rune key. The 49 source words' original boundaries are retained as evidence but not used as extra tunable readout breaks.

Every one-sided matrix candidate passes an exact **196/196 real solved-p57 GP29 plaintext plant**, repeated to original length, encrypted under the matching actual historical matrix and decoded by its inverse, in both row and column orientations. This genuine positive verifies that a true plaintext under this scheme would be recovered. The new run extended the existing single-file script and passed **Windows Node22 [Actions 44975331458](https://github.com/FlareZ123/liber-primus/actions/runs/44975331458)**. The producer prints all 12 original GP prefixes and whole-text IoCs.

**Decision:** the complete four-square matrix receiver is closed as a direct source-shaped Hill consumer, with no recovered key or message. A new cipher layer, reordering of the 196 source runes, secret matrix powers or additional key operands would need an independent original author clue. Combined with the prior 91-rune and 49-word results, the straightforward historical 7×7/1033 Hill routes on p33 are now exhausted without claiming that the 49-word geometry was intended by Cicada.

## Reproduction

Run from the repository root:

node sims/lp2_p33_stage10_7x7_hill_gate.cjs

The script verifies the p33 input hash, 1033 row/column sums, pinned p33/p57 baseline scores, all eight source variants, and the seeded 500-matrix negative control.

Supporting context: im-results/lp2-p33-stage05-exact-seven-column-gate.md documents the separate, source-selected Stage05 seven-column permutation test on the same p33 91-rune unit.
