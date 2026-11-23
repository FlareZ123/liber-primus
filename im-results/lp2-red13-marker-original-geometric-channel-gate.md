# Original LP2 red 13-dot marker geometry: no independent macroscopic glyph channel

**23 November 2026, Agent37.** Original-image source test, not an LP2 plaintext recovery. [Reproducible single-file test](../sims/lp2_red13_marker_geometry_source_sft.py).

## Causal question

Could the visibly unusual **13-dot red punctuation glyphs** supply the otherwise missing decryption state by carrying binary choices in their internal dot layout? This is a natural, observable source channel: the same 13-dot glyph divides colored headings and chapters, is repeated on unsolved pages, and is preserved in the authenticated solved p56/p57 pages. A designed variant of a familiar 13-dot marker could carry a tiny key without needing an external file.

The competing interpretation is that the glyph is simply **one typeset punctuation character** reused verbatim; only its placement, size class and red/black color are meaningful.

## Source-exact experiment and result

I analyzed **all 58 original LP2 JPEGs, archive 17.jpg–74.jpg**, from the owner-supplied 75-image ZIP, using pixel-connected components of the red foreground (RGB threshold fully specified in the SFT). The canonical [source ink annotations](../resources/liber-primus/lp2-ink-annotations.json) provide an independent expected count by page.

- **30/30 red thirteen-dot symbols found**, matching the image-annotated page counts exactly. This includes **two** authentic solved p56 markers and the **initial** solved p57 marker; the distinct terminal 23-dot symbol is not misclassified. The p7 black thirteen-dot symbol is outside this explicitly red-ink test.
- Every one has the same **13 solid rectangular dots**, in a **five-dot vertical center column and four-dot columns to its left and right**. No missing, added, joined, stretched, swapped, or rearranged dot exists at this extracted-pixel scale.
- All **390** dot bounding boxes have exactly width × height thresholded red pixels, hence no internal binary hole or decorative contour. Relative to the first center-dot bounding box, every dot's top-left corner falls within **one image pixel per coordinate** of the same fixed 13-position stencil; the residual histogram is `(-1,-1):11; (-1,0):29; (0,-1):79; (0,0):227; (1,-1):4; (1,0):40`.
- Across 30 markers there are multiple *integer-pixel raster signatures* (11 distinct relative-coordinate patterns), so **do not treat exact pixel identity as proved**. Their differences are ±1-pixel rounding-like offsets of the same topology, also seen on solved-page controls. Nothing in the original source authenticates a bit encoding of those small raster differences.
- A separate exact per-marker sampling of all 390 **interior red dot pixels** (two-pixel inset) gives center-ink median red-channel levels **190–193**, green **0**, blue **0–2**, with the ordinary expected red around **RGB(192,0,0)**. The same variation appears across the clear solved controls; there is no visibly distinct red ink color class furnishing an independent symbol alphabet. Sample computation and frozen assertions are included in the SFT.

The full SFT prints every page-local marker coordinate, verifies each annotation count, and exits only after validating the 390 components, same topology and solved-page controls. Test from a repository checkout using Python with Pillow/NumPy/SciPy, or supply the owner ZIP with the script's `--zip` option. The local owner-ZIP execution passed all assertions.

## Decipherment implication and limitations

The thirty red large markers provide **no observed macro-level variant symbols** from which to read an independent bit string or 2014-human-recognizable key. Their **positions, the red/black distinction, and the separate 10-dot / 23-dot glyph classes** remain legitimate, source-visible evidence and are unaffected by this result. The test does **not** disprove deliberately encoded subpixel raster encodings, JPEG color-channel payloads, or cues outside the dot glyphs; those would need an independently motivated extraction rule and suitable image-production controls.

**Decision:** do not promote the thirteen-dot internal arrangement to an LP2 key or re-run free phase/threshold scans on its raster aliases without a predeclared, independently sourced coding rule. No plaintext, key, or cipher operation was recovered. This is a narrow source-channel negative, not an explanation for the broader anti-repeat phenomenon.
