# Original LP2 large-dot glyph geometry: no distinct shape alphabet

**Original-image result, 18 November 2026 (Agent 2).** No unknown-page plaintext or key is recovered. This test asks one concrete, source-motivated question: do the *visible individual dots* in the manuscript's large 10/13/23-dot punctuation marks change their relative positions and thereby transmit an additional per-mark instruction or key symbol?

The complete **58 original LP2 JPEGs**, corresponding to repository archive files `17.jpg` through `74.jpg`, give **35 red large-dot glyphs**: **30 thirteen-dot, four ten-dot, and one twenty-three-dot**. All 35 independent page/size locations reconstructed directly from the color pixels agree *exactly* with the already documented original-image record in [the ink annotations](../resources/liber-primus/lp2-ink-annotations.json), including three ten-dot marks in unresolved p0–55, the 13+10+13-dot marks on solved p56, and the 13+23-dot marks on solved p57. The p7 black 13-dot glyph is outside the original red-mask experiment. The later full physical census and distance-rank extension below include it.

## Geometric test

Each original 2400×3600 RGB JPEG is thresholded to red ink, connected components satisfying a tight 8–12-pixel bounding box and 65–125-pixel area are retained, and their centers are spatially grouped using a fixed 95-pixel neighborhood. The dot count of each recovered large glyph is observed, without relying on transcribed rune offsets. To compare like-count glyphs, subtract each mark's own minimum center coordinates, order the points by vertical then horizontal position, and measure the largest range in the normalized coordinates at corresponding dot ranks.

| Printed glyph | Original red occurrences | Greatest per-dot horizontal range | Greatest vertical range |
| --- | ---: | ---: | ---: |
| 13-dot | **30** | **1.5 pixels** | **0.5 pixels** |
| 10-dot | **4** | **1.0 pixels** | **0.5 pixels** |
| 23-dot | **1** | not comparable | not comparable |

The dot-count families have the **same visible relative dot arrangement** throughout the original book to within pixel-grid alignment differences. The 13-dot glyphs retain 13 individual dots, and none has a distinct visible arrangement that could carry a grossly reoriented or permuted-dot instruction. The printed 10- and 23-dot symbols are genuinely distinct categories, already known from the original punctuation. The threshold and grouping also reproduce every expected red mark on the two solved LP2 pages, not just the unresolved pages.

## Research decision

Do not search for a 29-symbol secret alphabet in differing *relative positions* of individual dots inside the 13-dot or 10-dot punctuation signs: the signs have no distinguishable macroscopic positional codewords to read. The subsequent all-color distance-rank extension below also rejects robust rank variants. This does **not** test subtle within-dot JPEG-coefficient steganography, grayscale/color modulation, absolute page coordinates, exact typographic horizontal placement, the black p7 mark, or changing dot *counts* across events. Those are distinct carrier hypotheses and require their own source-selected decoding operation before a key search. The marks could still delimit cryptographic state or carry meaning through their **positions in the book**.

[Reproducer](../sims/lp2_large_dot_geometry_sft.py): one read-only Python file; Pillow, NumPy, OpenCV, scikit-learn; takes the original repository JPEG directory as its default input. Executed against the supplied original byte-identical JPEG archive with every count and coordinate bound passing. No original unknown ciphertext was altered.

## Distance-rank and common continuous stencil bound (Agent49, 25 November, Director #2843)

The earlier red-only geometry report and the [full physical census](lp2-original-dot-punctuation-physical-census.md) already reject a macroscopic dot-shape alphabet, including the black p7 exception. The genuinely additional question is whether raster-level changes permit a *stable distance-rank* channel. [Source-input SFT](../sims/lp2_dot_rank_geometry_sft.py), locally executed on the supplied original JPEGs, returns every native dot centroid and component bounding box with the optional output argument. No ciphertext is scored.

Using the first solved p56 mark of each size as reference, fixed left-to-right column ordering (15px nominal pitch, top-to-bottom within columns), translation only, or translation plus one isotropic scale, gives the following bounds:

| Morphology | All occurrences | Maximum point discrepancy, translation only | Maximum, plus scale | Minimum common-template per-axis error (x,y) |
|---|---:|---:|---:|---:|
| 13-dot (including black p7) | 31 | 0.654976 px | 0.654976 px | 0.375, 0.166667 px |
| 10-dot | 4 | 0.460977 px | 0.543742 px | 0.25, 0.125 px |

The last column is the optimum of a linear program, minimizing epsilon subject to |observed[i,j,d] - translation[i,d] - template[j,d]| <= epsilon, separately for x/y. All corresponding dot centers fit **one continuous stencil for each count, translated without scaling, within less than half a native pixel per axis**. This is a feasible common rasterization model, not a proof of the historical rasterizer or exclusion of deliberately encoded fractional-pixel residuals.

All 31 thirteen-dot marks share columns (4,5,4); all four ten-dot marks share (3,4,3). The 13-dot stencil has multiple dots on the same centerline ray and a central dot, so a strictly angular clockwise order is underdetermined at the ideal stencil. The 23-dot mark has three equivalent top-row starts. Row/column traversal yields the same topology for each count and adds no per-instance symbol. The p57 terminal 23-dot mark matches the first p56 thirteen-dot template extended by duplicating its center column twice at 15px pitch, moving the right column accordingly: maximum translated point error **0.575172 px**. This is a check of the previously recognized 5-column typography, not a novel key or an independent prediction of its count.

There are 3,003 comparisons between the 78 pairwise distances of a 13-dot stencil; 990 between the 45 distances of a 10-dot stencil. With a conservative 0.75px point perturbation budget, a distance-difference greater than 3px has invariant sign by the triangle inequality. **0/2,425** such 13-dot comparisons and **0/767** such 10-dot comparisons change sign across any same-count original instance. Counting even ties and near-ties, 182 and 34 comparisons respectively vary; those are within the raster uncertainty margin and no independent source chooses them as bits. A planted 4px one-dot movement fails the fixed geometry gate on both reference shapes.

The broad square-component/24px-neighbor detector independently returns the 36 documented large marks; the remaining components form 2,778 black singles, 7 black pairs, 6 black triples, 140 black four-dot groups, 35 red singles and one red four-dot group. These are a mixed ordinary punctuation/ink-component background, not individually labelled pure negatives. No background group reaches the eight-dot candidate threshold; this is an in-corpus specificity check, not an external false-positive estimate.

**Director decision:** close #2843 as a bounded negative. The equal-count marker arrangements provide no stable, source-distinguishable geometric alphabet under these readouts. Keep marker count, color, position and textual context separate. Reopen only if a first-party instruction selects a specific subpixel/residual receiver or a new independent physical channel. No unknown plaintext or key is recovered.
