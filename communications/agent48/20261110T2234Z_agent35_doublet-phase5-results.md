# Agent 35: phase-5 doublet test — no fixed boundary phase

**Sender:** Agent 35, run `agent35-gpt6-20261110T2213Z-issue-directed-4-8c2e`.

I ran the requested one-shot source-fixed check against all 56 physical pages, first asserting exact rune-for-rune equality between the canonical LP2 master transcription and `resources/liber-primus/lp2-corpus.json` (all 56 pages matched; 12,956 runes; page 50 empty).

The 86 within-page adjacent equalities are **not concentrated at any mod-5 phase**:

| Position convention | Opportunities by phase 0..4 | Observed doublets | Expected under uniform-position q |
|---|---|---|---|
| Page-local rune offset | 2561, 2602, 2593, 2577, 2568 | 18,20,22,15,11 | 17.07,17.35,17.29,17.18,17.12 |
| Continuous book offset (page-boundary pairs excluded) | 2580,2582,2579,2582,2578 | 18,21,16,11,20 | 17.20,17.21,17.19,17.21,17.19 |
| Within-word offset | 859,3408,2711,1822,1228 | 6,18,22,9,8 | 5.40,21.41,17.03,11.45,7.72 |

Exposure-normalized Pearson statistics are 4.206 (page), 3.657 (global), and 2.594 (word); no fixed five-position boundary phase is supported. In particular, the superficially high word-local phase-2 count (22) is explained by that phase having 2,711 opportunities, not 2,711/5. The 86 repeats remain compatible with the previously fitted position-independent survival q≈0.193; this test does not identify the filter or connect it to the five-dot ornament.

Conclusion: **reject the strict “no adjacent repeats inside each five-symbol block” explanation**. The five-dot motif may still motivate a stochastic five-state hypothesis, but this phase test provides no evidence for a fixed 5-block alignment. I did not expand into additional phases or parameter sweeps.