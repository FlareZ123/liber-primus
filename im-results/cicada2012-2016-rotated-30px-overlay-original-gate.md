# Source-fixed 2012→2016 rotated image and 30-pixel centered inset

**Agent23, 13 November 2026. Original-image source geometry is exact; source-selected aligned-pixel overlay is negative at the tested signal strengths. No unknown LP2 plaintext, recovered key or destination.**

## Source-fixed motivation

Cicada's original 2012 first puzzle image, [`resources/historical/cicada2012-first-image.jpg`](../resources/historical/cicada2012-first-image.jpg), is exactly **509×503** pixels. The PGP-signed 2016 image, [`resources/historical/cicada2016-4gq25.jpg`](../resources/historical/cicada2016-4gq25.jpg), is exactly **563×569**. This is an independently visible, exact arithmetic relation: rotate the first image 90° to **503×509**, add 30 blank pixels to each of its four sides, and obtain the second image's **563×569** canvas. The two original image widths and heights, sorted by length, also differ by 60 in the already-established [2012/2016 dimensions study](2016-image-dimensions-lag6-source-derivation.md).

A bounded, non-cryptographic prospect is that the 2016 image has concealed a centered 2012 image, or reused an aligned raster, perhaps in its lightly coloured pixels. A copied image could give genuine source bytes, a geometric ordering, or a transferable visual key; an exact pixel overlap would distinguish such a source clue from dimensional numerology. The competing model is that two independent prime-dimension illustrations share the dimension equation with no image-pixel embedding. The source does not explicitly say to rotate, overlay or compare these pictures.

## Exact original-image test

The [source-exact Python reproducer](../sims/lp2_2012_2016_centered_image_overlay_probe.py) loads the original JPEGs without re-encoding, checks `2012.size=(509,503)` and `2016.size=(563,569)`, and extracts the literal 2016 inset `x=30..532, y=30..538` (inclusive), a **503×509** raster. Both possible 90° rotations of the 2012 image are compared to this fixed inset. For each orientation compare grayscale darkness `255-intensity` and native binary ink masks with thresholds `<224`, `<192`, `<160`, `<96`, separately.

At each of these **ten source-fixed channels**, compute normalized Pearson cross-correlation at the exact centered alignment. A two-dimensional FFT evaluates the same source against all **509×503 = 256,027 cyclic shifts** of the inset, preserving the spatial patterns and marginal intensities of each actual image. The reported rank/fraction describe a *within-image relative alignment diagnostic* rather than an independent sampling p-value across natural images. No scaling, rotation angle fitting, cropping adjustment, colour-component tuning, arbitrary offsets or cipher search is performed.

For sensitivity, create an *explicit synthetic positive* by taking the brighter image-darkness value at each corresponding pixel (`max(source_darkness, later_inset_darkness)`) and score the 2012 pattern against that constructed aligned overlay under the same procedure. The synthetic plant is a test of detector functionality, not a source fact.

## Windows original-source result

[Successful manually dispatched Actions run 43522904098](https://github.com/FlareZ123/liber-primus/actions/runs/43522904098) executed the original files on Windows Python 3.12/Pillow/NumPy. All size assertions, transforms and positive controls passed.

| 2012 rotation | Channel | Exact-centered correlation | Rank among 256,027 cyclic shifts | Shift upper fraction | Planted aligned-overlay correlation / rank |
| --- | --- | ---: | ---: | ---: | --- |
| 90° CCW | Grayscale darkness | **0.02770602** | **6,550** | 0.02558324 | 0.27299865 / 1 |
| 90° CCW | Ink <224 | 0.01625209 | 4,426 | 0.01728724 | 0.20435028 / 1 |
| 90° CCW | Ink <192 | 0.01754096 | 6,398 | 0.02498955 | 0.21629486 / 1 |
| 90° CCW | Ink <160 | 0.01896430 | 6,930 | 0.02706746 | 0.22312176 / 1 |
| 90° CCW | Ink <96 | 0.02212934 | 7,898 | 0.03084831 | 0.23171460 / 1 |
| 270° CCW | Grayscale darkness | −0.00575998 | 169,364 | 0.66150836 | 0.21910329 / 1 |
| 270° CCW | Ink <224 | −0.00322695 | 172,430 | 0.67348366 | 0.14959028 / 1 |
| 270° CCW | Ink <192 | −0.00576371 | 190,964 | 0.74587446 | 0.15504900 / 1 |
| 270° CCW | Ink <160 | −0.00609926 | 188,201 | 0.73508263 | 0.16186128 / 1 |
| 270° CCW | Ink <96 | −0.00579489 | 177,172 | 0.69200514 | 0.17427755 / 1 |

The best center absolute correlation is only **0.0277**, and the smallest rank is **4,426**, far from first among shifts. The planted aligned overlay is rank **1** in every channel with substantial positive correlation. Although one 90° orientation yields a small positive center score relative to the cyclic-shift field, the five thresholds are highly dependent, and these statistics are not significance calibrated against independently sourced natural image pairs. The low correlations, lack of near-unique center peak and strong planted controls provide no affirmative evidence of a direct centered image reuse.

## Decision and limits

**Reject the direct, native-gray or thresholded-ink 30-pixel-center picture reuse as a demonstrated image-key source.** These results do not exclude a faint alpha blend, unknown color-channel steganography, DCT-domain or passworded embedding, resizing, nonliteral pixel transforms, or dimension-encoded pointers. Their separate original-source selectors remain missing. The precise +60 dimensions and p32 GP-prime corner relationship remain source-visible observations, not an authenticated encryption operator. Do not use the faint post-selected correlation to launch unconstrained alpha/phase/crop searches or declare a hidden image.

This test adds a genuine original-raster discriminator for the already-recognized +60 geometric relationship, without changing the current 56-page unsolved state. Further research on this source pair should begin with an independently authenticated image operation or specific previously unseen hidden layer. No `results/README.md` promotion is warranted.
