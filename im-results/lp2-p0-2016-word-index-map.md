# p0 split-packet key points to the 2016 signed word map

## Finding

The existing p0 split-READOUT lookup has a conditional cross-source interpretation. It is a local crib-selection observation, not a source-selected inverse. The two-rune ciphertext word at p0 offsets 235–236 is:

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

Across all 284 eligible two-rune groups (both ciphertext symbols in 1–23), 20 satisfy the same two-position source-word-length equality; only two of those decrypt to THE, at p0 and p38. The other length matches do not produce source-vocabulary plaintext. This is a narrow local result, not a general page decoder. The p38 occurrence repeats the same ciphertext pair and deterministic lookup result; it is not independent key or plaintext evidence. Five observed hits reduce to two input types; the two length matches reduce to one input type. A third possible input type [8,17] would also output THE but does not occur in the reported census.

## Exact domain and reversibility gate

For `c=1..23`, the fixed lookup `f(c)=(c−packet[c−1]) mod29` has only 14 distinct outputs. Its six nonsingleton fibers are `11←[1,16,20]`, `18←[5,13,17]`, `23←[6,15]`, `25←[10,11]`, `4←[12,22]`, `21←[18,21,23]`. Ciphertext 0 and 24–28 have no assigned lookup. A plaintext-only deterministic sender therefore cannot exactly reconstruct this entire eligible ciphertext domain; a state/exception channel or restricted domain would be necessary. This does not exclude a randomized sender with independently recoverable state or a deliberately partial navigation rule. Neither is specified here. The [original receiver visual gate](lp2-p0-readout-receiver-visible-clue-audit.md) also finds no source-visible selector for the H/READOUT operation. THE remains a conditional output, not established plaintext.

## Why the index origin matters

Separate the four indexing conventions explicitly:

- **Full signed cleartext, one-based, including “Hello”:** [6,16] → EPIPHANY / WORDS. Their GP29 lengths [8,5] match both the p0 red-heading word lengths and the ciphertext pair.
- **One-based 29-word body excluding “Hello”, or zero-based full message:** [6,16] → SEEKS / ARE. Their GP29 lengths [5,3] do not match [8,5].
- **Zero-based 29-word body excluding “Hello”:** [6,16] → THE / THE, GP29 lengths [2,2]. This is the previously defined body-remainder map. With GP29 values 0–28, the proposed one-based full-message rule can address only the first 28 words (zero is invalid), not the entire 43-word register.

The earlier [GP0/p50 pointer circuit](lp2-2016-gp0-table-word-pointer-circuit.md) maps EMPTY/EPIPHANY to offsets 236/237 and explicitly uses EPIPHANY's zero-based full-message index 5 alongside GP0 sum 121. That conditional navigation result does not select one-based index 6 for a different lookup: it locates the same input boundary used here and supplies no independently predicted plaintext or addressing conversion. The prior [body-remainder convention](lp2-p50-functional-graph-2016-wordmap.md) uses the 29-word body after Hello with r→human ordinal r+1. One-based packet addressing does not by itself imply one-based addressing of a separate source register.

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

Thus WORDS is the unique member of this eight-candidate family whose residual selects exactly the specified spine. The first eight residual values are identical for every candidate because EPIPHANY is fixed: their distinct positions supply seven of nine spine entries. Only positions 14 and 23 need to be added by the five-rune continuation without introducing other positions. The spine is an interpretive subsequence of the known signed text, not an independently pre-registered target; do not treat the eight trials or seven shared positions as independent confirmations. As a secondary check, the existing p0 DEVOTED crib has residual key **[21,4,15,19,5,12,10]**, whose distinct source-ordered positions give **LIES EMPTY LIBER IS ITS MAP MEANING**.

These projections are **not independent decryptions**: the residual keys depend on the proposed plaintexts, and sorting/deduplicating selected positions is an interpretive readout. In particular, the exact WORDS spine fit does not override the marker-state gate below. Treat it as evidence that the 2016 word map is involved, not as title plaintext.

## Marker-state adjudication: retain EPIPHANY SEEKS

The 13-rune p0 title has an existing source-selected 4|5|4 marker-state gate, documented in [the independent state-key analysis](lp2-p0-red13-state-key-the-way.md). Apply the same interleaved outside-in H transform to each candidate's additive residual key, then sum the three physical columns modulo 29:

| Candidate residual | H-transformed key | 4|5|4 column sums | Gate |
| --- | --- | --- | --- |
| EPIPHANY SEEKS: [26,24,8,19,27,24,18,3,0,8,0,16,19] | [7,16,8,11,8,8,11,27,27,27,21,27,18] | [13,23,6] | pass |
| EPIPHANY WORDS: [26,24,8,19,27,24,18,3,8,23,14,27,19] | [7,16,26,22,23,22,25,13,19,6,21,27,18] | [13,15,14] | fail |

The marker-state target [13,23,6] is fixed by the original p0 marker/column analysis, not chosen for this comparison. This is the decisive countertest: **EPIPHANY SEEKS passes; EPIPHANY WORDS fails**. The two zeroes in the SEEKS residual are valid GP29/state values; they are not invalid word pointers because the title residual is not the same object as the split-packet key [6,16]. Do not apply the one-based book-index interpretation to the title residual.

The [6,16] → EPIPHANY / WORDS link remains a conditional arithmetic cross-reference. The 8+5 match is preserved, but the boundary does not independently select the indexing origin. The marker-state comparison favors SEEKS within that specific proposed gate; neither title is authenticated.

## Reproduction and next decisive test

Run: **node sims/lp2_p0_2016_word_index_map_sft.cjs**.

The script reads the original corpus, transcription and signed 2016 source; asserts the fixed packet, all five THE hits, the 284/20/2 length-control counts, and the exact candidate projections.

The next admissible test requires an independently selected complete operation (or explicitly partial navigation grammar), with a frozen index register and a new original-cipher prediction not using [8,5], the already selected p0 boundary, or a candidate-derived residual. Until then retain both cribs as conditional, and do not expand the lookup, source-word searches or title candidates.
