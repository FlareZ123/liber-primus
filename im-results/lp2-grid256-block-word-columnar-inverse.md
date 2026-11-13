# Original 32×8 grid geometry as a repeated whole-word transposition

**13 November 2026, Agent 46. Status:** source-shaped, exact reversible negative. There is **no recovered unknown LP2 plaintext, key, historical receiver, or authenticated transposition instruction**. The present test isolates one natural arrangement that was distinct from the earlier single 362×8 whole-book word-grid test.

## Human-source premise and direct decoding operation

Physical LP2 pp49–51 print a **32-row, eight-column** numerical table. The independently signed 2016 clue says the manuscript's words are a map and their numbers provide direction. The original unknown manuscript contains precisely **2,896 complete printed words** and **12,956 runes** across physical p0–55, with typographical line and page continuations merged. Although a direct relation between the table and whole-word reordering is hypothetical, the table's geometry specifies a finite, familiar **row/column transposition**, requiring no inferred cipher key or fitted word boundaries.

Write the original 2,896 printed words in consecutive blocks of 256 = 32×8. They form **11 full blocks**, followed by **80 words** forming a final 10×8 rectangle. Every source word is retained without editing its runes. Test precisely these two inverse orientations:

1. **Row-to-column:** write each block across eight columns and read down columns.
2. **Column-to-row:** write each block down eight columns and read across rows.

The last 80-word block remains eight columns wide in both readings. Resets occur at the **256-word boundaries indicated by the numerical table**, whereas the previously published [whole-book columnar gate](lp2-original-8column-wholeword-transpose-gate.md) treated the full 2,896-word inventory as one 362×8 rectangle and tested its own 40,320 column permutations. The new block reset changes nearly every word adjacency and is a distinct falsifiable candidate. Neither source authenticates a whole-word rather than letter-level transposition.

If the actual LP2 words are independently encrypted yet preserve original word lengths, restoring ordinary prose order should restore the language-dependent adjacency of short and long words. This provides a **key-independent necessary condition** without attempting to guess individual letters.

## Complete original-cipher test

The word parser preserves **32 complete words crossing physical pages** and reads rune-bearing p0–55 from the source transcript, with line wrapping ignored. The eight-column geometry divides the original inventory exactly, and direct source runes sum to 12,956.

Use the existing nine-class word-length independence Pearson χ² score: classes 1, 2, ..., 8, and 9+ GP runes. As in the earlier whole-book study, larger values indicate stronger adjacent-length dependence. The two transforms are implemented as exact array permutations and undo one another on every original slot.

| Original word order under test | Adjacent-length χ² |
| --- | ---: |
| Printed order | **68.2731863819** |
| Repeated 256-word row-to-column inverse | **73.8487356817** |
| Repeated 256-word column-to-row inverse | **59.9805896306** |

To calibrate the observed maximum without selecting a preferred reading after seeing the score, perform **5,000** seeded complete Fisher–Yates shuffles of the exact original 2,896-word *length inventory*. For every shuffled control, evaluate the best of printed, row-to-column and column-to-row scores. Seed **0x3301c0da**. The controls' optimized mean is **73.8615249410**; **2,348 of 5,000** equal or exceed the original optimized **73.8487356817**. The add-one familywise upper tail is **2,349/5,001 = 0.4697060588**. The original is unexceptional under the same three-way decision rule. This null preserves the original length distribution exactly; it does not need to assume a natural GP letter frequency or unknown secret alphabet.

## Complete independent English plants

Three nonoverlapping, fixed-length **2,896-word** passages from the repository's Shakespeare reference, starting at source word offsets 1,000, 12,000 and 24,000, are normalized under the documented native GP29 greedy digraph mapping (TH, NG, EO, OE, AE, IA, EA; QU→CW, V→U, K→C, Z→S). Each authentic ordered passage is separately scrambled by both 256-word transposition orientations, then **exactly recovered** by the opposing inverse on all 2,896 word positions. The language scores on the native ordered text and its scrambled forms are:

| Shakespeare window start | Original ordered χ² | Row-to-column scramble χ² | Column-to-row scramble χ² |
| ---: | ---: | ---: | ---: |
| 1,000 | **158.8048** | 72.6127 | 83.4766 |
| 12,000 | **145.7443** | 56.6882 | 68.0319 |
| 24,000 | **181.4373** | 59.7934 | 72.1537 |

All planted inverses reproduce every word exactly, and all three original-language windows produce scores above 140, while their transpositions score below 90. This is an independently sourced positive comparison for whether the test detects ordinary English word-order dependence. These native controls are not histogram-rank-matched to LP2; the **exact-inventory** original-cipher shuffle null above handles the manuscript's specific marginal lengths separately.

## Decision

**Retire the literal repeated 32×8 whole-word row/column transposition, including its final 10×8 block, as a standalone operation restoring ordinary GP-native English word ordering.** The original output behaves like the shuffled original inventory, whereas the independent English plants recover a strong language signal. The actual 256-cell table may still contain a different byte key, point to a rune-level transformation, or specify a more complex operation; this negative does not address any of those possibilities.

A successor would require a manuscript- or creator-supplied **word-to-cell assignment or different ordering rule**, followed by an exact whole-chapter output and a demonstrable plaintext/forward inverse. An additional free permutation search is unjustified by the two source-visible dimensions alone.

**Reproduction:** [one-file CommonJS original-source SFT](../sims/lp2_grid256_block_word_columnar_sft.cjs), using only existing repository inputs resources/lp2-transcription.txt and resources/control/shakespeare_first300k.txt. It fixes source counts and all three original χ² scores, runs the 5,000-sample familywise null, asserts the exact inverse in both directions, and plants and recovers three independent English windows.
