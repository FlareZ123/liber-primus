# Conditional `Meanpng` → PNG Average filter on the original p49–51 table

**Agent2, 23 November 2026. Intermediate original-input negative; no new LP2 plaintext, key, or authored command.** Exact reproducer: [`sims/lp2_p50_meanpng_average_gate.cjs`](../sims/lp2_p50_meanpng_average_gate.cjs). Authoritative original table input: [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json); unchanged 58-page GP29 ciphertext: [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json).

## Why this is an independently executable operation

The original p49–51 table prints **32 rows of eight base60 byte values**, 256 bytes total. The separately derived, still unverified Bitcoin serialization of the table's missing-L fifth column yields address `1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK` ([source derivation](lp2-p50-missing-l-secp256k1-address.md)). The readable prefix *Meanpng* could select **PNG's standardized filter type 3, Average**, not just an average of whole photographs. The 1996 PNG specification defines the exact byte inverse:

`Recon(x) = [Filt(x) + floor((Recon(left) + Recon(above)) / 2)] mod 256`,

using zero for missing neighbors. [PNG 1.0 filter specification](https://www.libpng.org/pub/png/spec/1.0/PNG-Filters.html) (pre-2014). Under the frozen direct hypothesis, treat each printed 8-byte row as one grayscale scanline; set one-byte-per-pixel and **all 32 rows to filter3**. No rotated grids, selective row filters, page-chosen pixels or nonce tuning. This is **conditional**: neither the Bitcoin interpretation nor the filter3 opcode is signed first-party Cicada instruction, and actual PNG files need filter-identifying row bytes and image/compression metadata absent from the printed table.

## Literal fifth-column mean check — an independent source-fixed rejection

The existing missing-ASCII-`4C` selector fixes the table's fifth printed byte in each row **before** inspecting any reconstructed PNG. Under a direct alternative interpretation of `Mean`, each of those 32 fifth-column bytes would simply encode the arithmetic mean of the row's *other seven* source bytes. The complete original 32×8 table falsifies it: **0/32** selected bytes equal the seven-value mean under floor, nearest-byte or ceiling rounding, with no phase, row exclusion, byte offset or selected subset. For example the first row's fifth value is `0x61=97`, while the seven neighbors have nearest mean190. This rules out a particularly simple human-readable checksum; it neither rules out image averaging nor yields any plaintext. Reproduced from unmodified source data in the same script.

## Original execution and discriminating result

The first eight printed source bytes are `cb e7 a7 ba 61 ed 7e b7`. Their PNG-Average reconstruction is exactly `cb 4c cd 20 71 25 90 ff`; reapplying the forward Average filter recovers all **256/256 source bytes**. The output happens to include literal byte `4c` (ASCII L, the table's missing **token** written in hexadecimal) at positions **1** and **63**. This is *not* a decoded missing token in the original base60 grid, and appears only after selecting the PNG interpretation. The reconstructed output does **not** begin with the PNG signature, has no standard apparent file header or contiguous 5+-character printable ASCII segment, and an 8×32 grayscale view shows no legible graphic.

| Frozen 256-byte stream | Distinct byte values | Shannon entropy (bits/byte) | ASCII printable / 256 |
| --- | ---: | ---: | ---: |
| Original printed bytes | 161 | 7.16965 | 103 |
| PNG Average reconstructed | 159 | 7.13659 | 87 |

**Literal PNG syntax check (necessary, source-exact):** A native PNG uncompressed scanline always begins with a filter-type byte in `0..4`, followed by the scanline's pixel bytes. Interpreting each of the **32 original printed eight-byte rows** as one complete PNG scanline with seven payload bytes fails immediately: only **1/32** row heads is a legal filter byte (original row24 is `00`; the other 31 are outside `0..4`). This is a hard source-level exclusion of the direct full-scanline-byte interpretation, irrespective of image recognizability. The tested filter3 decoder is an **operator hypothesis with 32 implicit filter3 selectors**, not an observed valid PNG data stream.

**One historically available binary receiver, not a tuned decompression hunt:** The authenticated 2013 Cicada OpenPGP materials used **raw RFC1951 DEFLATE** compression. Applying that exact complete, offset-zero `inflateRaw` to the 256 reconstructed Average bytes fails at the real first Deflate block with `invalid distance too far back`; the standard zlib and gzip containers likewise fail their headers. An independent valid raw-DEFLATE planted text decompresses exactly using the same built-in decoder. This excludes an intact unkeyed raw-DEFLATE body of this particular reconstructed table; no offsets, presumed missing bytes, header surgery, or alternate image-filter choices were fitted. The procedure is coded in the same SFT.

A single natural GP29 consumer was predeclared for direct ciphertext testing: reduce the byte stream modulo29 and repeat it as one **continuous 256-rune Vigenère key**, across the unchanged p0–55 **12,956-rune** corpus (including the original zero-rune p50), without resetting at page, word, or F. Test both `P=C-K` and `P=C+K`. The printed stream is the exact comparison control; the reconstructed stream is the proposed operator output. Both signs reconstruct ciphertext perfectly when inverted, and a 95-rune genuine solved p57 native plaintext plant recovers all 95 symbols under the same operation. These are correctness checks, not evidence the historical cipher used the operation.

| Source bytes, GP29 sign | p16–21 training IoC (1,613) | p40–53 sealed holdout IoC (3,008) |
| --- | ---: | ---: |
| Printed, C−K | .03437486 | .03442323 |
| Printed, C+K | .03456485 | .03457668 |
| Average reconstructed, C−K | .03436486 | .03453909 |
| Average reconstructed, C+K | .03467177 | .03448293 |
| Raw source baseline | .03454947 | .03454263 |

All output profiles remain near the random GP29 `1/29≈.03448276`, not source-native ordinary GP29 prose (typically materially higher). No coherent contiguous unknown-page plaintext or independent receiver was found. The two 4C byte occurrences are insufficient to rescue the absent prose.

**Decision:** The single 2014-executable `Meanpng`→PNG Average→32×8 byte reconstruction is valid as a reversible table transform but fails as a direct repeated-additive GP29 plaintext/key producer. Retire **this exact opcode/shape and this exact additive receiver**. A genuinely source-selected next use, different output type or authenticated PNG clue would be needed to open a distinct cryptanalytic task. Do not extend to arbitrary width, filter, sign, phase or image-subset searches based on the same post-recognition string.
