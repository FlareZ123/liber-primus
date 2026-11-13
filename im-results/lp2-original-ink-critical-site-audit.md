# Original-image adjudication of all LP2 high-leverage doublets and one-rune words

**Agent11, 13 November 2026. Source validation for Director Issue #783. No new plaintext, cipher, or key.**

## Decision

All **86** adjacent identical-rune sites and **83** complete one-rune typographic words in the unsolved physical LP2 corpus were located in the supplied **2400 × 3600** original JPEG images and inspected in high-resolution runic context. **No defensible rune-identity or word-boundary correction was found at these 169 sites.** The original-source constraint underlying the low-doublet, long no-repeat cross-word interval, and one-rune prime-sum arguments therefore survives this independent pixel check.

The machine-readable [169-site original-ink manifest](lp2-original-ink-critical-sites.tsv) gives every physical page, archival JPEG filename, **zero-based transcription line and within-line rune index**, original GP rune, transliteration, original-image pixel center coordinates, and observation mode. Doublets have both independently localized glyph centers and a normalized pixel-overlap diagnostic. An [original-source inventory SFT](../sims/lp2_original_critical_sites_audit_sft.cjs) checks each row against the unchanged transcription and page image mapping; it does not claim to authenticate a cipher.

## Original-source method

Source images are `resources/liber-primus/17.jpg` through `72.jpg` (physical LP2 p0–55, omitting the runeless grid p50 at `67.jpg`); source text is `resources/lp2-transcription.txt`. The physical page index is `JPG basename − 17`; the transcript removes physical p50. The source page line breaks `/` and `%` are **transparent within typographic words**. Each rune is indexed within its printed line, so line-wrap and glyph-merge cases remain independently addressable.

For every printed text line, grayscale ink below 170 was segmented into connected components within a 130-pixel vertical strip centered on the line's projected ink peak. Components smaller than 200 dark pixels or shorter than 65 pixels were excluded. On lines where the source rune count exactly matched the component count, individual rune boxes were aligned by horizontal order: **154 of 169** events fell in this class, including **81 doublets and 73 singleton words**. Each of these placements was checked in the original-image glyph atlas, with a red center marker and surrounding punctuation.

At **15** events, a component count mismatch required independent manual pixel placement. These were **five doublets and ten singletons**, involving merged runes, floral marginal art, special chapter layout, a giant red initial, and the original printed numeral `7` on p10. Each exception was resolved by inspecting the underlying original ink alongside its exact source-line rune sequence. The p54 doublet is the **two ordinary black NG glyphs** at image x790 and x861, both on the second printed line; the nearby enormous red initial belongs to a different line and cannot be counted as either glyph. The p54 initial one-rune A is itself the giant red initial at approximately (645,964). These distinctions explain why an automated global component order fails on this particular page.

A pixel-overlap diagnostic used a binary mask for each source component, resized to 64 × 96, with the maximum intersection-over-union after a ±3-pixel alignment in each axis. **85/86** original doublet pairs score at least **0.85**; the remaining p34 line-spanning **R/R** pair scores **0.777**. Both p34 R forms are clearly visible at the end and beginning of consecutive printed lines, with matching GP identities; its reduced normalized score reflects a shape/line-image difference rather than evidence for a distinct glyph. The five manually placed doublets score 0.911–0.998. This similarity diagnostic supports visual identity; a high score alone would not identify an unknown GP letter without checking the original form.

## Risk-bearing exceptions and adjudication

| Physical page | Original source issue | Ink-based decision |
|---|---|---|
| p3 | Three connected-component merges in line 11 affect horizontal rune indexing | The two adjacent AE runes are distinct, identical-formed symbols at (938,2712) and (977,2712) |
| p8 | One early merged pair shifts two later repeated-rune indices | OE/OE at (798,2040), (848,2040); J/J at (1290,2040), (1356,2040) |
| p10 | Printed nonrune `7` counted by shape segmenter | The single G word follows the digit at (1570,2040) and remains a separate runic token |
| p16 | Component merging in a 25-rune line | The D singleton is visible at (702,918) |
| p27, p33, p38, p47, p48, p52 | Decorative marks, numerals, or artwork intersect text-line bounds | Singletons located at their actual line indices; extraneous ink excluded |
| p45 | Rune merging in doublet line; leading artwork on singleton line | E/E at (784,1851), (844,1852); O singleton at (1118,910) |
| p54 | Giant red initial and black-text line have misleading image-component counts | NG/NG at (790,1158), (861,1158); one-rune A at the large red initial (645,964) |
| p34 | Two R runes straddle a line break and have the lowest overlap diagnostic | Same printed GP R identity in both positions; no correction |

These checks are **site-level**. They do not imply that the entire manuscript's transcription has been independently audited. They also cannot certify the exact word interpretation of material requiring a presently unknown cipher.

## Implications for original-cipher research

The original source still supports the **86 / 12,956** low-repeat inventory, including the **63 within-word** and **23 cross-word** pair split documented in [word-boundary analysis](lp2-word-boundary-doublet-analysis.md). The long p11–23 interval with no equal rune across printed word boundaries remains an image-backed condition that prospective cipher mechanisms need to explain. The **83** unchanged singletons still exhibit the 28 distinct GP rune forms used by the [word-prime conservation obstruction](lp2-word-prime-checksum-conservation-gate.md). No previous conditional exclusion is retracted by this audit.

The most actionable consequence is that attacking the published structural anomalies can proceed without weakening them on the assumption that a few exceptional repeated glyphs or single-letter words were transcription errors. The next useful cipher proposal must provide a source-selectable reversible rule and original-cipher plaintext evidence. Nothing in this audit specifies such an inverse.

## Reproduction and evidence boundaries

- Tab-separated manifest: [lp2-original-ink-critical-sites.tsv](lp2-original-ink-critical-sites.tsv), 169 site rows, source glyph and original pixel centers. The `placement` field differentiates machine-indexed original ink from the 15 manually resolved cases; each doublet has its original-body normalized IoU.
- Original source images: [resources/liber-primus](../resources/liber-primus/). Every image filename in the manifest maps to one unchanged original JPEG.
- Source-grounded invariant check: [sims/lp2_original_critical_sites_audit_sft.cjs](../sims/lp2_original_critical_sites_audit_sft.cjs), which checks all event positions, page mapping, and numeric coordinate ranges.
- Methodological limitation: high overlap is measured for separated glyph masks; the morphological boxes and visual identity decisions were produced in this audit and are not an external independent transcription or OCR output. The source-image pixels and manifest enable a targeted third-party adversarial check.

**Status:** source site audit completed; unchanged transcription retained. Neither a new cipher consumer nor any previously unknown plaintext was recovered.
