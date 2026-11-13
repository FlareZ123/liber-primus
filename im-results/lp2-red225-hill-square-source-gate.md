# Original red-ink 225-rune Hill-square candidates: source-key inverse tests

**Status (13 November 2026, Agent6): conditional failure of two source-motivated reversible architectures. No recovered unknown LP2 plaintext or authentic cipher key.** Reproduce with [one CommonJS test](../sims/lp2_red225_hill_square_sft.cjs); its only inputs are the preserved original-page GP transcription and source-image ink annotations in `resources/liber-primus/`.

## Why this was a plausible one-shot inverse

The [original LP2 ink inventory](../resources/liber-primus/lp2-ink-annotations.json) records exactly **225 visibly red runes** throughout physical p0–57, including **213** on p0–55 and **12** on solved p56/p57. That is a complete **15×15** square in the original page and red-span order. Cicada had already used 5×5 and 7×7 magic squares in the 2014 puzzle, making a matrix-based operation a human-recognizable hypothesis, although the original LP2 images never instruct a solver to group red symbols into a 15×15 numerical matrix.

The entire source-ordered red GP29-index matrix is invertible over **GF(29)** (rank15). It therefore supplies a precise, **no-fitted-parameters** candidate Hill-cipher key. As an independent GP-native representation, each red rune's Gematria Primus prime weight can also be reduced modulo29 to form a second invertible key matrix. Both matrices and inverses are created mechanically from the original runes, without learned maps, guessed English words, or secret values.

**Frozen test.** Keep all 58 original red source runes as key material. For the original **56 unknown physical pages**, test two direct natural ciphertext streams: (a) all **12,956** original runes, and (b) the **12,743** black runes after excluding all 213 source-red positions. On each source stream use consecutive length15 blocks in manuscript order, truncating only the incomplete final block. Test the matrix, its inverse, transpose, and inverse transpose under each of the two numeric encodings. This is exactly **16** predeclared, parameter-free original-input models; no learned phase, column shuffle, keyed shift, or post hoc cipher layers.

## Original-input result

| Input / comparison | GP29 IoC |
| --- | ---: |
| Original complete unknown source (12,956 runes) | 0.03447840 |
| Original black-only source (12,743 runes) | 0.03448293 |
| **All 16 Hill decode models** (12,735 or 12,945 complete-block runes each) | **0.03444172–0.03452070** |
| Source-native solved p57 plain-text runes (95) | 0.06270997 |

Every candidate output remains near the random-runic baseline. For example, the literal red-index matrix inverse on black-only ciphertext opens

`Y-AE-EO-A-S-G-N-TH-W-Y-IA-C-J-O-A-J-B-O-A-P-M-E-NG-P-U-W-E-R-C-TH-P-G-OE-W-AE...`,

not a readable statement. The other 15 opening blocks likewise fail as original plaintext. Both candidate key matrices exactly recover **90 of 90** solved-p57 GP-native plaintext symbols when these are deliberately encrypted into length15 blocks and inverted with the corresponding source key, establishing that the test includes functioning reversible models.

**Decision.** A complete red 15×15 matrix is source-visible after transcription, and both fields are mathematically valid keys. The direct 15-rune Hill operations specified by that literal matrix **do not decode original LP2 ciphertext** in either of the two fixed streams. The red-square idea itself remains an unselected numeric/layout coincidence; this test does not exclude a different composition, per-chapter resets, alternative 225-symbol routing, a nonlinear operator, or a missing external instruction. No such extension should be launched merely to improve the fit. Seek an independent original clue selecting a different consumer, or prioritize source-derived key/operation discovery.

## Nine 5×5 source keys for nine visual chapters

There is a second, independently motivated partition of the same **225 red source runes**: the nine [source-visible unsolved chapters](../results/README.md) and the **5×5 historical 2014 magic-square** precedent suggest nine successive 25-rune red blocks as nine distinct 5×5 Hill keys. Each key is assigned to the matching numbered unknown visual chapter, even though the red-source slices themselves cross the original chapter and solved-page boundaries. This cross-boundary assignment is an **unselected hypothesis**, kept fixed before any plaintext inspection.

Each of the nine GP-index keys is invertible over GF(29). For the GP-prime-weight-mod29 interpretation, **the first 5×5 key is singular**: it cannot serve as a reversible Hill cipher and is excluded from those models. For each valid chapter key, test direct key/inverse and transpose/inverse-transpose on the original complete or black-only chapter body, starting at its original chapter boundary; do not search shifts, reordering, padding or row permutations. This yields 16 source-frozen chapter-assembly models, with one prime encoding limited to eight of the nine chapters.

| Nine-square experiment | Original decoded IoC |
| --- | ---: |
| GP-index keys on all nine chapters, all eight transform/stream arrangements | **0.03446815–0.03453244** |
| GP-prime keys on eight invertible chapters, all eight arrangements | **0.03445912–0.03453495** |
| All individual decoded chapter IoCs within valid models | **0.032676–0.035505** |
| Source-native solved p57 GP plaintext reference | **0.06270997** |

No source-original chapter yields native-readable GP English. The reproducible script includes synthetic exact **90/90 solved-p57 GP-rune recovery** under every invertible 5×5 key. One apparent short `U-F-F-F-F` feature in a full-stream inverse-transpose model is an algebraic self-reference: the ciphertext's first five source red runes are themselves the first key row, whose inverse-transpose is the unit basis vector. It is an expected matrix identity, not decrypted text.

This gates the two literal square sizes supported by the 225-source-count coincidence and the documented 5×5 precedent. The hypotheses lack an original instruction selecting Hill multiplication or a particular red-to-chapter allocation, and neither produced a key-bearing phrase, plaintext, or destination.

## Exact input and audit scope

- [The 58 physical LP2 source pages and page mapping](../resources/liber-primus/README.md), original JPEGs `17.jpg`–`74.jpg`.
- [Canonical GP29 transcription and rune/prime table](../resources/liber-primus/lp2-corpus.json).
- [Ink-channel source spans](../resources/liber-primus/lp2-ink-annotations.json): all 225 positions are cross-checked against the original transcription by the reproducer; no overlap or mismatch is permitted.
- [Source-controlled complete reversible test](../sims/lp2_red225_hill_square_sft.cjs). Fixed transport is manuscript order and 0-based modular arithmetic. Original last partial blocks are omitted only from the model tests, never from the source inventory.
