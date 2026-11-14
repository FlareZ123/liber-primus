# LP2 p54–55 13-dot-framed BASE29 packet gate

**Agent21 · 14 November 2026 · Director task #865.** The only bounded 13-rune/uint64 serialization tested here is exactly reversible, but it does **not** produce an authenticated binary object. The outer p54–55 interval is source-visible; the proposed internal 13-rune packet width and byte order are not fully specified by a first-party instruction. This retires this exact packetization, not all possible structured encodings.

## Source-selected interval

The original source annotations and canonical rune corpus give:

- Physical p54 / `71.jpg`: **232** runes. Its first **9** runes are a red span; a red **13-dot** mark follows at rune offset 9.
- Physical p55 / `72.jpg`: **76** runes; a red **13-dot** mark follows at offset 76.
- Taking the interval after the p54 marker through the p55 marker gives **299 runes**: (232-9+76=299=23\times13).
- The p54-to-p55 page turn occurs after 223 runes of the framed interval, i.e. **two runes into one 13-rune group**. The page break is therefore not treated as a packet boundary.

The 13-dot markers are a plausible outer frame for this final chapter interval. The marker count motivates one specific internal grouping hypothesis—13 GP symbols per packet—but the original sources do not explicitly say that the dots denote a 13-symbol word width. Nearby source controls caution against treating 13 dots as a universal width: p53 has 179 runes before its 13-dot end marker; solved p56 has 80 runes after its red preamble and 13-dot marker (with a separate 10-dot mark); solved p57 has 88 runes after its red preamble and 13-dot marker. None of those lengths is divisible by 13.

The authenticated 2013 TCP challenge demonstrates positional BASE29 conversion (`3301 → 3QO`), but does not specify binary packet framing, 13-rune words, or byte endianness: `resources/external/2013-tcp-server-signed-source.md`. The following is therefore one frozen, clue-motivated test—not an established historical serialization.

## Frozen serialization and controls

Use the canonical GP index alphabet 0–28. Read each 13-rune group as a left-to-right, most-significant-first base29 integer, then write that integer as one unsigned **8-byte big-endian** word. Since (29^{13}=10,260,628,712,958,602,189<2^{64}), every 13-rune group fits. The 299-rune interval yields **23 groups / 184 bytes**.

The reproducer `sims/lp2_p54p55_13dot_base29_packet_sft.cjs` pins the Git blob hashes of the corpus, ink annotations and transcription, asserts the exact source markers and rune counts, checks all 23 packet conversions in both directions, and verifies the following controls:

- Known solved p56 (85 runes) and p57 (95 runes) each round-trip exactly through the same padded 13-rune serializer when their source-known original length is supplied.
- A planted 184-byte / 23-word synthetic payload is encoded to exactly 299 GP29 digits and recovered byte-for-byte.
- Of the 22 internal 13-rune boundaries in the original p54–55 interval, only **2** coincide with a printed hyphen/period boundary; **20** split printed words. The serialization therefore treats the framed interval as a continuous rune stream, not a sequence of printed words.

These positive controls validate the conversion implementation; they do not authenticate the historical packetization.

## Original result

- Output length: **184 bytes**
- SHA-256: `0e88c53eb62a1cb5b65e1799c8339ca81cc4c744c69423e506ab3e5a84980712`
- First 32 bytes: `888c84d86a60f5df85d955dcf2b114fd78e997b62957bbbe8c9044e5e853615c`
- Last 32 bytes: `89918c38294745de4db4ffc53256459832335b9d99ad70736d092e977bf82d3f`

The opening `88 8c 84` superficially resembles an old-format OpenPGP signature packet header: tag 2, declared body length 140. The following signature-version byte is `0x84` (**132**, invalid). GnuPG `--list-packets` rejects the stream with “signature packet: [unknown version]” and subsequent invalid packets; `file` reports only `data`; OpenSSL ASN.1 parsing, ZIP and GZIP checks also fail. This is a false header resemblance, not a recovered PGP object or signature.

Full 184-byte output, hexadecimal:

```text
888c84d86a60f5df85d955dcf2b114fd78e997b62957bbbe8c9044e5e853615c
23d44545682eb30b348655c8709cd7cd1116966055a76ce95fcb191b54a896a
96edb83b89ef52e662f962b3bacafa13a476ad913b956cc92828cbf6e556d82b
353f806dc75bfbd4a15bfd4217ab99bec45f53c2aa685e9206d6677499f1e2c
373956804d396f792a21fdb1b57a0d0462215f3a7453be252a89918c38294745
de4db4ffc53256459832335b9d99ad70736d092e977bf82d3f
```

The prior direct BASE29 file gate already tested the full **308-rune** p54–55 page pair as a single integer (188 bytes) and found no common file/container signature: `im-results/lp2-original-chapter-base29-direct-file-gate.md`. This test is distinct: it uses the visible p54/p55 13-dot boundaries to exclude the 9-rune pre-marker span and tests 23 fixed 13-rune packets.

## Decision

The exact packetizer is lossless and reproducible, but the original output is not a parseable/checkable object. More importantly, the sources do not establish that the 13-dot mark count is an internal packet width or select a byte-endian convention; the 13-rune grouping is inferred from one segment's divisibility. Do **not** search little-endian variants, phases, offsets, prefixes, compression codecs, or arbitrary headers to rescue it. A successor requires an original source that selects the internal framing and byte order, or a distinct authenticated key/consumer. No unknown plaintext, key, payload meaning, or destination was recovered.
