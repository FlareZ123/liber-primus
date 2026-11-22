# LP2 printed 32×8 grid as SHA-2 message-schedule words: direct source gate

**Classification:** exact negative on one source-shaped numerical interpretation, 12 November 2026, Agent 3. **No LP2 unknown plaintext, authentic key, or cipher operation is recovered.** The result excludes a literal complete SHA-2 expansion, without claiming anything about separate SHA-2 inputs, hash-based key derivation, or the unsolved page cipher.

## Original clue and executable hypothesis

The original LP2 physical pp49–51 display **32 rows × 8 two-character numerals**. The repository's conventional base-60 reading gives exactly **256 bytes**, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The final solved LP2 p56 contains a 128-hex-character hash, which motivates considering a 64-bit SHA-512 word register. This is a candidate choice by analogy, not a creator-authenticated instruction.

Test whether the 32 rows encode **32 consecutive SHA-512 message-schedule words** in source order. The 16 words at positions 0–15 are completely free, so the next 16 are *uniquely* predicted by the FIPS SHA-512 schedule, with no unknown seed, key, or digest:

`W[t]=(σ1(W[t−2])+W[t−7]+σ0(W[t−15])+W[t−16]) mod 2^64`, for `t=16..31`;

`σ0(x)=ROTR1(x) XOR ROTR8(x) XOR SHR7(x)`, `σ1(x)=ROTR19(x) XOR ROTR61(x) XOR SHR6(x)`.

A competing **SHA-256** interpretation divides the same printed table into 64 consecutive 32-bit words; 48 output words are uniquely determined by the first 16 under the standard 32-bit `σ0=(ROTR7 XOR ROTR18 XOR SHR3)` and `σ1=(ROTR17 XOR ROTR19 XOR SHR10)` functions. No arbitrary digest target or secret parameter enters either test.

## Complete original-source result

| Interpretation of literal table | Independently predicted words | Exact matching words | Bit mismatches across predicted words |
| --- | ---: | ---: | ---: |
| SHA-512: source row-major, big-endian, forward | 16 | **0** | **541 / 1,024** |
| SHA-256: source row-major, big-endian, forward | 48 | **0** | **752 / 1,536** |
| SHA-512: seven orientation controls (column-major, reversed word order, and/or endian swap) | 16 each | **0 in each** | **474–524** |
| SHA-256: same seven orientation controls | 48 each | **0 in each** | **744–784** |

The first exact SHA-512 prediction under the source's printed order is `940053d57e565ad4`; its printed original-byte counterpart is `c9b35678a98d48ab`. The first SHA-256 predicted word is `dae1b760` while the actual word is `7aff19c0`. Both disagree by many independent bits, ruling out a simple one-byte transcription error or a missing final digest.

The [single-file source-asserting Node.js SFT](../sims/lp2_p50_sha2_message_schedule_sft.cjs) checks every input token, all sixteen literal orientation/algorithm combinations, both FIPS schedule recurrences, and independently constructed positive schedules. Positive controls pass **16/16** SHA-512 predictions and **48/48** SHA-256 predictions. The original-input workflow [run 43258772136](https://github.com/FlareZ123/liber-primus/actions/runs/43258772136) passed on the shared main branch.

## Decision

The displayed p49–51 bytes are **not a direct SHA-512 or SHA-256 message expansion** of a freely chosen initial 16-word block, under either source-traversal convention and natural byte or word reversals. There is consequently no hidden SHA-2 initial message, recovered digest, decryption keystream, or next page selected by this table interpretation. Do not continue trying endian offsets or fitted salts to rescue this exact literal recurrence. Source-derived nonlinear constructions outside this model remain open; a new creator-visible selector would be needed before considering those.

The earlier [exact SHA-256/SHA-512 repeated-block hash-chain gate](../sims/lp2_p50_sha256_sha512_block_chain_sft.cjs) tests a mathematically different hypothesis, `block[i+1]=SHA2(block[i])`. It neither supplies nor contradicts this distinct **message schedule** exclusion.
