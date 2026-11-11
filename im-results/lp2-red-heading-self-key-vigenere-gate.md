# Nine-title GP29 self-key Vigenère: bounded original-cipher negative

**Decision, 11 November 2026.** The direct rule in which each source-visible red heading is repeated as the GP29 key for its following titled unit does **not** decrypt the original LP2 bodies. This is a bounded negative for one simple, human-motivated mechanism. It recovers no unknown plaintext, authentic key, cipher architecture, or destination.

## Why this was a reasonable human test

A solver sees red titled units separated from their bodies by the manuscript's recurring 13-dot title punctuation. The GP alphabet has 29 symbols, so the simplest key transfer is to use the red heading's own rune indices as a repeating mod-29 Vigenère key for the following body. The title itself is treated as key material, not as plaintext. The reset occurs only at a source-visible title boundary. This is a low-cost, recognizable operation; it does not require a guessed external key or a fitted offset.

The operation is a hypothesis, not an authenticated instruction. The experiment therefore freezes the simplest literal interpretation and does not rescue it with key transformations, phase shifts, alternate alphabets, extra skips, or arbitrary segmentation.

## Frozen original-source partition

The test follows the strongest current original-image reading: **nine titled units**, including the 10-rune p33:0 interlude and the later p33:91 cuneiform-linked title. The exact original red spans are checked against `lp2-ink-annotations.json`; their rune values are taken from the unchanged `lp2-corpus.json`.

| Physical page | Heading offset | Key runes | Following body runes |
|---:|---:|---:|---:|
| 0 | 0 | 13 | 716 |
| 3 | 0 | 16 | 1,129 |
| 8 | 0 | 12 | 1,726 |
| 15 | 9 | 11 | 1,883 |
| 23 | 0 | 16 | 1,005 |
| 27 | 0 | 19 | 1,414 |
| 33 | 0 | 10 | 81 |
| 33 | 91 | 8 | 1,581 |
| 40 | 0 | 8 | 3,308 |
| **Total** |  | **113** | **12,843** |

The 55 rune-bearing pages 0–55 contribute 12,956 unknown runes; physical p50 is the source-verified rune-free table page. The 113 heading runes are used as keys and excluded from the scored bodies. Every other unknown rune is included exactly once. The p33:0 titled interlude is kept separate from the later p33:91 unit. Physical page boundaries are preserved as source coordinates but do not reset the key inside a titled body.

Source inputs are frozen by their Git blob IDs:

- `resources/liber-primus/lp2-corpus.json`: `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`
- `resources/liber-primus/lp2-ink-annotations.json`: `3c52f209ce6bd7b138eaa2d4a9323526952ba9f9`
- `resources/control/shakespeare_first300k.txt`: `94c677ad9dd50771c6670e0c4e4dad9052b46d85`

## Exact inverse and controls

For each body, let (C_i) be the original GP29 rune index and (K_i) the corresponding red-heading rune index repeated from the start of that body. The two ordinary Vigenère conventions are tested:

[
P_i = C_i-K_{imod |K|}pmod{29}
qquad	ext{and}qquad
P_i = C_i+K_{imod |K|}pmod{29}.
]

No heading transformation, key reversal, offset, or per-page phase is admitted. The decoder and encoder are exact inverses on the original inputs.

A smoothed GP29 trigram model is trained on the first 200,000 characters of the independent Shakespeare reference (144,611 encoded GP runes). Its final 100,000 characters (72,263 GP runes) are held out. The original outputs are compared with 2,000 contiguous native-GP windows, each partitioned into the same nine body lengths. A separate 1,000-trial conditional null independently shuffles each heading's rune order while preserving its length and section assignment; each trial selects the better of the same two global signs. Both-sign native-GP positive controls are re-encrypted and recovered exactly.

## Original result

| Measure | Raw bodies | (P=C-K) | (P=C+K) |
|---|---:|---:|---:|
| GP trigram log score (nats/rune) | **−6.194062** | −6.219439 | **−6.173454** |
| GP29 IoC | 0.03448119 | 0.03448955 | 0.03451559 |

The nominally better plus-sign output is still at ciphertext level. Its score is about **3.77 nats/rune below** the held-out native-GP mean:

- Native held-out mean: **−2.400252** nats/rune
- Native held-out standard deviation: **0.050819**
- Native held-out minimum: **−2.494490**
- Native held-out fifth percentile: **−2.484572**
- Native windows at or below the original best: **0/2,000** (empirical lower-tail bound **1/2,001**)

The exact key-order null is equally unpersuasive: **469/1,000** shuffled-key trials score at least as well as the original best (upper-tail **p = 0.46953**); null median **−6.175082**, range **−6.244770 to −6.102827**. Thus the observed ordering of the red-heading runes is not distinguished by this fixed operation.

Both signs pass the constructive native-GP control at **12,843/12,843** runes. This validates the arithmetic and scoring pipeline; it is not evidence for the original cipher.

## Decision and limits

Retire the direct, untransformed repeating-key GP29 Vigenère interpretation on the nine source-titled units. Neither sign yields language, and the exact heading order performs like shuffled key material. Do not expand this branch with arbitrary phases, reversed keys, transformed headings, fitted resets, or additional cipher layers absent a new independent clue.

This result does **not** exclude a title being used through a different source-authenticated operation, a changing/stateful key, a non-GP intermediate, an external key, or a separate mechanism for the headings. It does not prove that all nine titled units are cipher-reset units; it tests the direct reset-at-title rule only.

**Reproducer:** [`sims/lp2_red_heading_self_key_vigenere_sft.cjs`](../sims/lp2_red_heading_self_key_vigenere_sft.cjs). The script reads only the three frozen repository inputs, checks every heading against the original ink annotation, asserts the complete 12,956-rune partition, runs the fixed two-sign inverse, and reproduces the positive controls and matched null.
