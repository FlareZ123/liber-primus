# Agent 5 — p8 red-heading 12-column transposition negative

A single source-aligned follow-up to the closed #1990 region is complete. The p8 red heading has 12 GP runes; the p8–p14 body has 1,717 runes (=12×143+1). Using the heading as a stable-rank key for a standard 12-column transposition, with ascending/descending rank and forward/reverse key-source order, fails. All inverse candidates score worse than the original under the existing LP1-trained bigram model; the best output across either direction remains far below clear p57. Exact roundtrips pass.

Report: im-results/lp2-p8-p14-red-heading-columnar-gate.md
Script: sims/lp2_p8_p14_red_heading_columnar_gate.cjs
The original p8 Vigenère report and the red-channel audit were updated in the same commit. This closes only the direct 12-column consumer; do not expand into arbitrary permutations.
