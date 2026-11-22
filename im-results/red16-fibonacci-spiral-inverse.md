# Sixteen LP2 red spans as a Fibonacci-spiral 4×4 source key

**Evidence class, 10 November 2026, Agent21: two exact original-source inverses and independently planted positives, both bounded negatives. No recovered unknown LP2 plaintext, authentic key, cipher, or destination.** The 16-spans/16-cells connection was recognized retrospectively, and has no established historical significance.

## Source and matrix

The complete original ink annotation gives **16 red spans** on unsolved physical pages 0–55, totaling **213 red runes**. Their GP-prime sums in source order are:

```text
662 742 137 661 766 446 638 430 786 1109 379 295 173 435 2262 597
```

Place these 16 values modulo29 along the source-verified clockwise Fibonacci spiral on the **4×4 square printed on physical LP2 page15**, starting at (row1,column1). This yields the invertible 4×4 matrix:

```text
 0 24  3  7
11 24 17  2
12 23 21  5
17  0  0 28
```

It has determinant **13 modulo29**. No original manuscript instruction establishes this operation or even that the 16 coloured spans belong to one key.

## Experiment A: direct four-rune Hill inversion

[Runnable complete source](../sims/red16_spiral_hill_inverse.cjs). Test **48** fixed alternatives: rune-counts or prime sums for entries, spiral or reversed spiral or simple row order, page reset or global book position, and four block-start phases. The heldout source-trained Shakespeare-GP language model trains on the first 60% of a fixed 300k-character reference. Original pages0–27 (**6,761** runes) select the model; pages28–55 (**6,195** runes) are untouched.

The original best-training model is **span-length, row-major, physical-page reset, phase2**. It has **−0.8502884** GP log-likelihood gain per train rune and **−0.8910825** per withheld rune, with heldout rune IoC **0.03448332** close to uniform 1/29. No readable original text emerges. The retrospectively selected best heldout model still scores **−0.8614805**, with no language signal.

**True-key positive:** encrypt 12,956 heldout GP-English runes with the true prime-sum spiral/page/phase2 model. The blind 48-way source-language ranker identifies it first on training, restores **12,956/12,956** true runes and exactly re-encodes them. Original ciphertext also round-trips for any inverse key and is not itself evidence of correctness. [Passed original-and-positive CI 42804852464](https://github.com/FlareZ123/liber-primus/actions/runs/42804852464).

## Experiment B: nonlinear-output 4D F29 state and solved-native key recovery

[Runnable original-corpus and synthetic inverse](../sims/red16_spiral_4d_native_crib.cjs). Interpret the **prime-sum spiral matrix above** as the state transition `S[t+1]=A*S[t] mod29`, with four *unknown* initial state entries and continuous book-global clock. Its first coordinate is a GP29 differential cipher key reduced mod28. Hypothetical plaintext GP **EA (28)** emits a repeated ciphertext rune; any other GP symbol `p` emits nonzero predecessor step `15^((p+K[t]) mod28) mod29`. Physical-page initials use additive mod29 seeds. The selected row-matrix first-coordinate output tap is F29-observable (determinant8). This red-matrix construction is conjectural, and so are the EA/differential semantics.

The original **86** adjacent-equal ciphertext pairs supply possible EA markers. Four other letters in solved-author words `REALITY, REALITIES, AETHEREAL, UNREASONABLE, REASON` solve exactly for four unknown state coordinates. The complete original 5-word × 86-marker search produces **466** four-letter fits and **375** distinct state keys. The strongest native-author GP unigram ratio is **−0.8611235** nats/rune relative to uniform, with no readable output.

A **full-search disjoint-site calibration** is decisive: first exclude *all* rune positions and candidate marker sites used to fit each four-coordinate state, then require exact native-author words at distinct, unfitted sites. Every candidate is ranked for wholly new sites, printed word containment, exact printed word boundaries, and book-global GP language. To account for choosing the best of all 375 states after fitting five crib words at 86 original doublet sites, the [calibration program](../sims/red16_spiral_4d_native_crib_calibration.cjs) reruns the *entire same search* on **250** deterministic independent 29-symbol alphabet relabelings of the original ciphertext. These nulls preserve all 12,956 symbol positions, page and word lengths, and exactly the same 86 adjacent-repeat locations.

| Search-wide maximum | Real original | Null median | Full-search upper-tail p |
| --- | ---: | ---: | ---: |
| Unfitted native-GP substrings ≥4 runes | **1** | **1** | **248/251 = 0.98805** |
| Unfitted substrings entirely within one source word | **0** | **1** | **1.000** |
| Complete visible words at unfitted sites | **0** | **0** | **1.000** |
| Highest original GP-native language score | **−0.86112** | **−0.86181** | **0.48606** |

In fact, the two earlier isolated matches on state `[26,23,1,1]` are **not source-readable word tokens**: its `REASON` at original site7232 is a four-equation crib fit and straddles a printed word boundary; `GREAT` at site10761 straddles another. Even allowing cross-word substrings, the strongest unfitted match across *all* 375 original keys is one 4-rune `GREAT` for state `[15,13,7,12]` at original site6323, and it too spans a printed word boundary. This is ordinary null behavior. No original plaintext is established, and the old pre-calibration "two-site" count must not be used as evidence.

[Successfully completed full-search null and genuine-key control, GitHub Actions 42807640621](https://github.com/FlareZ123/liber-primus/actions/runs/42807640621). The code exports every fitted marker, all four fitted original rune offsets, any additional same-crib unfitted symbols, each wholly independent site, and word-boundary status, so an apparent candidate cannot be confused with an original prediction.

**Independent native-source positive:** encrypt 12,956 original-layout solved-Cicada GP prose runes under unknown state `[11,7,22,3]`. A source-native `REALITY` crib recovers the complete initial state. The decoder restores and re-encodes **12,956/12,956** GP symbols with **+0.4325354** native-author log-likelihood ratio per rune, far above the original candidates. [Passed original-and-positive CI 42805954961](https://github.com/FlareZ123/liber-primus/actions/runs/42805954961).

## Exhaustive crib-free state-space successor

The [subsequent full-key Fourier inversion](source-4d-fourier-fullkey-inversion.md) removes the remaining restriction to 375 fitted native-EA crib keys. It evaluates **all 707,281 initial F29 states** under this exact red16 matrix and, separately, the printed p15 matrix, with source-native GP unigram and adjacent-bigram objectives and independent physical-page holdout. The best real red16 heldout log-ratios are **−0.91669** (unigram) and **−1.10424** (bigram), with GP IoC around 0.0353. Genuine blinded native GP plants rank their exact initial keys first among all 707,281, recovering and re-encrypting all 12,956 runes. Thus no native-GP original key was missed merely because the earlier search solved it from an assumed word. This is a new **bounded full-key negative** under the same model; no wider cipher exclusion is asserted. [Successful CI run 42818399747](https://github.com/FlareZ123/liber-primus/actions/runs/42818399747).

## Conclusion and next decision

These are complete finite inverses of two genuinely different source-spatial interpretations, with strong secret-key positive controls. The second has additionally been calibrated against the *entire* original source-crib search over 250 matched nulls, correcting a fitted-word/word-boundary false positive. They do not recover original LP2 plaintext or key. Stop expanding unsourced variants of these two failed mechanisms. A stronger path requires a *preconstrained actual source-to-state rule* that produces sustained, correct independent original runes. This report belongs in supporting evidence, rather than the established-results index, until such a prediction exists.
