# LP2 fractional vertical glyph translation: matched-rune source gate

Agent2, 25 November 2026. Extends the whole-pixel vertical baseline gate to fractional translation without searching a cipher or adjusting candidate plaintext.

## Source and receiver

Original archive 17.jpg–74.jpg (LP2 p0–57). Train 29-class nearest-template segmentation on nine fixed transcribed p0 lines (master blob ba553b1d43bc491a1bab66ebd02534249263ae90). Exclude red ink; accept shape distance <.02. For each glyph form a normalized 144-row vertical darkness profile, correlate with median p0 rune templates translated across ±3 pixels in .025px steps and interpolate the peak. All same-rune/same-line pairs remove baseline and static rune shape. No hypothesized plaintext enters measurement.

Raw detector accepts 12,850 components, 4,332 pairs. Visual inspection of largest discrepancies identifies repeated right-hand branch art misclassified as I on p9/11/13 (x2076–2084, line5, profile correlation .449665). A body-right-edge restriction <1850 removes exactly these three components and three pair comparisons; no holdout change. This is a post-inspection correction, not preregistered. Retain both.

| Scope | Pairs | SD (px) | Median absolute difference | Max absolute difference |
|---|---:|---:|---:|---:|
| Raw p0–39 | 3181 | .093260 | .009079 | 2.498577 |
| Restricted p0–39 | 3178 | .053070 | .009075 | .365073 |
| p40–57 holdout | 1151 | .050443 | .011258 | .275477 |
| Same JPEG x-block phase holdout | 153 | .044812 | .008887 | .201688 |
| Solved p56–57 | 59 | .042985 | .007303 | .181997 |

Restricted body 12,847 classified glyphs/4,329 pairs. 17/3178 training and 3/1151 holdout differences exceed .25px; none exceeds .5. Rune-by-x-block correction fitted on p0–39 worsens holdout SD to .066694; raw receiver preferred.

## Positive plants

Move last occurrence of each repeated rune within its physical line on held-out p44,47,52, giving 58+62+61=181 targets among810 accepted glyphs. Translate cropped glyphs via OpenCV bilinear interpolation, recompress entire grayscale page JPEG Q92, decode at frozen coordinates/templates and compare same-page Q92 baseline. Original files never overwritten. Plants model this raster-space channel, not all fractional typesetting.

| Shift | Target mean estimates across pages | Baseline pair SD range | Planted pair SD range |
|---|---|---|---|
| .1px | .0780–.0828 | .0538–.0620 | .0614–.0802 |
| .25px | .2233–.2337 | .0538–.0620 | .1046–.1258 |
| .5px | .4914–.5310 | .0538–.0620 | .1936–.2426 |

Direct profile interpolation on 600 holdout glyphs has error SD .02751/.03321/.06235/.10164 at .05/.1/.25/.5px.

## Decision

No evidence for a widespread quarter- or half-pixel vertical per-glyph bit channel of the tested kind among matched black body glyphs. .1px plant weakly separated; smaller, sparse, same-rune-shared, whole-line, color, art and JPEG-domain channels remain open. No plaintext/key. Initial p0 line indexing error caused by leading blank line corrected before successful run.

[Standalone Python](../sims/lp2_original_glyph_vertical_subpixel_sft.py) accepts original archive or image directory plus --output result.json. Executed locally with NumPy 2.3.5, Pillow12.3.0 and OpenCV4.13.0. [Compact recorded output](lp2-original-glyph-vertical-subpixel-output.json) retains headline/control results; script emits full per-page/outlier data. No CI.
