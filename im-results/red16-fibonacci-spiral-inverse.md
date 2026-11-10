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

The original **86** adjacent-equal ciphertext pairs supply possible EA markers. Four other letters in the already solved author's EA-bearing words `REALITY, REALITIES, AETHEREAL, UNREASONABLE, REASON` solve exactly for four state coordinates. Across the full original manuscript the solver finds **466** such four-letter candidates and **375 distinct full-state keys**. The highest native-author GP unigram score is **−0.8611235 log units per rune relative to uniform**, with no readable paragraph. One state `[26,23,1,1]` coincidentally matches `REASON` at global rune7232 (page29), used to fit a state, and another source-native `GREAT` at rune10761 (page44). These isolated four/five-GP-rune matches are post-selected and lack original long-plaintext prediction, so cannot be called authenticated plaintext. The best raw author-GP key is a different state `[26,27,1,12]`, also incoherent.

**Independent native-source positive:** encrypt 12,956 original-layout solved-Cicada GP prose runes under unknown state `[11,7,22,3]`. A source-native `REALITY` crib recovers the complete initial state. The decoder restores and re-encodes **12,956/12,956** GP symbols with **+0.4325354** native-author log-likelihood ratio per rune, far above the original candidates. [Passed original-and-positive CI 42805954961](https://github.com/FlareZ123/liber-primus/actions/runs/42805954961).

## Conclusion and next decision

These are complete finite inverses of two genuinely different source-spatial interpretations, with strong secret-key positive controls. They do not recover original LP2 plaintext or key. Stop expanding unsourced variants of these two failed mechanisms. A stronger path requires a *preconstrained actual source-to-state rule* that produces sustained, correct independent original runes. This report belongs in supporting evidence, rather than the established-results index, until such a prediction exists.
