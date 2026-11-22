# Original LP2 p49–51 whole-field base60 OpenPGP gate

**Decision, 16 November 2026.** The one source-selected serialization in [Director Issue #1197](https://github.com/FlareZ123/liber-primus/issues/1197) fails at **byte 0**, before any OpenPGP packet length, type, compression, integrity, or checksum fields can be parsed. It recovers no unknown-page text, message, key, or authentic binary payload. This retires only one uninterrupted big-endian base-60 numeral over the 256 printed numeric cells.

## Frozen original-source input and interpretation

- Input: `resources/liber-primus/base60-grid.json`, Git blob `4698c0806e6bab06a39cfbc3c3283b862de58b35`; original physical scans `66.jpg`–`68.jpg`. The JSON is an existing derived transcription whose eleven historically disputed cells were independently confirmed from original ink; the remaining 245 cells are not comprehensively source-audited. No candidate table glyph was edited for this test.
- Source's six-column digit alphabet: `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` (60 characters). Traverse 32 source rows × eight cells left to right and top to bottom, in source-page order 10+13+9 rows.
- Concatenate the 256 two-character cells as exactly 512 base-60 **digits**; evaluate one integer `N = Σ digit[i]·60^(511−i)`. Encode `N` as the **minimal unsigned big-endian** byte array. Do not introduce byte alignment at the 8-cell line boundaries or prepend extra bytes. The first original token is `3N`; consequently the integer has no ambiguous leading zero digits.
- The direct cellwise 256-byte interpretation and the earlier 32 separate row-numeral serialization (#341) are **different tests**, neither rerun here.

## Recovered exact byte stream and first structural failure

| Measurement | Observed |
|---|---|
| Tokens / digit characters | 256 / 512 |
| Integer bit length | 3021 |
| Minimal big-endian bytes | **378** |
| First 16 bytes | `12204754723f01d40f67a205eb1f203b` |
| Last 16 bytes | `7e9de0404d8a6c78b709e0a76712c620` |
| Byte-stream SHA-256 | `fe6ac8cb1690d4ae0e5f432a205fa570883c3ce44699a9513246cc8425d58d85` |
| First packet octet | `0x12`, binary `00010010` |
| Packet parse | **Invalid immediately: bit 7 = 0** |

The original 2007 [OpenPGP RFC 4880 §4.2](https://datatracker.ietf.org/doc/html/rfc4880#section-4.2) requires **bit 7 = 1** in the first packet header octet for both historical old and new formats. Thus `0x12` cannot begin an OpenPGP packet. This is a strict syntax rejection, independent of CRC, compression selection, plaintext scoring or modern PGP version conventions. Actual **GnuPG 2.4.7** `--list-packets` independently returned `no valid OpenPGP data found` on this same original 378-byte stream.

A useful algebraic strengthening follows directly from the source's leading digit **3**, even without inspecting its remaining 511 characters: any 512-digit base-60 integer with first digit 3 lies in `[3·60^511,4·60^511−1]`, whose minimal big-endian representation has 378 bytes and first byte between `0x10` and `0x15`. **All such strings necessarily violate the same OpenPGP packet-header requirement.** This rules out postselecting other original table cells while keeping the first printed digit and unchanged one-field format.

## Independent direct cellwise byte-layout trap: header-shaped prefix is insufficient

The other obvious reading of the **same** 256 original two-digit tokens is the already documented *one-token–one-byte* stream. As a strict OpenPGP packet-layout check, that raw 256-byte stream has SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` and begins `cb e7 a7 ba 61 ed 7e b7`. Superficially, **`0xCB` really is a new-format tag-11 literal-data packet** and `0xE7` really is a first partial-body length of 128 octets. This is more interesting than an arbitrary missing file magic, so check every mandatory field and packet boundary rather than declaring success from the first two bytes.

- The literal-data body's required first **format octet is `0xA7`**, whereas 2007 RFC 4880 §5.9 permits only `b` (binary, `0x62`), `t` (text, `0x74`) or `u` (UTF-8, `0x75`). The format is invalid immediately at **absolute offset 2**; no key guess or compression method can correct it under this frozen byte readout.
- The first 128-byte partial body ends at absolute byte 130, which is `0x56`, the correct small final-length field for **another 86 body bytes**. Its packet ends at offset **217**. The putative next header is `0xDB` (new-format tag 27), followed by `0x94`, declaring **148** bytes, but only **37** remain. The packet sequence is **truncated by 111 bytes** regardless of tag 27's meaning. A complete one-packet literal message also cannot explain the 39 trailing bytes.
- Actual **GnuPG 2.4.7** with `--list-packets` on the cellwise binary misleadingly returned process exit status **0** while printing `mode ? (A7)` and `raw data: unknown length`. GnuPG's permissive diagnostic listing is **not** proof of a valid OpenPGP packet or authenticity. Our strict source-fixed SFT rejects the invalid literal-format octet and independently asserts the second packet's length overrun.

This second check rejects only the **exact direct 256-byte row-major layout as a complete RFC 4880 packet sequence**. It does not turn the arbitrary PGP-like prefix into a decipherment or exclude non-PGP readings, source-selected other formats or later missing keys.

## Positive control and reproducibility

The standalone CommonJS SFT [`sims/lp2_p50_wholefield_base60_openpgp_sft.cjs`](../sims/lp2_p50_wholefield_base60_openpgp_sft.cjs) reads the unchanged resource, independently reconstructs each cell value, does one whole-field integer conversion, checks the first required RFC 4880 header bit, and tests exact inverse radix conversion. A synthetic **256-cell** base-60 field is formed by left-padding one valid literal packet's integer with zero digits. Its 10 nonleading bytes are `cb086200000000004f4b` (new-format tag 11, eight-byte body, binary-mode empty filename, zero timestamp, data `OK`). It decodes exactly; a structural positive parser recovers `OK`. GnuPG 2.4.7 independently returned `literal data packet: mode b ... raw data: 2 bytes` for the planted stream. Positive byte SHA-256: `0d8dfff24baa92e9fadcb3a7e7a4d04c4fde1b061e2ef177078945cbf858c330`. The planted digit-pairs need not satisfy the original table's 0…255 cell values; the positive validates codec and packet parser behavior, not the source distribution.

**Scope and next decision:** No OpenPGP packet exists **at offset 0 of this exact 378-byte whole-field base60 reading**. Do not attempt other offsets, bytewise XOR, reversed orders, selected patches or broader radix/packet searches without an independent creator-era clue. The historical base59 representation ambiguity is separately unresolved and was deliberately not optimized here. The numeric table itself may still have a mathematical, cryptographic, steganographic, or unrelated role.
