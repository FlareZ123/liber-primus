# LP2 source-JPEG DCT frame screen: no unkeyed recognizable payload

**Agent 30, 10 November 2026. Evidence class:** executed, finite source-image extraction negative with a real planted, recoverable compressed payload. No original unknown LP2 plaintext, cipher key or continuation was recovered. This result concerns a carrier mechanism not covered by the earlier [JPEG entropy re-encoding comparison](lp2-jpeg-entropy-reconstruction.md).

## Original-input question

All 58 LP2 JPEGs (resources/liber-primus/17.jpg to 74.jpg) have normal libjpeg-optimized entropy coding. That comparison does not detect additional information encoded *in* the quantized DCT coefficients. Here the candidate is a conventional, unkeyed, sequential JSteg-like least-significant-magnitude-bit stream, possibly framed with a recognizable compressed or file header.

The source decoder accesses original quantized 8×8 coefficient arrays directly through libjpeg. It visits JPEG minimal coded units in native component and 2×2/1×1 sampling order, and the 63 AC coefficients within each block in standard zig-zag order. For a coefficient v it extracts abs(v)&1. Two separate eligibility rules are tried: abs(v)>1, as used by many JSteg-like variants to avoid zeros and ones, and the inclusive abs(v)>0. Independently collect all components in interleaved order, or only Y, Cb or Cr. Each bitstream is tested with all eight possible bit-framing offsets and both byte bit orders. The independent component outputs do not preserve intercomponent interleaving, which is why the combined stream is also tested.

Each resulting presentation is scanned in its first **128 bytes** for specified gzip, ZIP, PNG, PDF, bzip2, xz, 7z, RAR, SQLite, Ogg, ELF, PGP ASCII armor and literal 'cicada'/'CICADA' file/string signatures. Every apparent two-byte valid zlib CMF/FLG header in this range is pursued using **full decompression, Adler-32 and end-of-stream validation**, avoiding an inference from a 2-byte accidental match. No arbitrary ciphertext key or user-selected page ordering is fitted.

## Completed source scan

| Exact source scan | Result |
| --- | ---: |
| Original LP2 image files | **58** |
| Candidate source bitstream/framing views with ≥132 input bytes | **4,720** |
| Starting bytes inspected in each view | **128** |
| Syntactically plausible zlib header positions | **548** |
| Complete valid zlib streams | **0** |
| Other declared header/signature occurrences | **0** |
| Largest first-128-byte printable-ASCII count | **63/128** (image 18.jpg, all-component stream, mode abs>1, shift 2, reversed byte bit order) |

The 548 raw zlib-header matches are accidental under the complete checksum and stream-termination gate. No claim is made about file signatures starting later in the extracted bitstream, a different compressed format, hidden binary data without recognizable framing, or ciphertext encrypted before embedding.

## Authentic embedded-payload positive

Using *original image 17.jpg* as a coefficient source, losslessly transcode its JPEG after embedding zlib.compress(message), with message 'LIBER PRIMUS DCT PLANTED POSITIVE 3301' (46 compressed bytes), into the first eligible Y-AC coefficient magnitude bits, MSB first, modifying the magnitude upward by one wherever the bit differs. **162 AC coefficients changed**. The resulting file remained a complete JPEG.

Run the *same* DCT reader against the planted image, without supplying its intended plaintext or any plant coordinate to the reader. The extracted abs(v)>1 Y-only bitstream begins with the **exact original 46-byte zlib stream** and decompresses to the **exact message**. The code asserts both identities. This directly demonstrates detection and extraction power for a real coefficient-carried source payload of the stated family. The positive control is independent of original LP2 ciphertext.

## Decision and reproduction

The 58 source images do not expose an unkeyed early-frame recognizable payload under these coefficient-bit selection, traversal, bit-alignment and signature assumptions. This **does not exclude** password-keyed JSteg shuffles, OutGuess, F5 matrix encoding, parity inside pixel imagery, manually selected coefficient paths, encrypted streams without headers, hidden source files or a genuine Liber Primus cipher key.

The next productive image-based investigation requires a *specific, historically justified keyed coefficient traversal or matrix codec*, accompanied by a matching embedded-payload positive. Otherwise prioritize a reversible original-LP2 inverse with heldout plaintext and exact re-encryption over trying arbitrary signature variants.

**Exact reproducible tools** (C11 libjpeg and Python 3 standard library):
- [MCU-order source coefficient reader](../sims/jpeg_dct_frame_extract.c);
- [controlled JPEG coefficient writer](../sims/jpeg_dct_plant_control.c);
- [all-image scanner, zlib validity checks and planted round-trip](../sims/jpeg_dct_frame_screen.py).

Run the Python scanner with its default checked-in resources/liber-primus image directory. It compiles both C programs with a local C compiler and libjpeg, works inside a disposable temporary directory, and prints one JSON result. The source image files are never modified. On the supplied original 75-JPEG archive, the image-level results above were reproduced locally. No always-on CI workflow was added.
