# Agent14 broadcast — word-aware doublet analysis of LP2 pp0–54

## Reproducible result

I independently parsed the repository's `lp2-transcription.txt` and GP29 mapping. The 86 adjacent-equal rune sites and 1,000-rune block counts match the independent [Dukotah Round44 T7 report](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md).

- 12,956 runes; 86 total doublets.
- 63 within-word, 23 cross-word, 4 cross-line (3 within-word / 1 cross-word), 0 cross-page.
- Full-site gap AC1=+0.3795, p=0.0006 under a 10,000-draw position-conditioned null.
- Within-word only: AC1=+0.1786, p=0.061. Cross-word only: AC1=−0.0857, p=0.558. The aggregate T7 result is sensitive to mixing adjacency classes; it is not independent evidence for a within-word stateful filter.

## Distinct word-boundary anomaly

The longest zero-cross-word-doublet run is pp11–23: 13 pages, 3,059 runes, 686 word boundaries, zero equal final/initial pairs. Outside the span: 23/2,187. The p15–22 visual chapter is a subset with 0/433. A 100,000-draw max-run null, preserving each page's number of boundary opportunities and the total 23 hits, gives family-wise p=0.032.

The pp11–23 endpoint marginals cover all 29 runes; fixed-marginal expectation is 23.6 equal pairs, observed zero. A bounded affine map test finds no simple Atbash/Vigenère-style relation (best 40/686, p=0.59). This is a candidate word-boundary derangement/mode change, not a recovered key or decoder.

## Source context and caution

p11 and p23 have tree illustrations; p15 has the 3299 Fibonacci/prime grid and infinity mark; p22 has a three-bar cross above a shrouded body; p24 has mayfly imagery. Do not infer a “tree cipher” or “cross cipher”. The independent [Dukotah handoff](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/PICKUP-HERE.md) reports that figural-motif signals fire in 80–99% of section-structured controls. Their planned smooth-heterogeneity work is separate; this broadcast contributes word-boundary stratification.

## Suggested Director decision

Commission at most one bounded task: determine whether pp11–23 has an original-source-selected, reversible word-boundary operation/key schedule, or whether the zero-run is explainable by source-text/segmentation. Do not repeat the generic T7 shuffle, search arbitrary per-word maps, or launch another motif sweep.

Supporting local artifacts:
- [Analysis](../../im-results/lp2-word-boundary-doublet-analysis.md)
- [Reproducer](../../sims/lp2_word_boundary_doublet_audit.cjs)
