# Original-JPEG allograph test of the 86 adjacent LP2 ciphertext doublets

**Status: scoped source-image negative, 10 November 2026.** The 56 unknown LP2 physical pages still have **no recovered plaintext, authentic cryptographic key or established original cipher**. This study addresses a narrower uncertainty: whether the public 29-rune transcription merges two visually distinguishable printed forms precisely at adjacent repeated ciphertext symbols.

## Decision

**All 86 equal-rune neighbors in the separator-stripped within-page stream were registered to the original LP2 JPEGs; only 60 are physically adjacent runes in the same printed word and line.** The **primary 60 true visual adjacencies** all contain matching instances of the indicated GP rune, with shifted raster Jaccard similarity from **0.900000 to 1.000000**. The 26 separator- or linebreak-spanning flattened neighbors form a separate supporting cohort. No pair revealed a stable previously unencoded glyph class or a change of ink colour between the two symbols. The only apparently unusual pair arose from a **fixed-height image-registration crop clipping a glyph stem**. Full-height recropping restores **pixel identity over its complete shape**. All 86 flattened-stream repeats therefore have same-rune Jaccard scores at or above 0.9.

This substantially weakens the specific hypothesis that the 86 repeated ciphertext symbols are merely **collapsed, visually different rune allographs**. It does not determine the cryptographic meaning of the doublets, exclude imperceptible image-level data or prove that the entire book uses only a 29-symbol ciphertext alphabet.

## Source, registration and reproducibility

- Source: original `resources/liber-primus/{physical_page+17:02}.jpg` files at 2400×3600 pixels. Physical p50 is the runeless numerical page; the second release's 55 rune-bearing unsolved pages contain 12,956 GP runes.
- Exact target enumeration: `resources/liber-primus/lp2-corpus.json` gives 86 positions `indices[j] == indices[j+1]` within the same physical page. The existing [boundary audit](lp2-doublet-boundary-audit.md) distinguishes **60 same-word/same-line**, **3 same-word/cross-line**, **22 cross-word/same-line** and **1 cross-word/cross-line** pairs. Only the first class is a literal contiguous two-glyph printed doublet. `resources/liber-primus/lp2-transcription.txt` supplies page-local printed-line rune counts and positions; its rune characters agree with the canonical GP indices at every one of these pages.
- Image-based registration: detect text-line peaks in an original-JPEG horizontal ink projection, then find dark connected ink-column runs and their bounding rectangles. The few page-specific row corrections correspond to visibly enlarged initials, inter-block ornaments, the p51 number table and short headings. They are explicit and asserted against the expected number of printed rune glyphs. **No rune shape or candidate decryption is used to choose which glyph is registered to a target position.**
- Pixel comparison: binarize luminance below 110 and maximize Jaccard intersection-over-union over translations of at most one pixel in either axis. The initial source-registration bounding boxes are original-image `(x0,y0,x1,y1)` coordinates with exclusive upper bounds. **Recover complete stems** by extending each initial band 15px upward and 32px downward, then trimming to the actual ink pixels. The initial fixed 125px peak-centred bands can prematurely clip a lower stem. Classify ink as red or black directly from original RGB values.
- Full runnable source: [`sims/lp2_doublet_allograph_audit.py`](../sims/lp2_doublet_allograph_audit.py), requiring Python with NumPy, SciPy and Pillow. Its JSON output gives both registered boxes, printed line/column positions, Unicode rune, morphology score and ink classification for every pair. The complete fixed-position index is preserved as [`im-results/lp2-doublet-allograph-crops.csv`](lp2-doublet-allograph-crops.csv), with **86 distinct rows** covering 42 physical pages; each CSV row includes its source-derived `boundary_category`.

The transcript is a registration aid, so this is a source-conditional test of the specific existing 29-rune transcription. Source-independent rune reading remains a separate problem.

## Quantitative image evidence

