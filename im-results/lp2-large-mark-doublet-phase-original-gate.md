# Original large-ink punctuation does not mark the changing doublet rate

**Scope and decision (23 November 2026):** The full original 12,956-GP29-rune LP2 unknown p0–55 tape contains 86 adjacent-equal rune pairs. An independently documented 2026 analysis reports autocorrelation in the gaps between these sparse pairs, indicating regional rate variation. I tested one previously unexamined **artifact-visible boundary hypothesis**: whether the manuscript's genuine 10/13-dot large punctuation cuts are unusually aligned to those rate changes. They are **not** under an exact original-tape circular-phase comparator. This excludes that physical mark sequence as a statistically privileged boundary for this one piecewise-rate reading; it does not reject nonstationarity, a cipher filter, plaintext word-break changes, or a different hidden reset law.

## Frozen original input and operation

- Base source: `resources/liber-primus/lp2-corpus.json` pages 0–55, in printed order; omit rune-free p50. This produces **N=12,956** original GP29 runes, 86 consecutive-repeat indicators, with no manuscript punctuation added to the rune tape.
- Physical source register: `resources/liber-primus/lp2-ink-annotations.json`, large printed punctuation marks with page-local rune offsets. The unknown region contains **31 large-mark records**, including repeated alignments and a terminal endpoint. After identifying duplicate global offsets modulo N and adjoining the book-beginning sentinel, there are exactly **29 distinct circular cuts**.
- Candidate operation: a mark triggers a changed residual-doublet rate. Its independent observable consequence is an unusually good binomial piecewise-constant fit inside the exact physical marked intervals. For a segment of length L, observed x repeats and common original rate r=86/12956, score the binomial deviance contribution `2[x log(x/(Lr))+(L-x)log((L-x)/(L(1-r)))]`, with zero-count terms omitted. Sum for every interval on a **circle** to avoid favoring the arbitrary first/last book boundary. Punctuation remains fixed in spacing and direction; no symbol/key tuning is permitted.
- Exact comparator: shift the entire 29-cut template by each of the N possible integer rune phases around the unchanged circular 86-event tape; compute the same summed deviance for all 12,956 phases. This preserves actual event heterogeneity, high/low-rate runs, original cut spacings, and the number of marked intervals. Its p-value asks whether the physically printed phase is more aligned than an arbitrary phase, independent of a flat-Bernoulli assumption.

## Result and positive control

| Register | Summed deviance G | Circular shifts with score ≥ original | Tail fraction |
| --- | ---: | ---: | ---: |
| Exact original p0–55 | **20.520867744466102** | **9,289 / 12,956** | **0.7169651126891016** |
| Deterministic source-cut positive | **126.58527663539623** | **96 / 12,956** | **0.007409694350108058** |

The original 12,956-phase null mean is **23.68874965311004**. Thus the printed large marks achieve a slightly *worse* fit than the mean random circular phase, with no boundary-specific enrichment. For the positive, exactly 86 synthetic equal-site flags are spread evenly inside every alternate source-marked interval, with the same total repeat count and the original mark arrangement. The identical phase test detects this deliberately mark-linked rate contrast (p<0.01). This positive validates sensitivity to a marked-segment change of that size, **not** a complete cipher or the power for weaker/unmarked changes.

**Exact read-only Node22 reproducer:** `sims/lp2_large_mark_doublet_phase_sft.cjs`; reads the two original repo JSON resources, asserts all source counts, exact G/tail and positive-control gate, and prints the complete test output. It has no derived transcription, search phase, external data dependency or retuned parameter. Test can be run with the existing manual Windows Node22 SFT workflow.

## Interpretation and next decision

The independent external [Dukotah Round44 W2-B3 site analysis](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) finds significant lag-one autocorrelation of the *inter-site gaps*, not an author-selected cause or key. My original-corpus test asks a new conditional question: can the **real manuscript large punctuation alone** explain that regional variation? Its exact phase score says **no unusually strong alignment**. The next cipher inference must therefore acquire a different physical switch or a typed author instruction; changing the mark subset, shift, goodness statistic or boundary thresholds to rescue the rejected phase would be postselection.

No unknown LP2 plaintext, authentic encryption method or missing key is recovered. Do not promote this scoped falsifier into `results/` as an established decipherment.