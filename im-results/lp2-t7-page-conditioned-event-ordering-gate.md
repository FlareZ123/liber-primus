# LP2 adjacent-doublet gap persistence after source-conditioned page controls

**Status:** independently reproduced original-input ordering anomaly, with new exact-margin rival models. 22 November 2026. The finding constrains emission models; it does not recover unknown plaintext, a key or a historical cipher.

## The measured target

The canonical 55 rune-bearing unknown LP2 pages contain 12,956 ciphertext runes and 86 same-physical-page consecutive-equal events. Reading the exact 86 global event positions in manuscript order yields 85 distances. Pearson's correlation of consecutive distances is **+0.38001968924100965**. The 13 consecutive 1,000-rune event bins are **[8,3,7,2,6,9,10,8,11,2,9,6,5]**.

The positive correlation and nonstationarity were previously identified in an *independent* project by the Dukotah/njloof R44 T7 studies (see [Round44 original synthesis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/SYNTHESIS.md)). They are not claimed as new discoveries here. The new question is **what remains anomalous after the source-defined page/word margins are fixed**. Those margins already impose long zero-event stretches, so a null that does not hold them fixed cannot distinguish page/session heterogeneity from event-order memory.

## Source-exact construction and nulls

Parse the pinned `resources/liber-primus/lp2-corpus.json` for each physical page's original GP values, only positions i≥1 within that page as repeat-event candidates. Join the transcribed hyphenated words across printed line and page wraps exactly. This yields 2,896 printed words and 12,956 source-identical glyphs. Preserve the actual 55 page lengths, all 86 **original event counts by page**, and optionally the original word-position class of those events.

For each registered null, choose **without replacement** a new set of candidate positions inside its stratum, keeping all stratum counts EXACTLY fixed. This is an exact conditional placement law for a Bernoulli slip generator with an arbitrary unknown but stationary probability within every stated stratum. It permits each page its own completely unrelated unknown slip probability, so no global rate parameter is inferred.

- **Page:** each source page has a free local event rate, conditioned on its exact observed event count.
- **Page × word-boundary:** additionally preserve 23 event-word starts versus 63 within-word events, separately on each page.
- **Page × word-position:** additionally preserve each page's 23 word-start, 19 word-terminal, and 44 other within-word doublet event allocations. These are totals across pages.

Each null was simulated 30,000 times with deterministic xorshift32 and source-native candidate position pools. The observed `0.38001968924100965` was frozen before testing these nulls, having been reported by the independent external study. Three independent 30k simulations use fixed seeds and explicit exact source stratifications; no hidden key or language scorer is involved.

| Conditional null | Mean gap correlation | Draws ≥ original | Upper-tail add-one p |
|---|---:|---:|---:|
| Page | 0.23069136 | 158/30,000 | 0.005300 |
| Page × word-boundary | 0.22973971 | 138/30,000 | 0.004633 |
| Page × word-position | 0.22643415 | 150/30,000 | 0.005033 |

**Result:** the original positive successive-gap dependence remains atypical after fixing all original page-specific event rates and after allowing differing rates for printed word starts and word endings. A decoder architecture that independently tosses a fixed (possibly entirely unknown) slip probability at each position of the same page/position stratum **does not reproduce this observed statistic as typical**. Some extra ordering-sensitive state or a stronger unmodeled condition is required *if* such an architecture is asserted as the true generator.

## What the 1,649-rune gap cluster does and does not establish

The maximum sum of **three consecutive inter-event gaps** is **1,649**: global event positions **2,740→3,140→3,852→4,389**. This region is **not** doublet-free; it contains the two interior doublets at 3,140 and 3,852. The independent external project has already corrected that shorthand.

Once original per-page event counts are held fixed, a three-gap maximum of at least1,649 is ordinary:
- Page conditioning: **p=0.51638**.
- Page × word-boundary: **p=0.50105**.
- Page × word-position: **p=0.48858**.

Thus the visually striking 1,649-rune span is explained by the original page-event inventory. Its size alone does not authorize a special p15 reset or a unique cipher-switching interval. **The harder residual feature is the positive *correlation between successive gaps***.

## Original clue and physical-page partition limits

The original physical five-dot markers motivate the source-visible 8+16+32 page partition. As an exploratory localization, before/after physical page24, observed gap correlations are **0.474966** (30 early events) and **0.219944** (56 later events). Conditional page×position null tails are **0.07623** and **0.02267**, respectively. Because this split is evaluated after T7's discovery, these are descriptive diagnostics, not separately discovery-corrected significances. Both regions show positive persistence, so attributing the phenomenon solely to the p15 numeric square or its neighboring doublet-light pages would be premature.

## Scope and next decision

This is an exact **event-placement** test conditional on the observed original ciphertext margins. It does not generate a complete self-consistent ciphertext or show that a hidden mechanism is cryptographic rather than editorial. Its p-values measure one selected statistic under each specified conditional law; they are not discovery-wide probabilities of Cicada authorship or evidence of an unknown plaintext.

**Research consequence:** drop flat anti-repeat slip mechanisms that use only page-specific and word-position-specific stationary parameters as an adequate full explanation of the observed event chronology. Investigate **ciphertext-recoverable state, lagged slip dependence, or source-selected state updates** with predeclared prospective event-position or plaintext predictions. Preserve position invariants and original glyph labels in any test. Do not infer an authored 1,649-rune no-repeat block or a special p15 operation from the three-gap maximum.

[Source-native, read-only Node22 reproducer](../sims/lp2_t7_pageconditioned_gap_persistence_sft.cjs) · [Windows PASS run 44981871587](https://github.com/FlareZ123/liber-primus/actions/runs/44981871587) · [independent earlier anomaly](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/SYNTHESIS.md).
