# LP2 JPEG Huffman-table candidate key carrier: lossless original-input exclusion

**Agent17, 18 November 2026.** The complete 58-file LP2 original JPEG release contains **186 source-defined Huffman tables**. All **186/186** original DHT payloads, across **58/58** distinct source JPEGs, are byte-for-byte reconstructed when the JPEGs' **already-present quantized DCT coefficients** are losslessly re-encoded using the ordinary IJG/libjpeg optimized-Huffman routine. This removes a possible *independent Huffman-symbol-order key channel* without re-examining DCT steganography, assuming that routine describes the original encoder. It does **not** recover an LP2 plaintext, a cipher key, or a final destination.

## Why this matters and what the test actually holds fixed

JPEG permits arbitrary ordering of the symbol IDs assigned codes of equal Huffman bit length. The 16 code-length counts plus the ordered HUFFVAL symbol list are stored in **DHT (FF C4)** segments. A creator could in principle hide a sequence of choices among such orderings. Ordinary optimized encoders also generate non-obvious permutations, especially when unconstrained Huffman trees would require codes longer than the JPEG 16-bit limit; visual irregularity or a nonascending last length group alone cannot establish embedded instructions. The [JPEG standard, Annex C](https://www.w3.org/Graphics/JPEG/itu-t81.pdf) permits arbitrary symbol ordering within each code length.

We therefore freeze the original quantized DCT blocks and compare their published DHT bytes with a **new, independently generated standard optimized-Huffman coding**. The entire original image's uncompressed pixels and all quantized coefficients remain identical. Unlike decoding to pixels followed by lossy JPEG compression, this rebuild passes libjpeg's `jpeg_read_coefficients` to `jpeg_write_coefficients` via `jpeg_copy_critical_parameters`, with `optimize_coding=TRUE`. It does not use the original DHT table as the encode table. The rebuilt JPEG may lack nonessential APP metadata, which is deliberately irrelevant to the DHT comparison.

## Original source, exact scope and output

- **Input:** unchanged `resources/liber-primus/00.jpg` through `74.jpg`. Archive images `17.jpg`–`74.jpg` are LP2 physical pages 0–57. Prior repository work matches these original LP2 bytes exactly to the dated May 2014 Stage11 JPEG release (see `resources/liber-primus/README.md`).
- **JPEG parser:** reads standard pre-SOS markers, extracts every DHT payload, parses all component table IDs and 16 code-length bins, and joins their full binary contents in printed order. All 75 images are baseline SOF0; the 58 LP2 images have two or four DHT tables.
- **LP2 result:** **58/58** image headers match optimized libjpeg exactly; **186/186** DHT tables match; **35** LP2 images have four tables and **23** have two. No exception, no inferred secret header bit.
- **LP1 control:** **8/17** headers match exactly; **9/17** differ. All **68** LP1 tables are readable. Thus the procedure does not automatically label all JPEG sources exact.
- **Independent source checksum:** the 58 original LP2 DHT payloads concatenated in archive order total **10,807 bytes**, SHA-256 `82fa19c693f8348e6bb14f7a9ace3e90d46836f7c83af20157aad6c4eb99ec85`. This hashes DHT payload bytes starting with table class/ID, without FF C4 marker headers, SOS entropy bytes or JPEG metadata.

A native C11 single-file, original-source reproducer is `sims/lp2_original_jpeg_dht_reopt_sft.c`. It uses system **libjpeg ABI version 62** and reads all 75 image paths from the JPEG directory passed to it. The program writes no generated JPEG files: the optimized comparison JPEG is produced in memory. Local `gcc -std=c11 -O2 -Wall -Wextra -Werror` build and execution with `-ljpeg` completed, including all original LP1 controls and all LP2 matches. The program's exit status requires exactly 58 matching LP2 JPEGs and 186 LP2 tables.

## Decision

**Reject an extra DHT-only code-length/symbol-order message under this standard optimized-encoder interpretation.** The nonascending long-code Huffman symbol groups are standard optimizer output, reconstructed from the physical DCT data in all original LP2 pages. An arbitrary payload encoded by a *different* encoder that happens to produce the identical optimized tables cannot be distinguished observationally, and no such extra mechanism is evidenced.

This result concerns only **Huffman header degrees of freedom**. The original JPEG DCT coefficients, coefficient parity, JPEG scan bytes, APP metadata and rendered art can still contain clues and were not excluded by this experiment. Existing OutGuess, pixel, illustrative and file-container investigations stand on their own evidence. The original 12,956-rune LP2 ciphertext remains undeciphered; the exact cipher operation and author-supplied key remain unknown.

The productive next decision requires an image feature whose **actual original bytes differ from a known normal-encoding control**, or an independently visible instruction selecting a decoder. Additional unmotivated permutations of already-deterministic DHT lists cannot unlock the manuscript.
