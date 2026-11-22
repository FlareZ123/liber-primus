# p50 base60 table and bracketed interval as RC4/OutGuess key material: bounded original-input negatives

**Agent 1, 14 November 2026; inner43 follow-up by Agent3, 20 November 2026.** This note covers the full p50 table, its 76-cell perimeter, and the separately selected 43-byte interval. None recovers LP2 plaintext, historical key, or final destination.

## Why this candidate was worth one bounded test

The original physical pp49–51 table contains exactly **256** two-character cells. A conventional base60 reading gives 256 bytes, matching RC4's 256-state key-scheduling domain; unlike an S-box, an ordinary RC4 key may contain repeated bytes. Separately, the 32×8 table's outer ring has **76** cells, exactly the 76 ciphertext runes on p55, and the solved p57 says to “shed our own circumferences.” A later nested-marker analysis also selected the **43** base60 bytes between the two literal 3D tokens, matching p55's 43 strict word-interior runes. These are bounded reasons to test the full table, perimeter, and inner interval as candidate key material.

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


## Inner43 interval as RC4/OutGuess key material (Agent3, 20 November 2026)

The marker identity needs precise notation. The p50 cells at flattened offsets **83** and **127** are the literal token string "3D"; each token base60-decodes to **193 decimal (0xC1)**, not **0x3D** (61 decimal). The 43 base60-decoded bytes at offsets 84–126 are unchanged from the interval in the [BASE29 43:43 gate](p50-43byte-base29-p55-interior-key-gate.md).

Frozen candidates:
- The 43 decoded interval bytes themselves as a raw standard-RC4 key.
- The literal 86-character concatenation of the 43 p50 tokens as an OutGuess password, using the source-compatible MD5("Encryption" || password) KDF and ARC4.
- The OutGuess "Seeding" role is included only as a wrong-role control.

The target is p55's 43 strict word-interior runes, selected by p57's circumference instruction. The 2016 image carrier's use of OutGuess is historical motivation only; no Cicada source currently instructs solvers to apply OutGuess to LP2.

| Candidate | Readout | IoC | Direct XOR values in GP29 range |
|---|---|---:|---:|
| Raw inner43 RC4 key | subtract keystream mod 29 | 0.03211517 | 3/43 |
| Raw inner43 RC4 key | add keystream mod 29 | 0.03433001 | 3/43 |
| OutGuess "Encryption" | subtract keystream mod 29 | 0.03211517 | 0/43 |
| OutGuess "Encryption" | add keystream mod 29 | 0.03543743 | 0/43 |
| OutGuess "Seeding" control | subtract keystream mod 29 | 0.04208195 | 3/43 |
| OutGuess "Seeding" control | add keystream mod 29 | 0.05426357 | 3/43 |

The source-compatible "Encryption" role yields no valid GP29 symbols under direct bytewise XOR, and neither mod-29 direction produces readable plaintext. The highest IoC belongs to the wrong-role "Seeding" control; its output is nonlinguistic and is not evidence for the intended operation. No statistical significance is claimed for a 43-symbol sample. The RC4 known-answer vector and synthetic XOR/mod-29 round trips pass.

The separate reproducer is [sims/lp2_p50_inner43_outguess_key_gate.cjs](../sims/lp2_p50_inner43_outguess_key_gate.cjs).

## Decision and scope

Reject only the tested direct candidates: the full 256-byte table and its 76-cell perimeter as raw RC4 keys, plus the marker-selected inner43 bytes as a raw RC4 key or literal-token OutGuess password under the stated KDF/roles. The tested orders, stream starts, byte-mod-29 readout, direct XOR validity, and additive signs recover no plaintext. This does **not** exclude a separately sourced key derivation, another radix, another cipher, or the table used for a different purpose. The 2016 carrier's use of OutGuess does not establish it as an LP2 cipher; do not expand this into arbitrary phases, hashes, salts, or key transformations without a new source clue.

**Reproducers:** [sims/lp2_p50_rc4_key_original_gate.cjs](../sims/lp2_p50_rc4_key_original_gate.cjs) covers the full table and outer ring; [sims/lp2_p50_inner43_outguess_key_gate.cjs](../sims/lp2_p50_inner43_outguess_key_gate.cjs) covers the marker-selected inner43 key and OutGuess transfer test; [sims/lp2_p50_43byte_p55_interior_base29_key_sft.cjs](../sims/lp2_p50_43byte_p55_interior_base29_key_sft.cjs) covers the BASE29 high/low digit channels and correctly asserts the literal 3D token markers.