| Observation | Original JPEG result |
| --- | ---: |
| Flattened within-page equal-rune pairs indexed | **86 / 86** |
| **Primary visual same-word/same-line adjacencies** | **60 / 86** |
| Separator/linebreak-spanning auxiliary cohort | **26 / 86** |
| Primary true-adjacency IoU ≥ 0.9 | **60 / 60** |
| Primary true-adjacency IoU exactly 1.0 | **17 / 60** |
| Physical pages with such a pair | **42** |
| Same printed line / across printed lines (all flattened pairs) | **82 / 4** |
| **Full-height** Jaccard similarity ≥ 0.900000 | **86 / 86** |
| **Full-height** Jaccard exactly 1.000000 | **22 / 86** |
| Full-height median Jaccard similarity | **0.942270** |
| Full-height fifth percentile | **0.913341** |
| Ink classifications | **85 black/black; 1 red/red** |
| Pairs with red/black discrepancy | **0** |

The sole red/red occurrence is **physical p27, rune offset 14**, which is **cross-word on the same line**. All **60 primary true-adjacent glyph pairs are black/black**. The 85 black/black and one red/red counts describe the full 86-event flattened cohort.

The original **physical p34 rune offset 134**, a same-word `ᚱᚱ` pair spanning printed lines 5 and 6, illustrates why full-height restoration matters. Initial source-registration rectangles `(1742,1616,1776,1729)` and `(601,1804,635,1895)` were respectively 113 and **91** pixels tall, with initial IoU **0.794692**. The shorter box ends **exactly** at the fixed 125-pixel capture window's lower boundary; that window had clipped **22 pixels** of a real rune stroke. Re-reading the original JPEG below the initial window yields two **113×34-pixel identical glyph images**, with Jaccard **1.000000**. Adjacent line-height medians similarly change from the falsely mixed 113–115px versus 91–93px to **112–115px on both lines** when their lower stems are fully captured. The putative alternate tall-line style is therefore a **measurement artifact**; it cannot support a hidden-font channel.


### Same-rune and different-rune visual controls

Original physical p43 has **274** registered glyphs with complete canonical rune labels. Excluding the six positions participating in its own three adjacent-doublet pairs leaves **268 eligible glyph observations** for an independent control pool. With fixed seed **31312026**, sample 1,000 pairs whose two original rune labels match and 1,000 whose labels differ, never deliberately selecting a target-doublet glyph.

| Crop similarity control | Minimum | 5th percentile | Median | 95th percentile | Maximum |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same rune, non-doublet | 0.871724 | 0.911305 | 0.956558 | 1.000000 | 1.000000 |
| Different rune, non-doublet | 0.026002 | 0.069311 | 0.269843 | 0.683439 | 0.890581 |
| All 86 full-height flattened-stream repeats | 0.900000 | 0.913341 | 0.942270 | 1.000000 | 1.000000 |

The p34 original-window clipping was corrected before the full-height scores. All 86 flattened-stream repeated-symbol similarities, including the 60 true visual adjacencies, lie within the same-rune control range and exceed the maximum of these 1,000 different-rune samples. This is a **diagnostic comparison**, not a formal estimate of the probability of cryptographic allographs: p43 control sample selection, font stability across other pages, and the source-assisted registration limit that inference.

## Consequences and bounds

A direct alphabet-expansion theory requiring the **60 truly contiguous printed repeated glyphs** to conceal a **readable second rune shape or red/black alternation** has no support in these original pixels. Subsequent doublet-based cipher hypotheses should account for these genuine visibly equal glyphs as ciphertext, or supply an independently specified nonvisual register. No change to the canonical rune counts, solved-page regressions, original cipher architecture, plaintext status or `results/README.md` is justified by this bounded observation.

Re-running this experiment is useful only if a materially different image property is proposed, such as a source-locked within-stroke microfeature surviving JPEG controls. Current findings do not warrant another arbitrary pixel-bit sweep.
