# Autonomous two-state quadratic GP29 keystream: original long-word inverse

## Decision

No compatible native-English plaintext candidate was found among **105,459** length-matched comparisons on the seven longest original unsolved LP2 words under *every* word-private, six-coefficient, two-state quadratic GF29 keystream recurrence. A five-coefficient no-cross-term subfamily also has zero compatible candidates. The six polynomial coefficients and two initial key values were wholly unknown and freely recovered from each candidate word.

This is a distinct reversible model from the earlier p39 quadratic *ciphertext-feedback* experiments: the evolving nonlinear state here is an unobserved additive key, recovered from a putative plaintext. It extends the separately recorded [linear key-register 1–5 attack](./lp2-keyfree-lfsr3to5-oneglitch-original-wordholdout.md) to one source-motivated nonlinear family. No unknown-page plaintext, creator key, or original cipher operation was recovered.

## Sources and exact model

The original words from physical pages **11,13,16,25,43,52,55** have 13,14,13,14,14,13,13 GP runes respectively. They come from the original LP2 transcription, numeric rune corpus, and continuous word parser, joining print-wrapped boundaries. A pinned independent native-GP English dictionary contains **17,772** 13-rune entries and **11,457** 14-rune entries, for **4×17,772+3×11,457 = 105,459** comparisons. The existing source-calibrated GP encoder handles the authentic NG/ING and IO conventions.

For every source-original word C and dictionary plaintext P of the same GP length, infer the unknown entire key as K=C−P mod29. The proposed autonomous recurrence is:

\[
K_i=aK_{i-1}^{2}+bK_{i-1}K_{i-2}
+cK_{i-2}^{2}+dK_{i-1}+eK_{i-2}+f\pmod{29},
\quad C_i=P_i+K_i\pmod{29}.
\]

All six coefficients and both initial key values may differ for every printed word. There is no assumed page-wide seed, chosen word, known nonce, or original plaintext. The six coefficients multiply observable inferred-key features x², xy, y², x, y and 1. Each 13/14-rune candidate supplies 11/12 linear equations, solved exactly by GF29 Gaussian elimination. Contradictions reject every possible secret coefficient vector; any consistent underdetermined system would be surfaced separately. The secondary five-coefficient test simply removes the xy term and is a nested control, not independent confirmation.

The printed p39 red quadratic may motivate this candidate mechanism, but no author instruction selects autonomous key feedback as its actual role. This distinction is important.

## Original exact results

| Recurrence | Dictionary comparisons | Full-rank compatible | Rank-deficient compatible | Contradictory |
|---|---:|---:|---:|---:|
| Complete degree-two, six unknown taps | 105,459 | **0** | **0** | 105,459 |
| No cross term, five unknown taps | 105,459 | **0** | **0** | 105,459 |

[Read-only Windows Node.js 22 CJS reproduction](../sims/lp2_quadratic_keyfree_two_state_longword_sft.cjs) asserts every original source count and compatibility result. It also plants a ciphertext using the original source-native solved-p57 word **CIRCUMFERENCES**, seeded by [13,23] and arbitrary secret coefficients [11,26,8,15,2,17]. The algebraic solver recovers all six coefficients, regenerates every key symbol and reencrypts the planted text exactly. A separate no-cross-term positive uses [15,11,8,2,17] and recovers its five coefficients. The source word is independently attested in actual clear p57 and is not an inferred unknown-page crib.

## Scope and follow-on decision

The negative excludes this exact complete quadratic **two-state autonomous key** architecture for every native-GP English word represented in the specified long-word dictionary. It does not exclude unknown words, different languages, ciphertext feedback, clocks with skipped keys, more state registers, higher-degree recurrences, non-additive outputs, or an external one-time pad.

Additional cubic or higher-degree fitting to only 13/14 samples is prone to near-saturated coefficients. A first-party operation selector or authentic source-derived key is needed before further expansion. The negative should prevent inventing tuned per-word quadratic keys to rescue apparent English fragments.
