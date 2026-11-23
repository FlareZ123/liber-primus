# Original p13–p15 doublet-free island: independent regime-change decision

**Agent 3, 23 November 2026.** This is a bounded decision about whether the physical p13–p15 interval requires a special cipher state. **No unknown LP2 plaintext, key, typed state transition, or author-chosen decoder has been recovered.** The separate, global rarity of adjacent equal ciphertext runes remains a real whole-manuscript problem under #2273.

## Physical clue and rival

The original p13/p14/p15 page tapes have 272/137/159 runes: **568 original runes**, **565 page-local adjacent transitions**, **zero identical adjacent pairs**, and an actual FOLD-like four-rune source cue near the seam. The entire 56-page unknown corpus has **12,956 runes**, **12,901 within-page adjacent transitions** and only **86 equal pairs**. The true longest equal-pair-free run is 711, as corrected by `workplace/lp2-t7-residual-doublet-fold-seam-source-crosswalk.md`; a previously claimed 1,649-rune zero-doublet run is erroneous.

A physically switched cipher at p13/p14/p15 should change a statistic **other than the zero-pair feature that selected this region**, and it should eventually specify how an original human solver recognizes and reverses the switch. The rival is one common anti-repeat mechanism that occasionally emits 568-rune zero-doublet stretches.

## Frozen original-cipher tests

All measurements use exact `resources/liber-primus/lp2-corpus.json` runes and `lp2-transcription.txt` word/page boundaries, independently matched rune by rune. Source offsets are physical p13 start **3194**, length **568**. Page-local transitions exclude across-page artificial neighbors. The matched empirical control is **every 12,389 contiguous 568-rune window** in the same original unknown tape. The historical-solved native GP29 control is `resources/external/relikd-solved-gp29-native-v1.json`, not invented synthetic English.

| Independent feature | p13–p15 original | Same-book 568-window comparison |
| --- | ---: | --- |
| Lag-2 equal rune pair count | 18 | 6,219/12,389 windows have ≤18; median 18 |
| Lag-3 equal rune pair count | 18 | 6,148/12,389 windows have ≤18; median 19 |
| Nonzero modular Δ GP29 Pearson χ² against whole original tape | 26.69769519 | 6,480/12,389 windows have ≤26.70; median 26.28 |
| Actual printed within-page word seams | 126 | 6,864/12,389 windows have ≤126; median 126 |
| Word-seam **nonzero** Δ Pearson χ² | 43.39420590 | Only 317/12,389 windows are at least this divergent |

The seam-only χ² is a **post-observation upper-tail finding** (~2.56% of overlapping windows). It was noticed alongside multiple independent diagnostics and after the zero-doublet feature selected the corridor; it is **not** a confirmatory chapter-cipher p-value. It has no independent first-party opcode or decoder.

Among all **54 physically consecutive three-page groups**, p13–p15 is the only group with zero adjacent repeats, but its **nonzero modular-difference G-score 25.66756509 ranks only 29th from most divergent**. Across all 12,815 nonzero within-page steps, giving the p13–p15 interval its own 28-outcome difference distribution adds 27 free parameters. The likelihood-ratio statistic is only **26.90257799**, while the extra BIC penalty exceeds this by **228.47345626**. The comparison is descriptive about this specified model, not an exclusion of all possible cryptographic state changes.

A separate equal-length **400-rune context on either side of each physical cut**, retaining its nonzero within-page steps, compares modular difference profiles by Jensen–Shannon divergence. The physically motivated cuts do not form a coherent change pair: p13 ranks **14/55** largest, p14 **18/55**, p15 **5/55**, p16 **50/55**, p40 **38/55**. The isolated p15 high rank has no corresponding p16 reset signal. No one boundary determines a key clock or changed permutation.

## Explicit correction for searching whole-book windows

Under an intentionally simple finite null, **place the original 86 equal-pair events uniformly among the fixed 12,901 page-local transition slots** without changing the original physical page lengths. A source-fixed xorshift32 RNG seed `0x7ed29eab` and Floyd sampling over **100,000** replicates gives:

- A specified p13–p15 triple is zero-repeat in **2,174/100,000 = 2.174%** of draws.
- **At least one of all 54 three-page groups** is zero-repeat in **60,445/100,000 = 60.445%** of draws.

This null is deliberately limited: it does not model native GP29 language, cipher key updates, word correlations or real creator intent. It demonstrates the heavy selection effect when examining every three-page location under the **existing observed global repeat rarity**. For contrast, among **401 original 568-rune windows** drawn from two long solved-Cicada GP29 native prose sections, the minimum ordinary adjacent pair count is **9**, showing the real LP2 manuscript is globally different from these native texts.

## Decision

**Do not assign p13–p15 a distinct cipher solely because it contains no identical adjacent neighbors.** Under independently checked lag statistics, the full nonzero-step profile, a two-regime fit, and physical-change-point ranks, there is no coherent independently selected transition at the suspected chapter edges. The printed FOLD seam remains physical evidence but earlier direct folds and the source-specific 2014 Crab Canon reader have been closed (#2342/#2367/#2403).

The seam-conditioned difference anomaly is worth preserving as a limited lead, although it cannot identify a key or support a new source-derived cipher. Reopen this branch only if an **independent original printed instruction** predicts that particular seam operation and a full reversible native plaintext decoder with a withheld original page. Leave the global changing-state and source-defined side-information question to #2273 rather than duplicate its anti-repeat rank-code work.

### Reproducibility

[Exact original-cipher read-only SFT](../sims/lp2_p13_p15_regime_changepoint_original_sft.cjs), [Windows Node22 source-positive run 45238520822](https://github.com/FlareZ123/liber-primus/actions/runs/45238520822). The SFT checks original transcription equality, page-local event counts, all 12,389 matched windows, 54 physical groups, fixed-seed 100,000-repeat null and 401 authentic solved-Cicada GP29 windows. It writes no files and makes no new plaintext claims.
