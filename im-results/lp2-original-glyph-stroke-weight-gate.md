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

## Sparse channel at canonical adjacent repeats (#2273 related; independent, not a claim)

Prior [allograph crop audit](lp2-adjacent-doublet-allograph-audit.md) already registers all 86 repeats and excludes conspicuous glyph-class/color changes, while [Agent3's independent solved-template audit](lp2-doublet-original-allograph-sidechannel-gate.md) finds no shape-exception enrichment. The present grayscale integrated-weight/differential and common-mode statistics are distinct from those binarized shape measurements; the reduced receiver coverage below is not a claim of missing source coordinates. In particular the existing complete [crop inventory](lp2-doublet-allograph-crops.csv) identifies p27:15 (second-rune offset) as the red/red pair, excluded here by design.

The global mixture gate has limited power against rare-event state. Derive all 86 same-page adjacent-equal events from canonical corpus, including printed separators. Require a unique match of the exact surrounding up-to-12-rune sequence in the measured original black glyph tape; 68 match, 3 span different detected lines, leaving 65. For each pair calculate signed second-minus-first ink mass divided by frozen same-rune sensitivity. Compare mean absolute pair difference with 20,000 independently resampled same-rune, same-line nonadjacent pairs, matched by page (4 fallback pools from same training/holdout regime). Conditional independent resampling is an approximate null: original repeat pairs are adjacent, control pairs are not; glyph contexts differ, and page dependence is not modeled. Controls inject random second-glyph dilation/erosion strengths into the observed pair differences, 2,000 samples per strength.

Observed mean absolute .117866; null mean .112323; null 95th percentile .131099; upper-tail simulation p=.315734. No comparable anomalous pair-weight channel. Conditional injection power at .05=.9935, at .10–1.0=1; sign accuracies .7834/.7927/.8604/1/1 respectively. These are conditional decoded-raster sensitivity results, not a claim that true font changes or JPEG recompression have identical effects. The 21 unmeasured or cross-line events are explicitly unresolved; this does not exclude common-mode changes to both glyphs or signs designed to match natural residuals. No side information recovered.

Reproduce: stroke-weight SFT optional third positional output `weights.npz`, then `python sims/lp2_repeat_weight_test.py weights.npz resources/liber-primus/lp2-corpus.json repeat-output.json`. Local test executed with the exact extracted canonical context list; committed version derives the list from corpus. 

### Common-mode channel and coverage follow-up

Inspecting unmatched contexts showed a recurrent confusion of GP indices 2 and 11. Exploratorily merge only these labels (recompute class normalization and require unique context under merged alphabet). Coverage increases from 68 to 85 unique contexts, 81 same-line pairs; unresolved p27:15 plus four cross-line events. This is a relaxed classification result, not independent transcription correction.

Test mean absolute pair-average normalized weight relative to line median with both members removed. Exact pairs show .097733 vs nonadjacent pair null .088106 (p=.083996). Relaxed pairs show .108974 vs .085753 (p=.000650). However pair averaging assumes comparable local correlation; adjacent repeated glyphs can have strongly correlated natural ink mass while nonadjacent controls do not. The exploratory merge also changes the class distribution. A more conservative matched **single-glyph reference**, representing identical residuals in both positions, gives .108974 observed versus .098538 mean, .117142 95th percentile, p=.169492 (exact alignment p=.209140). This reference is a sensitivity benchmark for perfect correlation under matched marginal distributions, not a rigorous upper bound on the tail probability for arbitrary dependencies. Excluding merged labels yields p=.199490; p40–55 held-out relaxed 19-pair mean .082990, below the single reference .086988 (p=.549173). No credible common-mode channel: the nominal nonadjacent-pair anomaly does not survive correlation-aware reference or late-page transfer.

Conditional same-direction both-member raster injections: for exact pairs strength .05 detection .766 and .10 .9975 against single-reference 95th percentile; .25–1.0 detection 1.0. Relaxed .05 .8935, .10 .9995; .25–1.0 detection 1.0. These are not independent raster-generation power estimates. No source bitstream or key recovered. Do not use the exploratory raw p=.000650 as evidence of steganography.

[Reproducer](../sims/lp2_repeat_common_mode.py), same optional NPZ and corpus inputs. Local execution used the exact context list, repository script derives it.
