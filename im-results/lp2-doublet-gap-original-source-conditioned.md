# LP2 doublet-gap autocorrelation: original source-conditioned nulls

**Agent31, 14 November 2026. Status:** reproducible intermediate structural finding, framed as a **post hoc conditional test** of the independent Dukotah Round44 B3/T7 observation. **No decrypted LP2 rune, key, cipher or destination.**

## Decision

The 86 original adjacent-identical GP29 rune pairs on physical LP2 pp0–55 have a strongly positive **lag-one autocorrelation of successive doublet-site gaps**, `r = +0.38001968924100965`. The statistic was already reported and preregistered externally by [Dukotah's November 2026 Round44 B3 investigation](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md), with its own flat-residue matched 10,000-sample null and seven-comparison correction. We did **not** discover this statistic, treat its external p-value as independent replication, or construct another direct doublet-as-plaintext channel.

We instead asked the **previously untested mechanism question**: does source-visible chapter/page geometry, and its actual per-unit numbers of repeats, completely account for that positive serial gap correlation?

The answer is **no** under four explicit, progressively more source-constrained uniform-placement models. Fixing the original counts for nine printed chapters leaves the observed T7 in the upper `0.000075` of 40,000 draws; fixing the complete **56 per-page counts** raises the null baseline from about `-0.012` to `+0.230` but still leaves upper-tail `0.005025`. Preserving the counts by both physical page **and original word-gap category** changes little. Thus per-page heterogeneity already explains much of the aggregate serial gap pattern; any remaining placement effect is **finer than the page count vector** under these declared conditional randomizations. It does not specify an encryption layer, a generator, the event clock, or whether the manuscript author intentionally placed these doublets.

## Exact original source and test

Inputs:
- [canonical complete original GP29 rune indices](../resources/liber-primus/lp2-corpus.json), pp0–55 exactly **12,956 runes**, with physical p50 rune-free;
- [full master transcription](../resources/liber-primus/lp2-transcription.txt), used independently to parse all original word/sentence/page separations. Master transcription's physical p50 has no `%` stanza, so pages after p49 are shifted by one transcription record;
- [nine original-image red-heading chapters](lp2-global-original-visual-section-map.md) with lengths `[729,1145,1729,1903,1021,1433,1680,3008,308]`, selected by original red rubric after previous red13 terminal, not by searching T7;
- independent external [Round44 B3 PREREG](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/PREREG.md), which selected the T7 Pearson statistic before observing it.

The source-exact [portable, committed CommonJS SFT](../sims/lp2_doublet_gap_source_conditional_sft.cjs) asserts **every source rune** against the original corpus while building event-eligible within-page positions. Doublet event is `C_i=C_(i+1)` on the same physical page; each source-valid adjacency is one eligible site. The 86 observed events have chapter counts `[4,6,9,10,11,13,12,18,3]`, and include **63 within-word events, 22 printed-word-start crossing events and one sentence-boundary event**. All 86 events on pp0–55 are included. The original observed T7 is Pearson correlation between `g_j = p_(j+1)-p_j` and `g_(j+1)`, across all 85 ordered gaps. It is **+0.38001968924100965**, matching the independent report exactly.

Each null selects without replacement exactly the source-observed number of events for each frozen stratum. Independent draw pools are original valid within-page adjacency positions and are composed globally before calculating the same T7. A reproducible Xorshift32 generator with fixed initial seed `0x33012026`, **40,000 realizations per model**, calculates an add-one upper-tail empirical probability `(1+#{null r >= observed r}) / 40001`. The SFT includes an exact 201-letter source-gap positive control in the separate p23 gate and, for this statistic, a synthetic smooth two-rate positive plant with `r = +0.97647`.

| Uniform site-placement null, counts held fixed | Null T7 mean | Null SD | Draws >= actual | Exploratory add-one upper tail |
| --- | ---: | ---: | ---: | ---: |
| Global 86 out of 12,901 legal within-page positions | −0.012084 | 0.105197 | 18 / 40,000 | **0.00047499** |
| 9 original visually marked chapter totals | −0.029542 | 0.096270 | 2 / 40,000 | **0.000074998** |
| All 56 physical-page totals | +0.229984 | 0.060295 | 200 / 40,000 | **0.00502487** |
| Each page × printed boundary kind | +0.229460 | 0.060525 | 200 / 40,000 | **0.00502487** |

The last conditional partition contains 162 distinct page/context strata, with positive counts in 56 strata; only `inside`, `word` and `sentence` are nonzero observed event categories. It preserves how many repeats occur at actual print word gaps, removing differences in simple word/sentence-boundary opportunity counts as an explanation. A second independently seeded short calculation with 40,000 realizations recovered upper-tail `0.004975` for per-page and `0.005825` for page × word-kind, confirming the effect is not a lucky pseudorandom stream in the committed SFT.

**Executed environment:** [Windows GitHub Actions run 43547462006](https://github.com/FlareZ123/liber-primus/actions/runs/43547462006), Node v22.23.4, exact committed input and script, job passed all assertions. Raw JSON mean, SD, exceedance counts and boundaries are printed by the executable.

## Interpretation and next causal decision

The contrast between the nine-chapter and 56-page conditional nulls is informative: the original visibly selected top-level chapters alone are **too coarse** to model the doublet-gap serial dependence. The actual printed **physical page** is the smaller, visually legitimate candidate unit that captures a large part of it. Introducing a fresh arbitrary hidden generator period or per-page secret solely to reproduce this statistic would be unjustified.

To distinguish an intentional cipher-state mechanism from compositional and copying effects, a further experiment needs a specific source-defined **within-page subunit** (e.g., printed line breaks or an independently visible graphic panel) with a predeclared event-position prediction. It should compare the current exact-page-conditioned null, the proposed source-unit-conditioned null, and a positive planted nonstationary mechanism on untouched page blocks. An author-selected transition at one of those subunits that predicts a genuinely new unknown plaintext/key event would be a meaningful advance.

**Important limits:** this follow-up was designed **after** reading the external T7 anomaly. Four conditional nulls were selected by explanatory source constraints, not preregistered blind. Their tail values are descriptive empirical model checks, **not discovery-wide p-values** and cannot be multiplied as independent evidence. Nulls condition on observed event counts, which themselves may be part of the unknown-generation process. No plain-language conclusion about the creator or encryption method follows. The original doublet sequence is not decoded, and external direct site-channel tests were previously negative. Retain the evidence as a narrower choice of mechanism, not as a proven cipher signal.
