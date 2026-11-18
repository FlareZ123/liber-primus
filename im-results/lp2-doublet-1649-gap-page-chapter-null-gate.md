# Original LP2 three-gap interval: two internal doublets and page-conditioned nulls

**18 November 2026, Agent10. Evidence class: original-cipher structural observation and scoped computational comparisons, with no recovered plaintext, key, source-selected decoder or final destination.** This note corrects an externally published interpretation of an otherwise genuine gap statistic. All figures derive directly from the canonical `resources/liber-primus/lp2-corpus.json` GP29 rune indices, physical pp0–55, with p50 runeless; a runnable, read-only CommonJS reproducer is [`sims/lp2_repeat_gap_structural_gate_sft.cjs`](../sims/lp2_repeat_gap_structural_gate_sft.cjs).

## What the 1,649-rune observation actually says

The 12,956 original unsolved runes contain **86 adjacent-equal pairs**, all internal to physical pages. Their first-rune event positions are zero-based global positions. Between the events at **2,739** and **4,388** are *two additional* repeat events: **3,139 and 3,851**. The three successive interevent distances are **400 + 712 + 537 = 1,649**. This is the *largest sum of three consecutive gaps*, not a 1,649-rune doublet-free void. The longest individual interevent gap is **712**.

| Original repeat-site offset | Original physical page; local rune offset | Relation |
|---:|---|---|
| 2,739 | p11; 79 | Left event |
| 3,139 | p12; 206 | First *internal* event |
| 3,851 | p16; 89 | Second *internal* event |
| 4,388 | p18; 86 | Right event |

The external [16 November independent T7 replication](https://github.com/njloof/cicada-lp2-sweeps/blob/main/sweeps/2026-11-t7-replication/REPORT.md) correctly recovered the three lengths and site tuple, but its phrase **“a 1,649-rune span with zero doublets”** conflates the *sum of three interevent gaps* with a single event-free gap. It then favors a local strict no-repeat session. The underlying [Dukotah original T7 result](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md) reports the correct individual maxima (712/662/553/537) and a reproducible gap autocorrelation around +0.380; its registered T7 result is *not* invalidated by the correction. Specifically the valid original window has two internal slip sites, so an exact zero-slip emitter across 1,649 runes is **not observed**.

## What survives matched comparisons

Observed Pearson correlation between consecutive 85 gap lengths: **+0.380019689241**. The *largest three-gap sum* is **1,649**. Each reported Monte Carlo probability is an add-one, **one-sided upper tail**, conditioned on the stated null and *not* a new discovery-wide p-value; the three-gap statistic was singled out after the external report. The hard-core geometric nulls require a minimum intersite distance of six, as the actual source does. All synthetic positions retain 86 events.

| Test and preserved structure | Draws | Null mean gap ac1 | ac1 upper-tail p | Null mean maximum three-gap sum | Three-gap upper-tail p |
|---|---:|---:|---:|---:|---:|
| Flat 86-site uniform hard-core stream, original length only | 100,000 | −0.01163 | **0.000320** | 1,200.13 | **0.03469** |
| Exact count of repeats on **each original physical page**; within-page positions uniformly resampled with min distance six and no cross-page event | 100,000 | **+0.24025** | **0.008870** | **1,656.28** | **0.50504** |
| Exact event count in each of the **nine original chapter sections**; site positions within chapters otherwise free but never at page seams, with min distance six | 30,000 | −0.02555 | **0.000133** | 1,151.66 | **0.01040** |
| Permute original *whole page-local site tapes* within each of the nine source chapter sections, preserving each page's length, event count and local event positions | 100,000 | +0.06813 | **0.000140** | 1,193.28 | **0.00811** |
| Permute the same complete page-local site tapes across all source pages, discarding chapter order | 100,000 | +0.07588 | **0.002280** | 1,260.30 | **0.05199** |

The original nine author-visible chapter spans are pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53 and 54–55, with corresponding complete-page original doublet counts **[4,6,9,10,11,13,12,18,3]**. Source p50 contributes no symbols. The p13–15 three-zero-page streak *crosses* the real p14/p15 chapter transition; a chapter-only change of repeat rate cannot by itself identify the long-low-repeat interval. There is no source instruction selecting an anti-repeat reset at any one of these physical boundaries.

**Decision:** once exact page counts are fixed, the allegedly extraordinary *1,649 sum* is essentially **median** under a neutral within-page arrangement null, unlike the original one-sided flat-null p≈0.035. The gap **autocorrelation** remains unusual even after this stronger condition (one-sided p≈0.009), so the regional signal is more than the *length of one alleged void*. Permuting complete page-local site patterns produces an even lower p for their original ordering, but this is a different conditional question and may reflect original typography or unrelated text generation as well as encipherment. Individual raw page-count autocorrelation is weak (site-count ac1≈+0.124; page-permutation p≈0.144; rune-normalized page-rate ac1≈+0.0435; p≈0.320); this is no proof of a specific page-key schedule.

A genuine next cryptanalytic step needs a **first-party page-visible selector** that predicts when the anti-repeat process changes and supplies an inverse or secret-state recovery rule. Do not branch new ciphers from the false “zero slip for 1,649 runes” premise. Preserve the T7 phenomenon and test a clue-selected page-local clock if one is discovered. The source presently selects no such key, operator or manuscript plaintext.

## Repeatability and scope

The reproducer reconstructs all 86 events from the original **adjacent GP29 ciphertext equality**, asserts the exact four positions and expected correlation, uses seed-pinned xorshift32/Floyd-sample comparisons, and runs five separately defined nulls without reading any guessed plaintext. It is read-only, uses only Node.js built-ins, and requires no external data except the canonical repository JSON. Its synthetic equal-spacing and page-permutation samples never claim an original cipher inverse. The flat and per-page-count hard-core laws have different conditioning; their probabilities cannot be compared as if one were a pre-registered general mechanism test.

**No unknown-page LP2 plaintext, authenticated decipherment key, decryption mechanism, or destination follows.**
