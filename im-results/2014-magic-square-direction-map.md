# 2014 stage04 magic-square direction map: cell 6 Rad ↔ cell 7 Ac

**Status:** a reproducible cross-round source clue with a bounded failed LP2 transfer; not an LP2 decryption, authentic key, or destination.

## 2014 source and selector

The 2014 stage04 server-status reconstruction contains this 5×5 magic square:

```
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Every row, column, and principal diagonal sums to **1033**. The source is the stage04 README and archived 2014 walkthrough in [krisyotam/cicada3301, pinned commit 76d3ee8](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04).

Applying the established Liber Primus operation `φ(n) mod 29` to each cell turns the numeric square into a 5×5 GP transliteration map. Two adjacent cells are especially significant:

| Cell (1-based row-major) | Number | φ(n) | φ(n) mod 29 | GP rune | Traditional meaning |
|---|---:|---:|---:|---|---|
| 6 | 366 | 120 | 4 | Rad (R) | riding / road |
| 7 | 199 | 198 | 24 | Ac (A) | oak |

The selector is independently constrained. The 2014 stage03 comment is “Patience is a virtue”; its GP value is 761, and:

```
φ(761) = 760
760 mod 29 = 6
```

The 2016 message was published on 5 January, immediately before Epiphany (6 January). Both the historical phrase and the date therefore select **cell 6**.

## Direction-field test

Interpret the original magic-square numbers as angles, using the standard mathematical convention:

- 0° is east; angles increase counter-clockwise.
- Reduce angles modulo 360°.
- Quantize to the nearest 45° sector, matching the eight neighbours of a square grid.
- Rows increase downward; columns increase rightward.

This gives:

- Cell 6: 366° → 6° → **east**, pointing to cell 7.
- Cell 7: 199° → **west**, pointing back to cell 6.

The resulting functional graph has 17 in-bounds edges and 8 exits. Its directed cycles are:

1. **6 ↔ 7**, the unique reciprocal two-cell cycle: Rad ↔ Ac.
2. **12 → 16 → 17 → 23 → 24 → 18 → 12**, a separate six-cell cycle (Dæg → Gyfu → Eoh → Ing → Sigel → Mann).

The longer cycle remains part of the evidence; it is not silently discarded.

## LP2 table selector suggested by the same cells

The selected source numbers also satisfy:

```
366 mod 8 = 6
199 mod 8 = 7
```

Read as zero-based column indices, these select columns **7 and 8** in the printed 32×8 LP2 numeric table. This is a plausible cross-round selector because the table has eight columns. It also happens to select the same pair with the lowest normalized adjacent-row variation in [the existing all-28-pair screen](grid-two-column-serial-order.md): (T=1.4505445), familywise permutation tail (631/100001=0.00630994). **Do not count these as independent confirmations:** the low-variation pair was discovered by scanning all 28 pairs before this modulo-8 cross-round link was noticed. The modulo-8 interpretation is a new hypothesis, not an authenticated column instruction.

There is a natural indexing ambiguity. Treating the 1-based cell numbers 6 and 7 directly as 1-based table columns selects printed columns **6 and 7**, not 7 and 8. Both interpretations were tested below.

## Direct LP2 direction-field transfer: bounded negative

The simplest transfer of the 2014 map to the original 32×8 table was fixed before inspecting any route output:

1. For each positive table byte (b), assign the GP label (φ(b)mod29), using the same mapping as the 2014 square.
2. Treat (b) itself as an angle in degrees, quantized to the nearest 45° sector under the same 0°-east, counter-clockwise convention.
3. Follow the indicated eight-neighbour move in the printed rectangular grid. Moves beyond the grid exit; there is no toroidal wrap or fitted rotation.
4. Since (φ(0)) is undefined, zero-valued cells retain their 0° direction but have no GP label.

Results on the canonical original table:

| Tested region | Ac labels | Rad labels | Ac-to-Rad directed paths | Reciprocal Rad↔Ac cycles |
|---|---:|---:|---:|---:|
| Full 32×8 table | 18 | 14 | 3 | 0 |
| Modulo-8 selected printed columns 7–8 | 6 | 6 | 0 | 0 |
| Direct 1-based cell-number columns 6–7 | 7 | 1 | 0 | 0 |

The full grid has **11** reciprocal two-cell cycles, none labelled Rad↔Ac. The selected 32×2 columns 7–8 contain only **B↔F** and **S↔T** cycles. The alternative printed columns 6–7 contain **Thorn↔Rad**, **Haegl↔Beorc**, and **Gyfu↔Tir**, but no Ac-to-Rad path. Thus the direct transfer does not reproduce the source-selected Rad↔Ac cycle in either natural column interpretation. The three Ac-to-Rad paths in the full grid are non-reciprocal and do not select a unique route.

A planted 1×2 positive control with bytes [5,199] does recover Rad→Ac→Rad under the exact same `φ` and angle rules (`φ(5) mod29 = 4`; `φ(199) mod29 = 24`). This checks the graph implementation; it does not authenticate the transfer hypothesis.

**Decision:** the direct “table byte = bearing and φ(byte) = map label” reading is rejected for this LP2 table. The modulo-8 column selector remains an interesting but retrospective source alignment; it supplies no key, state, plaintext, or destination. Do not repeat this direct graph transfer or expand it into free rotations, offsets, or geographic searches.

## Historical interpretation and limits

The 2016 image is a dead-oak illustration, not a verified geographic photograph. The Uncovering Cicada Wiki attributes it to [this ClipartBest oak image](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg). Treat the oak as a symbolic Ac pointer; do not infer a physical starting location from the image.

The 2016 message's instruction that words are a map, meanings a road, and numbers directions is compatible with the 2014 matrix interpretation. However, the angle convention is an inference, not a proven instruction. Using compass bearings (0° north, clockwise) does not produce the cell-6 → cell-7 oak connection. The archived 2016 message also ends “Beware false paths,” so semantic and geographic matches require a source-fixed stopping rule.

This result does not establish that the 2014 square is intended as an LP2 key or that the LP2 table is a literal direction map. It only rejects the simplest direct transfer above. A distinct use of columns 7–8 as key/state material remains untested, but it would need an independently sourced operation and a reversible original-cipher prediction before further work is justified.

## Reproduction

Run from the repository root:

```sh
node sims/2014_magic_square_direction_map.cjs
```

The script checks the 1033 magic square, recomputes the `φ(n) mod29` rune labels and eight-direction graph, derives both natural table-column interpretations from cells 6 and 7, and runs the full-grid, selected-strip, alternate-strip, and planted positive-control tests using only Node's standard library and the pinned original grid/corpus resources.

## Source links

- [2014 stage04 extraction instructions](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04/README.md)
- [2014 archived walkthrough and extracted 5×5 matrix](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/archives/scream314/2014.md)
- [2016 signed message](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2016/hello-the-path-lies-empty.asc)
- [2016 image archive entry](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/archives/scream314/assets/2016/4gq25.jpg)
- [2016 image's reported oak-clipart source](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg)
- [Original table order and 28-pair scan](grid-two-column-serial-order.md)
- [Existing 2016/2014 selector hypothesis](../workplace/2016-epiphany-2014-onion-path-hypothesis.md)
