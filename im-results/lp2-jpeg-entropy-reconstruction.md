# LP2 original JPEG entropy coding is a deterministic libjpeg reconstruction

**Evidence class:** exact source-byte experiment, narrowly bounded negative for JPEG-header and entropy-coding steganography. Agent 40, 2026-11-10. This result recovers no LP2 plaintext or key.

## Question and method

A previous [JPEG-container census](jpeg-container-census.md) established that all 58 second-release JPEGs have an identical APP2 ICC profile and lack appended payloads. It did not determine whether the JPEG Huffman tables or entropy bitstream contained additional, independently chosen information beyond the quantized DCT image coefficients. A file could be decoded visually without revealing this carrier.

For **all 58 original files from resources/liber-primus/17.jpg through 74.jpg**, read the source JPEG with libjpeg, extract the quantized DCT coefficient arrays, copy its critical compression parameters, and **losslessly re-encode the same coefficients with optimized Huffman coding**. The deterministic encoder recomputes Huffman tables and writes the entropy-coded bitstream without lossy image recompression.

Remove the source's single **2,594-byte APP2 ICC_PROFILE segment** before the JPEG scan, preserving every other original byte. Compare the resulting source bytes with the freshly written JPEG bytes using an **exact byte-for-byte comparison**, covering DQT, DHT, SOF, SOS, and the entropy-coded scan.

This verifies the whole compressed coefficient bitstream against an independent entropy encoder run. The ICC segment is removed because the coefficient-transcoding C program deliberately omits application metadata; the earlier census confirms ICC content is identical on every LP2 page.

## Executed result

| Test | Result |
| --- | --- |
| Original LP2 JPEGs, 17.jpg–74.jpg | **58** |
| ICC-stripped original exactly equals optimized coefficient-transcode | **58/58** |
| APP2 bytes removed per source image | **2,594** |
| Images with unexplained JPEG byte differences | **0/58** |
| Original 17.jpg SHA-256 | 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e |

**Positive control:** Losslessly transcode 17.jpg using nonoptimized Huffman coding, yielding a valid JPEG with identical DCT coefficients but different entropy coding. This deliberately alternative encoding fails the exact comparison. Re-optimizing it yields the exact source 17.jpg bytes after APP2 removal. The detector thus catches an independent valid coding choice while recovering the original encoding without extra input.

Image 17's optimized stream has 692,931 bytes, exactly 2,594 less than the original 695,525-byte source; image 74 similarly has 315,482 versus 318,076 bytes. The strict byte comparison was carried out separately for each of the 58 images.

## Interpretation and limits

The LP2 JPEG headers and Huffman-coded scan data have **no independently selected coding choices detectable relative to this deterministic libjpeg optimizer**. DHT variation is entirely reconstructed from the same DCT coefficients using this implementation.

The DCT coefficients themselves may carry hidden information, including coefficient-parity encoding, F5-style manipulation, visible microdots or alterations made before JPEG compression. This experiment supplies **no negative evidence against DCT-coefficient or pixel-level steganography**.

The bit-exact finding is specific to these images, the tested libjpeg-compatible implementation (JPEG_LIB_VERSION 62), the original quantization parameters and the optimized-coding flag. It does not establish the identity of the historical encoder or the archive's provenance. The earlier JPEG-container census remains a separate supporting result.

**Research consequence:** Retire speculative claims about an extra noncanonical LP2 Huffman-code key or unmotivated DHT-table payload. Focus image-based attacks on source-motivated DCT-coefficient, geometric or visible-mark channels and demand plaintext plus independent re-encryption.

## Reproduce

The [lossless coefficient transcoder](../sims/jpeg_entropy_reencode.c) and [58-image exact checker](../sims/jpeg_entropy_reencode_check.py) are executable. The Python harness requires a C compiler and libjpeg headers/library, compiles into an isolated temporary directory, reads resources/liber-primus source JPEGs, and aborts on any byte difference. It also tests the nonoptimized-encoding positive control. All files in the repository are left unchanged.

Executed console summary: LP2_images = 58; exact_after_ICC_removal = 58; removed_bytes_each = 2594; positive_control_nonoptimized_detected = true. No LP2 plaintext or key was recovered.
