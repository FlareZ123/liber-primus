# Adjacent-doublet versus lag-five physical-line overlap

**18 November 2026, Agent10 independent fallback. Classification: architecture-decoupling negative.** The two strongest source-ciphertext structural anomalies do not co-localize on the same printed lines after exact physical-page opportunity conditioning. This argues against a single binary physical-line state being the common cause of both effects. It does not recover plaintext, identify either mechanism, or exclude state models operating at a different scale.

## Question

Two established observations remain live constraints on any LP2 encoder:

1. adjacent-equal ciphertext sites have nontrivial printed-line occupancy/order structure; and
2. within-word five-back equalities remain elevated under strict source-preserving nulls.

A simple common-mechanism hypothesis is that some printed lines are in a distinct encoder state that produces both phenomena. This test asks the narrow source-level prediction that follows: **are same-line within-word lag-five equalities enriched on the physical lines that contain adjacent-equal ciphertext events?**

No key, plaintext, decoded language, artwork interpretation or fitted line classifier enters the test.

## Source-exact event construction

The canonical parser reproduces **12,956 runes / 2,896 complete words** over p0-p55.

For adjacent doublets, use the established first-rune line convention and require both adjacent runes to remain on the same physical page. This gives **86 events on 83 physical lines**.

For the lag-five side, restrict to comparisons whose two runes are:

- five positions apart inside the same canonical complete word; and
- on the same original printed physical line.

This yields **1,645 eligible comparisons**, with **72** actual equalities. Restricting to the 83 doublet-bearing lines leaves **218 opportunities and 8 lag-five hits**.

| line class | lag-five opportunities | lag-five equalities | rate |
| --- | ---: | ---: | ---: |
| doublet-bearing lines | **218** | **8** | **3.6697%** |
| all other lines | **1,427** | **64** | **4.4849%** |
| all lines | **1,645** | **72** | **4.3769%** |

The raw direction is weak depletion rather than enrichment.

## Exact page-conditioned null

Physical pages differ in line lengths, word geometry, doublet concentration and lag-five event rates. The null therefore freezes, separately for each original page:

- every eligible same-line within-word lag-five position;
- the exact number of observed lag-five equality hits on that page; and
- the fixed mask saying which eligible positions lie on doublet-bearing lines.

Within each page, the fixed number of lag-five hits is distributed uniformly among its eligible positions. The overlap count has a hypergeometric distribution per page. Exact convolution across all 55 rune-bearing pages gives:

- observed overlap: **8**
- exact conditional mean: **10.3206713021**
- exact conditional SD: **2.6767293131**
- upper tail P(X≥8): **0.8554834685**
- lower tail P(X≤8): **0.2530815039**

So the observed overlap is entirely ordinary after page conditioning. There is no evidence that doublet-bearing line status raises the probability of a same-line within-word five-back echo.

## Decision

This is a useful negative architectural constraint. A **single physical-line on/off state that jointly generates adjacent doublets and lag-five copies** predicts positive same-line association, and the original source does not show it. Future mechanisms should therefore avoid assuming that the two anomalies share one line-level activation mask without an additional source-selected reason.

This does **not** make either anomaly spurious. The established doublet-gap localization and the independently established lag-five word-boundary/exact-bigram results remain intact. They may arise from different parts of one richer encoder, different state scales, source typography plus cipher effects, or unrelated causes.

Reproducer: [`sims/lp2_doublet_lag5_line_overlap_sft.cjs`](../sims/lp2_doublet_lag5_line_overlap_sft.cjs). Windows Node22 [PASS 44397405095](https://github.com/FlareZ123/liber-primus/actions/runs/44397405095).
