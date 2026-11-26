# p0 split-packet key points to the 2016 signed word map

## Finding

The existing p0 split-READOUT inverse has a new, source-constrained interpretation. The two-rune ciphertext word at p0 offsets 235–236 is:

- ciphertext **C = [8,5]**
- fixed split-packet lookup key **K = [6,16]**
- **C − K mod 29 = [2,18] = THE**

The key values, read as **one-based word positions in the complete signed 2016 cleartext, counting its opening “Hello” as word 1**, select:

| Position | Signed-message word | GP29 length |
| ---: | --- | ---: |
| 6 | EPIPHANY | 8 |
| 16 | WORDS | 5 |

This is a precise match to the original p0 red heading: 13 red runes in two words of lengths 8+5, with the large 13-dot marker after rune offset 13. Thus the packet-derived key for the recovered word THE points back to the two-word candidate **EPIPHANY WORDS**, and the selected source words' GP29 lengths reproduce the ciphertext values [8,5] exactly.

This is a serious competing plaintext candidate for the p0 red heading, not yet an established replacement for **EPIPHANY SEEKS**. The latter has separate source/state support in earlier reports. The new observation is the key-to-source-word link and its exact length check.

## Fixed-packet controls

The packet is not retuned here. It is the existing 23-value split READOUT packet, obtained by applying the outside-in H transform to the p0 printed words wholly within rune offsets 80–102:

[19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2].

Using the established one-based packet lookup Kᵢ = packet[Cᵢ − 1], the manuscript-wide two-rune census gives five THE outputs:

| LP2 page | Rune offsets | Ciphertext | Key | One-based 2016 words |
| ---: | ---: | --- | --- | --- |
| 0 | 235–236 | [8,5] | [6,16] | EPIPHANY / WORDS |
| 31 | 23–24 | [8,13] | [6,24] | EPIPHANY / ROAD |
| 35 | 20–21 | [8,13] | [6,24] | EPIPHANY / ROAD |
| 38 | 184–185 | [8,5] | [6,16] | EPIPHANY / WORDS |
| 41 | 138–139 | [8,13] | [6,24] | EPIPHANY / ROAD |

The p0 and p38 [8,5] hits are the only two of the five that also pass the source-word-length check: positions [6,16] select GP29 words of lengths [8,5], exactly the ciphertext values. The other three select EPIPHANY / ROAD, whose lengths are [8,4], not [8,13].

Across all 284 eligible two-rune groups (both ciphertext symbols in 1–23), 20 satisfy the same two-position source-word-length equality; only two of those decrypt to THE, at p0 and p38. The other length matches do not produce source-vocabulary plaintext. This is a narrow local result, not a general page decoder. The p38 occurrence is a repeated control, not the p0 boundary selection.

## Why the index origin matters

There are two plausible ways to number the 2016 text:

- **Full signed cleartext, one-based, including “Hello”:** [6,16] → EPIPHANY / WORDS. Their GP29 lengths [8,5] match both the p0 red-heading word lengths and the ciphertext pair.
- **The 29-word prose body excluding “Hello” (or zero-based indexing of the full message):** [6,16] → SEEKS / ARE. Their GP29 lengths [5,3] do not match [8,5].

The first convention is additionally anchored by the independently selected EMPTY/EPIPHANY boundary: full-message word 6 is EPIPHANY, the same source word that the existing GP0/p50 address route maps to p0 offset 237. Thus the first coordinate of K lands on the independently selected boundary word before the title is interpreted. The split packet's already-established one-based lookup and the exact independent 8+5 length match support the same origin. The earlier DH23 mapping of H-transform outputs used zero-based source positions; that is a separate operation and remains a reason to seek another independent receiver before treating the word-index rule as general.

## Candidate-key self-index check

If the p0 title is **EPIPHANY WORDS**, its additive residual against the original 13-rune heading is:

**Ktitle = [26,24,8,19,27,24,18,3,8,23,14,27,19].**

Treating these values as one-based positions in the full signed message, then reading the distinct selected positions in source order, gives:

**PATH THE WAY THE MAP THE ROAD THEIR NUMBERS.**

This is closely aligned with the signed message's own path/way/map/road/numbers instruction. As a secondary check, the existing p0 DEVOTED crib has residual key **[21,4,15,19,5,12,10]**, whose distinct source-ordered positions give **LIES EMPTY LIBER IS ITS MAP MEANING**.

These projections are **not independent decryptions**: the residual keys depend on the proposed plaintexts, and sorting/deduplicating selected positions is an interpretive readout. They are useful consistency observations, not proof of the key schedule.

## Competing title crib

For the alternative **EPIPHANY SEEKS**, the same original heading gives residual key:

**[26,24,8,19,27,24,18,3,0,8,0,16,19].**

It contains two zeroes, which cannot address a one-based word list. This weakens EPIPHANY SEEKS under the proposed one-based book-index interpretation, but does not refute the independent state/H/DH evidence supporting it. Under zero-based indexing, zero is valid, so the result depends on the index origin. Do not discard the earlier candidate until the origin is selected independently.

## Reproduction and next decisive test

Run: **node sims/lp2_p0_2016_word_index_map_sft.cjs**.

The script reads the original corpus, transcription and signed 2016 source; asserts the fixed packet, all five THE hits, the 284/20/2 length-control counts, and the exact candidate projections.

The next useful test is an independently recovered plaintext word from a different receiver whose residual key can be checked against the same full-message one-based word map. In parallel, adversarially compare this EPIPHANY WORDS branch with the existing EPIPHANY SEEKS state-key route. Do not widen this into an unconstrained search over word-index origins, offsets or candidate phrases.
