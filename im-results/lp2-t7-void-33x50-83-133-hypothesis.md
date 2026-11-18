# T7 doublet-free void: 33×50 structural bridge tests

**Classification:** intermediate structural hypothesis; no plaintext or key recovered.

## Observation

Using the canonical LP2 rune corpus, the longest contiguous interval with no adjacent equal ciphertext symbols identified by the external T7 work is the inclusive original-stream interval **2739..4388**, i.e. **1650 runes**. The corresponding half-open boundary is 2739..4389.

The two boundaries have an exact factorization:

- 2739 = 33 × 83
- 4389 = 33 × 133
- therefore the interval is exactly **50 × 33** when laid out row-major.

The void is inside LP2 pages 11–18, around the tree sequence and p15 Fibonacci-prime grid. In the 50×33 layout, horizontal equality is only 3/1600 = 0.1875%, while vertical equality is 63/1617 = 3.896% and the two main diagonals are 60/1568 = 3.827% and 41/1568 = 2.615%. These latter rates are near the native 1/29 baseline and do **not** reveal an independent 2-D plaintext structure.

As a further matrix-structure control, I measured the best circular GP29 Caesar shift between every pair of the 50 rows. The mean best-shift agreement is **0.11349**, essentially the matched hard-no-repeat random null (**p=0.57**); the maximum is **0.24242**, also null-like (**p=0.38**). Thus the rows do not behave like shifted copies of a common 33-rune template.

## Two source-connected interpretations of the 50×33 shape

### 1. Retrospective 83→133 address interpretation

Two numbers already discussed elsewhere in the repository are:

- **83**: the zero-based p50 table cell selected by the signed-2016 "lies" address route.
- **133**: the terminal state of the 256-red-event checksum construction.

If those were independently selected as stream boundaries, the T7 void would be the 50-row interval between them. This is **not authenticated**: the 83/133 connections are themselves clue-level observations, and 33 is not yet independently selected as the matrix width.

A finite table-slice experiment therefore used p50 bytes **83..132** (exactly 50 bytes) as one key per row of the 50×33 void, or the first 33 as column keys. Both conditional table codecs were tested (base60 and base59, omitting only lowercase f), with both signs and key reversal.

Best original IoC: **0.0348413180** (base59, reversed column key, +). Raw void IoC: **0.0346369701**. A 1000-draw matched random-key best-of-16 control gave median **0.0346972453**, 90th percentile **0.0348766011**, 99th percentile **0.0350383152**, maximum **0.0352022346**, and empirical exceedance **15.5%**. No coherent language output was obtained.

### 2. More source-grounded 50×33 Cartesian-product interpretation

The p57 Parable has **19 body words / 88 GP runes**; removing the first and last rune of each word leaves exactly **50 interior runes**. The p55 page contributes exactly **33 boundary runes** under the source-frozen cross-page word treatment. These counts are already established in im-results/instar-circumference-edge-strip.md.

That gives a stronger reason to form a 50×33 object without relying on the retrospective 83/133 endpoints: pair one p57 interior rune with one p55 boundary rune for each cell of the T7 rectangle. The most direct source-compatible consumer is additive GP29:
P[r,c] = C[r,c] ± (I[r] + B[c]) mod 29,
with no fitted offset.

I tested the raw rune-index representation and the clue-motivated prime-mod-29 and totient-mod-29 representations, with both row/column reversals and both signs. The best character-trigram score among the 24 source-derived variants was **−5.67949** (totient representation, both keys reversed, +), while the raw void is **−5.66571**. A 500-draw matched random 50×33 row/column-key control, taking the best of the same sign/reversal family, had empirical exceedance **63.3%** for the source-derived best. No plaintext emerged.

## Decision

The exact 50×33 shape is worth preserving because it is simultaneously compatible with the observed T7 void and with solved-page source counts. However, neither the p50 83..132 row/column key nor the p57-interior × p55-boundary additive matrix produces plaintext, and the rows do not show a shared Caesar-template structure.

Do **not** expand this into arbitrary KDFs, AES modes, offsets, fitted matrix permutations, or other high-dimensional key schedules. The missing ingredient is a source-visible operation that independently selects how the 50 and 33 source streams interact (if they interact at all), or a genuine reason for the 83/133 addressing. If that selector appears, the 50×33 void is a sharply testable target.
