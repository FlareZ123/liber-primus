# Original-JPEG allograph test of the 86 adjacent LP2 ciphertext doublets

**Status: scoped source-image negative, 10 November 2026.** The 56 unknown LP2 physical pages still have **no recovered plaintext, authentic cryptographic key or established original cipher**. This study addresses a narrower uncertainty: whether the public 29-rune transcription merges two visually distinguishable printed forms precisely at adjacent repeated ciphertext symbols.

## Decision

**All 86 within-page adjacent equal-rune pairs were registered to the original LP2 JPEGs.** Each pair consists of two visually matching instances of the indicated GP rune. No pair revealed a stable previously unencoded glyph class or a change of ink colour between the two symbols. The one unusual same-rune comparison is explained by a whole-line vertical-extent difference and becomes *pixel-identical over the common height* without reassigning either rune.

This substantially weakens the specific hypothesis that the 86 repeated ciphertext symbols are merely **collapsed, visually different rune allographs**. It does not determine the cryptographic meaning of the doublets, exclude imperceptible image-level data or prove that the entire book uses only a 29-symbol ciphertext alphabet.

## Source, registration and reproducibility

- Source: original `resources/liber-primus/{physical_page+17:02}.jpg` files at 2400×3600 pixels. Physical p50 is the runeless numerical page; the second release's 55 rune-bearing unsolved pages contain 12,956 GP runes.
- Exact target enumeration: `resources/liber-primus/lp2-corpus.json` gives 86 positions `indices[j] == indices[j+1]` within the same physical page. `resources/liber-primus/lp2-transcription.txt` supplies page-local printed-line rune counts and positions; its rune characters agree with the canonical GP indices at every one of these pages.
- Image-based registration: detect text-line peaks in an original-JPEG horizontal ink projection, then find dark connected ink-column runs and their bounding rectangles. The few page-specific row corrections correspond to visibly enlarged initials, inter-block ornaments, the p51 number table and short headings. They are explicit and asserted against the expected number of printed rune glyphs. **No rune shape or candidate decryption is used to choose which glyph is registered to a target position.**
- Pixel comparison: binarize luminance below 110 and maximize Jaccard intersection-over-union over translations of at most one pixel in either axis. The crop boxes are original-image `(x0,y0,x1,y1)` coordinates with exclusive upper bounds. Classify ink as red or black directly from original RGB values.
- Full runnable source: [`sims/lp2_doublet_allograph_audit.py`](../sims/lp2_doublet_allograph_audit.py), requiring Python with NumPy, SciPy and Pillow. Its JSON output gives both registered boxes, printed line/column positions, Unicode rune, morphology score and ink classification for every pair. The complete fixed-position index is preserved as [`im-results/lp2-doublet-allograph-crops.csv`](lp2-doublet-allograph-crops.csv), with **86 distinct rows** covering 42 physical pages.

The transcript is a registration aid, so this is a source-conditional test of the specific existing 29-rune transcription. Source-independent rune reading remains a separate problem.

## Quantitative image evidence

| Observation | Original JPEG result |
| --- | ---: |
| Adjacent equal-rune pairs indexed | **86 / 86** |
| Physical pages with such a pair | **42** |
| Same printed line / across printed lines | **82 / 4** |
| Jaccard similarity ≥ 0.900000 | **85 / 86** |
| Jaccard exactly 1.000000 | **21 / 86** |
| Median Jaccard similarity | **0.942529** |
| Fifth percentile | **0.912645** |
| Ink classifications | **85 black/black; 1 red/red** |
| Pairs with red/black discrepancy | **0** |

The sole red/red occurrence is **physical p27, rune offset 14**. The 85 remaining original-source pairs are both black.

The only Jaccard below 0.9 is **physical p34, rune offset 134**, an `ᚱᚱ` pair spanning printed lines 5 and 6: source rectangles `(1742,1616,1776,1729)` and `(601,1804,635,1895)` yield 0.794692 when the taller 113-pixel and shorter 91-pixel ink crops are padded without rescaling. **The top 91 rows of the taller glyph are exactly equal, pixel-for-pixel, to the 91-row shorter glyph.** The adjoining source line 5 has a systematically longer vertical glyph extent: all 25 of its detected glyphs measure 113–115 pixels tall, versus 91–93 pixels for all 21 glyphs on line 6. The exception therefore reflects line-specific stroke continuation, without any different rune shape in the shared raster region.

### Same-rune and different-rune visual controls

Original physical p43 has **274** registered glyphs with complete canonical rune labels. Excluding the six positions participating in its own three adjacent-doublet pairs leaves **268 eligible glyph observations** for an independent control pool. With fixed seed **31312026**, sample 1,000 pairs whose two original rune labels match and 1,000 whose labels differ, never deliberately selecting a target-doublet glyph.

| Crop similarity control | Minimum | 5th percentile | Median | 95th percentile | Maximum |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same rune, non-doublet | 0.871724 | 0.911305 | 0.956558 | 1.000000 | 1.000000 |
| Different rune, non-doublet | 0.026002 | 0.069311 | 0.269843 | 0.683439 | 0.890581 |
| All 86 original doublets | 0.794692 | 0.912645 | 0.942529 | 1.000000 | 1.000000 |

The p34 cross-line vertical-extent exception is independently explained above. The remaining 85 repeated-symbol similarities lie in the same-rune control range, exceeding the maximum of these 1,000 different-rune samples. This is a **diagnostic comparison**, not a formal estimate of the probability of cryptographic allographs: p43 control sample selection, font stability across other pages, and the source-assisted registration limit that inference.

## Consequences and bounds

A direct alphabet-expansion theory requiring the existing 86 ciphertext repeats to conceal a **readable second rune shape or red/black alternation** has no support in these original pixels. Subsequent doublet-based cipher hypotheses should account for these genuine visibly equal glyphs as ciphertext, or supply an independently specified nonvisual register. No change to the canonical rune counts, solved-page regressions, original cipher architecture, plaintext status or `results/README.md` is justified by this bounded observation.

Re-running this experiment is useful only if a materially different image property is proposed, such as a source-locked within-stroke microfeature surviving JPEG controls. Current findings do not warrant another arbitrary pixel-bit sweep.
