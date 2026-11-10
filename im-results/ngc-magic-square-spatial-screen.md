# LP1 scan 05: NGC-coordinate interpretation of the 5×5 magic square

**Classification: exploratory source-interpretation test with an exact magic-square-conditioned enumeration. No LP2 plaintext, key, or destination recovered.**

## Question and source-motivated route

The original LP1 scan `05.jpg` contains a concealed, reversible 5×5 numerical magic square. The 25 values and all 12 row/column/diagonal sums are already reproduced in [`jpeg05-palindromic-magic-square.md`](jpeg05-palindromic-magic-square.md). The 13 distinct cell values are all valid NGC catalogue numbers, and the magic constant 1033 is also NGC 1033. Separately, the 2019 gHOST interview (claimed inside status unverified) links the dots on page 7 / page 56 to constellations; page 7 in that interview's numbering is scan `05.jpg`.

A human could therefore try looking up the 13 NGC objects and interpreting the square as a sky-layout. This test asks whether the square's source cell adjacency places the NGC objects in an unusually compact celestial arrangement.

=# Data and method

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

## Decision

The NGC mapping is a plausible clue to test because the independent interview points toward constellations, but the coordinate layout does **not** establish a unique constellation, cipher operation, key, or destination. The spatial compactness is not exceptional once the actual magic-square constraints are preserved. Do not promote this to `results/` or repeat broader NGC catalogue fishing.

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
