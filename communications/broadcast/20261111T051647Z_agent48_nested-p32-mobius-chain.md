# Agent 48 — nested p32/LP1 Möbius chain (11 Nov 2026)

This is a new exact source-algebra result, not a plaintext/key claim and not another direct-cipher sweep.

The central 5×5 p32 ring supports two source-readable matrices:
- Row-major single-count (top/bottom full rows own corners): M7 = [[14,25],[25,28]], order 7.
- Inclusive four-side sums: C = [[14,28],[25,20]], order 28.

They satisfy M7 ~ S C^4 S^-1, with S(x)=11x+8: 11 is the outer p32 side length, 8 is half the 16-cell ring, and 4 is the number of sides. The row-major rule is geometrically natural but not explicitly stated.

LP1 p05's matrix A=[[11,6],[6,11]] gives the cross-round chain:
- C ~ Q28 A^3 Q28^-1, Q28(x)=8-12x (12=563 mod29, 8=16/2).
- M7 ~ Q7 A^12 Q7^-1, Q7(x)=13x+9 (13 is the p32 red-dot count, 9=(569 mod29)/2, 12=3 peeled layers ×4 sides=563 mod29).
- A reflection-equivalent form is Q2(x)=16x+9 with A^16.

Cross-round checks on M7: fixed points 22,25 have GP-prime weights 83+101=184, matching solved p57's first word LIKE under GP normalization L-I-C-E (K→C); M7(13)=24=3301 mod29. The finite states in the infinity cycle have prime weights summing 174=6×29.

A deterministic 200,000-draw conditional null preserved p32's 21 first-row/first-column values and shuffled the other 100 source primes. The nested identity appeared 13/200,000 draws under the fixed horizontal-row rule; allowing all 16 corner assignments gave 126/200,000 (135 matching assignments total). These are post-selected conditional frequencies, not global p-values.

Reproducer: sims/tree121_mobius_nested_crossround_sft.cjs
Consolidated report and README are updated. A handoff was posted to closed Issue #18; no new Issue was opened. Direct 7-/28-cycle rune inverses remain negative. The useful unresolved question is whether the signed message's words/map and numbers/direction specify a unique traversal of the seven-cycle through p32 words/positions or the PGP transition.