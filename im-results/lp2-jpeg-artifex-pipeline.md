# LP2 JPEG production fingerprint: exact Artifex/Ghostscript profile and export invariants

**Agent 8 — 2026-11-28.** This is an artifact-forensics result on the original LP2 JPEG bytes. It does **not** recover plaintext or prove a cryptographic mechanism. It materially narrows the historical-source search: all 58 LP2 pages came through a highly uniform JPEG production/export pipeline carrying an exact historical Ghostscript color-profile blob, unlike LP1.

## Established byte facts

Input is the repository owner's 75-JPEG archive, independently pinned in `resources/liber-primus/` to the dated 11 May 2014 Stage11 Onion7 archive. LP2 physical p0–p57 are archive files `17.jpg`–`74.jpg`.

For **every one of the 58 LP2 JPEGs**:

- raster size is exactly **2400 × 3600 px**;
- JFIF is version **1.01**, density units are inches, density is **400 × 400 dpi**, and thumbnail dimensions are zero;
- therefore the nominal rendered page is exactly **6 × 9 inches**;
- encoding is baseline sequential JPEG (SOF0), not progressive;
- quantization is exactly the IJG quality-**92** table family;
- there are no bytes after EOI;
- marker order is fully regular:
  - RGB pages: `SOI APP0 APP2 DQT DQT SOF0 DHT DHT DHT DHT SOS EOI`;
  - grayscale pages: `SOI APP0 APP2 DQT SOF0 DHT DHT SOS EOI`;
- the APP2 `ICC_PROFILE` payload reconstructs to the **same 2,576-byte profile** on every page:
  - SHA-256 `942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0`
  - Git blob SHA-1 `627e8feb0ec9635c9672deff48b0d3bb9e1bc024`
  - description: `Artifex Software sRGB ICC Profile`
  - copyright: `Copyright Artifex Software 2011`.

The RGB pages use the standard 4:2:0 sampling layout `Y=2×2, Cb=1×1, Cr=1×1`; grayscale pages are single-component `1×1`. Huffman tables are page-specific/content-dependent across all 58 pages, while quantization remains fixed.

The physical-page component split is:

- RGB: p0–15, p22–23, p26–27, p32–40, p49, p53–57 (**35 pages**);
- grayscale: p16–21, p24–25, p28–31, p41–48, p50–52 (**23 pages**).

Mode string p0→p57:

`RRRRRRRRRRRRRRRRGGGGGGRRGGRRGGGGRRRRRRRRRGGGGGGGGRGGGRRRRR`

This split should be treated as production/export metadata unless independent evidence makes it cryptographic.

### LP1 control

The 17 LP1 images provide an internal negative control:

- all are 2400 × 3600 RGB;
- **none contains an ICC profile**;
- JFIF density has two variants rather than one;
- there are three DQT families rather than one;
- only 8/17 identify as IJG Q92.

Thus the uniform Artifex/400-dpi/Q92 fingerprint is specifically characteristic of the LP2 release pipeline, not merely a property of every JPEG in the combined archive.

## Exact Ghostscript provenance of the ICC payload

The LP2 ICC profile is not merely “similar to” an Artifex profile. Its Git-object SHA is exactly the historical Ghostscript blob.

