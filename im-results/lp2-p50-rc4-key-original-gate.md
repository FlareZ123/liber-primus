# p50 base60 table as an RC4 key: bounded original-input negative

**Agent 1, 14 November 2026.** This closes one previously untested, simple consumer of the original p50 table. It recovers no LP2 plaintext, historical key, or final destination.

## Why this candidate was worth one bounded test

The original physical pp49–51 table contains exactly **256** two-character cells. A conventional base60 reading gives 256 bytes, matching RC4's 256-state key-scheduling domain; unlike an S-box, an ordinary RC4 key may contain repeated bytes. Separately, the 32×8 table's outer ring has **76** cells, exactly the 76 ciphertext runes on p55, and the solved p57 says to “shed our own circumferences.” These are recognizable, source-visible reasons a solver might try the table or its perimeter as an RC4 key.

The operation itself is **not** authenticated by a Cicada instruction or a solved-stage precedent. The base60 byte mapping is a derived interpretation, and the standard RC4→GP29 adaptation below is an exploratory test, not an established cipher.

## Frozen operation

- RC4 uses the standard 256-element KSA and PRGA; the implementation passes the classic `RC4("Key")` known-answer stream `eb9f7781b734ca72a7`.
- Key A is all 256 canonical `base60-grid.json` bytes in printed row-major order; the sole direction control reverses the entire key.
- Key B is the 76-cell perimeter, beginning at the northwest corner and proceeding clockwise; the sole direction control reverses that sequence.
- Each RC4 output byte is reduced modulo 29, then added to or subtracted from the original GP29 rune modulo 29. No phase, salt, hash, key derivation, discard count, per-page reset or fitted parameter is introduced.
- Key A is tested as a continuous stream over all **12,956** original p0–p55 ciphertext runes, and separately from offset zero on p55 alone. Key B is tested from offset zero on p55 alone.
- A planted 76-rune clear-p57 segment encrypts and decrypts exactly under the same key/stream implementation.

## Original-input outcomes

| RC4 key / readout | Target | Direction | Decoded IoC |
|---|---|---|---:|
| Full 256 bytes, row-major | Continuous p0–p55 | subtract | **0.03450216** |
| Full 256 bytes, row-major | Continuous p0–p55 | add | **0.03451212** |
| Full 256 bytes, reversed | Continuous p0–p55 | subtract | **0.03447590** |
| Full 256 bytes, reversed | Continuous p0–p55 | add | **0.03449413** |
| Full 256 bytes, row-major | p55 only | subtract | **0.03368421** |
| Full 256 bytes, row-major | p55 only | add | **0.03333333** |
| Full 256 bytes, reversed | p55 only | subtract | **0.02982456** |
| Full 256 bytes, reversed | p55 only | add | **0.03543860** |
| Outer 76 bytes, clockwise | p55 only | subtract | **0.03228070** |
| Outer 76 bytes, clockwise | p55 only | add | **0.03368421** |
| Outer 76 bytes, reversed | p55 only | subtract | **0.03333333** |
| Outer 76 bytes, reversed | p55 only | add | **0.03403509** |

For comparison, untouched p0–p55 has IoC **0.03447840**, untouched p55 has **0.03789474**, and clear p57 has **0.06270997**. None of the tested outputs moves toward the clear native-GP control; the whole-book results remain at the uniform-rune baseline and the p55 results are no better than the original short page. No readable passage is recovered.

## Decision and scope

Reject only the direct standard-RC4 candidates specified above: the exact base60 table or its exact 76-cell perimeter as key, row-major/reverse order, standard KSA/PRGA, byte-mod-29 stream and the two additive signs. The test does **not** exclude a separately sourced key derivation, another radix, RC4-drop variant, a different stateful transform, or a table used for a different purpose. No Cicada source currently selects RC4, so do not expand this into a search over arbitrary phases, hashes, salts, or key transformations without a new clue.

**Reproducer:** [`sims/lp2_p50_rc4_key_original_gate.cjs`](../sims/lp2_p50_rc4_key_original_gate.cjs). It loads the pinned canonical corpus and table, asserts the 256/76 lengths, verifies the RC4 known-answer vector and a native-GP planted round trip, and prints every frozen original-input result.
