# Independent English–English affine running key: original anti-repeat obstruction

**Decision, 15 November 2026 (Agent8); extends a previously published 2026 result.** [Dukotah's 2026 LP2 five-campaign synthesis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/docs/LP2-ANALYSIS-SUMMARY-2026.md#2-five-genuinely-new-findings) already identifies the severe anti-doublet deficit and argues against *ordinary English plus an independent English additive running key*. That conclusion and the original 86-repeat observation **pre-date this experiment**. The incremental test here grants **every one of 28 nonzero relative coefficients** for each source-native plant and includes two independently chosen intact English passages in addition to original-word-length-matched plants. It strengthens the finite source-register test without recovering a new cipher, key or plaintext. The full original LP2 unknown ciphertext contains **86** equal adjacent rune pairs among **12,901 page-local adjacent positions**. A genuine source-native English plaintext combined with an independent source-native English running key by **any fixed nonzero affine GP29 combination** produces far more equal pairs, even after choosing the *best of all 28 possible relative coefficients on each planted book*. In **4,500 calibrated source-English plants**, the smallest 28-coefficient minimum was **347**; **zero** matched or undercut the original 86. This is an explicit finite-language-model exclusion of *independent* English–English affine running-key generation under the stated clock, not a universal mathematical impossibility and not recovered plaintext.

**The actionable consequence:** a direct source-book Vigenère/running-key decoder assuming two ordinary independent English streams is a poor candidate to explain this manuscript. To pursue a key-source candidate, first identify an authenticated author instruction introducing a ciphertext-dependent state, anti-repeat transport, correlated key selection or a distinct encoding register. Another English book-offset or sign sweep is unlikely to address the primary original-cipher discrepancy.

## Exact original evidence and inverse family

Input is the unmodified \`resources/liber-primus/lp2-corpus.json\` with physical pages p0–55, numeric-only p50 empty; the manuscript's printed word fragments are parsed and checked rune-for-rune against \`resources/liber-primus/lp2-transcription.txt\`. The parser rejoins printed line-wraps, permits 32 physical-page carry fragments, and reproduces **12,956 original runes, 55 rune-bearing pages, 2,928 page-local fragments, 12,901 within-page adjacency opportunities and 86 equal pairs**. The published complete-word count after joining page carries is 2,896.

Consider the fully reversible family

\[
C_i=aP_i+bK_i+d\pmod{29},\qquad a,b\in\{1,\ldots,28\},
\]

where \`P\` and \`K\` are two source-native GP29 English streams, the coefficients and additive intercept \`d\` are fixed over the tested manuscript, and every ciphertext rune consumes exactly one plaintext and one key rune. Any fixed \`d\` cancels from adjacent differences; division by the nonzero \`a\` yields the **exact** equality criterion

\[
C_i=C_{i-1}\iff \Delta P_i+t\Delta K_i=0\pmod{29},\qquad t=ba^{-1}\in\{1,\ldots,28\}.
\]

Thus **all** \(28^2\) possible nonzero \`(a,b)\` pairs reduce to testing only 28 possible \`t\`. A source-language plant is given an **unfair advantage**: we select the minimum number of doublets over all 28 coefficients *after observing the generated plaintext and key*. This makes the test conservative relative to a historically fixed coefficient.

The encoder uses the repository's authenticated solved-LP1 orthography, including single GP runes for **ING** and **IO**, conventional Q/V/K/Z normalization, and the complete 29-symbol alphabet. It asserts exact source-rune spellings for THINGS, FUNCTION and FOLLOWING against the original solved LP1 transcription. SFT synthetic positives recover their source-native plaintext and re-encrypt exactly for **each** of 28 coefficients.

## Original-size source-English controls

Three historical-register control texts already in the repository are used: Shakespeare's first 300k characters, Gibran's *The Prophet*, and Emerson essays. Each control book is 12,956 runes and preserves all 55 original physical page lengths and 12,901 page-local adjacency opportunities. Random draws are reproducible from xorshift32 seed \`0x33012955\`. Results below show **[minimum, 5th percentile, median, 95th percentile, maximum]** of the doublets remaining after choosing the best of all 28 affine coefficient ratios.

| Key text | Planted plaintext | Simulations | Best-of-28 doublet quantiles | At or below original 86 |
|---|---|---:|---|---:|
| Shakespeare | Word-length matched sampled GP-native English | 500 | **360, 378, 399, 414, 425** | **0** |
| Gibran | Word-length matched sampled GP-native English | 500 | **363, 380, 399, 413, 423** | **0** |
| Emerson | Word-length matched sampled GP-native English | 500 | **351, 379, 399, 414, 425** | **0** |
| Shakespeare → Gibran | Two independent contiguous original-prose passages | 500 | **358, 376, 396, 413, 423** | **0** |
| Shakespeare → Emerson | Two independent contiguous original-prose passages | 500 | **347, 378, 398, 414, 424** | **0** |
| Gibran → Shakespeare | Two independent contiguous original-prose passages | 500 | **361, 376, 398, 413, 430** | **0** |
| Gibran → Emerson | Two independent contiguous original-prose passages | 500 | **356, 377, 398, 413, 423** | **0** |
| Emerson → Shakespeare | Two independent contiguous original-prose passages | 500 | **359, 378, 397, 413, 421** | **0** |
| Emerson → Gibran | Two independent contiguous original-prose passages | 500 | **357, 379, 398, 411, 422** | **0** |

For the first three controls, each native-English word is sampled from the union of the three source texts with the *same GP29 length as the corresponding printed page-local LP2 fragment*. The key is an independent contiguous English stream from the named book, spanning page transitions without resets. The second six controls instead use **two intact, independently offset contiguous GP-native English passages**, retaining source-word transition correlations rather than sampling words. The arrow shows plaintext and key sources respectively. Page breaks still determine which pairs are counted. These two calibration regimes give nearly identical results; the conclusion is not explained by sampled-word discontinuities.

Even the most favorable of **4,500** trials has over four times the observed doublets. Within each of the nine stated control regimes, the one-sided plus-one empirical tail is **1/501**; this is a *model-calibrated* finite Monte Carlo tail, not a universal p-value for all possible English plaintext/key pairs, creator intent or the historical cipher. The source-control registers and postselection over 28 coefficients are disclosed so the result cannot be mistaken for an exact mathematical bound on all English strings. An arbitrary **fixed bijection on the resulting GP29 ciphertext symbols** cannot rescue this mechanism: equality versus inequality of adjacent outputs is invariant under a one-to-one remapping. A changing-state mapping is a different operation.

## Source-visible reset-scope fork: page keying cannot hide the within-line deficit

The original physical lines provide a more discriminating finite alternative than simply allowing every chapter to reuse a fixed key. Their exact transcription gives **594 printed lines, 12,362 within-line neighbor pairs and 82 within-line equal-rune pairs**. The other four of the 86 original equals cross a printed line boundary. A line's first rune may be inherited from the prior line, so changing coefficients at a line boundary is a distinct cipher architecture.

For each of six source-native contiguous English plaintext/key author pairings, we generated 250 full original-length independent passage pairs. We held the **same 12,362 within-line opportunities** fixed in both of these retrospective, generously all-secret alternatives:

1. A different relative affine coefficient \`t\` for every physical *page*, chosen from all 28 possibilities after observing the full plant, while counting only within-line pairs. All **1,500** synthetic outcomes still exceed the original 82 events. Across the six source-pair registers, the per-control minimum ranges **129–138**, and the medians **158–160**.
2. A different \`t\` for **every printed line**, also chosen after observing each plant's plaintext and key. Here the six control minima are **1–4** and medians **10–12**; even their six 95th-percentile counts are only **16–19**. This new *highly adjustable* family can readily suppress within-line doublets to below the original count. It is **not** a recovered historical operation: no original clue selects 594 independent t values, any required additive intercepts, or the plaintext/key texts. The four cross-line original doublets are a separate clock/transition problem.

| Source-natural-language scope, same 12,362 within-line edges | Minima over the six 250-plant controls | Median range | Compare with 82 actual |
|---|---:|---:|---|
| Best coefficient chosen separately for each physical page | 129–138 | 158–160 | Remains above |
| Best coefficient chosen separately for every printed line | 1–4 | 10–12 | Can suppress below |

**Fork:** the fixed/global or per-page independent-English affine hypothesis is disfavored under both languages/registers even with coefficient selection optimized after seeing the data. A free per-line coefficient can change the count, but needs a genuine source-selected generator and an exact inverse with identifiable plaintext; otherwise it is merely an explanation with one adjustable secret per line. It cannot by itself account for the manuscript's fiveback correlations or the line-boundary equalities.

This added 1,500-plant experiment and both original line checks are included in the same CommonJS SFT; [successful Windows/Node22 CI run 43701346028](https://github.com/FlareZ123/liber-primus/actions/runs/43701346028).

## Limits and the next route

This excludes neither a **carefully correlated** plaintext/key pair specially chosen to avoid repeats nor an alphabet changing with prior ciphertext, page, word or state. It also leaves mixed letters and binary files, a variable-length or lossless anti-repeat serializer, literal F bypasses, key/payload material not rendered in GP-native English, unknown byte-level ciphertext, and externally sourced high-entropy keys. Such families require their own independently selected original-source operation and side-state, especially when they also seek to explain the manuscript's within-word lag-five echo excess. No original unknown plaintext, original author key or final destination has been recovered in this experiment.

**Provenance and prior art:** The already published Dukotah study [observed the 0.68% versus ~3.3% mismatch for conventional running keys](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/docs/LP2-ANALYSIS-SUMMARY-2026.md); this report must be read as a new *affine-coefficient and independent-passage calibration*, rather than a first discovery of the running-key objection. Its external synthesis sometimes calls the data *one-time-pad class*; that remains a mechanistic hypothesis, since the ciphertext distribution alone cannot identify the underlying key's provenance or length.

**Reproducer:** [full original-input CommonJS SFT](../sims/lp2_twoenglish_affine_antirepeat_sft.cjs), Node.js 22. It reads the committed original corpus and English controls without writing files, asserts physical-page transcription integrity, source-native solved-LP1 GP spellings, exact planted affine inversion and all fixed source-control quantiles, and runs the six further intact-prose holdouts. [Successful native Windows/Node22 CI with all nine controls](https://github.com/FlareZ123/liber-primus/actions/runs/43699911683). The scope is deliberately distinct from the earlier [one-source Book of the Law offset scan](book-of-law-running-key-gate.md), [shared-key section-pair difference constraints](lp2-ninebody-identical-additive-keystream-gate.md), and [reserved-doublet marker experiments](lp2-fixed-reserved-rune-doublet-source-gate.md). Do not turn this into another unbounded word-score key search without a genuinely new source operand.
