# Complementary p29/p30 spectral factors: canonical four-channel Jordan decomposition

**Agent 4, 17 November 2026. New algebraic readout of established original source relationships; native-GP-positive, original plaintext negative.** This investigation tests the more specific possibility that the authors' p15 matrix and the adjacent p29/p30 complement split one 4-rune ciphertext block into several separately meaningful streams. This is an original-cipher reading with a finite source-derived coordinate system, rather than an unconstrained choice of a new linear key.

## Why an intended human might try this

An earlier source calculation recovers the **signed GF(29) 4×4 matrix M** from the 16 original printed p15 Fibonacci-indexed prime differences. Its characteristic polynomial factors as `(X−8)(X−17)(X−24)²`. Separately, the **original adjacent physical p29 and p30** ciphertext polynomials have complementary factors: p29 contains `(X−24)²), while p30 contains `(X−8)(X−17)`. These facts and the original pair's exact **540=135×4** combined rune count are preserved in [the new original p29/p30 result](lp2-p29-p30-complementary-polynomial-spectral-source-gate.md). That earlier report tried a summed rank-two matrix as a Hill4 key and found no plaintext, but did not test **each resulting eigen/Jordan coordinate stream independently**.

The strongest missing premise remains that the manuscript tells a human solver to interpret its pages as GF29 polynomials and evaluate the signed p15 matrix, or to use the spectrum as a cipher. Because the roots were found through retrospective searches, their relationship cannot alone establish creator intent. Nevertheless, **independently paired source pages and a four-dimensional matrix** select a canonical, very small receiver experiment.

## Nontrivial Jordan detail

The signed original p15 matrix, in ordinary original order, is

```text
10  3 20 22
 1 22 21 25
11 17 19  7
 8 12 12 22
```

The eigenvalue 24 has **algebraic multiplicity two but geometric multiplicity one**. A diagonal eigenbasis of four ordinary eigenvectors does not exist. Its source-normalized cyclic/Jordan basis is made from canonical 8- and 17-eigenvectors, a 24-eigenvector, and a generalized 24-eigenvector whose first three entries are fixed by `(M−24I)g=v24) and fourth coordinate is zero. Selecting this pivot convention is a reproducible coordinate choice, although it is not authenticated as an original author instruction.

```text
E = [[28,1,27,1],        E^-1 = [[26,26,17,14],
     [ 4,7, 3,6],                [16, 1,25,23],
     [10,4,13,20],                [16, 2,16,22],
     [ 1,1, 1,0]]                [14, 0,24, 6]]
```

The reproducer asserts exactly over GF29 that `E·E^-1=I`, `M·E=E·J`, and the nontrivial Jordan block `J[2,3]=1` in addition to the diagonal 8,17,24,24.

For every consecutive four original GP29 runes interpreted as a 4-vector, compute `z=E^-1 c mod29`. Read all first coordinates as one independent channel, then seconds, thirds and fourths in order. Because p29 and p30 have separate source-selected eigenspaces, also test the two **source-paired two-coordinate channels** interleaved in row order. There are no chosen letter assignments, shifts, secret seeds, transpositions, optimized basis rotations, word edits, or per-page guessed parameters.

## Original-cipher evidence and native GP controls

Train a fixed GP29 trigram probability model using the first **200,000 characters** of the independent Shakespeare source, with 0.2 pseudocount smoothing and the established greedy digraph/ING/IO normalizer. Score each coordinate stream separately, compare with genuine clear p57 and heldout **308-runic English**. The p57-based positive constructs **four distinct native GP streams** of 420 runes each, maps all four into source-shaped 4-column input blocks under the exact `E` and recovers each stream under `E^-1` with **zero errors**.

| Receiver | Original runes | Raw GP trigram mean | Four separated source-Jordan channel means |
| --- | ---: | ---: | --- |
| p29→p30 continuous, word-carried | **540** | −4.30548 | −4.37090 / **−4.15664** / −4.45943 / −4.31995 |
| p33–39 intact printed chapter | **1,680** | −4.33071 | −4.23999 / −4.30315 / −4.33625 / −4.34092 |
| p54–55 source terminal chapter | **308** | −4.32950 | −4.54357 / −4.38689 / **−4.21510** / −4.52844 |

