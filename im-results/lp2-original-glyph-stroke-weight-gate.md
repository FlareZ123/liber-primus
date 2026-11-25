# Original glyph stroke-weight channel gate

**Decision:** no second state evidenced in the calibrated sensitivity range. Do not interpret natural ink-mass residuals as a binary payload.

All 58 original archive JPEGs (17–74) decoded. Reused existing vertical-phase segmentation and p0 templates (MSE < .02): 13,056 recognized, 206 red excluded using core median R-G > 10. Each glyph has up to two extra lateral pixels capped at neighboring segment midpoints; one-pixel zero padding for morphology. The initial boundary-ink exclusion lost whole rune classes and was replaced by padding. Ink mass is sum of clip((240-gray)/240,0,1). Normalize by per-rune training median mass and half median dilation-minus-erosion response (3x3 cross); subtract leave-one-out line median on lines containing >=10 glyphs.

Training p0–39, unsolved holdout p40–55, solved reference p56–57. Compare Gaussian against equal-weight symmetric Gaussian mixture, center fixed at training mean; amplitude grid .025–1 step .025, 50 log-spaced noise values .01–1.5. Freeze fits for holdout. Independent balanced controls (seed 3301) interpolate decoded raster ink toward one-pixel dilation or erosion. Mass is linear under interpolation. Strength is interpolation weight, not literal subpixel displacement; no JPEG recompression or typesetting control claimed.

12,850 measured; 12,812 eligible. Train 9,410 SD .149830; holdout 3,240 SD .145563; solved 162 SD .146981. Original best amplitude .025 (grid floor), training gain -.001238 nats/glyph, holdout +.000718.

| Injected strength | Holdout sign accuracy | Fitted amplitude | Train gain | Holdout gain |
|---:|---:|---:|---:|---:|
| .05 | .733025 | .025 | -.000073 | +.000128 |
| .10 | .766667 | .025 | -.000684 | -.000776 |
| .25 | .906481 | .250 | +.020303 | +.024699 |
| .50 | .929321 | .475 | +.025155 | +.036633 |
| 1.0 | .923457 | .925 | +.016750 | +.016938 |

The mixture diagnostic detects .25–1.0 response controls but not .05–.10. The original lacks comparable support. Scope: independent balanced within-line stroke-weight states; line-coherent changes removed by normalization, class-dependent or sparse signals, red/missing glyphs, alternate stroke geometries and smaller strength remain outside this test. Crops may truncate fringe ink and JPEG artifacts affect mass. No plaintext recovered.

Reproduce: `python sims/lp2_original_glyph_weight_sft.py liber-primus-jpegs.zip output.json`. Local execution used identical inlined segmentation definitions; repository version imports the existing module. The table is executed output; script emits full per-page distributions.
