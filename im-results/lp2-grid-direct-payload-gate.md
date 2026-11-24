# LP2 p49–51: direct row-major byte payload decision (#2572)

**Decision: negative for the frozen canonical 256-byte stream as direct text or any requested standard file format.** The result does not select a radix or exclude a transformed/keyed/verification-register role. No plaintext or key is recovered.

## Input and replay

Read original scans 66–68 in printed order, 10+13+9 rows of eight cells. All 256 tokens agree with the canonical `resources/liber-primus/lp2-grid-256.json`; the visually ambiguous I/l cases use its earlier pixel adjudication rather than a new guess. The canonical numeric array is the frozen input, not an independent proof of radix60. Recomputing its documented alphabet conversion gives 256/256 matching bytes. Prefix: `cbe7a7ba61ed7eb75cf99cdef704b7d4`. SHA-256 identity checksum (not a new p56 candidate): `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

Reproduce from repository root using `node sims/lp2_grid_direct_payload_sft.cjs` (Node 22). Local Node 22.16.0 execution gave:

| Statistic | Value |
|---|---:|
| Bytes | 256 |
| Printable ASCII (32–126 inclusive) | 103/256 (40.234375%) |
| ASCII control bytes (0–31,127) | 24 (including 2 NULs) |
| C1-range bytes (128–159) | 32 |
| High bytes (128–255) | 129 |
| Strict 7-bit ASCII / UTF-8 | both fail |

PNG, JPEG, GIF87a, GIF89a, PDF, ZIP local/empty/spanned signatures, GZIP, SQLite, ELF, and armored OpenPGP have no matching magic at offset zero. The zlib CMF has method 11 and CINFO 12, and its header remainder mod31 is 26, violating the DEFLATE zlib header conditions.

## Binary OpenPGP false positive

The first byte 0xCB is syntactically a new-format tag 11 (literal data) header. This alone is weak because half of all possible first octets have the packet-header bit. The next octet 0xE7 indicates a 128-byte first partial body, below the 512-byte minimum for the historically applicable [RFC 4880 §4.2.2](https://www.rfc-editor.org/rfc/rfc4880.html#section-4.2.2). The literal format octet 0xA7 is not one of b/t/u (§5.9). Even allowing the nonconforming partial header, offset 130 gives a final length of 86, ending the first packet at exclusive offset 217. The remaining bytes begin DB 94: tag 27, declared length 148, with only 37 available bytes. This is not a complete packet stream. No payload parser or decompression is warranted.

## Consequence

Close #2572 as a bounded direct-format negative. Do not add XOR, arbitrary offsets, transpositions, header repairs or speculative decompression to rescue this hypothesis. #2527 and #2568 concern separate table consumers; their premises are unaffected. The underlying numeric interpretation remains conditional and the full LP2 plaintext remains unresolved.
