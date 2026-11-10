# 2014 stage04 magic-square direction map: cell 6 Rad ↔ cell 7 Ac

**Status: intermediate cross-round hypothesis; not an LP2 decryption.**

## Result

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
2. 12 → 16 → 17 → 23 → 24 → 18 → 12, a separate six-cell cycle (Dæg → Gyfu → Eoh → Ing → Sigel → Mann).

The longer cycle must remain visible in the evidence; it is not silently discarded. The cell-6/cell-7 pair is specifically the only mutual two-cell connection.

The 2016 image is a dead-oak illustration, not a verified geographic photograph. The Uncovering Cicada Wiki attributes it to [this ClipartBest oak image](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg). The archived 2016 JPEG is 563×569 and contains no EXIF/XMP/IPTC/ICC/comment metadata or trailing payload. Treat the oak as a symbolic Ac pointer; do not infer a physical starting location from the image.

## Why this is worth pursuing

The 2016 message instructs the solver to interpret words as a map, meanings as roads, and numbers as directions. The 2014 matrix provides all three ingredients under one established operation:

- `φ(n) mod 29` gives GP runes/words.
- The rune meanings give semantic labels such as Rad (road) and Ac (oak).
- The original numbers give a direction field.

The Epiphany/PATIENCE selector points to cell 6, and the only reciprocal two-cell connection from that selected cell is Rad → Ac → Rad. The 2016 oak image independently agrees with Ac. This is a specific, reproducible cross-round alignment, not a recovered LP2 plaintext.

## Limits and falsification

The angle convention is an inference, not a proven instruction. Using compass bearings (0° north, clockwise) does **not** produce the cell-6 → cell-7 oak connection. The mathematical convention is favoured because it makes the selected cell's direction east, matching the adjacent Ac cell and the 2016 oak image. The nearest-45° quantization is motivated by the eight neighbouring cells of the square grid.

This does not establish that the 2014 square is intended as an LP2 key, nor does it identify a physical location. The earlier fixed test treating all 25 values as bearings selecting perimeter runes from the LP2 15×15 red matrix was negative. The earlier direct transfer of the 2014 Vigenère key `WELCOME PILGRIM TO THE` to LP2 was also negative.

## Reproduction

Run from the repository root:

```sh
node sims/2014_magic_square_direction_map.cjs
```

The script checks the magic constant, recomputes `φ(n) mod 29`, builds the 8-direction graph, enumerates all directed cycles, and asserts the cell-6 Rad ↔ cell-7 Ac pair.

## Next research decision

The useful next question is not another key sweep. Determine whether this selected Rad–Ac pair supplies a reproducible entry/exit rule for a specific LP2 structure—especially the 32×8 number table or the p49–p55 material—without introducing free rotations, arbitrary offsets, or a guessed geographic destination. Any proposed continuation should predict an untouched sequence or independently identifiable plaintext.

## Source links

- [2014 stage04 extraction instructions](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04/README.md)
- [2014 archived walkthrough and extracted 5×5 matrix](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/archives/scream314/2014.md)
- [2016 signed message](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2016/hello-the-path-lies-empty.asc)
- [2016 image archive entry](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/archives/scream314/assets/2016/4gq25.jpg)
- [2016 image's reported oak-clipart source](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg)
- [Existing 2016/2014 selector hypothesis](../workplace/2016-epiphany-2014-onion-path-hypothesis.md)
