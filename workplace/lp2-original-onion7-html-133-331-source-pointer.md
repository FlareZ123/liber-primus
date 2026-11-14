# Original seventh-onion HTML: 133 / 331 and the earlier 7×7 square

**Evidence class:** original-release-associated archival HTML; independent historical cross-reference; unverified cryptanalytic interpretation. **No recovered unknown LP2 plaintext, key or route.**

## Exact surviving material

The standalone original-onion7 archival directory at [krisyotam/cicada3301](https://github.com/krisyotam/cicada3301/tree/main/liber-primus/original-onion7) contains 58 numbered LP2 image files, the signed onion-delivery sidecar, and a 1,640-byte `index.html` (Git blob SHA-1 `303db130705f0ef9be2a738f4336d5cfcebde80c`). Its non-image header begins:

```html
<html>
<head><title>133</title></head>
<body>
<div id="331">
<img src="0.jpg" /><br />
```

The 58 image tags continue in numerical sequence through `57.jpg`. Both `133` and `331` are literal source HTML metadata, separate from the rune transcription. The same index is quoted in the archived [2014 walkthrough](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/WALKTHROUGH.md), providing an independent textual witness to its existence, although the walkthrough and copied HTML may ultimately share a common original.

The **7×7** square in the earlier 2014 OpenPuff output ([period solver artifact](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/assets/stage07/magicsquares.txt), blob `0cff0a94f16a8603443619b6338def411c9f7bd5`) has centre **331** (row4/column4, one-based). Each row sums to **1033**, the established 2014 magic-square checksum. **133 is the decimal reversal of that exact centre value.** The numerical coincidence is entirely exact and source-checkable.

## Interpretation boundary and next decision

A plausible human observation is that the LP2 delivery page carries both an earlier known square's centre and its digit reversal, independently of cryptanalysis. That could prompt a solver to revisit the 2014 square or a reversal operation. This is **not** an instruction to read LP2 in any particular direction; the HTML has no associated function, printed rune coordinate or specified key clock. Decimal reversal also occurred in the already-solved LP1 p05 magic-square byte recovery, but that historical precedent is not evidence that the HTML selects the same operation for LP2.

The second number `133=7×19` also factors using the square dimension 7, while p55 (76 runes) and the solved clear p57 (95 runes) both have 19-rune block lengths. Those relationships are *post hoc* and are **not** a selected 19-column inverse. Prior direct 19-block source-stationary models have already failed; their tests should not be rerun. A next experiment warrants priority only if an original-side rule independently selects a specific register, input pages and reversible consumer for `133/331`, or predicts withheld original runes. The existing numbers do not meet that gate.

No alteration to `results/README.md` is warranted. This note preserves a potentially meaningful source-located pointer without promoting it to plaintext evidence.
