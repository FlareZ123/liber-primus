# p10 7G → p50 pointer walk: bounded direct-key and p56 hash gate

**Status: exploratory original-artifact hypothesis; bounded negative for the fixed direct consumers below. No unknown LP2 plaintext, authentic key, cipher, hash preimage, endpoint, or destination was recovered.**

## Human-visible starting point

Original LP2 p10 has an isolated decimal **7** immediately followed by a complete one-rune word **G**. The Gematria Primus rune G has one-based ordinal 7 and associated prime 17. The provisional product **7 × 17 = 119** is not printed as an operation, but it is the human-readable selector proposed in the existing [p10 7G source bridge](../workplace/p10-seven-g-red119-source-bridge.md). That bridge identifies p50's one-based cell 119 as row 5, column 7, token **0Z**, conventional base-60 value **35**, with 35 mod 29 returning G.

A natural next experiment is to treat that table value as a one-based pointer into the same 256-cell p49–p51 table, repeatedly following each cell's value until an address repeats. The table is a 32×8 / 256-byte object, so a 32-step walk offers a plausible 32-byte candidate key. AES-256 is one recognizable 32-byte consumer; the historical 2013 Cicada material also makes repeating XOR a familiar competing consumer.

**Weakest assumptions:** the p10 multiplication is not authenticated; the table does not explicitly instruct the solver to treat byte values as one-based cell addresses; stopping at the first repeated address is a convention; and neither AES-256 nor its mode/IV is selected by the manuscript. This is an exploratory, finite discriminator, not a proposed solution.

## Exact pointer walk

Using the canonical original base-60 byte sequence (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`), the one-based walk is:

- Cell addresses: `119, 35, 197, 176, 18, 202, 74, 79, 46, 107, 31, 141, 245, 22, 137, 10, 249, 113, 73, 164, 82, 58, 118, 171, 254, 36, 39, 133, 169, 240, 173, 148`
- Pointer values: `35, 197, 176, 18, 202, 74, 79, 46, 107, 31, 141, 245, 22, 137, 10, 249, 113, 73, 164, 82, 58, 118, 171, 254, 36, 39, 133, 169, 240, 173, 148, 173`

This gives **32 unique cells** before the walk enters the two-cycle **173 ↔ 148**. However, the path length is not a distinctive property of the selected start: **63 of 256** possible starts have at least 30 unique cells before termination or cycle. The 32-byte shape therefore does not independently authenticate AES-256.

## Fixed consumers tested

Four natural 32-byte representations were tested: pointer values, visited cell addresses, and each sequence minus one for a zero-based byte convention. Each was tested against the original 256-byte table in row-major and column-major order.

| Consumer | Candidates | Printable bytes across candidates | Longest ASCII run | Recognized file headers |
|---|---:|---:|---:|---:|
| Repeating XOR | 8 | 83–101 / 256 | 7 | 0 |
| AES-256 ECB, zero IV | 8 | 90–111 / 256 | 8 | 0 |
| AES-256 CBC, zero IV | 8 | 83–109 / 256 | 5 | 0 |
| AES-256 CTR, zero IV | 8 | 85–100 / 256 | 6 | 0 |

No candidate begins with the tested PDF, PNG, ZIP, gzip, JPEG, bzip2, XZ, Zstandard, SQLite, ELF, or GIF signatures. These are only direct-consumer tests; no fitted IV, padding, key phase, extra transform, or alternative mode was introduced.

## p56 hash-target check

The solved p56 page's 128-hex target is:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

The four raw 32-byte key/address variants and the 64-character path-token serialization were each checked under SHA-512, SHA3-512, BLAKE2b-512, and SHAKE256(64): **0/20 exact matches**. For example, SHA-512 of the pointer-value bytes is `efd9d9cc25fb3203839618667d80f4ce6581e6256ea638259f5c64ee489c220878012f836fa70a8276fcffeeb29839d07b85daaa043725c7f9ce415256ccc246`, not the p56 target.

## Decision

Reject only this fixed pointer-walk as a direct repeating-XOR or zero-IV AES-256 key for the p50 table, and as the tested direct p56 hash preimage. The pointer-walk rule itself remains unproven and its 32-step length is not selective. **Do not expand into arbitrary starts, phases, modes, IVs, resets, or target objects** without a new original-source instruction selecting the pointer operation and its consumer.

**Reproducer:** [`sims/p10_7g_p50_pointer_chase_key_sft.cjs`](../sims/p10_7g_p50_pointer_chase_key_sft.cjs), Node.js 22. It asserts the original table digest, complete pointer path, all-start path-length control, all 32 direct decryptions, all 20 digest comparisons, and the absence of a recognized header or target match.
