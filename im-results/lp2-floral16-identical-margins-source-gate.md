# Original LP2 floral margins: exact source raster and quantized DCT identity

**Status (12 November 2026): source-original negative on a page-varying floral-art key channel.** The sixteen physical LP2 pages p40–55 (JPEGs 57–72) share the same ornate left and right border. Their decoded RGB pixels and, within each matched JPEG encoding profile, **every original quantized DCT coefficient in those art regions** are identical. Neither a page-dependent visible mark nor a page-dependent coefficient alteration in these fixed regions supplies a key. No unknown LP2 plaintext or authenticated key was recovered.

## Human-source premise and independent countercontrol

The decorative branches, buds and roots are conspicuous. A 2014 human solver might overlay successive printed pages to look for differences, and an embedded key could conceivably change compressed JPEG coefficients without changing the apparent page image. This is worth an original-byte test because Cicada demonstrably used JPEG steganography in earlier stages.

Prior [original-image RGB comparison](../sims/lp2_floral16_template_pixel_gate.py) established the floral pixel identity and differentiated the changing central text. The new quantized-DCT test removes its explicit open caveat that these shared art pixels might conceal **page-specific different DCT coefficients**.

## Pixel-level original observation

All sixteen original pages are 2400×3600 pixels, with no crop registration or resizing. Original p40 is the visual template. The cropped left border is [70,600,550,2950); the right border is [1850,600,2380,2950). Comparing decoded RGB values on all fifteen other pages yields:

| Source crop | p40 versus p41–55 | Changed RGB values |
| --- | ---: | ---: |
| Left decorative border, 480×2350 pixels | 15/15 exactly equal | 0 |
| Right decorative border, 530×2350 pixels | 15/15 exactly equal | 0 |
| Central text, [650,650,1750,2850) | 15/15 different | multiple |

This previously closed the simplest visible page-dependent branch/dot pattern. A planted single-pixel border mutation is detected by the pixel SFT.

## Newly checked original quantized JPEG coefficients

[Source-original DCT SFT](../sims/lp2_floral16_margin_quantized_dct_sft.c) uses libjpeg's \`jpeg_read_coefficients\` and \`access_virt_barray\`; **no re-encoding or pixel-domain forward DCT** occurs. It compares entire original coefficient blocks lying strictly within the same floral rectangles, using the source JPEG's component sampling factors. Every component is compared, not only luma. The central variable-text crop is a full positive test on each pair.

The source images naturally divide into two profiles with internally identical original quantization tables and component counts. Cross-profile coefficient comparisons would conflate different JPEG encodings, so the following are the decisive like-for-like comparisons:

| Exact encoding profile | Original JPEG files | Baseline | Distinct pairs | Original floral coefficient comparisons | Differences |
| --- | --- | --- | ---: | ---: | ---: |
| One-component grayscale | 58–65, 67–69 | 58.jpg | 10 | **23,252,480** | **0** |
| Three-component colour | 57, 66, 70–72 | 57.jpg | 4 | **13,860,864** | **0** |
| **Total** | **All sixteen p40–55 pages** | two profile baselines | **14** | **37,113,344** | **0** |

The two floral crops contain 17,287 and 19,045 complete grayscale coefficient blocks per page pair, or 25,755 and 28,389 blocks across Y/Cb/Cr for a colour page pair. The source code asserts geometry, component counts, quantization equality and the exact 37,113,344 aggregate.

Each of the same 14 original-image pairs was also compared over the variable central text region, with **nonzero** quantized-coefficient differences. Across floral and text checks combined, the program compares **75,271,680 coefficients** and passes all original-image controls. This confirms that the all-zero floral result is a genuine region-specific observation rather than a broken DCT reader.

## Cross-page text glyphs as an independent DCT side-channel control

The floral comparison leaves a possible stronger attack: a page author could change **quantized DCT coefficients in printed letters** while leaving the decoded rune glyphs visually unchanged. The new [source-original exact-pixel test](../sims/lp2_grayscale_text_samepixels_dct_sft.c) checks repeated text-region patches with **no DCT coefficient search and no estimated raster similarity**.

Freeze the eleven one-component grayscale original JPEGs 58–65 and 67–69. Decode every original 8×8 grayscale block, compare the exact **64 decoded byte values**, and record each corresponding original **64 quantized JPEG DCT coefficients**. Restrict to the original central-text rectangle [656,656,1744,2848), snapped inward to complete block coordinates. Count only blocks containing at least four pixels with grayscale value below235 and contrast at least25. This removes most empty background. Compare all pixel-identical blocks, including those from different physical pages, using full byte equality rather than a hash.

| Independently observable quantity | Count |
| --- | ---: |
| Original ink-bearing central-text blocks | **119,939** |
| Distinct exact 8×8 raster patterns | **17,405** |
| Repeated raster-pattern groups | **6,131** |
| Repeated-pattern block instances | **108,665** |
| Groups recurring on two or more original pages | **5,337** |
| Instances in groups recurring across pages | **106,703** |
| Groups with two identical raster patterns but different original DCT coefficients | **0** |

The source-exact positive alters one quantized coefficient in an in-memory copy of an original matched sample while leaving its decoded 64-byte raster patch intact. The same equality comparison detects the deliberately introduced mismatch. No original JPEG is modified.

**Decision:** a deliberately different quantized-coefficient watermark superimposed on otherwise exactly pixel-identical glyph patches is absent from these 11 original grayscale pages and source-selected central-text regions. This is an exact finite test of a potentially readable *cross-page difference channel*; it does not exclude glyphs with genuinely different pixel blocks, coefficient changes whose pixel reconstruction also changes, the five colour JPEGs, or a static payload common to all repeats. It does not license extracting unknown plaintext or a key. Unlike the margin result, it covers changing printed text and multiple independent page positions.

## Cryptanalytic decision and scope

The original fixed art cannot encode a **varying** per-page key in either decoded pixel changes or the quantized coefficient values of its matched JPEG components. Any variation in compressed bitstream produced solely by original image-dependent Huffman tables does not contradict this coefficient identity; a common static stego payload could also occur in all pages. Text fields, moth/pale-tree artwork outside the defined margins, image-wide metadata, password-selected coefficient traversals and other source channels remain outside the exclusion.

Therefore retire further searches for **different border DCT coefficients among these sixteen images**. A new image-source attack needs an independent clue that selects a different concrete carrier, a common payload, or a decoding mechanism. This narrow source result is more decisive than an unmotivated new cipher sweep, while supplying neither plaintext nor a key.

## Reproduce

The existing RGB SFT is \`sims/lp2_floral16_template_pixel_gate.py\`. The new single-file C reproducer is \`sims/lp2_floral16_margin_quantized_dct_sft.c\`, requiring libjpeg headers and library. It reads originals directly from \`resources/liber-primus\` and needs no extra downloaded data or test vectors. On a system with a C compiler and libjpeg, compile the C file linked against libjpeg, then run the program from the repository root. It prints every original pair's floral zero-difference and text-positive counts and asserts the exact totals.

The SFT was first run on the separately supplied original 75-JPEG ZIP archive; the same file names correspond to the byte-pinned original repository resources. The existing [general JPEG carrier audit](lp2-jpeg-marker-dct-initial-audit.md) separately checks marker/DQT/DHT properties and the archived 2014 OutGuess-positive carriers.
