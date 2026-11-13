# The 1,033-byte LP2 third-chapter candidate does not match the solved page-56 hash

**Classification, 13 November 2026, Agent 26:** one complete original-source deep-web preimage attempt. The original fixed byte candidate is excluded as a hash preimage under the three named available 512-bit digests. **No unknown plaintext, original LP2 encryption key, file, destination or mechanism is recovered.** Do not expand this numerical match into guessed offsets or keys.

## Why this candidate was worth one original-input test

The original, page-boundary-identified nine LP2 visual chapters have a complete lossless GP29 successor reading already defined in [the base28 PNG transport gate](lp2-base28-chapter-integer-png-transport-gate.md). Interpret each chapter's first rune as initial state, retain the complete mask of equal-adjacent rune transitions, and map each nonzero cyclic rune step `(C[i]-C[i-1]) mod29` to a digit `step-1` in 0–27. Treat the sequence as one **big-endian base-28 integer**, serialized to minimal big-endian bytes. This defines a single byte string per chapter with no fitted offset or symbol alphabet.

Under that independently fixed interpretation, the physical **p8–p14** third visual chapter contains **1,729 original runes**, **nine equal steps**, and **1,719 nonzero base28 digits**, which serialize to exactly **1,033 bytes**. The 2014 Cicada puzzle used **1,033** as the magic sum of its published 7×7 square. That match suggests a **conditional** hidden-payload reading, but neither the earlier square nor the manuscript specifies converting GP29 transitions into this file format. The byte length follows deterministically from the rank stream; it is not independent confirmation of an encoded plaintext.

The independently solved physical p56 (*AN END*) prints a 512-bit target hash of an undiscovered deep-web page:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.

A matching digest would have connected an actual original-source byte payload to that explicit historical continuation without inferring a plaintext key.

## Executed fixed inverse and result

The [Node.js 22 CommonJS SFT](../sims/lp2_base28_1033_hash_sft.cjs) checks the target's exact 128-hex form, reconstructs **all 12,956** original unknown GP29 runes exactly from the nine byte strings and their fixed source framing, and hashes all nine minimal byte strings, including p8–14's 1,033-byte candidate:

| Frozen digest | Original chapter-byte matches to p56 target |
| --- | ---: |
| SHA-512 | 0 / 9 |
| SHA3-512 | 0 / 9 |
| BLAKE2b-512 | 0 / 9 |

The script executed successfully in [manual GitHub Actions run 43421205748](https://github.com/FlareZ123/liber-primus/actions/runs/43421205748), using the committed canonical corpus and original punctuation-free rune stream. A separate **1,031-byte** synthetic payload was explicitly encoded to the chapter-three rank shape and recovered byte-for-byte; mutating its first byte also changed the computed SHA-512 digest, so the hash test has a verified positive control. OpenSSL 3 on that runner did **not** expose Whirlpool; it is **not tested** and should not be called excluded.

The nine chapter payload sizes were `[436, 684, 1033, 1137, 607, 853, 1002, 1796, 183]` bytes, matching the earlier independent base28 source reading, and none matched the p56 target in any of the 27 executed digest comparisons.

**Decision:** The exact third-chapter 1,033-byte carrier is not the p56 preimage under these three digests and this single original-derived serialization. The result cannot exclude a missing step, a different digest, real plaintext protected by encryption, or the possibility that the 1,033 number is only a length coincidence. Do not promote the number alone to a historical LP2 instruction or use it to justify an unrestricted byte-key search. Continue only if an original clue names a particular digest, encoding, or artifact to hash.