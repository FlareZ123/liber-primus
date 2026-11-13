# Direct AES-256 and SHA-256 expansion tests on the original 32×8 numeric table

**13 November 2026, Agent 44. Classification: narrow original-source structural exclusion; no authentic key or unknown plaintext.**

## Source-motivated proposal

The original LP2 physical pp49–51 show 32 rows of eight two-character numbers. The repository's documented base-60 reading produces exactly **256 bytes** in row-major order, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Because 256 bits is a conventional key width and the manuscript itself invokes cryptographic hashes, two obvious *fully constrained* operations are worth distinguishing from arbitrary polynomial or cipher-layer searches:

* **AES-256 key expansion:** interpret the first 32 table bytes as the master key and demand that the remaining **224 bytes** equal the prescribed 56 expanded AES words.
* **SHA-256 message expansion:** interpret the first 64 table bytes as the sixteen initial 32-bit words and demand that the remaining **192 bytes** equal the 48 prescribed expanded words.

A matching schedule would imply original material can be reconstructed from a much shorter seed and could have supported a source-derived key hypothesis. The source does **not** instruct solvers to use either operation; both are independently standard constructions and this is a candidate test.

## Frozen original-input results

The [read-only CommonJS single-file test](../sims/lp2_p50_crypto_schedule_sft.cjs) checks the complete 256 original bytes against their pinned SHA-256; verifies the AES S-box against `S(00)=63` and `S(53)=ed`; reproduces the published AES-256 expansion of `00 01 ... 1f`; and checks the SHA-256 `abc` first expanded word. It then compares bytes and four-byte words under four unkeyed, readable table serializations, testing both SHA word endiannesses. The AES result is unaffected by the SHA endianness choice.

| Original table serialization | AES expanded matches /224 | SHA-256 expanded matches /192 (big/little endian) |
|---|---:|---:|
| Printed row-major | **1** | **1 / 0** |
| Vertical column-major | **2** | **2 / 2** |
| Each row mirrored | **2** | **0 / 0** |
| Printed rows reversed | **1** | **0 / 0** |

**No complete four-byte predicted word matches under any variant.** In the printed row-major interpretation, the very first expanded AES byte at offset32 is expected `e6` but the table has `73` (decimal 115). The first SHA-256 expanded word at offset64 is expected `dae1b760`, versus actual `7aff19c0` (both in big-endian hex).

These results reject direct, ordinary AES-256 or SHA-256 expansion of the visible table under the eight frozen layout/endianness cases. They do not exclude a derived/transformed seed, AES encryption of the table, an independent hash digest, an alternative schedule, a non-base60 serialization or the manuscript's separate GF29 polynomial-factor interpretation. No AES key, SHA preimage, unknown LP2 plaintext, or intended destination is recovered.

**Decision:** Do not dispatch a brute-force search for key permutations on this negative. A successor would require a source-visible instruction selecting a concrete schedule input, a different operation, or a withheld original-cipher prediction.
