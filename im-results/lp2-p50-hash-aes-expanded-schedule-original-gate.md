# Original p50: source-geometry SHA-1/SHA-512 schedule extension (AES/SHA-256 corroboration)

**Prior-art reconciliation (23 Nov 2026):** The strongest original-source tests of AES and SHA-256 key/message schedules **predate** this contribution: [#559 AES schedule and round-state exact exclusion](https://github.com/FlareZ123/liber-primus/issues/559) and [#2183's Agent34 exact SHA-256 first64-word recurrence rejection](https://github.com/FlareZ123/liber-primus/issues/2183). AES-256 +16-byte IV was also fully excluded earlier by [#2251](https://github.com/FlareZ123/liber-primus/issues/2251). Our base60 row-major big/little SHA-256 and standard AES exclusions are **independent replications, not new discoveries**. This report's incremental new finite scope is SHA-1 first64-word and SHA-512 first32-word original-schedule tests under both codebooks/layouts/endiannesses, plus the alternate endian/base59/column SHA-256 corroborations. **Do not initiate further AES/SHA-256 schedule searches without new first-party instructions.**

## Source-visible premise and alternative

Original Liber Primus physical pp49–51 print **exactly 256 two-character table tokens** in **32 rows × 8 columns**. The two previously studied canonical alphabet interpretations each give a 256-byte stream (base59 or base60), with 161 distinct byte values; neither alphabet is author-authenticated. Cryptographic *expanded schedules* are a meaningful finite explanation for this geometry because SHA-256 uses **64 four-byte schedule words** (=256 bytes), SHA-512 uses 64-bit words laid out as one eight-byte row each, and AES-256 has **60 four-byte expanded key words** (=240 bytes) plus room for four other words. If the table encoded a public expanded schedule, its initial words would expose message/key material, and the recurrence would independently certify the reading without scoring LP2 plaintext. This is a candidate architecture, not a 2014 first-party instruction.

## Exact first derived-word challenge

Read all **256 original physical tokens**, unchanged, from `resources/liber-primus/lp2-grid-256.json`. Generate both conventional byte codebooks, either printed row-major 32×8 or column-major 8×32, both big- and little-endian multi-byte words. No arbitrary phase, key, padding or entropy search:

| Schedule | Input/init words | Compared dependent words |
|---|---:|---:|
| SHA-1 standard 32-bit message schedule | 16 | next 48 (of 64) |
| SHA-256 standard 32-bit message schedule | 16 | next 48 (of 64) |
| SHA-512 standard 64-bit message schedule | 16 | next 16 (of 32 available) |
| AES-128 key expansion | 4 | next 40 (44 total) |
| AES-192 key expansion | 6 | next 46 (52 total) |
| AES-256 key expansion | 8 | next 52 (60 total) |

There are **48** original-source serialization/model tests, **many overlapping the explicitly cited prior studies**. The increment must not be mistaken for a previously unexplored 48-way family. For each, compare the algebraically derived word with the actual original byte word, starting at exactly the first dependent position.

## Result: all fail immediately

**0 of 48** tests match **even their first derived word**, and **0 total dependent 32-/64-bit schedule words** match anywhere tested. Direct printed row-major base60, big endian examples:

- SHA-256 computed word16 `dae1b760`; printed word16 `7aff19c0`
- SHA-512 computed word16 `940053d57e565ad4`; printed word16 `c9b35678a98d48ab`
- AES-256 computed word8 `e6ba302a`; printed word8 `7372c527`

**Controls:** the same implementation regenerates exact SHA-1 (48/48), SHA-256 (48/48) and SHA-512 (16/16) planted schedule words. GF(2⁸) AES S-box independently matches canonical S-box entries, and known AES-128 `W4=d6aa74fd` and AES-256 `W8=a573c29f` key schedule vectors are reproduced. The complete committed source was executed in connected V8 against the exact unchanged GitHub original table with all assertions passing; **no GitHub Actions/Windows CI run is claimed**.

## Decision and scope

The physical table does **not** directly serialize these conventional SHA/AES expanded message/key schedules under any of the eight fixed source-byte presentations. For base60 row-major AES and SHA-256 this confirms earlier stronger tests, while SHA-1/SHA-512 and their stated alternate source presentations are the distinct added scope. This is a key-independent fingerprint rejection, not an exclusion of SHA/AES as a subsequent operation *on* the table or on ciphertext, and not a proof that the intended alphabet is base59 or base60. Do not search schedule offsets, arbitrary cell walks or transformed words without an independent original instruction selecting that exact alternate serialization. No unknown plaintext, authentic key or destination recovered.

[Standalone original-source implementation](../sims/lp2_p50_hash_aes_expanded_schedule_original_sft.cjs).
