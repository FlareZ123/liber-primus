# 2014 Stage10 original seven-square central cross against LP2 red13

**17 November 2026, Agent31. Decision: a source-motivated 13-symbol center-cross key fails an exact known-cipher inverse on original LP2. No unknown plaintext, genuine LP2 key or continuation is recovered.** The [fully executable source-native CJS](../sims/lp2_stage10_magic7_cross13_ftransparent_original_sft.cjs) asserts the original inputs and applies all four frozen inverses. Its complete assertions were executed against live repository source data in this invocation (including 95-rune positive plants), and the file was committed intact. This gate is a targeted alternative to the prior seven-number center-*row* test, not a search over square orientations or tuned phases.

## Historical, human-visible premise

The authentic 2014 OpenPuff recovery from *Interconnectedness* yields the 745-byte `resources/cicada2014-openpuff-magic-squares.txt`, SHA-256 `9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f`. The [earlier original-carrier synthesis](2014-stage11-133-331-prime464-original-gate.md) establishes its seven-by-seven, row-sum-1033 square and its center331. The manuscript's original p0 has two prominent cross ornaments plus the independently verified **13 red GP29 runes**, printed as two words of lengths eight and five before a 13-dot mark. Its word GP-prime sums are 347 and315, or 331±16, matching the magic square's center and middle-row endpoints. The existing [source connection](lp2-stage11-html-p0-red-title-331-16-link.md) records those correspondences.

A distinct conditional possibility is the **center cross of the original seven-by-seven square**, comprising seven horizontal and six additional vertical cells, precisely thirteen source numbers. The cross numbers sum to **1,735**; this also equals **five times the first red word's prime sum 347**. The equality is exact original arithmetic but was observed retrospectively and is not an authorship probability. Neither the square nor an authenticated Cicada instruction specifies treating these arms as a key, which arm is read first, or which ciphertext consumes it. The human-plausible finite alternative is worth rejecting once, without freely fitted options.

The original middle row is `16 65 270 331 270 65 16`; the middle column is `190 47 114 331 114 47 190`. Read each natural printed arm top-to-bottom or left-to-right, omitting the duplicated center from the second arm, and reduce the resulting **13 values mod29**, giving two fixed candidate keys:

- Horizontal then vertical: `[16,7,9,12,9,7,16,16,18,27,27,18,16]`.
- Vertical then horizontal: `[16,18,27,12,27,18,16,16,7,9,9,7,16]`.

The same source inputs were already used in an earlier **seven-number center-row** GP29 test, [`sims/lp2_stage10_magic7_p0_centerline_source_sft.cjs`](../sims/lp2_stage10_magic7_p0_centerline_source_sft.cjs). This check differs by the newly motivated 13-cell cross and explicitly implements the full authentic **plaintext-F transparency** branch rule from the solved p56 cipher.

## Complete original-cipher result

Each candidate key repeats after thirteen consumed plaintext **non-F** runes; for each original ciphertext rune C, the inverse takes either `P=(C±key[consumed mod13]) mod29` with **P nonzero** and increments the clock, or when **C=0** may emit literal plaintext F and leave the key clock untouched. Every ambiguous F branch is retained in a dynamic set of exact consumed-key counts; a failed state set is a mathematical contradiction independent of a language score.

The original red title's exact 13-runic ciphertext is `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. Each fixed mode permits two legal red-title readings, neither of which constitutes a recognizable source-native English heading. For the full **729-rune** original p0–p2 visual chapter, and independently for black p0–p2 body **716 runes** with a fresh key clock and the untouched **1,145-rune** next p3–p7 chapter, exact possible-path exhaustion occurs at:

| Center-cross reading | Inverse arithmetic | Full original p0–p2 reach /729 | Black after red title, fresh clock /716 | Original p3–p7 fresh clock /1,145 |
|---|---|---:|---:|---:|
| Horizontal then vertical | subtract key | **45** | 17 | 7 |
| Horizontal then vertical | add key | **29** | 9 | 55 |
| Vertical then horizontal | subtract key | **143** | 10 | 7 |
| Vertical then horizontal | add key | **88** | 1 | 1 |

Each forward encoder also encrypts the independently clear original p57 **95 GP29 runes** under the exact proposed 13-symbol key and real plaintext-F bypass, and its matching inverse remains viable over **95/95** for every mode. The test separately asserts the forward emitter's exact outputs. These controls show that the original failures result from impossible full-cipher paths under the *specified operation*, rather than mishandled F clock decisions.

**Decision and limit:** All four direct cross13 periodic additive transfers from the historical square fail on the original LP2, without any possible decrypting F skip schedule, despite successful planted controls. This eliminates this specific physically motivated cross-to-periodic-key inverse. It does **not** exclude the center-cross as a coordinate selector for a different first-party operation, or a historical key supplied by external missing infrastructure. Its 13-cell and 1,735 arithmetic correspondences remain provisional source observations, without an authenticated cipher consumer. Do not rescue the negative by selecting rotations, phases, novel arbitrary numeral functions, or supplementary layers after inspecting the output. A genuinely new original instruction is required to justify a different use.
