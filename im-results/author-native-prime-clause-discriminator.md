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

## Unmodified LP2: localized prime-clause enrichment

Applying the source-authenticated GP-prime sum test directly to **all 12,956 unchanged original ciphertext runes** yields **31/168** prime-valued clauses. A fixed-seed **10,000-replicate** null shuffles glyphs independently within each physical LP2 page, keeping every page's exact rune histogram and every printed punctuation clause length unchanged. It has mean **21.8591** prime clauses; **273/10,000** shuffles reach at least the original 31, giving an add-one tail **274/10001≈0.02740**. The source and null are now included in the original [prime-clause scorer](../sims/native_gp_prime_clause_discriminator.cjs).

The excess is localized. Parsing the original nine nonempty `$`-delimited sections from source transcription segments 16–71 gives actual section prime counts **[0,4,6,0,2,0,9,4,6]**, among **[9,17,26,1,19,9,25,19,43]** printed clauses. **Section 6 (zero-based)** spans global rune offsets **[6527,8051)**, intersecting physical **LP2 pages 27–33**, and has **9/25** prime-valued clauses. Their GP-prime sums, in source order, are **1109, 9227, 587, 1637, 2203, 2029, 3571, 379, 4339**. It also contains the first copy of the previously observed repeated two-word bookend phrase; that contextual association was recognized retrospectively and is **not** independent corroboration.

The independent [nine-section source-original test](../sims/native_prime_section_hotspot_original.cjs) refits the **maximum standardized positive prime-count excess among all nine sections** inside each of two 20,000-sample source nulls:

| Original-source matched null | Section 6 null mean | Replicates with ≥9/25 | Refit nine-section maximum at least as strong |
| --- | ---: | ---: | ---: |
| Shuffle glyphs only within each actual physical page | **3.16115** | **39/20,000** (add-one 0.0019999) | **256/20,000** (add-one **0.0128494**) |
| Independently cyclically rotate each complete page rune stream, keeping its exact ring adjacency | **3.20290** | **51/20,000** (add-one 0.0025999) | **312/20,000** (add-one **0.0156492**) |

The second null retains the source's extreme scarcity of adjacent equal runes within each page, except for the page wrap seam. Its comparable outcome indicates this local prime-sum pattern is not solely a side effect of replacing the anti-repeat sequence with an unordered per-page glyph histogram. The finite nine-section model-selection correction is useful, but **does not adjust for all other source clues and search families examined across the repository**. The prime-clause criterion itself was chosen after noticing Cicada's known authored prime-valued text; original punctuation may not delimit plaintext clauses.

**Classification:** a reproducible, exploratory original-ciphertext localization worth retaining as a discriminator when an independently specified decryption mechanism targets physical pages 27–33. It recovers **no unknown plaintext, secret key or encryption algorithm** and does not establish that the observed prime sums were deliberately preserved by the authentic cipher. Numerical counts are neither a source-derived decoding rule nor a stand-alone solution.

## Actionable, bounded interpretation

This conditional, language-neutral author-specific clue can score a fully specified proposed *unknown* LP2 plaintext **after** its key and segmentation are fixed by source evidence. Strong prime-clause consistency would add corroboration; failure alone is inconclusive because the unknown sections may use another authoring convention, and printed clause boundaries may be encrypted or artificial. This test yields **no unknown authentic plaintext** and licenses no general PRNG sweep.

**Reproduction:** [`sims/native_gp_prime_clause_discriminator.cjs`](../sims/native_gp_prime_clause_discriminator.cjs), Node.js/CommonJS; uses only checked-in source material and a fixed-seed null, without a new CI workflow.

## Phase 65 transfer decision — Director #3268 (Agent49, 28 November)

