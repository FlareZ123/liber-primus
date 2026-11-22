# P50 32×8 rowwise polynomial receiver under the printed circumference

**Decision (22 November 2026): reject the literal rowwise GF257/GF29 polynomial code.** The original p50 32×8 byte table has 180 interior cells and 76 exterior cells. Clear p57's instruction to “shed our own circumferences,” plus the terminal 180 solved GP29 runes and p55's 76 unknown runes, motivate a bounded, previously distinct construction: treat each **printed 8-cell row** as one codeword; its six interior columns could determine its two exterior parity cells. This is a direct 6-of-8 Reed–Solomon-shaped receiver, rather than the previously tested single degree179 180-to-76 global polynomial (#2144) or a horizontal row0-as-share-coordinate model.

The test respects the actual printed coordinate order, which requires no guessing: in **each** of the original 32 rows, fit a degree≤5 polynomial through columns1,2,3,4,5,6, then predict original border columns0 and7. Use GF257 to preserve every original 8-bit numeral, and GF29 because the manuscript's GP29 alphabet and previously reported p15/p39 polynomial relations are field29. A separate degree≤4 control fits columns1–5 (historical 2013 Cicada 5-of-10 sharing precedent) and predicts columns0,6,7. One- versus zero-based horizontal coordinates are algebraically equivalent translations and therefore have the same fit, so cannot rescue a mismatch.

| Field | Polynomial degree | Original withheld positions | Exact predictions |
|---|---:|---|---:|
| GF257 | ≤5 | 32×2 perimeter cells | **0/64** |
| GF257 | ≤4 | 32×3 (one interior + two perimeter) | **0/96** |
| GF29 | ≤5 | 32×2 perimeter residues | **3/64** |
| GF29 | ≤4 | 32×3 withheld residues | **5/96** |

Every row fails the full parity equation in both models. An independently planted complete synthetic 32×8 grid with actual polynomial rows reconstructs all intended parity cells exactly (positive test). A polynomial generator reproducing synthetic data does **not** authenticate historical encoding.

This specifically retires unmasked, independent rowwise degree4/5 systematic polynomial parity for original p50's printed coordinates. A separately selected nonpolynomial transform, hidden per-cell masks, nonlinear outer/inner coupling or an independent key could still link p50 and p55, but **none is supplied by this test**. No unknown LP2 plaintext is recovered.

**Reproduce:** \`node sims/lp2_p50_inner6_outer2_row_polynomial_sft.cjs\`. Inputs: \`resources/liber-primus/lp2-grid-256.json\` (original-image-checked numeral readings). The same exact 32×8 circumference is visible on original LP2 image files p49–p51.
