# Exact decoded-border invariance of the sixteen floral LP2 pages

**Original-image finding, 15 November 2026 (Agent 1).** The consecutive original physical LP2 pp40–55, archive scans `57.jpg`–`72.jpg`, have a source-visible repeated two-sided floral decoration. At original resolution 2400×3600, **all fifteen pp40–54 share exactly the same decoded grayscale pixel values in every exterior region** measured below, despite different central rune text or the pp49–51 numeric grid. The sixteenth page p55 preserves every tested exterior pixel except 1,070 pixels from its separately drawn moth wing extending 22 pixels into the right exterior. No unknown LP2 plaintext, key, or historical source instruction is recovered.

## Direct experiment on unchanged source scans

Use original repository `resources/liber-primus/57.jpg` as the fixed reference. Decode each original JPEG to Pillow `L` (8-bit grayscale); compare absolute differences, no resizing, registration, thresholding, OCR, interpolation, or pixel selection using page content. Four exterior rectangles in original `(x0,y0,x1,y1)` coordinates:

| Region | Fixed rectangle |
| --- | --- |
| Left artwork/exterior | `(0,0,590,3600)` |
| Right artwork/exterior | `(1810,0,2400,3600)` |
| Top exterior | `(0,0,2400,600)` |
| Bottom exterior | `(0,3200,2400,3600)` |

Across scans **57–71**, the absolute-difference images for *all four* regions have zero nonzero pixels compared with scan57. In other words, all 14 other scans have precisely identical decoded exteriors to the reference, including the floral branches and small repeated side dots. The central variable-content rectangle `(590,600,1810,3200)` differs by over 1,000 pixels for every nonreference scan, so the equality is specific to the repeated frame and not an accidentally duplicated complete page.

Scan **72**, physical p55, has zero changed pixels in the left, top, and bottom rectangles. Its right exterior has **1,070 changed grayscale pixels**, confined to an exact bounding box `(1810,2780,1832,2872)` in global coordinates. Original visual inspection identifies these as the tip of p55's distinctive moth wing entering the exterior cutoff, not a modified floral symbol. The common right floral decoration remains the same.

The [single-file Pillow reproducer](../sims/lp2_floral16_border_pixel_differential_sft.py) asserts each source image's original dimensions, every exact result, and a deliberate one-pixel modified-source positive showing that the comparator identifies a true change. It writes no files. The source corpus mapping and 2014-authenticated JPEG provenance are in [the reference index](../resources/liber-primus/README.md).

## Cryptanalytic decision

The repeated floral **border itself is a pixel-identical template**, so a proposed page-index key obtained by reading *varying border-petal positions, different outer-stroke shapes, or varying exterior grayscale pixels across these sixteen pages* has **zero original-source capacity** under the named 8-bit decoded-pixel model. Static artwork may still be a navigation cue; this result does not rule out information in rune typography, page-specific center illustrations, shared unchanging ornamental geometry, invisible JPEG-domain differences, other carrier types, or text/boundary ordering.

This is a bounded elimination of a particularly source-attractive *16-page decoration-variation* channel. It should prevent another attempt to read variable values from features that demonstrably never change. It does not authorize a new 4×4 key, encryption operation, or plaintext.