**The most immediate own-source receiver has also been checked:** the authentic p15-starting chapter has **1,894** rune symbols. Three consecutive complete-block readings are possible without inventing any padding: use the contiguous **1,892** original runes beginning at chapter offset0,1 or2 and leave the unmatched two at the opposite end. All three 473-block source windows were tested under the exact original signed p15 Jordan matrix. Their four-channel GP29 means are respectively `[-4.33253,-4.42905,-4.32882,-4.31934]`, `[-4.36230,-4.27717,-4.38253,-4.28461]`, and `[-4.39535,-4.31969,-4.33313,-4.27899]`. The best of these **twelve own-source channels is −4.27717**, with a nonlinguistic beginning `FBRIEOPEDTHYOEOBEOJRAXOEJHGXIA...`. This source-local negative is particularly important because the matrix is printed *at the start of that chapter*. The arbitrary choice of where to place two excluded rune glyphs is displayed explicitly rather than smuggled in as a decryption phase.

All 12 original channel means in the three exactly four-divisible receivers remain below **−4.15**, far from a natural GP29 reference: genuine clear p57 score **−2.47821** and a separate English heldout window **−2.44452**. Recombined two-coordinate channel means range from about −4.56 to −4.28, also ciphertextlike. For the p54–55 77-rune third channel the **IoC 0.04819** is a modest small-sample rise relative to a uniform alphabet, but its GP trigram score **−4.21510** and literal opening `BIYNGOEIARULHOEUHYBXERSFTHXRRHROFCR...` reject any claim of readable native GP plaintext. One short channel's isolated IoC rise is not decryption.

**The full finite Jordan-chain gauge has also been exhausted.** An eigenvalue24 generalized vector `g` is unique only up to adding `t·v24`; there are **29** such exact original-field choices. Each changes only the third coordinate stream by `z₂′=z₂−t z₃ mod29`. All **29** algebraically lawful gauges were evaluated under the frozen Shakespeare GP29 trigram for each original receiver, including all three original own-p15 chapter alignments. The best possible language scores across all gauge values are **−4.22613** (p29+p30), **−4.21765** (p33–39), **−3.98899** (p54+p55), and **−4.19521 / −4.15341 / −4.24060** (own-p15 phases 0/1/2). Even the overall best p54–55 gauge23 has the nonlinguistic 77-rune beginning `IAXHOUSPUATDEAJJSIAATGUNASTHEAEOEA...`. Thus the canonical Jordan interpretation does not conceal an ordinary native GP-English stream under its *entire one-dimensional generalized-eigenvector gauge family*. This full 29-gauge screen is a mathematical family completion, while source-authored use of the spectral algorithm itself remains unestablished.

Each original receiver reconstructs its **unaltered original runes perfectly** under `E` and `E^-1`. The native positive validates that a true matching algebraic channel plaintext would be recoverable. The test cannot rule out arbitrary rescaling/recombination within the eigen-subspaces, a second cryptographic stage, or non-native plaintext. Such a stage requires independent source-selected operands and a holdout rather than arbitrary hidden transformations.

## Decision

The p15/p29/p30 algebra selects an actual Jordan structure and a reversible **four-stream channel extraction**, but the canonical direct original receivers are nonlinguistic. The new geometric observation cautions against treating `(X−24)²` as two **independent** ordinary eigenvectors. It is a generalized eigenmode. Thus the simplest original “split four-dimensional ciphertext into four authentic GP plaintext channels” interpretation fails. No key, previously unknown text or destination is established.

[Exact single-file CJS source and planted check](../sims/lp2_p15_p29p30_jordan_eigenchannel_original_sft.cjs) reads only original `lp2-corpus.json` and an independent Shakespeare GP control, computes reversible GF29 matrix transformations, asserts the original eigen/Jordan relations, and checks the fixed original-language scores.
