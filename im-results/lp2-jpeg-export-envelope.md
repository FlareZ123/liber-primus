# LP2 JPEG export-envelope audit

**Agent16 independent exploration, 28 November 2026.** The 58 original LP2 JPEGs contain a real common production fingerprint, but no page-specific JPEG-container payload usable as a hidden key/state channel.

## Exact source facts

Physical `17.jpg` through `74.jpg` are LP2 p0–p57. A marker-level parse of the original bytes gives the same outer envelope on all 58:

- 2400×3600 pixels, baseline JPEG/JFIF 1.01;
- JFIF density unit = inches, X/Y density = **400×400 dpi**, so the declared canvas is exactly **6×9 inches**;
- one APP0/JFIF segment and one APP2 ICC profile;
- the APP2 payload is identical on all 58 pages, SHA-256
  `942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0`;
- that profile identifies itself as **Artifex Software sRGB ICC Profile**, copyright **Artifex Software 2011**;
- no APP1/EXIF segment, JPEG COM segment, or bytes after EOI occurs on any LP2 page;
- every page uses the same luminance quantization table.

The 17 earlier physical JPEGs `00.jpg`–`16.jpg` are a useful control: none contains an embedded ICC profile. Some already declare 400 dpi and share the later luminance quantizer, so neither the density nor quantizer alone identifies the LP2 generation step. The **identical Artifex ICC envelope across all 58 LP2 pages** is the cleaner release-level fingerprint.

## Ordinary encoding split

The only repeated structural split inside LP2 is image color mode:

- 35 pages are three-component JPEGs and include the common luminance table plus a chroma table;
- 23 pages are one-component grayscale JPEGs and contain only the common luminance table.

The grayscale pages are p16–21, p24–25, p28–31, p41–48, and p50–52. This is an ordinary raster property, not an independent cipher state. All 58 Huffman-table byte strings differ, consistent with image-dependent encoding and providing no repeated metadata alphabet.

## Pipeline interpretation

The ICC profile is a standard Artifex/Ghostscript color-management asset. Ghostscript documentation describes its default ICC profiles for undefined RGB/gray color spaces, and a documented ImageMagick PDF-read example exposes the same 2576-byte **Artifex Software sRGB ICC Profile** when Ghostscript is the delegate:

- https://ghostscript.readthedocs.io/en/latest/GhostscriptColorManagement.html
- https://github.com/ImageMagick/ImageMagick/discussions/6292

A 2026 external measurement independently reports the same Artifex-profile/quantization observation on the 58 numbered pages:
https://artwaste.land/strata/liber-primus-measured/

The defensible inference is narrow: **all 58 LP2 pages passed through one Artifex/Ghostscript-family color-managed rasterization/export envelope at 400 dpi**. The JPEG bytes do not identify the upstream editable format or exact application. In particular, the ICC profile alone does not prove that Cicada authored in PDF, PostScript, TeX, or any specific program.

## Cryptanalytic consequence

This closes a cheap but previously unindexed source-side lane:

1. there is no EXIF/comment/post-EOI payload carrying page-local key/state;
2. there is no page-varying ICC/profile field to type cipher families or page order;
3. the common 400-dpi 6×9-inch canvas is a legitimate **physical coordinate system** for future source-geometry tests;
4. source acquisition should target the lost paged/editable object *upstream* of this rasterization stage rather than mining JPEG metadata.

Any future geometry proposal can now state coordinates in physical units directly: 400 pixels = 1 inch. A proposed PDF/PS/editable-source recovery gains a strong control if rendering it through the candidate pipeline reproduces the 6×9-inch/400-dpi envelope and identical Artifex ICC profile.

**Reproduce:** `node sims/lp2_jpeg_export_envelope_sft.cjs`.
