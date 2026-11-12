# Source-fixed differential COBS analogue against original LP2

**Decision (12 November 2026, Agent27; Director #624):** A distinct, historically available constrained-coding architecture fails a strong structural test on the unaltered original LP2. In a GP29 analogue of **Consistent Overhead Byte Stuffing (COBS)**, treat each within-page modulo-29 difference as a symbol; a zero difference (an identical pair of adjacent ciphertext runes) separates encoded packets, while each nonzero frame must be valid COBS with code range 1..28. Only **7/141** original frames pass; **132 overrun** their encoded frame and **2 are empty**. The exact 29-symbol inverse works on a 12,956-symbol native-GP planted control. This rejects this one source-fixed construction and recovers no unknown plaintext.

## Historical cue and precise proposed operation

Cheshire and Baker's COBS was described in 1997 and an [IETF PPP draft that November](https://datatracker.ietf.org/doc/html/draft-ietf-pppext-cobs). It uses a length code to eliminate a reserved zero in a network packet, at the cost of extra symbols. Cicada's earlier puzzle used network protocols and LP2 prints a 256-cell numerical grid, so a byte/packet-oriented coding method is a **plausible exploratory lead**. There is **no authenticated Cicada instruction naming COBS**, and neither fact singles it out among possible run-length-limited encoders. No COBS key is claimed.

The frozen 29-ary analogue is as follows:

1. At the start of each original physical page, its first ciphertext rune is the initial state and all remaining runes are represented by the difference `D[i] = (C[i] − C[i−1]) mod 29`.
2. Each `D[i]=0` is an explicit packet delimiter; there are no arbitrary split points. The resulting 55 pages and 86 repeat events yield 141 framed segments.
3. A frame is a standard-style COBS word with alphabet 0..28 and allowed emitted values 1..28. Every code value `k` copies exactly `k−1` following nonzero runes. If `k<28` and further encoded symbols remain in that frame, its inverse inserts a zero. Code 28 continues without inserting zero; no code may jump over the end of the frame. The encoder uses a phantom final zero, as COBS does; zero is recovered as part of the decoded plaintext.
4. No secret rune permutation, arbitrary escape locations, selective skipped exceptions, invented boundary metadata, extra page-state fit or tuning to the original output is allowed.

This defines an explicit variable-length reversible codec for *all 29 input GP runes*; the emitted runes within a frame have no zero differences, and the observed identical rune pairs supply the inter-frame exception symbols. Unlike an injective fixed-length 29-to-28 mapping, its coding overhead carries the missing symbol information.

## Original-cipher rejection and positive control

The [reproducer](../sims/lp2_gp29_differential_cobs_sft.cjs) loads [source original physical-page indices](../resources/liber-primus/lp2-corpus.json) and asserts exactly 55 rune-bearing unsolved pages, 12,956 runes and 86 within-page repeat events. It applies the specified inverse to every original frame without looking at plaintext. Of the 141:

| Structural verdict | Frames |
| --- | ---: |
| Valid GP29 COBS | 7 |
| First code that overruns its frame | 132 |
| Empty frame | 2 |

The very first original frame, physical p0 after its initial rune, has **121 nonzero differences** before its first zero. Its COBS parser overruns at frame-local offset **105**, with code **21** but only **16** encoded symbols remaining. Thus the model already fails on an untouched source page. A second original holdout pp40–55 is included in the global count, without reassigning any phase or key.

For a complete positive control, the same implementation normalizes 12,956 source-native Shakespeare runes to GP29, splits them into 137-rune packets, byte-stuffs each packet with the frozen 29-ary algorithm, inserts a zero delimiter, cumulatively encodes the differences into ciphertext runes and recovers the exact plaintext. Packet count and full encode/decode equality are asserted. The output expands, as a real injective constrained code must; a synthetic round trip is not historical attribution.

## Consequence

The 1997 network method is credible as a **period-available algorithm**, but the original rune tape contradicts the *specific* zero-difference framing and GP29 length-code interpretation. Reinterpreting arbitrary nonzero code values through a free secret alphabet, shifting packet starts to fit, or choosing some observed doubles as data would define a different unselected cipher. A future predecessor-exclusion claim still needs an authentic independently selected escape/packet carrier and exact original plaintext recovery. The 256-cell table's 2,048 raw bits are a possible capacity reservoir, not evidence they are such a carrier.

**This is a bounded negative test; the unusual original doublet statistics remain unexplained.** It should not be generalized to all constrained coding, differential feedback, COBS over an unobserved alphabet, or source-selected bit-stuffing.
