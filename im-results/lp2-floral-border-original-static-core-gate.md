# Original LP2 floral border: an invariant raster core across all 16 pages

**Agent 5, 17 November 2026. Evidence class: original-image equality, narrowly scoped to two illustrated margins. No new plaintext, key, cipher mechanism or hidden message.**

## What a human can see and what this tests

The flowering ornamental borders around LP2 pp40–55 (original image filenames `57.jpg` through `72.jpg`) look like repeated cut-and-paste graphics. A possible visual-steganography hypothesis is that different pages alter small twigs, buds, dots or stems to supply the missing page key. It is worth resolving whether a common stable base image even varies in the unambiguous decorative core before attempting any arbitrary feature extraction.

Use the 16 **original 2400×3600 JPEG scans**, including the numeric-only p50. Decode each image as 8-bit grayscale and take two original-coordinate rectangles: left `x=180..499, y=650..3099` and right `x=1900..2219, y=650..3099`. Both are safely inside the plainly repeated botanical margins, outside the text. Each rectangle is **320×2450 = 784,000 actual image pixels** and contains substantial black ornament (not blank background). No registration, fitting, thresholding, page offsets, image reconstructions, original JPEG repacking or ciphertext-derived parameters are necessary.

## Exact all-page result

All **16×2 = 32 crops** are byte-for-byte identical **after actual JPEG decoding** in their own original image coordinates.

| Source crop | Grayscale SHA-256, identical for all 16 pages | Dark pixels (<128) per crop |
| --- | --- | ---: |
| Left | `d53112b55b0dd922ebc5e3adb0bddbe649c7d899f8437d42175974d4ca696779` | 79,045 |
| Right | `9e1babb9e84936516c8eb9066dbcc110804c452d0d4ec00d9afe20ba499d3602` | 79,861 |

That is **1,568,000 per-page checked image pixels**, or 25,088,000 total decoded image pixels, with **no changed pixel anywhere in these two flower cores**. The [read-only single-file Python SFT](../sims/lp2_floral_border_static_core_sft.py) recomputes and asserts both hashes and both substantial-ink counts for all 16 source JPEGs in `resources/liber-primus/`.

## Research decision and limit

A changing branch, bud, dot or pixel in either exact bounded region cannot be the intended per-page channel, because there are **zero differences** there. The imagery is consistent with reusing a static page template. This is a cheap source-image exclusion against the *particular* hypothesis that those two stable ornament cores directly encode a sequence of differing per-page keys.

The comparison deliberately avoids the areas where text and larger drawings can overlap the flowering border. It does **not** exclude color-only differences outside the measured grayscale rectangles, additional artwork outside the borders, mirrored source masks, alterations on their untested tips, or a cipher that uses an **unchanging** ornament as one shared stencil. It also does not establish creator intent. Future image-layer exploration should prioritize actual changing original features or a first-party reading instruction, rather than reextracting bits from these invariant margins.

**Original source:** `resources/liber-primus/57.jpg` through `resources/liber-primus/72.jpg`. **Verification:** `sims/lp2_floral_border_static_core_sft.py` (requires Pillow; local original-archive computation matched all 32 crop hashes).
