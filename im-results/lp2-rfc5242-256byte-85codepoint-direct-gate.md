# RFC-number / base-60 coordinate lead and RFC 5242 direct-byte gate

**Status:** intermediate; no plaintext recovered and no cipher mechanism established.

## Candidate cross-reference

The original 2014 Stage11 index at `resources/external/cicada2014-stage11-onion7-original-index.html` has numeric metadata `<title>133</title>` and `<div id="331">`, and lists the 58 LP2 images `0.jpg`–`57.jpg`. The cuneiform numerals repeated on LP2 pages 33 and 38 are transcribed as decimal values 1033 and 3301.

Converting the four decimal values to sexagesimal gives:

| Decimal | Base-60 decomposition | Candidate LP2 coordinate |
|---:|---:|---:|
| 133 | 2×60 + 13 | page 2, offset 13 |
| 331 | 5×60 + 31 | page 5, offset 31 |
| 1033 | 17×60 + 13 | page 17, offset 13 |
| 3301 | 55×60 + 1 | page 55, offset 1 |

Using zero-based page and rune offsets in the original 0–57 LP2 sequence, these select **R, F, C, Æ** (GP transliteration `R F C AE`). The first three spell **RFC**. The four source numbers are also valid RFC identifiers (RFC 133, 331, 1033, 3301).

This is an interesting but **unverified** lead, not a decryption. It depends on treating HTML metadata values as decimal integers to be converted to base 60, then treating the second component as a zero-based rune offset. With one-based rune positions, the selected symbols are `EA, NG, M, NG`; reading the digit strings themselves as sexagesimal gives different positions. Neither the HTML nor the manuscript explicitly states this coordinate convention. Do not promote the `RFC` reading to fact without an independent selector or receiver.

The 2014 onion-port sequence 5240–5243 is reported in secondary community material, not established by the original index HTML. RFC 5242 (a 23-bit character-code proposal) and RFC 5243 (OSPF database-exchange optimization) are possible cross-references, not confirmed instructions.

## RFC 5242 byte-alignment test

A tempting size relation is `256 - 1 = 255 = 85 × 3`. The derived numerical panel in `resources/liber-primus/base60-grid.json` contains 256 byte values arranged 32×8; LP2 page 56 contains 85 runes. RFC 5242 describes 23-bit codepoints stored in three octets, with the most-significant bit of the leading octet clear. If one panel byte is framing and the remaining 255 bytes are a direct 85-codepoint stream, every third byte in the appropriate endian order must therefore be below 128.

The reproducer is `sims/lp2_rfc5242_256byte_85codepoint_gate.cjs`. It tests row-major and column-major order, eight natural inward-spiral orders, every possible single-byte deletion, and big- and little-endian placement of the most-significant octet.

**Result:** no tested direct ordering/framing satisfies the 23-bit leading-bit constraint. The best natural candidate still has **31 invalid leading octets out of 85**. This rejects the direct 3-byte RFC 5242 interpretation under these orders and a one-byte framing model. It does not reject an additional, independently sourced permutation or transform; none has been identified.

## Other guardrails

- The pair `(g,p)=(133,331)` has multiplicative order 66; `(1033,3301)` has order 550. Apparent matches to short LP2 blocks are not sufficient evidence for a DH cipher. Direct additive/multiplicative orbit-key tests on the p49 preamble and the numbered p33–39 block did not recover language.
- The 32×8 table's byte values do not form a simple 5-bit-node/3-bit-direction adjacency list: neither 3-bit field is a per-row permutation of directions 0–7, and reciprocal edges are sparse.
- The p0 13-column transposition branch overlaps existing 13×55 matrix investigations; it is not advanced here.

## Decision

Keep the RFC/base-60 coordinate observation as a low-confidence lead for Director review. Do not launch broad RFC mining or arbitrary table permutations from it. A worthwhile successor requires independent evidence that the four RFC identifiers are intentional and a specific, source-selected operation that consumes their contents or the numeric panel.


## External RFC references

The identifier reading points to these documents, but their relevance to LP2 remains unproved:

- [RFC 133 — File Transfer and Error Recovery](https://www.rfc-editor.org/rfc/rfc133)
- [RFC 331 — IMP System Change Notification](https://www.rfc-editor.org/rfc/rfc331)
- [RFC 1033 — Domain Administrators Operations Guide](https://www.rfc-editor.org/rfc/rfc1033)
- [RFC 3301 — Layer Two Tunnelling Protocol (L2TP): ATM Access Network Extensions](https://www.rfc-editor.org/rfc/rfc3301)
- [RFC 5242 — A Generalized Unified Character Code: Western European and CJK Sections](https://www.rfc-editor.org/rfc/rfc5242)
- [RFC 5243 — OSPF Database Exchange Summary List Optimization](https://www.rfc-editor.org/rfc/rfc5243)

The first four titles span file transfer, IMP notification, DNS administration, and L2TP; the 5242/5243 documents concern character encoding and OSPF. This thematic overlap is insufficient to establish a common operation or a route to plaintext.
