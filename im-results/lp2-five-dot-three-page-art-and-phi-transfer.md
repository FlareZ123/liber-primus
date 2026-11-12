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


## Cross-chapter 201-rune p2 witness: exact five-plus-one Shamir gate

An additional original-page length equality deserves a finite check: **LP2 physical p2 has exactly 201 GP29 runes**, the *only* 201-rune physical page among all 56 unsolved pages. Independently, deleting the p23 red 16-rune heading leaves 1,005 ciphertext runes = **five times 201** through p26. The small insect figure on p2 and the flying insect frames around pp24–26 provide only a broad visual theme; the images are not the same glyph and no source directs the reader to combine these pages. The equal lengths therefore motivate a candidate, without establishing its intended role.

Could p2's 201-rune original stream be the *secret output* of five 201-rune p23 Shamir shares, or a *sixth* consistent 201-rune share? For the documented 2013 five-of-ten threshold **translated hypothetically to GP29**, fix abscissae x=1,..,5 for p23 strands and secret x=0 for p2. Exact Lagrange interpolation then requires the 201-column equality:

\[
P_2(j)=5 S_1(j)-10 S_2(j)+10 S_3(j)-5 S_4(j)+S_5(j)\pmod {29}.
\]

For a sixth share at x=6 instead of p2 as the secret, six equally spaced evaluations of a polynomial of degree at most four require

\[
S_1(j)-5S_2(j)+10S_3(j)-10S_4(j)+5S_5(j)-S_6(j)=0\pmod {29}.
\]

The [independent read-only CJS SFT](../sims/lp2_p2_p23_201_shamir_consistency_sft.cjs) evaluates the **unaltered original rune identities** under two unambiguous 201×5 organizations (consecutive quintets versus five 201-rune blocks), both source reading directions on p2/p23, **all 5! = 120 share orders** for p2 as the secret, and **all 6! = 720 six-share orders** for p2 as an additional share: respectively **960 and 5,760** fixed candidate orderings. Exact planted degree-four polynomial GP29 controls recover 201/201 columns in both cases; altering one planted share gives 200/201.

| Original p23 arrangement | Best p2 = secret | Best p2 = sixth share |
| --- | ---: | ---: |
| Interleaved consecutive quintets; either orientation | **14/201** | **21/201** |
| Five contiguous 201-rune blocks; either orientation | **15/201** | **17/201** |

The exact best from all eight combinations is **15/201 secret** and **21/201 sixth share**. No combination remotely satisfies **all 201 required equations**. The 21-match best is a max over tested permutations, not a candidate decrypted phrase; no unknown text is recovered. This rejects only an **unaltered-symbol GP29 degree-four interpolation** with equal-spaced identifiers and the stated fixed stream layouts. Original 2013 byte-level SSSS, external packing, unknown per-strand nonlinear encodings, and other p2 source roles are **outside scope**. This result is independent of the separate five-dot visual-clone test.

## Decision

The original five-dot stamp appears in three distinct textual roles and orientations. Its mere presence should no longer be treated as a unique p23 quintet/byte/SSSS key selector. It remains possible that an independent clue selects an operation involving those five positions. Avoid new direct p56 φ(prime) sign/direction scans without such evidence. In particular, [Director task #568](https://github.com/FlareZ123/liber-primus/issues/568) needs independently justified 2013 share bytes/packing, not only this reusable printed ornament.
