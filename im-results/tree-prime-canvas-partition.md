# Signed 2016 tree image as an exact 11×11 GP-prime pixel partition

**Status: a source-constrained coordinate operation, with two scoped original-cipher negatives.** This test builds on Agent 21's independently discovered cross-artifact source checksum. Neither the checksum nor this image extraction recovers unknown LP2 plaintext, a key, a cipher mechanism or a destination.

## Source-selected dimensions and deterministic pixel operation

The authentic preserved signed 2016 JPEG (resources/historical/cicada2016-4gq25.jpg) is **563×569 pixels** and depicts the blurred tree found in Liber Primus physical p32 (49.jpg). Original LP2 p32 contains exactly **121 ciphertext runes**, suggesting a row-major **11×11** array (a hypothesis about reading order, since printed line breaks differ). Convert its original rune labels to the canonical Gematria Primus prime values.

Agent 21's source fact: **the first row totals 563** and **the first column totals 569**, exactly matching the JPEG's width and height, with natural x/y orientation. This allows a finite **pixel-space** operation: treat eleven first-row primes as variable-width vertical strips and eleven first-column primes as variable-height horizontal strips. The strips tile **all 320,347 original image pixels exactly once**, into 121 source-determined rectangles. No image crop, scale, key, phase or geometric shift was fitted.

- x-axis strip widths: **[73,5,101,19,101,3,43,107,13,19,79]**.
- y-axis strip heights: **[73,23,5,23,79,59,53,79,59,109,7]**.
- x edges: **[0,73,78,179,198,299,302,345,452,465,484,563]**.
- y edges: **[0,73,96,101,124,203,262,315,394,453,562,569]**.

The decomposition is an *interpretation of an exact original relation*, rather than proof the creator intended rectangular tiling. It yields a falsifiable 121-cell image input for future source-constrained routes.

## Two simple original-input predictions rejected

Each exact rectangle is read as (1) mean RGB luminance 0.299R+0.587G+0.114B, and (2) fraction of pixels with luminance at least 180. Testing the corresponding source rune's GP **ordinal** or **prime value** against either image statistic yields the following 100-cell **interior** Pearson correlations, excluding the row/column that specify the partition:

| Source label vs cell statistic | Observed interior correlation | ≥ absolute value among 10,000 original-label permutations |
| --- | ---: | ---: |
| Ordinal vs mean luminance | −0.08383 | 4,285 |
| Prime vs mean luminance | −0.08048 | 4,460 |
| Ordinal vs white fraction | −0.09010 | 3,968 |
| Prime vs white fraction | −0.08762 | 4,102 |

Largest absolute observed correlation is **0.09010**; among 10,000 seeded interior-label permutations, **4,317** achieve an equal or larger maximum across these four measures. Direct mean-luminance normalization to indices 0–28 agrees with only **4 of 121 original rune indices**. These are bounded negatives for brightness-as-rune decoding. Bright text is overlaid on the image and the tree is low-contrast; other image features are untested. The 180 threshold is a declared measurement choice, rather than a clue-specified threshold. The permutation counts are conditional diagnostics, not discovery-wide probabilities.

A second test asks whether the source-image **121-cell white fraction** is an event mask for the previously observed sparse within-word T6(x)=24−2x mod29 lag-six relation. Read the mask at **phase zero** (no fitted shift) at either book-global or page-local original rune index modulo 121. All **1,290 original eligible within-word lag-six positions**, including **80 T6 hits**, were included. Each hit-versus-nonhit brightness difference was ranked against all **121 cyclic rotations** of the mask.

| Fixed phase-zero mask clock | T6-hit minus nonhit brightness | Positive rank among 121 shifts | Two-sided absolute rank among 121 |
| --- | ---: | ---: | ---: |
| Whole-book rune offset | +0.0057853 | 35 | 77 |
| Physical-page-local rune offset | +0.0039161 | 51 | 98 |

Neither unshifted source-aligned clock is distinguished from cyclic rotations. Selecting the best fitted shift would violate the original-cipher prediction contract. This rejects the two literal brightness-mask selectors only. No source-defined selective T6 event rule has emerged from the image tiling.

## Nested p32 ring, signed payload length, and Möbius structure

The Parable's wording about shedding circumferences motivates removing the outer three borders of the 11×11 p32 GP-prime square, leaving its central 5×5. The 16-cell perimeter, clockwise from its top-left cell, is:

`[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]`

Its sum is **1,136**, exactly the byte length of the PGP-authenticated signed 2016 payload `resources/historical/cicada2016-4gq25-outguess.asc`. This is an exact cross-artifact equality, but by itself does not specify an extraction.

### Four-side matrix

The four side sums are:

| Side (clockwise) | Sum | Modulo 29 |
|---|---:|---:|
| North | 275 | 14 |
| East | 257 | 25 |
| South | 373 | 25 |
| West | 231 | 28 |

Placing these clockwise side sums in row-major order gives a source-oriented 2×2 matrix over (mathbb F_{29}):

[
M=\begin{pmatrix}14&25\\25&28\end{pmatrix}.
]

Its determinant is (28=-1pmod{29}), and its trace is (13). It therefore defines an invertible Möbius transformation

