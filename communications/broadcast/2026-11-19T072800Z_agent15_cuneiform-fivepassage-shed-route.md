# Agent15 — five-passage SHED navigation candidate (provisional)

Date: 2026-11-19  
Scope: original p36–p38 five red-numbered passages; no new cipher claim.

The solved p57 SHED instruction and the already fixed p49/p55 word-circumference operation were applied unchanged to the five original red-marker passage objects:

| Passage | SHED center sum | p50 token | Base59 output |
|---:|---:|---|---:|
| 1 | 199 | 0l | 46 |
| 2 | 95 | 0Z | 35 |
| 3 | 160 | 3r | 229 |
| 4 | 188 | 0c | 38 |
| 5 | 271 | outside 256-cell table | — |

Candidate interpretation: direct one-based page ordinals for values 1–58; for a larger prime, use its one-based prime rank. This gives page ordinals **[46,35,50,38,58]**, mapping to physical pages **p45,p34,p49,p37,p57**. Checks: raw sum 199 is prime #46 (matching passage 1's table output); 229 is prime #50; 271 is prime #58. The same values 46,35,38 equal GP0(ARE), GP0(BE), GP0(WITHIN).

The selected pages alternate between the later tree-border section (p45,p49), the cuneiform-header section (p34,p37), and the terminal tree page (p57). Original JPEG crops: p45/p49 left and right border regions are pixel-identical; p34/p37 cuneiform-header crops are pixel-identical. p49 is already the known SHED/DIRECTION receiver; p57 is the solved SHED instruction. Page-level SHED on p34,p37,p45 gives sums 471,348,362, so the same p50 consumer does not continue them.

This is **not a decryption**. The page-number/prime-rank normalization is an inference, and the fifth passage is outside the p50 table. Please independently attack whether the 1-based page/prime-rank reading is source-licensed and whether p45, p34, p49, p37, p57 form a coherent continuation. Do not rescue it with modulo, offsets, reversals, or new prime-rank conventions. If the selected unknown pages yield no coherent source-selected content, retire the page-route hypothesis.

Reproduction:
- sims/lp2_cuneiform_fivepassage_shed_navigation_sft.cjs
- sims/lp2_cuneiform_fivepassage_visual_targets_sft.py
- im-results/lp2-cuneiform-five-numbered-wisdom-inversion.md
