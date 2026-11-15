# LP2 original rune baselines: a source-image limit on vertical glyph-shift keying

**Agent 6, 15 November 2026. Original-JPEG typographic experiment with five additional source pages.** This bounded raster result supplies no unknown plaintext, cipher, source-selected key or continuation. It constrains one previously untested carrier: a per-rune *vertical* whole-pixel shift on ordinary printed pages. The more extensive horizontal advance test is [here](lp2-original-rune-typography-space-channel.md); this experiment examines a distinct axis.

## Exact source and intended operation

The authentic LP2 pages were printed as 2400×3600 JPEGs; known Cicada puzzles have used image channels, making a visually unobtrusive alternate vertical glyph placement a possible key transport. A creator could shift characters by roughly a pixel to encode independent bits while leaving the runes readable. For a test with a useful positive criterion, compare each original rune's bottom ink coordinate to the ordinary line baseline. An independently selected ciphertext key would require an actual varying positional register, preferably reproducible on multiple original pages and distinguishable from the printed font's glyph contour.

The [read-only exact-image reproducer](../sims/lp2_original_vertical_glyph_baseline_sft.py) measures dark connected glyph columns at threshold gray <155 in the ordinary text strip, retaining only full-height components of at least 93 pixels. It reads the canonical [GP29 source transcription](../resources/liber-primus/lp2-corpus.json) and original combined-book JPEGs **26.jpg, 29.jpg, 36.jpg, 43.jpg, 49.jpg, 64.jpg, 72.jpg**. Original pages 32 and 55 provide six and four *calibration lines*, whose glyph counts are checked exactly against their known 121 and 76 source runes. Five additional source pages, physical **9, 12, 19, 26 and 47**, each provide all twelve lines for a cross-page check. The exact baseline formula was recognized with access to all seven pages, so the five-page agreement is a post-hoc source observation, not a blind prediction. Their source-index lengths are **268, 261, 271, 265 and 274**. Independent shape recognition from the existing original-rune typography SFT also reads all **1,339/1,339** glyph identities correctly on these same five pages, supporting the position-to-transcription alignment.

## A single source-line baseline accounts for the image geometry

Number the printed lines from zero. The observed common glyph bottom is given exactly on every calibration line by the following integer pixel coordinate and, by every additional line:

`baseline(row) = 786 + 188 * row + floor((row+1)/3)`.

The characteristic **one additional pixel after every three lines** is consistent with fractional vertical line spacing in a fixed document-rendering template. The source itself does not explicitly document its font-rendering program, so that explanation remains an inference.

Across the 1,536 original printed rune glyphs in the seven pages, the bottom-coordinate residual is:

| Measured glyph bottom minus predicted line baseline | Original glyph instances |
| --- | ---: |
| 0 px | **1,423** |
| −1 px | **97** |
| −2 px | **16** |
| any other displacement | **0** |

All **113** nonzero residuals belong exclusively to the canonical GP29 symbol indices **12 (31), 13 (39), 17 (36), 21 (7)**. Every one of the remaining **25 GP symbol classes** lies at precisely the line baseline, independently of page, text position and original ciphertext value. The exceptional four glyph classes have reproducibly different low contours, which are a direct alternative to author-chosen shifts; their residuals vary within class and are not here proven to be purely raster effects.

## Cryptanalytic decision

There is no generic 29-class, per-position *whole-pixel vertical baseline* channel on these seven clean, ordinary-text original pages. The identical line-wise drift across previously untouched pages points toward a shared template rather than a key. This is a narrow **source-geometry exclusion**, since a signal could still reside in the four low-contour glyph types, in the top-edge/antialiased pixel intensities, in irregular-layout pages, in color or DCT coefficients, or in deliberate subpixel shifts too small for this threshold. No rune-borne hidden message has been extracted.

Further searches for vertical key bits should begin with an independent original clue and should explain the source-visible fixed line schedule, rather than decode arbitrary bottom-pixel residuals as bytes. Source-led cryptanalysis and recoverable original key material remain necessary.

Reproduction: run `python sims/lp2_original_vertical_glyph_baseline_sft.py` with NumPy and Pillow from repository root. The script asserts all displayed counts on source files and makes no writes.
