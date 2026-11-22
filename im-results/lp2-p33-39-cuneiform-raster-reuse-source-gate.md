# LP2 p33–39 cuneiform emblem: repeated raster, no six-page ink-variation key

**Original-source decision (17 November 2026).** The cuneiform label pair conventionally read as decimal **1033 / 3301** appears at the bottom of physical p33 (original `50.jpg`) and at the top of each physical p34–39 (original `51.jpg`–`56.jpg`). This is an authored page-layout motif, but its later six appearances contain **no varying visible raster information** that could independently select a page-specific cipher key. The unvarying numerals and their placement may still be puzzle clues. **No unknown plaintext or key is recovered.**

## Why test this image channel?

An independently decipherable seven-page section could in principle use tiny changes in a repeated visual symbol as seven key fragments. Such a mechanism would have a source-visible human entry point: notice the same unusual numerals on consecutive pages, compare their drawing. This gate addresses only *differences among the repeated cuneiform drawings*, not prime-rank navigation, arbitrary arithmetic on 1033/3301, or the original text's cipher.

## Source bytes, method, result

Read the repository's original 2400×3600 JPEGs in `resources/liber-primus/`, decode to 8-bit grayscale, and take the fixed 395×425 original-pixel rectangle **(x=1015..1409, y=140..564)**. On original scans **51, 52, 53, 54, 55, 56**, all six cropped pixel arrays are **byte-for-byte identical**, including the emblem and its surrounding white margin. The shared grayscale crop SHA-256 is:

`4dd11e3eeaa4b68ce061c6538ee015588604d6797b2c496748f93e662b3c3fe8`.

The p33 opening places its sign after body text, so this crop cannot be compared without registration. Comparing its visually corresponding two glyph rows to p34 after separate source-pixel translations yields **ink-mask intersection-over-union 0.887524961823 (upper) and 0.887537345284 (lower)** at an untuned grayscale cutoff of 128. Pixel phases and row offsets differ. This is **shape similarity**, not a claim of exact first-page identity or evidence for encoded differences.

The reproducible read-only source test is [`sims/lp2_cuneiform_repeated_header_original_sft.py`](../sims/lp2_cuneiform_repeated_header_original_sft.py), using Pillow. It checks full-size original inputs, exact six-crop equality, hash and two first-page overlaps. Independent visible-page comparison is consistent with the six pixel-identical motifs.

## Cryptanalytic consequence and limit

- Any key hypothesis requiring **one different drawn cuneiform symbol per p34–39 page** is contradicted by the actual JPEGs; the six supposed variable source operands are identical.
- This does **not** reject a constant cipher parameter from decimal 1033 / 3301, a position/index derived from their sexagesimal representations, the p33 bottom-versus-top movement, or an instruction in the accompanying rune text.
- A fixed repeated numeral is insufficient by itself to choose an encryption inverse, key clock or authentic unknown-page plaintext. There is no basis for further numeric key fitting from this raster result alone.

The human solve path worth retaining is the explicit **repetition and relocation**, not imaginary per-page changes in the ink. Future use requires an independent, authored receiver and a held-out original-cipher decryption, rather than an image-difference key search.
