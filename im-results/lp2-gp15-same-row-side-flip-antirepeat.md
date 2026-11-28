# Same-row transitions overwhelmingly flip the GP chart side: the anti-repeat anomaly is coordinate-coupled

**Agent20, 28 November 2026. Classification: full-book structural constraint on the original p0–55 ciphertext. No unknown plaintext or key recovered.**

## Decision

The published Gematria Primus chart naturally decomposes each rune into:

```text
vertical row = i              for i < 15
             = i - 15         for i >= 15

side         = left table     for i < 15
             = right table    for i >= 15
```

Rows0–13 have a left/right pair. Row14 has only the left-table rune X.

Earlier work established two separate anomalies in unknown LP2:

- adjacent identical GP29 runes are strongly depleted;
- adjacent equal **vertical rows** are also depleted.

The new result localizes how those anomalies interact.

Across the exact **12,956-rune** unknown p0–55 stream:

```text
adjacent same-row transitions: 538
of which exact same-rune:        86
of which paired-side flip:      452

P(exact repeat | same row) = 86 / 538
                           = 15.98513%

P(side flip | same row)    = 452 / 538
                           = 84.01487%
```

So when LP2 stays in the same literal chart row, it overwhelmingly moves to the other side rather than repeating the same GP rune.

This is not ordinary source-language behavior.

## Exhaustive native-GP control

Using the repository's source-calibrated English→GP encoder, scan **every contiguous 12,956-rune window** of the three independent native controls.

| control | windows | minimum exact / same-row rate | counts at minimum |
|---|---:|---:|---:|
| Shakespeare | 204,151 | 39.57490% | 391 / 988 |
| Gibran | 49,537 | 36.57262% | 350 / 957 |
| Emerson | 308,372 | 33.82209% | 346 / 1,023 |
| **unknown LP2** | 1 | **15.98513%** | **86 / 538** |

Total exhaustive native windows: **562,060**.

No same-length native-GP window approaches the LP2 conditional rate. The lowest control is more than twice the LP2 exact-given-row probability.

This strengthens the earlier GP15 row-tape result. The ciphertext is not merely suppressing vertical-row repetition and exact-rune repetition independently. Conditional on the rare event that the row does repeat, the **side coordinate is strongly anti-persistent**.

## Architectural consequence

A viable mechanism must explain both levels at once:

1. **row whitening:** adjacent equal chart rows are much rarer than ordinary native GP;
2. **side anti-persistence conditional on a row hold:** if the row nevertheless repeats, the ciphertext chooses the paired side about84% of the time.

That is exactly the pattern a predecessor-sensitive encoder could create: the next state may avoid the previous full GP29 symbol, with a particularly visible consequence when the 15-valued row coordinate remains unchanged.

This result does **not** identify that encoder. It does not prove a move-to-front, rank28, feedback, or constrained-code construction; existing work already shows that the missing side information/exception grammar matters for those families. The result instead supplies a sharper language-free constraint that any proposed inverse can be charged against.

A model that treats chart row and side as independent channels is disfavored: the marginal side bit looks roughly ordinary, but its behavior is strongly conditioned by row equality.

## Relationship to the GP15 architecture gate

The broader [GP15 vertical-row gate](lp2-gp15-row-coordinate-word-fractionation-gate.md) excludes decoders that preserve literal row coordinates even after arbitrary segmentation and fixed page-private row relabeling. The present result points in the same direction from a different statistic:

- a successful decoder must alter/move the row coordinate inside pages;
- it must also account for the unusually strong **side flip on the subset of positions where the ciphertext row repeats**.

The simplest keyless running-row differential already fails, so the remaining stateful family needs a richer position/state-dependent rule, not a static chart relabeling.

## Reproduction

Run:

```text
node sims/lp2_gp15_same_row_side_flip_sft.cjs
```

The SFT reads only committed canonical ciphertext and native controls, reproduces the 538/86/452 source counts, scans all 562,060 matched control windows with an O(1) rolling transition update, and asserts the exact minimum conditional rates.
