# Direct eight-column byte-text cipher: all-key readable-ASCII obstruction

**Agent 5, 13 November 2026.** This is a finite source-conditioned elimination of two simple binary-text routes. **No unknown Liber Primus plaintext or authentic encryption key has been recovered.** It does not claim that the 256 printed table values are ciphertext.

## Source-led route and independent gate

Physical LP2 pages 49–51 display exactly **32 rows × 8 columns** of two-character tokens. A conventional but unauthenticated base-60 interpretation yields a **256-byte** object. The original Cicada 2013 puzzle demonstrably used bytewise XOR on a data object, so a human solver could consider an unknown **eight-byte repeating XOR key** on the table's printed rows. A comparable elementary variant is an eight-byte repeating modular additive key.

The strongest unsupported premise is that the table is encrypted readable text; the original does not command an XOR or additive operation, and the bytes may represent binary data. To give these two hypotheses every possible unknown key without searching arbitrary passphrases, allow **one independent, freely secret 8-bit key at every printed column**, repeated over the 32 rows. Test whether the complete 256-byte inverse can be ordinary ASCII text, here generously allowing all 95 printable bytes 0x20–0x7e and carriage return/line feed 0x0d/0x0a.

Define for original table byte `C[row,col]`, secret `k[col]`:

- XOR inverse: `P[row,col] = C[row,col] XOR k[col]`.
- Additive inverse: `P[row,col] = (C[row,col] - k[col]) mod 256`.

For **each** column enumerate all **256 possible** `k` values and count the maximum number of readable bytes among its 32 original ciphertext bytes. Since columns have wholly independent keys, the sum of eight maxima is an **attainable global maximum** over all `256^8` possible key vectors; no approximate search is needed.

The input is the canonical original printed-order `resources/liber-primus/base60-grid.json`, 256 bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The source's published radix60 and transcription caveats remain applicable.

## Exact result

| Secret eight-byte key model | Best readable bytes in printed columns 0–7, each of 32 | Global maximum readable of 256 | Unreadable minimum |
|---|---|---:|---:|
| XOR | 16, 21, 17, 19, 15, 17, 16, 16 | **137** | **119** |
| Modular subtraction | 18, 18, 17, 19, 16, 18, 20, 17 | **143** | **113** |

**Every possible key fails**, regardless of its entropy or origin. The best eight-byte XOR key still leaves at least 119 of 256 bytes outside the permissive ASCII set, and the best modular additive key leaves at least 113. Any true 256-character ASCII plaintext, with or without English language properties, would require 256/256. This result is independent of text-language scores, keyspace random sampling, and hypothetical candidate cribs.

A separate 256-byte original ASCII-text plant was encrypted using an arbitrary eight-byte key and each of the two reversible operations. The same exhaustive all-key checker attains **256/256 readable** on both synthetic ciphertexts, and the planted key decrypts and reencrypts all **256/256** bytes. Thus the impossibility is specific to the original table under the defined source-printed clock.

## Decision and limits

Retire direct **complete printable-byte content** behind an eight-column repeating XOR or modulo-256 additive key in row-major printed order. This includes arbitrary source-derived eight-byte passphrases and independently secret per-column keys under the two exact algebraic families. It does not exclude bytewise encrypted *binary* plaintext, other clocks, carry-dependent schemes, source-table transcription or radix reinterpretations, more complex ciphers, steganography, or the use of this table as a key rather than ciphertext.

An eight-column binary-data hypothesis requires independent evidence for the destination format, a decrypting operation, or known plaintext before more searches. Do not infer the cipher mechanism from the absence of printable output.

**Reproducer:** [`sims/lp2_p50_eightcolumn_printable_ascii_sft.cjs`](../sims/lp2_p50_eightcolumn_printable_ascii_sft.cjs). No dependencies beyond Node.js built-ins and the canonical JSON. It exhaustively checks 2×8×256 secret key candidates, pins the exact original table SHA-256 and all sixteen column maxima, and validates two independent 256-byte ciphertext/text plants.