The exact published [Phase 65 code](https://github.com/pnotisdev/cicada3301/blob/main/work/phase65_prime_clause_score.py) (blob b6883bf30ba9692a50a6e1737e1f565a249094d7) and [output](https://github.com/pnotisdev/cicada3301/blob/main/results/analysis/phase65_prime_clause_score.txt) (blob 50728aaba627a97b9b06b29f603d8a0f3ce70355) report 39/88 LP1 clauses, 0.443 vs matched shuffled .145, with 0/2000 null replicates at least as large. It explicitly reports essentially zero power at 300 runes (mean 2.9 complete units) and no enrichment among 1,819 recorded LP2 candidate fragments (.142 vs .141). Merging clauses erases enrichment. Its reported IoC/prime quadrature assumes independence, which is not established; no combined-score claim is required here.

**Question:** does source-selected p57 arithmetic determine an identifying rule elsewhere? The 761 metadata fixes the three p57 body sums, but no source identifies which other clauses must sum to primes. Use all eight other solved sections as transfer targets without tuning a cutoff or selecting chapters by their scores. These sections were already publicly analyzed by Phase 65, so this is a source-held-out transfer diagnostic, not a genuinely unseen author sample or blinded new plaintext. Retain every nonempty . / & unit, including headings. Reconstruct exact known inverses and verify p57 sums 449,1259,1031,1229; reproduce the external 39/88 count.

The following complete finite competing-action ensembles are evaluated independently per section on the original GP streams: (1) all 29 post-inverse additive alphabet relabelings, (2) all 28 cyclic relabelings of non-F symbols with F fixed (identical F positions and parity in every clause), (3) every rotation of the true stream relative to the fixed clause lengths, preserving its entire histogram and circular adjacency. For (1) and (2) these are wrong reversible output relabelings of a correct native inverse, not a historical key family. Each composes with the native encoder via its inverse and therefore exactly replays the same ciphertext. Entries report **number strictly better / number tied including truth**; no multiple-testing p-value is asserted.

| Solved section | Native prime units | GP29 relabel (29) | F-fixed relabel (28) | Boundary rotations (n runes) |
|---|---:|---:|---:|---:|
| 0.0 | 9/10 | 0/1 | 0/1 | 0/1 |
| 0.1 | 7/14 | 0/1 | 0/1 | 0/2 |
| 0.2 | 4/6 | 0/1 | 0/1 | 1/3 |
| 0.3 | 3/22 | 10/9 | 9/7 | 268/215 |
| 0.4 | 9/23 | 0/1 | 0/1 | 0/4 |
| 0.5 | 2/7 | 2/8 | 5/10 | 49/70 |
| 0.6 | 5/6 | 0/1 | 0/1 | 0/1 |
| 0.16 | 1/3 | 1/10 | 1/10 | 5/40 |
| 0.17 | 4/4 | 0/1 | 0/1 | 0/1 |

Five of eight transfer sections uniquely maximize the score over both relabeling families; the remaining three (0.3, 0.5, 0.16) each have strictly better incorrect outputs even in the parity-preserving ensemble. Among boundary rotations, only 0.0 and 0.6 uniquely maximize outside p57; 0.2, 0.3, 0.5 and 0.16 are beaten. The result is more informative than a uniform wrong-key null because the F-fixed alternatives keep exact source F placement and parity. No fixed universal maximization or all-prime filter survives native controls. The three failing sections include the actual terminal solved p56. The external verified transcription differs from the local master in one clause in 0.4; both variants are executed and their full ranks preserved. No decision depends on that variant.

**Exact nonidentifiability of within-clause ordering:** any permutation of the GP runes inside a clause preserves its entire prime sum, not merely the prime flag. For any candidate inverse, compose with a fixed within-clause permutation and precompose its forward map with the inverse permutation: every candidate replays the original and has identical prime-score vector. The reproducer reverses each clause on every solved section and checks exact equality of sums; these changes affect hundreds of runes in long sections. More generally the multiplicity of distinct same-multiset outputs per clause is L! / product of rune-count factorials. Therefore no prime-only constraint resolves anagram/order alternatives inside a fixed clause, even with authentic target sums and perfect replay. It could still distinguish competing candidate inventories or boundaries if independently authenticated checksum targets existed.

**Decision:** retain Phase 65's authorial enrichment as a conditional corroboration diagnostic, including the existing p27–33 exploratory hotspot and Agent43 controls. No independent source selector assigns prime-target conditions to unknown LP2 clauses, and the actual known inverses do not uniformly maximize the score. Do not use it as a hard reject, generic rank tie-breaker for order-only actions, or new search objective. The exact p57 metadata checksum is a positive precedent, not an LP2 oracle. No unknown candidate set was filtered because the stated source gate is unmet; no new LP2 plaintext or key. Reopen only on an independently fixed target/conditional clause grammar and genuinely untouched continuation.

Reproducer: [SFT](../sims/lp2_phase65_clause_identification_sft.cjs), [complete exact ranks and input blob IDs](lp2-phase65-clause-identification.json). Executed the same computational function against both inputs in connected V8; standalone Node/CI not separately run.


## Exact-target feedback receiver — Director #3277 (Agent25, 28 November)

This is a parameter-identification experiment using a **known exact target**, not the generic prime-valued-clause score rejected above. The p57 761 metadata product is 1595277641 = 1259 × 1031 × 1229. The source's actual three body intervals are [7,37), [37,67), [67,95) in canonical zero-based GP29 rune coordinates; the seven-rune title has sum 449 but is not in the product.

Freeze a deliberately simple triangular ciphertext-feedback model (synthetic control family, not an established historical LP2 cipher):

- alphabet indices 0…28, ordinary consuming clock, public initial C[-1]=0;
- forward C[i] = (P[i] + a*C[i−1] + b) mod29;
- inverse P[i] = (C[i] − a*C[i−1] − b) mod29;
- a,b independently in 0…28; 841 possible keys; no F hold, dictionary, phase fitting, or unknown text selection.

For each candidate key compute the assigned GP-prime sum of the first two body intervals. The stronger source-only variant permits any two distinct members of the product factor set (no supplied factor ordering); the remaining factor is then the prediction on the third interval. The ordered variant uses the known p57 assignments 1259,1031 as training. The title sum is an additional known-native control, never a selection input. This is different from #2754 and #3056: no decoded prime sum updates the cipher state, and no prime-valued count is maximized; the exact externally known numbers filter keys.

All 841 hidden (a,b) controls are honest re-encipherments of the unchanged 95-rune native p57 plaintext. The key-selection code receives only ciphertext and exact training checks, not the actual coefficients, plaintext sequence or withheld third-interval symbols. For negative controls use 128 deterministic nonzero-a wrong-family plaintext-feedback encipherments and 128 ciphertext shuffles. Separately permute plaintext within each of the four intervals before enciphering, preserving all exact targets while destroying its native order. The latter tests the structural limitation, rather than expecting an order-independent checksum to reject its own invariance class.

| Control | Number | Unique training key | Any key passing training | Unique held key |
|---|---:|---:|---:|---:|
| Correct native plants | 841 | 841 | 841 | 841 |
| Wrong-family plaintext feedback | 128 | 0 | 0 | 0 |
| Globally shuffled ciphertext | 128 | 0 | 0 | 0 |
| Within-interval shuffled native plaintext, then correctly encrypted | 128 | 128 | 128 | 128 |

Both ordered and unordered factor rules give exactly these counts, and all authentic-order plants recover all 95 runes. All 128 shuffled-plaintext plants recover the shuffled text exactly, not the original order; checksum validation cannot distinguish them. The third interval is held out from key selection, but it is still part of the same 95-rune known source page and its target is a dependent factor of the product. This is not cross-author or independently novel-text generalization. The controls are deterministic on one native page; 0/128 is not a universal false-positive bound. The test was executed in connected V8 against canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, with seed 0x3277a025 and final RNG state 2038539647. Reproducer: [exact checksum feedback receiver](../sims/lp2_exact_checksum_feedback_receiver_sft.cjs). Standalone Node/CI not separately run.

**Original gate:** #3268 and the original corpus review identify no first-party checksum target/interval binding for an unknown LP2 unit. The p33 cuneiform 1033/3301 corresponds to Stage10 square sums, not an authenticated sum for any unknown rune clause; the literal word-sum transfer is already rejected in the existing square report. The p57 factors apply to p57 only. Accordingly no original interval was ranked or decrypted under a fabricated target. Exact numeric targets would make this small receiver identifiable on the demonstrated native geometry, but a source-specified recipient and compatible ordinary feedback clock are still required. H-shuffle/H-decoy remain unresolved. Close #3277 as native parameter-selection success with missing original typed witness; no new historical key/plaintext, no feedback-family endorsement.

## Named unknown-unit target acquisition — Director #3276 (Agent25, 28 November)

The required witness is an independently authored integer/checksum, an explicit recipient interval in the unknown LP2 runes, and a specified aggregation convention. The known checksum family has one unambiguous recipient, solved p57: 761 is the GP-prime sum of its title and 1595277641 is the product of its three body-clause sums. Neither is an independently assigned target for another page. The historical 761 investigation (#1051/#1377/#976) and the second audio metadata investigation (#612) do not identify another named recipient. The latter's original Interconnectedness file has title/artist text rather than a second TXXX checksum instruction.

The other numerical source objects are not interchangeable checksum targets: p33 1033/3301 are the known Stage10 square totals (the direct word-sum transfer has already failed); p15's numeric spiral has its own solved number-generation role; the p36–38 red 1–5 labels identify successive items rather than specify their GP sums; the p10 isolated 7 lacks a typed aggregation instruction. The Stage11 release index's 133/331 identifiers and bare image links (#233/#409) do not bind a target to a text unit. Its signed handoff gives the destination and encouragement, not a text-checksum instruction. The p56 hexadecimal target is explicitly a hash of a sought external page, not a supplied GP checksum of an unknown LP2 rune interval.

No exact target/recipient binding follows from these original objects or the bounded historical corpus reviewed. This is a missing input, not evidence that no such witness could ever be recovered. No generic scoring, numerical reassignment, or original-text fitting was performed. The executable #3277 receiver remains available if two independently assigned targets become available; one new target would already enable a bounded candidate filter, but cannot be assumed sufficient to identify a key. Reopen for a genuinely named external or manuscript checksum instruction. No new plaintext or historical key.
