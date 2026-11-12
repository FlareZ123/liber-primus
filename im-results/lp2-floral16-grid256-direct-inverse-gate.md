# Floral sixteen-page × 256-cell direct inverse: bounded original-input negative

**Status (12 November 2026, Agent20): source-shaped inverse evaluated on unchanged LP2. No recovered unknown plaintext, authentic key or identified historical cipher.**

## Original-source motivation

Physical LP2 pp40–55 have the same floral border on **sixteen successive pages**, including the runeless numerical p50. The pp49–51 table has **32 printed rows of eight glyph-pair tokens**, totalling **256 cells**. Combining adjacent printed rows in their published order gives 16×16 entries. A human could reasonably try matching a row to each identically framed page.

The source does not specify that regrouping, the page-key interpretation, or the arithmetic. The standard base60 glyph-pair-to-byte alphabet is a working transcription hypothesis. The complete source-order 256-byte stream has SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**.

## Frozen reversible consumer

Let B be the 256 original-order base60 table bytes, j the physical page number minus 40 (range 0..15) and i the zero-based rune position within that physical page. No fitted shift, row permutation or page restart variant is allowed:

\[
K_{j,i}=B_{16j+(i\bmod16)}\bmod29,\quad
P_{j,i}=(C_{j,i}-K_{j,i})\bmod29.
\]

The exact encoder adds the same K modulo 29. Physical p50 occupies row j=10 and consumes no runes. Letter F and every source rune count normally. Punctuation does not consume key.

A planted control encrypts native GP runes from solved p57 under exactly this rule and recovers every rune. An independent native-language comparison maps the pinned Gibran text to GP29 with the established spelling substitutions and longest-match rune digraphs, sampling 18 disjoint 3,316-rune windows.

## Original-cipher outcome

| Measure | Value |
| --- | ---: |
| Original floral p40–55 ciphertext | **3,316 GP29 runes** |
| Original IoC | **0.03446282660786315** |
| Fixed decoded IoC | **0.03446937650442937** |
| Native-GP Gibran control windows | **18** |
| Native window minimum and maximum IoC | **0.0570892623543 / 0.0626792351904** |
| Planted solved-p57 output IoC | **0.07222116089638973** |
| Original cipher exact forward re-encryption | **3,316/3,316** |

Decoded prefix (GP transliteration):

F-I-Y-X-AE-E-S-EA-M-AE-O-W-OE-H-M-D-E-B-EA-T-I-C-G-OE-A-TH-P-S-O-M-AE-W-R-D-P-T-EA-L-W-NG-P-F-M-EO-X

The original output is approximately uniform and far below all held-out native-prose controls. **The specified literal 16×16 page-row additive decoder fails to recover GP-native plaintext.** This is a narrow cipher-family decision, with no implication for indirect table uses, alternative key clocks or source-directed nonlinear machines. Perfect re-encryption verifies only the reversible implementation.

The missing original clue is an author-selected column clock, alternate register or key-generation instruction; none is supplied by the floral artwork alone. Retire the literal period16 page-row hypothesis rather than optimizing unknown row mappings on the same original text.

**Reproducer:** [CommonJS SFT](../sims/lp2_flower16_grid256_direct_sft.cjs), Node.js 22 and repository canonical resources only. The file asserts byte ordering, page counts, source digest, exact original inverse, planted solved-p57 round trip and the independent native-control range.
