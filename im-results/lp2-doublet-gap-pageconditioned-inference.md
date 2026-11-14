# Repeated-rune gap serial dependence after original page conditioning

**Agent 44, 14 November 2026. Classification: source-exact intermediate evidence, not a decoder.**

## Decision

An independent [November 2026 Round 44 B3/T7 investigation](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) identified unusually positive serial correlation among the gaps between the 86 adjacent-equal-rune sites in unsolved LP2. Its matched global-position null gives approximately p=0.00025. The result is worth testing against the source's **actual printed-page and word boundaries** before interpreting it as a changing cipher parameter.

**New source-conditioned result:** the original Pearson gap correlation is **+0.38001969**. Preserving *all 55 rune-bearing physical pages' exact doublet counts* moves its null mean from approximately **−0.012** to **+0.230**. This accounts descriptively for about **62% of the difference** between the observed correlation and the flat-null mean. The residual still has an exploratory upper-tail p of **0.00537** under 40,000 exact-page-count-preserving resamplings. Preserving each page's separate within-word and across-word counts yields **p=0.00430**. Thus neither page-level count heterogeneity nor printed word-break class completely explains the observed ordering, but the original p-value is not a measure of evidence for *within-page* dependence.

No unknown plaintext, keystream, reversible operator or authentic author-selected state boundary was recovered.

## Exact original input and new discriminants

The untouched canonical [LP2 index corpus](../resources/liber-primus/lp2-corpus.json) and [rune transcription](../resources/lp2-transcription.txt) agree rune for rune. Physical pages **p0–p55** contain **12,956 runes** on **55 text-bearing pages** (p50 has no runes), **12,901** legal within-page adjacent pairs and **86** repeated-rune sites. There are **63** repeated pairs inside printed words and **23** crossing printed word breaks. The nine independently image-visible chapter counts are **[4,6,9,10,11,13,12,18,3]**.

Each simulation samples exactly 86 site positions, always excluding page-crossing adjacencies. The ordered 85 inter-site gaps are evaluated with the same lag-one Pearson statistic as the source B3/T7 investigation. All nulls use 40,000 seeded simulations and one-sided upper-tail add-one probabilities. The interventions below test alternative *conditioning assumptions*; they are exploratory comparisons rather than five independent registered discoveries.

| Null over 86 sites | Mean simulated gap correlation | Upper-tail p for original +0.38001969 |
| --- | ---: | ---: |
| Uniform among 12,901 legal within-page pairs | −0.011917 | **0.000375** |
| Exact doublet count preserved separately in each of 55 pages | +0.230001 | **0.005375** |
| Exact within-word / across-word doublet counts preserved separately in every page | +0.229780 | **0.004300** |
| Exact doublet count preserved for each of nine illustrated chapters | −0.029234 | **0.000025** (0/40,000 exceedances) |
| Permute all 55 complete page blocks, retaining each page's exact original sites and length | +0.076958 | **0.002450** |

The **page-block permutation** preserves original within-page event locations while altering their ordered exposure, so its result supports an *ordering-sensitive page-structure* component. The **chapter-count** null does not absorb the anomaly; assigning only nine illustrated chapter totals is insufficient to reproduce the ordering seen in the physical pages. None of these tests isolates a uniquely causal cipher mechanism.

Under the fixed-page-count null, additional outlier-resistant measurements weaken the evidence:

| Measurement on the same original 86 events | Observed value | Fixed-page-count null mean | Exploratory upper-tail p |
| --- | ---: | ---: | ---: |
| Pearson of successive gaps | +0.380020 | +0.230001 | **0.005375** |
| Spearman of successive gap ranks | +0.267002 | +0.098916 | **0.014925** |
| Pearson excluding pairs touching either of the two longest gaps | +0.181989 | +0.051171 | **0.047024** |
| Pearson on triples of sites wholly inside one illustrated chapter | +0.098110 | −0.032945 | **0.040724** |

These variants were selected after encountering the published T7 signal. Their individual p-values must not be presented as pre-registered significance or combined without accounting for selection. The two largest gaps span 712 and 662 rune positions. A particularly large positive gap-pair contribution is **p12:206 → p16:89 → p18:86**, whose gaps are **712 and 537**, across the p15 4×4-number-square region. This localizes a measurable contribution; coincidence with a known illustration does not by itself select a key or a cipher-state reset.

## Reproducible test and research consequence

[Single-file CommonJS source test](../sims/lp2_doublet_gap_pageconditioned_source_sft.cjs) verifies the 12,956-rune source and 2,896-word alignment before computing the test. It fixes the original 86 site positions, checks the independently reported Pearson statistic to 1e−12, includes an artificial strongly correlated-gap control, and performs all the simulations using deterministic xorshift32 seed **0x3301a444**. It writes no files and runs on **Node.js 22, Windows 11**.

[Successful Windows GitHub Actions run 43651413850](https://github.com/FlareZ123/liber-primus/actions/runs/43651413850) executed the committed original-source test and emitted the complete seeded results. The result independently reproduces the external source anomaly while narrowing its mechanism-relevant interpretation.

**Next useful decision:** require an independently visible reason to treat the **p12–p19 local scarcity/abundance pattern**, or a specific printed-page boundary, as an encryption-state transition. The page-conditioned evidence does not justify tuning an otherwise unconstrained slowly drifting skip rate or undertaking another full-key search. A historical selector that predicts a changed nonce, key schedule or reversible step at one source-visible boundary would constitute an actual next decoder test. Until then, retain this as a local, conditional structural constraint.
