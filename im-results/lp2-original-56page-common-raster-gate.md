# Original LP2 pp0–55: no universally aligned dark raster layer

**Evidence class:** bounded full-resolution original-image exclusion. No plaintext, key or author-selected cipher operation recovered.

## Why this is a decipherment question

The 56 original 2014 LP2 unsolved-page JPEGs share a physical 2400×3600 canvas. If the author had superimposed a single fixed-position opaque or darkened watermark onto *every* page as a separate key carrier, its nonwhite raster pixels would survive a brightest-pixel intersection across all 56 pages. Such a common mark could carry a readable instruction independent of the GP29 text. The group ornaments provide genuine positive controls: pp0–2 reproduce the same three-bar crosses; pp40–48 reproduce the same two floral margins.

## Exact original-input experiment

Read the original `resources/liber-primus/17.jpg`–`72.jpg` corresponding to physical LP2 pp0–55. Decode each full 2400×3600 JPEG to 8-bit grayscale via Pillow, without resampling, aligning or cropping. At each common coordinate take the *maximum grayscale intensity* over all selected pages. This is white (255) if even one original page is white there; a shared dark feature survives only if every included page has a nonwhite pixel at that identical coordinate.

| Original-page set | Pixels in common under 255 | Under 254 | Under 248 | Minimum retained intensity |
| --- | ---: | ---: | ---: | ---: |
| All pp0–55, 56 JPEGs | **0** | **0** | **0** | **255** |
| Intro crosses, pp0–2, 3 JPEGs | 468,904 | 437,164 | 398,849 | 0 |
| Repeated floral margins, pp40–48, 9 JPEGs | 398,278 | 366,284 | 311,723 | 0 |

Thus **each one of the 8,640,000 raster coordinates is exactly white in at least one of the 56 original unsolved pages**. No black or gray *static full-book shared pixel* exists in the grayscale image intersection. The naturally recurring original ornament pixels survive both chapter-level controls, and a planted dark-pixel intersection passes.

## Decision and boundaries

Do not pursue a hypothetical **identically positioned grayscale image shared across every unsolved page** as a way to reveal the missing LP2 key. This specific carrier cannot exist in the supplied original decoded image raster. The test makes no claim about chapter-specific layers (the controls demonstrate those exist), colors on individual pages, different page-coordinate alignments, information in JPEG coefficient encodings, faint marks that appear on only some pages, or a keyed cross-page combination. It does not determine author intent, nor does it constrain ordinary cryptographic text ciphers.

Reproducer: [original 56-page brightest-intersection SFT](../sims/lp2_crosspage_common_raster_gate.py), requiring NumPy and Pillow and running on the checked-in original JPEGs. Original inputs and per-threshold expected values are fixed in the script.
