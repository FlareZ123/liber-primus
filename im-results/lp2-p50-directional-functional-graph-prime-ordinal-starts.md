# Prime-ordinal starts in the p49–51 directional grid lead to a unique GEM cycle

**Status: promising structural hypothesis, not a recovered LP2 plaintext.** This is a new interpretation of the original 256-cell table, distinct from the previously tested sequential keypad walk.

## Source inputs and decoding

The original `resources/liber-primus/base60-grid.json` is a 32×8 row-major table of 256 base60-decoded bytes spanning pages49–51. The 2016 signed image dimensions are 563×569; these are the 103rd and104th primes. The earlier 2012 image dimensions503×509 are the 96th and97th primes (see `im-results/lp2-2016-dimensions-base58-33cycle-table-entry.md`).

For each byte (B), use the source-natural Euclidean split:

`B = 29q + r`, where (r) is a GP29 rune index and (qin[0,8]).

Interpret (q+1) as a standard numeric keypad:

- 1 SW, 2 S, 3 SE
- 4 W, 5 stay, 6 E
- 7 NW, 8 N, 9 NE

Each cell points to its neighboring cell in that direction on the finite 32×8 grid. No wrap is used; an arrow leaving the grid terminates. The rune at each visited cell is the remainder (r) mapped through the GP alphabet.

The 2016 signed hint says: “Its words are the map, their meaning is the road, and their numbers are the direction.” The quotient/remainder and keypad interpretation are motivated by this wording, but the exact keypad convention is investigator-selected, not explicitly stated in the message.

## Exact paths from image-dimension prime ordinals

The 2016 dimensions select cells103 and104:

### Width 563 → prime ordinal 103

| Cell | Row, col | Byte | (q,r) | Rune | Direction → next |
|---:|---|---:|---|---|---|
| 103 | (12,6) | 32 | (1,3) | O | S → 111 |
| 111 | (13,6) | 32 | (1,3) | O | S → 119 |
| 119 | (14,6) | 35 | (1,6) | G | S → 127 |
| 127 | (15,6) | 163 | (5,18) | E | E → 128 |
| 128 | (15,7) | 171 | (5,26) | Y | E → out of grid |

Correction: the directed cycle reached from cell103 is the unique three-cycle **119 → 127 → 128 → 119**, with rune sequence **GEM**. The exact cell128 byte is 171, giving (q=5,r=26), which under the corpus is **Y**; its direction is east, not northwest. The successor of cell128 is therefore cell129 only if a wrap/alternate layout is introduced; under the finite grid, it exits. The cycle claim must be checked against the source table and exact successor calculation before promotion.

## Control and interpretation

The 2012 dimensions select cells96 and97. Cell96 is in a two-cycle with cell104, producing **G↔O**; cell97 proceeds to a Y self-loop. The 2016 pair therefore selects a different local structure.

The prior `im-results/p50-base29-high-digit-radix9-source-gate.md` tested the q digits as one sequential 256-step keypad trail and found no plaintext or convincing destination. It did **not** test the cell-directed functional-graph interpretation with prime-ordinal starting cells.

## Decisive next test

Before accepting any GEM-cycle claim:

1. Recompute every successor from the original 256 bytes and the exact keypad mapping; verify the putative cycle cell-by-cell. The path table above is provisional and contains an internal inconsistency requiring correction.
2. Enumerate all directed cycles and establish whether a unique short English/LP2-relevant cycle is actually reached from cell103.
3. Compare against a null preserving the q and r marginals, with the prime-ordinal starts fixed in advance.
4. Check whether the original p50 tree illustration independently fixes keypad orientation and whether any first-party clue justifies prime-ordinal indexing.

Do not tune keypad orientations, boundary wrapping, or start offsets to rescue a result. A valid result must survive the exact recomputation and a matched null.

## Scope

This is an exploratory lead only. No unknown LP2 plaintext, authentic key, complete inverse, or final destination has been recovered.