Artifex commit
[`eaec68d05c8d223cb97d89b6a3a9a96e550feeb2`](https://github.com/ArtifexSoftware/ghostpdl/commit/eaec68d05c8d223cb97d89b6a3a9a96e550feeb2),
dated **2011-07-26 05:50:05Z**, changed `gs/iccprofiles/default_rgb.icc` to “our own sRGB ICC profile.” At that commit the file's Git blob SHA is exactly:

`627e8feb0ec9635c9672deff48b0d3bb9e1bc024`

which is the Git blob SHA computed directly from the 2,576 bytes embedded in each LP2 JPEG.

This establishes that the LP2 export carries the historical Artifex/Ghostscript `default_rgb.icc` byte payload introduced in July 2011.

A second Artifex commit,
[`2cde54397abe935ff96300a4ac2588b40ad68d2b`](https://github.com/ArtifexSoftware/ghostpdl/commit/2cde54397abe935ff96300a4ac2588b40ad68d2b),
dated **2011-12-05 18:03:47Z**, added device ICC-profile embedding to Ghostscript's JPEG output device. Its `gdevjpeg.c` patch embeds the device profile only when:

`icc_profile->num_comps == pdev->color_info.num_components`

This provides a source-code-level lower bound on the direct Ghostscript JPEG path carrying this type of ICC marker and is important for the grayscale asymmetry below.

## Controlled reproduction

Local Ghostscript **10.05.1** was used to render a 6×9-inch PostScript page with:

`-sDEVICE=jpeg -r400 -dJPEGQ=92`

The resulting RGB JPEG reproduces the LP2 container structure:

- 2400×3600 pixels;
- 400×400 JFIF density;
- 4:2:0 RGB/YCC sampling;
- APP0/JFIF followed by APP2/ICC;
- the same IJG Q92 DQT bytes;
- SOF0 baseline encoding and optimized/content-dependent Huffman tables.

The current Ghostscript default RGB profile is the same lineage and same 2,576-byte size, differing from the LP2 historical payload at only two byte offsets. The exact historical blob match above therefore identifies the LP2 profile version more precisely than a current-tool reproduction can.

## Grayscale pages imply a secondary or nonstandard step

All 23 one-component LP2 grayscale JPEGs still carry the **3-component RGB** `default_rgb.icc` payload.

Ghostscript's own JPEG-profile embedding code requires the device/profile component counts to match. A straightforward direct `jpeggray` export therefore does not explain a one-component JPEG carrying this RGB profile. Current Ghostscript `jpeggray` also emits its gray profile instead.

A strong candidate is a later **lossless JPEG component-drop** operation on RGB exports. For example, libjpeg's `jpegtran -grayscale` discards chrominance channels while preserving luminance DCT coefficients, and its marker-copy options can preserve ICC APP markers. That mechanism would naturally leave:

1. one JPEG component;
2. the same luma Q92 quantization table;
3. a stale RGB ICC APP2 marker;
4. no luminance recompression loss.

This candidate is **not yet established**: the exact 2014 conversion tool/command has not been reproduced from historical binaries, and another metadata-preserving component-drop tool could produce the same state.

## What this changes

The original Onion7 carrier is a static set of 58 JPEGs plus `index.html`; the dated participant archive contains no sibling PDF/PS/layout source. The byte fingerprint makes the missing historical input much more concrete.

The highest-value source-recovery target is now:

> a **pre-JPEG LP2 page-layout or raster precursor** and/or the conversion command/script that produced the 2400×3600, 400-dpi, Q92 JPEG set through the Artifex/Ghostscript pipeline.

A surviving PDF/PostScript/layout source or RGB intermediate could expose information destroyed or flattened by the final JPEG pass: vector text/font encoding, object/layer ordering, exact coordinates and page boxes, non-rendered objects, original color state, or generator metadata. Those are plausible sources for a clue-selected representation or operator that ciphertext-only searches currently lack.

This result also clears two weak steganographic interpretations:

- the APP2 ICC bytes are uniform toolchain metadata, not a page-varying hidden payload;
- the DQT values are a fixed Q92 production setting, not a page-varying key stream.

The RGB/grayscale page-mode run pattern is worth retaining as production-history metadata, but present section-boundary checks are not exact enough to promote it to a cryptographic partition.

## Reproduction

Run:

```
python sims/lp2_jpeg_pipeline_fingerprint_sft.py /path/to/liber-primus-jpegs.zip
```

The SFT parses JPEG markers directly; no image decoder is required. It reconstructs ICC chunks, computes both SHA-256 and Git blob SHA, identifies IJG quantization quality, verifies dimensions/density/sampling/page-mode sets, and checks LP1 as a control.
