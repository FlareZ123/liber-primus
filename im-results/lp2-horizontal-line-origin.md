# LP2 absolute horizontal whole-line origin

**Agent30, 25 November 2026. Decision:** The ordinary left-aligned source lines do not show dense line-specific horizontal offsets at the tested amplitudes. This tests an independent physical degree of freedom from within-line gaps and the #2751 vertical displacement experiment: translating an entire line leaves every adjacent glyph gap unchanged.

## Input, observable and revised receiver

Use the original 75-image archive, the same fixed physical row grid and source-p0 glyph templates as [the whole-line vertical experiment](lp2-original-rune-vertical-baseline-channel.md#whole-physical-line-displacement-2751-agent30-25-november). A row is eligible if it contains at least eight full-height detected segments, the first segment starts in x595–605 (the fixed left text margin near x600, wide enough for all ±1px plants), its shape similarity is ≥.88, and its GP class has at least three fit occurrences. This excludes leading-punctuation/indented or off-grid lines. It selects 210 fit lines from p<40 and 87 test lines on p40,41,42,43,44,45,46,47,48,49,52,53,55. The class17 (B) fit has only two examples and is omitted.

An initial absolute horizontal centroid estimator was **not reliable**: padding around its entire first-glyph bounding box admitted neighboring glyph ink, with recurring class-dependent errors of about 3–6 pixels (and a 15.50px outlier). Its original holdout SD was 2.87px and planted sign recovery only 62/87, 73/87, 79/87. Do not interpret these first-pass residuals as a carrier.

The revised measurement intentionally uses only the left-edge dark-mass projection, x590–613 and the fixed full glyph row height. Fit median profiles by GP class on p<40 only. Match the x592–607 comparison columns to interpolated normalized templates displaced by -2 to +2px in .0125px steps. This excludes neighboring glyph contamination for ordinary rune origins. The revision was selected after seeing the first estimator's diagnostics; the same holdout is **not a preregistered fresh validation set**. No template or offset is fitted from it.

## Original and planted measurements

| Sample | Lines | Residual SD (px) | abs ≥.125px | abs ≥.25px | abs ≥.5px |
|---|---:|---:|---:|---:|---:|
| Development | 210 | .085982 | 19 | 10 | 0 |
| Original holdout | 87 | .067750 | 6 | 3 | 0 |

Three original holdout excursions at or above .25px occur at p44 row11, p52 row8 and p52 row11 (zero-indexed), estimated -.25, +.375, -.25px. These do not form independently specified bits. The fitted shift grid has floating-point near-zero; exact boundary comparisons can differ by one last-bit rounding unit. The LP1 source page scan03.jpg has seven eligible lines with SD .0262px, max abs .075px; scan04.jpg six eligible, all nominal. Several other LP1 controls have only 1–3 eligible rows, and scan08 one saturated estimate. Solved p56/p57 have no eligible fixed left-grid rows, so those solved controls cannot validate this exact geometry.

For every original eligible holdout line, independently plant signed horizontal translation of the text strip (OpenCV bilinear interpolation) and recompress to JPEG Q92. Rerun segmentation and glyph classification rather than retaining the original labels. Incorrectly classified cases count as failures.

| Planted amplitude | Same class | Correct sign | Correct direction and ≥half amplitude |
|---|---:|---:|---:|
| ±.25px | 87/87 | 85/87 | 82/87 |
| ±.5px | 85/87 | 85/87 | 85/87 |
| ±1px | 87/87 | 87/87 | 87/87 |

The full-pixel plants are recovered after redetection, while none of the 297 original measured lines reaches .5px. This supports retirement of a dense independent ±1px bit carrier on the tested margin/grid. It also disfavors dense ±.5px translations; smaller/sparse shifts, different line origins, correlated class-level shifts and other source layouts remain open. A theoretical capacity computed by assigning bits to unmeasured lines would be conditional on the assumed channel, not an observed payload or universal capacity bound. In particular the combined horizontal/vertical sidecar architecture is not universally excluded.

## Reproduction

[Python SFT](../sims/lp2_horizontal_line_origin_sft.py), importing the already checked-in common-line source classifier. Run `python sims/lp2_horizontal_line_origin_sft.py <original-archive-or-image-dir> --output horizontal.json`. Local actual NumPy/Pillow/OpenCV run; no CI. Script commit 30becb3a18e1620766334ed53a1709dcc18a3a15; full local JSON SHA256 27eea4dadf9618b5827e5dbe09b0daae50be95b54e8d0ca1cd6837217a73fd79. No original unknown plaintext, key or readable sidecar.
