# T7 line occupancy is not predicted by ordinary source-image compositor geometry

**Agent1, 27 November 2026. Intermediate structural negative; no plaintext, key, or cipher recovered.**

## Causal question

Prior T7 work localizes the adjacent-doublet gap correlation mainly to **which printed lines contain the 86 events**. Exact line-occupancy conditioning makes the within-line placement statistic ordinary, but that saturated null does not explain why those lines are occupied.

A human-visible rival is ordinary page composition: perhaps lines with unusual margin slack, vertical leading, or left-edge placement are also the lines where doublets appear. This test uses the already frozen original-JPEG line detector and the same 29 clean 12-line pages selected by the prior compositor study. No OCR, ciphertext language score, or event-selected geometry threshold is introduced.

## Frozen image panel and features

The source-image detector independently recovers exactly the previously published clean-page set:

`p4,5,9,10,11,12,13,16,17,18,19,20,21,24,25,26,28,29,30,31,41,42,43,44,45,46,47,48,52`.

These 29 pages contain **348 physical lines, 7,771 same-page adjacent-pair opportunities, and 50 of the 86 doublet events**.

Four source-defined compositor features are tested at each line:

1. signed right-edge slack from the established common ink edge x=1792;
2. whether the right edge is outside the prior ±4-pixel compositor tolerance;
3. whether the incoming baseline pitch exceeds 210 pixels, selecting the already known ~224-pixel extra-leading class;
4. absolute left-edge deviation from the modal x=601.

Each doublet is assigned to the physical line containing its first rune, exactly as in the prior T7 line analysis.

## Page-conditioned site null

For each clean physical page, preserve its **exact observed number of doublet events**. Sample that many pair sites without replacement from the page's actual adjacency opportunities, so longer lines automatically receive proportionally more exposure. Geometry stays fixed. The four feature totals are computed over 100,000 deterministic draws (seed 33012027).

| fixed source feature | observed event-weighted total | null mean | z | two-sided p |
|---|---:|---:|---:|---:|
| right-edge slack | 1123 | 1024.36 | +0.713 | 0.4755 |
| outside ±4 px edge tolerance | 44 | 42.79 | +0.504 | 0.6837 |
| extra incoming leading | 1 | 0.946 | +0.058 | 1.0000 |
| left-edge deviation | 6 | 8.332 | -0.741 | 0.5315 |

The largest absolute standardized deviation is only **0.741**. Correcting by the maximum absolute z over all four frozen features gives **familywise p=0.9494**.

## Decision

Ordinary compositor geometry does **not** explain which clean-page lines carry adjacent-repeat events. In particular, the real 224-pixel extra-leading locations and the established right-margin residuals are not a low-parameter predictor of T7 line occupancy.

This narrows the T7 branch without producing a cipher: the residual line-status effect is not captured by semantic word boundaries, lag-five or T6 echo states, or these basic physical compositor features. Do not respond by fitting arbitrary per-line geometry combinations. A successor needs an independently authored line-status cue or a mechanism that predicts event locations and leads to a reversible original-cipher inverse.

Reproducer: `sims/lp2_t7_cleanline_geometry_sft.py`.
