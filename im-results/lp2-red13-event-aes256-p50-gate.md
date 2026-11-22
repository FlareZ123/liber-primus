# Red-rune / 13-dot 256-bit key against the p50 table: bounded AES-256 gate

**Agent 24 · 16 November 2026.** This is a source-motivated but unverified mechanism test. It does not recover plaintext, a key intended by the author, or the continuation destination.

## Hypothesis and human-visible trigger

Across the original 58-page image set, the current physical-source inventory records **225 red rune glyphs** and **31 thirteen-dot marks** (30 red, one black). In page order and page-local rune-offset order, those make exactly **256 events**. Separately, the numerical table spanning LP2 pp49–51 has **32×8 = 256 cells**. A solver could notice the shared 256 count and ask whether the red/13-dot event stream is a 256-bit key for the 256-byte table.

The test fixes one natural ordering: original page order, then increasing rune offset; a thirteen-dot mark at offset *i* is placed after rune *i−1* and before rune *i*. The two event classes become bits (red rune / 13-dot), with no event reordering. The table is read in its printed row-major order. The table's byte interpretation is conditional on the current base60 transcription.

## Frozen tests

1. Red rune = 0, 13-dot = 1, packed MSB-first.
2. Same event stream packed LSB-first.
3. Inverted bit polarity (red rune = 1, 13-dot = 0), MSB-first.
4. Inverted polarity, LSB-first.
5. A separate numeric-key interpretation: red rune → its Gematria Primus prime weight, 13-dot → 13; hash the 256-byte event tape once with SHA-256 to obtain a 32-byte AES-256 key.

Each key decrypts the exact 256 table bytes with **AES-256-ECB**, no IV and no padding. ECB is selected because it introduces no unprovided IV. No mode, nonce, key rotation, offset, or arbitrary table permutation was searched. Each of the five exact keys passed a synthetic 256-byte AES encrypt/decrypt round-trip control.

## Reproduction and results

Run:

    node sims/lp2_red13_event_aes256_p50_sft.cjs

Inputs:
- resources/liber-primus/lp2-ink-annotations.json (red spans and 10/13/23-dot events; source-derived inventory)
- resources/liber-primus/lp2-corpus.json (Gematria Primus rune and prime tables)
- resources/liber-primus/base60-grid.json (32×8 table token/byte interpretation)

Locked input checks:
- event counts: 225 red runes + 31 thirteen-dot marks = 256;
- table: 256 bytes, SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290;
- prime-valued event tape: SHA-256 cd50ba95b81f374c204b63cb78c40809fe336cbef6d06a2d7e1fcca16b31c494.

| Key mapping | Decrypted bytes SHA-256 | Printable ASCII fraction | Shannon entropy (bits/byte) | Zero bytes |
|---|---|---:|---:|---:|
| Dot=1, red=0, MSB | 6a4578fe0cf4f6bb648c6718df88bc417fd592891efb656f9ecc66752013924f | 0.4023 | 7.1174 | 0 |
| Dot=1, red=0, LSB | 937241ed43518845f92d99d2cf37c757fe2929b2e0e372b549da062de256de15 | 0.3633 | 7.1003 | 0 |
| Red=1, dot=0, MSB | e501139cd6e9da70cbfec6609456de20934e3db0405db51f7f8e9b589d9ac20b | 0.3750 | 7.0695 | 4 |
| Red=1, dot=0, LSB | 07d0d13191b9c47d7f2f5a1af7d1c18858acdf24d02f6ea7bb59ffceade4b6ed | 0.3750 | 7.0446 | 2 |
| SHA-256(prime-valued event tape) | cc9ae57d7893c36aa36478d9dcd66ec47fbb0495d3ebb3ac67fd2c89bdd86897 | 0.3711 | 7.1638 | 2 |

None begins with a tested PNG, JPEG, ZIP, GZIP, PDF, ELF, GIF, or 7z signature. The byte outputs remain high-entropy and contain no apparent typed plaintext. The Node implementation was independently cross-checked against OpenSSL 3.5.5; all five output hashes matched.

## Decision and limits

**Retire these five exact direct AES-256-ECB mappings.** The 256/256 numerical alignment is not sufficient evidence that the author intended AES, that ink classes encode bits, or that the base60 values are bytes. This negative does not exclude other cipher modes, a different event consumer, or a non-AES use of the red/dot stream; those would need a new source clue selecting the missing operation or key derivation. Do not expand this branch into unconstrained mode/IV/key searches.

No unknown LP2 plaintext, authentic key, or destination was recovered. This belongs in im-results/, not the established-results synthesis.
