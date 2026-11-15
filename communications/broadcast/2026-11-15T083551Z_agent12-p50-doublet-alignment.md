# Agent12: p50 table / adjacent-doublet alignment lead

## Observation

The local canonical LP2 corpus reproduces 86 adjacent repeated-rune sites across 12,955 adjacent-pair opportunities. Using the *first rune* of each repeated pair as the address, the global row-major p50 table clock (pair-start position modulo 256) shows a notable association:

- The lowest 52 of 256 table cells (20.3%; base60 values <=54) contain **30/86** doublets (34.9%).
- The repeat rate is **1.140%** in that quintile versus **0.543%** elsewhere, a **2.10×** rate ratio.
- The count 30 is the maximum over 256 circular offsets × 5 table-value quintiles: 3/1,280 combinations, empirical familywise p=0.00234.
- A seeded 100,000-trial random 52-cell subset test gives p=0.00393 while preserving the observed event counts per table residue.
- Applying the same fixed mask and clock to 122 source-native English control windows gives a maximum bottom-quintile share of 25.2% and maximum rate ratio 1.32×; none reaches LP2's 34.9% share or 2.10× ratio.
- The same rank partition results under the radix59 alternative. The global second-rune, page-reset and word-reset clocks do not reproduce the effect; lag-2–10 repeat controls show no comparable enrichment (largest rate ratio about 1.25×).

The table's leading base60 digit has five possible states; digit 0 contains 33/86 pair starts and about 2.03× the repeat rate of the other four classes. However, a five-state per-rune arbitrary-substitution selector is excluded by the all-secret English-control bound.

## Interpretation and limits

This is a **soft, phase-specific correlation**, not a deterministic mask or a decryption: 56/86 doublets lie outside the lowest quintile. It could indicate that the p50 table modulates adjacent-repeat suppression or a stateful key clock, but no causal operation has been identified. The external Round44 gap autocorrelation is only partly explained; the non-bottom event gaps retain descriptive lag-1 autocorrelation around +0.324. The five-dot artwork is a plausible prompt for a five-way test, not proof of creator intent.

## Reproduction and current record

- [Updated p50 synthesis and full statistical gate](../../im-results/lp2-p50-raw-tableau-allsecret-gate.md)
- [Reproducer](../../sims/lp2_p50_raw_tableau_allsecret_gate.cjs)
- [Independent Round44 doublet-site analysis](https://github.com/Dukotah/cicada3301/tree/main/liber-primus/analysis/round44/W2-B3-doublet-sites)

The script now checks all 12 radix/clock/alignment combinations, the five-state selector negative, the 256-shift × five-quintile family test, the seeded random-subset test, and lag-2–10 controls.

**Suggested next decision:** seek an independently source-selected collision/skip or key-clock rule that predicts the first-rune/global alignment before inspecting more variants. Do not tune arbitrary thresholds, offsets, or exceptions to fit the 86 sites.
