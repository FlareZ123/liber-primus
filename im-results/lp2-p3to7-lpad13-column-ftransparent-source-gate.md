# LP2 p3–7: source LPAD width13 column read with historical F-skip, exact original feasibility gate

**Agent27, 18 November 2026. Classification: source-motivated conditional negative; no unknown plaintext or creator key.** Original complete p3–7 chapter ciphertext is 1,145 GP29 runes across 255 printed words. Its four original red-span initials, at p3/0, p3/119, p6/71 and p7/194, read `L P A D`. The 13-dot stencils could motivate trying a 13-character left-pad width. Neither the acrostic interpretation, width, filler symbol, column read, nor resulting key schedule is independently specified by Cicada. This study covers the **inverse-permutation direction** of a 13-column model plus three source-key schedules. The earlier column-forward p56 test is already documented in [the existing Director #1437 readout](../workplace/lp2-p3to7-red-initial-lpad-readout.md#literal-13-column-read-and-authentic-p56-f-skip-inversion): its original column-only prime-totient inverse fails at source offset 61. The inverse permutation here is a different test and supplies only a narrow additional bound.

## Operational hypothesis and exact input

Original inputs are `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp2-ink-annotations.json` and `lp2-grid-256.json`. The complete p3–7 source parses to exactly 255 printed words and 1,145 runes, matched rune-for-rune against the canonical physical pages. Slash/newline wraps printed lines; `-` and `.` delimit words. All original word lengths are ≤12.

For each original printed word, construct a **13-cell row**, left-padding it with synthetic **F=0** symbols, while retaining original word lengths. The table is 255×13 = 3,315 positions: 1,145 real rune positions plus 2,170 artificial padding positions. Read these padded rows *column-major*, top-to-bottom and left-to-right, skipping the synthetic cells, and assign the resulting 1,145 positions to the source original ciphertext stream in its physical order. The exact inverse column permutation then yields 1,145 ciphertext symbols in row-major original word order. Every original rune occurs exactly once. In this construction synthetic padding symbols are layout holes, not encoded historical ciphertext and not plaintext-F bypasses.

Test only three independently available streams, with no key guessing, plus the two conventional sign choices: (A) Euler totients of consecutive primes starting at two, the known solved p56 schedule; (B) row-major original p50 base60 table bytes modulo29, cyclic after 256 values; (C) original red `LPAD` GP indices `[20,13,24,23]`, cyclic. For each, use the historical strict **plaintext-F-transparent cipher**: a literal plaintext F transmits ciphertext F without consuming a key symbol, while every non-F plaintext letter advances the key and adds its key value modulo29. The inverse enumerates **every** legal latent ciphertext-F interpretation exactly as a set of consumed-key counts; a consuming branch that decodes to F is forbidden. This is a finite mathematical feasibility question, independent of language scoring.

## Original-cipher result

The table reports the **first zero-based transformed-row-order rune position at which no legal historical F-skip inverse survives**. A full plaintext of length 1,145 is therefore mathematically impossible under each frozen key/sign/transport interpretation.

| Source stream | Forward sign | First impossible offset | Peak legal key clocks |
| --- | ---: | ---: | ---: |
| p56 original prime-totient schedule | −1 | 93 | 3 |
| p56 original prime-totient schedule | +1 | 69 | 2 |
| p50 original base60 byte schedule | −1 | 97 | 4 |
| p50 original base60 byte schedule | +1 | 17 | 2 |
| literal LPAD `[20,13,24,23]` | −1 | 1 | 1 |
| literal LPAD `[20,13,24,23]` | +1 | 5 | 1 |

A **positive encoder control** takes the genuinely clear 95-rune p57 source and tiles it to exactly 1,145 runes. Each of the six true forward historical-F cipher variants encrypts this plaintext, applies the same source-fixed 13-column permutation and successfully yields a complete legal inverse clock on the reverse operation. All position permutation bijectivity, original physical source boundaries, four red initial offsets, padded cell count and ciphertext consistency assertions pass. Thus early original failure is not a broken parser or a bug that rejects all plaintext-F schedules.

**Exact Windows Node22 SFT and passed run:** [single CommonJS source test](../sims/lp2_p3to7_lpad13_column_ftransparent_sft.cjs) · [manual Windows CI 44249561756](https://github.com/FlareZ123/liber-primus/actions/runs/44249561756). The test asserts the six first-failure offsets, authentic source alignment, six positive plants and strict forward transparency.

## Causal decision and bounds

Reading down columns of an LPAD array is a human-sized operation **already investigated by Agent50 and others**. Our test reverses that column permutation before decoding, as a second possible stage order, and adds p50/literal-LPAD key schedules under the authentic strict F-skip. This **one source-shaped implementation** cannot decode even the first 98 inverse-position runes under any of three original-source keys and either sign, even if every cipher F is granted either historical meaning where legal. A two-layer claim would still need to explain why the first-pass authentic F inverse should fail; no hidden key, transpose rotation, additional substitution or source text justifies rescuing this construction. It does not supersede the previously reported column-forward failure at offset61.

This result **does not exclude** column-major with an independently sourced different cipher/key, non-F-transparent transforms, different widths, SQL literal truncation, different pad strings or a genuinely authored operation that the four red initials might represent. The historical p56 cipher is only one known positive cipher, not known to govern LP2 p3–7. Nothing here recovers unknown-page plaintext or a destination. Research should prioritize locating a first-party specification of the padding operands and subsequent cryptographic receiver, rather than postselecting them to fit accidental short language fragments.
