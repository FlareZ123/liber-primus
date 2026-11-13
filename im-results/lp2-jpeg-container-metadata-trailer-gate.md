# Original LP2 JPEG container framing: metadata and terminal trailer exclusion

**Evidence class: source-exact carrier restriction, 13 November 2026 (Agent14).** The original 58 Stage11 LP2 scans have no per-page JPEG APP/COM metadata carrier and no appended post-EOI trailer. This does **not** exclude OutGuess, OpenPuff, manipulation of entropy-coded DCT coefficients, visible illustrations or an external key. No encrypted LP2 plaintext, historical key or next-stage instruction was recovered.

## Why this route was inspected

Earlier 2012/2014 Cicada rounds used image steganography and specifically motivated looking at the actual image container rather than rune transcription alone. One independently accessible hidden channel would be supplementary JPEG application markers, comments, or bytes appended after the image, possibly differing by physical page. This is a finite, parser-checkable question and requires no password or speculative cipher key.

## Exact source and method

The 58 original LP2 JPEG files are `resources/liber-primus/17.jpg` through `74.jpg`, corresponding to physical pages 0–57. The original-source archive and page mapping are described in [Stage11 source publication](lp2-stage11-original-release-index-envelope.md). Read all files byte-for-byte; for each scan, parse marker segment lengths from SOI to the first SOS, record APPn/COM, check baseline SOF0 and DQT, and require that the final two file bytes are the exact EOI marker `FF D9`. This last check only excludes bytes *after the final EOI*; no claim is made about hidden entropy-coded bytes *before* EOI.

The [single-file original-input reproducer](../sims/lp2_jpeg_container_nonentropy_sft.cjs) uses Node.js 22, requires no dependencies or image rewriting, and asserts all figures below. Positive mutation controls insert a synthetic APP1 marker and append a synthetic trailer byte; both modified copies are detected. The actual source scans are never changed.

## Original-source observations

| Independent property | Observed on the original 58 scans |
| --- | --- |
| APPn markers before SOS | Only APP0 JFIF (16-byte segment) and APP2 ICC_PROFILE (2,592-byte segment) |
| Distinct APP0 segment content | **1**, shared by all 58 |
| Distinct APP2 segment content | **1**, shared by all 58 |
| APP1 EXIF or other APPn | **0 pages** |
| JPEG COM marker | **0 pages** |
| Bytes after last EOI marker | **0 on each of 58 pages** |
| Image class | **35 RGB**, **23 grayscale**, all baseline SOF0 |
| DQT content | One common luminance table on all 58; one common chroma table on all 35 RGB scans |
| Distinct complete *header-marker shape* sequences | **46**, explained by varying image coding/header lengths, without distinct APP/COM material |

Exact SHA-256 of common marker content excluding marker and two-byte segment length: APP0 `fb259e3d53dc86ac12d161aef88d442454ba017b260166043144cf2378b74f1e`; APP2 `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f`. The APP2 marker contains the already independently identified Artifex sRGB ICC profile; compare the 2,576-byte body and [prior exact ICC source audit](lp2-artifex-icc-five-cycle-original-key.md). This result does not re-interpret that profile as a key.

## Cryptanalytic consequence

No per-page instruction or additional binary object can be extracted from *non-image* APP/COM fields or a post-EOI appended trailer in these original JPEGs. The only APP fields are fixed across pages and already accounted for. Therefore, candidate page-specific steganographic routes must reside in the image-coded data itself, in the visible printed material, or in external material. This remains a **scope-limited exclusion**, not a reason to stop historically motivated pixel/coefficient analyses.

**Reproduction:** `node sims/lp2_jpeg_container_nonentropy_sft.cjs` from the repository root with original images in place. 58/58 source assertions and both injected controls pass.