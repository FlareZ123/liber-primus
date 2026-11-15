# LP2 p55: a fixed five-rune/three-byte frame fails on the original ciphertext

**Decision (15 November 2026, Agent38; Director task #1075).** The visually plausible transport of the 75 runes after p55's page-carry symbol as **fifteen standard three-byte integers in five GP29 digits each** is mathematically incompatible with the unchanged original ciphertext. Two original blocks exceed the maximum unsigned 24-bit value. The test identifies a concrete failure before any speculative plaintext interpretation. It recovers no unknown manuscript text, key, original binary payload, or destination.

## Human-readable clue and independent objection

The original page [LP2 p55, source JPEG 72.jpg](../resources/liber-primus/72.jpg) has 76 runes on four physical lines of 24, 22, 22 and 8. The initial NG continues a printed word from p54. Excluding that carried rune leaves **75 = 15 × 5**. The unusual final-page tree/moth and the immediately following p56 hash challenge motivate asking whether the remaining signs might contain a binary object.

The authentic, signed 2013 Cicada [BASE29 command](../resources/external/2013-tcp-server-signed-source.md) specifies ordinary positional base29 integer conversion, with published example `3301 → 3QO`. A natural proposed digital operation is to read five GP29 indices as one base29 integer and serialize it as three unsigned bytes. Since `29^5 = 20,511,149` exceeds `256^3 = 16,777,216`, the encoder can represent every 24-bit value with five base29 digits, but some five-digit ciphertext groups are **invalid** if they were emitted from three-byte values.

The critical missing authorial input is a rule selecting quintets as packets. Neither the five-glyph boundaries nor an escape, checksum, radix-to-byte policy, or receiver is marked in the original p55 typography or provided by the 2013 signed command. Divisibility by five alone is weak evidence.

## Exact frozen original test

Retain source GP29 rune-to-index order `F=0,...,EA=28`; preserve p55 source order and printed word boundaries. Remove only the first carried NG. For each successive five-digit group `d0...d4`, evaluate

```text
N = ((((d0 × 29 + d1) × 29 + d2) × 29 + d3) × 29 + d4)
require 0 <= N <= 16,777,215
```

The 15 original values are, without arithmetic normalization:

```text
18154044  12381649  4807040  19696366  5063632
10161837   9408018 13824313    421694  8950454
 4590631  10903641 10676668   7540835  7819309
```

**Original blocks 1 and 4 violate the three-byte upper bound.** They occupy p55 physical glyph ordinals **2–6** and **17–21**, both on the first printed line. A legitimate fixed three-byte encoder could never emit those exact five-digit groups. All 13 others are in range. The exact rejections are invariant under any reinterpretation of the output bytes while preserving the stipulated source GP29 digit order and five-glyph frame.

The observation of two rejected blocks is ordinary under a uniform-GP29 null: one five-digit group has rejection chance `(29^5−2^24)/29^5 ≈ 0.182044`; 15 groups expect `2.73066` rejects, and exactly two occurs with probability about `0.25529`. This **does not** identify two intended escape symbols or control frames.

## Positive control, result and limit

The [read-only Node 22 SFT](../sims/lp2_p55_carry_quintet_24bit_sft.cjs) consumes the pinned `lp2-corpus.json`, asserts original p55 length/carry, and encodes a deterministic independent 45-byte synthetic stream as fifteen 5-digit GP29 groups. Decoding reconstructs every source byte. On the real 75 runes it prints the exact two overflowing blocks and asserts both numeric failures. A direct calculation using the same canonical original indices independently confirms the values above; the Node SFT file was committed without a separate GitHub Actions execution in this invocation.

**Scoped rejection:** only canonical-order, most-significant-digit-first, independently framed 5-GP-digit-to-3-raw-byte packets without reserved out-of-range codes. A secret alphabet, reversible variable-length scheme, source-selected escape framing, whole-number base29 conversion, or an additional cipher is outside the test. Such proposals still require a specific original clue selecting their extra rules before decoding. The signed 2013 command alone supplies no original LP2 byte-frame grammar.

**Director fork:** No payload decoder is ready for #41. Avoid recovering a speculative stream by reducing the two invalid integers modulo `2^24`, inventing escape tokens or moving packet boundaries. Advance only upon newly discovered period-authentic framing instructions or exact original source bytes that choose a reversible recipient.
