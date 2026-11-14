# LP1 magic square as an NGC sky map: internal and p56 five-dot tests

**Classification: two source-constrained, exact-control celestial-geometry tests; both fail as LP2 key or plaintext selectors. No unknown plaintext, creator-selected cipher or destination recovered.**

## Question and source-motivated route

The original LP1 scan `05.jpg` contains a concealed, reversible 5×5 numerical magic square. The 25 values and all 12 row/column/diagonal sums are already reproduced in [`jpeg05-palindromic-magic-square.md`](jpeg05-palindromic-magic-square.md). The 13 distinct cell values are all valid NGC catalogue numbers, and the magic constant 1033 is also NGC 1033. Separately, the 2019 gHOST interview (claimed inside status unverified) links the dots on page 7 / page 56 to constellations; page 7 in that interview's numbering is scan `05.jpg`.

A human could therefore try looking up the 13 NGC objects and interpreting the square as a sky-layout. This test asks whether the square's source cell adjacency places the NGC objects in an unusually compact celestial arrangement.

## Data and method

Coordinates, object types, and constellation codes are a 14-row subset (the 13 square IDs/plus NGC 1033) of OpenNGC `database_files/NGC.csv`, blob SHA `efa4b71036d8967c4c698a57fb0526288e201623`, licensed CC-BY-SA-4.0. OpenNGC documents RA/Dec as J2000 and the constellation field in `NGC_guide.txt`. The exact subset and attribution are retained in `../resources/control/openngc-square-subset.json`.

For each of the 40 horizontal/vertical adjacencies in the 5x5 square, calculate the great-circle separation between the corresponding NGC objects. The observed total is **940.165954°** (mean edge **23.504149°**; maximum edge **59.303604°**). The 13 objects comprise nine galaxies, two open clusters, one star, and one double star, spread across Andromeda, Cassiopeia, Cetus, Pegasus, Pisces, and Sculptor.

An unconstrained permutation screen (100,000 trials) makes the observed total look unusual: p≈0.0057 when permuting the 12 object labels across the 12 antipodal pairs with NGC 91 fixed, and p≈0.0059 when freely permuting all 25 cells while preserving multiplicities. **Those are not the appropriate discovery nulls**: both destroy the exact magic-square constraints that define the source object.

## Exact null conditioned on the magic square

Condition instead on all source-defined numerical structure:

- the same 13 values and their multiplicities;
- NGC 91 fixed in the centre;
- 180  rotational symmetry;
- all five row sums, five column sums, and both diagonal sums equal to 1033.

The symmetry and magic sums force four complementary pairs, each summing to 471:

- (130, 341)
- (151, 320)
- (199, 272)
- (226, 245)

The remaining four values are 18, 131, 138, and 366. Exhaustively assigning the four complementary pairs to the four forced pair-roles, their orientations, and the remaining four values to the remaining pair-roles produces **exactly 32** valid magic squares.

The source square has the **minimum** celestial adjacency total among these 32, but **four** matrices tie that minimum. All four are exactly the distinct dihedral (rotation/reflection) forms of the source square. Thus the exact conditional rank is **4/32 = 12.5%**, not a compelling statistical match. The unconditioned p≈0.006 is explained by ignoring the magic-square constraints and must not be reported as evidence for authorial intent.

## Independent original p56 five-dot geometry: exact cross-artifact test (Agent21, 14 November 2026)

The **same 2019 gHOST interview** specifically points toward the dots on solved LP2 physical **p56** and the earlier LP1 image containing the **5×5 magic square**. This supplies an external, albeit unauthenticated, reason to compare two actual 2014-era objects before looking at a cipher score. It is distinct from the existing generic constellation-catalogue test on p56's black dots, and from the above test of spatial compactness *inside* the magic square. The 2019 source is post-publication testimony, so a positive geometric match would still need a first-party operation selector.

The original solved p56 image (archive 73.jpg) contains **five large black circular marks** under the hash, distinct from the red punctuation and from the separate small five-circle ornaments on another page. Their previously measured native-image centroids, in ascending x, are **(873.345787,2517), (921.226708,2708.058724), (1103.934251,2447.301489), (1408.121998,2747.286227), (1603.870144,2686.5)**. The original LP1 magic square contains five numbered objects in each of its **five rows, five columns, and two diagonals**, giving exactly **12** printed-order candidate five-object groups without searching arbitrary NGC subsets. The actual ID matrix and OpenNGC J2000 subset used above are unchanged.

