# Predeclared control test: p50 low60 base60-bit0 repeat state

**Agent50, Director Issue #1616, 18 November 2026.** This file freezes the test before any clear-control repeat counts are computed.

## Frozen selector and event

The selector is exactly the published conventional-base60 conjunction from `sims/lp2_p50_low60_even_conjunction_sft.cjs`:

- row-major p50 table flattened to 256 cells;
- phase is `runeOffset mod 256`, starting at phase 0 for each independent control register defined below;
- a pair is selected iff its phase cell begins with printed `0` and the conventional base60 index of the token's second printed character has bit0 = 0;
- the event is adjacent equal GP29 runes;
- only adjacencies internal to the declared physical page or source register are counted.

No phase scan, phase fit, mask change, token relabeling, alternate alphabet, alternate bit, reverse clock, or reset search is allowed.

## Primary disjoint source-original control panel

Use the six physically printed clear-GP LP1 pages identified by the repository's transcription audit: p3, p8, p9, p10, p11, p14. Add solved LP2 physical pages p56 and p57 from the preserved solved-source records. These eight pages are disjoint source-native GP material.

Each page is an independent block. Phase 0 is fixed at the first rune of that page, including when the page is shorter than 256 runes. Cross-page pairs are excluded. This deliberately gives the fixed p50 state a fair, source-visible page-local alignment without any optimization.

Primary statistics:

1. selected and complement exposure/repeat counts;
2. selected/complement repeat-rate ratio;
3. Jeffreys-smoothed leave-one-block-out predictive log-likelihood gain of the two-rate selector over one common repeat rate;
4. number of held-out blocks with positive gain.

## Secondary solved-LP1 plaintext-register panel

Use the first seven LP1 records in `resources/external/relikd-solved-gp29-native-v1.json`, excluding the final p56/p57 records. Each record is an independent solved-plaintext register with phase 0 fixed at its first rune. Only adjacent runes inside a record are counted.

These records are **not pooled with the primary panel**, because some solved plaintext overlaps content that is also present among the source-original clear LP1 pages and the record source does not preserve every original physical page seam. The panel is a separate diagnostic required by #1616's solved-LP1 control request.

## Unknown-LP2 benchmark

Do not recompute or retune the unknown-LP2 selector. The frozen benchmark is the already published original-cipher result:

- selected 29/1809;
- complement 57/11092;
- nine-chapter leave-one-out gain +10.374652185494462 nats;
- positive held-out chapters 7/9.

## Synthetic positive

Generate eight deterministic Markov GP29 blocks with the exact rune lengths of the primary control pages. Use seed `0x33015016`. At each within-block pair, repeat the prior rune with probability 0.08 when the frozen selector is selected and 0.02 otherwise; on nonrepeats draw uniformly from the other 28 symbols. Apply the same scoring code and fixed phase0 alignment.

This positive exists only to verify that the exposure and holdout test detects a true state-dependent repeat process.

## Decision rule

The state is considered **specific to unknown LP2 within these controls** if:

- the synthetic positive is directionally recovered (selected rate > complement rate and positive total holdout gain);
- the primary disjoint clear panel does not show a comparable selector effect; and
- the secondary solved-LP1 panel does not reproduce the unknown-LP2 pattern.

"Comparable" is predeclared as both a selected/complement repeat-rate ratio >= 2.0 and leave-one-block-out gain >= 5.0 nats. If either clear panel reaches both thresholds, #1616 should downgrade the p50 bit0 state as potentially ordinary GP structure. Otherwise report the exact control effects and their distance from the frozen LP2 benchmark without inventing decoder semantics.
