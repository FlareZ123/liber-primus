# Original pp49–51 numeric table: printed order and serialization gate

**Decision — Director Issue [#465](https://github.com/FlareZ123/liber-primus/issues/465), 12 November 2026.** The original scans establish one physical array of **32 rows × 8 two-character tokens**, printed across LP2 pp49–51. Its ordinary physical reading order is page order p49→p50→p51, top-to-bottom within each page, and left-to-right within each row. This fixes the 256-token *printed sequence*. It does **not** authenticate a separate cryptographic flattening, radix, byte alphabet, or consumer. No printed cue selects column-major, reversed, serpentine, page-local, or permuted alternatives. The bounded row/column-serialization issue is closed; the independent radix/alphabet question remains open under #466.

## Original-image layout

The original 2400×3600 scans are resources/liber-primus/66.jpg, 67.jpg, and 68.jpg. Direct inspection and a source-pixel row projection agree:

| Physical page | Original scan | Numeric rows | Tokens per row | Cells | Global physical cell indices |
|---|---|---:|---:|---:|---:|
| p49 | 66.jpg | 10 | 8 | 80 | 0–79 |
| p50 | 67.jpg | 13 | 8 | 104 | 80–183 |
| p51 | 68.jpg | 9 | 8 | 72 | 184–255 |
| **Total** | **66–68.jpg** | **32** | **8** | **256** | **0–255** |

The page breaks occur only between complete printed rows: after cell 79 and after cell 183. No token or row is split across a page boundary. The original row starts, measured in image y-pixels, are:

- 66.jpg: 1250, 1429, 1608, 1787, 1966, 2145, 2324, 2503, 2683, 2861.
- 67.jpg: 629, 809, 987, 1167, 1346, 1525, 1704, 1883, 2062, 2241, 2420, 2599, 2778.
- 68.jpg: 629, 809, 987, 1167, 1346, 1525, 1704, 1883, 2062.

These starts are reproducible from the original grayscale images by summing dark pixels (gray <110) in the central x=550…1849 crop, thresholding each scanline at 30 occupied pixels, and retaining contiguous runs of at least five scanlines in the numeric-table region. The row pitch is approximately 179 pixels. The existing original-image geometry reproducer independently detects 32 horizontal rows at thresholds 80, 110 and 150; its final p68 row is held out, and planted spacing/vertical-shift controls are detected.

Each printed row visibly groups eight two-character tokens across the same eight horizontal positions. The original glyph audit segments the full table as 512 glyphs / 256 tokens / 32 rows; one touching pair (0J, p51 first row) needs connected-component splitting rather than a simple horizontal projection. The table has no printed cell borders, but the stable token gaps and aligned positions define its eight columns.

## Original runic handoff around the table (14 November 2026 source clarification)

The **66** rune positions printed above the numerical rows on p49 (66.jpg) and the **92** positions printed below them on p51 (68.jpg) are adjacent to the table, but they are **not a self-contained 158-rune unit of complete printed words**. The original p48 last line (65.jpg) ends with eight runes of an unbroken word, transliterated `EO-F-U-D-Y-A-L-F`; the first and only first-rune fragment on p49 is `IA`, completing the nine-rune word `EO-F-U-D-Y-A-L-F-IA`. The text above the grid ends with the complete six-rune word `OE-EO-W-J-P-D`, followed by an original **red ten-dot punctuation mark at p49 local rune offset 66**. It is not the red thirteen-dot marker defining a top-level visual-chapter ending.

After the 32nd numeric row on p51, the first black runic text word is `W-W-P`, **without a new red heading or source-visible cipher-state instruction**. The last three runes on p51 are `P-L-F`; the first rune of p52 (69.jpg) is `P`, completing `P-L-F-P` across that physical page break. Neither the p49 pre-grid runic passage nor the p51 post-grid passage can be extracted as a complete standalone word sequence without changing the original printed boundaries. The table's 10 / 13 / 9 row breaks occur at complete numeric rows, and the adjacent text's physical-page word carries occur outside the table.

This is a **constraint on proposed consumers**, not a decoding rule: a table-as-key proposal must specify whether its clock follows complete words, only page-local runes, or the continuous p40–53 chapter. The straightforward 158-rune centred key hypothesis was already exhaustively tested under its explicitly conditional direct GP29 additive model in [the flank-pad gate](lp2-p49-p51-centred-grid-pad-gate.md), with nonprose output. The independently established **nine visual chapters** put the next top-level ending at p53, not at the internal p49 red ten-dot sentence marker. There remains no first-party instruction choosing a particular table cell, byte-to-rune transport, starting state, reversibility, or adjacent ciphertext consumer. Further unsourced centred windows and cipher-key enumerations are not justified by this layout.

Source witnesses: unchanged original `65.jpg`, `66.jpg`, `68.jpg`, `69.jpg`; canonical printed word/line/page delimiters in `resources/liber-primus/lp2-transcription.txt`; physical rune counts in `lp2-corpus.json`; original-image-adjudicated red marker `lp2-ink-annotations.json`. All page labels here are physical LP2 page numbers, with archive numbers +17.

## Reading-order cues and limits

- The printed rows are read conventionally left-to-right; the rows proceed top-to-bottom, and the physical pages proceed 49→50→51. The eight token positions recur across every row and all three scans.
- There are no row numbers, column labels, headings, arrows, directional glyphs, grid coordinates, or explicit “continued” marks inside the numeric array or at either page break.
- The red thirteen-dot punctuation mark on p49 is at the end of the preceding runic prose, above the numeric array. It is not embedded in a numeric row and does not identify a row/column traversal. The mirrored plant ornaments and small side dots on all three pages likewise do not point to a cell or distinguish an orientation.
- Therefore the source-visible physical order is the ordinary **page-major, row-major, left-to-right** sequence. Column-major, reverse, boustrophedon, page-local restarts, and arbitrary row/column permutations are post-hoc transforms, not alternate orders selected by the original artifact. No arbitrary permutation search was run.

The repository's resources/liber-primus/base60-grid.json stores the 32×8 tokens in that physical order. Reshaping the page token arrays in resources/liber-primus/lp2-grid-256.json gives the same 256 tokens exactly (256/256 agreement). This is a consistency check between derived transcriptions, not an independent reading of every original glyph. Original-image adjudication separately resolves eleven historically disputed cells; the full-font check covers 509/512 glyphs with repeated same-position controls, while the three singleton glyph labels are handled by the documented manual image inspection. See the [original glyph audit](lp2-grid-11-original-glyph-adjudication.md).

## Cryptanalytic decision

The physical array fixes a natural 256-token row-major input, but does not itself say that each pair is a base-60 digit, a byte, or a cryptographic key element. The conventional base-60 alphabet in the derived JSON is not printed on these pages; the base-59/base-60 choice and any use of the resulting values remain conditional and are separately assigned to #466. Existing direct byte, minimal-row-record, and table-to-rune tests do not supply an independently source-selected consumer.

**Close #465 as a bounded negative for any additional source-prescribed row/column serialization or orientation.** Retain the exact physical row-major order and page boundaries above. Do not commission arbitrary transposes, reversals, or row permutations without a new original clue selecting them. This result recovers no unknown plaintext, key, cipher mechanism, or destination.

## Reproduction and source references

- Original scans: [66.jpg](../resources/liber-primus/66.jpg), [67.jpg](../resources/liber-primus/67.jpg), [68.jpg](../resources/liber-primus/68.jpg).
- Canonical printed tokens and page row counts: [base60-grid.json](../resources/liber-primus/base60-grid.json) and [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json).
- Full-table original-pixel glyph segmentation: [lp2-grid-11-original-glyph-adjudication.md](lp2-grid-11-original-glyph-adjudication.md) and [lp2_grid_fullfont_source_audit.py](../sims/lp2_grid_fullfont_source_audit.py).
- Row-band, proportional-spacing, and planted-geometry controls: [p50-original-jpeg-print-spacing-gate.md](p50-original-jpeg-print-spacing-gate.md) and [p50_printed_spacing_original_sft.py](../sims/p50_printed_spacing_original_sft.py).
- Distinguish the later 2014 solver-archive sexagesimal.bin transcription from the original LP2 print; it differs at ten token positions and is not an author-authenticated order selector: [2014 transcription source chain](cicada2014-sexagesimal-upstream-transcription.md).
