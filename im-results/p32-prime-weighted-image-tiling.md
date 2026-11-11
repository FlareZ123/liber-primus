# 2016 signed tree: exact p32-prime-width image tiling and direct pixel-value gate

**Evidence class:** Source-derived *candidate* geometry with an original-image, original-cipher negative test. The 563×569 edge checksums are independently established in [the p32 tree analysis](lp2-tree121-signed2016-source-gate.md). The decision to interpret individual primes as *widths and heights* is new and hypothetical. **No unknown LP2 plaintext, historical key, directed walk or destination is recovered.**

## Human-visible route and finite geometrical definition

The historically signed 2016 Cicada message instructs that the words of Liber Primus are a map, their meaning the road and their numbers the direction. Its attached original tree JPEG, archived as [4gq25.jpg](https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg), measures **563 pixels wide by 569 high** and matches the tree motif on physical LP2 p32. Original p32 contains exactly **121** GP runes. The established natural 11×11 row-major mapping, with each rune converted to its standard GP *prime* weight, satisfies these source checksums without altering ciphertext:

- The top-row prime weights are **[73,5,101,19,101,3,43,107,13,19,79]**, summing to 563.
- The left-column prime weights are **[73,23,5,23,79,59,53,79,59,109,7]**, summing to 569.

A possible next human operation is to interpret the *eleven individual top-row prime weights* as successive horizontal pixel widths, and *eleven first-column prime weights* as successive vertical heights. This determines **121 unequal rectangular image tiles** with **zero free shifts, scales, wrapping, orientation parameters or missing cells**. The exact cumulative boundaries, in pixels from image upper-left, are:

| Horizontal x | Vertical y |
| --- | --- |
| 0, 73, 78, 179, 198, 299, 302, 345, 452, 465, 484, 563 | 0, 73, 96, 101, 124, 203, 262, 315, 394, 453, 562, 569 |

**Important selector gap:** a source-prescribed use of these tiles is missing. The signed text says *numbers are direction*, which could instead favor a route through runes or a compass. There is no authenticated instruction to partition an image according to each prime weight, choose a pixel color statistic or map brightness back to rune values. This construction remains a candidate geometry, not a recovered intended instruction.

## Frozen direct-pixel discriminator on authentic images

We obtained the original JPEG bytes through the historical repository (Git blob **22027296dcd7df53c5127e6aadbabeaf3223f72d**, exactly **26,342 bytes**) and preserved a losslessly recoverable base64 copy at [resources/historical/2016-cicada-4gq25.jpg.base64](../resources/historical/2016-cicada-4gq25.jpg.base64). The original source's 563×569 dimensions and RGB pixel data are read with a pinned [jpeg-js decoder](../sims/vendor/jpeg-js-decoder.cjs) and its [license](../sims/vendor/jpeg-js-LICENSE).

A direct and limited check asks whether the 100 p32 *interior rune prime values* encode the appearances of their corresponding image tiles. Freeze the edge weights, which define all tile positions and sizes. For each interior tile use exactly three elementary pixel summaries of decoded RGB:

1. Mean RGB level (average of red/green/blue at each pixel).
2. Fraction of pixels with mean RGB **≥160**.
3. Fraction with **16≤mean RGB<160**.

Pearson and Spearman associations compare those image summaries to the original interior GP prime values with no decryption key or fitted pixel transform. Shuffle **only the 100 interior original prime weights**, preserving their multiset and all 21 edge runes that define geometry. Use 100,000 fixed-seed xorshift32 shuffle trials, seed 0x20163301. Report each individual two-sided Pearson permutation probability as well as the chance that any one of the three predeclared features matches or exceeds its observed absolute association.

| Feature | Observed Pearson r | Observed Spearman rho | Two-sided Pearson shuffle p |
| --- | ---: | ---: | ---: |
| Mean RGB | -0.08047718 | +0.01753043 | 0.431996 |
| RGB ≥160 fraction | -0.08838911 | -0.04343931 | 0.389796 |
| 16≤RGB<160 fraction | -0.01225613 | -0.01091975 | 0.904291 |

Under the same 100,000 shuffles, the three-feature **any-Pearson** probability is **0.912421**, and the three-feature **any-Spearman** probability is **0.976500** (add-one denominators). These are *conditional randomization diagnostics* for the stated source-derived geometry and three fixed visual features. They are not global probabilities that Cicada intended or did not intend a pixel method. The actual JPEG has bright written text over a mostly dark canvas; pixel intensity can reflect the typography rather than the tree shape.

A second, strictly frozen image readout uses **only the pixel at the center of each of the 121 tiles**, labeling it white when its three-channel mean RGB is ≥128. This image-derived mask, with row-major `#` for selected and `.` for excluded, is:

```text
...........
...........
.#######...
...........
......#....
...........
...........
...........
...........
...........
...........
```

The eight rune labels at selected positions transliterate as **HBIARTTHFW**, without a recognizable instruction. This tests one elementary visual reading rule; it is an exploratory negative rather than an exhaustive search over tree-mask semantics. The image JPEG's original marker structure is ordinary: JFIF APP0, quantization, baseline frame, Huffman and scan segments, and EOI at byte offset **26,340**, with **no COM, EXIF/XMP, application metadata beyond APP0 or trailing bytes**. These literal container checks find no metadata-level textual key. **DCT-domain steganography is positively known here**: the historical 2016 image is the project's authentic 1,136-byte OutGuess payload positive control (see [the established extraction and checksums](outguess-lp2-keyed-source-headers.md)), so the absence of APP/COM/trailing data cannot be treated as absence of concealed content. No *new* key or plaintext results from the tile-center check.

**Separate byte-source check, no table transfer.** The JPEG contains exactly two 8×8 quantization matrices (64 values each). Both match the **standard JPEG quality-75 luminance and chrominance tables exactly (64/64 entries each)** after the standard zigzag ordering, so they are ordinary compressor parameters rather than an image-specific 128-byte key. In the source p50 printed 32×8 grid, the four consecutive 64-byte blocks match the first JPEG matrix at only **[1,1,0,0]** positions and the second at **[0,0,0,0]** positions. Unmodified table-byte transfer is therefore absent. This narrows the literal 2016-image-to-p50 idea without claiming anything about unrelated DCT coefficient steganography.

**Decision:** the unique natural tiling defined by the known sums is a reproducible candidate visual operation. **Direct monotone tile-brightness → interior GP-prime-value identification is unsupported** and should not be optimized through arbitrary thresholds, color corrections, rotations, or language scorers. Recovering a source-indicated direction/route or a hidden layer remains necessary before testing any decryption. The independent 563/569 axis checksums still meaningfully identify p32 and its row-major orientation, as established before this study.

## Exact reproduction

Run [the standalone CommonJS SFT](../sims/p32_prime_weight_image_tiles_sft.cjs) under Node.js 22 from the repository. It reads only the canonical [original LP2 source corpus](../resources/liber-primus/lp2-corpus.json), the archived JPEG base64 and the vendored JPEG decoder. It validates 121 original runes and source image dimensions, asserts the 11 width/height values, reconstructs all 121 tiles, then prints the tile means, correlations, control counts and p-values. There are no random seeds or thresholds selected after seeing the original correlations.

The 2016 image SHA above identifies the original *Git blob*, not an unverified pixel screenshot. The decoder was pinned from the open-source [jpeg-js](https://github.com/jpeg-js/jpeg-js) implementation (Git blob **a237d4037735de5446e63528ffdec1937ceac09d**) with its source license. The first-party p32 rune corpus references the historical rtkd/iddqd transcription lineage; the p32 11×11 grid has separate independent image documentation in the linked report.
