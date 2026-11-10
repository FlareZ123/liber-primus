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

## Actual unsolved LP2: an original-source key challenge with the same score

A useful operational question is whether this scoring instrument could rescue any *known clue-derived* candidate pad that ordinary LP2 English-frequency tests failed. LP2 **page 15** contains an exactly reproduced **16-number Fibonacci-indexed prime spiral**; its five natural streams are the spiral numbers, the underlying primes, the Fibonacci-prime ranks, the printed 4×4 row-major numbers and reversed spiral numbers. Interpret each as a 16-cycle additive GP29 pad on **original unknown pages 16–22**, scanning 16 phases, two signs and book-continuous/page-reset clocks: **320 complete source-prescribed reversible candidate models**.

Their 1,744 actual runes have **18 printed punctuation clauses**, of lengths **87,35,123,86,41,14,48,50,127,115,121,105,69,559,68,68,14,14**. The model selected by the prime-clause scorer is the clockwise spiral, phase 9, negative sign, book-continuous clock, with only **7/18 prime-valued decoded clauses**. This is a recognizability screen; no readable plaintext, genuine source key or mechanism follows.

Critically, a **matched, refitted original null** permutes original rune symbols *within their seven physical pages*, keeps their precise original clause lengths and per-page histogram, then searches **all 320 options again**. With xorshift32 seed `0x15162229` and **1,000** full replicates, **566/1,000** null maxima score at least **7/18** (add-one fraction **567/1001≈0.56643**, mean null max **6.722**). No original signal survives search-aware calibration. The 559-rune clause is also far longer than the short original solved clauses where prime sums are most enriched. This rules out using the currently apparent prime-count maximum as a key discovery in this particular finite 16-cycle model, while preserving the independent score for future authentic key candidates.

The extended [same runnable script](../sims/native_gp_prime_clause_discriminator.cjs) loads the authentic original rune and punctuation streams, asserts exact page alignment against the canonical GP corpus, refits all 320 options in each shuffle, and reproduces both known-plaintext and original negative results. No new CI workflow is needed.

## Unmodified original LP2 clause sums: a modest retrospective excess

A separate check uses **all 12,956 unchanged original LP2 ciphertext runes** and the **168 actual printed punctuation clauses** across physical pages 0–55. This asks whether the source-authenticated prime-sum feature is completely lost even before attempting a key. The original ciphertext itself has **31/168 prime-valued clause sums**. A fixed-seed **10,000-replicate null** shuffles rune values independently inside each physical page, preserving each page's exact rune inventory and all printed punctuation-defined clause lengths. Its mean is **21.8591** primes; **273/10,000** replicates yield at least 31, giving add-one upper-tail **274/10001 = 0.02739726**.

This is a **weak, exploratory ciphertext observation**, not evidence of retained prime-sum plaintext or a recovered key. The feature was chosen because solved, selected Cicada clauses are unusually prime-rich; this full unsolved-book test is retrospective, is not corrected for the broader repository's multiple clues and analyses, and assumes printed `.` marks bound cryptographically meaningful clauses. It justifies retaining clause sums as an optional independent diagnostic for a source-locked plaintext hypothesis. It does **not** establish that an actual candidate plaintext is readable. Reproduce with the same [native prime-clause scorer](../sims/native_gp_prime_clause_discriminator.cjs), which asserts the exact transcription-to-original-rune agreement, 31 observed primes and 273 null exceedances (seed `0x46b17419`).

## Actionable, bounded interpretation

This independent, language-neutral author-specific clue can score a fully specified proposed *unknown* LP2 plaintext **after** its key and segmentation are fixed by source evidence. Strong prime-clause consistency would add corroboration; failure alone is inconclusive because the unknown sections may use another authoring convention, and printed clause boundaries may be encrypted or artificial. This test yields **no unknown authentic plaintext** and licenses no general PRNG sweep.

**Reproduction:** [`sims/native_gp_prime_clause_discriminator.cjs`](../sims/native_gp_prime_clause_discriminator.cjs), Node.js/CommonJS; uses only checked-in source material and a fixed-seed null, without a new CI workflow.
