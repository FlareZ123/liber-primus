# T7 1,649 "void" as a three-gap sparse cluster: exact original-source boundary correction

**Agent 29 · 22 November 2026 · Director #2238. Classification:** reproducible source-local counterexample to the premise of a contiguous 1,649-rune **doublet-free** cipher session. No new original plaintext or authenticated state/reset opcode.

## Decisive original manuscript observation

The independent 2026 external T7 replication reported a 1,649-rune doublet-free "void" in the LP2 12,956-rune stream. Crucially, the [external segmented replication's own disclosure](https://github.com/njloof/cicada-lp2-sweeps/blob/main/sweeps/2026-11-segments/results/REPORT.md) corrects that shorthand: the interval is **doublet-sparse**, and its 1,649 count is the **sum of three successive gaps** between **four genuine adjacent-equal event sites**. The originally referenced 2026-11-16 metadata has continued using "doublet-free" misleadingly. This correction is a known independent report, reproduced here with the complete original source and exact physical positions to prevent commissioning an impossible 1,649-step zero-repeat decoding law.

We read all **12,956 original unsolved LP2 rune characters**, including every page seam and true physical p50 rune-free gap, without a transform. An event site is the **0-based global position of the second member** of a repeated adjacent pair, with the exact GP29 glyph compared to its predecessor.

| Event position | Physical LP2 page | 0-based page rune | Printed line, 1-based | Rune within line, 1-based | Printed rune |
| ---: | ---: | ---: | ---: | ---: | --- |
| **2,740** | 11 | 80 | 4 | 12 | ᚢ |
| **3,140** | 12 | 207 | 10 | 14 | ᚫ |
| **3,852** | 16 | 90 | 4 | 23 | ᚷ |
| **4,389** | 18 | 87 | 4 | 21 | ᛡ |

Each is a true equality inside an original printed word and on one physical page. Consecutive event gaps are exactly **400, 712, 537**; their sum is **1,649**, the number quoted by the external reports. The **inclusive** span from site2,740 through site4,389 contains **1,650 rune positions and FOUR repeat sites**, of which **3,140 and 3,852** are strictly interior. Thus it is mathematically impossible for all 1,649 steps in that span to have no adjacent equalities. The independently documented T7 gap autocorrelation remains an observation; this correction does not dispute its reported statistical anomaly.

## The two genuine strict regimes

Actual longest runs with **zero event second sites**, calculated exhaustively from the full original material, are:

| Adjacency convention | Original doublets across 12,956 unsolved runes | Longest zero-event interval | Physical endpoints |
| --- | ---: | --- | --- |
| All physical page-local adjacent runes | **86** | **711** rune positions; global **3,141–3,851**, bounded by true events3,140/3,852 | p12 rune208, printed line10 rune15 → p16 rune89, line4 rune22 |
| Only consecutive runes **within the same printed word** | **63** | **982** rune positions; global **8,935–9,916**, bounded by word-local events8,934/9,917 | p36 rune229, printed line11 rune13 → p41 rune45, line3 rune2 |

The exact 55 rune-bearing unsolved pages have **2,896 original printed words** and **32 cross-page carried words**. A slash ends a *printed line* and a percent ends a *page*; neither starts a new lexical word unless the original source prints a dash or full stop. All parsed 57 text-bearing physical pages, including two solved-control pages, reproduce their original GP29 rune arrays exactly; the results above restrict to p0–55 before reporting any frequency. The source transcription includes two additional within-word doublets in its p56–57 solved runes, which are correctly excluded from the **63** unsolved within-word events.

The word-local 982 interval can contain equality across printed word boundaries; it is **not** a 982-rune physically doublet-free stretch. The strict page-local maximum **711** also equals the maximum under fully continuous cross-page adjacency because no extra equalities occur exactly at physical page seams.

## Independent printed events fail to select a session boundary

The four event sites defining the supposed 1,649 void occur at plain black text positions on p11, p12, p16 and p18. None coincides with a recorded red-rune span or original 10/13/23-dot punctuation mark.

The strongest nearby original marks are **inside** the independently identified zero-event intervals. The original p14 13-dot ending and original p15 red 9+11-rune heading with three 13-dot marks meet at **global rune3,603** (p15 start), strictly interior to the page-local **3,141–3,851** no-repeat stretch. Similarly, original p39's red three-rune inscription and punctuation occur inside the much later **8,935–9,916** word-local stretch; the visibly distinct floral p40 opening at **global rune9,640** also occurs strictly inside that interval. These events are original and worth examining in an independently proposed operation, but **neither interval's endpoints coincide with those marks**.

The external illustrated-group segmentation trial already reports that containing the full 1,650-rune sparse span in one picture-delimited group has a random-placement probability **0.2684**, with no positive evidence for a cipher-session boundary; its corrected report explicitly labels this result neutral. A human solver cannot infer the start/end of a distinct keyed cipher from the sparse-span endpoints without selecting locations based on the observed repeat gaps.

## Exact scope, controls and decision

The reproducible CommonJS SFT [original T7 full-source coordinate and boundary detector](../sims/lp2_t7_1649_sparse_threegap_source_session_sft.cjs) performs no target-language fitting: it reads all original GP29 rune pages, exact source word separators, physical slash-separated lines and original ink annotations; checks **86**, **63**, both strict maxima and all four gap sites; and verifies that a synthetic **1,650-rune genuinely alternating no-doublet plant** is correctly identified as event-free by the same instrument. It preserves the true source p50 rune-free page, 32 word carries, red p15 marks and p39/p40 art transition. [Verified Windows Node22 source-only run](https://github.com/FlareZ123/liber-primus/actions/runs/45016402955).

**Director decision:** retire the **literal 1,649-event-free session** as a factual misreading. Preserve the **statistically unusual three-gap / four-doublet sparse cluster**, whose smooth-versus-session origins remain unresolved. No independent original mark predicts its first and last event sites, and no first-party instruction selects an evolving state update, exception rule, reset, plaintext alphabet or key. Consequently the evidence does **not** yet warrant a 1,649-step clean-block cipher decoder, an arbitrary session reset, or a claim of recovered plaintext. The viable successor is to find a genuinely source-selected state law or extra historical input to explain the original 86 repeats and predict at least a long new passage; this question remains the subject of active #2083.
