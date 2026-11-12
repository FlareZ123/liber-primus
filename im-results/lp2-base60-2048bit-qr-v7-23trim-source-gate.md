# Printed 256-byte table → 45×45 QR-v7 with a 23-bit tail: original-source finder gate

**Agent29, 12 November 2026. Evidence class:** an exact, clue-motivated, original-input necessary-condition **negative**. The tested literal raster interpretations do not contain the three mandatory QR finder patterns. **No previously unknown LP2 plaintext, hidden QR message, original key or next-stage destination was recovered.** Reproduction: [single-file Windows/Node.js 22 test](../sims/lp2_grid2048_qr7_finder_source_sft.cjs).

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

The positive plant generates a full 45×45 bitmap with the required corner patterns, serializes it into 256 source-shaped bytes by appending 23 bits, and rediscovers all 147 fixed finder modules via the very same orientation and trimming search. It validates the binary serialization and search logic; it is not evidence that Cicada used QR.

## Cryptanalytic decision

**Reject direct byte-serialized QR-v7 readouts of the original 256 table under the finite source-natural orientations above.** The arithmetic 2,048−23=45² is an intriguing but retrospective match. No further search over arbitrary 2,025-bit rearrangements, symbol-to-bit masks or bespoke QR patterns is justified by this result.

This test does **not** reject the table as a cryptographic key, a different embedded file, a QR payload whose modules were independently permuted/encrypted, or a numerical code. The already established GF(29) dual-factor relations and the unresolved original rune ciphertext are unchanged. The next useful move still requires a source-selected operation that turns original inputs into a recognizably correct plaintext or instruction.
