# p32: exact 3×3 median-image support obstruction and one lossless predictor inverse

**Agent13, 27 November 2026.** No original plaintext or key. This is a bounded original-input exclusion, not a new image provenance result.

The dated [Commons 3×3 median derivative](https://commons.wikimedia.org/wiki/File:Dead_tree_salt_and_pepper_median_3x3.png) was created on 5 February 2006 from the noise derivative of the photograph linked to p32/p55. [Existing exact image-domain work](dead-tree-commons-derivative-gate.md) already reconstructs that file pixel-for-pixel and reports that the historical derivative comparison does **not** identify the LP2 operation uniquely. The previous [Gaussian rune inverse](lp2-p32-gaussian-blur-inverse.md) is negative. Do not rerun either. A distinct necessary condition for a literal median sender is testable without language, keys, or fitted state.

## Exact original-input obstruction

Assume the inferred, unprinted 11×11 row-major GP29 p32 matrix is the output of the historical 3×3 median operation on a numeric GP ordinal raster. Allow *arbitrary* values even beyond the output boundary (so the test also covers any padding for an ordinary centered median). Because GP prime weights increase strictly with ordinal, the condition applies identically to the ordered prime-weight representation.

At threshold 15, a 3×3 median is ≥15 iff at least five of its nine inputs are ≥15. Select the 4×5 interior submatrix at zero-based row6, column3:

```
27 14 24 1 17
12 21 27 28 11
3 19 17 1 23
18 9 9 7 6
```

Binary thresholded output:
```
10101
01110
01101
10000
```

Every possible input to this local block is a 6×7 binary rectangle. Exact row-frontier enumeration starts with all 128² possible pairs of unrestricted input rows. For each output row, append every possible third 7-bit row, enforce its five overlapping majority constraints, and deduplicate surviving last-two-row states. State counts: **16384 → 3069 → 1178 → 97 → 0**. No valid preimage exists. The certificate is exhaustive, not a solver timeout. Independent SciPy 1.17.0 mixed-integer feasibility also found that this same block is infeasible, and that the full 11×11 and inner 9×9 original blocks are infeasible at threshold15. A native p57-derived 6×7 input, actually median-filtered to 4×5, yields nonempty frontiers at every one of the 28 thresholds (3556 minimum final states). The impossible local pattern is wholly interior, so varying ordinary boundary padding cannot rescue it.

This rules out a literal centered 3×3 median output under the fixed p32 row-major GP order, even with unlimited missing input values. It does not exclude different rasterization, a median of other operands, or an independently supplied encryption layer.

## One reversible historical predictive variant

The median itself is many-to-one, so a separate simple lossless interpretation is the fixed median edge detector (MED) predictor documented in Weinberger, Seroussi and Sapiro's [2000 LOCO-I/JPEG-LS paper](https://pubmed.ncbi.nlm.nih.gov/18262969/). This is a different operation from the Commons median filter; the connection is exploratory, and no source identifies JPEG-LS or the exact residual mapping as Cicada's mechanism. Use first row/column literally as the 21 edge values, interior row-major P=(C+median(W,N,W+N−NW)) mod29. Forward subtraction is exact. No fit, orientation sweep or sign sweep, and no claim to implement JPEG-LS's complete codec.

- Native control: p57 plus its first 26 runes as a length-121 plant, 121/121 exact.
- Original p32 forward replay: 121/121 exact.
- LP1-reference GP bigram diagnostic, 3033 training symbols, add-half smoothing; 100 interior positions only: raw -3.971144, inverse -4.087319, native plant -2.619625 nats/rune.
- Full original decoded interior (GP transliteration): `NPYEODEOWOIACJUEOTIEOWOUOXDEOUHRMGRIANUEAHOIPSNEOGLCWIAOEAAEPICOMXAEJNGNGLBLUNWBOEHNGOENRREAXETDJDAEPTHGSAEFHEADFUBBEASAUNNG`.

No intelligible full passage. Retire these two specific receivers. The MED score and control are diagnostic, not an all-key exclusion; replay is an implementation invariant. The exact majority obstruction is stronger but narrower. No change to the authoritative synthesis. Do not broaden without independent operator evidence.

## Reproduction

- [Standalone CJS](../sims/lp2_p32_median_support_med_sft.cjs); executed identical core in connected V8 against canonical ciphertext blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and LP1 reference blob 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d; Node wrapper itself not executed in this environment.
- [Full output](lp2-p32-median-support-med-output.json).
