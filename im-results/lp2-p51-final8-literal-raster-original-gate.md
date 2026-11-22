# The original p51 8×8 numerical square as eight 8-pixel glyphs

**Agent 9, 22 November 2026; Director #2206. Original-input finite negative. No unknown LP2 plaintext, original cipher, key, or instruction recovered.**

## An observable human route, and a competing explanation

The original pp49–51 numerals form 32 printed lines × eight two-character tokens. The final eight **complete printed lines of p51** (source scan \`68.jpg\`) form a literal **8×8-byte square**, zero-based table cells192–255. Cell192 is the first printed \`00\` token. This boundary and the second \`00\` at cell229 are literal original-image facts (see [the independent source geometry](lp2-p50-zero-suffix-p57-shed-ourown-original-gate.md)).

One ordinary computer-graphics interpretation of this 8×8 is an **eight-character, 8×8 bitmap-font row array**: expand the eight bytes of every source row into 64 horizontal bits. Each of the eight source columns supplies one 8-pixel-wide character cell. The author could have expected a solver to read a short word/opcode, exploiting the known 2014 pixel/image puzzle idiom. A second ordinary interpretation is an 8×8 grayscale pixel square with the 64 source byte values as intensities. The rival is a random-looking numeric block whose eight-column layout merely continues the table.

The independent source fixes the exact 8×8 boundary and row order. It does **not** independently select a byte radix, bit direction, threshold, scanline rotation, font, color mapping, or underlying rune decoder. Test only the two source-compatible numeral radices, both conventional within-byte bit orders, and direct grayscale. No binary threshold was tuned to find a shape.

## Exact finite input and receiver

Source bytes: [\`resources/liber-primus/lp2-grid-256.json\`](../resources/liber-primus/lp2-grid-256.json), whose entire 256-byte canonical base60 reading has SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. The source-compatible omitted-\`f\` radix59 convention is also checked because the original page does not authenticate a numeral alphabet.

For each of 25 original 8-row windows in the full 32×8 table, at printed row starts0–24 inclusive, test:

- **MSB-first** expansion: every 8-bit source value becomes left-to-right bits7→0;
- **LSB-first** expansion: bits0→7;
- **Literal grayscale**: eight rows × eight values, with intensities0–255, no threshold.

The final source window is row24, cells192–255. The first 24, rows0–23, are matched **source-original** nonfinal controls. All 25 original contexts are emitted by the SFT, not scanned to choose a winning image. Packing the 8×64 bits back into bytes recovers all 64 original values exactly under both conventions. An independently planted eight-row \`L\` bitmap round-trips exactly and has the prescribed MSB row values128 and252. These controls validate the bit geometry and inverse.

## Original outcomes

The complete two sets of eight 64-pixel raster lines in the SFT are irregular textures, with **no recognizably stable glyph or instruction** under either source-compatible radix and either bit direction. Direct 8×8 grayscale appears as high-frequency pixel variation without a readable picture. The four final bitmaps do not show the consistent eight-cell letter outlines or padding that would select a printed word.

Compare the terminal square against all 25 original windows, without tuning any threshold:

| Source-byte interpretation | Horizontal neighboring pixels equal, terminal raster | Terminal rank among 25 windows | Full-range nonfinal controls |
| --- | ---: | ---: | --- |
| Radix60 MSB | **0.486111** | 8/25 | 0.470238–0.517857 |
| Radix60 LSB | **0.476190** | 6/25 | 0.464286–0.511905 |
| Radix59 MSB | **0.486111** | 14/25 | 0.456349–0.498016 |
| Radix59 LSB | **0.488095** | 16/25 | 0.468254–0.505952 |

The terminal grayscale standard deviation is **67.676** in radix60 (rank4/25) and **66.591** in radix59 (rank5/25). These are not exceptionally image-like against other original contiguous windows. Only one of the eight candidate right-edge character-padding columns is blank in radix60/MSB; all other raster cases have zero blank right-edge columns. A conventional sequence of eight fully separated monospace 8×8 characters therefore does not emerge. These generic metrics do **not** prove no sophisticated graphical code exists. Source-original matched windows overlap and are *context comparators*, not independent null samples or significance tests.

For an inspectable eight-row, 64-bit source readout, the radix60/MSB terminal square starts:

    ........#..##.###..#####.#.##..##.##.....###..##.##.#..#..#.####

and radix59/MSB starts:

    ........#..##..##..###.#.#.##...#.#.##.#.###...#.##..###..#.###.

Both are followed by seven equally irregular raster rows, all emitted exactly by the reproducible SFT. A synthetic source-independent \`L\` plant proves this reader would preserve an ordinary unencoded glyph.

## Decision for #2206

**No original pixel-glyph or grayscale instruction is selected.** The literal terminal 8×8 is an authentic and potentially meaningful physical source object, but no unambiguous eight-character bitmap word, machine-readable marker, or typed GP29 value-change operator arises under these frozen direct reads. Therefore it would be unsound to transfer a private bitplane interpretation to the p49 or p51 flanks and claim a 150-rune plaintext inverse. Retire **only** the standard 8×8 byte-to-bit-raster and direct grayscale family, without inventing rotations, thresholds, alternate fonts, bitwise/XOR masks, or selected row subsets. A fresh primary clue fixing a specific image operation would justify returning.

**Reproducibility:** [read-only Node22/CommonJS single-file test](../sims/lp2_p50_final8_raster_source_sft.cjs). It pins the canonical 256-byte SHA-256, checks the literal two zero-token coordinates, runs both radices and all 25 contexts, prints complete original rasters and grayscale statistics, performs exact byte-level inversion, and includes the independent positive pixel plant.
