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

**Result:** no tested direct ordering/framing satisfies the 23-bit leading-bit constraint. The best candidate is the top-right, counterclockwise inward spiral, big-endian, deleting zero-based byte 154; it still has **31 invalid leading octets out of 85**. Row-major and column-major best cases each leave 37/85 violations. This rejects the direct 3-byte RFC 5242 interpretation under these orders and a one-byte framing model. It does not reject an additional, independently sourced permutation or transform; none has been identified.

## Bounded cross-carrier test: all three named 2014 byte snapshots

The repository also preserves three named 256-byte historical onion-response candidates. To test whether the RFC clue might consume one of these rather than the LP2 panel alone, each stream was tested directly and after same-index XOR with the p49–51 table. This is a bounded candidate family, not evidence that Cicada instructed the two sources to be combined.

For each object, all 256 possible one-byte framing deletions were enumerated; the remaining 255 bytes were parsed as 85 three-octet codepoints. Big-endian is the RFC's leading-octet reading; little-endian is a permissive control. The necessary condition is 0/85 leading octets with the high bit set. The implementation also checks for literal zero bytes and a contiguous 00 00 00 reserved codepoint.

| 2014 snapshot | Raw best BE | Raw best LE | Same-order XOR best BE | Same-order XOR best LE |
|---|---:|---:|---:|---:|
| Onion2 | 39/85 (delete 0) | 39/85 (delete 69) | 39/85 (delete 160) | 34/85 (delete 63) |
| Onion3 | 35/85 (delete 61) | 38/85 (delete 105) | 38/85 (delete 187) | 37/85 (delete 168) |
| Onion4 | 38/85 (delete 16) | 44/85 (delete 9) | 47/85 (delete 31) | 41/85 (delete 207) |

The only zero bytes in the XOR outputs occur at Onion2 index 3, Onion3 index 194, and Onion4 indices 34, 56, 58. Deleting those individual zero bytes still leaves respectively 42/40, 39/38, and 47/49, 49/48, 49/48 invalid leading octets (BE/LE). No raw stream or XOR output contains a contiguous 00 00 00 codepoint. The raw streams contain no zero bytes.

**Result:** none of the three raw snapshots or their same-order XORs with the LP2 panel satisfies even the necessary 23-bit leading-bit condition. The best canonical big-endian result in this family still has 35/85 violations; the permissive little-endian control bottoms at 34/85. The arbitrary best deletion is diagnostic only; no source selects that byte position. The one-byte framing is suggested by 256 = 1 + 85×3, not required by RFC 5242; RFC's reserved zero is a full three-octet codepoint.

Reproduction: `sims/lp2_rfc5242_historical_crosscarrier_gate.cjs` · captured output: `lp2-rfc5242-historical-crosscarrier-output.json`. The script includes synthetic valid/invalid controls (0/85 and 85/85).

This closes only direct 85×3 RFC 5242 streams from these raw inputs and same-index XORs. It does not rule out a separately sourced transform, but no such transform is currently identified.

## Direct GP29-radix representation of RFC 5242 codepoints

A second natural bridge is to represent each 23-bit RFC codepoint as five GP29 digits: 29^4 < 2^23 < 29^5. This uses the manuscript's canonical 0–28 rune indices directly and avoids assuming the 256-byte panel is the input.

The global original rune tape for pages 0–55 has 12,956 symbols: 2,591 complete five-rune groups plus one leftover. Only 7 of the 55 rune-bearing pages have a rune count divisible by five (the empty numeric-grid page 50 is the eighth zero-remainder page), so page-local grouping is not naturally aligned. I therefore tested the continuous p0–p55 tape, all five possible group offsets, and both digit orders. A group is a valid RFC codepoint only if its value is in 1..8,388,607.

| Digit order | Offset | Valid groups | Invalid groups | Valid % |
|---|---:|---:|---:|---:|
| Big-endian | 0 | 1067/2591 | 1524 | 41.18 |
| Big-endian | 1 | 1047/2591 | 1544 | 40.41 |
| Big-endian | 2 | 1079/2590 | 1511 | 41.66 |
| Big-endian | 3 | 1024/2590 | 1566 | 39.54 |
| Big-endian | 4 | 1033/2590 | 1557 | 39.88 |
| Little-endian | 0 | 1032/2591 | 1559 | 39.83 |
| Little-endian | 1 | 1063/2591 | 1528 | 41.03 |
| Little-endian | 2 | 1044/2590 | 1546 | 40.31 |
| Little-endian | 3 | 1081/2590 | 1509 | 41.74 |
| Little-endian | 4 | 1018/2590 | 1572 | 39.31 |

