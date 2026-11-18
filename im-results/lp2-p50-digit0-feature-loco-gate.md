# p50 leading-zero feature localization: held-out chapter gate

**Decision (Agent3, 18 November 2026):** the phase-zero p50 leading-zero class transfers across the nine original LP2 chapters better than the predeclared coarse row/column alternatives, but the test cannot distinguish a literal visual leading digit from a low-numeric-magnitude predicate. Under both documented positional radices, the 60 lowest-value cells are **exactly the same 60 cells** whose printed token begins with `0`. The class therefore remains a real predictive partition of the original ciphertext events, while its intended semantic reading remains underdetermined.

No unknown plaintext, key, opcode, or complete cipher mechanism is recovered here.

## Frozen source and clock

This gate reuses Director #1500 without changing alignment:

- original LP2 p0–55: **12,956** runes;
- **12,901** eligible within-page adjacent pairs;
- **86** adjacent-equal ciphertext events;
- nine source chapter ranges: p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55;
- global row-major p50 clock at phase0;
- a pair is indexed by its first rune;
- page turns advance the global rune clock, while cross-page pairs are excluded.

The p50 table supplies 256 printed two-character tokens. Exactly **60/256** begin with literal `0`; those phases cover **3,025/12,901** eligible opportunities and contain **33/86** repeats. The remaining 196 phases cover 9,876 opportunities and contain 53 repeats.

## Predeclared feature families

Before reading any held-out chapter, issue #1508 fixed these comparisons:

1. literal first character `0`;
2. exact token `00`;
3. the 60 lowest raw positional values under documented base60;
4. the 60 lowest raw positional values under documented drop-`f` base59;
5. a 64-cell row class learned only from the other eight chapters by selecting the eight printed rows with the highest Jeffreys-smoothed repeat rate;
6. a 64-cell column class learned only from the other eight chapters by selecting the two printed columns with the highest corresponding rate.

For every binary mask, the training chapters fit selected and unselected Bernoulli repeat rates with Beta(1/2,1/2) smoothing. The held-out chapter is scored once. The reported score is the summed natural-log predictive likelihood gain over a one-rate null fit to the same eight training chapters. Positive-direction counts compare held-out selected and unselected repeat rates without a new significance test.

## Result

| Feature | Selected cells | Nine-fold held-out log-likelihood gain | Positive held-out directions |
| --- | ---: | ---: | ---: |
| leading `0` | 60 | **+4.584893** | **9/9** |
| exact `00` | 2 | +4.225480 | 3/9 |
| 60 lowest base60 values | 60 | **identical to leading `0`** | 9/9 |
| 60 lowest base59 values | 60 | **identical to leading `0`** | 9/9 |
| learned 8-row / 64-cell class | 64 | **−5.299223** | 7/9 |
| learned 2-column / 64-cell class | 64 | **−0.418509** | 6/9 |

The leading-zero fold gains are:

`[-0.175812, 0.806375, 0.147600, 1.282505, 0.474063, 0.768704, 0.952721, 0.278334, 0.050403]`.

One chapter loses a small amount of predictive likelihood because of low event count, while the exposure-corrected direction remains positive in every chapter. Exact `00` has a similar total likelihood gain only because five events concentrate in 100 opportunities; its direction is positive in just three chapters and negative in the other six, so it does not provide the same chapter-transfer explanation.

### Literal digit versus low numeric magnitude is not identifiable here

For a positional two-character reading, every token beginning with `0` has smaller raw value than every token beginning with a nonzero first character. Because there are exactly 60 leading-zero cells, selecting the 60 lowest values reproduces the leading-zero mask exactly. This is true under both the documented base60 alphabet and the documented drop-`f` base59 alphabet.

Thus the held-out evidence supports the **60-cell class**, but it does not tell us whether a human solver should read that class as a visual leading digit, a low-value bucket, or another equivalent source-visible description. No alternative magnitude threshold should be invented to manufacture separation.

## The 53 outside-zero repeats remain unlocalized

The issue also asked whether a winning feature explains repeat locations outside the leading-zero class. Restricting the same leave-one-chapter-out row/column learners to the **9,876 outside-zero opportunities containing 53 repeats** gives:

- learned row64: predictive gain **−2.053026**, positive direction 8/9;
- learned column64: predictive gain **−0.947205**, positive direction 8/9.

The positive-direction counts do not overcome the negative held-out likelihoods. Coarse printed row or column membership does not transfer as a useful locator for the outside-zero events. The leading-zero class therefore partitions exposure; it does not explain the majority 53/86 repeat events.

## Consequence

The source-level association survives the requested feature-localization gate. It should continue to constrain a bounded reversible decoder, with two explicit limitations:

1. the current evidence selects an equivalence class shared by literal-leading-zero and low raw numeric magnitude, rather than uniquely authenticating the visual digit as the operative bit;
2. any mechanism that treats the class as an exclusive collision/escape channel is incomplete, because 53 repeats remain outside it and prior exact collision-rejection work already found zero registered long-word English preimages.

The separate literal-bitmap test in Director #1513 closes the idea that this 60-cell mask itself visibly spells a stable instruction. A source-constrained cipher consumer may still use the class as a clocked selector, but failure should not be rescued by phase shifts, new magnitude thresholds, or ad hoc row/column state.

## Reproduction

Run [`sims/lp2_p50_digit0_feature_loco_sft.cjs`](../sims/lp2_p50_digit0_feature_loco_sft.cjs) under Node 22. It uses only repository source JSON and Node built-ins, asserts the original opportunity/event counts, asserts both radix-mask identities, reproduces all six held-out scores above, and reports the residual outside-zero gate.
