# Five large black circles on solved LP2 p56: exact constellation-shape gate

**Evidence class:** original-image/source-motivated, bounded visual interpretation negative with one provisional historical motif. **No constellation is identified and no unknown plaintext, cryptographic key, or destination is recovered.** A specific 1504 Vespucci 3+2+6 star-group hypothesis is tested below; it does not produce a scale-faithful map or a decipherment. This concerns the **five large, round black dots** beneath the known hash text of physical LP2 p56 (combined original `73.jpg`). They are distinct from the 13-dot red punctuation stencils on p56 and elsewhere and from the p33 horizontal three-dot divider already examined in [the earlier three-dot study](p33-three-dot-constellation-screen.md).

## Why a player could try stars

The five isolated dots lie beneath the solved p56 deep-web hash instruction. A [2019 interview with the unverified claimed insider gHOST3301](https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/) discusses "Constellations" and specifically mentions p56 and a separate earlier numbered page. That claim is **not independently authenticated** and supplies no named constellation or reproducible decoder. Combined with the five source dots, however, it suggests the affordable test: does the actual five-point geometry single out a five-star figure? A concrete, independently source-selected star identification would be more useful than interpreting the numerals arbitrarily, particularly if it could select a direction, date or celestial position before any rune decoding.

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

## Specific historical source test: Vespucci's 1504 3+2+6 sequence

The original [1504 *Mundus Novus* edition](https://archive.org/details/mundusnouus00vesp) describes three successive southern-sky groups: **three stars forming an orthogonal triangle** (9.5°), then **two other stars** (12.5°), then **six further stars** (32°), alongside three Canopus-like nebular features. This is a much more specific human-solver lead than an unconstrained five-star search: the LP2 emblem has a visible **3+2** arrangement. The [2026 reconstruction by Neri](https://arxiv.org/abs/2604.11826) proposes β Hyi, α Hyi and α Tuc for the first group; γ Hyi and α Ret for the second; and α/β Cen plus α/β/γ/δ Cru for the six-star group. The original 1504 text does not name these stars; those identifications are modern reconstruction, not first-party Cicada evidence. The authenticated 2016 Cicada message's “words/map, meaning/road, numbers/direction” wording is thematically compatible, but it does not name Vespucci or supply a mapping to runes.

### The three-dot triangle is not a unique star identifier

For the first three p56 dots, the measured page-triangle angles are **92.76°, 49.09°, 38.15°**, with side ratios **0.618:0.768:1**. The Hydrus candidate triangle (β Hyi, α Hyi, α Tuc) has spherical angles **88.92°, 51.16°, 43.01°** and side ratios **0.669:0.768:1**. A shape-only Crux subtriangle (γ, δ, β Crucis) has **89.08°, 52.05°, 38.94°** and side ratios **0.628:0.788:1**. Under the same 1500-epoch equidistant polar projection and best similarity fit, the Hydrus triangle gives **4.50 px RMSE**, while the Crux subtriangle gives **1.18 px RMSE**. Thus the near-right geometry is compatible with more than one star set; it does not identify Hydrus by itself. The 9.5° statement in the historical text is the discriminator invoked by Neri in favour of β Hyi, but that angular measurement is not encoded by the three page dots alone.

### The complete five-dot emblem is not a literal Hydrus sky chart

Fit the Hydrus triangle to the first three page dots, then predict the two subsequent stars γ Hyi and α Ret using the same polar projection and similarity transform. Their predicted positions are approximately **(762, 2616)** and **(731, 2752)**, while the two remaining page dots are **(1408, 2747)** and **(1604, 2687)**. The nearest predicted-to-extra-dot errors are **659 px** and **673 px**. The 3+2 grouping may be schematic, but the five-dot emblem is not a scale-faithful five-star polar plot under this source sequence.

### Source-fixed overlays onto the LP2 map and numerical table

The star count and page structures invite two further tests, both frozen before reading outputs:

1. **p32 11×11 rune map:** place the south celestial pole at the centre cell (5,5), put RA=0 at the top, put east on the left, map the source group radii 9.5°, 12.5° and 32° to a five-cell radius, and round to the nearest cell. Read the eleven stars in source group order. The resulting GP tokens are **A, L, W, IO, IO, U, A, J, J, J, J** (joined transliteration: ALWIOIOUAJJJJ); the second group collides in one cell and four of the six outer-group stars collide in another. This is not plaintext and does not define a useful path.
2. **p50 32×8 numerical table:** select one-based rows **10, 13 and 32** from the rounded source radii and columns by nearest 45° RA octant, with east-left and clockwise N/NE/E/SE/S/SW/W/NW ordering. The eleven selected bytes are **[164,82,79,206,206,230,180,180,180,180,180]**. Applying the existing p32 byte compass decoder from its established H cell33 yields directions/distances **S20, E10, NW9, W25, W25, W28, S22×5** and returns to **H cell33**, not X cell37. The mirror-orientation control ends at cell86, also not X. All six outer-group stars collapse to the same table cell/byte under this 32-row/8-octant mapping.

These are source-constrained negative controls, not proof that no other interpretation exists. They do reject the obvious claim that the 3+2+6 sequence directly supplies a five-star coordinate chart, an 11-star p32 extraction, or an 11-step p50 compass route. The five-dot source candidate remains a **symbolic 3+2 motif hypothesis only**; it supplies no cipher key, rune interval, value-changing inverse, or recovered plaintext. The original-pixel transforms are consolidated in the [mirrored-emblem bridge](lp2-mirrored-five-dot-original-page-bridge.md); the separate 2016/p32 navigation route and its failed astronomical overlay are distinguished in the [ring-bridge report](lp2-p57-ring-totient-2016-wordmap-compass-bridge.md).

## Decision

**Retire generic five-black-dot→five-star-constellation matching under ordinary similarity geometry.** The five circles are genuine original source features, and Vespucci's 1504 3+2+6 sequence is a plausible historical motif, but the measured triangle is non-unique and the full coordinate overlays fail. Do not infer Orion, Cassiopeia, or a literal Hydrus chart from visual resemblance alone. The unverified 2019 interview remains unauthenticated; the Vespucci reference does not authenticate it or supply a decoding operation.

[Standalone exact CommonJS SFT](../sims/lp2_p56_fivedot_constellation_sft.cjs) reads only the pinned source catalogue and the frozen original-image centroid measurements. The source-specific astronomical overlay and its p32/p50 negative controls are reproduced by [the Vespucci star-map gate](../sims/lp2_vespucci_star_map_overlay_gate.cjs). It asserts the 89-feature/366-path census, the best original Orion residual and the full 120-arrangement null rank. The circle source coordinates can be recreated by the explicitly stated original JPEG threshold, ROI, connected-component and area rules using PIL/OpenCV. It does not reuse the already rejected p33 three-dot or LP1 five-by-five NGC-position experiments.
