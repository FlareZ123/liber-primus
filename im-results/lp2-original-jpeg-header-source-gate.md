# Original LP2 JPEG container metadata: complete header gate (12 November 2026)

## Decision

The complete **58-image** original LP2 source set does not expose a page-dependent key in the literal JPEG APP metadata, a COM block, differing quantization tables within a component class, or bytes appended after the terminal JPEG EOI. This is a **bounded container/header negative**. It does **not** exclude OutGuess, F5 or other modifications to entropy-coded image coefficients, an independently supplied stego password, or steganographic meaning in the drawings.

The exact source files are `resources/liber-primus/17.jpg` through `74.jpg`, physical LP2 pp0–57. [Independent executable parser](../sims/lp2_jpeg_header_gate_sft.cjs) reads all 58 original JPEGs directly, asserts their structure and prints the classifications. It uses only Node.js built-ins and makes no file writes.

## Complete original-byte observations

| Source feature | Result |
| --- | --- |
| Dimensions | All 58 are **2400×3600** pixels; embedded resolution is **400 dpi** |
| APP markers before SOS | Each has **one APP0/JFIF** and **one APP2/ICC**; **no other APP markers** and no COM marker |
| APP0/JFIF payloads | All 58 byte-identical; SHA-256 `fb259e3d53dc86ac12d161aef88d442454ba017b260166043144cf2378b74f1e` |
| APP2/ICC payloads | All 58 byte-identical; SHA-256 `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f` |
| Identified ICC label | `Artifex Software sRGB ICC Profile` |
| JPEG frame classes | **35 three-component (color)** and **23 one-component (grayscale)** |
| Quantization payloads | Exactly **two** profiles: one common luminance DQT on all 58, one additional common chrominance DQT on the 35 color images |
| Huffman DHT segment payload combinations | **58** distinct combinations; these may vary in ordinary JPEG compression and do not by themselves establish an encoded key |
| JPEG EOI | Every full file ends exactly in `FF D9`; **zero trailing bytes** |

The 23 one-component LP2 physical pages are **16–21, 24–25, 28–31, 41–48, 50–52**. All 23 lack red rune spans or red dot punctuation in `lp2-ink-annotations.json`. Conversely the colored cohort includes 11 pages with no recorded red rune/punctuation; therefore image mode is not a one-to-one red-ink flag, and an editorial/export explanation is plausible. No independent original clue chooses the one-versus-three-component sequence as key material.

## Consequence for a human solve path

The copied ICC profile and JFIF metadata are common to all physical LP2 images and cannot serve as a per-page varying key unless an **additional externally selected transformation** is introduced. The original artwork and rune transcription remain the more direct visible clue channels. This result closes only the simple header/comment/trailer channel; **it is not a steganography census**.

The reproducible parser stops at the first SOS and makes no claim about Huffman-coded scan bits, DCT coefficients, restart markers, image-level noise or encrypted stego payloads. It also does not establish which software authored the missing editable source; the ICC label is an observed profile identity, not an authoring-file provenance claim.

## Reproduction

Execute `node sims/lp2_jpeg_header_gate_sft.cjs` from the repository (Node.js 22 tested with the same 58 owner-provided original JPEG bytes). It asserts every listed property and emits the grouped page classifications. This source-data finding belongs in supporting material; it neither supplies unknown LP2 plaintext nor a decoder.
