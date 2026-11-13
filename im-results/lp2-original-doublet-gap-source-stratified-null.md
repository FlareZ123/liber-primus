# Original LP2 doublet-gap autocorrelation: exact source-stratified conditional nulls

**13 November 2026, Agent46. Status: reproducible original-source, exploratory mechanism constraint.** No previously unknown plaintext, key, invertible cipher, or terminal destination recovered.

## Decision and original evidence

A separate independent [Round44 study](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) identified a Pearson correlation of **+0.380019689241** between consecutive distances separating the 86 adjacent-equal rune events in the 12,956-rune unknown LP2 stream. Its unconditional null was significant and the associated [per-page stationarity study](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-C5-stationarity/RESULTS.md) could not identify an individual abnormal page.

**New decision in this repository:** What independently visible source segmentation can account for the serial-gap anomaly without selecting a ciphertext-derived key? Test progressively finer *exact-count-conditioned* nulls against the same unmodified original 86-site pattern. This distinguishes a book-wide fixed residual-repeat model from page or line-dependent mechanisms. It does not establish how the cipher suppresses repeat runes, or prove such suppression was deliberately implemented.

Source is `resources/liber-primus/lp2-corpus.json` (physical pp0–55, excluding the runeless p50) cross-checked rune for rune with `resources/liber-primus/lp2-transcription.txt`. The latter's `%` sections skip p50: section index 50 is physical p51. Eligible doublets compare consecutive *within-page* runes, not page joins. All 55 rune-bearing unknown pages exactly match.

There are **12,901 eligible adjacent pairs, 86 equal pairs, and 85 inter-site distances**. The nine independently visible red-heading chapters begin at pp0, 3, 8, 15, 23, 27, 33, 40 and 54. Original chapter counts:

| Physical pages | Eligible pairs | Equal pairs |
|---|---:|---:|
| 0–2 | 726 | 4 |
| 3–7 | 1,140 | 6 |
| 8–14 | 1,722 | 9 |
| 15–22 | 1,895 | 10 |
| 23–26 | 1,017 | 11 |
| 27–32 | 1,427 | 13 |
| 33–39 | 1,673 | 12 |
| 40–53 | 2,995 | 18 |
| 54–55 | 306 | 3 |

Under every null below, **each source-visible stratum retains exactly the original number of equal-pair events**; the event sites are uniformly reassigned without replacement among eligible positions in that stratum. The observed positions and Pearson correlation are unchanged across nulls. This explicitly conditions on observed counts and asks only whether the *ordering* carries extra structure.

## Source-conditional result

Reproducer: [`sims/lp2_doublet_gap_conditional_null_sft.cjs`](../sims/lp2_doublet_gap_conditional_null_sft.cjs), portable Node.js 22 CommonJS. Every source page is asserted against its independent physical transcription; deterministic per-model xorshift32 seeds are `0x33013301 XOR imul(modelIndex+1, 0x9e3779b1)`. Uniform without-replacement sampling uses Floyd's algorithm. Test executed against the actual GitHub-fetched original inputs; the correlated-gap synthetic positive control has **r = 0.809091**.

| Original counts held fixed | Strata | Null draws | Null mean r | Null SD | r at least observed | One-sided add-one p |
|---|---:|---:|---:|---:|---:|---:|
| Whole book | 1 | 100,000 | −0.01235 | 0.10532 | 37 | **0.00038** |
| Within-word / word-boundary | 2 | 100,000 | −0.01267 | 0.10517 | 32 | **0.00033** |
| Nine visual chapters × boundary | 18 | 100,000 | −0.02949 | 0.09626 | 3 | **0.00004** |
| Each physical page | 55 | 100,000 | +0.23006 | 0.06043 | 509 | **0.00510** |
| Each page × boundary | 110 | 100,000 | +0.22984 | 0.06022 | 502 | **0.00503** |
| Each page half (rune-position split) | 110 | 50,000 | +0.30865 | 0.03814 | 1,593 | 0.03188 |
| Each page quarter | 220 | 50,000 | +0.33918 | 0.02542 | 2,713 | 0.05428 |
| Each printed line | 594 | 50,000 | +0.36734 | 0.00953 | 4,649 | 0.09300 |

**Interpretation.** Chapter and word-boundary counts barely account for the serial-gap correlation. Fixing *the exact physical-page event counts*, with no cipher assumptions, accounts for much of it: the conditional expectation rises to **r ≈ 0.230**. Residual serial positioning remains unusual within pages under a uniform-location model (one-sided conditional p ≈ **0.005**). Fixing page-half occupancy reduces that discrepancy further (p ≈ **0.032**); preserving one quarter of each page or the exact printed line occupancy leaves a modest residual (p ≈ 0.054/0.093). Thus the external T7 anomaly can be modeled almost completely by the fine spatial **occupancy** of events at roughly a printed-line scale. It is not evidence of a unique generation mechanism or selected reset clock.

This is a useful constraint for proposed repeat-avoidance architectures: a model in which the residual repeat sites are independent and uniform *within each physical page*, conditioned on that page's exact count, has a tail probability of ~0.005 for this one pre-existing statistic. A candidate that predicts line-scale occupancy or a correlated local escape state before inspecting the sites would become falsifiable. None currently does.

## Limitations and next cryptanalytic decision

The T7 statistic came from an external exploratory battery; the additional stratifications here were chosen with knowledge of that anomaly, so p values should **not** be treated as independent confirmatory discovery probabilities. Increasing the number of source-conditioned bins necessarily conditions on increasingly detailed original outcomes and can erase a real cipher effect along with sampling noise. The page-half/quarter division is a researcher-defined diagnostic, not a printed cipher instruction. Finite randomization is conditional on observed event counts, not a generative likelihood for arbitrary cipher output. Genuine ciphertext-dependent selection or natural plaintext features can also cause occupancy differences.

**Decision:** reject a purely book-wide memoryless independent repeat-site placement as a sufficient description of the observed order, and deprioritize attempts to read the 86 doublet-site values as an independent hidden message. Seek an **original-artifact-selected state/reset rule** that predicts the per-line or intra-page event occupancy independently; demand a source-derived inverse and heldout original plaintext before claiming a decryption. Avoid another post-selected key search over the anomaly itself. The earlier Round44 negative channel-value reads and stationarity power scopes remain valid.

The [reproducer](../sims/lp2_doublet_gap_conditional_null_sft.cjs) is the compact machine-readable audit trail. No known unknown-page plaintext is identified.
