# p50 low-value state is predictive on the transition diagonal, not the wider GP29 successor law

**Director task:** #1546  
**Classification:** architecture discriminator; no plaintext or key recovered.

The phase-zero p50 low-value / leading-zero class strongly predicts adjacent self-transitions, but allowing the class to change the full GP29 successor distribution is decisively worse out of sample than a model in which the class affects only the self-transition probability.

## Frozen comparison

Use every original within-page adjacent-rune opportunity in unknown LP2 p0-p55:

- 12,901 transitions;
- 3,025 at low-value / leading-zero phases;
- 9,876 outside;
- 86 self-transitions total;
- 33 selected and 53 outside.

Every model conditions on the preceding GP29 rune identity.

**Diagonal-only model:** for each predecessor rune, the low-value class may change only `P(next=prev)`; all off-diagonal successor probabilities are shared between low and ordinary cells.

**Full model:** for each predecessor rune and class, fit a separate 29-way successor distribution.

Both use symmetric smoothing. The smoothing strengths were selected **before LP2 scoring** on eight disjoint 12,956-rune source-native Shakespeare controls from the fixed grid `[0.1,0.25,0.5,1,2,4,8]`. Both independently select **alpha=0.25**, so the final comparison does not depend on unequal regularization choices.

## Nine-chapter held-out result

| model | summed held-out log likelihood |
| --- | ---: |
| diagonal-only | **-43,669.5969** |
| full class-specific successor law | **-44,250.0045** |
| full minus diagonal | **-580.4076 nats** |

The full model loses in **every one of nine** held-out source chapters. Its foldwise gains over diagonal-only are:

`[-22.4064, -52.7453, -74.1327, -55.7875, -49.0980, -70.5789, -58.6182, -187.8684, -9.1722]`.

There is therefore no transferable off-diagonal successor signal under this frozen model family. The added class-specific alphabet freedom is harmful out of sample despite regularization calibrated independently on native GP text.

## Decision

**Prefer the narrow repeat/surface interpretation.** The p50 low-value clock currently has evidence for changing the probability of `C[i+1] = C[i]`, while the data give no support for treating it as a broad class-specific GP29 substitution state.

This materially narrows future reversible decoders:

- do not justify a second full 29-way alphabet merely from the p50 association;
- mechanisms that change equality/self-transition behavior remain compatible;
- a broader keyed alphabet/state switch now needs an independent source clue or a different invariant, rather than this association alone.

This result complements #1535: the effect is rune-generic in the sense that it survives conditioning on predecessor identity, yet its transferable signature remains concentrated on the transition diagonal.

## Reproduction

- `sims/lp2_p50_transition_law_discriminator_sft.cjs`
- `.github/workflows/agent5-p50-transition-law-manual.yml`
- successful CI: https://github.com/FlareZ123/liber-primus/actions/runs/44393012375