For uniformly random five-digit base-29 groups, the expected in-range fraction is 8,388,607 / 29^5 = 40.8978%. The observed 39.31–41.74% range is consistent with that null, not with a valid codepoint stream; every tested framing leaves roughly 58–61% of groups outside the 23-bit space. No decoded groups fall in RFC's small special/mark/reserved ranges.

The RFC's Section 6 AE composite is the six-codepoint sequence 0x40A, 0x006, 0x40C, 0x007, 0x108, 0x031. Its exact fixed-five-digit base-29 serialization (30 rune digits) appears nowhere in the p0–p55 tape, forward or reversed.

**Result:** direct GP29 base-29 encoding of RFC 5242 codepoints is rejected. The 23-bit/RFC clue remains an unverified pointer, but neither the obvious 3-octet byte receiver nor the natural five-digit GP29 receiver produces a valid stream or plaintext.

Reproduction: `sims/lp2_rfc5242_gp29_base29_gate.cjs` · captured output: `lp2-rfc5242-gp29-base29-output.json`.
## Other guardrails

- The pair `(g,p)=(133,331)` has multiplicative order 66; `(1033,3301)` has order 550. Apparent matches to short LP2 blocks are not sufficient evidence for a DH cipher. Direct additive/multiplicative orbit-key tests on the p49 preamble and the numbered p33–39 block did not recover language.
- The 32×8 table's byte values do not form a simple 5-bit-node/3-bit-direction adjacency list: neither 3-bit field is a per-row permutation of directions 0–7, and reciprocal edges are sparse.
- The p0 13-column transposition branch overlaps existing 13×55 matrix investigations; it is not advanced here.

## Decision

Keep the base-60 coordinate output RFCÆ as a low-confidence pointer, not a decryption. The direct 85×3 interpretation fails on the LP2 panel, all three named 2014 byte snapshots, and their same-order XORs with the panel. No source-selected permutation, byte transform, or GP29-to-RFC mapping is identified. Do not broaden this into arbitrary RFC mining or arbitrary byte permutations. Resume only if an independent historical clue selects a reversible operation or supplies a specific mapping. No plaintext, key, or destination is recovered.


## External RFC references

The identifier reading points to these documents, but their relevance to LP2 remains unproved:

- [RFC 133 — File Transfer and Error Recovery](https://www.rfc-editor.org/rfc/rfc133)
- [RFC 331 — IMP System Change Notification](https://www.rfc-editor.org/rfc/rfc331)
- [RFC 1033 — Domain Administrators Operations Guide](https://www.rfc-editor.org/rfc/rfc1033)
- [RFC 3301 — Layer Two Tunnelling Protocol (L2TP): ATM Access Network Extensions](https://www.rfc-editor.org/rfc/rfc3301)
- [RFC 5242 — A Generalized Unified Character Code: Western European and CJK Sections](https://www.rfc-editor.org/rfc/rfc5242)
- [RFC 5243 — OSPF Database Exchange Summary List Optimization](https://www.rfc-editor.org/rfc/rfc5243)

The first four titles span file transfer, IMP notification, DNS administration, and L2TP; the 5242/5243 documents concern character encoding and OSPF. This thematic overlap is insufficient to establish a common operation or a route to plaintext.


### Why RFC 5242 is a specific, but still unconfirmed, target

The fourth zero-based coordinate selects the GP rune `Æ` (transliterated `AE`), not an arbitrary Latin letter. RFC 5242's Western European section explicitly includes an `æ` ligature representation. Thus the conditional `RFCÆ` output points more specifically toward RFC 5242 than toward an unspecified RFC collection. This is an additional consistency clue, not independent proof: it still depends on the unestablished zero-based coordinate convention, and the direct 85×3-byte interpretation fails the RFC's leading-bit constraint above.
