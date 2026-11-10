# LP2 base-60 table as 256-bit stream-cipher seed: bounded screen

**Status:** reproducible negative screen for a narrowly specified table-to-stream hypothesis (Agent 12, 2026-11-10). No LP2 plaintext, recovered key, or confirmed cipher mechanism.

## Hypothesis

The 32-row, 8-column base-60 grid spanning manuscript pages 49–51 resolves to exactly 256 bytes. Its layout admits 8 natural 32-byte column keys and 8 contiguous 32-byte row-major keys. These are 256-bit key candidates for AES-256-CTR and ChaCha20, and variable-length RC4 keys.

For each key, test its forward and byte-reversed order. Use keystream bytes as mod-29 additive or subtractive rune offsets, with two explicit byte-to-rune conventions:
`k = byte % 29` and `k = floor(29*byte/256)`.

For AES-256-CTR and ChaCha20, test all-zero 128-bit IV and three IVs in which the original LP2 page index is inserted in the first or last four bytes (LE/BE), with zero or 256 initial keystream bytes discarded. RC4 uses discard counts 0, 256, or 3072. Cipher state starts at each page's first rune. This is **2,432 distinct parameter configurations** over 55 rune-bearing unsolved LP2 pages.

Input: `resources/transcriptions/liber_primus_master.txt` (base-60 master tokens), `resources/liber-primus/lp2-corpus.json` (rune sequences). The 256 decoded bytes have SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The grid may encode something other than a seed; its presence alone does not imply this key interpretation.

## Executed screen

Opt-in GitHub Actions [run 42742817792](https://github.com/FlareZ123/liber-primus/actions/runs/42742817792) completed successfully using Node.js and the deterministic self-contained script `sims/base60_seeded_stream.cjs`.

The score is full-corpus rune index of coincidence, `Σ n_r(n_r-1)/(N(N-1))`, with N=12,956. A true keystream additive encryption of English-like GP text would sharply elevate this score above the 1/29 = 0.03448276 random-rune baseline.

| Measurement | Result |
| --- | ---: |
| Original ciphertext rune IoC | 0.034478398 |
| Configurations screened | **2,432** |
| Strongest decoded whole-corpus IoC | **0.034568719** |
| Winning parameters | column4 reversed, AES-256-CTR, page-number last-LE IV, drop 0, byte % 29, subtract |
| Strongest local IoC on any single page with 200+ runes | **0.041039052** |
| Local winner | LP2 page 39, row5 reversed, RC4 drop 3072, byte % 29, subtract |

Every whole-corpus configuration remains very close to the uniform benchmark. A local maximum selected among thousands of keys and dozens of pages does not support a decryption.

### Planted positive control

Independently sample 55 pages of rune frequencies estimated from the existing LP1 English-reference text, with the real LP2 page lengths. Encrypt using the actual decoded table's **column 3 forward**, **AES-256-CTR zero IV**, **drop 0**, **byte % 29**, **add**, and repair 81% of generated adjacent ciphertext collisions by a randomized different rune. Fixed-seed test uses xorshift32 `0x41a53e91` for plaintext and collision repairs.

The uncorrected key-alignment decoder ranks **exactly first out of 2,432**, reaching **IoC 0.065291199**, versus the next candidate **0.034889539**. The planted ciphertext before decoding has IoC **0.034533806**. Thus the method recovers the stated model despite substantial anti-repeat repair under this **single planted scenario**; it does not certify general detection power for every register or cipher variation.

## Interpretation and limits

This test gives no evidence that those 32-byte grid slices directly seed any of the named stream-cipher families under the stated IV, byte-to-rune, page-reset, and sign conventions. The table may instead represent encrypted binary content, part of a key-derivation mechanism, a permutation, a protocol message, or unrelated information. Key hashing, mixed-column ordering, nonzero unknown nonce material, variable key pointer, cipher chaining, nonlinear outer alphabets, and hidden plaintext encodings were **not screened**. The current result does not rule those out.

Avoid repeating this screen without a concrete new derivation rule or independent clue that constrains a larger key space. The findings are intermediate evidence rather than an authoritative manuscript decryption.
