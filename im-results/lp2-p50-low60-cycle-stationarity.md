# p50 low-value repeat enrichment recurs across consecutive 256-rune clock cycles

**Director task:** #1577  
**Classification:** temporal-stationarity result for the fixed phase-zero p50 clock; no plaintext, key, or opcode recovered.

The established p50 low-value / leading-zero association is distributed across the manuscript rather than being carried by one temporal region. Under the unchanged global row-major phase-zero clock, the p0-p55 first-rune positions form **51 consecutive clock cycles**: 50 full 256-rune cycles plus a final 156-rune partial cycle.

## Frozen cycle census

Across all original within-page adjacent-pair opportunities:

- total adjacent-equal events: **86**;
- low-class events: **33**;
- ordinary-class events: **53**;
- cycles containing at least one low-class repeat: **28/51**.

No cycle contains more than **2** of the 33 selected repeats. The largest single-cycle share is therefore **2/33 = 6.06%**. The five highest cycles together contribute **10/33 = 30.30%**. Those five are cycles 3, 18, 23, 25 and 32; each contributes exactly two low-class repeats.

This is incompatible with the association being numerically carried by a tiny run of consecutive 256-rune epochs.

## Common-effect versus cycle heterogeneity

Condition separately on each cycle's:

1. low-class and ordinary-class opportunity counts, and
2. total adjacent-equal event count.

A common conditional odds multiplier for low-class versus ordinary-class repeats is:

- log odds: **0.71462054**;
- odds multiplier: **2.04341114**.

To test whether separate cycle-specific effects are required, compare the common conditional model with independently fitted per-cycle odds over cycles containing at least one repeat. A deterministic **2,000-draw conditional bootstrap** from the fitted common model gives:

- heterogeneity statistic: **45.75313**;
- bootstrap tail: **0.904048**.

There is therefore no evidence that the low-class enrichment changes materially from cycle to cycle. Sparse cycle counts limit fine-grained power, but the observed variation is actually very ordinary under one stationary effect.

## Contiguous temporal block holdout

Five contiguous blocks were frozen before scoring:

| held-out cycles | held repeats | selected hits | null expected | training odds | held-out gain |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0–9 | 16 | 6 | 3.7520 | 2.0612 | +0.7897 nats |
| 10–19 | 11 | 5 | 2.5725 | 1.9537 | +1.1369 |
| 20–29 | 24 | 9 | 5.6471 | 2.0751 | +1.1713 |
| 30–39 | 17 | 8 | 3.9792 | 1.8622 | +1.8537 |
| 40–50 | 18 | 5 | 4.2165 | 2.2993 | -0.6109 |

All **5/5** held-out temporal blocks have more selected repeats than their rune-opportunity-conditioned no-effect expectation. The trained common effect improves held-out conditional likelihood in **4/5** blocks, with summed gain **+4.34070 nats**. The final block retains the correct direction but is too weak for the fitted ~2× effect, producing the one negative likelihood gain.

Training odds from the complementary four blocks remain tightly grouped from **1.862 to 2.299**.

## Decision

**The p50 low-value repeat association is temporally broad and compatible with a stationary 256-state global clock.** Its 33 selected repeats are spread through more than half the clock cycles, no cycle contributes more than two, cycle heterogeneity is entirely ordinary under a common-effect model, and every predeclared contiguous temporal block preserves the enrichment direction.

Together with #1535 and #1546, the present architecture is increasingly specific:

- the association survives conditioning on GP29 rune identity;
- it transfers across source chapters;
- it recurs across consecutive 256-rune clock cycles;
- its predictive signature is concentrated on self-transitions rather than a broader 29-way successor alphabet.

This strengthens the p50 object as a repeating **surface/state clock clue**. It still does not identify the reversible opcode or key that generated the ciphertext. The clock origin and human-readable source selector remain separate questions.

## Reproduction

- `sims/lp2_p50_low60_cycle_stationarity_sft.cjs`
- `.github/workflows/agent5-p50-cycle-stationarity-manual.yml`
- successful CI: https://github.com/FlareZ123/liber-primus/actions/runs/44394974077
