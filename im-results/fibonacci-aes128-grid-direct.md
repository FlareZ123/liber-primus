# LP2 numeric grid under Fibonacci-square-derived AES-128 keys

**Agent 16, 2026-11-10. Evidence class: bounded, original-input cryptanalytic negative with an exact byte-roundtrip control. No previously unsolved LP2 plaintext, authentic key, binary payload, or destination was recovered.** This closes one straightforward 128-bit interpretation of two already established manuscript clues without increasing arbitrary key searches.

## Two independent artifacts

The physical LP2 page 15 (original scan 32.jpg) contains a 4×4 square whose 16 entries are **exactly** the clockwise spiral of \`abs(3301 − prime(Fibonacci(n)+1))\`, retaining 16 distinct Fibonacci indices. That mathematical construction is independently established prior art (see [the exact reconstruction](../results/fibonacci-prime-spiral.md)). The 32×8 two-character base-60 table on LP2 pages 49–51 yields exactly **256 bytes** in its published original reading order, including the runeless physical page 50.

A natural hypothesis distinct from previously tested 256-bit section keys and 128-bit *IVs* is that **sixteen numeric square entries serialize directly to a 16-byte AES-128 key** and decrypt the 256-byte grid. This is a hypothesized interpretation of the clues. Neither artifact explicitly instructs AES.

## Fully specified finite original-ciphertext inverse

[Executable CommonJS source](../sims/fibonacci_aes128_grid_key.cjs) re-reads the original square from the master manuscript and the machine-readable 256-byte grid, and reconstructs five different 16-number candidate key ingredients:

1. The 16 printed square integers;
2. signed \`3301 − square integer\`;
3. corresponding 16 Fibonacci-selected prime values;
4. their one-based prime ranks;
5. their original Fibonacci indices.

Each ingredient is read in exact clockwise-spiral or printed-row order, optionally reversed, reduced modulo 256 with a positive or negative sign: **40 explicitly named 16-byte keys**. No key bytes are learned from decrypted outputs.

The **256-byte target** is traversed in row-major, reversed row-major, column-major or reversed column-major order. For each combination we test raw AES-128 ECB, CBC, CTR, CFB and OFB. ECB has no IV; each of the other four modes uses five defined IVs: all zeros, the original grid's first or last 16 bytes, and the square's 16 direct byte reductions in printed-row or spiral order. Thus the total is **40 × 4 × (1 + 4 × 5) = 3,360** configurations. CBC and ECB have padding disabled because the full original table is 256 bytes and no padding length is independently specified.

Direct byte decodings are scored with two *necessary conditions* for the tested output encodings: all 256 bytes must be ASCII printable or standard whitespace to be one complete direct ASCII text, or all 256 bytes must be in \`0..28\` to be a literal one-byte-per-GP-rune text. The longest contiguous ordinary ASCII segment is also recorded, but an isolated string selected across thousands of decryptions is not an authenticated message. Binary file formats, compression, other encodings and unknown AES key derivations are outside this gate.

## Executed findings

[Successful original GitHub Actions run 42771887658](https://github.com/FlareZ123/liber-primus/actions/runs/42771887658), Node.js 22, used the committed primary inputs and passed every exact contract assertion.

| Original-data diagnostic | Result |
| --- | ---: |
| Actual 16-byte candidate keys | 40 |
| Tested AES-128/grid/IV configurations | **3,360** |
| Complete ASCII/whitespace outputs | **0 / 3,360** |
| Complete 0..28 GP-byte outputs | **0 / 3,360** |
| Largest ASCII/whitespace byte count | **125 / 256** |
| Largest GP-range byte count | **49 / 256** |
| Longest contiguous ordinary ASCII span | **12 bytes** |

The highest ASCII-byte count is obtained with signed difference key / spiral forward / direct, reversed row-major bytes, OFB and the final-grid-byte IV. Its first 32 recovered bytes are \`0f75fa7f0cdfc0491a109b8b2874358e171b5ad2488ed67c3774fd65d622fe11\`; it does not form text. The highest GP-range result comes from the prime-rank key / spiral direct, row-major grid bytes, CBC and first-grid-byte IV; **49** is far below the required 256 literal GP indices.

**Planted exact positive:** encrypt the first 256 bytes of the checked-in independently solved LP1 translation using the source-derived square key, AES-128-CBC and a zero IV. The same decryptor recovered **all 256 original bytes exactly**, demonstrating that the full byte path and AES mode semantics work.

## Cryptanalytic interpretation

The **literal AES-128 16-byte-key interpretation of these source clues does not directly expose a full human-readable byte or one-rune-per-byte grid payload**. No key or decryption candidate is established; promoting the highest count would be result-selection bias. This gate deliberately stops at its original mechanism rather than fitting extra hashing, compression assumptions, IV lengths or alphabet substitutions to chance gibberish.

The grid may represent a nontext binary object, act as key material for a separate cipher, use a different serialization, or be unrelated to the square. The original runic pages are not tested under this AES-128 hypothesis. A next productive attack needs independently constrained key-use instructions or a mechanism that predicts original manuscript plaintext.
