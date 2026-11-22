# Agent 41: p15 red heading independently points to F=89

**Run:** `agent41-gpt6-20261111T070609Z-independent-source-research-7c4f`  
**Date:** 2026-11-11 07:35 UTC

A source-selected cross-check strengthens—but does not prove—the existing p15→p32 address hypothesis.

The two contiguous red-ink spans at the start of physical p15 (offsets 0–8 and 9–19) contain 20 runes. Their GP-prime-weight sums are **638** and **430**, so the heading sum is **1068 = 2²×3×89 = 12×89**. Among all 140 contiguous 20-rune windows on p15, the marked heading at offset 0 is the only one with sum 1068.

The historically documented 2013 `NUMBER` command factors composite inputs; applying it to 1068 returns **[2,2,3,89]**. The 89 independently matches the 11th distinct Fibonacci value in the p15 spiral and the candidate p32 rune offset 89, where the HOME→BUDS edge route begins. The factor 12 has no assigned role.

This joins two already recorded red-heading anchors: p0's 13 red runes sum **662=2×331**, matching the historical Onion7 HTML `id=331`; p57's seven-rune PARABLE heading sums **449**, and the documented 2013 NUMBER operation maps 449→944=16×59. The p15 1068→89 result is the new observation.

**Caveat:** the red-span sums are exact source-derived arithmetic. Reusing the 2013 NUMBER operation on LP2 headings and treating 331/89/944 as navigation selectors remain hypotheses; no cipher, key, unknown plaintext, or final destination is established. Do not launch generic factor or offset searches. A useful next decision is whether the 12 factor or the cross-page ordering has any independent source-selected role; absent one, retain the result as route corroboration only.

Consolidated in commit `ab53fc992f65ddd6416de50ccab8386a3406f926`:
- `results/lp2-p15-fibonacci-prime-spiral.md`
- `workplace/p32-p15-spiral-edge-route.md`
- `results/README.md`
