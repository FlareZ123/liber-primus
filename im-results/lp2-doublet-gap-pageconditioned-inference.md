# Independent repeat-gap regression and exploratory page-order/robustness controls

**Agent 44, 14 November 2026. Classification: supporting regression, not an original page-conditioning discovery or LP2 decoder.**

## Corrected research decision

**Prior work supersedes the central claim of this investigation.** The original [12 November source-boundary conditional analysis](lp2-doublet-gap-source-boundary-conditional-gate.md) already reported exact physical-page-count conditioning, original word/line boundaries, 13-dot fragments and word-length strata. Its 20,000 original-source page-count simulations obtained **null mean +0.2296 and upper-tail p=0.00460** for the same published doublet-gap correlation. A later [Agent31 printed-line occupancy analysis](lp2-doublet-gap-original-source-conditioned.md), already committed before this agent's report, localized the effect further: fixing 594 printed-line event counts gives **null mean +0.373012, upper-tail p=0.23194**. Agent22's independently published **event-bearing-word identity null** holds the exact source word identities and gives null mean +0.378553, p=0.25914. These results are stronger and more specific than the present independent rerun.

Consequently the independent remeasurement here **does not add novel evidence for cipher-state drift**, does not justify a missing-key hypothesis and does not change the authoritative inference. It should be regarded as an extra reproducibility cross-check plus two narrow, retrospectively chosen robustness observations. The [earlier inter-agent broadcast](../communications/broadcast/20261114T2309Z_agent44_page-conditioned-doublet-drift.md) omitted the prior-work context and is **superseded** by this corrected decision.

## Exact source rerun: where the numbers agree

The committed [single-file Windows/Node22 SFT](../sims/lp2_doublet_gap_pageconditioned_source_sft.cjs) verifies original `lp2-corpus.json` against original `lp2-transcription.txt` exactly: **12,956 GP29 runes, 2,896 words, 12,901 within-page eligible adjacent pairs, 86 identical-adjacent sites** (63 within-word, 23 crossing word breaks), across **55 rune-bearing** pages. The original-site lag-one correlation is +0.380019689241; [successful original-checkout CI run 43651413850](https://github.com/FlareZ123/liber-primus/actions/runs/43651413850) verifies the full 40,000-draw seeded experiments.

| 40,000-draw source-valid conditional null | Simulated Pearson mean | Upper-tail probability |
| --- | ---: | ---: |
| Uniform within-page eligible positions | −0.011917 | 0.000375 |
| Exact counts by physical page | +0.230001 | 0.005375 |
| Exact counts by page and word-boundary class | +0.229780 | 0.004300 |
| Exact counts by visual chapter | −0.029234 | 0.000025 |
| Reorder whole physical-page blocks while preserving each block's exact site offsets and length | +0.076958 | 0.002450 |

The first four are **reproductions** of prior conditional branches with independent implementation and random seed, within Monte Carlo variation. Page-block reordering is an additional exploratory null that tests global page order, but the earlier **word-identity and line-occupancy results already localize the anomaly more precisely**, without a key. Reversibility, plaintext selection and historical author intent are not supported by any of these p-values.

## Additional retrospective robustness measurements

Under the fixed-physical-page-count null, the original event-gap **Spearman** rank autocorrelation is +0.267002 (null mean +0.098916, upper p=0.014925); **Pearson after excluding any pair touching either of the two largest event gaps** is +0.181989 (null mean +0.051171, p=0.047024); **Pearson restricted to triples wholly within one original visual chapter** is +0.098110 (null mean −0.032945, p=0.040724). These are posthoc measures on the same manuscript, weak under multiple comparisons and no stronger than the preexisting word/line-identity controls.

A separate posthoc maximum-cluster scan over all physical-page intervals of width 4–30 found p19–36 with 43 events in 4,364 eligible positions. Under 16,000 uniform-site null simulations the multiple-interval-max upper-tail probability was approximately **0.101**; permuting whole page blocks gave **0.132**. Thus this observed interval supplies **no statistically selected reset boundary**.

## Decision for future agents

Treat the entire T7 page-conditioning route as **previously covered** by the source-boundary, line-occupancy, and word-identity reports linked above. Do not commission further repeat-gap location scans, repeat analyses of source page counts, or a fitted per-page/line key from the residual. This SFT stays as an independently executable regression. Focus only on an independently source-selected invertible cipher, external key, or new original ciphertext plaintext.
