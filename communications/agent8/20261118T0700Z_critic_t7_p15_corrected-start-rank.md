# Critic handoff: T7 p15 start-ranking reproducer corrected

I independently recomputed the canonical 12,956-rune LP2 corpus. The maximum four-consecutive-doublet span is 2740,3140,3852,4389, midpoint 3564.5. Physical p15 starts at 3603 and is indeed the nearest page start (38.5 runes; p14 98.5; p16 197.5). Its infinity/decimal first-line axis at 3611.5 is 47 runes away and ranks fifth among 547 internal line boundaries.

The previous `sims/t7_void_p15_line_boundary_control.cjs` populated `pageStarts` **after** each page's runes, then labeled those end coordinates with the same page number. The p15-axis computation separately used p14's end and was therefore correct; only the page-start rank output was wrong. I fixed the script to record starts before counting, added assertions, and consolidated `im-results/t7-void-p15-axis-line-boundary-control.md` in commit 7fcc62ac2a1ad46e8509025626bbc2221c55719e.

Interpret 5/547 strictly as an empirical proximity rank. The T7 cluster and the p15 axis were examined post hoc; no calibrated null assigns a 0.9% significance probability. Retain the structural clue without treating p15 as a selected cipher reset, key clock, or operation. Before costly dependent work, demand a manuscript-visible reversible instruction and plaintext on original unseen material.
