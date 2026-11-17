# Original LP2 doublet-gap correlation under source-boundary-conditioned clocks

## Finding and limits

The unmodified 55 rune-bearing unknown LP2 pages comprise **12,956 GP29 runes**. The **86 adjacent-equal doublet sites** reproduce the independently reported source positions exactly, from index 121 to 12,938, without triple rune runs or cross-page doublets. The lag-one Pearson correlation of the 85 consecutive site gaps is **+0.380019689**. [Dukotah's 9 Nov 2026 source study](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) first flagged this anomaly against a book-wide stationary-slippage model; this report tests its source-clock interpretation independently.

The original physically visible nine chapter groups do **not** absorb the gap correlation when their **exact observed doublet counts** are held fixed (conditional tail `p=0.00020`). Conditioning on 56 physical pages absorbs substantially more (`p=0.00550`), while fixed 125-rune local counts absorb the anomaly entirely under this diagnostic (`p=0.420`). This is consistent with relatively local variation in repeat-survival rate or a different stateful generation process; it **does not** infer a 125-rune key period, a particular filter, or any plaintext. Fine-grained count-conditioning inevitably discards statistical information and can explain an anomaly by construction.

## Exact original-input experiment

Reproducer: [`sims/lp2_doublet_rate_clock_conditional_sft.cjs`](../sims/lp2_doublet_rate_clock_conditional_sft.cjs). Read-only CommonJS on Node.js 20/22, input [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json). Every variant uses 30,000 deterministically seeded null replicates. Each replicate independently samples **exactly the source-observed number** of site positions inside every listed interval, uniformly among eligible positions, excluding source physical-page last-rune positions. A whole-draw rejection excludes any adjacent sites. The accepted draws are uniform **conditional on both the group counts and absence of overlapping doublets**. The gap statistic and source runes are identical across variants.

| Conditioned site-count strata | Original gap ac1 | Null mean | One-sided empirical p (add-one) |
|---|---:|---:|---:|
| Global (1) | +0.38002 | -0.01066 | 0.000400 |
| Nine original chapters | +0.38002 | -0.02874 | 0.000200 |
| 56 physical pages (p50 empty) | +0.38002 | +0.23182 | 0.005500 |
| 2,000-rune blocks | +0.38002 | -0.02803 | 0.0000333 (zero exceedances) |
| 1,000-rune blocks | +0.38002 | +0.03837 | 0.000433 |
| 500-rune blocks | +0.38002 | +0.08886 | 0.000933 |
| 250-rune blocks | +0.38002 | +0.24528 | 0.01660 |
| 125-rune blocks | +0.38002 | +0.37064 | 0.41992 |

For the exact no-adjacent correction, rejected-sample rates range from approximately 41% to 46%; the earlier sequential-neighbor rejection shortcut produced near-identical chapter/page diagnostics but is superseded by this exact conditional sampling.

**Statistical scope:** the original source positions, nine chapters and physical page boundaries are independent artifact facts. The block widths and this family of conditional tests were chosen while inspecting an already-reported anomaly, so treat their p-values as *descriptive*, especially the minimum across eight variants. The high p-value for 125-rune blocks is conditional on over one hundred fitted local counts. The genuine cipher's doublet-slip generation model remains unidentified, and no authentic unknown text or key is recovered.

## Cryptanalytic decision

A **chapter-reset-only homogeneous slip process** is a poor explanation of the observed gap serial correlation even after granting each original chapter its own measured slip rate. The physical-page count pattern explains more, but substantial within-page placement structure remains under a page-uniform positional null. A future source-directed decoder may need a slower hidden state or a local varying suppression rate. This evidence should **not** justify arbitrary key-clock scans: the data do not select a specific state transition or consumer. Existing external source study already excluded the adjacent-doublet positions/values as direct 29-ary readable plaintext under 116 affine/reverse maps; do not repeat that channel sweep.
