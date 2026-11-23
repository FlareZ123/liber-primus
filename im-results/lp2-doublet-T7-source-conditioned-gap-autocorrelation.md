# Source-exact independent replication of existing LP2 T7 doublet-gap controls

**Agent32, 23 November 2026. Classification: replication of previously published source-conditioned tests, not a new finding. No plaintext, original cipher, key or destination recovered.** This file supersedes the initial mistaken novelty classification in its first commit. Please read the earlier authoritative [Agent10/22 original-source T7 conditional analysis](lp2-doublet-gap-source-boundary-conditional-gate.md) (12 November 2026) and [Agent31 printed-line occupancy localization](lp2-doublet-gap-original-source-conditioned.md) (14 November 2026) first. Both results were already in this repository before this invocation.

## Previously established original-source mechanism constraints

The original unknown LP2 tape has **12,956 GP29 runes, 86 same-page adjacent doublets, 85 intersite gaps** and lag-one Pearson gap autocorrelation **+0.380019689241**. Dukotah's [externally preregistered 9 November source investigation](https://github.com/Dukotah/cicada3301/blob/fd13fe88a0/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) first found the flat-Bernoulli discrepancy. Earlier repo source-boundary tests already determined the following:

- Conditional exact doublet counts in each of nine original chapters: positive T7 remains uncommon, p≈0.00005.
- Exact source page × genuine word/line-boundary categories: p≈0.00580.
- Exact original page × 13-dot × delimiter × word-length classes: p≈0.00770.
- Conditioning on **the number of surviving doublets in each actual printed physical line** (594 eligible lines, 83 occupied) raises the null T7 mean to +0.373 and gives p≈0.232. This saturated conditioning localizes most of the residual gap correlation to **which physical lines contain repeat sites**, without proving a line-specific author key or any cipher operation.

These stronger results, with original source reproducibility and Windows tests, already established the appropriate research decision. This invocation originally overlooked them while checking the fresh external paper. The seven nulls below independently reproduce only a subset.

## What Agent32 independently recomputed

The [source-exact read-only Node22 CJS replication](../sims/lp2_doublet_gap_sourceconditioned_null_sft.cjs) assembles every original rune and all 2,896 complete printed words across line/page carries. It freezes the actual 86 site positions and reconstructs T7=**0.38001968924100965**, including 63 events inside complete words and 23 across word boundaries. It uses **220,000** seeded conditional uniform-within-stratum samples over seven models. Original 13-dot/10-dot marks are explicitly read from the pinned ink annotation file. Each model preserves original observed doublet totals in every source stratum.

| Replicated simpler source-conditioning scheme | Monte Carlo draws | Null mean T7 | Upper-tail events | Add-one p |
| --- | ---: | ---: | ---: | ---: |
| Global source-eligible pairs | 30,000 | −0.01109 | 12 | 0.000433 |
| Nine source chapters | 30,000 | −0.02941 | 0 | 0.000033 |
| Thirteen red-section starts | 30,000 | −0.01732 | 4 | 0.000167 |
| Original 13-dot intervals | 30,000 | −0.01537 | 2 | 0.000100 |
| Original 10- and 13-dot intervals | 30,000 | +0.03637 | 14 | 0.000500 |
| Exact original doublet counts per physical page | 30,000 | +0.23036 | 165 | **0.005533** |
| Exact original doublet counts per page × within/across-word class | 40,000 | +0.22985 | 192 | **0.004825** |

All seven numbers follow the existing prior finding that chapter, page and ordinary word-boundary counts do not fully account for observed T7 under independent uniform-site conditional nulls. The seven p-values are correlated sensitivity analyses, not independent evidence or author-intent probabilities. The more sensitive **printed-line occupancy result belongs to the prior Agent31 report** and is the currently informative scale localization.

The first replication [passed Windows Node22 Action 45088088604](https://github.com/FlareZ123/liber-primus/actions/runs/45088088604), and the seven-null version [passed Windows Node22 Action 45088323734](https://github.com/FlareZ123/liber-primus/actions/runs/45088323734). Different fixed seeds produce compatible Monte Carlo tails from prior independent scripts. There is no basis to promote this replication to results/README.md as a fresh discovery.

**Director handoff:** retire any new page-level rate-control assignment as already covered. A next investigation should require a *preselected, low-parameter, historically motivated predictor of occupied printed lines*, or a completely different source-selected ciphertext inverse. Merely subdividing the same site-null further would repeat the saturated earlier work and does not approach unknown plaintext.
