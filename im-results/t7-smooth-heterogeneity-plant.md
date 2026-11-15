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

## Printed-line convention and original-block order (Agent27, 15 November 2026)

**Prior-art correction.** [Agent31's original-source line-conditioned study](lp2-doublet-gap-original-source-conditioned.md) completed this localization on **14 November 2026** and already reported p=**0.23194420** under its 40,000-draw null. It assigns each repeated pair to the printed line containing its **first rune**, and excludes physical-page joins from eligible positions. The second-rune-assigned test below is a distinct *alignment choice*, **not a new discovery of line occupancy**. A newly added original-source SFT comparison preserves Agent31's first-rune convention and independently reproduces p≈0.234 with 20,000 draws. Both definitions find the observed within-line positioning unsurprising after conditioning on the observed line-event counts. The incremental experiment here is the **whole-line/whole-page order permutation** below, which preserves each block's existing source repeat events.

The eight dollar-delimited transcription groups used below differ from the **nine visually marked source sections** of lengths [729,1145,1729,1903,1021,1433,1680,3008,308], see [original visual atlas](lp2-global-original-visual-section-map.md). The eight groups here are analysis strata rather than author-verified cipher resets. The source constraint was tightened by parsing the **unchanged rune transcription against all 12,956 canonical physical-page indices**, preserving original `/` printed-line breaks and `-` word breaks. Exactly **86** equal-rune sites occur in **594 nonempty transcription lines**, spread over **83** lines; only line IDs 95, 265 and 303 contain two sites. The 85 site gaps have Pearson lag-1 correlation **+0.380019689241**. The site-level boundary census, classified by the separator preceding the second glyph, is:

| Adjacent-rune transition class | Eligible transitions | Equal-rune sites |
| --- | ---: | ---: |
| Inside one printed word | 9,640 | 60 |
| Across a printed hyphen / word break (one also crosses a line) | 2,721 | 22 |
| Across a printed full stop | 174 | 1 |
| Across a printed line wrap without hyphen | 388 | 3 |
| Across a physical-page wrap | 32 | 0 |

Run separate conditional random-site controls which preserve the **observed number of original doublet sites within each stratum** and uniformly reassign eligible transitions *within* strata, then evaluate the same gap correlation. An independent preliminary xorshift32 experiment gave:

| Fixed observed site count by | Monte Carlo exceedances | One-sided add-one p | Null mean correlation |
| --- | ---: | ---: | ---: |
| Eight dollar-delimited transcription groups | 0 / 12,000 | 0.0000833 | −0.0288 |
| Physical page | 70 / 12,000 | 0.00592 | +0.2305 |
| Physical page × separator class | 145 / 25,000 | 0.00584 | +0.2310 |
| Printed line | 1,776 / 20,000 | 0.08885 | +0.3671 |
| Printed line × separator class | 3,669 / 20,000 | 0.18349 | +0.3721 |
| Fixed 1,000-rune block | 3 / 12,000 | 0.000333 | +0.0387 |

The included [read-only original-source CJS SFT](../sims/t7_physical_line_conditioned_null_sft.cjs) independently resamples the six conditional families with 20,000 draws each, publishes its fixed seeds and add-one p-values, and asserts source agreement, the 86-site census, the original +0.380 correlation, and all five boundary counts. Minor numerical Monte Carlo differences from the preliminary table are expected because its seeds/draw counts are distinct.

**Order-destroying original-block controls.** To separate source order from source-site placement, a second fixed-seed experiment permutes the **intact site-indicator blocks** at the original physical-page or printed-line level. Every block retains its original length and its exact observed repeated-rune offsets; only the order of complete blocks changes. On independent preliminary 16,000-draw runs:

| Original-order feature destroyed | Exceedances | Add-one one-sided p | Null mean gap-ac1 |
| --- | ---: | ---: | ---: |
| Entire physical-page order | 43 / 16,000 | 0.00275 | +0.0771 |
| Physical-page order *within each of eight transcribed dollar groups* | 2 / 16,000 | 0.000187 | +0.0652 |
| **Physical-page order within nine original source-visible chapters** | **5 / 20,000** | **0.000299985** | **+0.06860** |
| Entire printed-line order | 5 / 16,000 | 0.000375 | −0.0116 |
| Printed-line order *within each original physical page* | 161 / 16,000 | 0.0101 | +0.2482 |

The original ordering of **which lines and pages carry the sites** is therefore consequential to the gap-ac1 statistic, even when local doublet sites themselves are frozen. This block permutation is intentionally a *site-indicator null*: shuffled page/line joins are **not** cryptographically re-encrypted and do not represent a generative model of the text. No one ordering result proves an intended cipher or can be used to select a key. The same read-only CJS SFT runs five additional reproducible 20,000-draw block permutations, with original block reconstruction assertions. The fifth, source-faithful nine-visual-section page permutation passed in [Windows Node22 run 43712097887](https://github.com/FlareZ123/liber-primus/actions/runs/43712097887): 5/20,000 above observed p=0.000299985 and null mean +0.0685989. Both the first-stage null [Windows run 43709144740](https://github.com/FlareZ123/liber-primus/actions/runs/43709144740) and the block-order [Windows run 43709563785](https://github.com/FlareZ123/liber-primus/actions/runs/43709563785) passed on Node22; the latter yields within-page line-shuffle **205/20,000**, p=**0.0102995** and within-chapter page-shuffle **3/20,000**, p=**0.00019999**. Its [Windows Node22 source-runner](https://github.com/FlareZ123/liber-primus/actions/workflows/manual-readonly-commonjs-sft.yml) runs directly on the committed corpus.

**Interpretation and caveat.** The unusual gap ordering persists when only chapter or page site totals are held fixed, and is largely captured by *which printed lines already contain a site*. The exact-line p is approximately 0.09 with the second-rune convention and 0.23 with the previous first-rune convention; this difference is a sensitivity to the event's assigned line, and neither supports an anomalous within-line location effect. This narrows the unexplained structure to **ordered line occupancy** rather than precise within-line rune positions. Conditioning on observed line occupancies is deliberately postselected; the resulting p≈0.09 does **not** establish a 2014 authorial line-reset cipher, identify a key, or independently explain why particular lines contain doublets. The physical-page × separator-class null still gives p≈0.006, while four events actually cross a printed line boundary (three pure wraps and one also hyphen-delimited), so the data do not themselves imply a line-edge copying mechanism. This tempers the earlier inference that a short-memory event process is uniquely favored over a source-layout-linked process.


## Next discriminating question

Find a creator-era *source clue* that selects a line-sensitive, **reversible** GP29 operation before evaluating this same anomaly. It must predict which untouched original lines will carry doublets and yield contiguous coherent plaintext with independently sourced state and exact forward re-encryption. A line-conditioned synthetic fit to the existing 86 sites alone would be circular; the alternative short-memory state mechanism and unencoded editorial/source heterogeneity remain viable.
## Reproducer and sources

- Reproducer: [`sims/t7_smooth_heterogeneity_plant.py`](../sims/t7_smooth_heterogeneity_plant.py). Run from repository root with `python sims/t7_smooth_heterogeneity_plant.py`; `--quick` reduces draws.
- Input: [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json).
- External observation: [Round44 T7 results](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md), [preregistration](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/PREREG.md), [implementation](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/b3lib.py).
