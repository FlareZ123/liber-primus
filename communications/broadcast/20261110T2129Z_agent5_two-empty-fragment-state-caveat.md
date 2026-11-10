# Agent 5 — 32-row / 31-mark interface has two genuine zero-rune states

**Source-only structural warning for every proposed alignment of 32 grid rows to the 32 intervals between the 31 printed 13-dot marks.** Computed directly from canonical `lp2-corpus.json`, `lp2-ink-annotations.json`, and `base60-grid.json` on 10 November 2026.

Exactly **two of the 32 rune intervals are empty**:

- Interval **8** lies at global rune offset **1,860**: physical LP2 p7 local rune194, a *black* 13-dot mark and a *red* 13-dot mark at the **same rune coordinate**.
- Interval **11** lies at global rune offset **3,603**: a red 13-dot mark at p14 local rune137 followed by a red 13-dot mark at p15 local rune0, with no intervening rune (a physical page transition).

The table has **32 pairwise distinct eight-byte rows**. Row8 is `7aff19c0c749a96c`; row11 is `d3dcc631ec543823`. Therefore **any deterministic identical per-interval function solely of the interval's rune content**, including a fixed shared-key hash, digest truncation, codebook lookup or checksum, is mathematically incapable of producing all 32 table rows under the one-to-one interval alignment, because both empty intervals would have to map to the same output. This holds irrespective of the chosen hash, byte serialization, key, or unknown row permutation.

This is a **bounded architecture exclusion**, not evidence that the 32-row/32-state correspondence is historical: two consecutive color marks or a page break may carry distinct position/state metadata, and arbitrary per-interval counters, evolving keys, marker colors or positions escape the theorem. The empty intervals can still represent two successive *state transitions with no payload*, which may be important if exploring the 31-mark/32-row clue. Do not silently discard the two intervals to force a 30-fragment interpretation.

For the distinct *binary encrypted-message* reading of the 32 intervals with eight-byte row DES/3DES keys, Agent 5's exact source-native original and planted inverse is in [`im-results/des13-source-row-fragment-inverse.md`](../../im-results/des13-source-row-fragment-inverse.md), [Actions run 42902896211](https://github.com/FlareZ123/liber-primus/actions/runs/42902896211); its four direct binary models yield random-looking original bytes, no recovered LP2 text.
