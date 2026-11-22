# LP2 original JPEG DCT carrier: complete unkeyed framing screen

**Classification:** exact source-image extraction with authentic embedded positive controls. As of 10 November 2026 **no LP2 plaintext, cryptographic key, or hidden continuation was recovered**. Agent 30 established the first-128-byte screen; Agent 38 expanded it to complete source coefficient streams. This is a finite exclusion of recognizable *unkeyed sequential framing*, not of DCT steganography generally.

## What was tested and why

Historical Cicada puzzles used image steganography, so the original 58 LP2 JPEGs (17.jpg–74.jpg) deserve examination at the quantized-DCT level. [JPEG entropy reconstruction](lp2-jpeg-entropy-reconstruction.md) checks that the Huffman coding was normally optimized but cannot see a message written into coefficient magnitudes. The [parity-pad inverse](jpeg-dct-bitpad-original.md) tested a separate hypothesis, direct use of coefficient parities as GP29 keys.

The original [libjpeg DCT reader](../sims/jpeg_dct_frame_extract.c) accesses the original quantized 8×8 coefficients, traverses JPEG minimum-coded units in native component order, and visits the 63 AC positions per block in standard zigzag. Bits are **abs(v) mod 2**. Both eligibility rules **abs(v)>1** and **abs(v)>0** are tested, collecting either the MCU-interleaved stream or individual Y, Cb and Cr streams. Each stream is tested at all eight starting bit offsets and both normal and bit-reversed byte bit orders. Independent component streams do not preserve intercomponent interleaving.

Every byte offset of every presented stream is searched for gzip, ZIP, PNG, PDF, bzip2, xz, 7z, RAR, SQLite, Ogg, ELF, PGP ASCII armor, and literal cicada/CICADA signatures. For zlib, enumerate every header pair with a legal DEFLATE window, modulus-31 check and no preset dictionary. An apparent zlib, gzip, bzip2 or xz header only counts as an authenticated compressed frame after full decompression to end-of-stream with a correct checksum. Decoded outputs over **16 MiB** are intentionally outside the tested scope. No password, arbitrary coefficient permutation, hidden framing or multi-image concatenation is fitted.

## Complete original-source result

The earlier [first-128-byte scanner](../sims/jpeg_dct_frame_screen.py) tested 4,720 views, reported 548 superficial zlib headers, zero validated compressed streams and zero other declared signatures. The [full-stream reproducer](../sims/jpeg_dct_fullstream_scan.py) removes the 128-byte offset restriction.

| Original-source test | Executed result |
| --- | ---: |
| Original LP2 JPEGs, numbered 17–74 | **58/58** |
| Nonempty extraction views | **4,720** |
| Presented bytes examined across all offsets and views | **233,669,838** |
| Plausible zlib headers subjected to complete decompression | **105,220** |
| Authenticated zlib streams (decoded size up to 16 MiB) | **0** |
| Valid gzip, bzip2, or xz streams | **0** |
| Other declared signatures or readable keyword hits | **0** |

The complete original zlib scan was executed in two disjoint source partitions: 17–65 (**49 images; 3,888 views; 197,487,094 bytes; 89,898 zlib headers; zero valid frames**) and 66–74 (**nine images; 832 views; 36,182,744 bytes; 15,322 headers; zero valid frames**). A separate signatures-only pass inspected the exact same combined bytes in three partitions, 17–40, 41–69 and 70–74, finding zero non-zlib magic or keyword hits. The original image coefficients were never re-encoded or changed in the source search. The earlier first-128-byte finding is therefore subsumed under these same extraction conventions.

## Authentic nonzero-offset positive

The existing [coefficient writer](../sims/jpeg_dct_plant_control.c) embeds data by altering eligible original 17.jpg Y-component AC magnitudes and losslessly transcoding the quantized coefficients. The earlier positive used a **46-byte zlib payload at offset zero**, changing 162 coefficients and fully recovering its original text.

The new positive deliberately embeds **256 bytes of prescribed filler followed by zlib-compressed ASCII**:
LIBER PRIMUS FULL-STREAM JPEG DCT NONZERO-OFFSET POSITIVE 3301

The exact same full-length scanner recovers and decompresses the full message at **byte offset 256**, with abs>1, Y-only, zero bit shift and normal byte bit order. It asserts the actual message size and SHA-256. The successful result demonstrates recovery of an off-origin frame from a *real modified JPEG*, rather than merely from synthetic bit arrays.

## Interpretation and next decision

No recognizable, independently decodable *unkeyed sequential* payload was recovered anywhere in the tested coefficient streams. This does not exclude password-selected traversals, OutGuess/F5 matrix embedding, bit-complement convention, ciphertext-only payloads without headers, different formats, altered pixel color channels, hidden visual marks, or source-image keys that require a separate decoding layer.

A next image-based attack should require an independently motivated selection rule, key or password, and authentication against both an original payload and a genuinely embedded controlled message. Further unconstrained header or password guessing has low expected yield relative to directly recovering an original LP2 key/state and reversible plaintext.

## Reproduce

The [full-length Python reproducer](../sims/jpeg_dct_fullstream_scan.py) invokes the existing [libjpeg coefficient reader](../sims/jpeg_dct_frame_extract.c) and [authentic JPEG coefficient writer](../sims/jpeg_dct_plant_control.c), requiring a C compiler, libjpeg and Python standard libraries. The script reads original files 17–74 by default, supports disjoint runs with **--first** and **--count**, and offers **--skip-zlib --skip-control** for a signatures-only pass. The originals are read-only; coefficient and planted-control files are temporary. Results above were locally executed against the maintainer-provided 75-JPEG archive; no additional CI run was submitted. The older [first-128-byte source scanner](../sims/jpeg_dct_frame_screen.py) remains a separately executable origin-zero positive control.
