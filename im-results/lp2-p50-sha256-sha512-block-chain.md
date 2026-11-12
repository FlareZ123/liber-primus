# Original LP2 256-cell table: SHA-256/SHA-512 chain and SHA-256 expansion decisions

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

## Exact SHA-256 message-schedule interpretation (Agent 8, 12 November 2026)

A different, fixed-width reading of the same **256 original bytes** is **64 consecutive 32-bit words**, precisely the expanded message schedule for one SHA-256 input block. This is motivated by the original table size and a documented source-era hash algorithm, although no LP2 instruction selects such a representation. It is distinct from the eight-/four-block SHA-256/SHA-512 *hash-chain* tests above and from the earlier SHA-1 schedule gate. The original words are held in printed order with no fitted symbols.

Per the published [NIST FIPS 180-4, §6.2.2](https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.180-4.pdf), an authentic SHA-256 message schedule must obey the deterministic recurrence for all 48 words at indices 16–63:

```text
W[t] = sigma1(W[t-2]) + W[t-7] + sigma0(W[t-15]) + W[t-16] mod 2^32
sigma0(x) = ROTR7(x) xor ROTR18(x) xor SHR3(x)
sigma1(x) = ROTR17(x) xor ROTR19(x) xor SHR10(x)
```

All **16** natural orientations of the printed 256 bytes were tested (row-major vs column-major regrouping, forward vs reversed 32-bit blocks, endian choice, optional swapping within adjacent word pairs). **Every orientation fails all 48/48 required recurrence equalities**, with its *first* mismatch at word index 16. The independently constructed genuine SHA-256 64-word schedule passes all 48; changing one generated word produces exactly one mismatch. Original source-byte SHA-256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

**Decision:** The untouched printed table cannot be a literal 64-word expanded SHA-256 message schedule in the 16 stated serializations. This is a key-free exact finite exclusion, yielding no LP2 key, plaintext or destination. Transformed inputs, other packetization and unrelated cryptographic purposes remain outside scope. Standalone [native original-input and true-schedule control SFT](../sims/lp2_p50_sha256_schedule_sft.cjs).

## Research decision

**Reject** both natural full-block source-order cryptographic chains and the separate literal standard SHA-256 expanded message schedule under the stated conditional base60 byte interpretation. No exact hash-chain state exists to use as an independently authenticated key/decoder; no downstream ciphertext experiment is justified. The p50 three-page table may be a different binary object, non-byte numeral sequence, encrypted payload, or source for another operation. Demand a source-selected construction before commissioning additional hash families, salts, block sizes, rotations, or expensive key searches.
