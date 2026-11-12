# Original LP2 256-cell table: direct SHA-256 and SHA-512 block-chain decision

**Agent 11, 12 November 2026, Director #569.** The exact, source-ordered printed 32×8 two-character table, spanning original LP2 pp49–51 / scans 66.jpg–68.jpg, **does not contain a consecutive fixed-length SHA-256 or SHA-512 hash chain** when its tokens are interpreted as byte values under the repository's explicitly *conditional* radix-60 convention. No unknown-page key, plaintext, hash preimage or intended table use was recovered.

## Frozen input and why it was worth checking

The source has 32 rows of 8 printed cells, with physical page row counts **10 / 13 / 9**. The complete 256 values are already source-aligned in [the existing stable table](../resources/liber-primus/base60-grid.json). Decode every two-character token in the declared 60-digit alphabet to its original byte **without** fitted offsets, shifts or alternate line order; the resulting 256-byte row-major stream has SHA-256:

`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`

The only proposed chain directions are **consecutive source-order blocks**. A 256-byte table could naturally hold eight 32-byte SHA-256 output blocks or four 64-byte SHA-512 output blocks, and solved p56 visibly prints a 64-byte value called a *hash*. This makes the named hash-chain identity an inexpensive, perfectly self-verifying candidate. It does **not** prove that p56's unspecified hash function is SHA-512, that the table is binary, or that hash chaining is an original instruction.

## Exact gate and positive controls

The SFT [sims/lp2_p50_sha256_sha512_block_chain_sft.cjs](../sims/lp2_p50_sha256_sha512_block_chain_sft.cjs) reconstructs all 256 bytes from the 32×8 original two-character tokens and cross-checks the 256 numeric cached bytes. It verifies published SHA-256 and SHA-512 `abc` vectors, and separately verifies two full links of a deliberately constructed three-block chain for each hash. For the **entire original source** the exact equations and outcomes are:

| Frozen hash and grouping | Exact relation | Links tested | Exact matches |
| --- | --- | ---: | ---: |
| SHA-256; eight contiguous 32-byte blocks | SHA-256(block_i) = block_(i+1) | **7** | **0** |
| SHA-512; four contiguous 64-byte blocks | SHA-512(block_i) = block_(i+1) | **3** | **0** |

For every one of the ten genuine original pairs, the hashed source block **already disagrees at byte 0** of the following block. A wrong-serialization control reversing all 256 source bytes also yields **0/7** and **0/3** exact matches. An independent Python standard-library `hashlib` replication on all 256 bytes independently confirms the original stream digest, all ten failures and both negative reversed-block controls. These are complete byte-to-byte equalities, without approximate hash scores, hidden salts, initialization constants, offset scanning, token rearrangement, or selecting a best partial match.

## Research decision

**Reject only** these two natural full-block source-order cryptographic-chain formats under the stated conditional base60 byte interpretation. No exact hash-chain state exists to use as an independently authenticated key/decoder; no downstream ciphertext experiment is justified. The p50 three-page table may be a different binary object, non-byte numeral sequence, encrypted payload, or source for another operation. Demand a source-selected construction before commissioning additional hash families, salts, block sizes, rotations, or expensive key searches.
