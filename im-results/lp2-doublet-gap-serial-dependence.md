# LP2 doublet interarrival gaps: independently reproduced short-lag dependence

**Classification: reproducible structural statistic, not a decryption or an identified cipher mechanism.** The narrow claim is positive lag-1 dependence in the ordered gaps between adjacent equal-rune pairs. The data do **not** establish a smoothly drifting or page-resetting anti-repeat rate.

## Canonical source and counts

Using the repository's canonical original-rune transcription, pages **0–55** contain **12,956** runes. There are **86** adjacent equal-rune sites, separated by **85** interarrival gaps. No doublet crosses a page boundary, and the 86 sites involve **28 of the 29** GP rune values.

The ordered gap sequence has Pearson lag-1 autocorrelation **0.3800196892**. It is robust to deleting any one gap-pair: leave-one-out lag-1 values range **0.2784–0.4192**. The next lags are **0.0242, −0.1368, −0.1255, −0.1753**; the signal is concentrated at lag 1 rather than showing a long smooth decay.

A deterministic permutation test shuffled the **observed 85 gaps** 100,000 times with seed 3301, preserving their exact marginal distribution and testing only whether their ordering is exchangeable. The upper-tail p-value is **0.0004300**; the two-sided value is **0.0004400**. This is a different null from the site-matched shuffle used by the independent [Dukotah round-44 B3/T7 analysis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md), whose reported p-value is 0.001. The independent result is consistent with that finding.

## Controls that narrow the interpretation

The page-level rate sequence does not show corresponding lag-1 persistence. Excluding the empty numeric-table page 50 leaves **55 nonempty pages**; the Pearson lag-1 correlation of their doublet rates is **0.0441**, with a 100,000-shuffle ordering p-value of **0.3197**.

The 13 counts in successive 1,000-rune blocks are **[8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]**. Their lag-1 correlation is **−0.1900**, not positive. Therefore the gap statistic does not by itself support the stronger description “smooth regional drift” or “page-session rate changes.” It establishes a short-lag dependence in event spacing; clustered renewal, local intensity modulation, a stateful filter, or another process remain possible explanations.

As a scope control, the complete canonical stream through the two solved pages (pages 0–57) contains **13,136** runes, **89** doublets and **88** gaps. The full-stream gap lag-1 correlation is **0.3880**; the solved pages add three doublets. The pattern is therefore not confined to the currently unsolved pages, although the solved-page addition is too small to identify a mechanism.

## Decision

Treat this as a real structural constraint worth preserving, but **do not call it a nonstationary filter as an established fact**. The page-rate and block-count controls argue against simple page-level or smooth block-level drift. A plausible follow-up would have to specify a source-motivated short-memory/renewal mechanism in advance and predict held-out doublet sites; generic HMM, change-point, or cipher-family sweeps are not justified by this statistic alone.

Most importantly, this statistic does not recover a key or plaintext. It changes the next research question from “is the doublet rate globally constant?” to “what source-selected operation could create this specific lag-1 dependence, and can that operation predict unknown original ciphertext?” No new cipher claim is promoted to established results.

**Reproducer and exact arrays:** [sims/lp2_doublet_gap_order_sft.cjs](../sims/lp2_doublet_gap_order_sft.cjs) and [im-results/lp2-doublet-gap-order-results.json](../im-results/lp2-doublet-gap-order-results.json).
