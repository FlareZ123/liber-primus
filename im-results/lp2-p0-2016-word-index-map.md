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

This is a source-index cross-reference, not yet a title decryption. It suggests EPIPHANY WORDS as a word-map phrase, but the candidate's additive residual fails the already established p0 marker-state gate: its 4|5|4 column sums are [13,15,14], whereas the required state is [13,23,6]. The existing EPIPHANY SEEKS residual passes that gate. Therefore EPIPHANY SEEKS remains the stronger title candidate; the role of EPIPHANY WORDS as a key/map instruction remains unresolved.

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

The first convention is additionally anchored by the independently selected EMPTY/EPIPHANY boundary: full-message word 6 is EPIPHANY, the same source word that the existing GP0/p50 address route maps to p0 offset 237. Thus the first coordinate of K lands on the independently selected boundary word. The split packet's already-established one-based lookup and the exact 8+5 length match support the same origin. The earlier DH23 mapping of H-transform outputs used zero-based source positions; that is a separate operation. This one-based interpretation applies to the split-packet key [6,16] only; it must not be transferred automatically to the 13-rune title residual.

## Candidate-key self-index check

If the p0 title is **EPIPHANY WORDS**, its additive residual against the original 13-rune heading is:

**Ktitle = [26,24,8,19,27,24,18,3,8,23,14,27,19].**

Treating these values as one-based positions in the full signed message, then reading the distinct selected positions in source order, gives:

**PATH THE WAY THE MAP THE ROAD THEIR NUMBERS.**

This is closely aligned with the signed message's own path/way/map/road/numbers instruction.

The candidate comparison is bounded by the signed source rather than open-ended English: EPIPHANY is the only 8-rune source word, and the source contains exactly eight 5-rune words. For each possible 8+5 title, compute the residual key and compare its distinct one-based source positions with the source-defined instruction spine at positions [3,8,14,18,19,23,24,26,27] (PATH / THE / WAY / THE / MAP / THE / ROAD / THEIR / NUMBERS):

| Second word | Zeroes in residual | Unique valid positions | Spine overlap | Exact spine set |
| --- | ---: | ---: | ---: | --- |
| HELLO | 0 | 10 | 7/9 | no |
| EMPTY | 0 | 9 | 7/9 | no |
| SEEKS | 2 | 8 | 7/9 | no |
| LIBER | 0 | 9 | 7/9 | no |
| **WORDS** | **0** | **9** | **9/9** | **yes** |
| MEANING | 0 | 11 | 7/9 | no |
| FOUND | 0 | 12 | 8/9 | no |
| FALSE | 0 | 11 | 7/9 | no |

Thus WORDS is the unique member of this eight-candidate family whose residual selects exactly the source-defined spine. As a secondary check, the existing p0 DEVOTED crib has residual key **[21,4,15,19,5,12,10]**, whose distinct source-ordered positions give **LIES EMPTY LIBER IS ITS MAP MEANING**.

These projections are **not independent decryptions**: the residual keys depend on the proposed plaintexts, and sorting/deduplicating selected positions is an interpretive readout. In particular, the exact WORDS spine fit does not override the marker-state gate below. Treat it as evidence that the 2016 word map is involved, not as title plaintext.

## Marker-state adjudication: retain EPIPHANY SEEKS

The 13-rune p0 title has an existing source-selected 4|5|4 marker-state gate, documented in [the independent state-key analysis](lp2-p0-red13-state-key-the-way.md). Apply the same interleaved outside-in H transform to each candidate's additive residual key, then sum the three physical columns modulo 29:

| Candidate residual | H-transformed key | 4|5|4 column sums | Gate |
| --- | --- | --- | --- |
| EPIPHANY SEEKS: [26,24,8,19,27,24,18,3,0,8,0,16,19] | [7,16,8,11,8,8,11,27,27,27,21,27,18] | [13,23,6] | pass |
| EPIPHANY WORDS: [26,24,8,19,27,24,18,3,8,23,14,27,19] | [7,16,26,22,23,22,25,13,19,6,21,27,18] | [13,15,14] | fail |

The marker-state target [13,23,6] is fixed by the original p0 marker/column analysis, not chosen for this comparison. This is the decisive countertest: **EPIPHANY SEEKS passes; EPIPHANY WORDS fails**. The two zeroes in the SEEKS residual are valid GP29/state values; they are not invalid word pointers because the title residual is not the same object as the split-packet key [6,16]. Do not apply the one-based book-index interpretation to the title residual.

The new [6,16] → EPIPHANY / WORDS link remains a real cross-source clue, supported by the 8+5 length match and the independent EPIPHANY boundary anchor. It may be telling the solver how to use the 2016 word map rather than giving the title plaintext. The exact role remains unresolved; preserve EPIPHANY SEEKS as the stronger title candidate.

## Reproduction and next decisive test

Run: **node sims/lp2_p0_2016_word_index_map_sft.cjs**.

The script reads the original corpus, transcription and signed 2016 source; asserts the fixed packet, all five THE hits, the 284/20/2 length-control counts, and the exact candidate projections.

The next useful test is to determine whether the [6,16] → EPIPHANY / WORDS cross-reference selects a concrete operation on the 2016 message or another p0 receiver. Preserve the established EPIPHANY SEEKS title candidate unless a new source-selected test overturns its marker-state pass. Seek one independent second plaintext receiver for the word-index mechanism; do not widen this into an unconstrained search over origins, offsets or candidate phrases.
