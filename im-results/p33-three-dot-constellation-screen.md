# LP2 p33 three-dot motif: conditional constellation screen

**Classification: bounded exploratory negative result. No constellation identification, LP2 plaintext, key, or destination recovered.**

## Frozen source

The tested motif is the horizontal three-dot divider on original LP2 scan `resources/liber-primus/50.jpg` (physical p33), not the separate repeated five-dot stencil or the red 3×3 matrices on scan 05 / p56.

- Original image dimensions: 2400×3600 px
- Frozen crop rectangle (left, top, right, bottom): `[700, 1660, 1730, 1830]`
- Frozen dot centres (x, y): `(766.221, 1743.931)`, `(1183.846, 1743.939)`, `(1662.000, 1743.939)`
- Normalized middle-point fraction: **0.4662143** (first and second gaps 417.625 px and 478.154 px; ratio 0.8734)

The trio is nearly collinear and close to an ordinary ellipsis/divider. No historical clue specifically identifies p33 as a constellation; the unverified gHOST interview's page references concern page 7 and p56, not p33.

## Frozen candidate catalogue and transform

Use the repository-pinned `resources/control/d3-celestial-constellation-lines.json` (89 constellation features; source/license attribution in `resources/control/d3-celestial-lines-SOURCE-LICENSE.txt`). Enumerate every unique connected simple three-vertex path in the constellation line drawings: **840** candidate subsets, **5,040** point correspondences after all six permutations.

Fit only a 2-D similarity transform (translation, rotation, uniform scale); no shear, affine warp, hand-selected constellation, or per-candidate parameter search. The residual is the square root of normalized squared Procrustes error, divided by the candidate's total centred squared radius. The full catalogue search is repeated for every null sample.

## Result

The best single match is a three-star path in **Ursa Minor (`UMi`)**, residual **0.00396122**. The next best constellation-level matches are Draco (0.0103065), Scorpius (0.0125703), Auriga (0.0152444), and Monoceros (0.0154339). An exactly evenly spaced three-dot control (`t=0.5`) instead best matches Volans at residual 0.0244145.

The UMi fit is visually close, but the matched null says it is not exceptional:

- **Beta(2,2) null:** generate three uniform points on a line and use their middle order statistic as the normalized middle fraction; 10,000 trials; **1,103/10,000** fit at least as well; add-one p = **0.11039**.
- **Uniform-middle null:** hold the endpoints fixed and choose the middle point uniformly between them; 10,000 trials; **1,227/10,000** fit at least as well; add-one p = **0.12279**.

Both nulls preserve collinearity and spacing variation, normalize away image scale, and reselect the best match over the same 5,040 catalogue correspondences. Thus roughly 11–12% of generic collinear triples produce an equal or better best-fit constellation path.

## Decision

Do not identify the p33 trio as Ursa Minor or use it as a key. The best match is a post-selection result from a permissive search and is not statistically unusual under either matched null. Given its position between text blocks and near-ellipsis spacing, the conservative interpretation is a typographic divider/ellipsis unless independent evidence predicts a specific constellation.

This test does not touch the red 3×3 dot matrices on scan 05 and p56; those remain subject to the Agent21 / Issue #3 authorization gate.

## Reproduction

From the repository root:

```sh
node sims/p33_three_dot_constellation_screen.cjs
```

The script reads the pinned local catalogue, asserts the 89-feature / 840-path census, freezes the source centres and crop, and reproduces the Procrustes winner and both 10,000-trial matched nulls without network access or third-party dependencies.
