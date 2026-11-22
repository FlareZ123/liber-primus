# Page-15 Fibonacci index → 256-byte table under lossless repair: original-input key gate

**13 November 2026, Agent 2. Classification: bounded negative for a new, historically motivated *key derivation*, not a decryption.** No unknown LP2 plaintext, authentic key, or continuation is recovered.

## Source-constrained hypothesis

The original LP2 physical p15 4×4 diagram exactly arises from distances between 3301 and primes at **Fibonacci-derived ordinals**. Separately, physical pp49–51 print a **32×8, 256-token numerical table** with a conventional base60-to-byte interpretation. Both artefacts are creator-visible. A reader could generate the ordinary Fibonacci sequence from its prescribed first values 0,1, reduce each index modulo the table size **256**, and use the resulting indices to read a GP29 cipher-key stream from the original 256 printed cells. The Fibonacci sequence modulo256 has a 384-position period.

A key obstacle to ordinary direct Vigenère testing is LP2's pronounced near-absence of repeated adjacent ciphertext symbols. To give the candidate a fairer, more realistic inverse, this test adopts the *empirical* **0.81 repeat rejection probability** used in the project's existing repair-model literature. It explicitly sums over hidden rejected pad draws rather than assuming an undeviating key pointer. The 0.81 parameter is a fitted phenomenological model, **not an instruction found in Liber Primus**.

This combination has a specific proposed human solve path: original p15 Fibonacci rule → original 256-byte table → modulo256 index sequence → additive GP29 stream → lossless repeat-repair decoding. Its most vulnerable assumptions are that p15 should point at the much later table, that the printed two-character tokens are bytes, and that repeat suppression consumes pad positions. The source does **not** authenticate those steps.

## Frozen experiment

The output target is the **1,744 rune positions of physical pp16–22**, the original source chapter immediately following p15. The clock resets at each of its seven printed page boundaries; the first Fibonacci index at each reset is zero. Runic output uses the repository's canonical 29-symbol GP sequence. We grant both natural table flattenings (**row-major and column-major**), both natural byte-to-GP reductions (**byte modulo29 and floor(29·byte/256)**), and both Vigenère signs, for eight complete source-fixed candidates.

The forward likelihood uses a Shakespeare-trained GP29 unigram model. It sums all hidden key-pointer drifts up to 110 rejected draws per page and up to five consecutive local rejects, with acceptance probability 1 except when a tentative cipher rune repeats the previous emitted rune; such repeats are accepted with probability 0.19. The comparison baseline is a page-local *keyless* uniform GP29 stream under exactly the same repeat-repair probability. A positive log-likelihood difference would favor the source-selected stream over this anti-repeat-aware null.

To establish power before interpreting original scores, the script first encrypts **1,744 held-out native-GP Gibran runes**, matching original page lengths, with the exact predeclared row-major / modulo29 / minus-sign stream and the same repeat-repair algorithm. No original LP2 ciphertext enters this plant.

| Source key | Cipher sign | Original log-likelihood gain versus anti-repeat null | Gibran planted-control gain |
|---|---:|---:|---:|
| Column / mod29 | − | −1137.165 | −1194.060 |
| Column / mod29 | + | −1152.364 | −1287.646 |
| Row / mod29 | − | −1193.400 | **+628.141** |
| Column / scaled | − | −1219.178 | −1188.075 |
| Row / mod29 | + | −1246.765 | −1321.607 |
| Column / scaled | + | −1269.883 | −1272.607 |
| Row / scaled | − | −1305.317 | −1231.547 |
| Row / scaled | + | −1319.239 | −1259.067 |

All original models are worse than the anti-repeat null by **more than 1,100 nats**; the uniquely planted correct key is better by **628.14 nats** and every alternative key performs poorly on that same plant. The test is demonstrably capable of recognizing its source-key generator under the declared ordinary-native-GP target. It cannot tell whether the original ciphertext encodes a different register, uses another repeat-emitter, or selects an entirely different key.

**Exact reproducible SFT:** [`sims/lp2_p15_fib256_table_softreject_sft.cjs`](../sims/lp2_p15_fib256_table_softreject_sft.cjs), CommonJS / Node22. Its full implementation was evaluated with its actual pinned repository inputs in V8 and **all assertions passed**, including exact source size, Fibonacci period, positive-control discrimination, and the eight original negative likelihood gains.

## Decision

Retire **this one direct Fibonacci-mod256 table-lookup keystream**, in its eight declared printable layouts, for page-local repaired GP29 additive decoding immediately after the Fibonacci square. This is a more targeted original-input experiment than another guessed KDF: it tests the unmodified source table and the mathematical index rule visible on another original page, with a directly measured ability to recognize a known correct key.

The following remain open: a creator-selected cross-artifact direction, a different source-derived table traversal, a key generator that is not a Fibonacci-indexed lookup, and non-GP plaintext or independently transformed runic text. None is licensed merely by failure of this bounded model. Do not expand offsets, reset patterns, ciphers or lookup permutations without a new original-source clue.
