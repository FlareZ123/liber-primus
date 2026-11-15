# Keyless two-back GP29 rotor: exact counterexample to exclusive 28-step-keystream inference

**Decision, 15 November 2026.** The September 2026 external [28-step chain-cipher report](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md) correctly observes 86 original unsolved LP2 adjacent doublets and a near-flat nonzero ciphertext-difference histogram. Its strong further inference that only a long aperiodic 28-symbol key can create these first-order statistics is **not identified by those observations**. A concrete lossless, **keyless, two-back GP29 ciphertext-feedback transducer** reproduces the headline statistics on **2,979 actual solved Cicada GP29 plaintext runes**. This is a structural counterexample to uniqueness, **not an LP2 decryption**. An independent original-cipher replay produces nonlinguistic candidate runes, so this literal keyless rule should not be claimed as the manuscript's actual inverse.

## One exact reversible alternative

Let all rune indices be in GP29 (0..28), with rare plaintext EA at index28. Let u=C[i−1] and v=C[i−2], initialized to F=0 at each independent original plaintext section. Set:

- **Encoder**: s=0 if P=28; otherwise s=1+((P+v) mod28). Emit C=(u+s) mod29, update v←u, u←C.
- **Decoder**: s=(C−u) mod29; output P=28 when s=0, otherwise P=(s−1−v) mod28. Update the same state.

At any state, P=28 maps to step0 and the other 28 possible P indices map bijectively to every step1..28. Thus every one of the 29 original cipher glyphs is supported **without dropped zeros, implicit exception flags, or an aperiodic key**. The previous-two-cipher-symbol feedback scrambles the English step histogram while leaving its zero rate equal to the actual plaintext EA rate. The model is non-additive and data-dependent; its apparent step stream is an **emission derived from plaintext and state**, not a separate key.

The exact independent control consists of the nine publicly solved native GP29 texts from [relikd/LiberPrayground](https://github.com/relikd/LiberPrayground/tree/main/pages), preserved with original source blob hashes and punctuation in [source resource](../resources/external/relikd-solved-gp29-native-v1.json). The code checks all 2,979 authentic solved runes and does not transcribe English via a substitute alphabet. It also runs on our source-original LP2 indices, 55 rune-bearing physical pages. [Standalone CommonJS SFT](../sims/lp2_keyless_two_back_rotor_sft.cjs).

| Statistic | 2,979 actual solved runes encrypted by the keyless rotor | Original LP2 source (our per-physical-page conditioning) |
|---|---:|---:|
| Same-page/section adjacent opportunities | 2,970 | 12,901 |
| Adjacent identical emitted runes | 20 | 86 |
| Doublet rate | 0.6734% | 0.6666% |
| Cipher GP29 normalized IoC | 0.995716 | 0.999874 |
| Nonzero-step GP29 normalized IoC | 1.036994 | 1.024426 |
| Nonzero-step 29×28 conditional χ² given previous cipher rune | 797.886 | 813.922 |
| Nominal conditional degrees of freedom | 783 | 783 |

**Calibration caveat:** The control's contingency cells average only ~3.6 counts. The χ² figures are descriptive, with different control/target sample sizes, not directly comparable significance probabilities. The construction was identified after comparing both the simpler one-back and two-back versions. The one-back version had χ²≈3,211, making the two-back version a chosen counterexample, not a statistically pre-registered historical hypothesis. A full original generator diagnosis would also need within-word lag-five behavior, layout and independent source cues.

## Source-original replay and where it fails

Using the same fixed zero/zero starting state per physical page, decoding **all 12,956** original ciphertext runes produces a valid GP29 rune at every position, with exact forward reconstruction including all **86** original same-page doublets. The resulting text has native normalized IoC **1.02355** rather than plausible solved-English ~1.78; p0 begins with GP29 indices \`14 21 22 5 12 9 1 10 ...\`, rather than readable prose. Exactly **88** recovered EA instances arise under per-page starts; two first-position candidates come from initializing the output state, illustrating why a first-rune boundary seed matters. This direct candidate **does not solve LP2**, and a full trivial roundtrip is never evidence of a historical correct key in a bijective family.

The relevant original identifiability point is structural. The external report's purported key is defined operationally as ΔC=C[i]−C[i−1], which is already observable and does not, by itself, carry or recover the unknown plaintext. To make an *encoder*, one must specify how P affects ΔC, and a *decoder* must invert that map including zero events. The keyless two-back transducer does precisely that and generates a highly similar one-back fingerprint. Thus the narrow inference “flat steps force a long unavailable key” is invalid. This does **not** refute that a genuine external key may ultimately be required.

## Next independent discriminator

This model predicts **strong second-order dependence of step emissions on C[i−2] conditioned on C[i−1]**, reflecting the rotated plaintext distribution. A test comparing a fixed, pre-chosen second-order statistic on original LP2 against the exact solved-native control and fixed word/page geometry could reject this specific state law. A different source-selected rotor or key schedule would need its own falsifiable prediction. The causal priority is to find a visible **two-back update rule or authentic decoding operand**; there is no justification for declaring that all keyless or low-state alternatives have been exhausted by the external report's first-order tests.

**Status:** source-calibrated architectural counterexample; **unknown-page plaintext/key recovered: none**. SFT and exact sources are included above. This result informs [Director Issue #1120](https://github.com/FlareZ123/liber-primus/issues/1120) and can be handed to the owner of #1101 without competing in its finite-state sweep.
