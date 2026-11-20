# Liber AL III:47 × LP2 p49 10×8 receiver gate

**Status: intermediate, bounded negative. No plaintext or cipher mechanism recovered.**

## Hypothesis

The original Liber AL manuscript page 16 (Chapter III, verse 47) has an 8-column, 10-row ruled grid, a diagonal line of slope 2, and a circled-cross at d7. The existing source-geometry analysis in `sims/liber_al_iii47_10x8_shear_sft.cjs` fixes the natural zero-based line cells as a1, b3, c5, d7 and the shear phase as zero.

LP2's p49 numerical block is itself 10 rows × 8 columns (80 cells). Overlaying the two grids is therefore a plausible human-solver experiment. Removing the four line cells leaves 76 cells, matching both p55's 76 runes and the 76-cell perimeter of the full 32×8 p49–p51 table. These are equal lengths, not the same set of cells.

Primary source: [OTO scan of the original manuscript, page 60 / Chapter III vv. 47](https://lib.oto-usa.org/libri/images/liber0031/60.jpg). This is a hypothesis about how a solver might use the source; no Cicada-authored instruction has yet authenticated the overlay.

## Fixed mapping

- p49 table block: 10×8, 80 tokens.
- Source line cells: a1, b3, c5, d7 → zero-based indices `[0, 17, 34, 51]`.
- Circled-cross: d7, index 51, the endpoint of the line.
- Source-selected shear: `r' = (r - 2c) mod 10`; the inverse is tested only as the direction control.
- After shearing, the four line cells occupy the first four cells of row 0. Removing them leaves 76 cells; reading from immediately after the circled endpoint gives a 76-value candidate stream.

Selected line tokens are `3N, 3M, 3H, 0x`. Their values are `[203, 202, 197, 59]` under the provisional base60 alphabet and `[200, 199, 194, 58]` under the provisional f-omitting base59 alphabet. The source geometry does not decide between those radix interpretations.

## Tests and result

The reproducible SFT `sims/lp2_liber_al_iii47_p49_grid_overlap_sft.cjs` tests only the source-locked mapping above:

- Use the 76-cell complement as a GP29 additive/subtractive pad for p55.
- Interpret the circled-cross as XOR and test both modulo-29 XOR and raw byte XOR.
- Use the 76 numeric values as a stable rank-transposition key, in both directions.
- Place p55 into the 10×8 grid with the four line cells empty, then read it under the source shear and its inverse.
- Verify the additive-pad implementation with a synthetic positive control.

Neither radix nor shear direction yields coherent plaintext under these direct consumers. Raw byte XOR produces no coherent ASCII text. The rank permutations and p55 grid-shear readouts are also nonlinguistic. The positive control passes, so the additive inverse implementation is functioning.

## Interpretation

This is a new receiver test for the p49 numeric block and p55, distinct from the earlier application of the same III:47 shear to the p32/cuneiform tensor key. It establishes a concrete structural fit worth retaining: `10×8 - 4 line cells = 76`, matching p55 and the full table perimeter. It does **not** establish that the table is a key, that XOR is intended, that base59 or base60 is correct, or that p55 is a direct consumer.

Do not expand this into arbitrary keys, phases, or cipher families. Revisit only if an independent source supplies a different operation or receiver for the line/circle material. This intermediate result does not change `results/README.md`.