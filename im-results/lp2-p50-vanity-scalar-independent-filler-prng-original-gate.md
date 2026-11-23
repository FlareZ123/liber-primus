# The p50 vanity scalar does not reproduce the independent table filler under six frozen standard streams

**Agent14, 23 November 2026.** Original-input, independently source-constrained **negative test**. Recovered unknown LP2 plaintext: **none**. Historical creator-selected algorithm: **none established**. The source scalar and `1Meanpng...` address remain conditional clues, not an authenticated decoder.

## Distinct causal question

The original physical p49–p51 panel (archive 66–68.jpg) has 32 rows by 8 columns. Its unchanged radix60 transcription is [the canonical table](../resources/liber-primus/base60-grid.json), with a mechanically derived, unambiguous 32-byte **fifth column**:

```text
61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4
```

A fixed, period-available Bitcoin serialization of those bytes produces the unusually readable candidate `1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK`, documented in the [source-address report](lp2-p50-missing-l-secp256k1-address.md). **Different question from its already-tested LP2 and image receivers:** if the source author *used this 32-byte key to generate the entire numerical table*, the untouched **other 224 printed bytes** might be predicted by a canonical deterministic 2014-available stream, supplying independent, nonlinguistic validation before trying any rune inverse. No source text explicitly instructs such table generation.

## Frozen experiment

Input is exactly the original 256 source-derived radix60 byte values, without editing ambiguous printed cells or fitting a key. Remove column 5 and preserve 224 bytes under two source-natural traversal orders: table row-major omitting that column, and column-major concatenation of the other seven columns. The only key is the unchanged 32-byte fifth column above. Test six deterministic, unsigned plaintext-free streams:

1. AES-256 CTR, all-zero 16-byte counter IV.
2. ChaCha20 with all-zero 16-byte legacy counter+nonce IV.
3. SHA256(key || 32-bit big-endian counter), counters 0,1,...
4. SHA256(32-bit big-endian counter || key), counters 0,1,...
5. HMAC-SHA256 keyed by key over 32-bit big-endian counter, counters 0,1,...
6. Repeated SHA256 hashing starting from key.

For each candidate and traversal, compare the 224 source filler bytes against stream offsets 0 through 32 inclusive. Total **2 × 6 × 33 = 396** fixed comparisons. Report the strongest contiguous exact byte agreement and largest count of equal positions. The original table's fifth-column source bytes are kept out of all target comparisons, so their predictable match cannot contaminate the result. Only the key, two natural byte orders, named stream forms, and explicit small start-offset allowance are considered. No alternate nonce, salt, KDF, cipher mode, table permutation or key spelling is fitted.

## Original-source outcome

- **Longest exact contiguous agreement: 2 bytes** in all 396 comparisons. Best two-byte run: **ChaCha20-zero, row-major filler, offset26**, with exactly **2 total byte matches**.
- **Highest total equal positions: 6/224** in **ChaCha20-zero, row-major filler, offset32**, with longest run only one byte.
- Across all tests **zero** candidates have even a three-byte uninterrupted original-filler match.
- Explicit planted exact-stream positive check succeeds: **224/224 matching bytes**, longest run224.
- Node.js 22 CommonJS source, zero file writes: [standalone source-exact SFT](../sims/lp2_p50_vanity_scalar_filler_prng_original_sft.cjs). Its fixed table-key assertion and 396-trial count must pass. Independently executed against the pinned table under Node v22.16.0 locally and [Windows Node22 PASS CI 45247345343](https://github.com/FlareZ123/liber-primus/actions/runs/45247345343).

A long match on 224 independently predicted bytes would have been a clear next step toward identifying the address scalar as a generator key and the table as a derived stream. Its absence provides no evidence for these **six exact candidate stream-and-layout contracts**. This is not a broad cryptographic exclusion: the table could be authored as independent randomness, a different PRNG could have been used, or the Bitcoin-looking column could be unrelated to table generation.

## Decision

Retire direct generation of the other seven columns by these six **unaltered, zero-IV/basic-counter** standard streams. Do not rerun with secret nonces or tuned byte permutations absent an original author instruction. The significant open question remains the original address or table's **typed receiver**, such as a page-independent, creator-selected operation that predicts withheld manuscript plaintext. Without such a receiver, this finite negative does not change the authoritative assessment that all 56 unknown LP2 physical pages remain undeciphered.
