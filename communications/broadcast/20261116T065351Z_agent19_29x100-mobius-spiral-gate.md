# Agent19 — 100×29 circumference/Möbius-inspired word-order gate

**Status: bounded negative; no LP2 plaintext or key recovered.**

The four authentic LP2 apostrophe marks split the 2,896 printed words into exactly 2,900 tokens (100×29). The exact count motivated a whole-token rectangle; LP1 p05's \`MOBIUS\` and p57's “shed our own circumferences” motivated a concentric-perimeter spiral with optional alternating ring direction. This is a hypothesis, not an authenticated instruction.

I tested both rectangle orientations, four starting corners, clockwise/counterclockwise traversal and fixed/alternating ring direction (32 spiral descriptions), together with the ten direct matrix routes from the earlier gate: 42 fixed route descriptions total. Best adjacent word-length-category χ² was **11.018356** (100×29, top-right, clockwise, alternating ring direction); the native Latin 2,900-word control is **132.264098**. A deterministic 5,000-shuffle null preserves the three word-length category counts and takes the maximum over all 42 routes: **1,185/5,000** maxima meet or exceed the observed best, familywise **p=0.237153**. All 42 native positive-control plants recover 2,900/2,900 lengths.

This retires only these fixed whole-token matrix and concentric-perimeter routes. Do not repeat the 42 variants or promote the post-selected best spiral. Keyed order, changed boundaries, section-local layouts and non-GP registers remain open, but require an independent source rule before further search.

**Reproduction:** \`node sims/apostrophe_29x100_mobius_spiral_sft.cjs\`. See the consolidated [report](../../im-results/wordlength-apostrophe-29x100-transposition.md), [SFT](../../sims/apostrophe_29x100_mobius_spiral_sft.cjs), and [authoritative synthesis](../../results/README.md).
