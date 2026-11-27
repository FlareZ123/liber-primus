# #3251 — Cross-page carry holdout for the sparse first-difference state

**Agent16 · 27 November 2026. Classification: calibrated suffix-prediction failure for one live original-support receiver. No unknown LP2 plaintext/key recovered.**

## Receiver and source geometry

I selected exactly one already calibrated receiver with nonempty original support: #3231's additive GP29 keystream whose first difference is piecewise constant and whose innovations cost one. No page-private keys or phases are introduced.

The canonical transcription has exactly **32** physical page breaks where a printed rune group continues across the page boundary. Their first suffix-rune offsets are:

`262, 528, 946, 1207, 1470, 1666, 2129, 2397, 4029, 4562, 4833, 5375, 5719, 5989, 6262, 6761, 7307, 7839, 8174, 8706, 9871, 10144, 10416, 10690, 10963, 11233, 11503, 11777, 12048, 12206, 12469, 12880`.

#3231's whole-book parser already ignores `%` page marks, so these carry groups were already continuous in its original minimum-cost bound. The new question is whether the continuous state can predict a withheld suffix.

## Strict holdout rule

At each carry suffix position i:

1. fit only the ciphertext and permitted plaintext anchors strictly before i;
2. minimize innovation count over all prefix states;
3. hide the suffix rune and every later anchor/group;
4. enumerate plaintext values for C[i] from the prefix-minimum key states only.

This is stronger than retrospective global marginals because no future constraint can collapse the state after seeing the suffix.

## Original conditional options

Using the original 83 printed singleton positions with the A/I/O grammar:

- ordinary clock: only **4/32** suffixes are singleton predictions from the prefix-minimum state: offsets 5719→GP4, 8174→GP26, 12206→GP22, 12880→GP7;
- transparent-F clock: only **4/32** are singleton predictions: 1666→GP4, 2397→GP5, 8174→GP26, 12469→GP25.

Several other carries have 29-way ambiguity. These values are **not plaintext claims**; calibration below determines whether such forced calls are trustworthy.

## Held native controls

The control plaintext is a 12,956-rune held Gibran GP-native segment. To make the state-identification problem *easier* than original LP2, the solver is given the **exact true plaintext rune** at all 83 original singleton-anchor positions rather than only A/I/O membership.

### Genuine continuous sparse-key plant

A true continuous sender begins at (k,d)=(7,4) and has 30 deterministic hidden slope innovations. On strict prefix holdout:

- 21/32 carry suffixes become singleton calls;
- only **14/21** singleton calls are correct;
- the true suffix rune is present anywhere in the prefix-minimum option set at only **25/32** carries.

Thus the minimum-innovation prefix state can make a confident but wrong next-rune call even when the receiver family is exactly correct and the solver has much stronger plaintext anchors than LP2.

### Independently page-reset rival

A matched native control resets the same (k,d)=(7,4) state at every physical page and has no within-page innovations. Under the same continuous solver and strong anchors:

- 20/32 suffixes become singleton calls;
- only **1/20** singleton calls is correct;
- truth appears in the prefix-minimum option set at only **13/32** carries.

The continuous mechanism is therefore statistically more compatible with its own controls than the reset rival, but the strict prediction error on the genuine continuous plant is still fatal for using a forced suffix as recovered plaintext.

## Why retrospective forced marginals are insufficient

If future anchors are allowed to participate, the genuine continuous control looks deceptively strong: 13 carry positions become forced and all 13 are correct; the reset rival produces 9 forced values with only 2 correct. The original likewise has retrospective forced values. But this is smoothing, not prediction: later constraints leak information backward across the withheld suffix.

#3251 explicitly requires suffix and continuation holdout. Under that standard the calibrated continuous receiver fails.

## Decision

**Do not retain any forced carry rune from this sparse-minimum receiver as a crib or recovered state.**

The exact 32 carry groups are real and correctly enforce that page breaks do not split the rune tape, but for #3231 they add no independent plaintext/state observation. Minimum innovation is only a complexity prior; it does not identify the true outgoing slope/key at the edge of a prefix. A new source-selected innovation stencil, terminal state, or independently known dense plaintext would be required before these carries can predict continuation.

This closes only the #3231 sparse first-difference receiver under the #3251 carry test. It does not show page state is generally independent, and it does not weaken the physical fact that the 32 groups span page boundaries.

## Reproduction

`sims/lp2_sparse_innovation_carry_holdout_sft.cjs`

Pinned inputs:
- `resources/liber-primus/lp2-corpus.json`
- `resources/liber-primus/lp2-transcription.txt`
- `resources/control/gibran_prophet_58585.txt`
