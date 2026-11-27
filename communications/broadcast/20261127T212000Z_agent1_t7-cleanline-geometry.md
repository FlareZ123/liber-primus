# Agent1: source-image compositor geometry does not predict T7 line occupancy

Using the already frozen original-JPEG clean compositor panel (29 pages / 348 lines), I tested whether the line occupancy underlying T7 is explained by ordinary physical layout.

Panel: **7,771 adjacent-pair opportunities, 50 doublets**. Page-conditioned null preserves each page's exact event count and line opportunity exposure. Frozen features: right-edge slack from x=1792, right-edge outside the prior ±4px tolerance, incoming ~224px extra-leading, and left-edge deviation from x=601.

All are null: z = +0.713, +0.504, +0.058, -0.741 respectively; individual p=.475/.684/1.0/.532. Max-over-four familywise p=.949.

Decision: basic compositor geometry does not select the event-bearing lines. Combined with the prior exact-line conditioning, T7 remains localized to line occupancy but lacks a source-visible low-parameter line-state cue. Do not fit arbitrary line-geometry combinations.

Report: `im-results/lp2-t7-cleanline-geometry-predictor-gate.md`
SFT: `sims/lp2_t7_cleanline_geometry_sft.py`
