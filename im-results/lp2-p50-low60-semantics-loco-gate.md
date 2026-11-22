# p50 low60 semantics: discrete class beats smooth raw-value dependence

**Decision, Agent 13, 18 November 2026.** Director Issue #1542 froze three explanations for the phase-zero p50 adjacent-repeat association and scored them under the existing nine-chapter leave-one-out framework. The **binary `B<60` class is the strongest predictor in this family**. It achieves **+4.584893 nats** of held-out predictive log-likelihood gain, compared with **+1.233810** for a one-term raw-value logistic model and **+2.504149** for a five-level printed-first-digit model.

The binary model beats the smooth raw-value model in **9/9** held-out chapters and beats the categorical first-digit model in **7/9**. Across the complete held-out corpus, its predictive likelihood is about **28.53×** the raw-value model's and **8.01×** the categorical model's under these frozen fits.

This sharpens the semantic interpretation of the p50 signal: a discrete low60/leading-zero state carries information beyond a smooth magnitude gradient or a general first-digit-class effect. The original source makes `B<60` exactly equivalent to printed leading digit `0`, so this test leaves the visual-zero versus low60-threshold wording unresolved.

No unknown plaintext, key, cipher opcode, or full mechanism is recovered.

## Frozen inventory and scoring

The experiment reuses #1508 without changing the event definition or clock:

- original LP2 p0–55, 12,956 runes;
- 12,901 eligible within-page adjacent-pair opportunities;
- 86 adjacent-equal ciphertext events;
- chapter ranges p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55;
- global row-major p50 phase zero;
- each pair is indexed by its first rune position;
- page turns advance the global clock while cross-page pairs remain excluded.

For each holdout chapter, parameters are learned from the other eight chapters and the holdout is scored once against the same one-rate Jeffreys-smoothed training null used by #1508.

The three predeclared models are:

1. **Binary low60:** `I(B<60)`. Its selected/unselected probabilities use the same Beta(1/2,1/2) smoothing as #1508.
2. **Continuous raw value:** one logistic term `logit(p)=alpha+beta*B`. The implementation uses a fixed centering/scaling of B for numerical conditioning; this is algebraically the same one-term model. Alpha and beta are maximum-likelihood fits on the eight training chapters.
3. **Printed first digit:** categorical `floor(B/60)` with levels 0–4. Each training-level probability uses the same Beta(1/2,1/2) smoothing.

There are no scanned thresholds, splines, polynomial terms, interactions, phase changes, alternate radix readings, or post-result feature additions.

## Held-out result

| Frozen predictor | Nine-fold gain vs one-rate null | Head-to-head with binary |
| --- | ---: | ---: |
| binary `B<60` | **+4.584893 nats** | reference |
| one-term raw-B logistic | +1.233810 nats | binary wins **9/9** folds |
| five-level `floor(B/60)` | +2.504149 nats | binary wins **7/9** folds |

The binary fold gains exactly reproduce the prior #1508 result:
`[-0.175812, 0.806375, 0.147600, 1.282505, 0.474063, 0.768704, 0.952721, 0.278334, 0.050403]`.

The raw-value logistic slope is negative in **all nine** training folds, so the smooth magnitude model captures a directional tendency within this frozen comparison. Its predictive score is substantially lower in every held-out chapter. The full-corpus fitted scaled slope is **beta = -0.363974**, corresponding to an odds multiplier of about **0.8426 per +60 raw-value units**.

## First-digit levels show a class-zero discontinuity

The complete source counts by printed high digit are descriptive; model choice comes from the held-out scores.

| `floor(B/60)` | Opportunities | Repeats | Repeat rate |
| ---: | ---: | ---: | ---: |
| 0 | 3,025 | 33 | **1.0909%** |
| 1 | 2,926 | 12 | 0.4101% |
| 2 | 3,270 | 17 | 0.5199% |
| 3 | 2,825 | 19 | 0.6726% |
| 4 | 855 | 5 | 0.5848% |

Classes 1–4 do not form a stable monotone staircase in the observed rates. Their five-level model earns positive aggregate held-out gain, while its additional distinctions predict less well than pooling classes 1–4 into the single `B>=60` state.

## Decision for mechanism work

Within the exact frozen family, use the **60-cell discrete state** as the preferred operand semantics. A smooth numerical-magnitude mechanism receives lower priority because its predictive likelihood is weaker in every held-out chapter. A general five-way first-digit state also receives lower priority because the extra classes do not improve prediction enough to beat the binary split.

The remaining source ambiguity is narrow: **printed leading zero and numerical `B<60` are the same source predicate**. This experiment selects their shared discrete threshold behavior over smooth raw magnitude; it cannot decide which equivalent description the author intended.

Future decoder work should preserve this exact phase-zero 60-cell state unless a new source clue supplies a different operation. The result does not justify a new threshold, phase, digit combination, or free nonlinear value transform.

## Reproduction

Run `node sims/lp2_p50_low60_semantics_loco_sft.cjs` under Node 22. The SFT reads only the canonical repository corpus/table JSON, reconstructs the exact #1508 opportunity inventory, fits all three predeclared models, checks optimizer gradients, asserts the known binary control score, and asserts the new held-out totals and class counts.
