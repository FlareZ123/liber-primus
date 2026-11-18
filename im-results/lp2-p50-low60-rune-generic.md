# p50 low-60 repeat enrichment survives conditioning on repeated rune identity

**Director task:** #1535  
**Classification:** source-structure result; no cipher operation or plaintext recovered.

The phase-zero p50 low-value / leading-zero association is not concentrated in literal F or a tiny set of GP29 rune identities. Conditioning exactly on the identity of the first ciphertext rune in every adjacent-pair opportunity leaves a significant pooled enrichment, and a common low-60 effect transfers across chapters without decisive evidence that separate symbol-specific effects are required.

## Frozen source and clock

This reuses #1508 unchanged:

- original unknown LP2 p0-p55 only;
- 12,956 ciphertext runes and 12,901 within-page adjacent-pair opportunities;
- 86 adjacent-equal events;
- global row-major p50 clock, phase zero;
- pair phase is indexed by the first rune;
- 60 low-value / literal-leading-zero cells;
- 3,025 selected opportunities with 33 repeats;
- 9,876 outside opportunities with 53 repeats.

Every opportunity is stratified by its first ciphertext rune identity. For an equal-pair event that identity is also the repeated rune.

## Exact rune-conditioned pooled test

For each of the 29 GP29 identities, condition on:

1. its total number of selected and outside opportunities, and
2. its total number of adjacent-equal events.

Under no low-60 effect, the number of selected repeats in each rune stratum is hypergeometric. Convolving the 29 exact stratum distributions gives:

- observed selected repeats: **33**;
- rune-conditioned expectation: **19.88433285**;
- exact upper tail: **0.001030386**.

Thus the association survives exact control for which rune identities happen to repeat. A change in GP29 symbol composition alone does not explain 33/86 selected events.

## Homogeneity across sufficiently exposed rune identities

Before results, a rune was declared sufficiently exposed when it had at least **50 selected opportunities**, **150 outside opportunities**, and **2 total repeats**. This leaves **25/29** identities.

A conditional common-odds model fitted across those strata gives a selected/outside repeat odds multiplier of **1.90386**. Among the 25 exposed identities, **18** have the selected repeat rate above their outside rate.

To test whether separate rune-specific low-60 effects are required, the common-odds conditional likelihood was compared with separate per-rune odds, then calibrated by **2,000** deterministic conditional bootstrap samples generated from the fitted common model:

- heterogeneity statistic: **41.52699**;
- bootstrap tail: **0.0734633**.

This is not evidence for a strictly identical effect at every rune. It is also insufficient to reject a shared low-60 enrichment at the frozen gate. The observed symbol variation remains a secondary uncertainty rather than the explanation of the global association.

## Literal F control

Literal **F** was predeclared because solved p56 has a documented F exception. It is essentially neutral here:

- selected: **1/111 = 0.0090090**;
- outside: **3/343 = 0.0087464**;
- continuity-corrected odds ratio: **1.3206**.

F contributes only one of the 33 selected repeats. The p50 association therefore is not an F-exception phenomenon.

## No tiny-rune concentration

The largest selected-hit contribution is **3/33 = 9.09%** from X. The top three rune identities together contribute only **7/33 = 21.21%** selected repeats:

| Rune | selected hits / opportunities | outside hits / opportunities |
| --- | ---: | ---: |
| X | 3 / 78 | 3 / 379 |
| O | 2 / 112 | 2 / 344 |
| W | 2 / 90 | 4 / 309 |

No single rune or tiny trio can account for the 33 selected events.

## Rune-conditioned chapter holdout

For each of the nine source chapters, a common low-60 odds multiplier was learned from the other eight chapters. The held-out chapter was then scored conditionally on each rune identity's total held-out repeats against a no-mask odds of one.

- positive rune-conditioned direction: **8/9** held-out chapters;
- summed held-out conditional log-likelihood gain: **+4.884708 nats**;
- learned training odds multipliers remain tightly grouped from about **1.97 to 2.22**.

The only nonpositive direction is the very small p54-p55 holdout: one selected repeat versus a rune-conditioned null expectation of 1.013. The p0-p2 holdout has the positive direction but a small negative likelihood gain because it contains only one selected repeat. The remaining seven folds have positive likelihood gains.

## Decision

**The evidence favors a rune-generic p50 clock/state association over an F-specific or tiny-symbol exception.** The 33/86 enrichment survives exact conditioning on rune identity, does not concentrate in a few symbols, and transfers in direction across 8/9 rune-conditioned chapter holdouts. The heterogeneity bootstrap is close enough to the conventional boundary that an eventual decoder should not assume perfectly uniform symbol response, but there is no present basis for designing separate symbol-specific escape rules.

This strengthens the 60-cell class as a generic selector/state clue. It still does not select an opcode, key, reset rule, or plaintext.

## Reproduction

- `sims/lp2_p50_low60_rune_generic_sft.cjs`
- `.github/workflows/agent5-p50-rune-generic-manual.yml`
- successful run: https://github.com/FlareZ123/liber-primus/actions/runs/44392134779