For each five-object group, project right ascension to a local tangent plane by multiplying it by cos(mean declination), keep declination as y, then minimize the five-point Procrustes shape residual under translation, uniform scale, rotation, reflection, and **all 120 dot assignments**. This generous fit removes arbitrary sky orientation and page magnification. Freeze all 12 source candidates before scoring the original five dots. Do not fit NGC catalogue IDs, a sky epoch, a hand-selected path, a page crop or individual star displacements.

| Complete original-source test | Result |
| --- | ---: |
| Source row/column/diagonal candidates | **12** |
| Dot assignments per candidate | **120** |
| Best actual p56 match | **middle row** NGC [226,245,91,245,226] |
| Best original normalized residual (zero is perfect) | **0.3221954527861324** |
| Exact control: rearrange the five observed y-coordinates across their fixed x-coordinates, re-optimize all 12 × 120 choices | **92 of 120** score **at least as well** as the actual drawing |
| Exact conditional rank | **92/120 = 0.7666666667** |
| Control median (min / max) | **0.3027059324** (**0.1757373791 / 0.3797349464**) |
| Independently planted rotated/scaled/shuffled real catalogue column | **0** residual after inversion |

The best original source row repeats NGC 226 and NGC 245, so it does not even specify five *distinct* celestial objects. The actual five-dot arrangement is **less sky-figure-like than most x/y reassociations under this exact conditioned family**. The planted source-derived positive confirms that a genuine exact similarity of the proposed form would be recovered. This original-input result identifies **no sky constellation, observable destination, key, reversible runic cipher, or unknown plaintext**. It excludes this bounded printed-row/column/diagonal direct-geometric relationship; a separately authenticated nonlocal cipher mapping is outside its scope.

**Reproduction:** [source-frozen CommonJS test](../sims/lp2_ngc_p56_dot_sft.cjs) reads only the previously pinned [OpenNGC subset](../resources/control/openngc-square-subset.json); its p56 dot centroids are reproduced from original JPEG pixels by [the separate p56 five-dot measurement](lp2-p56-five-black-dots-constellation-gate.md). The exact 120-case null and positive plant ran locally on Node.js 22 and passed the independent [Windows Node22 read-only GitHub Actions run 43651522953](https://github.com/FlareZ123/liber-primus/actions/runs/43651522953). No scan, transcription, source catalogue object, or artwork was edited.

## Decision

The NGC map is motivated by the source's printed square and the separate 2019 constellation suggestion. **Both exact finite interpretations fail to select a source-authenticated astronomical key:** its internal angular compactness has conditional rank 4/32, and its best five-object row/column/diagonal geometry versus the p56 black dots has conditional rank 92/120. Do not promote either to `results/` or launch unrestricted NGC, sky projection or dot-order searches. Reconsider only if a distinct contemporaneous instruction specifies an actual operand and readout.

The remaining useful follow-up is the independently clue-motivated comparison of the red 3×3 dot matrices on scan `05.jpg` and LP2 p56. That extraction remains blocked pending Agent21 / issue #3 authorization; this report does not extract or analyze those red-dot coordinates.

## Reproduction

From the repository root:

```sh
node sims/ngc_magic_square_spatial_screen.cjs
```

The script verifies the 12 magic sums, computes spherical great-circle distances from the retained OpenNGC subset, reproduces both diagnostic permutation nulls, and exhaustively enumerates the 32 magic-square-conditioned arrangements. It is dependency-free under Node.js 22.

## External source and license

- OpenNGC data: <https://github.com/mattiaverga/OpenNGC/blob/master/database_files/NGC.csv>
- OpenNGC field definitions: <https://github.com/mattiaverga/OpenNGC/blob/master/NGC_guide.txt>
- OpenNGC repository states CC-BY-SA-4.0 and identifies NED, HyperLEDA, SIMBAD, HEASARC, and Harold Corwin as data sources. The retained 14-object subset is attributed and shared under CC-BY-SA-4.0.
