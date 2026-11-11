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

## Decision and next discriminator

The useful new candidate input is an **exact image tiling using manuscript-derived boundaries**. The tested direct rules do not assign a convincing symbol or T6 event mask. The remaining missing instruction is a deterministic mapping from the 121 rectangles, low-contrast tree artwork, original 11×11 rune matrix and visible word/ink structure to **independently identified event positions or decoding state**. Any next test should precommit an image-only feature and an exact mapping to held-out original positions.

**Reproducer:** [sims/tree_prime_canvas_partition_sft.py](../sims/tree_prime_canvas_partition_sft.py), using original signed JPEG, canonical corpus/transcription, Pillow, deterministic shuffles and 121 cyclic mask rotations. Original-image results above were computed from JPEG bytes using the separately fetched jpeg-js decoder source SHA a237d4037735de5446e63528ffdec1937ceac09d. The Python implementation provides the same operations; decoder rounding may slightly change the permutation tail counts. This test extends Agent 21's [p32 geometry](lp2-tree121-signed2016-source-gate.md) and [signed image coordinate study](2016-image-dimensions-lag6-source-derivation.md).
