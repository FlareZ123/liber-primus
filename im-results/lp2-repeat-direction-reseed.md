# Repeat-centred causal direction discriminator: reseeded rank28 (#2819)

**Agent12, 25 November 2026. Decision: calibrated on planted ciphers, not prospectively supported on original LP2. No unknown plaintext or key.** The development region abstains, while the held-out region narrowly points forward. No original inverse attempted on the basis of this sign-inconsistent result.

## Mechanism and prospective statistic

Use the exact shift-then-map [repeat-rune reseeded prime-clock moving escape](lp2-repeat-rune-reseed-primeclock-escape.md) already developed for #2273, rather than another receiver. Let p_t be prime ordinal t, E=p_t mod29, K=(p_t−1) mod28, secret S a common rank permutation. A repeat emits plaintext E and resets t to the repeated ciphertext rune index. A nonzero difference D gives rank S[(log_15 D−K) mod28], then reinserts the escape and increments t. This reversible state law applies in either physical direction, with identical parameters. Reverse orientation means reversing the actual rune tape before decoding; no change of key law.

Immediately after each actual repeat, t is known regardless of the previous clock; at the j-th subsequent nonrepeat step t=C_repeat+j−1. Thus the de-shifted step u=(log_15 D−K) mod28 is the secret permutation inverse of the native plaintext exclusion rank. Its nonuniformity is invariant under any shared secret permutation. In the opposite physical direction, the same reset applied to pre-repeat steps uses a generally incorrect clock. The difference in pooled collision probabilities of these de-shifted ranks should favor the true direction for the stipulated native-plaintext plants. This is an empirical prediction, not a theorem for all plaintext distributions.

Freeze j=1..6, motivated by the already studied six-step neighbourhood, and select only equality events whose six steps on both sides are all nonrepeat and remain on the same physical page. No word-based segmentation or further punctuation subset chosen; page/equality mask fixed. Use identical eligible events in both directions, so score sign reverses algebraically under tape reversal (event index e becomes N−e). No direction-dependent eligibility. Compute delta = sum n_i(n_i−1)/(M(M−1)) forward minus reverse, pooling all 28 de-shifted rank bins. No fit of S, plaintext, or other parameters to original. Development p0–39: 60 eligible events/360 observations; holdout p40–55: 19 events/114 observations; original 86 equality events total.

## Calibration before original rank scoring

1,000 time-reversible stationary uniform nonrepeat Markov tapes conditional on the **exact original equality mask**, with the original physical page boundaries. Freeze the empirical 99th percentile of absolute delta for each region, respectively .0030021665 and .0082285359; abstain if absolute delta does not exceed that threshold. This is not the exact directed-bigram Euler null; it is a symmetric conditional-repeat-mask null. In a second independent 400-tape null batch, only 2 and 6 exceed their thresholds (99.5% and 98.5% abstention).

Four distinct plaintext pools: actual solved native GP text (circularly repeated if necessary), Gibran, Shakespeare, Emerson (canonical GP transliteration). For each of 80 trials per pool, select a random start, take 12,956 runes, independently shuffle all 28 exclusion ranks, encrypt the exact law, verify every planted rune decodes exactly, and sample the original number of eligible event windows separately in each physical region. This matches tape length, page boundaries, direction-paired event eligibility, and sample size, **not the full event-rate distribution**: plants generate more repeats than LP2 and their eligible events are thinned. No original ciphertext rank data scored during calibration. Each paired reverse plant has the exact negated score by construction, so classifications reverse identically.

| Donor | Correct development /80 | Correct holdout /80 | Wrong direction (both regions) |
| --- | ---: | ---: | ---: |
| Genuine solved native GP | 80 | 78 | 0 |
| Gibran | 80 | 76 | 0 |
| Shakespeare | 80 | 75 | 0 |
| Emerson | 80 | 77 | 0 |
| Total | **320/320** | **306/320** | **0** |

All 320 true secret keys used only for encoder/replay checks, never for direction scoring. The predeclared gate requires ≥90% correct and ≤5% wrong in each donor/region and ≥95% independent-null abstention; passes. Frozen script and calibration result committed before original test: a3440caa2b73f8a074cefb92431d5b6d48638562 / 8a04d5bcf4c7d9ea2a716cf5020e8c0fe0b24e00.

## One original application

| Physical region | Forward collision | Reverse collision | Delta | Null empirical two-sided p | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| p0–39 development | .0357938719 | .0363819251 | −.0005880532 | .57043 | Abstain |
| p40–55 held-out | .0450240646 | .0366402732 | +.0083837913 | .00999 | Forward |

The holdout crosses the frozen threshold by only .0001553 and is not an independent confirmation of a development-region direction, which was null-like. Signs differ. Do not select the favorable half retrospectively, combine p-values as though both were independently selected, change the statistic, or use the holdout alone to justify an inverse. The existing forward rank-reseed receiver also already has an exact shared-permutation singleton obstruction in #2273; no claim that the direction gate rescues it.

**Completion/fork:** calibrated direction discriminator, but original does not identify a common causal direction for this particular law. Retire this event statistic for the declared direction decision. The test neither selects a general LP2 reading order nor excludes all causal collision encoders. No new receiver proposed. No original key or plaintext.

[Reproducer](../sims/lp2_repeat_direction_reseed_calibration_sft.cjs): run without options for calibration, then `--original` for the frozen original application. [Calibration output](lp2-repeat-direction-reseed-calibration-output.json) · [original output](lp2-repeat-direction-reseed-original-output.json). Executed directly in connected V8; standalone Windows/Node CI not run. No network third-party code executed.
