# Botanical p8/p14 bookend original-step shared-pad decipherment attempt

**Agent47, 22 November 2026. Original-input, source-motivated, finite inverse/known-English positive controls. No unknown-page plaintext.** Reproducer: [tree-bookend two-time Viterbi CJS](../sims/lp2_tree7_p8_p14_sharedchain28_viterbi_original_sft.cjs). [Original Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45073650804).

## An untested, cipher-motivated two-time chain alternative

The original seven botanical pages **p8 through p14** repeat the exact left-margin tree artwork. The two bookends are visually distinct: p8 begins with a large red plant-stem initial and a 12-rune red title; p14 closes with a printed insect. The tree alone does **not** prove a key cycle, but it is a human-visible way to select endpoints before inspecting the cryptogram. Their source rune lengths are **255 and137**.

The unknown 12,956-rune LP2 ciphertext is nearly uniform over all29 symbols and strongly suppresses consecutive identical runes. Under one plausible **predecessor-dependent 28-symbol cipher**, next-cipher-rune steps carry plaintext plus a changing pad:

```
D_i = (C_i - C_{i-1} + 29) mod 29          // native GP29 steps
D_i - 1 = (P'_i + K_i) mod 28               // if D_i != 0
```

Here P'_i is a GP plaintext rune rank from1 to28 (temporarily reserving F=0), and K_i is an *arbitrary unknown* 28-symbol pad; no repeated-period assumption. This model exactly explains the absence of ciphertext doublets unless a reserved plaintext event occurs, unlike ordinary Vigenere. The source-visual hypothesis is **the same K_i is reused at position i on the p8 and p14 bookends**. In that case subtracting their original step streams cancels the entire secret pad. The original first repeat on p8 is at second-rune position107 and p14 has none, so their **first106 matched native steps**, positions1–106 after the printed page start, need no hypothetical skip logic or page resets. This freezes the experiment before examining any linguistic result. It is a *different key-reuse hypothesis* from prior direct GP29 additive pads on raw ciphertext, and no previous chain-key test was identified in repository filenames.

## Independent paired-language Viterbi inverse on actual original source

Source-exact parser reads the two original GP29 indexed pages, the exact unchanged transcript word boundaries, and freezes their 106 nonzero original adjacent-rune differences. A GP28 bigram model is **trained only on a separate Gibran text**, retaining the source GP transliteration. Every position admits all28 unknown pad values, independent of every other position; a 28-state Viterbi optimizer finds the **exact globally best first-order shared-key plaintext pair** across all 106 positions. No plaintext crib, fixed key, guessed English word, adjusted alignment, or offset is used.

Independent out-of-sample **Shakespeare** source words of exactly the original printed word-length layouts of p8 and p14 generate **120 fresh synthetic native-English pairs**. An arbitrary freshly randomized pad is applied **equally to both texts**. All 120 are exactly reversibly decodable under the same formula, and their best Viterbi scores calibrate the native-English alternative. **120 original-page14-shuffled controls**, each keeping the exact source p8 steps and the actual p14 step symbol counts but breaking any alignment, calibrate a no-shared-pad alternative. Decoder scores are mean natural-log GP28 transition likelihood per original 106 aligned steps. Both controls are independently sourced and symmetric in program execution.

| Frozen test | Mean score/step | Range | Out of 120 above original |
|---|---:|---|---:|
| **Original p8/p14**, no fitted key | **−4.090450** | single source input | n/a |
| **Native Shakespeare two-time pad plants** | **−3.944618** | −4.089399 to −3.792205 | **120/120** |
| **Shuffled actual p14 source step order**, pad broken | **−4.052080** | −4.174016 to −3.911176 | **90/120** |

The original has **8 exact step equalities/106**. Its native Shakespeare planted pairs have a mean **6.281%** equality rate: equality alone cannot separate this source pair, and the complete bigram/word-boundary likelihood is the needed additional test. In the *full seven-page* botanical group, original pairwise step equality was only **136/4717 = 2.883%** in native identical-position alignment, likewise incompatible with a straightforward common pad supplying GP English across all pages.

The highest-likelihood original p8 prefix begins `OUENDINTOWIHTOYOHATHETOWANORHATOMAMTONDTHEINY...`; p14 begins `THSTSPLLEWONWHAWONBYOTHEUREAYOTHENTANYOUTER...`. They are **optimizer-generated English-like fragments**, not recovered plaintext. Their source-preserved separators form no coherent manuscript sentences, and their entire paired score ranks below all 120 independent native-positive controls. Every recovered rune sequence returns the exact source original step stream under its inferred key, as do the held-out Shakespeare plants, so simple reencryption by itself is not evidence of author plaintext.

**Interpretation and next decision:** a native-GP English **same-index reused arbitrary chain pad** is unsupported on the only independently chosen early106-pair source-bookend receiver. The likely answer is no common GP28 key on the manuscript-printed p8/p14 page origins. More importantly, extending such a repeated art-key to all seven botanical pages predicts a stronger cross-page step collision signal that is absent. This does **not** exclude per-page distinct pads, a source-provided different alignment, source-hidden repeat handling after position106, non-native plaintext, or a cipher whose predecessor-step relation differs from this model. No first-party source instructs the shared-pad operation. Do not attempt unsourced per-pair alignment or unconstrained model-rescuing exception tuning; require new author-selected evidence that yields a specific K_i recovery route.
