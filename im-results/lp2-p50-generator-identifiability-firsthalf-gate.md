# LP2 p50 first-half recurrence identifiability gate

**Decision (15 November 2026; Director #1112).** The original 256-cell p49–51 field has a direct, testable generator identifiability boundary. On the exact canonical base60-derived bytes, **every deterministic stationary one-byte-state recurrence fails inside the first 128 cells**, irrespective of its lookup function or initial seed. A completely unrestricted two-byte-state recurrence has **zero source-selected repeated-state constraints on the held-out 128 cells**; it can fit the first half without determining any of the second half. Neither finding recovers LP2 plaintext or a key. A specifically authored 2013/14 generator/seed and an explicit rune receiver are still required for an actionable #1099 inverse.

## Why this tests a causal assumption

The source originals (scans `66.jpg`–`68.jpg`) print **32 rows × 8 columns = 256 two-character tokens** across p49–51. The actual digit alphabet is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`; the conventional one-byte candidate value is `60*digit0+digit1`. The canonical 256 original tokens and their byte interpretation are supplied by [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json), with a pinned original-byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The numeric codec is a plausible recipient interpretation, not a creator-authenticated instruction. Original first-party evidence does not tell a reader which PRNG, seed, key extraction, or GP29 receiver to use; see the [2014 source and transcription audit](cicada2014-sexagesimal-upstream-transcription.md).

A 2014 human might try a compact state recurrence to regenerate the entire printed field and extend it into a running key. Before experimenting with hidden seeds, ask whether a generator's **state size** gives independent predictions at all.

For a deterministic, time-independent single-byte state `x[t+1]=F(x[t])`, equality of two source bytes forces equality of their successors. In original row-major order the first half already contains the explicit contradiction

```text
original zero-based index:   7    8       14    15
original source bytes:     183   92      183   212
                             equal state; different next bytes
```

Across training indices 0–127, 98 distinct one-byte states occur as predecessors; **29** observed successors contradict an earlier occurrence of the same state. This excludes *every* stationary deterministic one-byte-state update from generating the entire printed byte sequence as direct consecutive states, with no need to enumerate update functions.

For an unrestricted stationary two-byte update `x[t+2]=F(x[t],x[t+1])`, the first128 cells contain **126 distinct adjacent-pair predecessor states** and **no contradictory pair**. However **zero** of the 126 candidate predecessor pairs in the withheld second half (positions128–253) occurs in the first half. Therefore an arbitrary pair-state update can interpolate training data but derives **zero original-byte predictions** for the holdout. Higher-order unrestricted lookup states are even less identifiable. The decision is about predictive information, not that two-byte generators are impossible.

## Exact positive controls and forest-graph branch

The [single-file read-only Node22 CJS reproduction](../sims/lp2_p50_markov_generator_identifiability_sft.cjs) verifies the original tokens/bytes, split128/128, contradictions and holdout overlap. As positive controls, a periodic one-byte modular recurrence predicts **127/127** withheld states from the first half, and a two-byte Fibonacci-mod29 recurrence predicts **126/126**. These controls demonstrate that the test can expose known-state recurrence structure and make real withheld predictions.

A separate low-step source-image hypothesis is that the two symmetric trees painted around the grid symbolize the two cycles in the direct byte-address graph `nextIndex=byte[index]`, with their attraction basins encoding one bit per printed cell. The actual second component has only **four** source indices **9,158,227,249**; **252/256** nodes drain to the eleven-cycle through index0. The resulting 32 rows ×8 basin bits have only **four set bits**, so this natural two-tree basin bit readout is no plausible direct 32-byte ASCII payload or balanced 256-bit key. This is an exact conditional observation, not proof that the tree illustration instructs the functional graph; the pointer hypothesis and its already-failed additive ring key are fully documented in the [existing pointer-graph study](lp2-p50-direct-byte-pointer-firstcell-cycle-gate.md).

## Research consequence

The original field is **consistent with random-looking cryptographic output**, but a visual impression of randomness, repeated values, or a graph with two cycles does not establish that the table is encrypted. Prior projects already exhaust direct bare xorshift32, low-byte LCG32, linear-state/GF29 recurrences, and various source-independent PRNG guesses: [state inversion](grid-truncated-xorshift32-original-state-gate.md), [full-word audit](grid-fullword-prng-exact.md). Those tests should not be recycled with newly tuned seeds.

**Fork:** A future generator proposal must produce a first-party original-source opcode/seed or a genuinely independent predicted value. Freeze the algorithm on the first128 canonical bytes; require byte-for-byte predictions for remaining128, a planted positive, and a defined invertible GP29 consumer with an identified ciphertext receiver. Without those source constraints, unrestricted two-byte recurrence lookup is underdetermined and arbitrary hidden-seed sweeps cannot deliver an author-grounded key. Closing Director #1112 at this missing-instruction gate preserves the open #1099 caption/plaintext problem rather than extending an unfounded generator search.

*Scope:* This excludes stationary direct consecutive **byte-state** output when the state consists solely of the previously emitted byte. Hidden multibyte state, a nonlinear output function, skipped updates, block cryptography, a table of transitions rather than outputs, and an external instruction/key remain viable. No authentic unknown-page plaintext, cipher or destination has been recovered.
