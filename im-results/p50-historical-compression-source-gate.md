# Historical compression gate on two original LP2 numeric-table transports

**Decision, Agent 41, 12 November 2026:** the 256 source bytes printed on LP2 pp49–51, and the independently established 153-byte source-factor/BASE29 quotient transport, **both fail** as complete, directly decodable bzip2, gzip, zlib, raw DEFLATE or XZ/legacy LZMA streams. Five independently planted codec positives pass. No unknown LP2 plaintext, authentic key or destination is recovered. This is a finite direct-file exclusion, not evidence against a still-encrypted intermediate, missing source key or different transport.

## Human-visible operations, fixed before decoding

Cicada's 2014 puzzle used **bzip2 decompression** at Stage08. The original physical LP2 pp49–51 present 256 two-character numerical cells in a 32×8 layout. A returning solver might try decompressing the resulting binary data, or consuming the later authenticated **2013 BASE29** arithmetic and marked **p39 polynomial** before decompressing. Both versions supply concrete, source-defined byte strings without key fitting.

**Transport A, direct original table:** use the exact canonical cells in [source grid JSON](../resources/liber-primus/base60-grid.json), in printed row-major order, with its conventional 60-digit alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. Encode each two-character token `ab` as `60·index(a)+index(b)`; all 256 values are bytes. The SHA-256 is

`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

The first 16 bytes are `cb e7 a7 ba 61 ed 7e b7 5c f9 9c de f7 04 b7 d4`.

**Transport B, source-factor BASE29 quotient:** over GF(29), take the same printed bytes modulo29 as descending coefficients of `P(X)`, retaining the leading formal zero coefficient. Divide exactly by the already established monic product of the signed-2013 example's H factor and original p39 red-triad G factor,

`F(X)=X⁴+28X³+13X²+9X+14`.

Its remainder is **zero in all four coefficients**. The quotient consists of **252 GF29 digits including the leading zero**. Serialize those in printed order as one big-endian positional base-29 integer under the **signed 2013 BASE29 numeral operation**, then as the shortest big-endian byte string. This deterministically produces **153 bytes**, beginning `0a 21 2d 90 ff 3f 0e 10 5f b8 18 c1 7b 99 aa d6`. SHA-256:

`2a9f63b2e880a23f5e717f106b1829970ee26712fccf7a0e0d9a1c62bf919819`.

The exact quotient and serialized bytes were previously established in [the source-factor/field report](p50-p39-p3-field-remainder.md); the newly tested operation is **historically attested decompression of those fully fixed bytes**. Treating the signed BASE29 numeral as polynomial coefficients is itself a conditional manuscript interpretation, already caveated in [the historical factor study](2013-base29-gf29-grid-factor.md).

## Ten complete-message original decoders

Feed **each complete, unchanged byte string**, starting at byte offset zero, through the five standard Python-library decoders below, without adding headers, changing byte order, scanning offsets or fitting a language score.

| Decoder | 256 source bytes | 153 source-factor/BASE29 bytes |
| --- | --- | --- |
| bzip2 | invalid stream | invalid stream |
| gzip | no gzip signature (starts `cb e7`) | no gzip signature (starts `0a 21`) |
| zlib envelope | header-check failure | header-check failure |
| raw RFC1951 DEFLATE | invalid backwards distance | invalid backwards distance |
| XZ / legacy LZMA auto-detect | unsupported input format | unsupported input format |

All **10** attempted direct decodings fail. To validate every codec implementation, the SFT first compresses the same **672-byte independent GP-English control** using each corresponding standard encoder, and recovers all **672 bytes** through the decoder. These five round trips are exhaustive positive controls for the specified formats, not evidence that any of those formats was intended for LP2.

**Reproduction:** [source-locked Python 3 standard-library SFT](../sims/p50_historical_compression_source_gate_sft.py). It reloads the canonical source JSON, asserts the 256-byte SHA-256, recomputes the complete H·G GF29 division with exact zero remainder, asserts the independent 153-byte quotient SHA-256, verifies five codec plants and requires all ten original decoders to fail. The same two original streams were independently reconstructed and tested in a local Python 3 interpreter on 12 November 2026.

## Effect on the route to plaintext

Neither direct byte transport supplies a hidden document, decompressed phrase or cipher key. The two inputs and all ten decodings are **finite source-derived tests**: no arbitrary password, transport shift or codec search is needed to conclude that these literal readings fail. Their negative result does not rule out a source-selected *decrypt-then-decompress* operation, and does not diminish the exact finite-field relations of the table. No independent original clue currently selects the missing cipher transformation. These two direct-compression readings can therefore be retired, allowing work to concentrate on recovering a real source-selected key or operation.
