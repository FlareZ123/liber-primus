# Terminal p54–p55 32×7 and original p49–p51 32×8: all-affine channel obstruction

**Agent10, 28 November 2026. Classification: original-cipher all-key exclusion for a precisely typed finite-dimensional channel, plus two source-keyed negative inverses.** The 224-rune terminal layout remains interesting; this test proves no fixed row-affine conversion of the original p50 values into its 32 rows, but recovers **no authentic plaintext**, inventor key, or new instruction.

## Original-artifact motivation

The [p54→p55 source word-carry geometry](lp2-terminal-2014-magic-357-native-frame-hill-gate.md) fixes a disjoint terminal partition of exactly **9 + 224 + 75** runes: printed red9, black p54 body223 plus the one rune completing its last word on physical p55, and residual p55 tail75. Independently, the original LP2 p49–p51 numerical panel is exactly **32 rows×8 two-character tokens** (10+13+9 rows), with per-token values in the published base60 alphabet.

The nontrivial pairing **224=32×7** registers one seven-rune terminal row against each original eight-value numeric row **without selecting a shift, phase, target-language score or repaired transcript**. An elementary human operation on eight numeric columns is to take seven adjacent differences; a more flexible mathematical family is a fixed 8→7 GF29 affine map. If the p50 numbers themselves explicitly generate the p54/p55 rune payload under these mechanisms, the exact p50→terminal relation should survive without a guessed separate password.

The leading rival is simple dimensional coincidence: the p54 red heading, p55 physical word carry, and table row count come from independently created objects, and no text tells readers to align p50 and terminal rows.

## Key-independent finite-dimensional answer

For each of the 32 printed table rows let x_r denote its original ordered eight-token vector and y_r the corresponding seven-rune terminal segment. Test whether **any fixed but unknown 8×7 coefficient matrix A and optional fixed seven-coordinate intercept b** over GF29 can explain all 32 rows:

    y_r = x_r A + b  (mod 29).

The source's two long-established candidate numeral interpretations are tested independently: base60 and missing-f base59. To avoid falsely rejecting a source-native two-digit format, both individual **first printed digits** and **second printed digits** are also treated as independent complete eight-column predictors (a particularly direct possible human interpretation). The eight cases are all four representations with/without an intercept. Matrix A and vector b are **completely arbitrary**; this is not an attempted fitted key search, but exact linear algebra over every possible key in each family.

Every one of the eight original 32×8 predictor matrices has GF29 column rank8, rising to9 when the constant column is allowed. Augment the exact 32 source rows with each of the seven independent 32-long target rune-columns in turn. The rank **increases by exactly1 for every one of the 7×8=56 tests**. Hence **not one of the original terminal seven columns lies in the source column space** in any of the four interpretations, even with an intercept.

This excludes a fixed affine p50-row→terminal-row converter **for every possible A,b**, not merely for the historically proposed 7×7 square. It also automatically excludes a source-constant left/right application of the 2014 7×7 matrix to those derived seven outputs, because the 2014 matrix is invertible modulo29 and any constant linear mixing of the output columns stays in the same seven-column affine span. It does **not** exclude encryption with a second nonlinearly evolving key, row-dependent permutations, secret row alignments, different page boundaries, a nonlinear error-correction code or separate plaintext roles.

## Other original, exactly registered consumers

**Eight-to-seven finite differences.** For each original numeric row compute seven differences x[1]−x[0], ..., x[7]−x[6] modulo29, preserving the original p50 left-to-right order. Compared to the p54/p55 exact registered seven-run rows, only **4/224** coordinates match under the conventional radix60, or **11/224** under radix59. Flipping sign does not fix this: radix60 **6/224**, radix59 **7/224**. The source's natural immediate-difference codec fails in its literal form; it does not display a globally constant letter offset either (the residual offsets span all GP29 values).

**Explicit historical square plus seven of the eight numeric lanes.** The p40 final-section path already singles out p50 cell43 (row5,col3); deleting exactly p50 column3 from **every** original row leaves seven candidate key numerals. Combine this one unrearranged 32×7 source key with the authentic 2014 Stage7 middle **7×7 magic square**, testing both Hill orientations, both add/subtract signs, and the two natural orders (key before or after square inverse) = **8 source-registered inverses**. All give nonprose runes and near-uniform IoC **0.03291–0.03564** (original solved clear p57 = **0.06271**; original p54 = **0.03314**). Each candidate exactly re-encrypts the untouched original input. A genuine p57 rune-tape plant, encrypted under each same key/orientation/order and inverted, recovers all 224 planted runes exactly.

The “drop col3” choice is **conditionally motivated by an earlier p40 source interpretation, not an authenticated command** to throw away a column. No broad tuning or ranking of all eight possible dropped columns was used to rescue the negative.

## Decision

This newly registered p50→p54/p55 bridge provides a stronger **all-secret exclusion** for the obvious fixed linear consumer than another search over source table offsets: the entire 8→7 GF29 affine family fails with no unknown-key work. A genuine next step must specify **a different original clue-selected nonlinearity or an independent side channel**, rather than treating this dimension match as plaintext evidence. It does not show the two artifacts are unrelated, and the 9/224/75 source geometry remains intact.

Reproduce against the original 29-rune corpus, original p50 32×8 tokens and 2014 three-square text with [one self-contained Node22 SFT](../sims/lp2_p54p55_p50_32row_affine_matrix_source_gate_sft.cjs). Its output contains the complete eight rank gates, all eight exact square/key inverses and both original adjacent-difference comparisons. The supplied known p57-positive controls and forward re-encryption checks are in the script.
