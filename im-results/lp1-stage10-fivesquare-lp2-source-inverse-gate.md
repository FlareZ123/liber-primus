# Historical Stage10 5×5 magic square: direct original LP2 inverses

**Agent35, 13 November 2026. Bounded source-input negative.** No unknown LP2 plaintext, key, or new original cipher instruction was recovered.

## Why this particular operation

The [recovered contemporary 2014 Stage10 handoff](2014-stage10-three-images-lp1-source-handoff.md) points byte-for-byte to LP1 pages 14–16. LP1 p16 prints a symmetric 5×5 square with every row, column and diagonal summing to **3301**. The frozen literal source matrix is

```
 434 1311  312  278  966
 204  812  934  280 1071
 626  620  809  620  626
1071  280  934  812  204
 966  278  312 1311  434
```

Its determinant is nonzero modulo29 (**10**), so the matrix defines a reversible GP29 Hill-style operation. Previous original tests studied the LP2 p15 4×4 square, a distinct original matrix. This experiment asks whether the earlier, **historically reachable LP1 square** directly deciphers the next five LP2 page streams in parallel, or the exact 75-rune core of the 76-rune final unknown p55 page. Neither consumer is actually selected by the Stage10 response; both are explicitly exploratory and are judged on untouched original ciphertext.

## Exact test

Take the original [LP2 corpus](../resources/liber-primus/lp2-corpus.json), align five consecutive physical pages by rune offset using the minimum of their page lengths, and apply M, M transpose, inverse M, and inverse transpose as 5-vector maps over GF(29). The two fixed starts are the opening p0–4 pages and the original red-chapter start p15–19; no page order, key, clock, alphabet or plaintext crib is fit. Independently, apply each of the same four maps to the 75-rune windows p55[0:75] and p55[1:76], the only complete fifteen 5-vector framings of that original page.

| Original input | Source runes scored | Direct original inverse IoC summary |
| --- | ---: | --- |
| Five-page p0–4, minimum aligned length 201 | 1,005 per orientation | Pooled IoC **0.03412–0.03461** |
| Five-page p15–19, minimum aligned length 159 | 795 per orientation | Pooled IoC **0.03412–0.03501** |
| Original p55, either 75-rune framing | 75 per orientation | IoC **0.02847–0.03712** |
| Original solved p57 clear GP, comparison only | 95 | IoC **0.06271** |

Across all four orientations of both source-selected five-page starts, per-decoded-page IoC remains below **0.039**. The p55 candidates remain ciphertext-like, although 75 runes are too short for a definitive language exclusion by IoC alone. As a positive algorithm control, the script applies the actual 5×5 source matrix to all 95 genuine printed GP runes of solved p57 and reconstructs exactly **95/95** with its modular inverse. Matrix and arithmetic identities are checked explicitly.

**Reproducer:** [read-only original-source CJS SFT](../sims/lp1_stage10_fivesquare_original_inverse_sft.cjs), with original canonical page records. No workflow dispatch was made.

## Decision

The source-recovered Stage10 square is a real, human-visible numerical object and a legal modular key. **These two natural direct consumers do not recover LP2 prose.** The tests do not exclude an instructed target, nonlinear key schedule, different page grouping, transposition, or multi-layer use. Do not expand into arbitrary 5-page windows or a fitted 25-cell Hill-key sweep without another original clue.
