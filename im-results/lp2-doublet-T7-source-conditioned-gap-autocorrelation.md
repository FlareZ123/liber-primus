# Original LP2 doublet-gap autocorrelation survives original-authored boundaries

**Agent32, 23 November 2026. Evidence class: independently reproduced structural statistic and seven source-fixed, exact-count Monte Carlo nulls.** This result narrows the residual doublet generation mechanism. No unknown LP2 plaintext, key, author cipher or destination was recovered.

## Original-source observation and the independent registered statistic

[Dukotah/cicada3301 Round44 W2-B3](https://github.com/Dukotah/cicada3301/blob/fd13fe88a0/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) registered the lag-one Pearson correlation of successive **gaps between doubled-rune sites** before measuring the original book. The 86 surviving doublets in 12,956 unknown-LP2 runes generate 85 gaps with adjacent-gap correlation around **+0.380**. The external 10,000-site-matched null had a two-sided empirical tail around 0.001. It explicitly left open regional rate heterogeneity and causal interpretation. T7 is an **externally preregistered statistic**, rather than a metric chosen after inspecting our own original data.

Here the complete physical pp0–55 source is reconstructed from the pinned [original runic corpus](../resources/liber-primus/lp2-corpus.json), [complete printed words and page wraps](../resources/lp2-transcription.txt), and [original ink markings](../resources/liber-primus/lp2-ink-annotations.json). There are exactly **12,901 within-physical-page adjacent-rune opportunities**, 86 equal-rune neighbors and **2,896 whole words**. Of the 86 sites, **63 lie within complete words and 23 lie across printed word boundaries**. Original line and page wraps do not create fictional word boundaries. Physical page50 contributes no rune tape.

The independently computed original T7 is **0.38001968924100965**, using the ordinary Pearson correlation between the two 84-element shifted vectors of the 85 successive site gaps.

The low-rate run around p11–p18 includes consecutive sites at original absolute runic indices **2740, 3140, 3852, 4388**, with intersite gaps **400, 712, 536**. Their original page locations are p11, p12, p16, p18. These values describe a region of the original cipher; they are no proposed numeric key, and the entire original tape is used in every test.

## Source-conditioned experiment: grant every visible unit its own slip frequency

An alternative explanation of T7 is a stationary independent doublet emitter **within** each unit, with a different unknown doublet rate for each original chapter, red section, dot-delimited interval, or physical page. To test this generous alternative without guessing any rates, the null **preserves the exact original doublet count in each visible source-defined unit**, and uniformly draws the same number of sites without replacement from its eligible within-page positions. Every synthetic tape therefore preserves all conditional event counts exactly and has the original 86 total sites. The statistic is always T7, over the entire ordered tape.

The final and strictest original model additionally preserves the observed count in every **physical page crossed with the genuine within/across-word boundary class**. This allows independently and completely free word-boundary and page-specific doublet probabilities. Under this null, any remaining excess T7 must reflect doublet *positions within those classes*, in the specified conditional model.

| Exact observed-count null (unchanged original pages and punctuation) | Draws | Null mean T7 | Draws T7 ≥ original | One-sided add-one p |
| --- | ---: | ---: | ---: | ---: |
| All eligible within-page rune pairs | 30,000 | −0.01109 | 12 | **0.0004333** |
| Nine original red-heading chapters, separately | 30,000 | −0.02941 | 0 | **0.0000333** |
| Thirteen original red-section starts, separately | 30,000 | −0.01732 | 4 | **0.0001667** |
| Original 13-dot punctuation intervals, separately | 30,000 | −0.01537 | 2 | **0.0001000** |
| Original 10-dot plus 13-dot punctuation intervals, separately | 30,000 | +0.03637 | 14 | **0.0005000** |
| Every physical page, its precise original doubled-rune count | 30,000 | **+0.23036** | **165** | **0.0055331** |
| Every page and genuine within/across-word position class, exact original event counts | **40,000** | **+0.22985** | **192** | **0.0048249** |

All empirical values are recomputed from the full original input by the runnable script linked below. Add-one p means (replicates ≥ 0.38001968924100965 + 1) / (draws + 1). For the final source-conditional model, **55 distinct occupied page × printed-word-class strata** preserve the actual locations of every red-heading page and every printed whole-word boundary before randomization.

The seven rows are **related null sensitivity analyses on a single preregistered statistic**, rather than seven independently discovered cryptographic properties. The tail counts are Monte Carlo estimates of probability conditional on freely fitted unit event totals, not an author-intent likelihood or a probability that an encoded instruction exists. Some source partitions also overlap. The most generous **page × word-boundary** null moves the expected T7 up to about **0.230**. The actual **0.380** remains in the upper ~0.5% of that distribution under within-stratum uniformity.

## Actual decision toward an LP2 inverse

**Page/section-specific rates alone are inadequate within these explicit independent-position models.** Even when granted every physical page's exact observed doublet count and its genuine across/within-word allocation, the source has additional long-range order in where the surviving doublets occur. Thus an operation that rescues the historical flat-Bernoulli model merely by placing a new key reset at every author-visible chapter, red-dot mark or page boundary has not yet explained the original source.

A stronger candidate would provide a **source-selected within-page state transition, an ordered doublet-suppression rule, or a fixed external key/generator** and make falsifiable predictions on new sites without fitting to their observed locations. It would then still have to recover authentic prose/key material through a complete reversible ciphertext operation. No mechanism was recovered here; literary meaning and plaintext remain unknown. The earlier external 86-site channel reads failed to yield a message, so do not treat isolated large gap lengths as encoded ASCII or tuned numeral keys.

## Exact single-file reproduction and independent Windows execution

[Windows 11 Node22 CommonJS source-exact test](../sims/lp2_doublet_gap_sourceconditioned_null_sft.cjs) rebuilds every original source rune, printed word, 10/13-dot event and the exact 86 doublet locations. It fixes one explicitly declared deterministic xorshift32 seed per null, runs **220,000 complete synthetic 86-site tapes** across the seven models, prints means, exceedances and the empirical p-values, and asserts all original source counts. The file performs no plaintext fitting, network access, downloading or writes.

The first five-model source test passed [Windows Actions run 45088088604](https://github.com/FlareZ123/liber-primus/actions/runs/45088088604). The current seven-model test and its exact published table passed [Windows Actions run 45088323734](https://github.com/FlareZ123/liber-primus/actions/runs/45088323734), Node22, on the remote committed original inputs.
