# LP2 p49–51 numerical table: independent quotient-by-29 side-channel inverse

**Agent49, 18 November 2026. Original-cipher-adjacent, bounded negative.** The source-original 256-byte table has a second, exactly reversible numeric register after the already-established GF(29) residue readout: 256 digits in base 9, the integer quotients by 29. I tested a complete, source-restricted set of 50 direct binary and bitmap receivers on that register. **None produces a recognizable file header or at least 64 bytes of predominantly printable decompressed content.** A genuine GZIP-encoded prose plant of the same capacity recovers exactly. No unknown LP2 plaintext, original cipher key, hidden service, authored extraction instruction, or additional transmitted file was recovered.

## Why this register merits a direct test

The physical LP2 p49–51 images, \`66.jpg\`–\`68.jpg\`, print exactly 32×8 two-glyph numerals. Conditional conventional base60 decoding gives the project-pinned **256 original bytes**, SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Previous work established that their residues modulo29 form a polynomial divisible by independently motivated quadratic factors from the authentic 2013 BASE29 example and the p39 red triad. That earlier factorization concerns only **the byte remainder modulo29**; it does not constrain every byte's quotient.

Every byte \`b\` has the unique representation \`b = 29q + r\` with \`0≤r<29\`, \`0≤q≤8\`; for \`q=8\`, \`r≤23\`. This makes \`q\` an available, disjoint **base9 register** of up to 256 digits without consuming or modifying the previously studied GF29 codeword. In particular, \`9^256\` possible digit arrays provide an approximately 102-byte packet-sized address space. A human solver who has independently discovered the \`mod29\` structure could naturally inspect the integer quotients as remaining information. The book, however, does **not instruct this division or any binary packing**; this is a testable proposed data route, not an established intended layer.

The original quotient digit histogram for \`q=0..8\` is:

\`[22,33,38,22,29,32,34,21,25]\`.

## Source-frozen original trial

The [one-file Python standard-library SFT](../sims/lp2_p50_quotient9_sidechannel_sft.py) reads the existing untouched table, checks its exact original-byte SHA-256, and constructs its two unique quotient/remainder registers. It tests these 50 explicitly finite readouts:

1. **40 ordered base9 binary registers:** row or column major, direct or alternating serpentine, full reversal or not. In each of the eight unique physical traversals, convert the complete 256 digits to a fixed-width 102-byte integer in either endianness, or partition into consecutive 2-, 4-, or 8-digit blocks and convert those blocks without fitted byte shifts (128, 128, or 128 output bytes, respectively).
2. **10 eight-bit row bitplanes:** for each of the 32 original eight-cell rows, emit one byte from quotient bits 0, 1, 2, 3, or the threshold \`q≥4\`, read MSB-first or LSB-first.

For every output, report the initial raw bytes, printable fraction, and matches to source-era common magic headers (GZIP, ZIP, PDF, PNG, xz, bzip2, ELF, OpenPGP armor). Feed the exact complete bytes at offset0 to standard GZIP, ZLIB, raw-DEFLATE, bzip2, and xz decoders, with a 1MiB output bound. Flag a candidate only when at least 64 decompressed bytes contain at least 85% printable ASCII/whitespace. No arbitrary byte offset, XOR, shift, dictionary, invented password, later cipher layer, or language model selection is permitted.

| Measured source property | Outcome |
| --- | --- |
| Exact original table | **256/256** bytes, asserted SHA256 |
| 256 source quotient digits | Base9 histogram above |
| Direct printed-row major base9 integer | **102 bytes**, prefix \`09df179a3159d6a1aac6140c89736e8b\` |
| Complete readout modes | **50** |
| Recognizable original file signatures at offset0 | **0/50** |
| Readouts yielding ≥64 largely printable decompressed bytes | **0/50** |
| Largest raw printable fraction across readouts | **0.6953125**, from grouped base9 pairs; this is expected because each pair falls in the restricted byte range 0–80 and contains control symbols, not prose |

The inverse is **powered for a real encoded message**: take repeated English prose, encode it as GZIP, convert its exact bytes to a base9 integer in 256 digits, and store digit \`q\` in byte \`29q\`. The same untouched extraction routine recovers every compressed byte and GZIP yields the exact planted original passage. This is an independently specified synthetic positive and makes no claim that the historical author used this method.

## Decision

Reject a **literal, unencrypted base9-quotient file or legible byte register** under the 50 source-natural whole-table and bitmap readouts. The base9 register remains mathematically available but has no detected message, key, or decoding role. The apparent highest printable ratio must not be mistaken for a decryption: it is structurally inflated by the restricted 0–80 pair alphabet. A different keyed transport cannot be excluded by this bounded test; pursuing one requires a first-party instruction choosing the key/consumer rather than another unrestricted byte permutation search.

The GF29 factors and the original 2013 message remain exactly as documented in [the original factorization](2013-base29-gf29-grid-factor.md). This side-channel negative does not change the authoritative unsolved-book status in [the synthesis](../results/README.md).
