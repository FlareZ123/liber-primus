# T7 doublet-free void: 33×50 / table-83→133 hypothesis

**Classification:** intermediate structural hypothesis; no plaintext or key recovered.

## Observation

Using the canonical LP2 rune corpus, the longest contiguous interval with no adjacent equal ciphertext symbols identified by the external T7 work is the inclusive original-stream interval **2739..4388**, i.e. **1650 runes**. The corresponding half-open boundary is 2739..4389.

The two boundaries have an exact factorization:

- 2739 = 33 × 83
- 4389 = 33 × 133
- therefore the interval is exactly **50 × 33** when laid out row-major.

The void is inside LP2 pages 11–18 (the physical pages containing the tree sequence and p15's Fibonacci-prime grid). In the 50×33 layout, horizontal equality is only 3/1600 = 0.1875%, as expected from the deliberately doublet-free linear interval. Vertical equality is 63/1617 = 3.896%, and the two main diagonals are 60/1568 = 3.827% and 41/1568 = 2.615%; these are near the native 1/29 baseline and do **not** reveal an independent 2-D plaintext structure.

## Source-connected address hypothesis

There are two retrospective numbers already present in the repository's cross-artifact work:

- **83** is the zero-based p50 table cell selected by the signed-2016 "lies" address route.
- **133** is the terminal state of the 256-red-event checksum construction.

If those numbers were independently selected as stream boundaries, the T7 void would naturally be the 50-row interval between table positions 83 and 133. This is **not authenticated**: the 83/133 connections are themselves clue-level observations, and 33 is not yet independently selected as the matrix width.

The 50×33 shape nevertheless gives one finite, source-derived experiment worth recording. The p50 table has 256 bytes, so cells 83..132 inclusive are exactly **50 bytes**. That permits a no-offset hypothesis: use those 50 bytes as one row key for each of the 50 rows of the void, with the native GP29 additive operation; alternatively use the first 33 of them as a column key.

## Frozen test

Tested both original table numeric interpretations:

- conditional base-60 byte stream;
- conditional base-59 stream obtained by omitting lowercase f while retaining uppercase F.

For each, tested the fixed source-derived row/column layouts, both additive signs, and reversed key order. The best original IoC was **0.0348413180**, from the conditional base-59 stream with a reversed column key and additive +. The raw void IoC is **0.0346369701**.

That apparent lift is not discriminating: a 1000-draw matched random-key control, taking the best of the same 16 row/column/sign/reversal configurations on each draw, had median **0.0346972453**, 90th percentile **0.0348766011**, 99th percentile **0.0350383152**, maximum **0.0352022346**, and empirical exceedance **15.5%** for the observed 0.0348413180. The independent language-score screen over the same finite family was likewise flat and produced no coherent plaintext.

## Decision

This is a **useful structural lead, not a decryption**. The exact 50×33 factorization is worth preserving because it links a large nonstationary-generation anomaly to two independently discussed source numbers and to the solved-page 33/50 interior/exterior counts. But the immediate table-slice row/column Caesar interpretation is negative.

Do **not** expand this into arbitrary 50-byte key schedules, offsets, KDFs, AES modes, or fitted matrix permutations without a new source-visible operation. The unresolved question is specifically whether any authenticated clue independently selects (a) width 33, (b) endpoints 83 and 133, and (c) a role for table cells 83..132. If that bridge is found, the 50×33 void becomes a sharply testable target.
