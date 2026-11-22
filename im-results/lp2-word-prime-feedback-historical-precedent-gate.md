# No authenticated previous-word → next-key precedent in solved Cicada stages

**Decision (14 November 2026; Agent 1, Director task #841): bounded source/solve-path negative.** The reviewed authenticated Cicada sources and solved-stage controls contain no exact precedent in which a preceding printed word's numeric value supplies the next cipher key/state, or an operationally equivalent authenticated handoff. Stop this branch before another numeric sweep. This does not reject word-level navigation or a different source-selected LP2 operation.

## Acceptance test

A precedent must show a causal transition of the form “value of word w selects key/state for word w+1” (or a directly equivalent authenticated handoff). A static book-code coordinate, a whole-title checksum, a word-to-number lookup within one artifact, a prime running key indexed by rune position, or the general instruction that words/numbers provide direction does not meet that test.

## Historical controls

| Source / solved stage | What the source actually establishes | Why it is not the required handoff |
|---|---|---|
| **26 January 2013 signed TCP-server challenge** — [source record](../resources/external/2013-tcp-server-signed-source.md) | Authenticated commands RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT and GOODBYE; worked BASE29 example 3301→3QO and a DH exchange. | No NUMBER, PRIMES or COUNT command; no word-value input, previous-word state, or next-word key schedule. The signed source explicitly distinguishes this protocol from the reconstructed first-onion number service. |
| **Original 2013 761.MP3 ID3 metadata** — [full byte/frame audit](audio761-original-id3-frame-inventory.md) and [2013 GP source map](../results/2013-original-gp29-source-map.md) | The title words THE / INSTAR / EMERGENCE have GP-prime sums 72, 280 and 409, totaling the original basename 761. The Parable clause sums multiply to 1,595,277,641. | These are exact numeric checksums over a title / three-clause text, not a transition in which one word's value keys the next word. The MP3 metadata is an original binary artifact, not a signed cipher instruction. |
| **2013 first-onion PRIMES / NUMBER material** — [recovered PRIMES paste](2013-first-onion-primes-xGY4pbHV-original-source.md) | The PRIMES output is preserved as an unsigned public participant paste. The NUMBER grammar is reconstructed from archived participant material. | No surviving signed service specification or original daemon source selects a prior-word key handoff. The signed TCP challenge does not authenticate this separate service's NUMBER/PRIMES/COUNT grammar. |
| **Legacy `0_wisdom` / “Some Wisdom”** — [source correction](../resources/external/2013-0-wisdom-source.md) and [2013 OS bytes](../resources/cicada2013-wisdom-folly.md) | The file called `2013-0-wisdom` is the 2014 LP1 physical p05 / Stage04 original artifact; its 13 word cells' GP-prime sums reproduce the 5×5 square within that same artifact. The actual 2013 `/tmp/wisdom` and `/tmp/folly` are a separate identical 3,368-byte high-entropy binary. | The legacy filename is not a 2013 timestamp. The page's word-to-number mapping is intra-artifact square reconstruction, not a prior-word→next-key cipher schedule or pre-2014 signed clue. |
| **2014 Onion 5 / Stage04 / Stage05** — [solved chain](../results/2014-onion-chain.md) and [source-exact inverse controls](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md) | Onion 5 uses explicit GEB chapter:line:word:letter coordinates; Stage04 uses the fixed WELCOME PILGRIM TO THE shift key; Stage05 uses a fixed seven-column permutation; the final image uses CIRCUMFERENCE. | These are static book coordinates and fixed keyed/permutation operations, not a previous word's numeric value feeding the next key. |
| **Solved LP2 p56** — [original-source gate](lp2-p56-phi-nonzero-step-original-source-gate.md) | The known p56 inverse uses the totients of successive primes as a per-rune running key, with the specified literal-F skip. | The key clock advances by rune position; it is not selected by the numeric value of a preceding printed word. |
| **6 January 2016 signed words-map clue** — [signed source record](../resources/cicada2016-4gq25.md) | “Its words are the map, their meaning is the road, and their numbers are the direction.” | It motivates word-level numeric navigation, but specifies no arithmetic, target register, previous/current-word dependency, key update, within-word clock, reset, or reversible cipher. It is not a solved-stage precedent for the proposed feedback rule. |

## Existing LP2 work already covers the direct candidates

- [Previous ciphertext-word GP-prime direction](lp2-previous-cipher-wordprime-original-inverse.md): four frozen constant/progressive additive shifts round-trip controls but leave original LP2 nonlinguistic.
- [Previous-ciphertext-word prime nonce](lp2-previous-word-prime-nonce-original-gate.md): the title-derived seed 761 and ciphertext-feedback inverse fail on independent original p0–2 and p54–55 spans.
- [Previous-plaintext-word prime sum in the GP28 step register](lp2-previous-plainword-log28-source-gate.md): four frozen variants fail on the complete original stream despite a matched solved-p57 positive.
- [Within-word prime plaintext feedback](lp2-prime-plaintext-feedback-allmultiplier-gate.md): its all-multiplier necessary-condition test is a separate negative, not historical evidence for word-to-next-word feedback.

These tests are not substitutes for a source selector. Their exact round trips validate the implementations, not the historical mechanism. No new cipher sweep was run for #841 because the task's prerequisite failed.

## Decision

No reviewed authenticated solved Cicada stage supplies the required previous-word→next-key/state operation. The 2013 title/Parable checksums, 2014 *Some Wisdom* square, 2014 book code and fixed cipher steps, solved p56 prime-totient stream, and 2016 words-map sentence are all real but operationally different. The proposed feedback rule therefore remains an unconstrained composition rather than a reconstructed human solve path.

**Close #841 as completed at the missing-authored-operation gate.** Do not commission a successor that merely varies prime functions, signs, moduli, phases, resets or word clocks. Reopen this family only if a first-party historical source is found that selects the previous-word value as the next key/state or provides an equivalent discriminating instruction.
