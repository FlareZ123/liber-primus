# 2014 stage04 magic-square direction map: cell 6 Rad ↔ cell 7 Ac

**Status:** a reproducible cross-round fragment-structure hypothesis, including an exact 199 → empty fragment 6 / Ac fragment 7 bridge, alongside a bounded failed direct table transfer. No LP2 plaintext or authentic key has been recovered.

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


## 13-dot fragment bridge: the 199 / Ac route

The LP2 red-rune stream is partitioned by the **31 original 13-dot marks** into **32 red-rune fragments**. A fragment contains only red GP runes between consecutive 13-dot marks; an empty fragment means zero red runes, not a blank page. The exact 32 lengths are:

\`\`\`
[13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,
 0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0]
\`\`\`

The 2014 square has three distinct prime entries: **131, 151, 199**. For each prime \(p\), \(\phi(p)=p-1\). The two already-motivated alphabet/fragment moduli are 29 (GP symbols) and 32 (13-dot fragments). Map a prime entry to:

- GP label: \(\phi(p) \bmod 29\);
- one fragment index: \(p \bmod 32\);
- adjacent fragment index: \(\phi(p) \bmod 32\).

A zero residue is interpreted cyclically as fragment 32. All three prime entries select an adjacent pair containing one empty fragment and one fragment containing the corresponding GP label:

| Prime \(p\) | \(\phi(p)\) | GP label \(\phi(p)\bmod29\) | \(\phi(p)\bmod32\) fragment | \(p\bmod32\) fragment | Corresponding red-rune evidence |
|---:|---:|---|---:|---:|---|
| 131 | 130 | Eolh (X) | 2: empty | 3: 16 runes | X at position 12 |
| 151 | 150 | Cen (C) | 22: 8 runes | 23: empty | C at position 6 |
| **199** | **198** | **Ac (A)** | **6: empty** | **7: 11 runes** | **A is the first rune** |

The 199 result is unusually well anchored by independent clues:

1. The 2014 stage03 phrase “Patience is a virtue” gives \( \phi(761)\bmod29=6 \); the 2016 message date, 5 January immediately before Epiphany on 6 January, also selects 6.
2. The 2014 square's cell 6 is Rad and points east to cell 7, Ac; cell 7 contains the prime **199**.
3. \(199\bmod32=7\), \(\phi(199)\bmod32=6\), and \(\phi(199)\bmod29=24=\mathrm{Ac}\).
4. LP2 fragment 6 is empty; fragment 7 is exactly 11 red runes and begins **Ac**:

   \`A T X B M G IA S B X EO\`

The two 13-dot boundaries are on LP2 page 6 at normalized offsets 71 and 82; the Ac rune begins at offset 71. This is consistent with the 2016 message's empty-path wording and its oak image. The same one-based cell-to-fragment alignment also makes every node in the two 2014 direction cycles correspond either to an empty fragment or to a fragment containing that cell's GP label; this is secondary evidence, not an independently selected test.

**Controls and statistical limits:** the same residue rule applied to all 13 distinct square values yields only **5/13** one-empty/one-label pairs (272, 131, 151, 199, 91). A deterministic 500,000-permutation null over all 32 fragment records has mean **2.482** matches and tail probability **0.0862** for at least five. Conditional on selecting only the three prime entries and their fixed adjacent fragment pairs, the exact permutation probability for all three one-empty/one-label matches is **0.01774**; this is *not* a global p-value and does not correct for selecting the prime subset or the arithmetic rule after inspection. The result is therefore a promising, clue-constrained route hypothesis, not proof of intent or a decryption.

The 2016 “Beware false paths” warning may distinguish the externally selected 6→7 Rad→Ac route from other matching pairs; that interpretation remains conjectural. The next useful question is what the 11-rune Ac fragment instructs a solver to do, and whether the other prime-linked pairs are deliberate decoys or part of a larger route. Do not turn this observation into an unconstrained cipher or offset search.

## LP2 table selector suggested by the same cells

The selected source numbers also satisfy:

```
366 mod 8 = 6
199 mod 8 = 7
```

Read as zero-based column indices, these select columns **7 and 8** in the printed 32×8 LP2 numeric table. This is a plausible cross-round selector because the table has eight columns. It also happens to select the same pair with the lowest normalized adjacent-row variation in [the existing all-28-pair screen](grid-two-column-serial-order.md): (T=1.4505445), familywise permutation tail (631/100001=0.00630994). **Do not count these as independent confirmations:** the low-variation pair was discovered by scanning all 28 pairs before this modulo-8 cross-round link was noticed. The modulo-8 interpretation is a new hypothesis, not an authenticated column instruction.

There is a natural indexing ambiguity. Treating the 1-based cell numbers 6 and 7 directly as 1-based table columns selects printed columns **6 and 7**, not 7 and 8. Both interpretations were tested below.

## Rad↔Ac as a 32×8 table coordinate: bounded negative

The 2014 edge can be read as a coordinate in the original 32×8 LP2 table without a fitted transform: Ac=24 as the row and Rad=4 as the column gives row-major index 24×8+4=196. The original byte there is **176**, or **2 mod 29**. The signed 2016 image dimensions independently select offsets 563 mod 256 = **51** and 569 mod 256 = **57**, whose table bytes are **59** and **118**.

A tempting “numbers are direction” interpretation is to treat each byte as the next table index. It is not selective. Starts 51, 57, 196 and the transposed-coordinate control 152 all enter the same 11-cycle:

247 → 192 → 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247.

That cycle's functional-graph basin contains **252 of 256** cells. Convergence from the source-selected starts is therefore expected for almost any start and does not define a route or event mask. The selected coordinate and dimension offsets are exact arithmetic, but their pointer-walk interpretation is rejected. This is distinct from the already rejected φ(byte)/bearing transfer above. Reproduce with [agent38_issue18_rad_ac_projective_gate.cjs](../sims/agent38_issue18_rad_ac_projective_gate.cjs).

## Direct LP2 direction-field transfer: bounded negative

The simplest transfer of the 2014 map to the original 32×8 table was fixed before inspecting any route output:

1. For each positive table byte (b), assign the GP label (φ(b) mod29), using the same mapping as the 2014 square.
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

The 2016 image is a dead-oak illustration, not a verified geographic photograph. The Uncovering Cicada Wiki attributes it to [this ClipartBest oak image](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg). Treat the oak as a symbolic Ac pointer: Ac is also the first red rune in the 199-selected seventh fragment. Do not infer a physical starting location from the image.

The 2016 message's instruction that words are a map, meanings a road, and numbers directions is compatible with the 2014 matrix interpretation. However, the angle convention is an inference, not a proven instruction. Using compass bearings (0° north, clockwise) does not produce the cell-6 → cell-7 oak connection. The archived 2016 message also ends “Beware false paths,” so semantic and geographic matches require a source-fixed stopping rule.

The direct byte-as-bearing transfer to the LP2 numeric table remains rejected. The 199/Ac fragment bridge is a stronger source-constrained human solve-path hypothesis, but it does not yet specify a reversible cipher, recover plaintext, or establish the destination. The separate use of columns 7–8 as key/state material remains untested and must not be conflated with the fragment-index result.

## Reproduction

Run from the repository root:

```sh
node sims/2014_magic_square_direction_map.cjs
```

The script checks the 1033 magic square, recomputes the `φ(n) mod29` rune labels and eight-direction graph, derives both natural table-column interpretations, reconstructs the 32 red-rune fragments from the original ink annotations, tests the three prime-entry residue pairs, and reproduces the exact conditional and seeded permutation nulls using only Node's standard library and pinned source resources.

## Source links

- [2014 stage04 extraction instructions](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04/README.md)
- [2014 archived walkthrough and extracted 5×5 matrix](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/archives/scream314/2014.md)
- [2016 signed message](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2016/hello-the-path-lies-empty.asc)
- [2016 image archive entry](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/archives/scream314/assets/2016/4gq25.jpg)
- [2016 image's reported oak-clipart source](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg)
- [Original table order and 28-pair scan](grid-two-column-serial-order.md)
- [LP2 13-dot red-rune source annotations](../resources/liber-primus/lp2-ink-annotations.json)
- [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json)
- [Existing 2016/2014 selector hypothesis](../workplace/2016-epiphany-2014-onion-path-hypothesis.md)
