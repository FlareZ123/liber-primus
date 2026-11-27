# Adjacent-doublet T7 survives semantic-word conditioning; lag-five echoes are not the same hidden state

**Agent1, 27 November 2026. Classification: intermediate structural discrimination, no plaintext/key/cipher recovery.**

## Why this test

An independent 2026 analysis of the canonical 86 adjacent-equality events reported a large lag-1 autocorrelation in the successive event gaps ("T7"): Pearson **0.3800**, with a uniform-position null near the 0.001 tail. That work also found no convincing smooth rate drift and explicitly noted that identifying a mechanism requires a second independent filtered-event stream.

The local corpus already supplies one plausible rival stream: the separately established **104 within-word five-back equality events in 2,105 eligible positions**. Before inventing a coupled state machine, this test asks two bounded questions:

1. Does T7 disappear when the null preserves the manuscript's semantic word-boundary structure?
2. Do the lag-five events independently show the same gap-memory or regional modulation?

Both questions are evaluated on the untouched canonical p0–55 rune tape. No plaintext score, key, phase, threshold, or decoder parameter is fit.

## 1. Word-boundary-conditioned T7

Parsing the original source with line/page wraps retained inside words gives **2,896 semantic printed words and 12,956 runes**. Among the 12,955 adjacent pair positions:

- 2,895 are semantic word joins and contain **23** of the 86 equal-adjacent events;
- 10,060 are within words and contain **63** events.

The observed gap statistics reproduce the external T7 values exactly:

- Pearson lag-1 gap autocorrelation: **0.3800196892**
- rank/Spearman lag-1 gap autocorrelation: **0.2680509985**

The frozen null independently samples exactly 23 event sites from the 2,895 word-boundary opportunities and exactly 63 from the 10,060 within-word opportunities, without replacement. Across 20,000 deterministic draws:

| statistic | observed | conditioned upper-tail |
|---|---:|---:|
| Pearson gap AC | 0.3800196892 | **0.00039998** |
| Spearman gap AC | 0.2680509985 | **0.00509975** |

Thus the serial pattern is **not explained by the different event rate at semantic word joins**. The result hardens the existence of a gap-ordering anomaly under this specific, stronger segmentation-preserving null; it does not make the anomaly discovery-independent or identify its cause.

## 2. Lag-five events are not the missing second stream

The 104 within-word lag-five events have:

- gap Pearson AC **0.0606040**, two-sided p **0.52795** under 10,000 draws over the exact 2,105 eligible positions;
- gap Spearman AC **-0.0118424**, two-sided p **0.90781**.

To test slower shared modulation, count both event streams in fixed global blocks and correlate their rate residuals after subtracting each stream's global expectation:

| block size | residual correlation | two-sided p |
|---:|---:|---:|
| 128 | +0.01142 | 0.9114 |
| 256 | -0.21471 | 0.1282 |
| 512 | -0.21025 | 0.3132 |
| 1024 | -0.25559 | 0.3992 |

The maximum absolute correlation over the four frozen scales has corrected two-sided p **0.49535**.

So the lag-five echo process does not reproduce T7-like successive-gap memory and does not track the adjacent-doublet process regionally at these scales. A model that treats the 86 adjacent slips and the 104 lag-five returns as two observations of one shared slow hidden state is therefore unsupported by this test.

## Decision

Preserve T7 as an unresolved **adjacent-doublet gap-ordering** anomaly that survives semantic-word conditioning. Do **not** promote it to plaintext, a key, or a variable-rate rejection filter: existing rate-drift analyses remain negative, and the present test gives no source-selected transition law.

Retire the simplest "shared state also drives lag-five echoes" follow-up. The next discriminating step needs either:

- a genuinely different independently defined event stream that predicts the same gap-memory before inspection; or
- an original-source state/operand that predicts the 86 event positions or their gap ordering and can be carried into a reversible original-cipher inverse.

Reproducer: `sims/lp2_t7_wordboundary_lag5_independent_sft.cjs`.
