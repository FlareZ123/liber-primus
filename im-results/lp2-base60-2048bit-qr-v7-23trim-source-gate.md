# Printed 256-byte table → 45×45 QR-v7 with a 23-bit tail: original-source finder gate

**Agent29, 12 November 2026. Evidence class:** exact, clue-motivated, original-input necessary-condition **negatives**. The tested literal rasters contain neither the mandatory QR-v7 finders nor the independent 45×45 Aztec full-range bullseye. **No previously unknown LP2 plaintext, hidden QR message, original key or next-stage destination was recovered.** Reproduction: [single-file Windows/Node.js 22 test](../sims/lp2_grid2048_qr7_finder_source_sft.cjs).

## A concrete, conditional human path

The original source on physical LP2 pp49–51 prints **256 two-character base-60 numbers in 32 rows × 8 cells**. The established digit map converts every token to an unsigned byte in 0–255, giving exactly **2,048 binary bits**. The following solved p57 includes an independently counted unique **23-dot red punctuation group**, documented in the [original mark audit](p55-central23-fibonacci-prime-totient-continuation.md). Those numbers admit the exact identity

`256 × 8 − 23 = 2,025 = 45 × 45`.

According to [Denso Wave's QR version table](https://www.qrcode.com/en/about/version.html), **QR version 7 has precisely 45×45 binary modules**. A solver might therefore trim a 23-bit header/footer from the source table, reshape the other 2,025 bits into a square and read a QR symbol. This would offer an immediately recognizable success condition and potentially an actual URL or message.

**Critical missing instruction:** Neither the numeric table nor the 23 dots says “QR”, specifies a bit-order conversion or chooses which end to trim. The numerical fit alone cannot certify intended source design. This experiment tests literal, directly visible order conventions before proposing any secret permutation or steganographic layer.

## Locked original-byte and image readouts

Source bytes are exactly `resources/liber-primus/base60-grid.json` → `byte_rows` (32×8, row-major SHA-256 **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**). Fixed choices are:

- Printed row-major versus column-major traversal of the 32×8 table.
- Forward versus reversed **byte** sequence.
- MSB-first versus LSB-first bits inside each byte.
- Drop the first 23 versus final 23 bits.
- Dark/white polarity, and all eight square rotations/reflections.

There are exactly **256** readouts. This is deliberately more permissive than the single printed order, and tests no fitted key, bit permutation, image warp or chosen ciphertext offset.

ISO/IEC 18004's [finder specification](https://www.standards.iteh.ai/catalog/standards/iso/8c023a56-bea2-418b-9b7b-5bf19f251555/iso-iec-18004-2015) requires three **7×7** corner markers with dark outside rim, white 5×5 inner ring and dark 3×3 center. These **147 predetermined modules** are necessary for every ordinary QR version-7 raster regardless of the encoded data or data mask. A valid member of this literal family must match **147/147** finder cells; one may reject a candidate without guessing its data payload or error-correction level.

## Original result and positive plant

| Input | Best three-finder agreement | Per-finder counts | Exact QR finder? |
| --- | ---: | --- | --- |
| **Unmodified LP2 numeric table, best of 256 fixed readouts** | **86 / 147** | **29 / 29 / 28** | **No** |
| Source-shaped positive plant with fixed authentic 7×7 corner finders, arbitrary other modules, 23 trailing zeros | **147 / 147** | **49 / 49 / 49** | **Yes** |

The original winner is row-major, byte-forward, bit-LSB-first, trim-last23, no color inversion, and one of the equivalent square symmetries. Reversed byte order/bit significance maps to an equivalent observed best. All 256 original variants fail the exact required corner markers. This is much closer to the approximately 73.5 random matches expected from 147 independent fair bits than to a literal QR symbol.

**The five documented image-audited alternate byte readings cannot rescue this route.** At source cells 45, 50, 165, 172 and 246, the published alternative values are 81, 21, 47, 174 and 224 in place of the canonical 107, 47, 18, 148 and 198. Their individual binary Hamming distances are **4, 4, 5, 4 and 3**, totalling **20 changed bits**. Under every fixed QR orientation, end trim, polarity and traversal, replacing any subset of these bytes can improve its finder score by no more than 20; hence even the best among all **32** source alternatives and **256** readouts scores at most **86+20=106**, strictly below the necessary **147**. The reproducer checks this source-variant-independent bound.

The positive plant generates a full 45×45 bitmap with the required corner patterns, serializes it into 256 source-shaped bytes by appending 23 bits, and rediscovers all 147 fixed finder modules via the very same orientation and trimming search. It validates the binary serialization and search logic; it is not evidence that Cicada used QR.

## Independent exact 45×45 Aztec Code finder check

A second established matrix symbology also has **exactly 45×45 modules**: the **seven-layer full-range Aztec Code**, invented in 1995. This is a genuine alternative to QR with a quite different and independently recognizable mandatory marker. [The published Aztec size table](https://standards.iteh.ai/catalog/standards/iso/fde3ddcd-a78a-4f3e-aab5-3278eed2c281/iso-iec-24778-2024) assigns seven full-range layers to 45×45. [ZXing's source implementation](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/aztec/encoder/Encoder.java) specifies a central **13×13** seven-ring alternating bullseye and **six** fixed one-bits at oriented corners. These are **169+6=175** compulsory source-independent modules, including dark and light positions. Its mode ring, Reed–Solomon message, and data fields are intentionally left free in the test.

Applying the exact same **256** table-readout arrangements and two 23-bit trims to the 175 compulsory Aztec bits gives a best original agreement of **105/175**. The same five independently audited alternative table cells can change at most **20 total bits**, so even granting every subset of alternate readings the maximum is **125/175**. No tested direct mapping can be an ordinary full-range Aztec symbol. An independent 45×45 positive plant with source-shaped 256 bytes and all 175 Aztec fixed modules is rediscovered with **175/175** matches by the unmodified search engine. The original-core and planted tests execute in the same [single-file SFT](../sims/lp2_grid2048_qr7_finder_source_sft.cjs).

This adds a second **closed, recognized 45×45 direct-bitmap grammar** without inventing a decoding key. It does not support stacking a QR/Aztec transform with an extra secret bit permutation or inferring a payload from partial ring matches.

## Cryptanalytic decision

**Reject direct byte-serialized QR-v7 and seven-layer full-range Aztec readouts of the original 256 table under the finite source-natural orientations above.** The arithmetic 2,048−23=45² is an intriguing but retrospective match. No further search over arbitrary 2,025-bit rearrangements, symbol-to-bit masks or bespoke QR patterns is justified by this result.

This test does **not** reject the table as a cryptographic key, a different embedded file, a matrix barcode whose modules were independently permuted/encrypted, or a numerical code. The already established GF(29) dual-factor relations and the unresolved original rune ciphertext are unchanged. The next useful move still requires a source-selected operation that turns original inputs into a recognizably correct plaintext or instruction.
