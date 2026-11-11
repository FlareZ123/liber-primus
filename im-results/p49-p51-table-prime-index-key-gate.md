# p49/p51 flank: p50 table bytes as prime indices

**Status: intermediate negative; no plaintext recovered.**

## Source-constrained hypothesis

The solved p56 page establishes a specific operation: subtract `phi(p_j) = p_j - 1` modulo 29, advancing a prime-index clock and treating the fourth F as a literal null. The p49/p51 flank contains 66 + 92 = 158 runes; the intervening p50 page presents a 256-byte base60 table, and the p49 boundary carries a ten-dot mark. A natural transfer is to treat each decoded table byte `b_i` as a zero-based prime index and form `K_i = (p_{b_i} - 1) mod 29`.

This is a bounded test of the visible table as a prime-index stream, not an unconstrained key search.

## Test

Reproduction: `node sims/p49_p51_table_prime_index_key_gate.cjs`.

- Table: the 256 `byte_rows` values in `resources/liber-primus/base60-grid.json`, row-major.
- Ciphertext: the 158 GP29 runes on pages 49 and 51, with original word boundaries restored from `lp2-transcription.txt`.
- Exact p56 operation and canonical `corpus.translit` encoding; the independent p56 regression must recover its known plaintext before any test runs.
- Direct variants: offsets 0 and 10 (the ten-dot cue), continuous key clock or reset at p51, and no F-null / global fourth-F null. The collision-aware extension additionally tests the p51-local fourth-F null.
- Matched null: 100 permutations of the 256 table bytes, preserving the byte histogram, with the same eight direct configurations.
- Collision-aware extension: the repository keyskip model (`rejectRepeat=0.83`, max 4 local rejects, max 40 total skips), the same offsets and page-reset choices, and the same three fixed F-null masks.

## Results

The p56 control recovers exactly, including F positions `[35, 47, 51, 56, 74]`. The p49/p51 stream has F positions `[3, 33, 69, 123, 126, 157]`; the p51-local F positions are `[3, 57, 60, 91]`.

Direct prime-indexed table key: the best of eight configurations is offset 10, reset at p51, global fourth-F null, with trigram score **−6.135 per rune**. The raw ciphertext scores **−6.652 per rune**. Twenty-three of 100 matched table permutations score at least as well (`p = 24/101 = 0.238`). The modest improvement is not unusual and the resulting text is not English.

Collision-aware transfer: the best of twelve configurations has English-versus-uniform LLR **−104.096** (offset 0, reset at p51, global fourth-F null). A 158-symbol planted control under the same table-derived key and fixed-null/skip rules scores **+60.628** under the true key versus **−102.226** under the reversed key.

## Source-fixed 79-rune packet-reset extension

The original p49/p51 geometry also supports two consecutive 79-rune packets, with the second boundary at compact offset 79 (inside a printed p51 word). This is distinct from a reset at the physical p51 boundary. The same table-prime key was therefore tested with the key clock reset to the same offset at rune 79, for offsets 0 and 10 and no/global-fourth-F null. This extension was not included in the 100-permutation direct-family calibration.

- Direct 79-reset best: **−6.503684 per rune** (offset 10, no F-null); the other three configurations range from −6.514 to −6.668. No readable plaintext.
- Collision-aware 79-reset best: **−121.961 LLR** (offset 0, no F-null); the other configurations are still worse (−128.964 to −149.617).

The 79-packet reset does not improve the table-prime transfer; it is substantially worse under the collision-aware model. This closes the source-fixed 79-reset variant of this key hypothesis.

## Conclusion and limits

**Reject the p50-byte-as-prime-index key for the p49/p51 flank under both the direct p56 operation and the tested collision-aware extension.** The p56 mechanism itself remains independently verified; its transfer to this table is unsupported.

This does not test splitting base60 digits, column-major traversal, unrelated table transforms, or alternative source-selected roles for the table. Do not expand those variants without an independent clue that selects them.
