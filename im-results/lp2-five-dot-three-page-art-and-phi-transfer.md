# Three-page five-dot source-art relationship and bounded prime-totient gate

**Date:** 12 November 2026. **Status:** Exact original-art relationship; bounded cipher negative. No unknown plaintext/key recovered.

## Fixed source geometry

Original LP2 2400×3600 JPEGs: physical p7, archive 24.jpg (five dots at bottom); physical p23, archive 40.jpg (five dots above its red heading); solved p56, archive 73.jpg (five dots at bottom). These **reuse the same arrangement of five approximately 69-pixel black circles**. The [single-file reproducer](../sims/lp2_five_dot_motif_phi_gate.py) measures each centroid in a fixed 93×93-pixel source window, then enumerates all 5! correspondences under four axis-preserving mappings (identity, two reflections, 180-degree rotation), permitting only one translation per mapping. No scaling or arbitrary morph is fitted.

| Original-page pair | Geometric map | Fitted translation (x,y), px | Centroid RMS | Next-best RMS |
| --- | --- | --- | ---: | ---: |
| p7 bottom → p23 top | Reflect across horizontal axis | (−0.002,3674.017) | **0.029917 px** | 124.785 px |
| p23 top → p56 bottom | Rotate 180 degrees | (2400.626,3254.666) | **0.259252 px** | 124.697 px |
| p7 bottom → p56 bottom | Reflect across vertical axis | (2400.628,−419.351) | **0.243568 px** | 124.675 px |

This is direct evidence of repeated source ornamentation. It does **not** identify a cipher, byte order or key. The p23 body still has **1,005 GP29 runes = 201 complete quintets**, but the five dots by themselves are not an independent instruction selecting the p23 five-strand Shamir transfer. See the [original p23 artwork and quintet gate](lp2-p23-26-original-art-source-gate.md).

## Solved-page operation transferred without fitted parameters

The known p56 inverse is GP29 ciphertext minus the consecutive prime totients, with the original literal F at zero-based glyph index **56** retained and excluded from advancement of the prime clock. The SFT independently reproduces all **85 original p56 runes** as the authentic AN END text; the plaintext includes DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE (GP transliteration). Full output IoC = **0.07002801**. Exact forward re-encryption succeeds.

As a finite test of whether the mirrored five-dot design selects the same *direct* cipher, apply the same prime-totient stream, without new offsets or hypothetical F skips, to the p7-ending pp3–7 chapter, the intervening pp8–22 pages and the p23-opening pp23–26 chapter. The mirrored source supplies two natural directions; plus/minus supplies the inverse arithmetic pair.

| Original interval | Runes | Raw IoC | Forward − | Reverse − | Forward + | Reverse + |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| pp3–7 | 1145 | 0.034634 | 0.034283 | 0.034522 | 0.034324 | 0.034707 |
| pp8–22 | 3632 | 0.034517 | 0.034473 | 0.034617 | 0.034591 | 0.034581 |
| pp23–26 | 1021 | 0.034274 | 0.034837 | 0.034345 | 0.034384 | 0.034392 |

All 12 fully specified original-cipher inversions return near-uniform GP29 marginals and nonlinguistic beginnings. Every forward recipher succeeds, a correctness invariant that does not identify historical keys. The only family rejected here is **unmodified p56 φ(prime) decoding, with original or reversed reading, either arithmetic sign, and no unselected F bypasses**. A different authentic operation, alternate plaintext register, or source-given F/clock rule remains open.


## Source-authenticated solved-p56 plaintext as a frozen GP29 key

A second direct, falsifiable interpretation of the repeated five-dot image is that the human who solves p56 might reuse its **known 85-rune decoded text** as the running GP29 additive key for the earlier marked sections. This has stronger key provenance than guessing a numerical seed, although **no original instruction states that the solved text is a pad**. Freeze the complete, exactly recovered 85-rune p56 GP text as the repeating key. The five-dot location supports either a start-aligned clock or an end-aligned clock; test both arithmetic signs without tuning a phase or guessing bypass glyphs.

| Original interval | Start-aligned − / + IoC | End-aligned − / + IoC |
| --- | --- | --- |
| pp3–7 | 0.034730 / 0.034370 | 0.034225 / 0.034496 |
| pp8–22 | 0.034413 / 0.034422 | 0.034517 / 0.034441 |
| pp23–26 | 0.034743 / 0.034691 | 0.034198 / 0.034376 |

All 12 fixed original-input inverses produce nonlinguistic GP29 and near-random index of coincidence. They exactly re-encipher under the frozen 85-rune key. A positive control is the independently recovered **actual p56 known plaintext** used to construct the pad; the test does not establish that earlier unknown pages were generated with a repeated pad. This rejects these specific no-skip, unmodified 85-rune-key hypotheses. A word-indexed book cipher, a non-additive key consumer, a genuinely new source-selected role, and a secondary encrypted register are not tested.

## Decision

The original five-dot stamp appears in three distinct textual roles and orientations. Its mere presence should no longer be treated as a unique p23 quintet/byte/SSSS key selector. It remains possible that an independent clue selects an operation involving those five positions. Avoid new direct p56 φ(prime) sign/direction scans without such evidence. In particular, [Director task #568](https://github.com/FlareZ123/liber-primus/issues/568) needs independently justified 2013 share bytes/packing, not only this reusable printed ornament.
