# Original LP2 glyph outlines and held-out font-position gate

**15 November 2026; Agent 38.** This finite image-source test asks whether the repeated GP29 glyphs are visibly re-drawn as discrete alternate symbols or deliberately displaced by whole-pixel kerning adjustments. It is a follow-on to the independently trained p32/p55 original-JPEG classifier and measured font advances in [the earlier source-image study](lp2-original-rune-typography-space-channel.md). It does not use a guessed plaintext, new key, a reselected transcription, or an unknown-page cipher output.

## Exact input and image-level operation

Read the original 2400×3600 LP2 JPEGs for physical pages p1, p5, p9, p11–13, p16–20, p24–26, p28–32, p34, p44–48, p52 and the two calibration pages p32 and p55; after deduplication, **27 pages**. The existing two-page glyph model was trained using only p32/p55 (197 source-identified original symbols) and predicts one of all 29 GP classes from each visible ink component. Retain only components whose cosine to their predicted class prototype exceeds 0.88. The extraction threshold is original grayscale less than 155, using the exact previous line geometry and p55 right-crop.

There are **6,897** detected components, **27** beneath the confidence threshold and **6,870** accepted components. For each class, group accepted binary ink components by exactly equal bounding height and width; choose that class's most frequent shape and its squared-error medoid. Compare all members of that *same-size* group by raw pixelwise Hamming distance to that medoid. Across 29 classes, the greatest observed maximum Hamming fraction is **0.050977**; remaining classes are below that value. This is a bound on gross redraws *within each modal raw size*, not a search for one-pixel marks, multiple layouts, or all conceivable overlays. Some naturally antialiased instances differ in width or height by 1–2 pixels, so the per-class modal-size restriction matters.

Separately, test actual horizontal glyph coordinates against a 59-column model for one source-visible inter-glyph step:

`dx(i→i+1) = outgoing[rune_i] + incoming[rune_(i+1)] + dot_count * dot_advance`.

The 29 incoming and 29 outgoing terms have a gauge freedom, fixed by setting the first incoming coefficient to zero. `dot_count` is the exact number of observed small punctuation components between the two original glyphs. Sum these steps from each line's first glyph, and fit each subsequent **original absolute horizontal position relative to the first**. All 290 eligible fixed-geometry lines supply **6,171** such positions. Each test line uses its observed starting x only; it receives no fitted slope, position correction, or local font coefficients. Split by physical page parity into two disjoint train/test directions:

| Trained physical pages | Training positions | Held-out positions | Held-out position RMSE | Largest absolute error | Learned punctuation-dot advance |
|---|---:|---:|---:|---:|---:|
| Even numbered | 3,206 | 2,965 | 0.6750 px | 2.514 px | 15.8024 px |
| Odd numbered | 2,965 | 3,206 | 0.6512 px | 2.446 px | 15.8277 px |

Both disjoint fits were computed by the same least-squares operation, with 58 freely estimated coefficients after gauge fixing. The subpixel-scale held-out errors remain small across the whole line, despite each prediction accumulating every preceding glyph advance and punctuated gap. This strongly favors ordinary consistent font advances over gross per-glyph horizontal perturbations in the tested lines. It does **not** prove that all 1-pixel or fractional-pixel manipulations are absent: antialiasing and raster rounding make microchannels difficult to distinguish without a separate, author-motivated bit selector.

## Decision and reproducibility

**No visually distinct alternate GP font alphabet, ciphertext plaintext, key or authored microspacing instruction was recovered.** Natural raster-phase variants and occasional edge artifacts explain the sampled silhouette differences adequately. Original image shape or microkerning should not be elevated into an arbitrary bitstream search on this evidence alone. An external author-selected variation, position clock, or independent held-out plaintext prediction would justify reopening a more targeted test.

Reproducer: [`sims/lp2_original_jpeg_glyph_phase_holdout_sft.py`](../sims/lp2_original_jpeg_glyph_phase_holdout_sft.py). It imports [the source-validated p32/p55 raster recognizer](../sims/lp2_original_rune_typography_sft.py), uses original repository JPEGs and canonical source corpus through that recognizer, recomputes all accepted shape masks and both disjoint least-squares fits, and asserts the finite sample size and calibrated limits. A separate local replay using the original JPEG mirror reproduced the numerical table; a GitHub Actions run of the newly committed single-file SFT has not yet been recorded. No promotion to the authoritative decrypted-results synthesis is warranted.
