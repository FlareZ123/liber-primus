# LP2 JPEG export-envelope audit

**Agent16 independent reproduction and source-side consolidation, 28 November 2026.** The 58 original LP2 JPEGs contain a uniform production envelope and no page-local JPEG-container payload usable as a hidden key/state channel. This local audit independently reproduces the strongest earlier external toolchain measurements and preserves the result in this repository with a compact SFT.

## Exact source facts

Physical `17.jpg` through `74.jpg` are LP2 p0–p57. A marker-level parse of the original bytes gives the same outer envelope on all 58:

- 2400×3600 pixels, baseline JPEG/JFIF 1.01;
- JFIF density unit = inches, X/Y density = **400×400 dpi**, so the declared canvas is exactly **6×9 inches**;
- one APP0/JFIF segment and one APP2 ICC profile;
- the APP2 ICC payload is identical on all 58 pages, SHA-256
  `942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0`;
- that 2576-byte profile identifies itself as **Artifex Software sRGB ICC Profile**, copyright **Artifex Software 2011**;
- no APP1/EXIF segment, JPEG COM segment, or bytes after EOI occurs on any LP2 page;
- every page uses the same luminance quantization table, exactly the IJG Annex-K table for **quality 92**.

The 17 earlier physical JPEGs `00.jpg`–`16.jpg` are a useful control: none contains an embedded ICC profile. Some already declare 400 dpi and share the later luminance quantizer, so neither density nor quantizer alone identifies the LP2 generation step. The **identical Artifex ICC envelope across all 58 LP2 pages** is the cleaner release-level fingerprint.

## Ordinary encoding split

The only repeated structural split inside LP2 is image color mode:

- 35 pages are three-component JPEGs and include the common luminance table plus a chroma table;
- 23 pages are one-component grayscale JPEGs and contain only the common luminance table.

The grayscale pages are p16–21, p24–25, p28–31, p41–48, and p50–52. This is an ordinary raster property, not an independent cipher state. All 58 Huffman-table byte strings differ because optimized coding is image-dependent; they do not form a repeated metadata alphabet.

## Reconciliation with prior controlled toolchain work

Dukotah's independently developed Cicada corpus already contains the deeper production-pipeline controls that this repository had not indexed:

- `Dukotah/cicada3301@b271334d9718bf68187f7a1e6362731159c36a2a:liber-primus/analysis/round18/L1-toolchain/RESULTS.md` reproduces the 400-dpi geometry, exact Q92 DQT, Artifex ICC, 4:2:0 color sampling, optimized Huffman class and grayscale/color split. Its original positive control used a **Ghostscript JPEG render followed by an optimized re-encode** and matched the LP2 parameter vector.
- `.../round19/R1/RESULTS.md` red-teams the stronger claim that the second stage must be ImageMagick. A Ghostscript→PIL `quality="keep", optimize=True` chain reproduces the same relevant JPEG vector, so the final writer is **not uniquely identified** by those fields.
- `.../round34/S1-build-box/RESULTS.md` builds historical Ghostscript releases and shows the LP2 Artifex ICC is embedded by the JPEG device from **9.05 through 9.14** in the tested release band; 9.04 does not embed it. Under the May-2014 publication bound, this gives a strong render-stage compatibility band rather than a unique version.

The consolidated inference is therefore:

1. a **Ghostscript/Artifex-family render stage at 400 dpi is strongly supported** by reproducible controls;
2. historical render behavior is compatible with Ghostscript **9.05–9.14** under the tested build/device assumptions;
3. the final optimized JPEG re-encode is real, but **ImageMagick is not uniquely selected** because an alternative optimized writer can reproduce the discriminating vector;
4. the JPEG bytes do not identify the upstream editable format or exact authoring application.

This distinction matters. The export envelope is source evidence; a particular authoring program, PDF/PS producer, or second-stage executable remains an acquisition question.

## Cryptanalytic consequence

This closes a cheap source-side lane and leaves one useful physical contract:

1. there is no EXIF/comment/post-EOI payload carrying page-local key/state;
2. there is no page-varying ICC/profile field to type cipher families or page order;
3. the common **400-dpi, 6×9-inch canvas** is a legitimate physical coordinate system for future source-geometry tests;
4. source acquisition should target the lost paged/editable object *upstream* of the Ghostscript-compatible rasterization stage rather than mining JPEG metadata.

Any future geometry proposal can state coordinates in physical units directly: **400 pixels = 1 inch**. A recovered PDF/PS/editable source gains a strong authenticity/control test if its render reproduces the 6×9-inch/400-dpi envelope, Q92 tables and Artifex profile while preserving the original page pixels or independently explaining their raster differences.

**Reproduce:** `node sims/lp2_jpeg_export_envelope_sft.cjs`.
