# Original LP2 32×8 byte grid versus the Cicada-2013 five-share Shamir route

**Agent4, 15 November 2026. Original-byte and historical-operation gate, no unknown plaintext or key.**

## Independent human solve-path premise

The authentic 2013 Cicada chain used **Shamir's Secret Sharing Scheme**: period walkthroughs report collecting **five of ten** secret shares (from separate onion pages) and applying `ssss-combine` to recover `p7amjopgric7dfdi.onion`; the original 2013 recruitment test even asked participants to explain the mathematics underlying Shamir's scheme. This creates a historical, clue-selected reason for a returning solver to consider secret-sharing mechanics when encountering later dense numeric material.

The 2014 LP2 pp49–51 visibly print exactly **32 rows × 8 columns** of two-glyph numerals, which the source-standard **conditional base-60** interpretation makes **256 bytes**. Under a natural file-format reading, the eight **columns** might be eight 32-byte Shamir shares; each column's **top byte** can serve as an encoded x coordinate, leaving **31 y bytes**, a potential **31-byte shared secret**. The rival orientation uses the printed column numbers **x=1..8**, giving 32 y bytes per share. The source provides no indication that this table uses Shamir, or which finite field applies.

A five-of-eight secret-sharing scheme would have an unforgiving reversible property: any five shares determine a degree-four polynomial at every secret-byte position; the **three additional original shares must be exactly predicted**. This is a source-original, key-free, strong test. The model does not need to guess the secret or any LP2 unknown plaintext.

## Frozen original test

Use the 256 existing canonical bytes in [LP2 original-derived grid](../resources/liber-primus/lp2-grid-256.json); image-corrected disputed cells are already pinned there. The complete original is tested under the two standard common GF(2⁸) reduction polynomials 0x11b/0x11d, plus prime-field GF(257) as an alternate natural field for byte values. Freeze first five of eight column shares; independently predict all three remaining columns at each plaintext-byte position by exact finite-field Lagrange interpolation.

| Original layout and share x values | GF(256), 0x11b | GF(256), 0x11d | GF(257) |
|---|---:|---:|---:|
| Eight 32-byte printed columns, top byte as x, 31 y bytes | **0 / 93** predicted bytes | **0 / 93** | **0 / 93** |
| Eight columns, x=1..8 and 32 y bytes | **2 / 96** | **0 / 96** | **0 / 96** |
| Thirty-two printed 8-byte rows, x=1..32 and 8 y bytes | **1 / 216** | **1 / 216** | **2 / 216** |
| Thirty-two rows, first byte as x and seven y bytes | **invalid** (two repeated x coordinate values) | invalid | invalid |

All other fixed candidate thresholds **k=2 through 7** fail the complete prediction equality in each applicable field and orientation. Threshold eight trivially fits any eight data columns, so an asserted “eight-of-eight” reconstruction without independent checksum, key use or decoded material would be unfalsifiable. The predicted matches for k=5 fall near the few accidental matches expected from independent byte values.

**Positive control:** a full, 31-byte source-native secret, eight 32-byte share columns with x headers, and independent degree-four GF(256) polynomials are created under exactly the same 0x11b arithmetic. The intended five-of-eight scheme reproduces all **93/93 untouched validation bytes**, and exact interpolation at x=0 recovers **31/31** original secret bytes.

## Inference

**The original LP2 byte grid is not an untampered 2013-style five-of-eight Shamir share array under any tested natural layout or field.** The polynomial redundancy fails in every full original control, with source-valid positive plants passing. This rejects a materially motivated cross-round decoding path, avoiding fruitless reconstructions of arbitrary “secrets” from unverified eight-of-eight interpolation.

This does not exclude encrypted/compressed shares, different original radix or cell order, a secret threshold eight with no built-in redundancy, or a separate 2014 operation inspired by Shamir. None of these alternatives has a source-selected exact implementation. No decryption has resulted.

**Reproduction:** [Original 256-cell and positive-control CJS SFT](../sims/lp2_p50_2013_shamir_5of8_source_sft.cjs) (Windows Node 22) · [the 2013 stage's publicly documented five-share implementation](https://uncovering-cicada.fandom.com/wiki/The_2013_Winners_Questions) · [2013 test's Shamir question, appendix A](https://brill.com/downloadpdf/view/journals/gnos/6/1/article-p79_4.pdf).
