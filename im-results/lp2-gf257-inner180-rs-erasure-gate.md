# GF(257) RS erasure interpretation of the p50 circumference split

**Agent38, 22 November 2026. Classification: source-motivated finite negative. No unknown LP2 plaintext, authentic key, or final destination recovered.**

## Hypothesis and human solve path

The original p50 numerical panel is a 32×8 array: 256 physical cells. Removing one outer ring leaves a 30×6 interior of 180 cells and a 76-cell circumference. This matches three independent source lengths:

- physical p55 contains 76 ciphertext runes;
- solved p56 contributes 85 plaintext runes;
- clear p57 contributes 95 plaintext runes;
- p56+p57 therefore supply 180 known plaintext runes.

The clear p57 instruction says that we must “shed our own circumferences.” Separately, the original p0 FFF words have GP-prime sums **257, 295, 48**, which suggest GF(257), generator **38 = 295 mod 257**, and phase **48**. The p23 ciphertext has 213 runes, and the already reported source relation is \(38^{180}=213\pmod{257}\), while \(38^{76}=146=213^{-1}\pmod{257}\).

A plausible human route is therefore: notice the 32×8 panel; shed its outer ring; align the 180 interior cells with the 180 known p56+p57 plaintext runes; use the FFF-derived field to interpolate a polynomial; and recover the 76 missing border symbols as p55. Two natural Reed–Solomon dimensions are worth distinguishing:

1. **Dimension 76:** p55 is the 76-symbol message; the 180 known interior symbols are overdetermined evaluations of a degree-at-most-75 polynomial.
2. **Dimension 180:** the 180 known interior symbols determine a degree-at-most-179 polynomial; its 76 border evaluations are the proposed p55 plaintext.

This is a deliberately narrow test, not an assertion that the creator used Reed–Solomon coding. The primary coordinate models are the literal cell ordinal and the FFF-selected field clock \(x_i=38^{i+48}\). The two natural Gematria Primus embeddings are rune index and the alphabet's prime weight. No arbitrary phase, permutation, key, degree, or word boundary was fitted.

## Frozen source inputs

- p50 shape and byte tokens: **resources/liber-primus/lp2-grid-256.json**. Its base60 byte interpretation is derived and remains a hypothesis, not a fully re-adjudicated original transcription.
- Physical page and rune counts: **resources/liber-primus/lp2-corpus.json**.
- Solved p56 and clear p57 native rune text: **resources/external/relikd-solved-gp29-native-v1.json**. This is an external solved-text transcription, not a new source-original artifact.
- The 180 known symbols are p56 plaintext followed by p57 plaintext, in page order. The 180 interior cells are row-major, excluding the top and bottom rows and the left and right columns. The 76 border cells are the complement.
- For boundary output diagnostics, both row-major extraction and clockwise perimeter traversal were evaluated. Their symbol multisets are identical.

## Results

### Dimension 76: overdetermined holdout fails

For each of the four combinations of coordinate clock and GP embedding, the first 76 interior points determine a unique degree-at-most-75 polynomial. The remaining 104 known interior symbols are an independent holdout.

| Coordinates | GP embedding | Held-out interior matches |
|---|---|---:|
| Cell ordinal | Rune index | 1 / 104 |
| Cell ordinal | Prime weight | 0 / 104 |
| \(38^{i+48}\) | Rune index | 0 / 104 |
| \(38^{i+48}\) | Prime weight | 1 / 104 |

The first held-out interior point is wrong in all four cases. None of these is a Reed–Solomon codeword of the source-selected dimension 76. The predicted border values also fail to form a complete direct GP alphabet: only 5–11 of 76 values land in the relevant 29-symbol index/prime set.

### Dimension 180: no direct GP29 border output

The 180 known interior symbols determine a degree-at-most-179 polynomial. Its 76 border evaluations produce:

| Coordinates | GP embedding | Values directly in the GP alphabet |
|---|---|---:|
| Cell ordinal | Rune index | 7 / 76 |
| Cell ordinal | Prime weight | 9 / 76 |
| \(38^{i+48}\) | Rune index | 13 / 76 |
| \(38^{i+48}\) | Prime weight | 6 / 76 |

The diagnostic reduction of these field values modulo 29 has IoC values between **0.03018 and 0.03509**. Modulo-29 reduction is not independently selected by the manuscript and is not a valid rescue of the direct mapping. Changing row-major border order to clockwise does not change alphabet membership or IoC.

### The numerical p50 bytes do not supply a simple RS coordinate system

Under the checked-in base60 byte hypothesis, the 256 p50 cells contain 161 distinct values. The 180 interior cells contain only 127 distinct byte values; **35 repeated-coordinate groups assign different known plaintext symbols to the same field abscissa**. Thus the direct interpretation “p50 byte value = x-coordinate” cannot define a single-valued polynomial for this aligned known plaintext.

A separate check treats the p50 byte values as the y-vector of a degree-at-most-179 polynomial over either cell ordinals or the FFF-selected field clock. Interpolating the 180 interior bytes predicts **0 of 76** original border bytes under both coordinate clocks. The p50 byte vector is not this simple RS(256,180) codeword.

### Implementation controls

Four synthetic positive controls—both coordinate clocks at dimensions 76 and 180—recover every withheld interior and border value exactly. The interpolation implementation therefore passes the corresponding RS reconstruction tests; the failures above are properties of the frozen original inputs, not an unvalidated arithmetic routine.

## Decision

Reject the direct GF(257) RS(256,76) and RS(256,180) interpretations under the specified source-fixed alignments and embeddings. This closes a plausible, cheap use of the exact 180/76 split, but it does **not** exclude nonlinear codes, another independently authored operation, or a different source-selected relationship involving p50's numeric values. The primary geometry-only model does not use the p50 byte values as coordinates; the direct byte-coordinate and byte-codeword alternatives fail as described.

No unknown plaintext, authentic key, or intended destination was recovered. Do not reopen this exact family with arbitrary phases, permutations, degree changes, or post-hoc symbol maps. A materially different attempt needs a new original-source instruction that selects its coordinate system or receiver before examining p55 output.

## Reproduction

From the repository root, run:

    node sims/lp2_gf257_inner180_rs_erasure_sft.cjs

The script is Node 22/CommonJS, read-only, dependency-free, and asserts the original source counts, FFF field packet, all four negative holdouts, the p50 byte checks, and synthetic positive controls.
