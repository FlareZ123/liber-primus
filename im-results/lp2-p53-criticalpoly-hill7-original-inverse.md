# LP2 p53 critical polynomial: a source-defined 7×7 candidate key for the final chapter

**14 November 2026, Agent49. Evidence class:** exact conditional algebra on unmodified original GP29 runes, followed by a complete reversible original-cipher negative. The polynomial normalization and Hill7 interpretation are **research hypotheses**. No new unknown plaintext, authenticated cipher/key, hash preimage, or destination is recovered.

## Original clue and exact construction

The original LP2 image `70.jpg` (physical p53) marks its final **51 runes** red, source offsets **128–178**, immediately before a red 13-dot separator. The following `71.jpg`–`72.jpg` (p54–55) show a distinct floral chapter totaling **232+76=308 original GP29 runes**. Red source data and boundaries are independently pinned in `resources/liber-primus/lp2-ink-annotations.json` and `lp2-corpus.json`, and the last-chapter material is already discussed in [the direct red51-key transfer study](lp2-p53-red51-p54-55-source-pad-gate.md).

A different original p39 red three-rune rubric and the p15 signed Fibonacci matrix motivated earlier work on the finite-field root **24**. Its status as an author-selected decoding instruction is unproven, and some older cross-object polynomial comparisons use inconsistent coefficient directions. This test fixes **high-first printed order for p53**, with no cipher-text fitting.

Let `H(X)` be the degree-50 GF(29) polynomial whose 51 high-first coefficients are the original p53 red GP indices, and evaluate with exact Horner arithmetic. The frozen source gives

\[
H(24)=28=-1 \pmod{29},\qquad H'(24)=0.
\]

The derivative-zero observation is a genuine original arithmetic property. Define the *hypothetical canonical critical-value normalization* `G(X)=H(X)-H(24)=H(X)+1`; it follows algebraically that `(X-24)^2` divides `G(X)`. The unique quotient `Q(X)=G(X)/(X-24)^2` has **49 GF29 coefficients**, and placing them in printed high-first row-major order yields this candidate **7×7 Hill key**:

```text
16 27  4 22 14 13  1
25 17 26 19  7 17  7
25  4  0 18 18 18 20
13 22 26 14 21 18 15
20 13 12 21 25  2  4
18 13  6 21  0 16 19
27  3 23  1  0  5 12
```

Its determinant is **17 mod29**, so it is invertible. The following unmodified p54+p55 interval has **308=44×7** runes, allowing all symbols to be processed as **44 complete seven-rune blocks** with no padding, deletion, target-dependent alignment or fitted key. This yields a mathematically complete proposed original-cipher inverse, unlike periodic additive trials on the same red passage.

**Important selector weakness:** The manuscript does not instruct solvers to evaluate p53 red runes as a polynomial, normalize a stationary point, divide twice by `X−24`, or use a Hill cipher. The exact dimension fit and invertibility are conditional coincidences until a readable, independently verifiable original plaintext appears. Once one permits *any* constant normalization after observing a stationary point, `H(24)=−1` is not an independent proof of intent. The major prospective source fact here is `H'(24)=0`.

## Complete original-cipher test

The reproducer computes the quotient *from the 51 original runes*, constructs the matrix, inverts it over GF29, and processes every rune from physical p54 local0 through the end of p55, continuously across their page boundary. The four fixed orientation/direction controls are natural row versus column-vector Hill interpretations and their reverse matrices. Nothing is optimized on target text.

| Complete seven-rune decoder | Original p54–55 IoC |
| --- | ---: |
| Unchanged source ciphertext | 0.033821227632 |
| Multiply by Q matrix | **0.034603832649** |
| Multiply by inverse Q matrix | **0.033228985998** |
| Multiply by transposed Q matrix | **0.033948136554** |
| Multiply by inverse transposed Q matrix | **0.034476923728** |
| Independently clear p57 comparison (95 runes) | **0.062709966405** |

All 4×308 outputs remain near uniform GP29, with no connected native-GP-English words/instructions. The source-first inverse begins `GOESNGRGEOBNOEYWWNFBLEOEAEEAAMMUEALHEAOMJ...`; a short accidental word inside a stream is no cryptanalytic success. All four maps precisely re-encode all **308** original runes; each also encrypts and fully recovers a separate **308-rune** planted GP-native stream assembled from already-clear p57. Those round trips establish that the candidate implementations are lossless, while the original-language failure remains decisive for the direct Hill7 interpretation.

## Research decision

Keep the p53-red `H'(24)=0` identity as a **provisional source property**, with its construction and tested inverse clearly labeled. Retire the direct 7×7 Hill-key readout on the entire 308-rune final unknown chapter: neither multiplication direction nor conventional transpose gives original plaintext. A future route requires an independent source-selected operator that chooses what to do with a critical polynomial or a source-derived key. The p53→p54 immediate-key premise by itself does not license additional arbitrary transpositions, cipher layers, or seed tuning.

**Reproduce:** [read-only single-file Node.js 22 CommonJS SFT](../sims/lp2_p53_criticalpoly_hill7_original_sft.cjs), using only the repository's canonical `lp2-corpus.json` and `lp2-ink-annotations.json`. Its assertions cover original source span identity, exact GP prime-sum witness **2262**, both zero remainders, quotient length 49, full-rank determinant17, complete 44-block readout, all original reencryption checks, and planted-known-rune recovery. No historical inputs or decryptions are inferred from the generated candidate output.
