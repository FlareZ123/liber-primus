# LP2 doublet-gap autocorrelation: original source-conditioned nulls

**Agent31, 14 November 2026. Status:** reproducible intermediate structural finding, framed as a **post hoc conditional test** of the independent Dukotah Round44 B3/T7 observation. **No decrypted LP2 rune, key, cipher or destination.**

## Decision

The 86 original adjacent-identical GP29 rune pairs on physical LP2 pp0–55 have a strongly positive **lag-one autocorrelation of successive doublet-site gaps**, `r = +0.38001968924100965`. The statistic was already reported and preregistered externally by [Dukotah's November 2026 Round44 B3 investigation](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md), with its own flat-residue matched 10,000-sample null and seven-comparison correction. We did **not** discover this statistic, treat its external p-value as independent replication, or construct another direct doublet-as-plaintext channel.

We instead asked the **previously untested mechanism question**: at which actually printed geographic unit does the observed T7 stop being unusual after conditioning on the number of repeat-bearing positions?

Fixing the nine-chapter repeat counts leaves the observed T7 in the upper `0.000075` of 40,000 draws; fixing all **56 per-page counts** raises the null baseline from about `-0.012` to `+0.230` but leaves upper-tail `0.005025`. Splitting each original page at the midpoint of its printed lines further raise it to `+0.312`, leaving upper-tail `0.0383`. When the original number of events on **each individual printed line** is also held fixed, the null mean becomes `+0.373` and the original T7 is unexceptional (upper-tail `0.232`). Exact-line conditioning is an intentionally high-dimensional descriptive control: 594 distinct eligible line strata for 86 events make site locations nearly known, so its near-null result alone does not prove a line-level cipher. This localizes T7 chiefly to the printed **line-occupancy sequence**, without selecting an encryption layer, key, generator, event clock or authored intent.

## Exact original source and test

Inputs:
- [canonical complete original GP29 rune indices](../resources/liber-primus/lp2-corpus.json), pp0–55 exactly **12,956 runes**, with physical p50 rune-free;
- [full master transcription](../resources/liber-primus/lp2-transcription.txt), used independently to parse all original word/sentence/page separations. Master transcription's physical p50 has no `%` stanza, so pages after p49 are shifted by one transcription record;
- [nine original-image red-heading chapters](lp2-global-original-visual-section-map.md) with lengths `[729,1145,1729,1903,1021,1433,1680,3008,308]`, selected by original red rubric after previous red13 terminal, not by searching T7;
- independent external [Round44 B3 PREREG](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/PREREG.md), which selected the T7 Pearson statistic before observing it.

The source-exact [portable, committed CommonJS SFT](../sims/lp2_doublet_gap_source_conditional_sft.cjs) asserts **every source rune** against the original corpus while building event-eligible within-page positions. Doublet event is `C_i=C_(i+1)` on the same physical page; each source-valid adjacency is one eligible site. The 86 observed events have chapter counts `[4,6,9,10,11,13,12,18,3]`, and include **63 within-word events, 22 printed-word-start crossing events and one sentence-boundary event**. All 86 events on pp0–55 are included. The original observed T7 is Pearson correlation between `g_j = p_(j+1)-p_j` and `g_(j+1)`, across all 85 ordered gaps. It is **+0.38001968924100965**, matching the independent report exactly.

Each null selects without replacement exactly the source-observed number of events for each frozen stratum. Physical lines are determined from original transcription's slash wraps and explicit unwrapped line breaks; page-to-page wraps never count as within-page pairs. The upper/lower-half model splits each page's counted original physical lines at its middle; the line model fixes each per-page printed-line event count. Independent draw pools are original valid within-page adjacency positions and are composed globally before calculating the same T7. A reproducible Xorshift32 generator with fixed initial seed `0x33012026`, **40,000 realizations per model**, calculates an add-one upper-tail empirical probability `(1+#{null r >= observed r}) / 40001`. The SFT includes an exact 201-letter source-gap positive control in the separate p23 gate and, for this statistic, a synthetic smooth two-rate positive plant with `r = +0.97647`.

| Uniform site-placement null, counts held fixed | Null T7 mean | Null SD | Draws >= actual | Exploratory add-one upper tail |
| --- | ---: | ---: | ---: | ---: |
| Global 86 out of 12,901 legal within-page positions | −0.012084 | 0.105197 | 18 / 40,000 | **0.00047499** |
| 9 original visually marked chapter totals | −0.029542 | 0.096270 | 2 / 40,000 | **0.000074998** |
| All 56 physical-page totals | +0.229984 | 0.060295 | 200 / 40,000 | **0.00502487** |
| Each page × printed boundary kind | +0.229460 | 0.060525 | 200 / 40,000 | **0.00502487** |
| Each page's upper/lower physical-line half | +0.311912 | 0.038328 | 1,530 / 40,000 | **0.03827404** |
| Exact count on every printed line | +0.373012 | 0.009439 | 9,277 / 40,000 | **0.23194420** |

The page×word-kind partition contains 162 distinct strata, with positive counts in 56; only `inside`, `word` and `sentence` are nonzero observed categories. The line-conditioned model contains **594 eligible line strata**, with doublets present on **83 lines** (three lines hold two events). It preserves how many repeats occur at actual print word gaps, removing differences in simple word/sentence-boundary opportunity counts as an explanation. A second independently seeded short calculation with 40,000 realizations recovered upper-tail `0.004975` for per-page and `0.005825` for page × word-kind, confirming the effect is not a lucky pseudorandom stream in the committed SFT.

**Executed environment:** the original four-model regression [Windows run 43547462006](https://github.com/FlareZ123/liber-primus/actions/runs/43547462006) and six-model expanded [Windows run 43548120071](https://github.com/FlareZ123/liber-primus/actions/runs/43548120071), Node v22.23.4, exact committed input and script, both passed all assertions. Raw JSON mean, SD, exceedance counts and boundaries are printed by the executable.

## Interpretation and next causal decision

The contrast across source units is informative: the nine top-level visible chapters are **too coarse** to model the doublet-gap serial dependence, physical pages capture most of it, and printed lines nearly locate it. The individual line-conditioned model is heavily saturated relative to 86 events; it cannot independently establish *why* the line occupancy occurs. The four original categories, then the two source-visible line models, specify a spatial localization of a previously reported anomaly, rather than a discovered cipher transition.

A follow-on capable of selecting a decoding mechanism would need an **independently authored per-line state rule** and a forward-generated prediction across untouched original pages. Source-defined line breaks are visible, but the book does not prescribe a cipher restart or slip probability at those breaks. New ad hoc line-by-line key parameters can fit the 83 occupied lines and are therefore uninformative without source-selected state. Test only a concrete planted line-state emitter and withheld original placement/plaintext prediction, using the present per-page null as control.

**Important limits:** this follow-up was designed **after** reading the external T7 anomaly. Six conditional nulls were selected by explanatory source constraints, not preregistered blind. Exact per-line counts heavily constrain event positions by construction. Their tail values are descriptive empirical model checks, **not discovery-wide p-values** and cannot be multiplied as independent evidence. Nulls condition on observed event counts, which themselves may be part of the unknown-generation process. No plain-language conclusion about the creator or encryption method follows. The original doublet sequence is not decoded, and external direct site-channel tests were previously negative. Retain the evidence as a narrower choice of mechanism, not as a proven cipher signal.
