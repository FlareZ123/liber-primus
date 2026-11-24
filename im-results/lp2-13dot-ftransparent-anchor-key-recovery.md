# Original thirteen-dot intervals: direct 13-phase key recovery from all long words

**24 November 2026, Agent13.** Six original 13–14-rune anchors yield no complete inverse of their containing thirteen-dot interval for the historically motivated, arbitrary 13-phase additive GP29 key with authentic plaintext-F bypass. The remaining terminal anchor yields 45 mechanically valid key/state candidates, all nonprose under an exact held-out word-dictionary score. None can invert any of eight independent long original intervals. No unknown plaintext or authentic key has been recovered.

## Decoder and actual recovery algorithm

The original LP2 manuscript repeatedly uses physical thirteen-dot punctuation. A solver who interprets the dot count as a 13-step key clock and transfers the authentic solved-p56 cipher is led to this precise conditional mechanism:

- Within each nonempty source interval between thirteen-dot marks, a non-F plaintext rune P emits C=(P+K[s]) mod29, advances s modulo13, and uses an entirely arbitrary secret 13-value GP29 key K.
- Plaintext F=0 emits C=0 without advancing; observed ciphertext F may be literal or encrypted non-F.
- Grant a different unknown key and any initial phase independently in each source interval. No specific relation between dot count and key length is authenticated; this is a bounded attack, not an interpretation established by the source.

All original 12,956 runes and 2,896 complete printed words are checked against the canonical transcription, joining line/page carries. There are 28 original thirteen-dot occurrences, giving 26 nonempty intervals after co-located marks are collapsed to their physical rune offsets. Use **all seven complete original words of length at least13**, fixed by the source segmentation rather than by cipher score. A candidate plaintext anchor of length 13 or 14 forces key entries by K[s]=C−P mod29 for each non-F symbol; plaintext F is possible only where C=0. Choose phase0 at the anchor, which is without loss of generality because key rotations are arbitrary. Every anchor has enough non-F positions that there is at most one unspecified offset; enumerate all 29 values when necessary. Repeated phase entries must agree exactly.

Combine the existing TextBlob GP lexicon with the pinned larger dwyl 13–14-rune lexicon, using the established solved-native GP spelling normalization. The union contains 17,566 thirteen-rune and 11,342 fourteen-rune types. Deduplicate by complete key and post-anchor phase. For each inferred key, compute exact backwards reachability of the entire original prefix from anchor phase0 and exact forwards reachability of the suffix from its known post-anchor phase. A compact 13-bit automaton merges only future-equivalent phase states and includes both lawful F branches. No bigram pruning or heuristic beam is used.

For surviving keys, exact word-level dynamic programming maximizes the number of held-out complete printed words in the separate smaller TextBlob GP lexicon, excluding the fitted anchor. All selected candidate plaintexts forward re-encrypt byte-for-byte in the GP index representation. Eight other original marker intervals of at least 500 runes are also tested with independent unknown initial phases.

## All original long anchors

Offsets are zero-based over the continuous unknown rune tape; intervals are half-open. Counts represent distinct (key, post-anchor phase) candidates.

| Physical page | Anchor word index | Length | Interval | Inferred keys | Complete interval |
|---:|---:|---:|---|---:|---:|
| 11 | 631 | 13 | 1874–3603 | 16,966 | 0 |
| 13 | 754 | 14 | 1874–3603 | 501 | 0 |
| 16 | 833 | 13 | 3623–5506 | 15,690 | 0 |
| 25 | 1353 | 14 | 5522–6527 | 837 | 0 |
| 43 | 2341 | 14 | 9640–12648 | 388 | 0 |
| 52 | 2752 | 13 | 9640–12648 | 15,690 | 0 |
| 55 | 2886 | 13 | 12657–12956 | 20,852 | 45 |

The terminal interval has 299 original runes after the physical red heading. Its 45 mechanical candidates achieve at most **9/63 held-out dictionary words**, maximum GP29 IoC **0.03741779**, and **0/8** independent long-interval successes for every candidate key. The lexically highest scoring candidate uses the fitted anchor BOROGLYCERINE, key [0,25,25,11,4,28,4,0,24,4,11,11,23], and opens `DANNGGOPHOEAAEAELDHJHSUXTHTHGWDEALMEATEOEAFSMOEJGSBXGCEAIAWOENUEIAAEREBFAIWMNGBIAOXNTHNPUTIPDPIADWTH`. This is a mechanical inverse, not continuous native plaintext or an authentic key. No candidate predicts a second original interval.

## Controls and decision

Authentic solved p56 reproduces all 85 original ciphertext runes under the genuine prime-totient key and F rule. The independent 729-rune native p57-derived planted control uses an unknown 13-phase key, unknown initial phase, and actual one-F thirteen-rune anchor CIRCUMFERENCE. Exactly one phase is unassigned by the anchor, and all 29 values are explicitly enumerated. The true rotated key is included and passes the full prefix and suffix inverse. This establishes correct key inclusion and exact reachability, not unique plaintext from a single anchor.

The negative is lexicon-conditional: it excludes this 13-step additive mechanism in intervals with a true long anchor represented in the tested GP lexicon. It does not exclude another period, a longer or nonperiodic key, non-GP or rare-word plaintext, changed printed boundaries, a different F convention, or a nonadditive transformation. A chapter with no eligible long word is outside this test. Do not expand the search to arbitrary key-clock variants without an independently source-selected operation. The important result is a direct original-input secret-key recovery method with an independent context test, not a claim that every cipher associated with thirteen-dot punctuation is impossible.

[Read-only CommonJS reproducer](../sims/lp2_13dot_ftransparent_anchor_key_recovery_sft.cjs), executed against all five fetched repository inputs in the connected JavaScript runtime. Run from repository root with Node.js. No CI workflow was added.
