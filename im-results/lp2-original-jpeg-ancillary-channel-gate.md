# LP2 original JPEG ancillary transport: no page-specific metadata or appended bytes

**Result (14 November 2026, Agent9):** A complete marker-level inspection of every original second-release JPEG `17.jpg` through `74.jpg` finds the same two conventional application segments in each image: **APP0/JFIF followed by APP2/ICC_PROFILE**. There are **no COM comments, no other APP segments, no bytes following the final JPEG EOI marker, and exactly one complete SOS scan in all 58 images**. This constrains an independent source-payload route through image-container metadata or raw appended files; it **does not rule out** encoded JPEG pixels/DCT coefficients, visual clues or payloads represented by original image content. No unknown GP29 plaintext, key, or final destination has been recovered.

## Original input and independent motivation

A 2014 human solver obtained actual JPEG page files, and earlier Cicada rounds used file-based steganography and embedded messages. Before adding another invented key to the 12,956 unresolved GP29 runes, a metadata carrier would be a cheap, sharply testable way to recover authentic external instructions. The **original LP1 scans are deliberately outside this bounded test**: LP1 `05.jpg` has a documented post-EOI payload and `10.jpg` concatenates other JPEGs. The question here is whether *the separate 58 LP2 images* have any analogous directly declared container carrier.

Source images: unchanged `resources/liber-primus/17.jpg` … `74.jpg`, physical LP2 p0–p57 (including the runeless p50). The archive's original-to-physical page mapping is described in [the image resource README](../resources/liber-primus/README.md). No image OCR or rune transcription enters the test.

## Exact original-source result

| Scope | Count / measured behavior |
|---|---|
| Original LP2 files examined | **58 / 58** |
| JPEG header segments in each | exactly one **APP0** and one **APP2** |
| Other APP segments, Exif, XMP or COM comment carriers | **0** |
| SOS scans | **1 each** |
| Nonempty suffix beyond final JPEG EOI | **0 / 58** |
| Distinct APP2 ICC-profile byte strings | **1**, identical across all files |
| ICC profile size | **2,576 bytes** |
| Identical ICC profile SHA-256 | `942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0` |
| ICC profile self-description | `Artifex Software sRGB ICC Profile`; copyright `Artifex Software 2011` |

The identical ICC segment is the valid standard image colour profile, with a complete 2,576-byte ICC record whose declared byte length matches its actual payload, valid `acsp` signature, ten standard colour-calibration tags and ordinary profile description/copyright. The profile equality demonstrates **no page-distinguishing byte material in the ICC fields**. It does not prove that an identical profile is incapable of serving as a globally reused key, and it does not turn the software description into creator attribution.

The exact source-`17.jpg` size is **695,525 bytes**, demonstrating that the tool reads real image files rather than a synthetic stand-in. The SFT parses JPEG 0xFF markers, handles 0xFF00 entropy escaping and restart markers, respects length-prefixed segments, and detects bytes beyond JPEG EOI.

## Positive controls and boundaries

The same parser detects an explicitly injected **COM `SOURCE-ANNOUNCED-SECRET`** segment and a separate planted **14-byte `SECRET-TRAILER`** after EOI. Both positive controls pass in the unchanged source corpus read path. Thus a straightforward metadata or appended-data hiding channel, if it existed in an original LP2 JPEG, would be observable under this test.

**Cryptanalytic decision:** Stop looking for an original-LP2 key in these two JPEG file-header metadata channels or a bare post-EOI suffix unless a distinct source object or new independently selected container operation appears. This test explicitly leaves all original JPEG DCT coefficient, bitstream, pixel, graphic, and cross-image operations open. In particular, it does not supersede the separately calibrated OutGuess/F5 and original-illustration studies, and should not be cited as an absence-of-steganography theorem.

**Reproduce:** `node sims/lp2_jpeg_ancillary_original_sft.cjs` on Node 22 with original `resources/liber-primus/17.jpg`…`74.jpg` available. The complete runnable [single-file test](../sims/lp2_jpeg_ancillary_original_sft.cjs) uses only built-in Node modules and emits the original counts, ICC hash and positive-control status. It was executed locally against all 58 byte-identical owner-supplied images, passing all assertions, and its source was committed and remotely checked.
