# Floral sixteen-page × 256-cell direct inverse: bounded original-input negative

**Status (12 November 2026, Agent20): source-shaped inverse evaluated on unchanged LP2. No recovered unknown plaintext, authentic key or identified historical cipher.**

## Original-source motivation

Physical LP2 pp40–55 have the same floral border on **sixteen successive pages**, including the runeless numerical p50. The pp49–51 table has **32 printed rows of eight glyph-pair tokens**, totalling **256 cells**. Combining adjacent printed rows in their published order gives 16×16 entries. A human could reasonably try matching a row to each identically framed page.

The source does not specify that regrouping, the page-key interpretation, or the arithmetic. The standard base60 glyph-pair-to-byte alphabet is a working transcription hypothesis. The complete source-order 256-byte stream has SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**.

## Source-art constraint: sixteen floral borders are identical original rasters

The original sixteen physical pages p40–55 (**source scans 57.jpg–72.jpg**) retain precisely the same left and right decorative floral design, including p50's numeric-only page and p54–55's separately headed chapter. Their source JPEGs switch between RGB and grayscale. To test whether the border itself supplies page-specific key bits, convert each original JPEG to 8-bit grayscale with Pillow and extract two **identical fixed coordinate windows**: left `x=100..559, y=600..3049` and right `x=1850..2309, y=600..3049`. Concatenate them in left/right order to 2,254,000 bytes per page.

**All 16 original border crops are bitwise identical**. Each has SHA-256 `75ba259e3537a909e3b54f2985331587bda0d36d8beca1ea4972585d43bad85f`, with 243,614 original ink pixels at grayscale under 200. Every pixel of each cropped frame matches p40 exactly, including antialiasing. The same fixed windows in p39 and p56 differ from the floral reference at **360,223 pixel positions** apiece, an independent nonempty negative control. This is the complete left/right floral margin across the main vertical border, **not** the whole JPEG or text-bearing centre, and it does not exclude a static printed code or a key elsewhere in a page.

This **rules out page-varying bits in those original floral-border pixels** as a decoder selector for the sixteen pages. A scheme based on their common geometry, orientation, repetition count or a separate source-aligned operand remains possible only with a further authored rule. See [independent original-JPEG 16-page reproducer](../sims/lp2_floral16_border_exact_source_sft.py), which checks all source pixels, its digest and both adjacent nonborder pages. The original-byte local replay matched those assertions; no GitHub Actions execution of the new SFT has been recorded.

## Source-shaped 16×16 Hill matrix on the complete 3,008-rune p40–53 chapter (Agent41, 12 November 2026)

The printed 32×8 table can be regrouped directly, without rearranging its 256 source tokens, as **one 16×16 GF29 matrix**. This creates a complete reversible **non-additive** candidate: the original p40–53 visual chapter contains exactly **3,008 = 188×16** ciphertext runes, so every rune, including the original red eight-rune heading and p53 terminal red51, fits into a whole 16-symbol Hill block with no padding, trimming or hidden phase. The same floral border spans 16 physical pp40–55 pages, providing a separate although incomplete visual motive for considering width16. The 16×16 row-major matrix over GF29 has full **rank 16**.

Applying its unique modular inverse blockwise to the full unchanged 3,008-rune original yields **IoC 0.03442831089160753**, compared with the original **0.0345426274862201**. The first decoded 16 runes spell `T-A-A-Y-EA-R-AE-D-Y-D-OE-D-R-OE-P-R`, with no intelligible original-language continuation. The complete original input reencrypts exactly (**3,008/3,008**); a separate native-GP solved-p57 plant encrypts and recovers all **3,008/3,008** runes. [Complete one-file original-cipher SFT](../sims/lp2_p40_hill16_original_gate_sft.cjs).

This closes the simplest genuinely non-additive, directly printed 16×16 Hill consumer. It does **not** preclude another source-specified matrix basis, separate IVs, previous-block feedback or an actual encrypted binary payload; the original does not instruct a human solver to apply any of those additions. No plaintext or original key was recovered.

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
