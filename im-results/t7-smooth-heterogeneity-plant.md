# Smooth-rate heterogeneity plant for the ordered doublet-gap anomaly

**Status:** intermediate model test. The external Round44 T7 observation was independently reproduced from this repository's canonical corpus. One specified smooth-rate alternative is disfavoured; this is not a plaintext recovery or proof of a cipher mechanism.

## Reproduction of the observation

The external [Dukotah Round44 pickup synthesis](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/PICKUP-HERE.md) reports a lag-1 autocorrelation of **+0.37993** in the gaps between 86 adjacent-equal ciphertext sites, over 12,956 runes. Its site-matched shuffle gives p=0.00025 (20,000 draws).

I independently rebuilt the stream from this repository's `resources/liber-primus/lp2-corpus.json`: concatenate the **55 nonempty physical pages p0–p55**, preserving order and excluding empty numeric page p50. This is 12,956 runes; the external report calls these 55 rune-bearing segments 0–54. The result is:
- 86 adjacent-equal sites and 85 inter-site gaps;
- gap lag-1 Pearson autocorrelation **+0.3800197**;
- 1,000-rune block counts **[8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]**;
- block-count sample variance **8.7564** and block-count lag-1 autocorrelation **−0.1900**.

A separate uniform fixed-count site null (20,000 draws, seed 4321) gives gap-ac1 mean **−0.0116**, SD **0.1054**, and **6/20,000 = 0.0003** draws at least as large as observed. This independently reproduces the scale of the external p=0.00025 result.

## Alternative tested

I tested one explicit smooth-heterogeneity alternative: a **piecewise-constant lognormal Cox intensity**. For cell width (L), latent log-rate follows an AR(1) process with (ho=e^{-1}) per cell; cell weights are (exp(sigma z-sigma^2/2)). Each draw conditions on exactly 86 sites over 12,956 positions, samples unique site positions within cells, and measures:
1. lag-1 autocorrelation of the 85 inter-site gaps;
2. variance of the 13 observed 1,000-rune block counts;
3. lag-1 autocorrelation of those block counts.

The broad grid used 4,000 draws for each (L\in\{50,100,200,400,800,1600\}) and (sigma\in\{0.2,0.4,0.6,0.8\}). Eight high-amplitude cells were then checked with 10,000 draws each. Seeds are fixed in the reproducer.

## Result

- At short correlation lengths (L≤200), the block profile remains reasonably close to the observed scale, but the chance of reaching gap-ac1 ≥ +0.380 is at most **1.66%** in the tested grid (L=200, σ=0.8).
- Longer/slower drift raises that tail probability (up to **11.4%** in the selected L=1600, σ=0.8 cell), but it also predicts much larger block-count variance and positive block-count autocorrelation. The observed block variance is 8.756 and block-ac1 is −0.190.
- In the eight selected 10,000-draw checks, **0/10,000** draws jointly met all three observed-side conditions: gap-ac1 at least observed, block variance no greater than observed, and block-ac1 no greater than observed. This is an exploratory joint diagnostic, not a preregistered omnibus p-value.

**Interpretation:** this simple smooth log-rate drift model does not explain the observed combination. Short-scale drift cannot produce enough gap autocorrelation; long-scale drift produces block clustering absent from the actual stream. This shifts attention toward an **event-level/short-memory state process** (or a source-specific filter), rather than a slowly drifting rate. It does not rule out every smooth intensity model, deterministic periodic structure, word/page-conditioned mechanisms, transcription effects, or other alternatives.

## Next discriminating question

Can a short-memory hidden-state or renewal process produce the observed gap-ac1 while preserving the near-Poisson 1,000-rune block profile and the other LP2 source constraints? Any such model still needs an independently selected, reversible operation and state clock; fitting the gap statistic alone is not a decryption.

## Reproducer and sources

- Reproducer: [`sims/t7_smooth_heterogeneity_plant.py`](../sims/t7_smooth_heterogeneity_plant.py). Run from repository root with `python sims/t7_smooth_heterogeneity_plant.py`; `--quick` reduces draws.
- Input: [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json).
- External observation: [Round44 T7 results](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md), [preregistration](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/PREREG.md), [implementation](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/b3lib.py).
