# GF841 period-840 field key with collision-clock and GP28 successor inverses

**Agent16, 13 November 2026.** Two new, bounded inverses using the source-derived GF841 order-840 primitive fail to produce readable plaintext from the original 1,680 GP29 runes in physical LP2 pp33–39. All 840 phases and original ciphertext were checked on Windows Node22 with independently planted native-GP English controls. **No unknown plaintext, authenticated cipher or destination was recovered.** This report preserves the finite decisions and a useful algebraic reduction, not a proposal to expand arbitrary cipher variants.

## Why these specific originals and operations

The 2014 original p3 red quadratic defines the field GF(29²) with basis u where u²=3u+8. The p39 red quadratic and 256 original pp49–51 printed table bytes produce the already recorded quotient remainder **g=19+13u**, a primitive element of order **840**. The illustrated original chapter pp33–39 contains exactly **1,680=2×840** canonical runes ([original field and source-chapter relationship](p50-p39-p3-field-remainder.md)). An earlier fixed-key two-time-pad test on the two 840-rune halves was negative. That test does not cover a *variable key clock*: independently visible LP2 ciphertext nearly eliminates adjacent same-rune pairs, potentially because an emitter discards a key draw when its proposed ciphertext would repeat the previous rune. A genuinely different mechanism explicitly selects one of 28 nonrepeating successor symbols.

Both proposed channels are human-plausible but **not authenticated by an original author instruction**. This is why their negatives cannot rule out the manuscript's actual cipher.

## The complete field key and a 840-phase symmetry

Multiplication by the exact independently derived g in field coordinates is (a,b)→(19a+17b,13a) mod29. Starting from 1+0u, the first 840 states are nonzero and distinct, with state840 returning exactly to 1+0u. At every state the four source-basis projections considered are a, b, trace=2a+3b, and norm=a²+3ab+21b², modulo29.

**A useful all-phase theorem:** every nonzero linear functional on this two-dimensional finite field can be written as a trace functional of αz for nonzero α. The field generator ranges over all 840 nonzero α. Therefore every linear projection of the same g clock yields an identical keystream after some phase shift. Reversing its additive sign is also a phase shift because −1=g^420. Consequently the six apparently different sign/linear-projection searches are *exactly the same set of candidate plaintexts*, including under a collision-conditioned clock; there is no purpose repeating all six after this equivalence is known. Norm is a different, shorter-period projection.

## Inverse A: consume another field key only when the proposed output repeats

For each observed original ciphertext rune C_i use the fully reversible additive GP29 equation C_i=P_i+εK_j (mod29) for ε=±1. After the first printed rune, each symbol consumes 1–3 consecutive field-key values. An extra draw is admissible *only if the same current plaintext rune with the skipped key would output the actual previous ciphertext rune*. The trial subtracts 3.5 nats for each legally skipped draw.

An **exact** Viterbi algorithm maintains all 840 key phases and three predecessor-advance states, decoding the entire original 1,680-rune chapter without pruning. The language model is the repository's pre-existing GP29 Shakespeare conditional trigrams trained on the first 200,000 characters, with a later native-GP passage held out.

| Measurement | Original decoding |
| --- | ---: |
| Unmodified source GP trigram score | **−6.2136037306** nats/rune |
| Best full-phase linear output (all six aliases) | **−5.5525099379** nats/rune |
| Best full-phase norm output | **−5.5864184756** nats/rune |
| Independent English-register control | **−2.3201994777** nats/rune |
| Best original linear-output IoC | **0.0352044868** |
| Best original linear-output collision-qualified skips | **36** |

The recovered original GP sequence starts **L T W TH L B A B A Y P A IA X TH U H L Y J EA**, and remains ciphertext-like throughout.

**Powered positive:** independently encrypt **1,680 native-GP runes** with the exact historical field-derived key, secret source phase **227**, additive sign+1 and a deterministic collision-rejection clock, producing **43 real skipped key draws**. Given only synthetic ciphertext and original source field g, the *same exact Viterbi* recovers **1,680/1,680 correct plaintext runes**, the **correct phase227** and **all 43 discarded keys**. Per-symbol trace and total score assertions pass.

## Inverse B: code only nonrepeating successors

This distinct model treats the first rune of the chapter as an IV. For each of its remaining 1,679 original GP transitions, compute Δ=(C_i−C_(i−1)) mod29. For Δ≠0, decode plaintext GP28 rank P_i=(Δ−1−ε(K_j mod28)) mod28, which is reversible using 1+((P_i+εK_j) mod28) as the next nonzero ciphertext step. At Δ=0 emit reserved GP rune index28 and test both consuming or retaining the field clock. That marker mapping is a *candidate convention*, not evidence that original EA is plaintext.

The original chapter contains exactly **12** zero-difference events. The entire set of four field projections × two signs × two zero-clock policies × 840 initial phases was searched without other fitted degrees of freedom.

| Measurement | Original decoding |
| --- | ---: |
| Best score of all 16 settings × 840 phases | **−5.8999507053** nats/rune |
| Best original IoC | **0.0353756457** |
| Native-GP control score for equal-length passage | **−2.3205534056** nats/rune |
| Native plaintext recovered from planted GP28 cipher | **1,679/1,679** for each of 16 settings |

The strongest original output begins **L I P D F Y L F AE W J OE H NG W G F N E I J IA OE**, with no prose. Every synthetic forward/inverse exactly roundtrips; the key phase can be recovered from the planted ciphertext alone.

## Research decision and reproducibility

The all-phase **field-key plus adjacent-repeat rejection** model and **field-key plus nonrepeating GP28 transport** model do not decode original pp33–39 into native GP-English. Their synthetic decoding controls are strong and exact; the original language-score gap is several nats/rune. The source g and 840-length relation remain factual, but these channels are failed candidate consumers. The negative does not touch hidden state, a different source-selected operation, external key material or non-native plaintext intermediate.

- [Original-input collision-keyskip Viterbi SFT](../sims/lp2_gf841_period840_collision_keyskip_sft.cjs).
- [Original-input GP28 predecessor-exclusion SFT](../sims/lp2_gf841_period840_gp28_transition_sft.cjs).
- [Completed Windows Node22 CI, both source and positive controls](https://github.com/FlareZ123/liber-primus/actions/runs/43475030717).
- [Manual-only source-test workflow](../.github/workflows/lp2-gf841-period840-keyskip-manual.yml).

**Next causal gate:** a genuinely independent original source must select a distinct consumer of the 840-field element before expanding nonlinear keys, clocks or offsets. For other 840-phase searches, exploit the exact nonzero-linear-projection equivalence rather than repeating synonymous experiments. No LP2 text or secret key has been recovered.
