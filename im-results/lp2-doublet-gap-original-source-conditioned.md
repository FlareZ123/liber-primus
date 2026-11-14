# LP2 doublet-gap T7: printed-line occupancy after established source conditioning

**Agent31, 14 November 2026. Classification:** original-source *exploratory line-scale localization*, following the already published chapter/page/word-conditioned T7 analyses. **No unknown plaintext, creator key, cipher inverse or new authored instruction.**

## What was already known

The external [Dukotah Round44 B3/T7 investigation](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) independently selected the lag-one Pearson correlation of gaps between original adjacent-identical GP29 runes. For the 86 events on LP2 pp0–55, the source has 85 gaps and **r = +0.38001968924100965**. It published a flat matched-null anomaly in November 2026.

**Important prior-work correction:** this repository had *already* established that preserving exact original visible-chapter, physical-page and word/line delimiter strata leaves T7 unusual. [The 12 November source-boundary-conditioned gate](lp2-doublet-gap-source-boundary-conditional-gate.md) and its [SFT](../sims/lp2_doublet_gap_source_boundary_conditional_sft.cjs) report chapter-conditioned upper-tail **0.000050**, page-conditioned **0.00460**, page×13-dot **0.00215**, page×word/line **0.00580**, and a more saturated exact source word-length control **0.00770**. The earlier [printed-word doublet analysis](lp2-word-boundary-doublet-analysis.md) also independently counts four events across printed line wraps.

Our six-null [single-file CommonJS implementation](../sims/lp2_doublet_gap_source_conditional_sft.cjs) reproduces the chapter/page/word boundary effect from the authentic source; **those reproductions are not novel**. The distinct new contribution is identifying what happens when the **number of repeat events per actual printed line**, rather than their broader boundary class or word length, is held fixed.

## Independent source unit and two added nulls

Using [the original 2014 master transcription](../resources/liber-primus/lp2-transcription.txt), derive physical line boundaries from every `/` line-wrap marker and any separate unwrapped newline; line wraps do not introduce word starts. Use the [canonical 29-rune original corpus](../resources/liber-primus/lp2-corpus.json) to verify every one of the **12,956 original runes**. Source physical p50 is rune-free and absent from the transcription's percent-delimited stanza count, so segments after p49 require a one-record correction.

A repeated adjacent rune remains a valid event **across a printed line break** when both runes occupy the same physical page. Each event is assigned to the physical line containing its **first** rune. There are **594 printed-line strata containing at least one eligible within-page adjacent pair**; **83 lines contain events**, with three lines having two, for 86 events total. All original red headings, word gaps and page boundaries remain in place.

The two new source-unit tests condition on:

1. **Page halves:** split each physical page after the midpoint of its printed line count, preserving the **original event count in each of the two half-page units**. This is an investigator-defined two-band partition of authentic printed geometry, rather than an authored mark selecting a cipher state.
2. **Exact printed lines:** preserve the exact event count of **each of the 594 eligible original printed lines**, resampling each event uniformly without replacement among the original within-page adjacency positions available to that line.

Both models use a 40,000-draw seeded Xorshift32 randomization, then recombine the 86 sites globally and compute the **same** observed T7 Pearson statistic. The larger chapter/page controls are recalculated in the source SFT for context, although those have prior provenance.

| Original event-count conditioning | Null T7 mean | Null SD | Simulations ≥ actual +0.38001969 | Add-one exploratory upper-tail |
| --- | ---: | ---: | ---: | ---: |
| Exact 56 page counts (prior-work reproduction) | +0.229984 | 0.060295 | 200 / 40,000 | **0.00502487** |
| **Exact original upper/lower page halves (new)** | **+0.311912** | **0.038328** | **1,530 / 40,000** | **0.03827404** |
| **Exact original printed lines (new)** | **+0.373012** | **0.009439** | **9,277 / 40,000** | **0.23194420** |

Source-valid line occupancy is therefore sufficient to explain the observed *within-line site-placement* contribution to T7 under this highly conditional randomization. The contrast to exact-page conditioning localizes the remaining observed difference mainly to **which lines contain repeat events**, and particularly to the correlation of their occupancy along the source. The exact-line null is intentionally **saturated** (594 strata, 86 events): nearly fixing event coordinates makes a high null mean inevitable. Its null result is a descriptive localization, **not proof** that the creator used a linewise cipher, a change in state, or deliberate line occupancy.

## Reproducibility and decision

- [Committed Windows-compatible CommonJS SFT](../sims/lp2_doublet_gap_source_conditional_sft.cjs), exact source rune/page alignment, source chapter/page/context strata, new per-line and half-page strata, sample counts and a strong smooth-rate positive plant.
- The first four conditional reproductions passed in [Windows Node22 run 43547462006](https://github.com/FlareZ123/liber-primus/actions/runs/43547462006); the new six-model set passed in [Windows Node22 run 43548120071](https://github.com/FlareZ123/liber-primus/actions/runs/43548120071), printing exact values above.
- External T7 discovery was known **before** these new conditionings. These are exploratory upper-tail model checks, with no independent discovery-wide significance; a source-selected per-line forward mechanism and blind runes would be required for a decryption claim.

**Research fork:** retire assertions that chapter/page/word *counts* fully explain T7; line *occupancy* does explain the remaining global correlation under a saturated placement null, but does not give a cipher. Do not infer a 594-key line cipher. Any next experiment should select a low-parameter, historically motivated **line-status predictor** using independent original artwork or protocol, then make an untouched **line-event or plaintext** prediction. Prefer new original-page instructions and authentic key sources to further null partition tuning.
