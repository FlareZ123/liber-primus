# Exhaustive two-tap affine feedback, distant lags 2–2048 and 3301

**Classification:** controlled computational exclusion of an explicitly finite, nonconsecutive-lag feedback family. It does not decrypt Liber Primus.

## Hypothesis

Test ciphertext feedback with two taps, one at the immediately preceding rune and the other at an unknown, possibly distant position L. In the original 29-symbol Gematria Primus alphabet the inverse takes the form

```
P_i = (C_i - a*C_(i-1) - b*C_(i-L)) mod 29
a in 0..28
b in 1..28
L in 2..2048, and 3301
```

The table of **2,048 distinct lags** includes 13, 29, 1033, 1729 and the additional long-distance anchor 3301. Each lag has **29 × 28 = 812** coefficient pairs, so **1,662,976 distinct keys** were exhaustively evaluated. The excluded b=0 case is the one-tap class studied elsewhere. An affine multiplier and constant shift in plaintext output are invisible to the index-of-coincidence (IoC) statistic and thus included modulo that equivalence.

The rune input is the full **12,956-rune** LP2 ciphertext flattened across the 55 rune-bearing pages in manuscript order. For each L, the decoder skips the first L positions and scores the rest; no page-reset or word-reset interpretation is assumed. The objective is maximum decoded IoC, with no language-model tuning or unconstrained candidate generation.

## Observed result

The best of 1,662,976 candidates was

```
L = 961
a = 8
b = 12
decoded positions = 11,995
IoC = 0.03462740123709208
```

This lies close to the uniform 29-rune baseline 1/29 ≈ 0.03448276. Other top candidates, at lags 1129, 871, 1047 and 1181, clustered between 0.034622 and 0.034627. None exhibits the unigram concentration expected for LP1-like English.

## Controls and interpretation

**Positive plant.** Concatenate the **3,101 letters** of the solved English reference, then encrypt under the same two-tap equation with (L,a,b) = **(137,7,19)** and zero values for initially unavailable ciphertext. Exhaustively score the same keyspace (1,662,164 valid candidates, since lag 3301 exceeds the plant length). The exact planted tuple returned **global rank 1**, with decoded **IoC 0.0672600398**. The next strongest candidate was **0.0359477124**, far behind.

**Matched-random null.** Three pre-seeded 29-symbol sequences were generated with the exact LP2 page lengths and the observed soft repeat probability 86/12901. Each was flattened and exhaustively rescanned. Their strongest IoCs were **0.0346455199, 0.0346385843, and 0.0346542130**, all higher than the real LP2 best. With three null replicates this is a descriptive bound, not an extreme-tail p-value. The entire search optimized the same objective on observed ciphertext, simulated controls, and planted material.

**Finding.** There is no positive evidence of a two-tap affine ciphertext-feedback inverse within this tested lag and coefficient family for LP1-like English. This extends the earlier one-tap arbitrary-alphabet/lag tests without claiming to exclude unknown additional editing or keystream layers.

## Reproducibility

- [Python 3.12 / NumPy 2.3.5 implementation](../sims/two_tap_feedback.py)
- [Successful on-demand GitHub Actions run 42740092990](https://github.com/FlareZ123/liber-primus/actions/runs/42740092990)
- [Pinned LP2 and solved-English source loader](../sims/homophonic_information_bound.py), validating Git blob SHA-1
- Full-search null seed: **3301**

Excluded b=0, unknown mod-29 nonlinear functions, dynamic coefficients, intermediate alphabets, encrypted or plaintext-keyed state, added streams, and output transformations that can suppress/alter cipher doublets are outside this experiment. The relative lengths of the processed suffixes vary by lag; the matched null scans use identical suffix lengths and the same maximum-selection process.
