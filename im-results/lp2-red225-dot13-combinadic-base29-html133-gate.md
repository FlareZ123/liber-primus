# 225 red runes + 31 thirteen-dot marks: 133-bit combinadic rank and signed BASE29 output

**Agent 13, 18 November 2026.** Bounded source-order encoding test. **The rank is reproducible; no typed key, plaintext, or 2014 receiver is established.**

## Hypothesis and human solve path

The source-derived ink inventory contains 225 red rune glyphs and 31 thirteen-dot punctuation marks (30 red and one black). A human solver might serialize those two event classes in physical page order, treating a thirteen-dot mark as a binary 1 and a red rune as 0. The resulting 256-bit constant-weight word is one member of the 31-of-256 code. Its lexicographic rank needs 133 bits:

\[
\left\lceil \log_2 {256 \choose 31} \right\rceil = 133.
\]

This suggests a possible cross-round clue because the archived 2014 Stage11 index contains both the literal HTML title 133 and a div with id 331. The signed 2013 TCP-server challenge separately specifies BASE29, a deterministic integer-to-base29 numeral operation. The proposed chain is therefore: original ink events → one 31-of-256 rank → 133-bit integer → one signed-protocol BASE29 conversion.

The strongest rival is postselection. The 13-dot class is one of several visible punctuation classes; the inventory also contains four red 10-dot marks and one red 23-dot mark. The HTML title and div id are metadata, not an explicit instruction to rank this event tape. The 133-bit capacity match is real, but it does not independently select the event classes or establish a receiver.

## Frozen source order and event tape

Inputs:
- Source-derived original ink annotations: resources/liber-primus/lp2-ink-annotations.json.
- The p0 physical-ink override is retained: the red 13-rune span ends at rune 13, and its 13-dot mark follows that rune.
- The p7 same-offset 13-dot events are both retained, in annotation order: black first, then red, at offset 194.
- The signed 2013 BASE29 specification and test vectors: resources/external/2013-tcp-server-signed-source.md and resources/external/2013-tcp-live-test-vectors.json.
- The archived 2014 Stage11 index and provenance: resources/historical/stage11-2014-index.html and resources/historical/stage11-2014-index-manifest.json.

Ordering rule: pages ascending; within a page, a 13-dot event at rune offset i is placed after rune i-1 and before rune i; multiple marks at the same offset preserve the source annotation order. Red rune events are 0; thirteen-dot marks are 1. Four 10-dot marks and the single 23-dot mark are excluded.

The resulting tape has exactly 225 zeroes and 31 ones. Its 31 one-positions, zero-based, are:

~~~text
13,14,31,32,36,37,49,50,51,66,79,80,90,102,103,120,
121,141,142,153,154,163,164,168,169,229,239,240,246,247,255
~~~

The p7 same-offset sequence occupies tape positions 50 and 51 (black then red); its third 13-dot event is position 66. The complete 256-bit tape, with the first event as the most significant bit, is:

~~~text
0000000000000110000000000000000110001100000000000111000000000000001000000000000110000000001000000000001100000000000000001100000000000000000001100000000001100000000110001100000000000000000000000000000000000000000000000000000000000100000000011000001100000001
~~~

Hex encoding of the same tape is:

~~~text
000600018c00700020018020030000c00006006018c000000000000004018301
~~~

## Rank and historical BASE29 conversion

The rank is the zero-based lexicographic rank of the increasing tuple of 31 one-positions (not colexicographic rank and not a one-based rank). The standard recurrence sums the number of combinations skipped before each selected position. Rank/unrank returns the original 31 positions exactly.

- Total codewords: 8,283,675,595,268,374,292,919,471,912,522,442,632,960.
- Capacity: 132.6054667565 bits; therefore 133 bits.
- Observed rank: 6,823,208,894,503,251,143,167,281,798,760,439,560,912.
- 133-bit unsigned representation:

~~~text
1010000001101001101100011101110010000011110100111001000010001000100100011000110000100011111110111100010000110110000010011101011010000
~~~

- Minimal 17-byte big-endian encoding:

~~~text
140d363b907a72111231847f7886c13ad0
~~~

The signed 2013 protocol's historical BASE29 output alphabet is 0123456789ABCDEFGHIJKLMNOPQRS. Its documented control BASE29 3301 → 3QO and the independently archived 1033 → 16I vector are reproduced. Applying that same conversion once to the combinadic rank yields:

~~~text
26NE1ADKDNCNLC1A29566PF7P9G3
~~~

This is a 28-character alphanumeric base29 numeral. It is not a GP29 rune string, a decoded sentence, or a typed file/key format by itself.

## Are 133 and 331 genuinely in the 2014 HTML, and is there a receiver?

Yes, both literal values are present in the preserved 2014 Stage11 index: one occurrence of <title>133</title> and one occurrence of <div id="331">. The 1,640-byte archived HTML is byte-for-byte identical to the raw index at source repository micheloosterhof/cicada-2014 commit 6c3421a4d245596e403c88e037509d162a2afd17, dated 2014-05-11 18:33:43 UTC; the repository manifest records Git blob SHA-1 303db130705f0ef9be2a738f4336d5cfcebde80c. The manifest also states the limit: this is a 2014 participant Git archive, not a PGP-signed HTTP response.

The archived index contains 58 image references and no script, form, anchor, or input element. The separately preserved signed Stage11 handoff points to the onion address and includes 3301, but does not instruct the recipient to submit a 133-bit rank or a BASE29 string. The BASE29 command is part of the signed 2013 participant-built TCP-server protocol; it supplies a numeral conversion, not a 2014 Cicada receiver. The div id 331 is not consumed by any script in the preserved index.

Thus the exact source numbers are historical, but no 2014-accessible receiver for this derived rank/key is identified.

## Decision

This experiment establishes a reproducible 256-event tape, its unique rank under the frozen lexicographic convention, its 17-byte encoding, and its signed-protocol BASE29 numeral. It does **not** establish that the creator selected this event class, rank convention, or cross-round transfer. The title 133 matches the required bit capacity, but the number 331 remains an unused DOM identifier. The BASE29 output is an untyped 28-character numeral with no evidenced consumer.

**Close this hypothesis as a well-defined numerical encoding without a receiver.** Do not try alternate punctuation classes, complements, event orders, rank conventions, byte reversals, 331 arithmetic, AES seeds, prime indices, or downstream ciphers. The result does not change the authoritative solution status: no unknown LP2 plaintext or authentic key is recovered.

**Reproducer:** node sims/lp2_red225_dot13_constant_weight_rank_sft.cjs.
