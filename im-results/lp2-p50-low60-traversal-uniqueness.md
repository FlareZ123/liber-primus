# p50 low-value clock traversal uniqueness gate

**18 November 2026, Agent6. Director Issue #1534. Classification: positive source-order discriminator for an existing ciphertext association.** No unknown LP2 plaintext, key, or cipher opcode is recovered.

## Question

The phase-zero p50 low-value class predicts original p0-p55 adjacent-equal ciphertext events. The association had been stated using the natural printed 32×8 row-major order, but a downstream decoder should not inherit that orientation unless the source data distinguish it from equally simple printed traversals.

This gate keeps the original outcome and the 60 physical marked cells fixed and changes only the predeclared traversal of the printed table.

## Frozen data and score

The test reuses the exact #1508 inventory and held-out likelihood:

- 12,956 original p0-p55 runes;
- 12,901 within-page adjacent-rune opportunities;
- 86 adjacent-equal events;
- the same 60 physical p50 cells whose first printed character is `0`, equivalently the 60 lowest values under the documented base60 and drop-f base59 readings;
- pair indexed by its first rune;
- global phase zero;
- nine source chapter ranges;
- Beta(1/2,1/2)-smoothed selected/unselected Bernoulli rates learned from eight chapters and scored once on the ninth.

The eight traversals were fixed by issue #1534 before scoring: four row-major orientations and four column-major orientations. No snake, phase optimization, alternate mask, or plaintext score was searched.

## Result

| Traversal | Marked hits / opportunities | Other hits / opportunities | Relative risk | Held-out gain, nats | Positive held-out directions |
| --- | ---: | ---: | ---: | ---: | ---: |
| row-major left-to-right, top-to-bottom | **33/3025** | **53/9876** | **2.03280** | **+4.584893** | **9/9** |
| row-major right-to-left, top-to-bottom | 24/3027 | 62/9874 | 1.26270 | -0.978761 | 6/9 |
| row-major left-to-right, bottom-to-top | 26/3027 | 60/9874 | 1.41352 | -0.443279 | 5/9 |
| full row-major reversal | 24/3025 | 62/9876 | 1.26379 | -1.293935 | 7/9 |
| column-major top-to-bottom, left-to-right | 23/3017 | 63/9884 | 1.19604 | -1.216380 | 5/9 |
| column-major bottom-to-top, left-to-right | 22/3024 | 64/9877 | 1.12276 | -0.979253 | 6/9 |
| column-major top-to-bottom, right-to-left | 20/3029 | 66/9872 | 0.98762 | -1.371896 | 5/9 |
| full column-major reversal | 22/3032 | 64/9869 | 1.11889 | -0.795849 | 4/9 |

The canonical printed reading order is the **only** member of this fixed family with positive summed held-out predictive gain. It exceeds the nearest rival by **5.028172 nats**, and it is also the only traversal whose exposure-corrected enrichment direction transfers to all nine held-out chapters.

The implementation exactly reproduces #1508 for the canonical traversal: 33/3025 selected repeats, 53/9876 others, relative risk 2.0327958834, held-out gain +4.5848931753 and 9/9 positive directions.

## Decision

Within the eight source-natural full-table traversals specified before scoring, the original ciphertext selects the printed row-major left-to-right, top-to-bottom clock uniquely.

This materially narrows any future p50-clock mechanism: an alternative orientation should require independent source evidence rather than being treated as an equivalent free parameter. The result still does not identify what the 60-cell class means operationally, whether the intended predicate is visual leading zero or low numeric magnitude, or what value-changing cipher consumes the clock.

## Reproduction

- SFT: [`sims/lp2_p50_low60_traversal_gate_sft.cjs`](../sims/lp2_p50_low60_traversal_gate_sft.cjs)
- Windows / Node 22 PASS: [44392498658](https://github.com/FlareZ123/liber-primus/actions/runs/44392498658)
- Director issue: [#1534](https://github.com/FlareZ123/liber-primus/issues/1534)
- Upstream held-out feature localization: [#1508](https://github.com/FlareZ123/liber-primus/issues/1508)
