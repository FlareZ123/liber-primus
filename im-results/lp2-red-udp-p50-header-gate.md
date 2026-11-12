# Red UDP and the original eight-column byte grid: complete RFC 768 header gate

**Original-input decision, 12 November 2026 (Agent 2).** A plausible previously untested human-solve path connects the only isolated red triple on physical LP2 p39, which becomes **UDP** under already solved GP29 Atbash, with the **32 × 8** original numerical table printed on physical pp49–51. RFC 768 defines a UDP header as exactly **8 octets**. Testing one frozen direct reading rejects **32 self-contained UDP datagrams** and provides no decipherment or address. The UDP triad itself remains a provisional clue, not an authenticated directive to apply the network format to the table.

## What a player could actually see

- P39 original rune offsets **119–121**, bracketed by red thirteen-dot marks, form one original red triple. Its exact GP29 indices are **[27,5,15]**. Already authenticated LP1 Atbash **`28−c mod29`** renders **`UDP`** by full GP transliteration.
- The original pp49–51 table (the older shorthand “p50”) has **32 printed rows with eight two-character tokens each**. The existing source-adjudicated conventional base60 decoding is `resources/liber-primus/base60-grid.json`, 256 bytes, SHA-256 **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**. An alternate base59 parsing remains an independent historical ambiguity.
- RFC 768, published in 1980, specifies four network-byte-order unsigned 16-bit header fields: source port, destination port, **UDP length**, checksum; the length includes the eight-byte header and any payload. A zero IPv4 UDP checksum means no checksum was supplied. See [original RFC 768](https://www.rfc-editor.org/rfc/rfc768).

The single proposed operation is therefore: interpret each original **printed row** as an **entire eight-byte UDP datagram**, with fields at byte offsets `0:2, 2:4, 4:6, 6:8`. There is no rearrangement, unknown key, reverse byte order or after-the-fact offset.

## Exact original result

- **0/32** row lengths are exactly eight bytes, so **none** is a complete datagram consisting solely of its printed row.
- **0/32** row lengths are even at most 256 bytes, although **the entire table contains only 256 bytes**. The encoded lengths range from **3,348 to 63,236** bytes.
- All **32 destination ports** differ, as do all **32 source ports**. No row specifies the historically considered UDP/7 Echo or UDP/17 Quote of the Day as either port.
- The first original row `CB E7 A7 BA 61 ED 7E B7` reads as source port **52,199**, destination port **42,938**, length **25,069**, checksum **32,439**; there are no accompanying source/destination IP addresses or 25,061 payload bytes.

An exact planted positive contains 32 complete eight-byte UDP/7 headers with length eight, destination port seven and no transmitted checksum. All 32 are detected and its single repeated destination port is counted correctly. A source parser independently asserts the red rune triple, all 256 original bytes, table shape and SHA-256.

## Constraint and next decision

This excludes **only the most literal player-actionable use** of the red word UDP and printed eight-column table as a series of complete UDP packets. The rows could be **headers of externally supplied much longer datagrams**, arbitrarily encrypted bytes or a different format, but no original source supplies the corresponding payloads, IP pseudoheaders or sender/receiver. A UDP checksum cannot be meaningfully checked without those bytes. The p39 Atbash UDP and eight columns are only a source-visible motivation to test this RFC, rather than a confirmed author-selected encoding.

No original unknown plaintext, authentic key, destination or reversible manuscript operator is recovered. A successor would need a contemporary authored packet framing, actual datagram source bytes or a packet receiver, not more unlabeled endian/layout sweeps.

**Reproduction:** [sims/lp2_p39_udp_p50_headers_sft.cjs](../sims/lp2_p39_udp_p50_headers_sft.cjs). CommonJS / Node22; run once from any working directory with `node sims/lp2_p39_udp_p50_headers_sft.cjs` from the repository root.
