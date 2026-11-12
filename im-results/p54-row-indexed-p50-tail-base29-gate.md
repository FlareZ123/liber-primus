# p54 rune-address lookup into the p50 table tail

**12 November 2026 · Agent 13 · bounded source-selected negative.** No unknown plaintext, key, or final destination recovered.

## Human-solve-path hypothesis

A solver sees three unusually specific dimensions:
- p54 contains **232 GP29 runes**, beginning with the red rune Ac = 24;
- p50 is a 256-cell numeric table, and skipping 24 cells leaves **232**;
- the remaining cells form a **29×8** table, matching the 29-symbol GP alphabet and the eight red runes after Ac on p54.

The 2013 signed TCP challenge authenticates conversion of integers to BASE29 (the worked 3301 example is represented as 3QO). The 2016 continuation clue describes words as a map and numbers as direction. A plausible human route is therefore: use p54's eight-rune red heading as a stable column key, use each p54 rune index as a row address into the 29×8 p50 tail, then convert the selected 0–59 values to BASE29. The result could be a hidden readout or a key for the immediately following p55.

This is a motivated hypothesis, not a source-established instruction. Its strongest alternative is that the 232/24/29×8 dimensions are structural coincidences; neither the heading's stable-sort interpretation nor the use of every p54 rune as a row address is explicitly stated.

## Frozen operation

- Take the original p50 table bytes in printed row-major order and skip the first 24 cells.
- Reshape the 232-cell tail as 29 rows × 8 columns.
- p54's first rune is Ac24. Its next eight red runes are [19,21,23,27,2,14,10,19]. Stable ascending order with printed-order tie breaking gives column permutation [4,6,5,0,7,1,2,3].
- For p54 rune at position i, use its GP29 index as row and columnOrder[i mod 8] as column.
- Convert the selected table value to ordinary high-to-low BASE29 digits. Preserve p54 word and punctuation delimiters in the readout.
- As the immediate continuation test, use the first 76 BASE29 output runes as a continuous additive key for p55, testing both signs. No phase, offset, row permutation, alternate table orientation, or fitted key is used.

## Original-input result

The fixed lookup selects 232 table values and BASE29-expands them to **443 runes**. The word-preserving readout begins:

    THF-COEOEAUEAGETHYHUWSREA.GACCGIAUEOIAGIATHUREA-HBUD/
    F-UETHYUPGMHXUIA-GIRG-GUGCTHSGOTHEA-COEGIRY-ET-XGM/
    THEA-RAEUOOEAHTRIA-EAHSGGWGTHSWMTHOE-HDCIAUAE-OM/

The readout's IoC is **0.0558307713**, above the uniform GP29 baseline of **0.0344827586**. That increase is not language evidence: expanding small integers 0–59 in BASE29 creates a strongly nonuniform digit distribution. The delimiter-preserving text remains nonlinguistic.

The p55 continuation test also fails:
- original p55 IoC: **0.0378947368**;
- p55 decrypted with the first 76 readout runes using C−K: IoC **0.0301754386**;
- opposite sign C+K: IoC **0.0364912281**.

Neither word-preserving p55 output is readable. The known 95-rune p57 plant is recovered exactly under both configured signs, confirming the simple additive arithmetic.

## Decision and scope

**Retire this exact p54 row-address / p50-tail / BASE29 readout as a plaintext route and as the first-76-symbol key for p55.** Preserve the dimension match and the authenticated BASE29 conversion as observations, but do not rescue this operation with alternate matrix orientations, row permutations, free offsets, or arbitrary output transforms absent a new source-visible selector.

This does not reject every possible use of p54 or the p50 table. It rejects only the frozen row-address mapping, stable heading order, BASE29 expansion, and immediate p55 continuation tested here.

**Reproduction:** run the standalone Node.js script at sims/p54_row_address_p50_tail_base29_gate.cjs (Node.js built-ins only).
