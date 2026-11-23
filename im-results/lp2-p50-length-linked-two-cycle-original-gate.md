# P50 self-addressing two-cycle and original flanking rune lengths

**Status:** concrete original-object observation with a *negative bounded decoding test*. Not an authenticated LP2 cipher, key, plaintext, or statistically calibrated discovery.

## What the original images make available

The original 32×8 numeric grid distributed over LP2 physical pp49–51 is legible as 256 two-character sexagesimal bytes. Its authentic row-major byte array is `B[0..255]`, held in `resources/liber-primus/lp2-grid-256.json`. The natural byte-address interpretation `f(i)=B[i]` produces a 2-cycle with literal addresses **158 ↔ 249**:

- `B[158]=249` (the printed token `49` at 1-based row20, column7)
- `B[249]=158` (the printed token `2c` at row32, column2)
- The other immediate preimages of 249 are `B[9]=249` and `B[227]=249`; the remaining 252 indices drain into the separate length-11 cycle. Such a functional graph can arise from an ordinary random-looking byte table; a graph alone is not evidence of an intentional cipher.

There is a tempting **independent visible length coincidence**: the two rune-bearing fragments physically adjoining the panel have 66 runes (p49) and 92 runes (p51), totaling **158**. On the opening physical page, a distinct red 13-rune heading precedes **249** black runes (262−13). These quantities are not fitted cipher keys; they are direct rune counts on source images. But the choice to compare *those* two lengths with this graph was made **after inspecting the graph**, so the exact two-cycle cannot be assigned a valid discovery p-value. Conditional on already declaring these precise two addresses and shuffling only the 256 observed byte values, its directed reciprocal probability would be `(3×1)/(256×255)=1/21760`. This conditional figure is **not** an independent authorship likelihood.

The dual lengths could in principle invite a word/rune receiver handoff. No original instruction actually says to turn the printed numbers into a 256-pointer function, select this cycle, or interpret its indices as text lengths.

## Decisive native original inverse attempted

Fix the exact original p0 black source (249 runes) and exact p49+p51 flank (158 runes), no alternate transcription. For an entirely ordinary GP29 additive handoff, take the **first or last complete 158-rune** window of p0 black, use either the source flank as printed or reversed, and decrypt with sign `+/-` mod29. This evaluates precisely **8** full original 158-rune transfers with no tunable key, phase, or unknown padding. Every variant reencrpyts exactly, yet the **maximum GP29 index of coincidence is 0.03571717** (known solved native p57: **0.06270997**); none reads as GP29 English.

A stronger necessary condition for the idea that the two selected 158-rune passages are *the same plaintext under two fixed arbitrary monoalphabetic GP29 substitutions* also fails. Grant a completely unknown, freely chosen map of every input symbol to output: the maximum exact matches are **38, 37, 43, 40** of158 under the four natural window/orientation alignments. The best alignment must mismatch **115/158 positions** even when every alphabet correspondence is optimized. This disproves only that stationary same-text cross-page model; context-dependent or different-plaintext encodings remain possible. A planted arbitrary affine relabeling of an original 158-rune window achieves exactly158/158, demonstrating that the invariant accepts the intended positive.

A separate simple original-output check—using row-major 256-byte table values or their addresses as a cyclic GP29 keystream starting at either 158 or249, ± on each 249/158-runic body—gives no native prose; highest IoC among 16 unoptimized candidates was **0.03805531** (flank, byte pad start249). This supplementary probe is not promoted to a new cipher family.

## Evidence, decision, and restart condition

The executable original-source and synthetic-positive checks are in [`sims/lp2_p50_158_249_lengthcycle_twoflank_sft.cjs`](../sims/lp2_p50_158_249_lengthcycle_twoflank_sft.cjs). Independent manual CI: [run 45114099261](https://github.com/FlareZ123/liber-primus/actions/runs/45114099261) (the initial eight-additive version passed in [run45113913297](https://github.com/FlareZ123/liber-primus/actions/runs/45113913297)). No original plaintext or key was recovered.

**Decision:** retain the two-cycle/source-length alignment as a *testable clue hypothesis*, **not** as an established intended route. Do not invest in generic graph traversals or author-agnostic cryptographic sweeps based on the coincidence. A useful next action requires a genuine Cicada instruction that independently selects a graph-to-text operator/clock, or a fully reproducible >=150-rune unknown plaintext on an untouched manuscript section. Competing explanation: random byte lookup graph plus post-selected manuscript lengths.
