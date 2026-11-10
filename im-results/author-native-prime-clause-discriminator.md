# Solved-Cicada prime-clause authenticity discriminator

**Classification, Agent 43 (2026-11-10):** An executable known-plaintext scoring instrument with a planted-key control. It has **not** decrypted unknown LP2 material or recovered a historical key. It applies only to candidate plaintext whose clause separators correspond to the printed original punctuation.

## Grounded source and exact data

The authenticated 2013 Cicada audio metadata contains **1,595,277,641 = 1259 × 1031 × 1229**, the product of the three solved *Parable* body-clause GP-prime sums ([independent research](https://github.com/pnotisdev/cicada3301/blob/main/STATUS.md)). This motivates a scorer counting how many proposed plaintext clauses have a prime sum of their [assigned GP-prime rune values](../resources/liber-primus/lp2-corpus.json). It is a source-authenticated signature beyond ordinary English frequency.

Using the original [rune transcription](../resources/transcriptions/liber_primus_master.txt), with literal `%` transcription-segment separators and `.` clause boundaries, the complete (headings included) original rune sequences of three *already solved* pages yield:

| Original transcription segment | Printed clause rune lengths | GP-prime sums (primes bold) | Prime-valued |
| --- | --- | --- | ---: |
| **4** (*Some Wisdom*, first release) | 10,17,24,23,7,76 | 468, **853**, **1039**, **1237**, **157**, 3274 | **4/6** |
| **15** (*An Instruction*, first release) | 12,13,26,14,17,7 | 520, **727**, **971**, **383**, **571**, **157** | **5/6** |
| **73** (*Parable*, solved physical LP2 page 57) | 7,30,30,28 | **449**, **1259**, **1031**, **1229** | **4/4** |

The literal segment indices differ from JPEG scan IDs: segment **16** matches canonical physical LP2 page **0**, while segment **73** matches solved LP2 page **57** (JPEG **74**). The script asserts both complete GP streams against the canonical corpus, preventing future segment/scan conflation. Thus **13/16** printed clauses in **341** authentic known runes have prime sums. Exhaustively evaluate the `29` inverse additive GP keys `P_i=(C_i-key) mod29`: the true `key=0` is uniquely first with **13/16**; the best of the other 28 keys scores only **5/16**. Encrypting the same 341 source runes by a concealed `key=19` and rescoring all 29 possibilities recovers **exactly key 19**, again **13/16 versus 5/16**. An unrelated Shakespeare GP passage at fixed offset **3301** and the same 16 printed clause lengths scores only **5/16** at its best key.

## Source-preserving, fully refitted null

Independently permute each original solved page's **rune inventory** across its fixed printed clause lengths, maintaining the source page unigram histogram. On **5,000 deterministic** samples, xorshift32 seed `0x73c1a15`, refit **all 29 keys on each shuffle**, retaining the maximum score. Mean refitted maximum **5.5172/16**; maximum observed **10/16**; **zero** samples at least as high as original 13/16 (conditional add-one tail **1/5001 ≈ 0.00019996**). These source pages were selected precisely for known prime-clause behavior, so this is a *conditional source-discriminator-power check*, not a manuscript-wide discovery probability.

## Actionable, bounded interpretation

This independent, language-neutral author-specific clue can score a fully specified proposed *unknown* LP2 plaintext **after** its key and segmentation are fixed by source evidence. Strong prime-clause consistency would add corroboration; failure alone is inconclusive because the unknown sections may use another authoring convention, and printed clause boundaries may be encrypted or artificial. This test yields **no unknown authentic plaintext** and licenses no general PRNG sweep.

**Reproduction:** [`sims/native_gp_prime_clause_discriminator.cjs`](../sims/native_gp_prime_clause_discriminator.cjs), Node.js/CommonJS; uses only checked-in source material and a fixed-seed null, without a new CI workflow.
