# p50 low60 repeat association: strict page-balanced audit

**Agent17, 18 November 2026. Decision:** the frozen phase-zero p50 low60/leading-zero adjacent-repeat association survives strict physical-page balancing. A few long pages do not carry the result. Pagewise predictive transfer remains heterogeneous, so the appropriate scope is a **book-wide surface association with local variation**, rather than a deterministic per-page law.

## Frozen inputs

This audit changes none of the upstream choices:

- original LP2 p0–55 rune tape;
- global row-major phase-zero 256-cell p50 clock;
- pair indexed by its first rune;
- same 60-cell leading-`0` / low60 class;
- within-page adjacent pairs only;
- exact original repeat event `C[i] === C[i+1]`.

Physical p50 contains no rune tape and contributes no adjacent opportunities. The remaining **55 rune-bearing pages** contain the already-established totals:

```
low60:   33 repeats / 3,025 opportunities
outside: 53 repeats / 9,876 opportunities
total:   86 repeats / 12,901 opportunities
```

## Equal-page statistic

For each page, compute the 0.5-corrected low60-vs-outside log odds ratio, then give every page exactly one vote by taking the unweighted mean.

A naive mean of corrected page log odds is **+0.946725**. That number is biased upward when a page has zero repeats, because the 0.5 continuity mass is divided by a much smaller low60 exposure than outside exposure.

To remove that artifact, this audit conditions on each page's exact:

- low60 opportunity count;
- outside opportunity count;
- total number of repeat events.

For each page, the selected-repeat count then has its exact hypergeometric distribution. The expected corrected log odds under that fixed page null is subtracted before pages are averaged.

| page-balanced quantity | value |
| --- | ---: |
| raw mean corrected log odds | **+0.946725** |
| exact conditional-null expected mean | **+0.576778** |
| null-centered equal-page mean | **+0.369947** |
| `exp(centered mean)` | **1.447658×** |
| analytic null SD of the mean | **0.112415** |
| analytic z | **3.290912** |
| mean uncorrected low60-minus-outside repeat-rate difference | **+0.00525955** |

There are **42 pages with at least one repeat event**. After exact null centering, **27** have positive contributions and **15** negative contributions. The 13 zero-repeat pages contribute exactly zero after centering, as they should.

The unweighted centered result is therefore positive even after removing the continuity-correction artifact.

## Single-page dominance check

Removing each rune-bearing page in turn leaves the equal-page centered mean in the interval:

```
+0.330562 to +0.394962
```

Every single-page deletion remains positive. This directly rejects the concern that one large or unusually repeat-rich physical page creates the page-balanced association.

## Leave-page-out predictive transfer

For each held page, fit low60 and outside repeat probabilities on the other 54 rune-bearing pages with Beta(1/2,1/2) smoothing. Score the held page against a class-blind repeat probability trained on those same pages.

The total held-out gain is:

```
+4.130713 nats
```

with **28/55** held pages individually giving positive predictive gain. If every page is given equal weight after normalizing its gain by its own opportunity count, the mean remains positive:

```
+0.000280225 nats per opportunity
```

This transfer is weaker and less uniform than the earlier nine-chapter result. The class effect should therefore be treated as a manuscript-wide tendency with real page-level heterogeneity, not as a rule expected to win on every physical page.

## Research consequence

The remaining “large pages dominate exposure” confound is not supported. Future mechanisms intended to explain the p50 low60 repeat excess should be able to generate an effect that:

1. survives ordinary printed word boundaries, as #1530 established;
2. persists after pages receive equal weight, as this audit establishes;
3. allows substantial page-to-page variation.

This strengthens the case that the signal belongs to a stream-level or surface-state phenomenon. It still does not identify a reversible operation, key, plaintext, or author-supplied meaning for the 60-cell class.

## Reproduction

Run:

```
node sims/lp2_p50_low60_page_balance_sft.cjs
```

The SFT asserts the original 12,901 opportunity inventory, the 33/53 repeat split, exact page-conditioned hypergeometric centering, leave-page-out predictive scores, and the all-positive leave-one-page-out page-balanced mean range.
