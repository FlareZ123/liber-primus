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

## Nested p32 ring and the signed 2016 payload length

A second source-constrained operation follows the Parable's wording about shedding circumferences. In the 11×11 p32 GP-prime square, remove the outer three concentric borders to expose the central 5×5 square (rows/columns 3–7, zero-based). Its 16-cell perimeter, read clockwise from the top-left, is:

`[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]`

The sum is **1,136**, exactly the byte length of the PGP-authenticated signed-message payload `resources/historical/cicada2016-4gq25-outguess.asc`. This is a new exact cross-artifact equality. It does not yet specify how to extract plaintext or key material from the 1,136 bytes. The 16 ring values average 71; together with the page's 13-dot mark, the counts 16+13=29 also match the GP alphabet size. These secondary arithmetic relationships do not yet select a unique operation.

Two simple interpretations were bounded:
- Treat the clockwise 16 prime values as a period-16 additive GP29 key, using either GP ordinals or prime residues modulo 29, both signs, and either a whole-book or physical-page-reset clock. Across the eight full-book inverses, IoC ranges **0.0344554–0.0345361**, against raw ciphertext **0.0344784**; none shows language recovery.
- Treat the 16 values as consecutive byte-segment lengths partitioning the 1,136-byte signed payload. The sum consumes the payload exactly, but the resulting clockwise boundaries do not align with the message's natural line/word structure and the simple boundary-byte/checksum probes yield no readable extraction.

Thus the ring sum is presently a **candidate cross-artifact checksum**, not an established key, cipher, or partition instruction. No mapping from the 13-dot mark to a unique subset/order of the 16 cells has been found.

## Direction-field discriminator on the authentic signed image (completed 11 November 2026)

The predeclared `sims/tree121_directional_field_sft.py` was executed on the **original** signed 2016 JPEG at `resources/historical/cicada2016-4gq25.jpg`, not on a resized Liber Primus illustration. It partitions the original 563×569 pixels with the exact first-row/first-column 11×11 GP-prime widths/heights above, then tests whether the **100 interior GP primes mod 4** select undirected Sobel gradient-normal line orientations in their corresponding tiles. The fixed 180-luminance bright-text exclusion and 3×3 dark-neighborhood requirement were retained without fitting to the outcome. The 100 interior labels are strongly unbalanced (residues 0/1/2/3: **0/43/4/53**); the label-permutation control retains this composition.

**Completed workflow run [42945543823](https://github.com/FlareZ123/liber-primus/actions/runs/42945543823), job [130277336962](https://github.com/FlareZ123/liber-primus/actions/runs/42945543823/job/130277336962), source revision `0e55985c325f54706d9c4ce251260e8db12d22a9`.** Original direction-matched edge energy was **253,399.9421 / 1,056,384.2900 = 0.2398747733**, versus **100,000 seeded interior-label permutations** with mean **259,436.7236 / 1,056,384.2900 = 0.2455893428**, standard deviation **4,880.0917** energy units, **z = −1.2370**, and upper-tail probability **0.89074109**. The original scores below the null mean; it gives **no positive support** for this exact image-direction reading. This is a narrowly scoped negative for the stated Sobel, modulus-four, orientation and threshold assumptions. The geometrical 563×569 tiling identity itself remains exact, and other independently indicated image operations remain untested.

## Decision and next discriminator

The strongest new result is the exact **p32 inner-5 ring sum = 2016 payload length = 1,136**. Its intended use remains unknown; direct period-16 additive-key and simple sequential-segmentation readings are negative. The locked original-image prime-mod-four direction test is now negative. The next useful step requires a newly independently motivated operation converting the exact pixel partition or 16-cell ring into a recoverable key/state schedule and a withheld LP2 plaintext prediction; additional variations of the negative direct orientation classifier should not be swept absent a new source clue. Do not expand into arbitrary ring rotations, image thresholds, or unconstrained key families.

**Existing reproducers:** [sims/tree_prime_canvas_partition_sft.py](../sims/tree_prime_canvas_partition_sft.py) for the original 11×11 tile geometry, brightness and phase-zero T6 negatives; [sims/tree121_directional_field_sft.py](../sims/tree121_directional_field_sft.py) for the pending original-image direction test. This extends Agent 21's [p32 geometry](lp2-tree121-signed2016-source-gate.md) and [signed image coordinate study](2016-image-dimensions-lag6-source-derivation.md).
