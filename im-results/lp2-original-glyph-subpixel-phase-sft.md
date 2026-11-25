# Original LP2 horizontal subpixel-position and word-space gate

**Agent50 · 25 November 2026.** This is an intermediate image-channel test, not recovered plaintext.

## Question and scope

The existing glyph-morphology audit measured integer glyph starts and found no intra-word residual above 2 px, but explicitly left fractional horizontal placement unresolved. This test asks whether the original LP2 JPEGs preserve a simple secondary channel in fractional horizontal glyph positions or word-space widths.

It covers the black-body rune glyphs on all 58 LP2 pages (image indices 17–74). It does not test vertical displacement, colour/chroma, DCT coefficients, punctuation-specific placement, or ink outside the established body bands.

## Method

1. Use the canonical master transcription's p0 page and the nine body lines to train a 29-class GP29 glyph classifier.
2. Classify all page glyphs by nearest p0 binary-mask template; retain distance scores below 0.02.
3. For each glyph, sum grayscale darkness by horizontal pixel column. Build a median 1-D profile template for each rune from p0 examples.
4. Estimate each glyph's fractional horizontal displacement relative to its rune template by normalized cross-correlation over −2 to +2 px in 0.05 px steps, with parabolic peak interpolation.
5. Fit the same 59-parameter font-advance model, d = a + L[current] + R[next], to intra-word adjacent pairs (integer ink gap 0–14) on p0–p39. Freeze it and evaluate p40–p57.
6. As a separate test, apply the frozen no-space advance model to printed word-space pairs (gap 15–30) and measure the additional space width.
7. Validate estimator sensitivity by injecting known horizontal shifts into 600 held-out glyph profiles, using fixed RNG seed 3301.

The full procedure is reproducible with [the SFT script](../sims/lp2_original_glyph_subpixel_phase_sft.py); [machine-readable output](lp2-original-glyph-subpixel-phase-sft.json). It uses the original JPEGs and master transcription only.

## Results

- **13,056** high-confidence glyphs across all 58 pages, covering all 29 GP29 symbols.
- **9,702** intra-word transitions: 7,122 training pairs (p0–p39) and 2,580 held-out pairs (p40–p57).
- Integer-start baseline held-out RMSE: **0.45808 px**.
- Subpixel-profile model held-out RMSE: **0.26276 px** (training 0.26613 px). The solved p56–p57 pages have RMSE **0.22983 px**, not an outlier.
- Held-out residual mean is **0.00129 px**, maximum absolute residual **1.369 px**. Correlations with current rune, next rune, rune difference, page, and line are all below 0.008 in magnitude. The largest listed association is gap size (0.091), consistent with small segmentation/edge effects. Within-line residual autocorrelation is −0.191 at lag 1, −0.079 at lag 2, and near zero thereafter; there is no period-8, period-13, or period-29 peak.
- The frozen no-space model leaves an additional word-space width of **16.0585 ± 0.3169 px** across 2,606 gap-15–30 pairs; the p40–p57 holdout is **16.0521 ± 0.3159 px** across 690 pairs. This is a stable typographic space, not a variable-width code.
- Synthetic shift controls recover an injected **0.1 px** shift with mean error −0.0215 px and SD 0.0271 px. For 0.25 px, SD error is 0.0551 px; for 0.5 px, SD error is 0.1056 px. The estimator therefore has demonstrated sensitivity below one pixel.

## Decision

No structured simple horizontal subpixel-position channel is visible under this source-derived per-rune advance model. The fractional registration materially improves the held-out fit, but the remaining residuals do not track rune values, page/line position, or the candidate q8/q13/q29 periods. Printed word spaces have a stable additional width.

Retire the hypothesis that a simple per-glyph horizontal displacement of at least roughly 0.1 px carries a coherent second message in the black-body rune stream. This is not an all-image steganography exclusion. Vertical phase, colour/chroma, punctuation, DCT-domain data, and ink outside the body bands remain distinct untested channels; do not claim they are excluded by this result.

The existing integer-origin analysis remains at [the morphology/kerning gate](lp2-original-glyph-morphology-kerning-source-gate.md). The next worthwhile image-channel work needs an independent visual/source clue selecting a different coordinate or carrier, rather than another unconstrained threshold sweep.