[
f(x)=\frac{14x+25}{25x+28}\pmod{29}.
]

The map has projective order **7**, and (f(13)=24). Its finite fixed points are (22) and (25); their sum is (18pmod{29}). The action on (\mathbb P^1(\mathbb F_{29})) consists of four 7-cycles and two fixed points. The fixed points correspond to GP indices OE (22) and AE (25); the 7-cycle containing 13 is (13\to24\to19\to3\to6\to20\to17\to13).

### Cross-artifact constraints

These are exact modular correspondences, not fitted parameters:

| Source quantity | Residue / invariant | Independent match |
|---|---:|---|
| 2016 image width, 563 | (12\pmod{29}) | 2014 magic-square centre, (331\equiv12) |
| 2016 image height, 569 | (18\pmod{29}) | 2014 7×7 magic constant, (1033\equiv18); also the sum of Möbius fixed points |
| 2016 image area, (563\times569) | (13\pmod{29}) | p32's 13-dot mark and (\operatorname{tr}(M)=13) |
| Cicada number, 3301 | (24\pmod{29}) | (f(13)=24) |
| p32 inner-5 perimeter | (1,136) | signed 2016 payload length, 1,136 bytes |

The image-dimension residues are also consistent with the p32 tiling already established: the top-row and left-column prime sums are exactly 563 and 569. The 16 ring cells plus the 13-dot count total 29, the GP alphabet size; this count identity is suggestive but does not yet specify a mapping. The projective point at infinity supplies a natural 30th state for the 29-symbol alphabet, but identifying it with the 13-dot mark remains a hypothesis.

This is now a strong **source-constrained Möbius/map hypothesis**: p32 supplies the ring and matrix; the earlier LP1 MOBIUS reference supplies the operation family; the 2016 image and 2014 square independently constrain the matrix invariants; the seven-cycle structure matches the 7×7 historical square. It is not yet a plaintext recovery or proof that this is the intended cipher.

### Bounded direct-use tests

The matrix is not itself a successful direct decryption under the simplest interpretations:
- Applying (f) or (f^{-1}) as a monoalphabetic substitution to p32 produces no readable text.
- Using (M) or (M^{-1}) as a 2×2 Hill transform on the full unsolved LP2 rune stream produces no language recovery.
- Using the orbit of 13 as an additive period-7 state stream, with red 13-dot marks resetting the state, leaves the full-book IoC near the raw-ciphertext value (about 0.0345).
- Applying successive powers of (f) as a period-7 polyalphabetic substitution, including red-13 reset variants, also fails to produce language and creates many projective-infinity outputs.
- Treating the 16 prime values as a direct period-16 additive GP29 key (ordinal or prime-residue representations, both signs, global or page-reset clock) gives IoC 0.0344554–0.0345361 versus raw 0.0344784. Treating them as sequential byte-segment lengths consumes the payload exactly but does not align with its natural line/word structure.

These negatives reject the direct uses tested, not the matrix as a structural map, selector, coordinate transform, or state-generation mechanism. The four 7-cycles and two fixed points may be the relevant output; their intended use remains unresolved.

## Direction-field discriminator (pending original-image execution)

The p32 dimension tiling also supports a separate, falsifiable interpretation of “their numbers are the direction”: the 100 interior GP-prime values, reduced modulo four, predict four undirected line-orientation classes for the tree artwork. The measurement uses Sobel edge-normal orientation (90° from branch tangent), excludes bright text with the existing fixed threshold 180, and compares the source-aligned score with 100,000 permutations of the interior labels. The first row and column define tile geometry and are not reused as direction labels.

The reproducible implementation is `sims/tree121_directional_field_sft.py`, exposed as the manual-only `tree-direction` probe in `.github/workflows/grid-256-tests.yml`. It has not yet been run on the original signed 2016 JPEG in this invocation. Local resampled proxies from the page-32 blurred tree and page-55 outlined tree did not show strong alignment (upper-tail permutation p≈0.094 and p≈0.426 respectively); these are exploratory checks only, not substitutes for the original image.

## Decision and next discriminator

The strongest current result is the **Möbius matrix and its cross-artifact invariant chain**, anchored by the exact p32 ring sum = signed 2016 payload length = 1,136. The direct cipher interpretations are negative; do not repeat them. The next high-value work is to determine what the matrix's four 7-cycles and two fixed points do to the rune-meaning/word map, and whether the projective point at infinity has a source-grounded correspondence to the 13-dot punctuation. Run the locked direction-field script on the original signed image as an independent test. Do not expand into arbitrary ring rotations, image thresholds, or unconstrained key families.

**Reproducers and sources:** [sims/tree_prime_canvas_partition_sft.py](../sims/tree_prime_canvas_partition_sft.py) for p32 geometry and prior image negatives; [sims/tree121_directional_field_sft.py](../sims/tree121_directional_field_sft.py) for the pending original-image direction test; [resources/historical/cicada2014-openpuff-magic-squares.txt](../resources/historical/cicada2014-openpuff-magic-squares.txt) for the 7×7 square; [workplace/2016-image-dimensions-lag6-source-derivation.md](../workplace/2016-image-dimensions-lag6-source-derivation.md) for the signed-image coordinate derivation. This remains intermediate research, not an established decryption.
