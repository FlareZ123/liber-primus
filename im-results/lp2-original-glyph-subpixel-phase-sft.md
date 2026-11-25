# Original LP2 horizontal/vertical subpixel-position and word-space gates

**Agents 50 and 10 · 25 November 2026.** This is an intermediate image-channel test, not recovered plaintext.

## Question and scope

The existing glyph-morphology audit measured integer glyph starts and found no intra-word residual above 2 px, but explicitly left fractional horizontal placement unresolved. This test asks whether the original LP2 JPEGs preserve a simple secondary channel in fractional horizontal glyph positions or word-space widths.

It covers the black-body rune glyphs on all 58 LP2 pages (image indices 17–74). The horizontal experiment itself does not test vertical displacement; the separate vertical test below uses the same segmentation. Neither tests colour/chroma, DCT coefficients, punctuation-specific placement, or ink outside the established body bands.

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

Retire the hypothesis that a simple per-glyph horizontal displacement of at least roughly 0.1 px carries a coherent second message in the black-body rune stream. This is not an all-image steganography exclusion. Vertical displacement is addressed only by the following within-line two-state test. Colour/chroma, punctuation, DCT-domain data, and ink outside the body bands remain distinct untested channels.

The existing integer-origin analysis remains at [the morphology/kerning gate](lp2-original-glyph-morphology-kerning-source-gate.md). The next worthwhile image-channel work needs an independent visual/source clue selecting a different coordinate or carrier, rather than another unconstrained threshold sweep.

## Vertical per-glyph two-state channel (Agent10)

**Decision:** no support for an independent balanced two-state vertical displacement of the tested resolvable scale in retained body glyphs. This is a distinct measured coordinate, not an exclusion of all image steganography.

The exact owner-supplied JPEG archive is the input. Reuse the prior p0 29-class glyph template labels, fixed band/segment detector, and 0.02 classification threshold; this produces the identical 13,056 high-confidence candidates. Sum grayscale darkness down each vertical row (threshold 210 with eight extra pixels above and below the 118px band), normalize, fit one per-rune median vertical template on p0–39. Register shifts on −4..4 px in .05 increments by normalized correlation and parabolic interpolation. Retain correlation >.995 and non-boundary fits; require at least ten retained glyphs per line, subtract each glyph's leave-one-out line median. This removes common line vertical motion by construction. 11,384 glyphs remain: 8,362 training p0–39, 2,882 untouched unknown p40–55, and 140 solved-page p56–57 comparator glyphs.

Fit on p0–39 only: compare one normal density to equal-weight symmetric two-normal mixture with common noise, fixed amplitude grid .05–1.0 px and 40 geometric noise values .025–1.5 px. Freeze the chosen density and evaluate unknown p40–55. Original SD is .176974 px train and .175451 px heldout, versus .211952 px on the solved comparator. The alternative picks the smallest permitted amplitude .05, with training gain −.001966 and frozen holdout gain −.001357 nats/glyph relative to one Gaussian. The underlying residuals are not claimed to be Gaussian; the comparison is a finite channel screen.

Profile-injection controls use independent fixed-seed balanced-probability bits and the same frozen template/eligible glyph inventory. Interpolate the original 1-D profiles at the specified signed shifts; these are not new JPEG raster encodings or evidence of author intent.

| Planted signed shift | Heldout shift-error RMSE (px) | Heldout sign-bit accuracy | Mixture gain (nats/glyph) |
|---:|---:|---:|---:|
| ±0.10 | .03098 | .7564 | −.000750 |
| ±0.25 | .05222 | .8508 | +.002994 |
| ±0.50 | .07032 | .9146 | +.021230 |
| ±1.00 | ~0 | .9271 | +.025182 |

Thus the mixture gate is not sensitive at ±.10 px and should not exclude it. The ±.25–1.00 profile controls do show positive frozen gains, unlike original; no independent bitstream is established. Whole-line offsets, rare marks, asymmetric/sparse or much smaller signals, omitted glyphs, untested color/DCT carriers and different channel codings remain unresolved. Do not decode sign noise as a plaintext bitstream.

[Vertical SFT](../sims/lp2_original_vertical_glyph_phase_sft.py) · [Measured summary](lp2-original-vertical-glyph-phase-summary.json). Run locally on the original owner ZIP using Python, numpy, scipy, OpenCV and Pillow; the actual local run completed successfully. The repository copy cleans a redundant literal transcription correction and imports, leaving the tested algorithm unchanged. The local output includes per-page stats; the repository summary records key metrics, and the script emits the full JSON. No CI run claimed. No unknown plaintext/key or hidden payload recovered.
