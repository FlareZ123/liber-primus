# Original pp49–51 numeric table as a directly compressed source-byte payload

**Decision, Agent 41, 12 November 2026:** the canonical 256-byte interpretation of the printed 32×8 original table is **not a complete, directly decodable bzip2, gzip, zlib, raw DEFLATE or XZ/legacy LZMA stream** under the stated unmodified source order. All five corresponding codec positives pass. No unknown LP2 plaintext, file, key, inverse or destination is recovered. This closes one finite, human-plausible transport operation, not any encrypted or layered compressed payload.

## Why this test is historically motivated

Cicada's 2014 puzzle used **bzip2 decompression** on an earlier route (2014 Stage08), independently of LP2. LP2 physical pp49–51 visibly contain a **32-row by 8-column table of 256 two-character tokens**, naturally expressible as bytes using the conventional sexagesimal digit alphabet. A returning solver could reasonably ask whether this numeric block is another directly readable compressed file, rather than a cipher keystream or a table of independent symbols.

The original shared `resources/liber-primus/base60-grid.json` records the exact 32×8 table in printed row-major order and the conventional 60-character alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. Decode each token `ab` as `60·index(a)+index(b)`; all 256 values are in 0…255. The reconstructed byte stream has SHA-256

`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`

and starts with the hex bytes `cb e7 a7 ba 61 ed 7e b7 5c f9 9c de f7 04 b7 d4`.

## Source-frozen decoding experiment

Feed the **complete, unchanged 256-byte stream**, at byte position zero, to the standard Python library's five complete-message decoders. They reject it:

| Standard stream format | Exact readout of original bytes |
| --- | --- |
| bzip2 (historically most motivated) | `OSError: Invalid data stream` |
| gzip | `BadGzipFile: Not a gzipped file (b'\\xcb\\xe7')` |
| zlib envelope | `zlib.error: incorrect header check` |
| raw RFC1951 DEFLATE | `zlib.error: invalid distance too far back` |
| XZ / legacy LZMA container auto-detection | `LZMAError: Input format not supported by decoder` |

Each decoder first successfully recovers **every byte of the same independent 672-byte positive text** after compression by its matching standard encoder. The original 256-byte stream is source-locked and never edited, shifted, padded, salted, rekeyed or score-selected. A single-format negative does not prove the source is random; the positive controls only validate these five literal transports.

**Reproduction:** [single-file Python 3 standard-library SFT](../sims/p50_historical_compression_source_gate_sft.py). It reads the original table JSON on every run, reconstructs the bytes, checks the exact hash, verifies all codec positive round trips and asserts all five source decoders fail. It needs no extra package or network. The computations were also reproduced directly from the independently hash-checked 256 source bytes in a local Python 3 interpreter.

## Consequence for actual decryption

This eliminates an affordable direct-file hypothesis suggested by **real 2014 bzip2 precedent** and the source table's exact octet capacity. It does **not** eliminate compression *after an authentic cipher inverse*, a nonstandard packed stream, an author-selected different traversal, or a transformed table; no original clue presently selects any such extra step. There is no reason to perform offset/header/codec brute force merely to rescue this literal negative.

The higher-value unresolved table relationship remains its exact GF(29) factors connected to the signed 2013 BASE29 example and the marked p39 red triad. Those algebraic facts and their qualified limitations are recorded in [the full factorization](lp2-grid-complete-gf29-factorization.md) and [the source-quadratic tests](p50-p39-p3-field-remainder.md). This compression gate supplies no evidence for replacing that work.
