# LP2 pp49–51 256-byte numeral table: literal AES key-schedule test

**Classification: narrow negative, no unknown plaintext.** Original physical LP2 pp49–51 print a 32×8 table of two-character numeral tokens, conditionally parsed in the repository's conventional base-60 alphabet to exactly 256 bytes. Their SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The source does not explicitly prescribe AES, so this is an inexpensive format-identification gate rather than a claim about intended encryption.

A byte table with 256 positions could theoretically contain a complete 176-byte AES-128, 208-byte AES-192 or 240-byte AES-256 expanded key. The AES schedule is deterministic once the first 16, 24 or 32 bytes are known. This permits a rigorous original-input test without searching keys, fitting IVs or decrypting unrelated ciphertext.

## Exact finite test

Take the **first Nk×4 bytes** of the source table as the proposed AES key, expand under standard FIPS-197 `RotWord`, `SubWord`, `Rcon` and the AES-256 extra SubWord step, then compare the complete expanded-key tail to the unmodified original bytes. Read the table in its printed row-major order; additionally test the column-major 32×8 transpose as a single geometric control. No arbitrary offset, byte permutation, key derivation, partial-word fitting or phase search.

| Frozen original byte order | AES size | Equal expanded bytes | Complete expanded 4-byte words | First mismatch (zero-based byte; actual / predicted) |
| --- | ---: | ---: | ---: | --- |
| Printed row-major | 128 | 1 / 160 | 0 | 16; 121 / 56 |
| Printed row-major | 192 | 1 / 184 | 0 | 25; 198 / 5 |
| Printed row-major | 256 | 1 / 208 | 0 | 32; 115 / 230 |
| Printed column-major | 128 | 0 / 160 | 0 | 16; 201 / 16 |
| Printed column-major | 192 | 0 / 184 | 0 | 24; 0 / 70 |
| Printed column-major | 256 | 2 / 208 | 0 | 32; 231 / 200 |

FIPS-197 expansion controls pass: `000102...0f` yields first AES-128 derived word `d6aa74fd`, and `000102...1f` yields first AES-256 derived word `a573c29f`. An AES-256 ECB known-answer test produces `8ea2b7ca516745bfeafc49904b496089`. The original table's SHA-256 is checked before every run.

**Result:** the original table is not an unaltered AES-128, AES-192 or AES-256 expanded-key byte sequence under either of these two frozen physical readings. It could still be an ordinary AES key or encrypted material, or have an unrelated role; no such role is demonstrated. No independent key, IV, cipher mode or original-LP2 plaintext follows. Do not iterate offsets/rotations to rescue this weak clue.

**Reproducer:** [`sims/lp2_grid_aes_expanded_key_sft.cjs`](../sims/lp2_grid_aes_expanded_key_sft.cjs), Node 22 with standard built-ins; original input [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json). The test was executed on the pinned source byte stream with all six cases and all positive controls passing.