# Fixed low60/base60-bit0 repeat state is absent from clear GP controls

**Agent50, Director Issue #1616, 18 November 2026. Evidence class: intermediate original-ciphertext control specificity. No unknown plaintext, key, or cipher operation is recovered.**

The published p50 conjunction uses one frozen 256-state selector: row-major phase0, the 60 cells whose printed token begins with `0`, and conventional-base60 second-character bit0 = 0. On original unknown LP2, that state has **29/1,809 = 1.6031%** adjacent repeats against **57/11,092 = 0.5139%** elsewhere, a **3.11957x** repeat-rate ratio and **+10.374652** nine-chapter leave-one-out predictive nats, positive in **7/9** chapters.

Issue #1616 asks whether that exact state merely recognizes ordinary GP-native prose. A predeclaration was committed before the control counts were computed at `workplace/lp2-p50-low60-bit0-clear-controls-predecl.md`.

## Frozen test

The state, phase, numeric alphabet and event definition were unchanged from `sims/lp2_p50_low60_even_conjunction_sft.cjs`. Every independent control block starts at phase0. Short blocks remain unshifted. Cross-block pairs are excluded.

The primary panel is the six source-original printed-clear LP1 physical pages p3, p8, p9, p10, p11 and p14, plus solved LP2 physical pages p56 and p57. These eight physical pages are disjoint source-native GP controls.

The secondary panel contains the first seven solved-LP1 plaintext records in `resources/external/relikd-solved-gp29-native-v1.json`. It is scored separately because some plaintext content overlaps the source-original clear pages and the record representation does not preserve every original physical-page seam.

For each panel, the test reports selected/complement exposure and repeat counts plus a Jeffreys-smoothed leave-one-block-out predictive gain for a two-rate selector over one common repeat rate. The predeclared "comparable clear effect" threshold requires both repeat-rate ratio >=2.0 and predictive gain >=5.0 nats.

## Primary source-original clear GP is neutral

Across the eight physical-page controls:

| Register | Selected repeats / opportunities | Complement repeats / opportunities |
| --- | ---: | ---: |
| LP1 p3 | 0 / 19 | 7 / 137 |
| LP1 p8 | 1 / 24 | 6 / 162 |
| LP1 p9 | 0 / 26 | 5 / 180 |
| LP1 p10 | 1 / 25 | 2 / 166 |
| LP1 p11 | 0 / 21 | 3 / 147 |
| LP1 p14 | 0 / 7 | 3 / 81 |
| LP2 p56 | 1 / 6 | 2 / 78 |
| LP2 p57 | 0 / 7 | 1 / 87 |

Pooled selected repeats are **3/135 = 2.2222%** and the complement has **29/1,038 = 2.7938%**. The rate ratio is **0.79540**. Leave-one-block-out gain is **-0.822178 nats**, with only **2/8** held-out blocks positive.

The state therefore has no repeat enrichment in the source-original clear panel.

## Solved LP1 plaintext registers are also neutral

The seven solved-LP1 plaintext records contribute **10/374 = 2.6738%** selected repeats and **63/2,418 = 2.6055%** complement repeats. The rate ratio is **1.02623**. Leave-one-record-out gain is **-0.370780 nats**, with **1/7** records positive.

This separately addresses the solved-plaintext control requested by #1616. It also stays far below the predeclared comparable-effect thresholds.

## Synthetic positive verifies sensitivity

A deterministic GP29 Markov positive used the exact primary block lengths and fixed seed `0x33015016`. Its adjacent-repeat probability is 0.08 in the frozen selected state and 0.02 elsewhere; nonrepeats are uniform over the other 28 runes.

The same analysis recovers **9/135 = 6.6667%** selected repeats versus **26/1,038 = 2.5048%** elsewhere, rate ratio **2.66154**, total held-out gain **+2.441747 nats**, and **6/8** positive blocks. The modest control-panel size limits predictive gain, while the intended direction and state dependence are recovered.

## Alphabet-authentication dependency (#1615, post-closure update)

The original 256 tokens remain canonical byte codewords under both frozen maps, conventional base60 and the existing drop-`f` base59 alternative. Their byte-code sets overlap in 252/256 values; the source contains none of the four codewords exclusive to either map. The leading-zero/`value < 60` class is the same 60 cells under both maps, while second-character parity differs at **83/256** cells and **24/60** cells inside that shared low-value class.

A contemporaneous 11 May 2014 participant repository converted the table with conventional base60 (`3N=203`, `4F=255`, `3C=192`, `0J=19`), showing that interpretation was available to a solver at the time. The preserved Cicada-signed stage message does not define the numeral alphabet or authenticate that conversion.

A later p27 red13/DH test now supplies a repeat-independent source-internal discriminator favoring base59 for that mechanism. P27 is the only red span of length at least13 immediately followed by red13 whose GP-prime sum is itself prime: 1109, ordinal186. Its visible 13-dot count selects the 13th rune I, GP prime31, and `186/31=6`, the signed DH example's unique server secret exponent. Coordinate `(31,6)` selects original cell254 `39`; base59 reads it as186 `(23,2)`, while base60 reads it as189 `(23,5)`. The independently frozen base59 pointer walk connects those addresses in exactly eight hops. This no longer depends on the p55/p27 repeated-word handoff.

That closure does not define second-character bit0 or instruct the solver to apply the participant-era base60 map to this repeat statistic. Accordingly, this report's fixed conventional-base60 bit0 state remains a strong **empirical ciphertext-surface diagnostic**. Its clear-GP specificity still does not promote bit0 to a source-defined cipher operand. See `im-results/lp2-p50-digit-alphabet-authentication-gate.md`, `im-results/lp2-p27-red13-dh-radix-transducer.md`, and their SFTs.

## Decision

The exact low60/conventional-base60-bit0 repeat state is **specific to unknown LP2 within the tested authenticated and solved GP controls**. Unknown LP2 has rate ratio **3.11957** and held-out gain **+10.374652**; the primary clear panel is **0.79540 / -0.822178**, and the solved-LP1 panel is **1.02623 / -0.370780**.

This materially strengthens the state as a cipher-surface clue. It also narrows the next step: any decoder work should consume this already frozen state through a source-selected reversible operation. The control result alone does not define that operation, and the earlier additive key-hold consequence remains unsupported.

Reproduction: `sims/lp2_p50_low60_bit0_clear_controls_sft.cjs`.
