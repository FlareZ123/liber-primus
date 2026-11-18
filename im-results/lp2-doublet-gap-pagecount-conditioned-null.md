# Original LP2 doublet-gap T7 after page-count conditioning

**18 November 2026, Agent 1.** This is an original-cipher, reproducible *post-hoc sensitivity result*. It recovers no unknown plaintext or key, and does not assert a new historical cipher. The question is whether the reported serial gap correlation requires a special within-page generator beyond ordinary variation in the number of doublets between pages.

## Source and competing interpretations

Original `resources/liber-primus/lp2-corpus.json` physical pages p0–55 contain **12,956 GP29 runes** and **86 within-page adjacent-equal sites**. Take each site as the global zero-based position of the second repeated rune; compute the 85 consecutive inter-site distances and Pearson lag-one correlation across their 84 consecutive pairs. The exact original correlation is **+0.380019689241**.

The independently measured [Dukotah Round44 B3 result](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) found two-sided p≈0.0010 against a **flat-rate** site-placement null, passing its seven-test Bonferroni threshold 0.01/7≈0.001429. That supports rejection of *flat-rate* emissions but leaves open a competing hypothesis: page-to-page variation in doublet frequencies could account for the observed adjacent-gap correlation.

## Source-conditioned experiment

The [new read-only CommonJS/Node22 SFT](../sims/lp2_doublet_gap_pagecount_conditioned_null_sft.cjs) preserves **the exact number of original doublets on each of the 55 rune-bearing physical pages** and each page's rune length. It runs two independent 20,000-draw fixed-seed 0x3301 nulls.

- **Within-page uniform sites:** sample that page's exact k repeat sites without replacement among its n−1 eligible within-page transitions. This allows occasionally adjacent sites corresponding to triplets.
- **Within-page uniform nonadjacent sites:** uniformly select k sites subject to no consecutive indices, matching the original ciphertext's absence of triple repeats. Sample k distinct positions from 1..n−k and map the j-th sorted value to value+j; this is a bijective uniform combinatorial sampler.

The observed original source remains untouched; no key, plaintext, punctuation alignment, language score, time-window, or alternative page split is fitted. The Pearson implementation has a perfect-correlation positive check for a constructed increasing-gap process. An empirical two-sided deviation is measured from the simulated **nonzero null mean**, and add-one finite-sample p-values are reported.

| Property | Uniform sites, page counts fixed | Nonadjacent sites, page counts fixed |
|---|---:|---:|
| Original observed r | +0.380020 | +0.380020 |
| Null mean r | +0.229585 | +0.232463 |
| Null median r | +0.230418 | +0.232850 |
| Null 2.5–97.5% range | approximately 0.110–0.343 | **0.111157–0.348789** |
| Trials >= observed | **99/20,000** | **124/20,000** |
| One-sided upper empirical p | **0.00499975** | **0.00624969** |
| Centered two-sided empirical p | computed by script | **0.01459927** |

**Decision.** The observed page-count profile by itself generates much of the positive correlation. The more source-faithful nonadjacent model leaves a positive residual, but **p=0.0146 does not meet the earlier seven-test family-wise bar of 0.001429**. As a post-hoc conditional comparison, this does not overturn the original flat-Bernoulli rejection. It challenges the stronger inference that T7 alone establishes an *additional* within-page stateful generator.

Future work seeking unknown plaintext should demand an author-indicated **reversible decode operation** and an independent held-out page prediction. A new generator fit to this r-value without a source-derived key would not be such a decipherment.
