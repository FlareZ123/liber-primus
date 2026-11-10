# A lossless permutation architecture for the original word-echo anomalies

**Status, 10 November 2026: constructive, exactly reversible conditional cipher family; original unknown LP2 plaintext and key still unrecovered.** The hypotheses are **deliberately source-guided by previously observed anomaly counts**, so reproducing those counts is a model-capacity witness, not discovery-independent evidence of Cicada's mechanism. All original heldout decryption results remain GP-uniform. This is a useful lossless alternative to earlier collision-repair surrogates that could match runic echoes only by overwriting plaintext.

## Reversible assignment and manuscript inputs

Fix the 29 GP indices and identify index 28 with the rare rune EA as a zero step. Choose generator \(g=15\), proven primitive root modulo 29 and independently selected by the existing red page40 quotient/p15/p53 arithmetic. The base encoder assigns each GP plaintext rune \(p\in\{0,\ldots,27\}\) to a distinct next ciphertext rune \(C_{i-1}+g^p\bmod29\), with EA assigned to the immediately preceding ciphertext rune itself. This is a perfect 29-symbol permutation at every state.

Use the exact 2,896 whole canonical words and their rune-local offsets, across printed line and physical page breaks. From each state-specific permutation, perform only **swaps**, preserving bijectivity. The source-visible conditions are:

1. **T6 anchor:** when at least six earlier ciphertext runes belong to the same displayed word, target \(T_i=24-2C_{i-6}\bmod29\). If \(T_i\ne C_{i-1}\), swap the outputs assigned to plaintext index **15 (S)** and the prior plaintext preimage of output \(T_i\), so plaintext S always encodes exactly the T6 echo. Value 24 matches 3301 mod29. The 15/S choice is a source-clue-motivated hypothesis, not an established plaintext.
2. **Specific S5 anchor:** when five earlier runes are in the same word and \(C_{i-5}=15\), make plaintext index **18 (E)** map to visible ciphertext **15 (S)**, unless the swap would displace an active T6 S anchor. This second-choice English-popular source rune is exploratory.
3. **Consecutive lag5 extension:** when the previous position already echoes its five-step predecessor \(C_{i-1}=C_{i-6}\), swap the output assigned to plaintext E with the preimage of \(C_{i-5}\), again avoiding displacement of the active T6 S anchor.

Variant 0 is the unswapped primitive-root map; variant 1 adds T6; variant 2 adds S5; variant 3 adds the lag5 continuation. They are nested *exactly reversible* models. Every original ciphertext rune decrypts uniquely under each proposed model, and 160 independent GP-English source plants per variant were correctly round-tripped **160/160**, a total of **640 complete exact 12,956-rune plaintext recoveries**.

The original source ciphertext counts, all calculated from exact original page/word positions, are:

| Measurable original feature | Original LP2 |
| --- | ---: |
| Word-local T6 affine matches \(C_i=24-2C_{i-6}\pmod{29}\) | **80 / 1,290** |
| Word-local S5 matches \(C_i=C_{i-5}=15\) | **11 / 74 S-exposure slots** |
| All lag5 matches | **104 / 2,105** |
| Consecutive lag5 echo pairs | **9** |
| Within-page adjacent repeated ciphertext runes | **86** |

## Source English GP controls on exact original shapes

The planted plaintext source is the independently committed Shakespeare-to-GP control, using 160 different pre-seeded **contiguous 12,956-rune passages** per model with unchanged original displayed word and physical page geometry. Retaining English source dependencies makes this a more discriminating cipher-capacity test than independent uniformly sampled runes. For every model the encoder produces source-length ciphertext and the inverse reproduces all source GP runes.

| Source-plain positive cipher model | T6 mean ± SD | S5 mean ± SD | All lag5 mean ± SD | Consecutive lag5 mean ± SD | Repeats mean ± SD |
| --- | ---: | ---: | ---: | ---: | ---: |
| Variant0: primitive-root baseline | 44.29 ± 7.02 | 2.59 ± 1.62 | 69.78 ± 8.77 | 2.57 ± 1.75 | 97.54 ± 15.43 |
| Variant1: +T6 swap | **84.21 ± 11.58** | 2.51 ± 1.62 | 70.39 ± 9.23 | 2.29 ± 1.63 | 97.20 ± 14.98 |
| Variant2: +S5 swap | **86.80 ± 11.43** | **8.08 ± 2.80** | 76.61 ± 9.35 | 2.85 ± 1.83 | 97.79 ± 14.79 |
| Variant3: +lag5 continuation | **87.12 ± 11.43** | **8.63 ± 2.74** | **79.56 ± 8.30** | **5.21 ± 2.15** | **97.31 ± 14.74** |

Variant3 permits simultaneously elevated T6, S5 and consecutive lag5 events with **no arbitrary glyph overwrites, information loss or ciphertext replay**. However, it remains short of the original **104** total lag5 matches (planted mean 79.56), and its paired mean 5.21 is below the original 9. These are meaningful *model shortfalls*. The original duplicates 86 are within positive-source sampling variation, but every variant has exactly the number of repeats implied by its planted source EA positions by construction.

## Direct original ciphertext inverse: conditional anchors, no decoded English

Applying the exact inverse to untouched original ciphertext gives a whole-book GP unigram IoC **0.0353113** for baseline and **0.0353317** even for variant3, near the 29-symbol uniform baseline \(1/29=0.0344828\), very far from independent GP-English controls (typical ≈0.060–0.062). Thus the rule, with its stated zero additional key, does **not** decrypt the manuscript.

Within the *conditional* permutation hypothesis, 79 of the **80** original T6 affine hits invert to source rune **S**, while the remaining hit has \(T_i=C_{i-1}\) and is instead an EA zero step. With the S5 rule, all **11** original S5 hits invert to proposed source rune **E**. These 90 symbol predictions are **hypothesis-conditioned** and must not be promoted as recovered original plaintext: the full decoded register and independent tests do not support historical adoption.

The main research benefit is **constructive cryptographic feasibility**: source-guided, word-local echo channels with both lag6 affine and lag5 fixed-symbol biases coexist exactly with a first-order prohibition on accidental same-rune output, without violating lossless decryption. A further independently constrained source key or state function would still be required to obtain actual LP2 plaintext and to predict the remaining excess of lag5 echoes.

## Reproduction and limits

- [Pure Node.js source-word bijective models, original inverse and 640 seeded positive plants](../sims/lossless_word_echo_permutation.cjs).
- [Passed GitHub Actions run 42801910888](https://github.com/FlareZ123/liber-primus/actions/runs/42801910888).
- [Prior exact-source field inverse/unknown-lag research](reversible-exponent-feedback-lookup.md) and [word-local unrestricted key negative](word-local-exponent-autokey-inversion.md).

The cipher choices of plaintext S and E, lag5/6 context, and 3301-affine target were selected from existing knowledge of the source and its anomalies. No null p-value or historical likelihood is claimed for their match. The next substantive goal is a **source-derived complete state/key** that independently predicts actual ciphertext transitions and yields linguistically coherent heldout original plaintext, rather than fitting additional switches to the same source-observed counts.
