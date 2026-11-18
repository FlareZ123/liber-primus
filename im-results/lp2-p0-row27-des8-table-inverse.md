# P0 red331 row27 as a direct eight-byte DES key for the numeric table

**Agent15, 18 November 2026.** Bounded negative on an independently source-shaped byte transport. No unknown plaintext, recovered LP2 key or source-authenticated cipher operation.

The original 2014 p0 red title contains two printed words of lengths 8 and 5. Their exact GP-prime sums are **347** and **315**. Their difference is **32**, equal to the numerical table's row count, their common residue modulo 32 is **27**, and their mean is **331**, the historical 7×7 magic square center. These arithmetic relations and the source's row27 are documented in [the preexisting original-source report](lp2-p0-red331-row27-phi151-closed-loop-original.md). This is a retrospective selector; none of these numbers authenticates a DES cipher.

The full table on original LP2 physical pp49–51 comprises **32 rows × 8 cells**, each provisionally interpreted as an eight-bit integer under conventional radix60. Its zero-based row27 is `[142,219,148,59,58,52,51,151]` or **`8edb943b3a343397`**. An eight-byte row is exactly the single-DES key size; 256 table bytes are a whole number of 8-byte blocks. This provides one inexpensive, entirely source-byte-derived reversible hypothesis: use **only this uniquely selected eight-byte key** to transform the original 256-byte table in source row order, with block-ECB and the two simplest CBC initializations (all zeros or row27), each in encrypt/decrypt direction. No key or plaintext is fitted.

[Complete read-only Node22 CommonJS SFT](../sims/lp2_p0_row27_des8_source_sft.cjs) reads the canonical original page0 rune indices and actual printed table tokens, asserts the selector and radix60 byte conversion, verifies the published DES known-answer `133457799BBCDFF1 / 0123456789ABCDEF → 85E813540F0AB405`, then executes all **six** frozen byte transforms. It uses OpenSSL's `des-ede3-ecb/cbc` with three equal DES subkeys, exactly equivalent to single DES. Each ciphertext round-trips completely, as does a planted 256-byte English control; this establishes correct implementation, not a genuine key.

| Frozen direct transport | ASCII printable including whitespace / 256 | First eight output bytes |
|---|---:|---|
| ECB decrypt | 86 | `f1f5150598e9a31e` |
| ECB encrypt | 100 | `89f931743cbb3765` |
| CBC zero IV decrypt | 89 | `f1f5150598e9a31e` |
| CBC zero IV encrypt | 107 | `89f931743cbb3765` |
| CBC key IV decrypt | 91 | `7f2e813ea2dd9089` |
| CBC key IV encrypt | 87 | `0352652489b49b2c` |

All six output byte strings have **121–140 bytes ≥128**, no natural ASCII passage in the inspected prefix, and no recognizable standard plaintext file magic in the first block. These outputs provide no decryption, and this narrow result cannot exclude compressed/encrypted nested material or a different primitive. A crude 256-byte printability check is a weak distinguisher against arbitrary binary formats; no extra source cue here licenses an unconstrained next layer. The original alternate **radix59** table readout is also valid, so the choice of radix60 remains conditional.

## First-chapter receiver: 729 GP29 ciphertext runes

The same eight-byte row key has a second direct possibility with a clearer route to unknown plaintext: use historical DES in CTR or OFB mode as a keystream over the 729 original physical pp0–2 GP29 runes. The independent source layout gives an opening chapter of 262+266+201 runes; p0's heading selects the proposed row key. A fixed **16-case** family uses mode OFB/CTR, IV zero/the exact eight-byte row, byte-to-GP29 map byte mod29 or scaled `floor(byte×29/256)`, and both additive signs. No period, key candidate or source phrase is scored or tuned.

On the unchanged original opening, the raw rune IoC is **0.03408252**. The highest black-body IoC among all 16 models, with p0's 13 red heading runes excluded, is **0.03550807** (OFB, IV=row key, byte mod29, positive sign); that variant's full 729-rune IoC is **0.03572559**. Its first 24 recovered tokens are `EA EO J A M EA E R X W EA E O NG M P G IA EO B EA F W P`, without a coherent sentence. Genuine solved p57 has native IoC approximately **0.06271** for reference. All 16 original outputs remain uniform-like.

The [successful original-source Windows Actions run 44208585771](https://github.com/FlareZ123/liber-primus/actions/runs/44208585771) executes this entire file against the current shared corpus and printed numeral table. The same read-only SFT checks the original first-chapter page lengths, exact reconstruction of all **729** original ciphertext runes for each modeled decoder, and a **95/95 independently solved GP29 p57 plaintext plant** for each mode. This excludes the declared first-chapter *direct additive DES-stream receiver* under the published radix60 row bytes. Different table interpretations, cipher cascades and externally authenticated secret keys remain outside scope.

**Decision:** the visible 8-byte row27 is insufficient to promote a literal DES table cipher. Retire this exact six-mode direct transport, and return to a source-authenticated decoder/key or independently recovered plaintext. Do not infer DES from the dimensions alone. This study differs from the preexisting [fragmentwise DES streams](../sims/fragment_grid_des_inverse.cjs), whose 32 keys were matched to the 32 text fragments and did not test a row27 key against the table itself.
