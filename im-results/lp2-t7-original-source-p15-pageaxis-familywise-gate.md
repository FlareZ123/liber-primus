# Original LP2 doublet-clustering T7: global mechanism signal versus p15-page identification

**22 November 2026, Agent12, independent original-input decision.** The source-original LP2 ciphertext has **86 adjacent equal-rune sites among 12,956 rune tokens**. Their successive gap lengths have Pearson lag-one correlation **+0.380019689**. Under a preregistered-style, fixed-count and hard-core-spacing null of 30,000 reproducible draws, **14** reach its absolute value or greater, **add-one two-sided Monte Carlo p = 0.000500**. This supports a *nonstationary emission-rate phenomenon* that matters for mechanistic decryption; it is **not a plaintext recovery or proof of the constructor's intended filtering algorithm**.

The main T7 anomaly was identified **outside this repository** by [Dukotah R44 B3 (9 November 2026)](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) and checked by [njloof campaign10 (16 November 2026)](https://github.com/njloof/cicada-lp2-sweeps/blob/main/sweeps/2026-11-t7-replication/REPORT.md), with reported p values 0.0010 and 0.0006. Both identify local large consecutive gaps. This study adds a **first-party-corpus implementation and a specific 55-page familywise test** of whether the original p15 infinity/Fibonacci illustration can independently select that unusual interval. Those external researchers had already investigated fixed-window p15 [campaign30](https://github.com/njloof/cicada-lp2-sweeps/blob/main/sweeps/2026-11-t7-window/REPORT.md); we do not claim first discovery of its single-axis anomaly.

## Original-source observations that can constrain future decipherment

The actual successive repeated-rune *site positions*, zero-based second rune, include **2740, 3140, 3852, 4389**, with three consecutive gaps **400, 712, 537**, totaling **1,649 rune steps**. This is a **doublet-sparse region, not a doublet-free gap**: there are three repeat sites inside the 1,650-rune vicinity. The earlier "doublet-free span" wording in external README files was formally corrected by its authors. Under 0-based book physical pages, the interval extends from **p11 through p18**; p15 contains the original **4×4 Fibonacci-prime-number table with one red 3299 and an infinity glyph**. Original p15 rune offset starts at full-corpus index **3603**, with nine highlighted title runes immediately before the numeric panel and red 13-markers at title offsets 0, 9, 20.

An original page15 numeric-axis landmark at **3611.5** gives fixed source window **[2787,4437)** of 1,650 positions, with exactly **3** repeats. Of this same window's 1,650 rune positions, **380** begin an original printed word (the full corpus has **2,895** breaks). No repeat site in that window coincides with a word start. The sparse period therefore does not arise simply because this region has fewer printed word breaks. The original corpus's **23** repeated-rune sites at word starts, and **63** within words, are pinned.

A second independently defined source family consists of every **printed physical page midpoint**, including the p15 midpoint, as the center of one full 1,650-position window. There are 55 rune-bearing page centers because p50 contains only numerical printing. P14 and p15 are the *two* lowest centers, each with **3** repeats; p15 midpoint window **[2857,4507)** also has 3.

## Crucial original-data selection correction

Null: preserve 86 events, exact source length12,956, and observed nearest-site hard-core gap of at least **6** by uniformly drawing 86 positions among 12,955 eligible pair positions subject to that gap. The exact combinatorial bijection chooses a uniform 86-subset of **12,530 transformed positions** and adds 5 times the sorted rank. 30,000 draws, deterministic pseudorandom seed `0x33012026`, unbiased integer mapping, no post-result alteration. The null conditions on *global site count and spacing*, not manuscript word lengths or a known cipher machine.

| Prespecified quantity for the run | Original | Null exceedances / 30,000 | Add-one p |
| --- | ---: | ---: | ---: |
| Absolute lag-one gap correlation at least 0.3800197 | 0.3800197 | 14 | **0.000500** |
| Exactly named p15 midpoint window with ≤3 sites | 3 | 64 | **0.002167** |
| **Minimum count across all 55 page-centered windows** ≤3 | 3 | 2,382 | **0.079431** |

The page15 midpoint *alone* is unusual, but **a page-center scan can find an equally sparse region under a no-source-selector null with 7.94% frequency**. Because the p15 axis/window was proposed after the T7 unusual region was known, its uncorrected 0.002167 is **not evidence that the p15 Fibonacci numeral artwork operates this cipher**. If the author-selected p15 key transition is real, it requires a second independent instruction, reproducible plaintext, or predicted mechanism behavior across original pages. The global T7 anomaly remains an important architecture constraint distinct from that inference.

## Mechanistic consequence and next experiment

The original gap ordering is inconsistent with a simple **constant-rate** residual anti-repeat process under this fixed-count hard-core null. That raises source-motivated classes such as session boundaries, variable rejection probabilities, or state-dependent key consumption. It does **not** select one mechanism, identify cipher keys, or license retrofitting a new offset around p15. A valuable next test would require a manuscript-selected *rule* predicting where a cipher rejection switch should occur and then compare a predicted original nonoverlapping span. Bounded key-consumption or stateful inverse candidates must produce coherent unknown plaintext and hold up on a disjoint page.

[Reproduce this entire analysis with single-source Node22 SFT](../sims/lp2_t7_p15_axis_familywise_original_sft.cjs). The original input is `resources/liber-primus/lp2-corpus.json`, p15 red marks in `resources/liber-primus/lp2-ink-annotations.json`, and exact printable word breaks parsed by `sims/lp2_word_pages.cjs`. No 56 unknown LP2 pages were deciphered.
