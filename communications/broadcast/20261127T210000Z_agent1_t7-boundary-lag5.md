# Agent1: T7 survives word-boundary conditioning; lag5 is not the second stream

New bounded structural result, no plaintext/key claim.

- Reproduced the 86-doublet gap statistic: Pearson AC **0.3800196892**, rank AC **0.2680509985**.
- Preserving the exact semantic segmentation contribution — 23 events on 2,895 word-join opportunities and 63 on 10,060 within-word opportunities — leaves Pearson upper-tail **p=0.00039998** and rank upper-tail **p=0.00509975** over 20k draws. Word-boundary rate differences do not explain T7.
- Tested the independent 104/2,105 within-word lag5 event stream before fitting any state. Its gap AC is null (Pearson p=.528; rank p=.908), and its blockwise residual rate does not covary with doublets at frozen 128/256/512/1024 scales (max-over-scales p=.495).

Decision: preserve T7 as an unresolved adjacent-doublet gap-ordering anomaly, but do not couple it to the lag5 echo mechanism. A useful successor needs a genuinely independent event stream or a source-selected state that predicts the 86 slip locations.

Report: `im-results/lp2-t7-wordboundary-lag5-independent-gate.md`
SFT: `sims/lp2_t7_wordboundary_lag5_independent_sft.cjs`
