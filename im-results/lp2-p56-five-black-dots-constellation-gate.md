# Five large black circles on solved LP2 p56: exact constellation-shape gate

**Evidence class:** original-image/source-motivated, bounded visual interpretation negative. **No constellation is identified and no unknown plaintext, cryptographic key, or destination is recovered.** This concerns the **five large, round black dots** beneath the known hash text of physical LP2 p56 (combined original `73.jpg`). They are distinct from the 13-dot red punctuation stencils on p56 and elsewhere and from the p33 horizontal three-dot divider already examined in [the earlier three-dot study](p33-three-dot-constellation-screen.md).

## Why a player could try stars

The five isolated dots lie beneath the solved p56 deep-web hash instruction. A [2019 interview with the unverified claimed insider gHOST3301](https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/) discusses "Constellations" and specifically mentions p56 and a separate earlier numbered page. That claim is **not independently authenticated** and supplies no named constellation or reproducible decoder. Combined with the five source dots, however, it suggests the affordable test: does the actual five-point geometry single out a five-star figure? A concrete star identification would be more useful than interpreting the numerals arbitrarily, particularly if it could select a direction, date or celestial position before any rune decoding.

## Original-JPEG dot extraction

From `resources/liber-primus/73.jpg` (2,400×3,600 px), use grayscale intensity below **130** within the frozen ROI **x=700..1899, y=2350..2849**. Apply eight-connected-component labelling and select foreground areas strictly between 150 and 4,000 pixels. The original image yields five approximately circular components of 3,542–3,623 black pixels each, with the following centroids in ascending x:

| Dot | x (px) | y (px) |
| ---: | ---: | ---: |
| 1 | 873.345787 | 2517.000000 |
| 2 | 921.226708 | 2708.058724 |
| 3 | 1103.934251 | 2447.301489 |
| 4 | 1408.121998 | 2747.286227 |
| 5 | 1603.870144 | 2686.500000 |

These are directly measured source-image positions. Equal-looking circular dot sizes are not evidence of stellar magnitude encoding.

## Frozen source catalogue and fit

Use [the existing pinned d3-celestial constellation line catalogue](../resources/control/d3-celestial-constellation-lines.json) with its [source/licence declaration](../resources/control/d3-celestial-lines-SOURCE-LICENSE.txt), containing 89 constellations. Extract every contiguous five-star window from each explicitly drawn catalogue polyline: **366** candidate five-point paths. This excludes freely selected noncontiguous five-star sets and branched five-node subgraphs. Transform right ascension into a local planar x-axis using `RA · cos(mean declination)`, unwrap RA across ±180° within each path, and use declination as y.

Fit the **same frozen family** for every candidate: all **120** assignments of the five unlabeled dots, both handedness choices, arbitrary 2D translation, rotation and *uniform* scale. No nonuniform scaling, shear, individual star movement, changed original dot selection, historical date fitting, or invented star labels. Report Procrustes residual `sqrt(1 − rho²)` after centering and normalizing both five-point sets to unit sum of squares, where `rho` is the optimized magnitude of 2D complex correlation. A perfect similarity match has residual zero.

On the five actual dots, the best of **366×120** candidate comparisons is an **Orion** subpath (source contiguous five-star window starting at zero-based local position 1), residual **0.16892398**. The conspicuous **Cassiopeia** W-like five-point sequence has residual approximately **0.26695589** under the same generous unordered similarity fit. Neither provides a source-authenticated identity.

## Exact constellation-search-adjusted comparison

A visually irregular set of five dots can fit some constellation well after searching hundreds of five-star patterns and every dot assignment. To test whether the apparent best match selects anything, keep **all five measured x coordinates and all five measured y coordinates fixed**, but independently permute which y belongs to each x. Enumerate **all 5! = 120** such arrangements, including the original. For each arrangement rerun the entire **366×120** constellation and correspondence search.

| Exact source-conditioned comparison | Residual (lower is better) |
| --- | ---: |
| Original five-dot drawing | **0.16892398** |
| Null minimum | **0.05586508** |
| Null median | **0.13143532** |
| Null maximum | **0.19117511** |

**109 of 120** x/y rearrangements fit **at least as well** as the source drawing, an exact conditional fraction **0.90833**. The original pattern is less constellation-like under this specific catalogue and similarity model than most arrangements with the same observed coordinate marginals. The best original name "Orion" is the result of optimization across all candidates; it is not an independent confirmation of Orion.

This is a source-conditioned shape control, not a population-level sky or artistic-drawing probability. A specific historically source-chosen constellation with a different map projection, selected stars, or deliberate nonlinear distortion is outside scope. Without such an independent selector, that flexibility cannot supply a decoding key.

## Decision

**Retire generic five-black-dot→five-star-constellation matching under ordinary similarity geometry.** The five circles are genuine original source features, but the full catalogue search gives no distinctive constellation, star-order key, astronomical coordinate, or useful decoding instruction. Do not infer Orion or Cassiopeia from visual resemblance alone. The unverified 2019 interview can motivate a future source-selected named-constellation test, but it cannot itself supply that name or create a positive result.

[Standalone exact CommonJS SFT](../sims/lp2_p56_fivedot_constellation_sft.cjs) reads only the pinned source catalogue and the frozen original-image centroid measurements. It asserts the 89-feature/366-path census, the best original Orion residual and the full 120-arrangement null rank. The circle source coordinates can be recreated by the explicitly stated original JPEG threshold, ROI, connected-component and area rules using PIL/OpenCV. It does not reuse the already rejected p33 three-dot or LP1 five-by-five NGC-position experiments.
