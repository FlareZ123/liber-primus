# Original LP2 large-dot glyph geometry: no distinct shape alphabet

**Original-image result, 18 November 2026 (Agent 2).** No unknown-page plaintext or key is recovered. This test asks one concrete, source-motivated question: do the *visible individual dots* in the manuscript's large 10/13/23-dot punctuation marks change their relative positions and thereby transmit an additional per-mark instruction or key symbol?

The complete **58 original LP2 JPEGs**, corresponding to repository archive files `17.jpg` through `74.jpg`, give **35 red large-dot glyphs**: **30 thirteen-dot, four ten-dot, and one twenty-three-dot**. All 35 independent page/size locations reconstructed directly from the color pixels agree *exactly* with the already documented original-image record in [the ink annotations](../resources/liber-primus/lp2-ink-annotations.json), including three ten-dot marks in unresolved p0–55, the 13+10+13-dot marks on solved p56, and the 13+23-dot marks on solved p57. The p7 black 13-dot glyph is deliberately **outside the red-mask experiment**; its existence and location remain documented in the source annotation.

## Geometric test

Each original 2400×3600 RGB JPEG is thresholded to red ink, connected components satisfying a tight 8–12-pixel bounding box and 65–125-pixel area are retained, and their centers are spatially grouped using a fixed 95-pixel neighborhood. The dot count of each recovered large glyph is observed, without relying on transcribed rune offsets. To compare like-count glyphs, subtract each mark's own minimum center coordinates, order the points by vertical then horizontal position, and measure the largest range in the normalized coordinates at corresponding dot ranks.

| Printed glyph | Original red occurrences | Greatest per-dot horizontal range | Greatest vertical range |
| --- | ---: | ---: | ---: |
| 13-dot | **30** | **1.5 pixels** | **0.5 pixels** |
| 10-dot | **4** | **1.0 pixels** | **0.5 pixels** |
| 23-dot | **1** | not comparable | not comparable |

The dot-count families have the **same visible relative dot arrangement** throughout the original book to within pixel-grid alignment differences. The 13-dot glyphs retain 13 individual dots, and none has a distinct visible arrangement that could carry a grossly reoriented or permuted-dot instruction. The printed 10- and 23-dot symbols are genuinely distinct categories, already known from the original punctuation. The threshold and grouping also reproduce every expected red mark on the two solved LP2 pages, not just the unresolved pages.

## Research decision

Do not search for a 29-symbol secret alphabet in differing *relative positions* of individual dots inside the 13-dot or 10-dot punctuation signs: the signs have no distinguishable macroscopic positional codewords to read. This does **not** test subtle within-dot JPEG-coefficient steganography, grayscale/color modulation, absolute page coordinates, exact typographic horizontal placement, the black p7 mark, or changing dot *counts* across events. Those are distinct carrier hypotheses and require their own source-selected decoding operation before a key search. The marks could still delimit cryptographic state or carry meaning through their **positions in the book**.

[Reproducer](../sims/lp2_large_dot_geometry_sft.py): one read-only Python file; Pillow, NumPy, OpenCV, scikit-learn; takes the original repository JPEG directory as its default input. Executed against the supplied original byte-identical JPEG archive with every count and coordinate bound passing. No original unknown ciphertext was altered.
