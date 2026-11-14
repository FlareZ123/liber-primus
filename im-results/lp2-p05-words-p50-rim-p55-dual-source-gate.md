# Joint LP1 p05 words and LP2 p50 rim: original p55 inverse

**Agent 34, 14 November 2026. Source-motivated, fixed original-input negative.** No unknown Liber Primus plaintext, actual key, or final destination recovered.

## A precise human-visible three-object route

Three source artifacts have independently established 76-entry lengths. In the original LP1 p05 *Some Wisdom* 5×5 figure, the 13 printed nonnumeric word cells contain 76 GP29 runes when read across rows. The original LP2 pp49–51 number table contains 32×8 cells; its outermost perimeter has 76 numbers. The moth-linked terminal LP2 p55 has exactly 76 ciphertext runes. The 2016 signed clue connects words, numbers and directions. The same moth appears on original LP1 p05 and LP2 p55. Combining the earlier words with the later numeric circumference is therefore a candidate human operation rather than a freely selected 76-byte key. This three-way linkage is still speculative: no signed instruction tells the reader to add these two operands or treats the conventional base60 interpretation as uniquely authored.

Previous work separately tested the p05 word-tape and the p50 perimeter as p55 additive keys. This experiment tests one complete joint operation without tuning either independently.

## Frozen algorithm

Use original GP29 rune indices. Concatenate the LP1 p05 word cells in printed row-major order:

SHADOWS, AETHEREAL, BUFFERS, UOID, CARNAL, OBSCURA, FORM, MOBIUS, ANALOG, UOID, MOURNFUL, AETHEREAL, CABAL.

This creates exactly 76 GP rune indices W[i]. Convert the 32×8 original table using its documented conditional base60 alphabet, then traverse the exterior 76 cells clockwise from the upper-left, with corners once, giving numeric bytes B[i]. On all 76 original source runes C[i] of p55, decode by:

    P[i] = (C[i] - W[i] - (B[i] mod 29)) mod 29

This fixes one actual reversible GP29 operation. There are no alternate directions, rotations, start positions, fitted keys, selective cipher-F bypasses, text repairs, or transpositions. A printed word starts on p54 and continues into the first p55 rune; retaining all 76 ciphertext runes is a condition of this physical-page whole-rim hypothesis.

## Original result

| Input | GP29 index of coincidence |
| --- | ---: |
| Original 76-rune p55 | 0.037894736842 |
| Joint-tape candidate | 0.036491228070 |
| Genuine clear p57, first 76 runes | 0.059649122807 |

The entire decoded candidate transliterates to:

    GETHRDONGNHYLTHXNGTHHOEAWTUDRYTMDXGTIAWUMPWAEYIAHTRTOEEWIARNYLNHOENFLDMLTOETSAAJJAOEJPWWEX

This has no sustained intelligible GP prose and retains ciphertext-like rune frequencies. The forward inverse exactly reproduces all 76 original p55 cipher runes. The identical operation also encrypts and recovers all 76 independently clear p57 GP runes in a native-source positive plant. These prove implementation correctness, rather than identify a historical key.

**Decision:** retire this single printed-order two-source additive decoding of p55; retain the source-geometry observation. A new interpretation requires an independent original operation selector and recovered meaningful original plaintext, not a broadened menu of unfixed pad combinations.

**Reproduction:** [read-only original-source CommonJS test](../sims/lp2_p05_words_p50_rim_p55_dual_source_sft.cjs). Exact inputs: resources/liber-primus/lp2-corpus.json; resources/liber-primus/base60-grid.json; resources/transcriptions/lp1_wulfic_canonical.txt. Prior single-source gates: [p05 words](../sims/lp1_p05_wordcells76_p55_exact_sourcekey_sft.cjs), [numeric circumference](../sims/lp2_terminal_grid_border_ring_sft.cjs).
