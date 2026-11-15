# Exact decoded-border invariance of the sixteen floral LP2 pages

**Original-image and coefficient-domain finding, 15 November 2026 (Agent 1).** The original floral LP2 pages pp40–55 / scans `57.jpg`–`72.jpg` repeat one exterior artwork template. All pp40–54 have **exactly identical decoded RGB borders**. Original JPEG quantized DCT coefficients within these regions are also **identical, coefficient for coefficient, among pages in the same grayscale or color export class**. The only p55 border changes occupy 16 luma DCT blocks where its separately drawn moth wing visibly enters the right border. This excludes a variable per-page exterior coefficient payload within those classes. No unknown LP2 plaintext, creator key or decryption instruction was recovered.

## Direct experiment on unchanged source scans

Use original repository `resources/liber-primus/57.jpg` as the fixed reference. Decode each original JPEG to Pillow `RGB` (three 8-bit channels), preserving each pixel's independent R/G/B values; compare absolute per-channel differences, no resizing, registration, thresholding, OCR, interpolation, or pixel selection using page content. Four exterior rectangles in original `(x0,y0,x1,y1)` coordinates:

| Region | Fixed rectangle |
| --- | --- |
| Left artwork/exterior | `(0,0,590,3600)` |
| Right artwork/exterior | `(1810,0,2400,3600)` |
| Top exterior | `(0,0,2400,600)` |
| Bottom exterior | `(0,3200,2400,3600)` |

Across scans **57–71**, the absolute-difference images for *all four* regions have zero nonzero pixels compared with scan57. In other words, all 14 other scans have precisely identical decoded exteriors to the reference, including the floral branches and small repeated side dots. The central variable-content rectangle `(590,600,1810,3200)` differs by over 1,000 pixels for every nonreference scan, so the equality is specific to the repeated frame and not an accidentally duplicated complete page.

Scan **72**, physical p55, has zero changed pixels in the left, top, and bottom rectangles. Its right exterior has **1,070 changed RGB pixels**, confined to an exact bounding box `(1810,2780,1832,2872)` in global coordinates. Original visual inspection identifies these as the tip of p55's distinctive moth wing entering the exterior cutoff, not a modified floral symbol. The common right floral decoration remains the same.

The [single-file Pillow reproducer](../sims/lp2_floral16_border_pixel_differential_sft.py) asserts each source image's original dimensions, every exact result, and a deliberate one-channel, one-pixel modified-source positive showing that the comparator identifies a true change. It writes no files. The source corpus mapping and 2014-authenticated JPEG provenance are in [the reference index](../resources/liber-primus/README.md).

## Original quantized JPEG coefficient test

Pixel agreement could conceal different DCT coefficients that quantize to the same displayed colors. The [original-source libjpeg SFT](../sims/lp2_floral16_border_dct_identity.c) calls `jpeg_read_coefficients` on unmodified JPEG files, comparing **all 64 signed quantized coefficients** in every fully contained exterior 8×8 block, without pixel rounding or re-encoding. It uses the four exact exterior rectangles specified above; boundary-straddling blocks are excluded. It checks the original dimensions, component sampling factors, quantization tables and that central blocks truly differ.

Compare the **grayscale scans** against grayscale reference `58.jpg` (ten candidates `59`–`65`, `67`–`69`) and the **color scans** against color reference `57.jpg` (four candidates `66`, `70`–`72`); these classes have different component structure and cannot be compared directly in the coefficient domain.

| Original JPEG class | Border quantized DCT comparisons | Actual differences |
| --- | ---: | --- |
| Grayscale Y: 10 comparisons against scan58 | 849,500 luma blocks | **Zero** blocks and coefficients changed |
| Color Y: scans66,70,71 against scan57 | 254,850 luma blocks | **Zero** blocks and coefficients changed |
| Color Cb/Cr: scans66,70,71 against scan57 | 126,216 chroma blocks | **Zero** blocks and coefficients changed |
| Color p55 scan72 against scan57 | 84,950 Y plus 42,072 chroma blocks | **16 Y blocks**, containing **311 changed signed coefficients**, all around the visible right-side moth-wing intrusion; **zero** Cb/Cr changes |

A one-AC-coefficient deliberate mutation is detected by the comparator. Every original candidate differs from its reference in the central text/illustration region, confirming that exact coefficient equality is specific to the common frame. This source result excludes **page-varying quantized DCT payloads in the unchanged exterior regions within each image export class**. It leaves static ornament, differential center content, invisible coefficient changes in the center, optimized Huffman codebooks, and other carrier formats outside the tested scope.

## Cryptanalytic decision

The repeated floral exterior is a **pixel-identical template** and, within each export class, a **quantized-DCT-identical template** except for the visible p55 moth wing. A page-index key therefore cannot be recovered from varying exterior petals, decoded border colors or differing exterior DCT coefficient parity in the specified regions. Static ornament may select a route; central glyphs, page-specific illustrations, changed optimized JPEG Huffman tables and text/boundary ordering remain separate inputs without a known extraction rule.

This is a bounded elimination of a particularly source-attractive *16-page decoration-variation* channel. It should prevent another attempt to read variable values from features that demonstrably never change. It does not authorize a new 4×4 key, encryption operation, or plaintext.
