# Physical p40–55 floral margin, original JPEG DCT-level sidecar gate

**Agent13, 23 November 2026. Intermediate source-level exclusion for Director #2273. No unknown-page plaintext, author-selected key or final destination recovered.**

A prior exact 16-page [decoded-RGB comparison](lp2-floral16-border-no-page-private-sidechannel.md) found that all LP2 physical pages p40–55 (original scans 57.jpg–72.jpg) use identical floral margins, with every page-varying RGB pixel confined to the bbox **x591..1831, y624..3183** on the 2400×3600 source image. That report correctly left open an **invisible compressed-JPEG coefficient** carrier where displayed RGB pixels were equal. Cicada's earlier use of JPEG steganography makes this a distinct physical channel worth resolving.

## Experiment on the original JPEG coefficient arrays

The source-exact [standalone C11/libjpeg reproducer](../sims/lp2_floral_dct_border_sft.c) calls the native libjpeg coefficient API, which returns quantized 8×8 DCT arrays **before** RGB color conversion and IDCT. It checks each original source image independently against p40. It selects only **entire blocks outside** the previously established source union bounding box. No thresholding, pixel differences, re-encoding, key guessing or plaintext model enters the test.

- The *luminance* component has 300×450 blocks of 8×8 coefficients. **85,080** whole blocks per page lie wholly outside the change bbox. For the fifteen other original images, this tests **81,676,800 individual quantized DCT coefficients** against p40; every coefficient is exactly equal. The images include 11 grayscale JPEGs and five RGB JPEGs, despite their different scan coding modes.
- The only five true RGB files in this 16-page group are p40, p49, p53, p54 and p55. For these, each of Cb and Cr is sampled at 150×225 blocks, corresponding to 16×16 raster footprints. **21,110** whole chroma blocks per component lie wholly outside the variable bbox. Comparing the four other colour pages to p40 gives another **10,808,320 exactly identical original quantized coefficient values** in total across the two chroma components. The other eleven JPEGs are encoded directly as grayscale and have no hidden chroma component.
- Every scan has consistent source dimensions and the same luminance quantization table. No nonzero physical-margin DCT difference survives in any of the three applicable components.

The C program was executed locally against the sixteen original images from the maintainer-provided JPEG archive. The result was:

> PASS p40-55: 81,676,800 Y and 10,808,320 Cb/Cr border DCT coefficients identical

The original JPEG's APP0 and APP2 prefatory marker payloads, its clean EOI, and its optimized Huffman/scan coding were **already independently resolved for all 58 LP2 images**, including these sixteen, in the earlier [source-wide byte-identical entropy reconstruction](lp2-jpeg-entropy-reconstruction.md) and [Huffman container audit](lp2-jpeg-huffman-container-audit.md). Those original analyses establish a stronger complete-file syntax gate; this report's incremental contribution is strictly the **wider full exterior (the complement of the known RGB-change bounding box) DCT coefficient comparison**. The earlier DCT test covered full-height strips x<512 and x≥1888, establishing 55,296,000 identical Y and 7,372,800 chroma comparisons; this test extends the coverage to 81,676,800 Y and 10,808,320 chroma comparisons, including image-top/bottom regions. The shared APP2 ICC profile is common renderer metadata rather than any detected page-varying message.

## Decision and remaining viable locations

A decoder that requires **page-specific DCT coefficient differences in the visually invariant exterior margins of p40–p55** has no data to consume. This sharpens the earlier decoded-pixel exclusion to the actual quantized compressed image content. It is **not** an assertion that every JPEG entropy-coding choice is uniquely determined by the image, or that page-variable material in the rune/title area, central illustrations, punctuation, a shared image profile, or historical out-of-band files is absent. The visible source art could still select a *constant shared* rule.

For the no-repeat constrained-code question, retire original floral **outer-margin** pixel and DCT-coefficient sidecars; look for an explicit reversible instruction selecting information in original-changing areas, an authenticated external key, or another source-visible cryptographic model. Additional random seeds applied to identical border samples cannot recover page-private exception bits.
