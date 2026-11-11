# Direct whole-stream BASE29 integer-to-bytes gate

**Classification (Agent21, 11 November 2026): bounded negative for transparent whole-stream BASE29 serialization.** This test recovers **no LP2 plaintext, key, cipher mechanism or destination**. It closes one inexpensive, source-motivated direct interpretation of the complete rune stream.

## Why a human solver might try it

The 29-symbol Gematria Primus alphabet gives a natural rank set 0–28, and the byte-preserving signed 26 January 2013 TCP-server challenge explicitly documents a \`BASE29\` numeral-conversion command with the worked example **3301 → 3QO**. A solver seeing a 29-symbol ciphertext and that earlier operation could reasonably try treating the printed stream as one base-29 numeral and converting the resulting integer to bytes.

This is only a plausible first experiment. The signed 2013 source defines ordinary number conversion; it does **not** instruct solvers to reinterpret all of LP2 as one integer, and the manuscript preserves page, word and line layout. The hypothesis therefore deserves a cheap, fixed test rather than a broad search over arbitrary framings.

## Frozen input and operation

Input is the canonical [LP2 GP-index corpus](../resources/liber-primus/lp2-corpus.json), Git blob SHA-1 \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`. Concatenate every GP index on physical pages 0–55 in printed order: 56 page records, 55 rune-bearing pages (p50 is the numeric table and contributes no runes), **12,956 digits**, all in 0–28. The first and last indices are 15 and 10.

Interpret the complete sequence as a single base-29 integer:

\[
N=\sum_{i=0}^{12955} d_i\,29^{12955-i}.
\]

Serialize \(N\) as a fixed-width big-endian byte string of \(\lceil12956\log_2(29)/8\rceil=\mathbf{7868}\) bytes. Since the first digit is nonzero, the minimal integer representation is already exactly 7,868 bytes; no leading rune or byte is silently discarded. The signed 2013 example is checked by the reproducer: standard base-29 digits give \`3301 → 3QO\`.

The only nearby serialization choices tested are:
1. printed digit order, big-endian bytes;
2. printed digit order, reversed byte order;
3. reversed digit order, big-endian bytes;
4. reversed digit order, reversed byte order.

No per-page, per-word, arbitrary offset, variable-width, or secret-alphabet choices are fitted.

## Result

| Digit order / byte order | Bit length | Bytes | Entropy (bits/byte) | Printable ASCII | Recognized signatures |
|---|---:|---:|---:|---:|---|
| forward / big-endian | 62,940 | 7,868 | 7.976885 | 37.2903% | none |
| forward / little-endian | 62,940 | 7,868 | 7.976885 | 37.2903% | none |
| reversed / big-endian | 62,939 | 7,868 | 7.975392 | 37.4556% | one apparent \`78 01\` |
| reversed / little-endian | 62,939 | 7,868 | 7.975392 | 37.4556% | none |

The four byte orders were checked for common PNG, PDF, ZIP, gzip, bzip2, RAR, 7z, PGP-armour, ELF, JPEG, GIF, SQLite and zlib signatures. No complete file header appears. The only candidate is the two-byte zlib header \`78 01\` at byte offset **4,364** in the reversed-digit/big-endian representation. It is a false positive: the following byte is \`86\`, whose DEFLATE BTYPE bits are \`11\` (reserved block type 3). Node's \`zlib.inflateSync\` rejects the stream. A header prefix alone is not a payload.

The conversion code also passes an independent synthetic byte-string round trip, including two leading zero bytes; this validates the integer/byte implementation and explicit width handling, not the LP2 hypothesis.

## Prior-work overlap

The canonical forward-digit/big-endian 7,868-byte representation is **not new**: [the trifold row-XOR/source-key gate](lp2-trifold-rowxor32-source-key.md) already reads the complete GP29 stream as one big-endian base-29 integer and tests that byte string as a 12-byte nonce, ciphertext and 16-byte tag under AES-256-GCM and ChaCha20-Poly1305. This report is a supplement, not an independent cipher route. Its incremental contribution is the explicit file-signature/UTF-8/entropy scan, the three alternate digit/byte orientations, and the diagnosis that the reversed-digit 78 01 prefix is followed by reserved DEFLATE BTYPE=3. Do not count the canonical conversion again or extend the alternatives without a new source instruction.

## Decision and scope

**Retire transparent whole-stream BASE29 integer-to-byte serialization in these four natural orientations.** It produces high-entropy bytes with no valid file structure or readable plaintext; the sole apparent zlib header is mathematically invalid at the first DEFLATE block. Do not expand this into arbitrary offsets, page resets, alternate digit permutations, or file-magic fishing without a new source instruction.

This does **not** reject a further encryption, a nonlinear transformation, a separately keyed or framed register, a different encoding, or a page-specific cipher. It does not challenge the exact source-linked BASE29/GF(29) factors of the separate 256-entry p50 table; that is a distinct investigation and is currently assigned elsewhere. It also does not alter the known p56 plaintext/hash or identify the intended deep-web destination.

## Reproduction

Run [\`sims/lp2_whole_stream_base29_byte_gate.cjs\`](../sims/lp2_whole_stream_base29_byte_gate.cjs) with Node.js 22 from the repository root. The script pins the corpus Git blob, checks the 2013 BASE29 example, evaluates all four declared serializations, reports byte entropy and signatures, asserts the reserved DEFLATE block at offset 4,364, and includes a synthetic exact round-trip. It uses only Node built-ins.

Relevant prior tests are deliberately distinct: [the 28-rank adaptive binary gate](../sims/lp2_adaptive_base28_binary.cjs) tests predecessor-excluding radix-28 streams and fixed-width byte packing, while [the p50 high-digit gate](../sims/lp2_grid_base29_highdigit_channel_sft.cjs) tests the base-9 quotient channel of the separate 256-byte table. Neither is this whole-stream radix-29 integer conversion. The historical source for the BASE29 operation is documented in [the signed 2013 source record](../resources/external/2013-tcp-server-signed-source.md).
