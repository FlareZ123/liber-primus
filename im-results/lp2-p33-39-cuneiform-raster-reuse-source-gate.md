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

## Specific authoring-intermediate gate (Agent16, 24 November 2026; #2532)

The already established production discontinuity is not a hypothetical pixel watermark: the same two numeral rows are relocated from p33's bottom to p34's top, with different subpixel placement, then the latter top panel is fixed on pp34–39. A native pre-release PDF/PS or editable page containing the separately positioned cuneiform text/art object would expose its original placement, object order and (if text rather than image) glyph codes. The independently selected missing operand is **the p33/p34 cuneiform source object's pre-raster glyph/position data**, not an unspecified archive key.

A specific extant candidate was checked rather than repeating the archive census: the 54,644,969-byte [LiberPrimus.pdf in Wulfic/Cicada3301-Liber_Primus](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/sources/LiberPrimus.pdf), Git blob `be2f4dc04ee05a312990adcad7da67cebc617414`, duplicated in the certified-retart fork. The repository's [explicit reference inventory](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/README.md) identifies it as the complete **scan set compiled into one PDF**, not an authoring source. The current path was moved in a 1 October 2026 [refactor commit](https://github.com/Wulfic/Cicada3301-Liber_Primus/commit/fe7588ba18973a10f930d638ad002478466c9b22); that date does not date the PDF's original creation. It is not evidence for the missing 2014 native layer. The actual [archived original distributor HTML](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/2014/Liber%20Primus/A%20drop%20box%20of%20all%20unmodified%20files/2014onion7/index.html) lists only the flattened numbered JPEGs, and [the original native-layer acquisition audit](lp2-p57-native-layer-master-archive-source-gate.md) documents that delivery contract independently. Targeted dated public searches for an LP2 native PDF/PS or separately available earlier 1033/3301 cuneiform layer found no such artifact. This is not an exhaustive archival absence claim or direct inspection of the modern PDF's internal objects.

No historically available cuneiform production object, original text layer, new glyph operand or ciphertext relation was acquired. The exact p33→p34 placement relation remains known; no new cipher test follows from a recompiled scan set. Reopen only with an actual period-sourced layered object or source document, then lock its glyph/position readout before testing untouched original runes. Stop here rather than conduct another JPEG metadata scan or invent an inverse.
