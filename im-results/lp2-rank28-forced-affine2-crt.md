# Exact rank28 forced affine two-state inverse (p16–22)

## Decision

The six-parameter driven recurrence below has **no key compatible with the first ten original singleton groups** in the specified native A/I/O grammar. Both independently keyed native donor controls recover the exact secret key, escape, clock and all 944 frozen runes. This retires this receiver, not arbitrary feedback, non-native registers, or decoy segmentation. No new LP2 plaintext or authentic key.

## Mechanism and motivation

The p15 graphic provides a Fibonacci/prime relationship; LP2 has rare exact adjacent ciphertext equalities. Earlier fixed Fibonacci GP-prime feedback and autonomous affine clocks were tested separately. Here the input to the two-state recurrence is the actual ciphertext's nonrepeat rank, and all six scalars are unknown. This is a hypothesis, not an author-selected receiver.

For a continuous p16–22 tape, copy the initial rune as a clear IV. For each subsequent ciphertext difference modulo 29, difference zero encodes a fixed escape rune e. Otherwise let R be difference minus one, or the discrete logarithm to base 15 in GF(29). The native plaintext is the inverse of the rank excluding e, at (R−K[t]) mod 28. The state follows

    K[t+2] = a K[t+1] + b K[t] + f R[t] + d mod 28.

All of a,b,K[0],K[1],f,d are in 0..27. At an equality either hold the clock or consume with R=0. All 29 possible escape runes are considered. The encoder reconstructs the same difference from the native rank plus K[t], and hence reconstructs the entire ciphertext. On the hold clock this also covers the corresponding affine recurrence driven by the native nonescape rank P[t]=R[t]−K[t], via replacing b with b−f; this equivalence is not asserted for consuming escapes.

## Exact inversion

The first 800 runes (p16–18) contain ten printed singleton groups, with positions 21,119,244,380,386,414,455,471,596,712 (zero based). Under the native grammar each is A,I,O. For fixed a,b and known ciphertext ranks, K[t] is an affine-linear form in K[0],K[1],f,d. Enumerate all projected six-parameter keys modulo 7 and modulo 4 separately, imposing projected masks for the ten singleton groups; CRT joins every surviving pair and tests full modulo-28 masks. This is exhaustive over 28^6 keys for each escape, clock and rank transport, without enumerating all 28^6 per variant. Fit only on those first ten sites. The remaining 944 runes and seven singleton locations are held out. Any fit candidate is ranked by the trigram score trained on independent Shakespeare, with frozen continuation; no holdout fitting. The original has no fit candidate at all.

| Original clock / rank | mod7 solutions | CRT joins | fit keys |
| --- | ---: | ---: | ---: |
| consume / cyclic | 0 | 0 | 0 |
| consume / log15 | 20 | 13 | 0 |
| hold / cyclic | 0 | 0 | 0 |
| hold / log15 | 0 | 0 | 0 |

## Recovery controls

Independent Gibran and Emerson GP-normalized windows of 1,744 runes, different planted keys and rank/clock choices, are used; the first eligible window on each predeclared 100-rune offset grid is selected for at least ten fit singletons and one held singleton. Controls use their own natural singleton locations. The native donor spelling is conditional, not authentic unknown text. Neither donor trains the language model.

| Control | fit keys | best key exact | frozen runes | held log score |
| --- | ---: | --- | ---: | ---: |
| Gibran hold/cyclic | 13 | yes | 944/944 | −2.334431 |
| Emerson consume/log15 | 2,394 | yes | 944/944 | −2.429364 |

Both selected keys replay every ciphertext glyph and both hidden plaintexts are recovered. Multiple candidates may satisfy even the held singleton grammar; the language score selects the true keys in these two plants. This does not establish an LP2 cipher.

## Reproduction and limitations

- [CommonJS SFT](../sims/lp2_rank28_forced_affine2_crt_sft.cjs), commit 713a3f78ac0a7ae30e086b330d875278c86aedee.
- [Raw exact results](lp2-rank28-forced-affine2-crt-output.json), commit 6d9fc10c770e2bae47cc9aec3c44c8b4f412d75f.
- Source: canonical LP2 corpus and transcription, three existing donor files. The same core was executed directly in the available V8 runtime; standalone Windows Node wrapper not separately executed.
- Prior distinct scope: [autonomous order-four recurrence](lp2-rank28-affine4-crt-singletons.md) and [p15 ordinal state recovery](lp2-p15-rank28-ordinal-state-recovery.md).

No new source evidence selects this mechanism; avoid extending its order merely because this test was inexpensive. A future recurrence needs independently selected state or a discriminating key recovery route.
