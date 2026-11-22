# Original p50 byte table as a 32×64 packed monochrome image

**Agent45, 22 November 2026. Status: bounded direct-reader negative.** This tests a different output register from the existing 32-byte bitplane extraction and the 16×16 grayscale reader. No plaintext, key, or authored bitmap instruction is recovered.

## Why this is a plausible first operation

The original physical p49–51 pages print a numerical table of **32 rows and eight two-character cells per row**. Both source-compatible base60 and proposed base59 interpretations map each of its 256 cells to an 8-bit value (base60 maximum 255; base59 maximum 251). If each printed byte is an eight-pixel horizontal packed raster unit, the source geometry itself selects **32×64 binary pixels**, without selecting a secret key, offset, picture aspect ratio, or bitplane. This is an affordable direct-output hypothesis: readable pictograms, small writing, or a matrix barcode would be a recognizable success.

Each physical row remains one image row. The fixed variants are (i) source-compatible base60 or base59 numeral parsing and (ii) most-significant-bit-first or least-significant-bit-first within every byte. There is no ad hoc column permutation, XOR mask, or selection by how the output looks. The source table's base60 byte string has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

## Original-input result

A direct black-and-white rendering of all four 2,048-pixel outputs shows dense, apparently random pixel patterns; none gives legible lettering or an identifiable drawing. An objective, source-geometry-compatible check is an **unscaled 7×7 QR finder**: solid dark outer border, one light border, dark 3×3 centre. An exact finder has to occur somewhere in the image, regardless of where the QR is placed. Both polarities were tested; quarter-turning a finder does not change this symmetric pattern.

| Token radix | Bit order in each cell | Dark pixels of 2,048 | Completely blank rows / columns | Exact QR finder | Best 7×7 Hamming mismatch |
| --- | --- | ---: | ---: | ---: | ---: |
| 60 | MSB first | 1,017 | 0 / 0 | 0 | 12 |
| 60 | LSB first | 1,017 | 0 / 0 | 0 | 12 |
| 59 | MSB first | 1,012 | 0 / 0 | 0 | 13 |
| 59 | LSB first | 1,012 | 0 / 0 | 0 | 13 |

The negative is exact for a **one-source-bit-per-module standard QR** in the four direct parses. No completely white row or column is available as a direct full-width separation line for multiple bitmap text lines, although this does not exclude lettering that uses other boundaries or colors. The image appearance is a human observation, not a statistical claim about encrypted pictures.

## Reversibility, control and scope

The reproducible Node22 program [`sims/lp2_p50_packed_bitmap_32x64_sft.cjs`](../sims/lp2_p50_packed_bitmap_32x64_sft.cjs) reparses the original printed token strings, asserts byte-for-byte agreement with the independently stored 256 canonical bytes and their SHA-256 fingerprint, and exactly repacks every unpacked bit image to its original byte sequence. It also **plants a genuine 7×7 QR finder** in a source-shaped artificial 32×64 picture, packs and unpacks it under both bit orders, and recovers the finder with zero mismatches. This positive control establishes that the exact-finder receiver works for the selected image shape.

The test passed on [Windows Node22 Actions run 44993356136](https://github.com/FlareZ123/liber-primus/actions/runs/44993356136). The manual reproducer is [`agent45-p50-packed-bitmap-original-manual.yml`](../.github/workflows/agent45-p50-packed-bitmap-original-manual.yml).

**Decision:** the table does not directly present an unscaled QR code or an obvious 32×64 plain bitmap under its source-native byte orders. Further rotation, XOR, interleaving, compressed-image decoding, or other visual manipulations require an independent original clue that selects the operation. This result does not narrow an OTP-based ciphertext or solve any of the 56 unknown pages; it retires the direct packed-bitmap read only.
