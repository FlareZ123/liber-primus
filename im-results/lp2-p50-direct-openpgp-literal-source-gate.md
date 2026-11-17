# LP2 pp49–51 256-cell table: direct OpenPGP literal-packet gate

## Decision on original input, 17 November 2026

**No unknown LP2 plaintext, source-selected key or continuation has been recovered.** This is a bounded attempt to recognize a complete *typed original payload* in a historically plausible 2014 format. The original p49–51 table has 32 rows × 8 cells of two-character source tokens; the established, still provisional base60 reading produces 256 byte values. The first three original table tokens are `3N 3p 2l`, interpreted literally as `203 231 167` (hex `CB E7 A7`). These exact bytes are asserted against both source token rows and the independent recorded byte rows by the SFT.

Cicada used OpenPGP historically. `CB` is a plausible OpenPGP **new-format packet header with tag 11**, which is a Literal Data packet. This is an unusually concrete, typed first-byte candidate worth ruling on using the authentic 2014-era [RFC 4880](https://www.rfc-editor.org/rfc/rfc4880.html), rather than searching arbitrary file signatures.

**Two independent structural contradictions reject the direct interpretation.** Per RFC 4880 §4.2.2.4, the next byte `E7` is a partial-body length declaring `2^(0xE7 & 31) = 128` data bytes, but a first partial-body length **MUST be at least 512 bytes**. The full original register contains only 256 bytes. Independently, §5.9 requires the first Literal Data body octet to be `b` (`0x62`), `t` (`0x74`) or `u` (`0x75`), with deprecated `l` (`0x6C`) possible in older conventions. The actual next body byte `A7` (`0xA7`) is none of them. A malformed header cannot supply a verified compressed, signed or literal message, much less a key or original LP2 plaintext.

## Reproduction and exact scope

Source: [the frozen 32×8 token/byte table](../resources/liber-primus/base60-grid.json) and [source-integrity and radix caveats](../resources/liber-primus/lp2-grid-256.json), original scans `66.jpg`, `67.jpg`, `68.jpg`. [Single-file CommonJS reproducer](../sims/lp2_p50_openpgp_direct_packet_sft.cjs) reads the source table, checks all 256 token→byte values and the first three bytes, uses a valid short binary literal packet as a control, and asserts both real-source format failures. The source gate is deterministic and does not depend on a language model or an invented key.

The conclusion excludes **only source-order direct base60 bytes interpreted from offset zero as a complete RFC 4880 unencrypted literal packet**. A different specified transport, ciphered stream, radix59 interpretation, offset or ordering could change the bytes, but none is selected by this test. We deliberately do not search those unconstrained variants. The `CB` byte by itself is insufficient evidence of intent; the two downstream bytes refute the proposed typed output.

## Research implication

A real table→OpenPGP→plaintext route would need an independent author-visible instruction to transform the table **before** packet parsing, plus the resulting byte stream must pass the complete historical OpenPGP packet grammar and yield a source-typed object. Until such a selector appears, this route is closed at the first original header and should not generate additional parameter sweeps.
