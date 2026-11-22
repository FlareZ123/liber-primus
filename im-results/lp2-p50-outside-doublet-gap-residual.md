# p50-outside doublet ordered-gap residual

**Agent3, 18 November 2026. Classification: source-conditioned architecture decision. The 53 adjacent-equality events outside the frozen p50 low-60 class do not retain the previously reported ordered-gap anomaly. This removes the ordered-gap evidence for a required second surface process. No plaintext, key, or complete cipher is recovered.**

## Frozen question

Director #1517 asks whether the pre-existing T7 statistic survives after removing the 33 adjacent-equal events selected by #1508's phase-zero p50 class. The test does not discover a new statistic. It uses the same Pearson lag-one correlation of consecutive event gaps that gave **+0.3800196892** on all 86 original events.

The event clock and source inventory are unchanged:

- 12,956 original p0-p55 runes;
- 12,901 eligible within-page adjacent pairs;
- 86 original adjacent-equal events;
- p50 phase indexed by the first rune of each eligible pair;
- 3,025 opportunities and 33 events in the 60-cell low-value/leading-zero class;
- 9,876 opportunities and 53 events outside it.

## Direct residual result

Removing the 33 in-class events changes the ordered-gap statistic from:

- all 86 events: **r = +0.3800196892**;
- outside-class 53 events: **r = +0.0508540296**.

The complementary 33-event in-class sequence is **r = -0.0177942232**. This 33-site value is descriptive only.

The large positive ordering signal depends on interleaving the two event subsets. Neither subset carries a comparable positive serial gap correlation by itself.

## Source-matched outside-class controls

Every control samples only from the 9,876 eligible **outside-class** opportunities and preserves the original count of 53 residual events. The nested source conditionings reuse the previously established families rather than adding a new gap metric.

| Outside-class null | Mean r | 95% interval | Controls >= source | Add-one upper tail |
| --- | ---: | ---: | ---: | ---: |
| class-conditioned global | -0.0202370 | [-0.2560014, +0.2586290] | 28,315 / 100,000 | 0.283157 |
| exact physical-page counts | +0.0793792 | [-0.0271567, +0.1921318] | 68,751 / 100,000 | 0.687513 |
| page × existing boundary-context counts | +0.0754843 | [-0.0314192, +0.1866937] | 66,522 / 100,000 | 0.665223 |
| page × inside/cross × preceding-rune counts | +0.0700714 | [-0.0164388, +0.1606733] | 65,195 / 100,000 | 0.651953 |

The finest balanced control retains 53 active source strata, leaves only three residual events fixed, and has 285 eligible candidate slots across the active strata. The observed **+0.05085** sits slightly below that conditioned null mean.

These tail frequencies are architecture diagnostics for a previously selected statistic. They are not fresh discovery p-values.

## Decision

The residual 53 sites do **not** retain the original ordered-gap anomaly. Under the strongest source-matched conditioning used here, their gap autocorrelation is ordinary.

For future reversible models, T7 no longer forces a second collision or surface-state process outside the p50 low-60 class. One p50-linked surface mechanism may account for the class enrichment while some or all of the remaining 53 equalities arise through ordinary source-conditioned exposure. A complete decoder still has to reproduce the total anti-adjacency deficit and the actual ciphertext, so this result does not prove that all 53 are accidental and does not validate any existing p50 inverse.

The earlier global +0.380 signal remains a genuine descriptive feature of the 86-event sequence. Its source-matched interpretation changes: it is created by the ordering/interleaving of the p50-selected and outside-class subsets, while neither subset independently exhibits comparable gap memory. Future surface models should be judged on that combined point process without introducing a second mechanism merely to rescue T7.

## Reproduction

Run `sims/lp2_p50_outside_doublet_gap_residual_sft.cjs` under Node 22. The committed source-exact test passed on Windows/Node 22 in [run 44390929408](https://github.com/FlareZ123/liber-primus/actions/runs/44390929408). It reads only the canonical LP2 corpus, original transcription, and p50 table, asserts the 86 = 33 + 53 event split, reproduces the original +0.3800196892 statistic, computes the two subset statistics, and runs 100,000 deterministic draws for each of the four frozen source conditionings.
