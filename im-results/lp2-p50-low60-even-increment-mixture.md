# p50 low60-even additive increment-mixture discriminator

**Agent 19 independent exploration, 18 November 2026. Evidence class: bounded architecture test. No unknown plaintext or key recovered.**

## Question

Exact additive key-hold interpretations of the p50 low60 repeat signal fail. A weaker additive architecture can still be tested without guessing a key:

[
C_{i+1}-C_i = P_{i+1}-P_i + D_i pmod{29},
]

where the frozen p50 parity state selects a stationary probability law for the key increment (D_i). If the low60-even control bit genuinely selects a distinct additive key-motion regime, state-specific increment laws should transfer to held-out chapters and should become materially more concentrated than a generic 29-way fit.

The selector is unchanged from the established parity result: continuous global p0-p55 row-major phase zero, selected when the printed p50 token begins with `0` and its conventional-base60 second digit is even.

## Frozen model

A source-native plaintext-difference law `q(d)` is fixed from the pinned Shakespeare control. For any 29-way increment distribution `h(k)`, the predicted ciphertext-difference law is its circular convolution with `q`.

For each of the nine visual-chapter holdouts:

1. fit one common 29-way nonnegative increment mixture to the other eight chapters;
2. fit separate mixtures for the selected and complement parity states on those same eight chapters;
3. score both models on the untouched held-out chapter.

Mixtures are fitted by EM. This is deliberately generous to the additive hypothesis.

A planted positive uses source-native Gibran plaintext and two sparse state-dependent increment supports. The same fitter must recover the planted increments among its dominant masses.

## Original result

The full-book fits are diffuse:

- complement state: effective increment count **10.1983**, maximum single mass **0.15427**;
- selected low60-even state: effective increment count **8.00166**, maximum single mass **0.20843**;
- selected top masses are increments 0, 11, 17, 10, 20, 22, 5, 7;
- complement top masses are 11, 4, 17, 22, 10, 25, 16, 7.

Across nine held-out chapters, two state-specific laws gain only **+1.530251 nats** over one common law and improve **5/9** folds. Fold gains are:

`+1.1600, +0.6940, +0.3242, -0.8494, -0.8565, -1.1298, -1.0653, +2.8078, +0.4450`.

This is weak relative to the large flexibility granted by separate 29-way mixtures and is driven heavily by one chapter.

## Positive control

The planted sparse supports are:

- complement: increments `{3,11,17}`;
- selected: increments `{0,7}`.

The fitter recovers all planted increments among its leading masses. For the selected plant, increment 7 receives mass **0.46478** and increment 0 receives **0.44013**. For the complement plant, increments 3, 11, 17 are the three largest masses at **0.37712, 0.32129, 0.26396**.

## Decision

Do not prioritize a stationary additive key-increment explanation of the p50 parity signal. The original selected-state fit is diffuse and its extra state dependence barely transfers out of sample despite a permissive 29-component model. Together with the exact-hold rejection, this removes the most direct additive interpretations of the parity control bit.

The remaining mechanism search should favor architectures that can alter the probability of ciphertext self-transition without exposing a stable additive difference law, such as a state-dependent substitution/permutation or an explicitly collision-sensitive transform, but only when an original clue selects a concrete reversible operation.

Reproduction: `sims/lp2_p50_low60_even_increment_mixture_sft.cjs`. Windows Node 22 PASS: Actions run **44399977800**, job **135140043514**.
