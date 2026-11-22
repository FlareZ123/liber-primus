# Ordered GP29 transitions after controlling the rare equalities

**Decision, 18 November 2026.** The original 55 rune-bearing encrypted LP2 pages supply **12,901 physical-page-internal ordered adjacent GP29 pairs**, of which exactly 86 repeat the immediately preceding rune. Apart from that outstanding repeat deficit, a global 29×29 predecessor→successor table **does not exhibit a statistically persuasive source-level first-order fingerprint** under exact per-page repeat-count and page-marginal controls. This is a diagnostic against hunting a stationary glyph-to-next-glyph secret graph in the raw ciphertext; it does **not** rule out first-order *cryptographic* feedback, evolving state, nonstationary keys, word-dependent effects, or higher-order structure. No plaintext, key, or receiver was recovered.

## Prior art and precise additional contribution

The no-first-order-dependence conclusion itself **predates this test**. The independent September 2026 [Leo-Y-Zhang LiberPrimusAnalysis report](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md) calculates a predecessor-conditioned 29×29 table over the complete stream, reporting a chi-square of **801 on 784 degrees of freedom** after setting aside the diagonal. The present original-source computation adds a **within-physical-page restriction** and two Monte Carlo controls that preserve each page's **exact 86 combined diagonal events in its own stratum**, plus a page-local unigram-weight null. Its statistic and denominator are deliberately different; numerical agreement does not imply independent authentication of the ciphertext. This is incremental calibration and reproduction of a known negative family, **not a newly discovered structural signal or a solved cipher**. The earlier report's conjecture that a rare plaintext symbol represents a full wheel-turn remains unproven and is additionally challenged by original printed-word terminal-site constraints.

## Exact input and finite test

- Input: `resources/liber-primus/lp2-corpus.json`, physical pages 0–55, excluding p50's rune-free grid, with all 55 actual page boundaries retained. The runes and original ordering are untouched.
- Observed GP29 transition matrix `M[a,b]`: 29 source-symbol rows and 29 destination columns, counting all consecutive runes **within** each physical page, including printed-word boundaries. Page-edge transitions are excluded (55 page-internal sequences, 12,956−55 = 12,901 observations). `M[a,a]` totals 86.
- A row's nonself total is `R[a]−M[a,a]`. For `a≠b`, the conditional null expects `E[a,b]=(R[a]−M[a,a])*C[b]/(N−C[a])`, with `C[b]` the observed destination marginal and `N=12,901`. Report the sum of `(M−E)^2/E` across all **812 off-diagonal** cells. This statistic does not let the anomalous 86 diagonal events dominate the decision.
- **Fixed-source Monte Carlo:** 1,200 seeded surrogates per null, both preserving each of the 55 page lengths **and each page's exact number of self repeats**. Randomize which within-page positions repeat. At every other position choose the next rune independently of the predecessor from empirical GP29 destination weights, excluding the predecessor's rune. In one null the weights are global; in the other they are page-specific, conditioning on the source's spatial heterogeneity. These surrogates are designed to test extra ordered-pair dependence **after** the collision deficit, not whether the original collision deficit is ordinary.
- A deliberately planted 30% preference for the cyclic successor `(previous+1)%29` tests power to identify a substantial first-order ordering rule. The plant uses the original page/repeat-count geometry.

## Measured original result

| Metric | Exact value |
|---|---:|
| Rune-bearing source pages | 55 |
| Original runes | 12,956 |
| Within-page adjacent transitions | 12,901 |
| Diagonal matches | 86 |
| Off-diagonal Pearson statistic | **783.0869339889693** |
| Global-symbol-weight null: Monte Carlo upper-tail p | **267/1201 = 0.2223147377** |
| Page-specific-symbol-weight null: Monte Carlo upper-tail p | **289/1201 = 0.2406328060** |
| Global null median, 5th, 95th percentile | 752.3295, 694.7144, 819.3471 |
| Page-specific null median, 5th, 95th percentile | 757.4766, 695.0540, 824.8449 |
| Positive 30%-favored-successor planted statistic | **33,100.84312938987** |

Both calibrations see the real data as a routine value. The synthetic fixed-successor effect is detected by a wide margin. In a near-uniform ciphertext, isolated high residual entries are expected from 812 tests; we do not mine their individual rune pairs for a key.

**Interpretation:** adjacency suppression is a real separate property, already characterized in `results/README.md` and the original doublet controls; this experiment adds only the source-conditioned **off-diagonal ordered-pair matrix**. The data do not support an independently recoverable **stationary one-step map** from the exact GP29 ciphertext pairs. Any next attempt needs an authentic operand/key or a distinct source-chosen mechanism rather than fitting local transition hotspots. The Monte Carlo nulls are simplified conditional generators, so a failure to reject them cannot prove ciphertext independence or one-time-pad use.

## Reproduction and independent execution

- Read-only Windows Node22 script: [`sims/lp2_first_order_offdiagonal_source_sft.cjs`](../sims/lp2_first_order_offdiagonal_source_sft.cjs). It asserts source counts and observed statistic, generates both seeded nulls and a detectable positive plant, and emits every measured number.
- Manual-only [Windows GitHub Actions run **PASS**](https://github.com/FlareZ123/liber-primus/actions/runs/44371149390), Node **22.23.5**, completed 18 November 2026 18:34 UTC. The run uses the authoritative unchanged repository corpus. No broader CI search was launched.

This report is an incremental original-page-conditioned statistical gate, **not** a novel global-transition discovery, established plaintext, key recovery, or complete-cipher exclusion. It does not warrant changing the master solution status in `results/README.md`.
