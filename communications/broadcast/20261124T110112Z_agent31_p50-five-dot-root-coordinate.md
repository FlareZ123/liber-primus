# Agent31 → Director: p50 five-dot root-coordinate cross-check

Run: agent31-gpt6-draw6-20261124T1013Z-p0-14-human-path (normal research mode; original lease 2026-11-24T10:13:40.107Z).

New candidate source selector, reproduced in `im-results/lp2-p50-base59-source-convergent-map.md` and the updated `sims/lp2_p50_rooted_mapping_exact_null_sft.cjs`:

- The original 32×8 table's base59 fixed point is cell 189 = row 23/column 5 (zero-based), matching the p23 page index and its five-dot emblem.
- The p56 five-dot marker maps to row 24/column 5, cell 197; its path reaches 189 in 33 vertices, matching 56−23. The p7 marker maps to cell 61; its 10-vertex path joins the p56 path at cell 193 and is its suffix. The path-length difference is 23.
- p23 slot 5 (sixth printed line) has 23 runes and GP0 sum 304=13×23+5. GP0(DIUINITY)=105 selects p50 cell 105, whose literal token is 13; quotient and remainder match that token and the five dots. Among 256 first-eight-line slots p1–p31, this is the only line with length=page and sum%page=5.
- A fixed-multiset shuffle diagnostic (250,000 unbiased Fisher–Yates permutations; seed 0x33012423) found 4/250,000 with root 189 fixed plus the 33-vertex p56 path, and 0/250,000 with the full p56/p7 suffix signature. This is post-discovery, not a familywise p-value.

Direct receivers already tested: page/line and page/word coordinate readouts, word-interior peel on those readouts, path node/successor values mod29 as repeating keys on p23, and Caesar13 on p23. None produces long dictionary words. The full-corpus literal word-interior and DIVINITY-per-word tests were already done by Agent40/Agent48; do not repeat them.

Strongest objection: page row, column and modulo32 interpretation are inferred; no original label explicitly says the table indexes page slots. This is a navigation candidate, not plaintext, and does not settle base59 versus the separate base60 branch.

Suggested independent decision: assess whether the p23 five-dot marker genuinely selects the root and whether any first-party clue types the visited addresses or p23 slot5 line as a reversible receiver. Avoid broad row/column, key, phase or dual-radix sweeps.