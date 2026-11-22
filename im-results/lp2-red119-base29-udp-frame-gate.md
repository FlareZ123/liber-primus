# Original red119 prefixes as fixed 72-byte UDP frames: direct BASE29 gate

**Status (12 November 2026): bounded original-source negative.** No unknown LP2 text, key, UDP endpoint, port or packet has been recovered. This investigation tests one exact byte-frame interpretation and leaves other source-selected roles for the original prefixes open.

## Why this test was worth making

The original p3 and p39 red three-rune inscriptions are uniquely placed after **119** preceding runes each. The previously solved LP1 Atbash maps these inscriptions to GP `SCY` (SKY) and `UDP`; they are a provisional clue rather than a confirmed original packet instruction. The 2013 Cicada-signed TCP material independently demonstrates positional **BASE29** numerals (`3301 → 3QO`). The solved p56 prints a 64-byte hash target. A conventional UDP header has eight bytes, so **eight plus 64 = 72 bytes** is a concrete, falsifiable candidate framed payload. Exactly 119 base29 digits can represent 72 bytes if the leading value is small enough. Neither the signed example nor the red ink explicitly requests this 72-byte combination.

## Frozen original-cipher operation

Take the 119 original GP29 indices immediately before each printed red three-rune marker, in the original source order. Interpret their digits as one positional base29 integer with the signed 2013 digit sequence `0..28 = 0..9,A..S`. Serialize the integer as its **minimal unsigned big-endian bytes**, retaining a canonical 72-byte frame only when the integer fits in `[0, 2^576)`. A candidate header's two-byte length at offsets 4–5 must then be 72. This is a direct encoding, with no phase, omitted runes, truncation or fitted key.

| Original prefix | Base29 integer bit length | Minimal byte length | First eight bytes (hex) | Two-byte UDP length field |
| --- | ---: | ---: | --- | ---: |
| Physical p3 [0,119) | **578** | **73** | `0303a98d2c66cbcc` | **11366** |
| Physical p39 [0,119) | **578** | **73** | `0240ce33c8df0384` | **51423** |

Both integers are **greater than or equal to 2^576**, so neither can be the exact losslessly serialized 72-byte header-plus-64-byte frame under this frozen BASE29 convention. Even treating all 73 bytes as a packet, the byte fields at the natural header locations do not encode the actual frame length. Their top-byte values 03 and 02 are ordinary consequences of reading 578-bit integers as unsigned bytes, not a packet version proof.

A **positive plant** constructs one exact 72-byte UDP-style header (port 3301 in both port fields, length 72) followed by a reproducible 64-byte SHA-512 test payload, serializes it to precisely 119 base29 digits with leading zeros where necessary, and reconstructs all 72 bytes and header fields. The source-bound SFT tests the original corpus, pinned 119-digit values and the positive plant:

- `sims/lp2_red119_base29_udp_frame_sft.cjs` (CommonJS, Node.js 22; run with Node from the repository)
- Original data: `resources/liber-primus/lp2-corpus.json`, physical pages 3 and 39.
- Method uses Node's standard `fs`, `assert`, `crypto` and BigInt libraries.

## Decision

**Reject the literal 119 GP29 runes → fixed 72-byte UDP frame** for *both* original marked prefixes. The evidence does not exclude 73-byte data, a different packet length, a separately specified 2-bit tag, a different source-selected byte coding, or an entirely different meaning of SKY/UDP. Such variants lack a supplied original instruction; changing the framing or discarding high bits purely to rescue this candidate would add arbitrary degrees of freedom. Continue the source-selected original inversion program elsewhere rather than searching arbitrary ports and addresses.
