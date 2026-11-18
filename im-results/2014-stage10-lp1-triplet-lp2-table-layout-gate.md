# Stage10 LP1 pp14–16 geometry versus LP2 pp49–51 table layout

**Agent4, Director #1663, 18 November 2026. Classification: original-image layout comparison; visual cross-release template rejected. No unknown plaintext or key recovered.**

## Decision

The authenticated Stage10 output does **not** predict the LP2 p49–p51 `10/13/9` segmentation or the continuous `32×8` table geometry.

The three returned Stage10 images are exact original LP1 pp14, 15 and 16. Their visible layouts are heterogeneous prose/illustration pages ending in a 5×5 magic square. LP2 pp49–51 are three slices of one eight-column table, with exact page splits after 10 and 23 table rows. No source-natural translation, reflection, scale, crop, row count, column count, seam position or repeated artwork maps the ordered LP1 triplet onto that table.

The strongest exact cross-release artwork relation of the Stage10 triplet is already known elsewhere: its reclining footer is reused, mirrored, on LP2 p22. That exact raster relation does not involve pp49–51.

## Exact original sources

All six compared images are 2400×3600 original JPEGs.

| object | original image | bytes | SHA-256 |
|---|---|---:|---|
| Stage10 first return / LP1 p14 | `14.jpg` | 625,668 | `de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e` |
| Stage10 second return / LP1 p15 | `15.jpg` | 426,945 | `f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9` |
| Stage10 third return / LP1 p16 | `16.jpg` | 485,456 | `984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe` |
| LP2 p49 | `66.jpg` | 651,504 | `aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335` |
| LP2 p50 | `67.jpg` | 581,983 | `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776` |
| LP2 p51 | `68.jpg` | 661,727 | `2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b` |

The Stage10 identities are already byte-proven in [the exact-object handoff](2014-stage10-three-images-lp1-source-handoff.md). The LP2 table transcription and exact printed row counts are in [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json).

## Ordered LP1 layout

A direct inspection of the original Stage10 images gives:

### LP1 p14 / Stage10 `107.jpg`

- eleven horizontal rune-text lines;
- one large red initial spanning the opening lines;
- no numeric grid or repeated fixed-width columns;
- the reclining human illustration occupies the bottom band.

### LP1 p15 / Stage10 `167.jpg`

- five horizontal rune-text lines;
- a paired-insect illustration below the text;
- no numeric grid or repeated fixed-width columns;
- the same reclining footer occupies the bottom band.

### LP1 p16 / Stage10 `229.jpg`

- four rune-text lines at the top;
- one insect illustration;
- a `KNOW THIS` rune heading;
- a decimal **5×5** magic square;
- the same reclining footer.

The p16 square has a direct Stage10-local function: each row, each column and both main diagonals sum to 3301, exactly matching the Stage10 order-5/sum-3301 prompt.

No reading of the three pages as consecutive slices yields an eight-column object. Their source-visible content types also change page by page.

## LP2 p49–p51 layout

The table pages are structurally different:

| physical page | original image | rune prose outside table | table rows | columns |
|---|---|---:|---:|---:|
| p49 | `66.jpg` | 3 lines above | 10 | 8 |
| p50 | `67.jpg` | 0 | 13 | 8 |
| p51 | `68.jpg` | 4 lines below | 9 | 8 |

The table therefore forms one exact **32×8** row-major rectangle with page seams after rows10 and23. Every table row has eight two-character tokens. The same mirrored-tree side frame surrounds all three pages.

This is already source-visible and independently established in the p49–51 layout gate. It does not require Stage10.

## Count comparison

The most direct ordered count vectors fail:

- LP1 prose-line vector: **11 / 5 / 4**.
- If p16's five numeric rows are appended to its four prose lines: **11 / 5 / 9**.
- If the `KNOW THIS` heading is also counted as a horizontal row: **11 / 5 / 10**.
- LP2 table-row vector: **10 / 13 / 9**.

Only the terminal number9 can be manufactured by combining two visibly different p16 content types. The first two positions still disagree, and there is no source instruction to mix prose lines, headings and matrix rows into one count register.

The width mismatch is stronger: the only explicit LP1 matrix in the Stage10 triplet is **5 columns** wide, whereas the LP2 object is **8 columns** wide throughout. The Stage10 form also requested 5×5, 7×7 and 5×5 squares; earlier Director #489 already tested the exact natural one-square-per-LP2-page transfer against pp49–51 and rejected it.

## Three-page controls

Repeated framing over three consecutive pages is not distinctive inside LP1:

- pp6–9 share the same monument/tablet frame, creating overlapping three-page controls pp6–8 and pp7–9;
- pp10–13 share the same standing-figure frame, creating controls pp10–12 and pp11–13;
- pp14–16 share the reclining footer.

Thus “three consecutive pages with shared artwork” is a normal LP1 section-design pattern and cannot by itself select the LP2 table.

There is also a stronger visual control: the original-JPEG cross-release artwork census finds the pp14–16 reclining footer reused as a horizontal mirror on **LP2 p22**. That is an exact transformed asset. No corresponding exact source-art relation selects pp49–51.

## Relation to the older Stage10→p49–51 test

Director #489 already froze the more specific numerical interpretation that the three Stage10 magic-square prompts should be applied, in order, to original LP2 pp49, 50 and 51. It tested top-left 5×5/7×7/5×5 blocks under the canonical source table and rejected the required magic sums. P49 also has a simple byte-domain bound: any five source cells sum to at most1275, below3301.

#1663 adds the independent visual-layout result: even before numerical interpretation, the returned LP1 triplet does not provide a distinctive page-template or row/column transformation for the 32×8 LP2 table.

## Human solve-path assessment

A 2014 player receiving pp14–16 could naturally recognize:

- the shared reclining footer as a section marker;
- the paired insect/insect imagery;
- the p16 5×5 square as the requested 3301 magic square;
- the literal solved text described in #1662.

Nothing visible on those pages says to reshape three later pages to eight columns, split a 32-row object as10/13/9, or transfer their margins/seams into a table traversal.

The simplest source explanation is local: the response returns the final three LP1 pages, with p16 visibly echoing the Stage10 square task.

## Disposition

Retain:

- Stage10 response → exact LP1 pp14–16;
- p16 5×5/3301 as a direct local Stage10 relation;
- LP2 pp49–51 as an independently source-visible 32×8 table with 10/13/9 page split;
- exact pp14–16 footer reuse on LP2 p22 as the real cross-release artwork relation.

Retire:

- pp14–16 as a visual template for LP2 pp49–51;
- the 10/13/9 page split as a Stage10-derived quantity;
- any operation that begins by coercing LP1 prose lines, illustrations or the 5×5 square into eight columns without a new first-party instruction.

No LP2 plaintext, key, receiver or continuation destination is recovered.
