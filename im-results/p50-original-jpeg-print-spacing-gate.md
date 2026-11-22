# Original p50 printed-number spacing: no independent geometric channel

**Agent 17, 11 November 2026, Director Issue #346.** The original 256 alphanumeric tokens in the 32×8 numerical table are consistently mechanically typeset across all three scanned pages. A held-out row and whole-page controls predict their letter spacing to original-image pixel precision. Glyph baseline displacement is absent at the same scale. This is a bounded original-image negative for discrete *additional whitespace or vertically shifted numeral* channels; it supplies no unknown LP2 plaintext, instruction or key.

## Source and fixed operation

The three original manuscript JPEGs [66.jpg](../resources/liber-primus/66.jpg), [67.jpg](../resources/liber-primus/67.jpg), and [68.jpg](../resources/liber-primus/68.jpg) contain respectively **10, 13 and 9** printed rows of eight 2-glyph alphanumeric tokens, matching the independently image-adjudicated [p50 32×8 transcription](../resources/liber-primus/base60-grid.json). The source page images are each 2400×3600 pixels. p15's [source 4×4 decimal square](../resources/liber-primus/32.jpg) is an independent numerical-layout control with exactly four separately detected numerical baselines. Original p57 (archive 74.jpg) uses rune prose and an illustration, not an equivalent square of printed alphanumeric tokens, so its font geometry cannot be used as a matched numeral control.

The potential human clue is the table's spatial layout, apart from its number values. If cell positions carried an additional key or route, some token would have to be placed a visibly different amount from what normal proportional-font typesetting explains. The test therefore uses source token *glyph identity* only to account for ordinary character widths and bearings, never the tokens' numeric values, GP shifts, English scores, p55 hypotheses or ciphertext decipherment.

At grayscale thresholds **80, 110 and 150** on the original JPEGs, the fixed numeral crop yields exactly 32 horizontal row bands. Consecutive nonwhite pixel projections resolve **16 glyph-width intervals in 31 of 32 rows**. The first numeral row of scan68 contains a touching 0J glyph pair (15 projected intervals); that entire row is conservatively excluded from glyph-specific fitting. No OCR is used to decide glyph content or fit. The original visual table already supplies the 16 expected symbols per row.

## Frozen font-spacing model and held-out test

For every transition between source-adjacent glyphs, measure the horizontal *ink gap* from rightmost to next leftmost black pixel. The normal-font hypothesis is one common extra intertoken space plus two glyph-specific side-bearing contributions:

\`gap(j→j+1)=constant + rightBearing(glyph_j)+leftBearing(glyph_{j+1})+wordSpace*[j is odd]\`.

There are **59 distinct observed glyph characters**, 31 complete rows × 15 gaps = **465** transition observations. Fit ridge regression with alpha=0.1 on the first 30 complete rows; **withhold all 15 transitions in the final original p68 row**. No future row geometry is used to fit parameters or select an exception. The glyph identities are included because the printed font is proportional, so a raw variation in whitespace is not itself evidence of intentional displacement.

| Measurement at original JPEG threshold 110 | Value |
| --- | ---: |
| Learned ordinary additional gap between two tokens | **26.679 original pixels** |
| Training absolute residual: median / maximum | **0.308 / 1.955 pixels** |
| Fully withheld final row: median / maximum | **0.350 / 1.137 pixels** |
| Whole scan 66 held out: median / 95th / maximum | **0.488 / 2.549 / 10.310 pixels** |
| Whole scan 67 held out: median / 95th / maximum | **0.464 / 1.856 / 4.288 pixels** |
| Whole scan 68 held out: median / 95th / maximum | **0.376 / 1.254 / 2.301 pixels** |

The ten-pixel maximum in held-out 66.jpg is confined to a rare J-bearing pattern not observed as training evidence on the other two pages. It is not an extra full-width word space, repeats with the same original glyph context, and vanishes when that glyph is trained on its own page. Ordinary font-bearing variation explains the larger raw ink gaps, including the visually striking \`11 1A\` boundary in scan68.

The pixel threshold sensitivity is tight: with thresholds **80 / 110 / 150**, fitted ordinary word-space increments are **26.565 / 26.679 / 26.627 pixels**; the fixed held-out row's maximum residual is **1.126 / 1.137 / 1.184 pixels**, respectively.

For vertical geometry, fit one nuisance baseline per printed source row and a fixed glyph-specific lower-ink offset. The **496** separated source glyphs' bottom-coordinate residuals at threshold 110 stay within **1.043 pixels** on training lines. On the completely withheld final row, infer its baseline from the median of the independently learned glyph offsets; its maximum relative displacement is only **0.063 pixel**. This rules out a source-visible raised/lowered numeral class in the measured ordinary glyphs, at much better than single-rune-scale sensitivity.

The unchanged geometric detector also includes two *deliberately planted* controls on the source's held-out line, without refitting the model: inserting an additional 27-pixel intertoken space and moving one digit down 20 pixels. Both are found with residuals greater than **25 and 19 original pixels**, respectively. Their identification proves the near-zero original residuals do not arise from a test that is insensitive to actual spacing markers.

## Research decision and limits

**Decision for #346:** no independently visible table key or bit channel can be read from ordinary horizontal spacing or glyph-baseline displacement, given an intact 32×8 printed-row model. The apparent offsets are explained by the original proportional font and its repeatable typesetting, not a discrete per-cell layout instruction. No held-out row requires a second placement class. Stop assigning bits to uncorrected pixel gaps, page text centering, or descender height. The one touching glyph pair on scan68 was intentionally excluded rather than guessed.

This is **not** a full steganographic exclusion. It does not test JPEG compressed coefficients, changes inside individual numeral stroke designs (#345), hidden colors, a different reading order, or deliberately tiny subpixel variations that survive nowhere as a stable geometric class. A creative cipher could embed an external key without visible placement offsets. A future spacing theory needs a source-visible legend and an independently discriminating original-row prediction before generating key bits.

**Reproducer:** [sims/p50_printed_spacing_original_sft.py](../sims/p50_printed_spacing_original_sft.py), standalone Python 3 using Pillow, numpy and scikit-learn, reads the three original JPEGs and table transcription; asserts the 10/13/9 image rows, 16-glyph component counts with one explicit fused exception, original p15 square's four rows, threshold stability, held-out controls and planted positives. The method never reads a decrypted unknown page or optimizes threshold labels for English.

Other independent table work is in [the p50/H/G code description](../results/README.md) and [the p50 inner-ring known-plaintext gate](p50-32x8-interior-known-plaintext-compatibility.md). Both remain distinct from this original-image spacing channel result.