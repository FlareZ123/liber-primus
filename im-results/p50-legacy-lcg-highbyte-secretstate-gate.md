# LP2 numeric table: complete hidden-state inversion of legacy 32-bit LCG upper-byte streams

**Agent 17, 14 November 2026. Classification: bounded, source-original cryptanalytic exclusion.** The table yields no state, unknown-page plaintext, key, or Cicada destination under these fully specified generator contracts.

## Causal path and competing interpretation

The original LP2 pp49–51 print a 32-row by eight-column numerical table. Interpreting the 256 two-character tokens in the repository's explicitly conditional base-60 alphabet produces 256 bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. A natural source-first route to an entire LP2 running key would be to recover a deterministic, hidden-state pseudorandom generator from those already printed outputs, then predict its **unprinted continuation** and decode original ciphertext. The rival is a table of encrypted or independently generated random bytes. The page itself does not select a particular PRNG, serialization or use as a running key.

[Prior state tests](grid-truncated-xorshift32-original-state-gate.md) already exclude Marsaglia xorshift32 and the **low byte** of arbitrary affine LCG32 output, plus small GF(2)-linear-state hypotheses. This experiment addresses an independently distinct and previously identified gap: **middle/high byte lanes of carry-bearing 32-bit LCGs, with completely unknown original seed**. An upper byte depends on hidden lower-state carries; failure of the low-byte test does not cover it.

## Exhaustive original-cipher test

The three historically familiar, entirely specified 32-bit recurrences are

`s[n+1] = (a*s[n]+c) mod 2^32`

| Model | a | c |
| --- | ---: | ---: |
| MSVC `rand()` internal state | 214013 | 2531011 |
| ANSI-style C LCG | 1103515245 | 12345 |
| Numerical Recipes LCG | 1664525 | 1013904223 |

Take each original grid in three printed-geometry-preserving traversals: row-major, column-major, and alternating left/right rows. Read the next printed byte as bits 16–23, bits 23–30, or bits 24–31 of one successive post-update 32-bit state. These include the high byte of the usual 15-bit MSVC `rand` result, its low byte, and the high byte of a full 32-bit state. They do not imply that the historical creators actually used MSVC, ANSI C, or Numerical Recipes.

For **each of 27 models** (three recurrences × three traversals × three byte lanes), the very first printed byte fixes exactly eight bits of the first post-update state. Enumerate *all* `2^24 = 16,777,216` possible assignments of the other bits. Derive the next state by the model's native integer multiplication and addition; require the exact next **15 original bytes** to agree. Recover the prior seed with the modular inverse of the odd multiplier for any survivor, and replay all **256** bytes. Thus the test encompasses 452,984,832 independently enumerated original-model state candidates, without key-word guessing, ciphertext training or an English-language score.

**Actual original result: zero survivors of the first 16 byte observations in all 27 exhaustive models.** No generator state passes, so no candidate continuation exists in this precise family. This is a mathematical all-state exclusion for the declared output clocks and byte lanes, not an improbability estimate inferred from a small random sample.

## Positive state-recovery control

Independently generate 256 artificial visible bytes from the MSVC recurrence using hidden seed `0x3301` and lane bits 23–30. The **same exhaustive decoder** recovers exactly two 32-bit predecessor seeds, `0x00003301` and `0x80003301`. Both produce **256/256** target bytes. The two candidates are observationally equivalent because that byte projection never sees the top bit under this recurrence. This control demonstrates exact state recovery and correctly avoids claiming that an unobservable bit can be deduced.

[Executable source-exact Node 22 CommonJS SFT](../sims/p50_2014_lcg_highbyte_state_sft.cjs) verifies the resource SHA-256, all source-grid traversals, full state enumeration, the complete original 16-byte obstruction, full-length positive recovery, and the declared zero-survivor result. The independent local compiled C++17 implementation produced the same zero original survivors with the complete 256-byte positive check.

## Decision and next dependency

Do not interpret the 256 bytes as the direct contiguous native output of these three legacy 32-bit LCGs under the nine printed orientation/byte-lane contracts. No plausible independent source instruction selects a particular alternative PRNG or skip schedule today. This result leaves encrypted table content, an unknown keyed generator, noncontiguous output clocks, different byte representations, nonlinear state evolution, and an external plaintext/key source entirely open.

To advance this route, recover a **source-authenticated generator or key derivation** and verify it *first against untouched original table bytes*, then against actual unknown LP2 ciphertext. Extending the catalog of arbitrary PRNG constants or trying unfixed offsets without that selector would not recover a historical key. The authoritative [research state](../results/README.md) therefore remains unchanged.
