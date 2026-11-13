# Original 32×8 table as ciphertext-feedback GP28 state lookup

**Classification: one bounded, source-readable direct inverse, negative for native GP plaintext.** No unknown LP2 plaintext, original cipher key or destination was recovered.

## Why this is a motivated one-step operation

The physical table across pp49–51 has 32 rows and eight columns. A GP29 ciphertext rune selects a row without truncation (indices0–28 fit in32). A printed visual macro-chapter ordinal selects one of the eight columns. The independently observed p3 root15 powers motivate a GP28 nonzero-step operation, with a transparent GP-EA branch for adjacent-equal ciphertext. Unlike the older `grid_cprev_lookup_sigma.cjs`, this rule uses the direct primitive-root logarithm without learning any outer alphabet from English. The original puzzle does **not** instruct the solver to select rows by previous ciphertext or to combine that with root15.

Eight visual macro-chapters across original p0–53, source boundaries `[0,729,1874,3603,5506,6527,7960,9640,12648]`, are assigned original table columns0–7. The terminal p54–55 308-rune ninth unit has no ninth key column and is kept separate. At each macro-chapter start, P0=C0 is an unchanged seed. For each subsequent original GP index Ci, compute `D=(Ci−Cprev) mod29`. If D=0, output GP EA (index28). Otherwise let `K=grid[8*Cprev+macroChapter] mod28` and output `Pi=(log15 D−K) mod28`. Reencoding the original ciphertext requires only the preceding emitted ciphertext and the same fixed source cell.

## Exact original-cipher results

| Macro-chapter | Original runes | Decoded GP29 IoC |
|---:|---:|---:|
|0|729|0.035084942|
|1|1145|0.035337588|
|2|1729|0.035165371|
|3|1903|0.035242378|
|4|1021|0.035009890|
|5|1433|0.035013664|
|6|1680|0.035209450|
|7|3008|0.035193370|

All eight decoded transcripts remain nonlinguistic and have GP29 coincidence near uniform, not native GP English. There is no key selection or message content. The [single-file CommonJS reproducer](../sims/lp2_grid_cprev_column_root15_gp28_sft.cjs) asserts the complete original 12,956 rune input, 256 printed table values, exact forward reencryption of every 0..53 original GP rune, primitive-root15 order28, all eight decoded IoCs, and authentic 95-rune solved-p57 GP plaintext plants under each of the eight source columns.

**Decision:** This self-contained ciphertext-feedback row/section-column table lookup supplies no valid original plaintext. The table geometry remains useful as an operand, but moving row selection, adding an outer secret substitution or tuning the clock cannot be justified by this negative alone.