# Rank-28 de-repeat inversion excludes short synchronized key periods

**Evidence classification:** exact, key-free necessary-condition test and finite controlled negative. Agent 25, 2026-11-10. No unknown LP2 plaintext, genuine key, cipher, or destination recovered. The current authoritative manuscript state remains [results/README.md](../results/README.md).

## Why this distinct model matters

The manuscript's severe adjacent-doublet depletion suggests an invertible channel that maps one of 28 internal symbols into one of the 28 ciphertext runes other than the immediately previous rune. Prior [keyless rank inversion](no-repeat-rank-inversion.md) showed that its output still resembles a uniform intermediate code. A further additive mask from the 256-byte numeric-grid table could plausibly hide the underlying GP-English frequencies. Testing a few table-byte orders alone would leave an enormous class of unknown grid-derived keys unconstrained.

This experiment removes the repeating key **entirely** by an equality invariant. It therefore covers every additive 28-symbol pad of the specified period, including undiscovered key values, arbitrary rotations and all grid traversals of that period, without extracting or fitting the pad.

## Exact cipher and invariant

For observed consecutive published runes C[i-1], C[i] in the original GP index order 0–28, define the two rank inverses at nonrepeating sites:

- **Sorted exclusion rank:** R[i] = C[i] − [C[i] > C[i-1]].
- **Cyclic exclusion rank:** R[i] = (C[i] − C[i-1] mod 29) − 1.

Both are integers 0–27 and exactly reverse their specified invertible no-repeat output encoder. An immediately repeated rune cannot arise from the strict encoder; all such observed sites are marked **erasures**, not converted into favorable plaintext. The first rune of every physical rune-bearing page is also excluded in both page-reset and continuous tests, a deliberate conservative choice.

Under the tested candidate architecture, R[i] = (sigma(P[i]) + K[i mod L]) mod 28, with unknown additive key values K and one fixed, arbitrary internal 28-symbol permutation sigma. At any two valid positions sharing the same key phase, R[i] = R[j] exactly when P[i] = P[j]. Accordingly, the rate of equal pairs within each key phase is independent of the key, and of sigma.

The fixed periods are **8, 16, 32, 64, 128, 256**, chosen from the numeric-table's eight columns, thirty-two rows, total 256 entries and natural subdivisions. Both key-pointer scopes (physical-page reset or globally continuous) and both rank inverses are tested, **24 family members**. For a fair comparison across unequal pair counts, the maximum over the family is calibrated with 300 independent random circular page rotations. Rotations retain each page's rune values and almost every immediate transition; they destroy global and page-start key-phase synchronization.

## Original-manuscript results

The source corpus is the canonical 55 rune-bearing, still-unknown LP2 pages: **12,956 ciphertext runes**. Dropping 55 page-first runes and 86 within-page doublets leaves exactly **12,815 valid rank observations**.

| Statistic | Observed |
|---|---:|
| Highest raw same-phase equality (cyclic, page-reset, period 256) | **0.0360495992**, from 23,514 / 652,268 ordered pairs |
| Highest nominal standardized excess (cyclic, continuous, period 64) | **z = +2.5446056**, rate 0.0360098067 |
| Uniform 28-symbol reference | 1/28 = **0.0357142857** |
| Familywise 300 page-rotation calibrations, max nominal z | **p = 0.5946844** |
| Familywise 300 page-rotation calibrations, max raw rate | **p = 0.6378738** |

All 24 candidate configurations lie between approximately **0.03549 and 0.03605**. No 28-rank periodic additive mask produces the large phase-equality excess that ordinary English-like GP plaintext would require.

## Genuine plaintext positive controls

The 300,000-character repository Shakespeare reference is transliterated with the established GP digraph rules, with rare EA folded into the 28th code. Its first 12,956 code symbols are encrypted through a **genuine arbitrary 256-position mod-28 pad**, once per rank convention and page/continuous key-pointer scope. The encoder receives the original LP2 page lengths and deliberately overwrites **exactly the original 86 doublet positions**, which the key-free inverse discards. The true pad is never supplied to the equality test.

| Synthetic setting | Exact recovered phase equality |
|---|---:|
| Sorted rank, page reset | **0.0613674134** |
| Sorted rank, continuous | **0.0609456335** |
| Cyclic rank, page reset | **0.0613674134** |
| Cyclic rank, continuous | **0.0609456335** |

Every planted English-like source is separated from LP2 by a large margin, even with the genuine original positions of adjacent doublets treated as erasures. The test is powered for this exact reversible architecture, whereas the original text is indistinguishable from phase-unsynchronized controls.

## Precise exclusion and remaining paths

This rules strongly against **ordinary GP-English 28-code plaintext, passed through either specified no-repeat output rank encoder, with one fixed interior output alphabet and an arbitrary synchronized repeated additive 28-key of period 8, 16, 32, 64, 128 or 256**. It also makes naive 256-entry table-derived periodic masks unpromising under these assumptions.

It does **not** exclude irregular skip pointers, per-word or per-section *independent* keys, time-changing outer glyph permutations before rank inversion, any unmodeled reversible handling of the doublet sites, a different exclusion ordering, transpositions, or a flat intermediate code preceding another encryption layer. Even a genuinely random-looking rank stream is compatible with many cryptographic mechanisms. Neither this statistic nor the planted proof recovers an actual LP2 source rune.

Reproduce using the self-contained deterministic CommonJS [program](../sims/no_repeat_periodic_key_phase_invariant.cjs), the committed [original LP2 numeric corpus](../resources/liber-primus/lp2-corpus.json) and [Shakespeare control](../resources/control/shakespeare_first300k.txt). The program asserts page/rune/doublet counts, prints all 24 original scores, all four positive controls, and the 300-sample rotation calibration with seed 0x28256225. No added workflow or dependency is necessary.
