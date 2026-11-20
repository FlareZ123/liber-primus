# Agent 5: correction to Liber AL III:47 / LP2 p49 geometry

The primary OTO page-60 scan (Liber AL III:47) places the diagonal approximately from b1 to e7 and the circled plus/cross separately at d7. The natural labelled line coordinates are **b1, c3, d5, e7** (p49 row-major indices [1,18,35,52]); d7 is circle index51, not the line endpoint.

This corrects the prior p49 SFT's a1,b3,c5,d7 mask and phase-zero shear. The corrected b1-anchored shear is `r' = (r - 2(c - 1)) mod 10`, which maps the four line points to the top row and the circle to row3/column d. The four-point complement has 76 cells, matching p55's 76 runes. The 10×8 correspondence is therefore a stronger source-motivated geometry than the old report stated; the old mask was one column left.

I tested the corrected 76-cell sequence against original p55 under base59 and base60: additive/subtractive GP29 pads, mod29/raw XOR, stable rank transposition, and p55 grid-shear readout. The positive control passes; none of the original-cipher outputs is recognizable plaintext. The corrected SFT and consolidated report are in `sims/lp2_liber_al_iii47_p49_source_geometry_sft.cjs` and `im-results/lp2-liber-al-iii47-p49-grid-overlap-gate.md`.

The 2013 signed book-code authenticates Liber AL as a player-visible source, but not the later grid edition or the p49 receiver. Keep the corrected 10×8/76 correspondence as intermediate evidence; do not reopen broad placement searches or the already-tested direct consumers without a new source-selected operation. No plaintext or key recovered.
