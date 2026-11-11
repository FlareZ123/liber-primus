# p50's printed 32×8 table as 32 minimal-byte integer records

**Classification: bounded original-cipher negative; no deciphered unknown page, embedded plaintext, container, key or independently recognizable payload.** Agent4, 11 November 2026; Director Issue [#341](https://github.com/FlareZ123/liber-primus/issues/341). Full standalone code: [\`sims/lp2_grid32_row_minimal_byte_sft.cjs\`](../sims/lp2_grid32_row_minimal_byte_sft.cjs).

## Original-visible operation and decision

Physical LP2 pp49–51 print **32 consecutive rows × 8 two-character alphanumeric tokens**. The shared canonical derived source \`resources/liber-primus/lp2-grid-256.json\` records 256 tokens in printed order. A plausible reader could concatenate the eight token pairs on each row into **one 16-digit radix-60 integer** and serialize each integer independently into the *shortest unsigned big-endian byte sequence*. This is a genuinely different original input/operation from applying the 256 individual table cell values as bytes or as GP29 keystream elements.

Exactly performing that conversion produces **381 bytes** across 32 separate records. It contains **no recognizable self-validating file/text header at stream start or at any individual record start**, is **invalid UTF-8**, and has few printable ASCII bytes. No recoverable LP2 plaintext, source-selected stream key or instruction is exposed.

The sole fixed radix sensitivity is the historically plausible **base59** alphabet (omit lowercase \`f\` from the 60 symbols). It produces **380 bytes** with the same negative recognition.

## Fully fixed conversion and independent results

The numeral strings are the eight original 2-symbol tokens concatenated left-to-right, retaining each row's eight-token boundary. Source \`alphabet\` gives radix60 digit order \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\`. Radix59 omits only lowercase \`f\`; no source token contains that character.

For each 16-digit row \`d[0..15]\`, compute the exact unsigned integer \(N=\sum_{i=0}^{15}d_i B^{15-i}\), \(B\in\{60,59\}\), then emit the minimal unsigned big-endian bytes of \(N\). **No** zero-padding to 12 bytes, other endian conventions, transposition, cell-wise XOR, repeated key, output offsets or alternative alphabet permutations enter the experiment. The original 32-row sequence is kept in print order.

| Fixed reading | Radix60 source order | Radix59 omitted-f sensitivity |
| --- | ---: | ---: |
| Whole integer records | 32 | 32 |
| Serialized byte length | **381** | **380** |
| 12-byte records | 30 | 29 |
| 11-byte records | 1 (row 17) | 2 (rows 15, 17) |
| 10-byte records | 1 (row 24) | 1 (row 24) |
| Printable ASCII bytes | **130/381 (34.12%)** | **142/380 (37.37%)** |
| Marginal entropy | **7.34138 bits/byte** | **7.31763 bits/byte** |
| Valid UTF-8 | No | No |
| Whole stream conventional magic | None | None |
| Any individual row conventional magic | None | None |
| First 16 bytes, hex | \`052449ec38a0c00ef2f4a9970254cdf6\` | \`0400f1a6ad204dcf1e66843f01d28edf\` |
| Concatenated SHA-256 | \`6a059e2a69a772c71dafcb2ac9da19fe26677da93e36eeb449e3ab6c9508e9dd\` | \`e6dec489d3d666d5765184d603383d75946478915b696c791b67a58809ad6fda\` |

The nonuniform 10/11/12 byte lengths are a predictable consequence of minimal serialization of different-sized 16-digit integers, especially rows beginning with low-valued source tokens. A fixed 12-byte-per-row interpretation would require additional padding which this experiment explicitly forbids.

## Source-native inverse and positive control

The SFT converts each original eight-token record into a BigInt, emits its minimal byte sequence, reconstructs the original 16 radix digits by repeated quotient/remainder (left-padding digit zeroes to the original printed width), and verifies **32/32 exact source row reversals** under both alphabets. It logs each row's printed tokens, exact original-byte length, per-record SHA-256 and first four serialized bytes.

The same serializer is exercised on an artificially planted **GIF89a** header encoded as a 16-digit base60/base59 numeral; its emitted bytes recover the GIF header exactly and the fixed signature recognizer identifies it. This establishes that a genuinely recognizable leading file signature would not be suppressed by the integer-to-minimal-byte implementation.

The recognizer checks standard prefix signatures for GIF87a/89a, PNG, ZIP, JPEG, PDF, gzip, bzip2, 7z, ELF, Ogg, FLAC, SQLite, ID3, RIFF, and one SQLite WAL prefix. It does not search interior byte offsets or claim to exclude encrypted/unknown formats. As a bounded row-order control, 1,024 seeded shuffles select rows as stream leaders; **zero** shuffled row-start prefixes match a standard signature, consistent with the source's 32 original row starts.

## Scope of the negative

**Retire only the literal 32-row radix60 minimal-byte serialization, with the explicit base59 comparison.** The test does not determine whether the grid is a polynomial, cipher key schedule, spatial code, checksum table, or array of individually meaningful 0–255 cell values. It does not resolve the conditional radix60 versus radix59 ambiguity. Neither a random-looking byte histogram nor the absence of a familiar file header excludes a separately keyed cipher, but this operation supplies no independent key, recognizable payload, or further route to the original plaintext.

No further dependent byte searches should be commissioned without an original clue fixing a changed serialization, reversible key, or expected self-validating target.
