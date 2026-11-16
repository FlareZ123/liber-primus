# Original JPEG out-of-band transfer and literal p50 DQT gate

**Classification:** Two source-triggered, exact-input negative gates. No LP2 unknown plaintext, authentic key, original inverse, or destination is recovered.

## Why this operation is historically motivated

The authentic Cicada 2014 Onion 3 source image, LP1 `05.jpg`, carries an **out-of-band** magic-square construction: a valid JPEG body, an appended 360-byte header containing 358 ASCII hex digits (179 decoded bytes), and a complete byte-reversed copy of that same JPEG body. This is an actual historical operation, documented by [the existing original-byte reconstruction](lp1-p05-trailer-mobius-matrix.md) and the contemporaneous [OpenPuff walkthrough](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf). It gives a human solver a concrete reason to inspect **actual end-of-image boundaries** on later LP JPEG sources, rather than inventing steganographic transformations.

The second limited hypothesis uses the original physical p49–51 field: its 32 printed rows by 8 cells can be partitioned into four 8×8 matrices, the shape of JPEG quantization tables used by the Cicada-era JPEG steganography ecosystem. It is conditional on reading the 256 original cells as conventional base60 bytes, as supplied in [the canonical source-derived grid](../resources/liber-primus/lp2-grid-256.json). It does not assume that this source form was intended by the author.

## Original-byte test

The read-only [Node 22 source-file SFT](../sims/lp2_original_jpeg_oob_census_sft.cjs) walks baseline JPEG markers, begins looking for end-of-image **after the SOS header**, and recognizes stuffed FF00 bytes and restart markers. Its positive control verifies exact LP1 `05.jpg` length **673,066**, first true EOI offset **336,353**, 360-byte out-of-band hex header, decoded **179-byte** historical payload SHA-256 `82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa`, and full 336,353-byte reversed JPEG-body equality.

For **all 58 exact LP2 source files `17.jpg` through `74.jpg`**, the *first true JPEG EOI* is at the physical file's final byte. None has an appended out-of-band trailer. Their marker headers contain exactly the same APP0 JFIF and APP2 ICC payloads, no COM or per-page distinct APP segment. All 58 share one luma quantization table. The 35 three-component (RGB) files also share one chroma quantization table; the remaining 23 are one-component grayscale files. Image-dependent DHT data was not misidentified as APP metadata. This is a finite rejection of direct **LP1 Onion3-style post-EOI payload replication on the intact LP2 release**.

It is **not** an exclusion of in-scan OutGuess DCT steganography, OpenPuff, manipulated image pixels, nonstandard entropy-coded payloads, or missing historical external carriers. The RGB/grayscale distinction alone does not supply a plaintext/key readout.

## Literal four-table p50 interpretation

The original table's 256 base60-derived bytes, segmented in printed row-major order into four consecutive 8×8 blocks, contain literal zero at global zero-based indices **192** and **229**, corresponding to printed **row25 column1** and **row29 column6**. These are the two `00` cells, and remain zero under a conventional base59 alternative. They occur in the fourth proposed block. A baseline JPEG DQT coefficient must lie in **1–255**, so a complete direct four-DQT receiver with these exact byte values is impossible. The decoder and bit ordering are irrelevant to this obstruction. The restriction is specified by [ITU-T T.81 quantization tables](https://www.w3.org/Graphics/JPEG/itu-t81.pdf), and is also applied by [libjpeg-turbo's table construction](https://github.com/libjpeg-turbo/libjpeg-turbo/blob/main/src/jcparam.c).

A re-encoding of the values, omission of the fourth block, or use as data instead of literal quantizers remains logically possible, but would need an independently selected original rule. The two zero positions do not invalidate arbitrary use of p50 as 256 bytes.

## Decision

Do not repeat trailer extraction on the same 58 original LP2 files, or claim their original JPEG APP headers specify a hidden page-to-page key. Do not read all four printed p50 8×8 blocks as literal JPEG DQT coefficients. Continue to seek an author-selected original-cipher operator, key, steganographic password, or independent genuine plaintext. A successful later lead must produce source-consistent evidence on original ciphertext or a type-checked external payload, not only a convenient geometric fit.

**Reproduction:** `node sims/lp2_original_jpeg_oob_census_sft.cjs` from repository root, with the existing `resources/liber-primus/` originals. The script reads data only, asserts the historical positive and both exact negative gates, and prints a per-image size/component/EOI/APP/DQT census.
