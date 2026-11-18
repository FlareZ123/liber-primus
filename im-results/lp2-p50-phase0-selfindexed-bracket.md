# Phase-zero global rune clock self-indexes the unique p50 43-token bracket

**Agent3 independent exploration, 18 November 2026. Classification: exact source-structural alignment. It strengthens the bracket selector and the phase-zero clock jointly; it does not provide a payload operation, key, or unknown plaintext.**

## Exact invariant

The established p50 repeat work uses the source-natural continuous clock

`phase = global unknown-rune index mod 256`

starting at the first p0 rune. The p50 numerical field contains exactly 256 printed tokens, so this clock can be evaluated at the manuscript location where the numerical field interrupts the rune text.

The canonical source counts are:

- p49 starts at global unknown-rune offset **12048**;
- p49 contains **66 runes** before the ten-dot mark and numerical field;
- the numerical field is therefore inserted after rune offset **12114**;
- physical p50 contains no runes;
- the first post-table p51 rune resumes at the same global offset **12114**;
- **12114 mod 256 = 82**.

Original p50 cell **82** is exactly the left outer marker of the independently visible unique nested token bracket

`3L 3D [43 tokens] 3D 3L`

occupying cells **82..128**. Its inner markers are cells83 and127, and the strict 43-token interior is cells84..126. The center is global cell **105**, whose printed token is the table-global unique **`13`**.

The nested equality condition itself is unique: among every consecutive 47-token table window, cell82 is the sole start satisfying `token[0]=token[46]` and `token[1]=token[45]`.

Thus the already-frozen phase-zero rune clock, without a phase search or token-value decoding, sends the **physical insertion point of the 256-cell field to the field's unique outer bracket start**.

## Why this is different from the earlier 43-token selector

The earlier bracket handoff reached `3L/3D` through a provisional GP-prime page-address construction and then interpreted the bracket as a 43-unit payload. Director #1627 explicitly refused to assume that route.

The alignment here uses only:

1. the original p0-p49 rune counts;
2. the fact that the table has 256 cells;
3. the continuous phase-zero clock already singled out by the independent adjacent-doublet/leading-zero statistic;
4. literal token equality in the unchanged 32x8 table.

It does not use the provisional 58-page addressing map, the p50 numeral radix, p55, the 2016 43-word count, language scoring, or a target plaintext.

The chronology and post-selection caveat still matter. The phase-zero clock and bracket were both discovered during broad exploratory research, and this self-indexing relation was noticed retrospectively. Treat it as an independent structural consistency check, not as a calibrated authorship probability.

## Additional boundary contacts

Two other physical page boundaries land on notable bracket cells under the same clock:

- p27 starts at global offset **6527**, phase **127**, the right inner `3D` marker;
- p28 starts at global offset **6761**, phase **105**, the unique center `13`.

These contacts are exact. They are weaker evidence because page boundaries are numerous and the current p27/DH route is under an independent familywise audit. They should not be used to bootstrap that route. The red-13 punctuation on p27 itself occurs at local rune19 / phase146, not at a bracket landmark.

The post-table p51 start has a separate source peculiarity: its first two ciphertext runes are identical, and p51 is the only one of the 55 rune-bearing unknown physical pages with an initial doublet. That doublet maps to cell82 because it begins at the insertion phase. Cell82 is outside the established leading-zero repeat class, so this single event did not create the low60 selected-state enrichment.

## Consequence

This supplies the source-visible bracket selector that was missing from the earlier provisional address route:

`global rune count to table insertion -> mod256 -> cell82 -> unique 3L 3D [43] 3D 3L bracket`.

It also gives the phase-zero clock an independent table-geometry consequence. What remains absent is the next operation. Existing work already rejects direct stationary table alphabets, cumulative-step stationary codebooks, multiple p50-to-p55 43-unit arithmetic consumers, and a direct typed-file reading of the 43 interior tokens. Therefore this result should **not** trigger another generic cipher sweep.

A productive successor must explain why a human solver, after reaching cell82, would know how to consume the bracketed 43 tokens. The strongest next evidence would be a first-party instruction or a reversible source operation whose input type is exactly a 43-token numerical vector.

Reproducer: `sims/lp2_p50_phase0_selfindexed_bracket_sft.cjs`.
