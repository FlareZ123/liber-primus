# P55 original absolute trajectory: conditional microgap pattern bound

Agent3, 24 November 2026. **No newly recovered plaintext/key.** Narrow complement to [Agent35's stronger whole-sample microspacing innovation test](lp2-original-microspacing-innovation-bound.md), not a new general dense-channel exclusion. The distinct question is how many sparse, nonnegative cumulative marks on the final 76-rune unknown page are even consistent with an independent renderer envelope. This is conditional enumeration, not an authenticated channel.

## Original receiver and calibrated model

Use 2400×3600 supplied original JPEG ZIP, original reading-order labels and punctuation from `resources/lp2-transcription.txt`. All 12 manually transferred line tapes were checked by FNV-1a against the repository-derived canonical labels before measurement. Actual ink connected column spans at threshold155 and height≥93 give integer left coordinates; independent weighted centroids within those same spans use clipped 200-gray. Fit absolute glyph positions within each line as cumulative rune advances + horizontal punctuation advance + current glyph bearing + free line intercept. Center every line, gauge bearing[F]=0, least squares rank58; independently train both measures on p9/12/19/28 (1,069 glyphs, 48 lines), calibrate maximum residual range on p13/26/29/31/46/47 (1,627 glyphs, 72 lines). Source p55 has 24/22/22/8 glyphs, all held out. P57 regular-row extractor fails because its layout differs, and is excluded. Punctuation source '-' counts one advance, '.' three; p46 row4 gap9 is visibly the three-dot zigzag comma taking two horizontal columns, so use two for that gap. Initial naive observed-component counting miscounted 4 source gaps; transcription-based correction and visible comma geometry resolve the large outliers. This is nuisance-model adjudication on non-target controls, not a blind pre-registered test. No p55 gap or punctuation is fitted.

| Receiver | Left-coordinate RMSE px | Centroid RMSE px | Maximum line range (left/centroid) px |
|---|---:|---:|---:|
| Training | .425122 | .403556 | 2.994232 / 3.624406 |
| Held-out calibration | .541713 | .517394 | 3.230462 / 4.082007 |
| p55 original | .418159 | .448408 | 2.025482 / 2.430697 |

A fixed MSB-first sign-of-gap-residual diagnostic gives left hex 24a92e28ed9909264c and centroid hex 28d93610ab991b2c4e, not a stable or intelligible readout. These are not keys. Independent 10,000 simulated watermark plants on the actual measured p55 coordinates, seed3301, use fair random increments and the unchanged holdout max-range thresholds:

| Added gap signal | Left detection | Centroid detection |
|---|---:|---:|
| +1 px or zero | 100% | 100% |
| ±0.5 px | 93.27% | 70.60% |
| +0.5 px or zero | 100% | 99.95% |
| ±0.25 px | 25.61% | 8.90% |

These are simulated coordinate shifts, not rerendered JPEGs. They establish sensitivity of this particular statistic and illustrate why small balanced marks are not excluded.

## Exact conditional sparse-pattern count

For each line with residual trajectory r_i (two measures) and hypothetical nonnegative bit increments of amplitude a, baseline residual would be r_i - a*sum_{j<i} b_j. Require its range ≤ the respective max observed calibration range in both measures; arbitrary intercept per line. The endpoint difference implies total ones ≤ floor(min_m((threshold_m + r_end,m - r_start,m)/a)). Enumerate every subset up to that bound, checking full line ranges in both coordinates. All feasible counts are exact relative to floating-point measured coordinates and the fixed empirical envelope, not a distribution-free physical bound.

| Amplitude | Feasible line patterns | Max ones per line | Combined compatible patterns | log2(count) |
|---|---|---|---:|---:|
| 1 px | 1744,196,42,43 | 3,2,2,3 | 617,334,144 | 29.2015 |
| 0.5 px | 310592,19343,2702,114 | 7,5,4,5 | 1,850,564,783,117,568 | 50.7169 |

Thus if this precise one-sided model is granted, no more than 10 of 72 full-pixel gaps can be marked, or 21 at half-pixel amplitude. No individual gap is forced zero or one; zero-mark path is compatible. Do not confuse log2 of compatible alternatives with independent recoverable entropy. No evidence selects an authentic key or bit mapping. Dense independent positive marks are already disfavored by prior work; the p55 count shows even sparse marks remain ambiguous. Other envelopes, balanced shifts, unknown advances, alternate carriers and ordinary rasterization remain possible. Do not sweep residual sign maps or guess decryption keys absent source selection.

Reproduce: [standalone analysis](../sims/lp2_p55_microgap_capacity_sft.py). Executed locally on supplied original ZIP with Python, NumPy2.3.5, Pillow12.3.0, using verified line tapes. Repository wrapper derives those same tapes and verifies hashes, but was not separately run from a local Git checkout. No CI claim.
