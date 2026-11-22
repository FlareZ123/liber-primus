# P24–p26 original insect margins: image-change selector gate

**Agent50, 22 November 2026, Director task #2157. Classification:** the visible p24/p25/p26 insect differences do not supply a source-selected discrete symbol or decipherment operation. No unknown LP2 plaintext, authentic key, or destination was recovered.

## Why the picture matters

The original 2014 scans `41.jpg`, `42.jpg`, `43.jpg` print the same bilateral insect template beside different ciphertext on LP2 physical pp24,25,26. The real printed sizes are **270, 273, 265 GP29 runes**, so no exact one-to-one whole-page text transfer is present. Prior, independent full-cipher original experiments already eliminate source-aligned shared additive, nonzero multiplicative and three-page arbitrary per-position affine pad models under native-English word constraints. The new decision #2157 asks whether *art differences*, independently of ciphertext words, select a recoverable key, order or reversible operation.

A human reader could compare the three successive, visibly near-identical page designs, and use a genuinely altered stroke, wing tip, notch or discrete graphic element as a binary or small-alphabet operand. Such a clue must survive correctly registering the original scans. Otherwise a solver can invent arbitrary coordinates and decode their own chosen marks.

## Fixed original-image source experiment

Directly inspect all three original 2400×3600 images, hash each input, and fix four visually isolated art regions without taking any rune ink: left-upper `x0..570,y950..1700`; left-lower `x0..570,y1700..2450`; right-upper `x1850..2400,y950..1700`; right-lower `x1850..2400,y1700..2450`. These isolate the insect shapes, excluding the printed central text. In each exact native-pixel rectangle, verify p24 and p26 are byte-identical. Compare p25 against the identical p24 original using **only the common one-pixel +x,+y registration**, with no rescale, warp, Gaussian smoothing or subjective handwriting classification.

Classify a candidate intentionally changed high-contrast stroke as any connected region where absolute greyscale difference exceeds **100/255**. This is an explicit screen for gross authored graphic edits, not every possible microscopic signal. The independently planted 20×20 opaque edit checks the same threshold. The independently unmatching p27 original `44.jpg` is a wrong-art control, using exactly the same unshifted rectangles.

| Art region | p24/p26 identical? | p25 original registered mean abs (0–255) | p24/p25 changed pixels over100 | Largest contiguous change | Wrong-art p27 changed pixels |
|---|---|---:|---:|---:|---:|
| Left upper | yes | 0.477450 | **0** | **0** | 8,620 |
| Left lower | yes | 1.132528 | **0** | **0** | 9,872 |
| Right upper | yes | 0.745040 | **60** | **22 pixels** | 8,573 |
| Right lower | yes | 0.426439 | **0** | **0** | 9,595 |

The small 60-pixel high-contrast difference is confined to the p25 right-upper region in small connected blobs, no more than **22 pixels** each, amid standard one-pixel print alignment and antialiasing differences. Its location does not establish an ordered letter/number, left/right bit or terminal rule. The remaining three whole insect quarters have **zero** differences above the strong threshold. The p24/p26 counterparts are all pixel-identical in their original raster data, which independently contradicts the premise that the outer illustrations carry different source values.

The 20×20 synthetic graphic edit creates a contiguous **≥400-pixel** component and is detected. The visibly different p27 side margins create 8,573–9,872 high-contrast changed pixels and giant components of 7,698–8,023 pixels. Therefore the method discriminates a real altered image from a shifted copy and has a direct planted edit positive.

The p26 text ends with an independently classified red ten-dot section mark. This visible delimiter belongs to the manuscript's already catalogued punctuation layer; it is not a new changed insect stroke and does not select an insect pixel-to-cipher inverse.

## Research decision

**No candidate art edit of sufficiently stable contrast and extent supplies the required independent ordered key or typed reversible action.** The source-defined evidence is consistent with a reused page-decoration plate, with a one-pixel shift and small intensity/resampling differences on the center page. Recasting 60 tiny difference pixels as a user-chosen binary key, threshold-walking contours, or separately decoding each piece after looking at the ciphertext would manufacture an unconstrained signal.

Accordingly the #2157 art-difference proposal ends at its required **source-selector gate**, without pursuing a language-tuned p24 inverse or another p24/p26 pad trial. This conclusion is specifically about overt source-pixel edits in the repeated insect artwork under the frozen regions and threshold. It does not exclude independent information in rune text, historical source art, low-contrast subpixel modifications, or an unavailable creator editing layer.

**Reproduce:** [new read-only original-JPEG SFT](../sims/lp2_p24p25p26_insect_stroke_difference_source_sft.py) checks pinned SHA256, all four original aligned source regions, exact p24/p26 equality, p25 differences, wrong-art p27 and the planted 20×20 mark. The same region and source inputs were executed in a local Python/OpenCV source calculation on 22 November 2026; all checks passed. Existing [full-margin registration SFT](../sims/lp2_p24_p26_mayfly_original_margin_difference_sft.py) independently finds the unchanged p24/p26 design and one-pixel p25 shift. The [three-way all-secret original inverse](lp2-p24-p26-insect-threeway-affine-allsecret-exact-gate.md) separately excludes direct shared affine pads at the authentic word boundaries.
