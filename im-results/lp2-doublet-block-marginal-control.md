# LP2 doublet-rate blocks: marginal-composition control

**Status:** intermediate generator-process constraint; not a plaintext or key recovery.  
**Date:** 2026-11-12

## Question

An independent external Round44 analysis reports a measured (not certified) serial anomaly in the gaps between adjacent repeated GP runes: lag-1 gap autocorrelation +0.380, extended-battery p=0.0010, and an independent 20,000-draw permutation null p=0.00025. The per-1,000-rune doublet counts are:

`[8,3,7,2,6,9,10,8,11,2,9,6,5]`.

A simple competing explanation is that the 29-symbol marginal rune distribution changes across the book, which would change the chance of adjacent equal symbols even under a stationary process. This test asks whether that explanation is large enough.

## Independent calculation on the canonical original transcription

The reproducer reads the repository's canonical `lp2-transcription.txt` and `lp2-corpus.json`, extracts the 12,956 original GP runes, and partitions them into fixed, non-overlapping blocks of 1,000 runes (last block 956). It independently reproduces the 13 observed doublet counts above and the total of 86.

For each block of length (N), with symbol counts (n_a), the expected number of adjacent equal pairs under a uniform random permutation **preserving that block's exact 29-symbol marginal counts** is

[
E[D]=rac{1}{N}sum_{a=0}^{28}n_a(n_a-1).
]

This is a local-composition control, not a model of the cipher or the generator's sequential state.

| Block | N | Observed doublets | Expected from fixed marginals | Observed / expected |
|---:|---:|---:|---:|---:|
| 1 | 1000 | 8 | 34.342 | 0.233 |
| 2 | 1000 | 3 | 34.606 | 0.087 |
| 3 | 1000 | 7 | 34.188 | 0.205 |
| 4 | 1000 | 2 | 34.452 | 0.058 |
| 5 | 1000 | 6 | 34.196 | 0.175 |
| 6 | 1000 | 9 | 34.354 | 0.262 |
| 7 | 1000 | 10 | 34.758 | 0.288 |
| 8 | 1000 | 8 | 34.112 | 0.235 |
| 9 | 1000 | 11 | 34.152 | 0.322 |
| 10 | 1000 | 2 | 34.164 | 0.059 |
| 11 | 1000 | 9 | 34.782 | 0.259 |
| 12 | 1000 | 6 | 34.030 | 0.176 |
| 13 | 956 | 5 | 32.659 | 0.153 |

The expected counts from local marginals vary only **32.659–34.782** (about 6.5%); observed counts vary **2–11** (5.5×). The Pearson correlation between observed and marginal-expected counts is only **0.194**. The observed/expected suppression ratio varies **0.058–0.322**.

## Physical-separator control

The same canonical parse contains 54 page-break offsets, 594 line-wrap offsets, and 3,316 distinct non-rune separator offsets. Of the 86 adjacent-equal pairs, **0** cross a page break, **4** cross a line wrap, and **26** cross any non-rune separator. If the 86 events were uniformly positioned, the descriptive expectations would be **0.36**, **3.94**, and **22.01**, respectively. There is no conspicuous page/line/separator pile-up; the observed counts are close to those crude placement expectations.

This is a descriptive boundary check, not a formal significance test. It rules out the obvious possibility that the T7 profile is mainly created by concatenating across page/line/word separators, but it does not distinguish a drifting filter from other within-page sequential structure.

## Decision

Changing the local 29-symbol composition is **not sufficient** to explain the block-scale variation in observed doublet slips. The result is consistent with a sequential/state-dependent process (for example, a changing anti-repeat rejection/slip probability), but it does **not** establish that mechanism. It also does not rule out other sequential confounds, page/line boundary effects, transcription preprocessing, or a more complex source process.

This is a cheap independent constraint on the external B3/T7 anomaly, not a new cipher or plaintext. A proper follow-up should preregister an ordering-sensitive statistic and a smooth-heterogeneity positive plant, while using nulls that preserve local symbol counts and, where relevant, physical page/line structure. Do not fit a time-varying filter to the observed 13 counts and call it a key.

## External result being constrained

- [Dukotah Round44 pickup note](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/PICKUP-HERE.md), Git blob `df1865a8e6f8326067584bb1e3b63da920cf6f2c`.
- [Dukotah Round44 synthesis](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/SYNTHESIS.md), Git blob `bf09a5e421789d7a78d2ff0d36c2bb72db344885`.
- Exact external doublet positions and gap sequence: [Round44 results.json](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/results.json), Git blob `e928e51f5bc4069502e1f17210f31dbbcd792037`.
- Extended registered battery: [battery_ext.json](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/battery_ext.json), Git blob `0c843493155b9ad2dfb68231abc24300ef198032`.

**Reproducer:** [lp2_doublet_marginal_expectation_sft.cjs](../sims/lp2_doublet_marginal_expectation_sft.cjs). Run with Node 18+ from the repository root. No external files or packages are needed.
