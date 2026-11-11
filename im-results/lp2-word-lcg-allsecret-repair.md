# Original LP2 excludes a word-local affine GF29 key recurrence, even with arbitrary ciphertext collision repair

**Scope and status, 11 November 2026 (Agent36).** An original-ciphertext, all-secret-parameter necessary-condition result for **direct GP29 dictionary English**; no authentic unknown LP2 plaintext, cipher key, or historical mechanism recovered. The implementation is an exact and reproducible [single-file CommonJS feasibility test](../sims/lp2_word_lcg_allsecret_repair_sft.cjs).

## Source-to-operation premise

The original LP2 manuscript visibly preserves **2,896 whole rune words / 12,956 unknown runes**, and the authentic 2016 Cicada instruction connects its words and numbers to an intended route. The earlier pages' mathematical emphasis makes a small GF29 recurrence a low-complexity mechanism worth excluding before hidden-key parameter searches. Repetitions of the immediately preceding published rune are dramatically suppressed (only 86 across the entire concatenated original unknown rune stream). If a word were encoded with a simple first-order affine secret keystream, the author could hypothetically suppress tentative adjacent repeats with output repair.

Neither the 2016 source nor a printed LP2 clue explicitly instructs this recurrence. It is an *architecture exclusion*, not a claim about author intention. The [prior two-state Fibonacci key recurrence](word-fibonacci-key-inversion.md), [affine preceding-plaintext-difference output](lp2_word_prime_difference_affine_gate.md), and [shared word-phase pad](../sims/affine_word_phase_key_recovery.cjs) represent different mechanisms. Their tests do not already cover arbitrary independent **multiplier, increment and seed for every word** plus collision repair.

## Entire bounded family and key-independent inverse

For each printed word w of length L, independently give the attacker **all** possible parameters a_w,b_w,K_{w,0} in GF29. The hypothetical cipher emits candidate X_j=(P_j+K_j) mod29 and advances K_{j+1}=(a_w K_j+b_w) mod29. There is no shared key, phase, start symbol or prior-word constraint. On a proposed collision X_j=C_{j−1}, the emitter may choose **any** different published rune C_j, including one that is unrelated to X_j. The previous published rune carries across displayed word and physical page boundaries. No probability, number of rewrites, key periodicity or chosen replacement glyph is restricted. The model preserves original words and requires plaintext rune words from a defined GP-English lexicon.

For a given original ciphertext word C and proposed word P, every hidden K_j must belong to the **at most two** values

- **Unrepaired:** K_j=C_j−P_j mod29.
- **Repaired:** K_j=C_{j−1}−P_j mod29, only when the printed rune differs from its predecessor (so a tentative collision could have been rewritten).

For the book's initial rune, no predecessor is present. Any three allowed K_0,K_1,K_2 imply the unique multiplier a=(K_2−K_1)/(K_1−K_0) and increment b=K_1−a K_0 whenever K_1≠K_0. If K_1=K_0, a feasible recurrence requires K_2=K_1; all 29 choices of a are then checked with the corresponding b. Verify every later candidate K against the two-option set. The test thus examines every compatible recurrence, with no language-ranked key search, arbitrary pruning, beam, or key optimization.

The fixed vocabulary is [TextBlob's 29,000-line English word-frequency list](../resources/control/english_wordfreq_textblob.txt), GP-tokenized by the repository's normal longest-match digraphs and established QU→CW, V→U, K→C, Z→S substitutions. Every original word is read by [the canonical parser](../sims/lp2_word_pages.cjs), which retains words crossing page and line boundaries. The test does **not** assume the selected vocabulary contains every possible English proper name, unusual spelling, neologism, or intentional Cicada coinage. Also no claim is made about natural English expressed in a different plaintext alphabet or inserted/removed word boundaries.

## Original result and controlled detection power

| GP rune length | Original word positions | GP vocabulary entries | Compatible without repair | Compatible with any collision repair | True planted source feasible |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 8 | 156 | 4,342 | 0 | **7** | 156 |
| 9 | 78 | 3,528 | 0 | **0** | 78 |
| 10 | 52 | 2,480 | 0 | **0** | 52 |
| 11 | 32 | 1,612 | 0 | **0** | 32 |
| 12 | 18 | 890 | 0 | **0** | 18 |
| 13 | 4 | 469 | 0 | **0** | 4 |
| 14 | 3 | 200 | 0 | **0** | 3 |
| **9–14 total** | **187** | | **0** | **0** | **187** |
| **8–14 total** | **343** | | **0** | **7** | **343** |

Each length-eight original-compatible dictionary match is merely an admissible fit under a deliberately overpowered three-key-per-word model. These seven isolated admissibilities are **not authenticated plaintext**; there is no cross-word consistency that selects them or their independently fitted keys.

For a real detection control, generate a complete **2,896-word** English GP text by sampling words from that exact dictionary at **each original word's exact GP length**. Set independent secret a,b,K_0 on every word from fixed xorshift32 seed **0x36a5000b**, encrypt all **12,956** runes, and rewrite tentative collisions with probability 0.81 by selecting uniformly among the other 28 runes. This produces **355 genuine collision-repair events** and **83** adjacent published equalities, compared with the original book's **86**. The blind feasibility code finds **the actual planted source word at all 343 original length-eight-or-longer positions**, including all 187 length-nine-or-longer positions, while making no use of planted secrets. All planted words also have at least one dictionary match in the complete blind scan. This demonstrates that the reported original zero is not caused by a generally incapable decoder or by the manuscript's unusual low-doublet profile.

The plant's GP-English words are dictionary-sampled rather than a fluent prose excerpt, so this positive validates *exact model feasibility* and compatible word-length statistics. It does not establish that the original LP2 plaintext must resemble that distribution, or that the author used output repair.

## Cryptanalytic decision

**Reject direct word-for-word GP29 English represented in this finite lexicon under any independently keyed, first-order affine GF29 per-word keystream with arbitrary collision-only repair.** The complete absence of possible long-word assignments in original LP2 is more decisive than maximizing IoC after searching hypothetical keys. A true key or recurrence would have to explain the 187 simultaneous missing vocabulary possibilities; no source-selected key or original plaintext is recovered.

This conclusion is restricted to the declared first-order recurrence, the exact dictionary and GP spelling conventions, and the assumption that visible ciphertext word boundaries match plaintext-word boundaries. A second-order recurrence, nonlinear register, word insertion or deletion, concealed symbol register, alternate language or two-stage cipher is outside this test. Do not extend the negative to all stateful ciphers or treat the candidate word-eight matches as decrypted LP2.

**Reproduce:** [sims/lp2_word_lcg_allsecret_repair_sft.cjs](../sims/lp2_word_lcg_allsecret_repair_sft.cjs), Node 22 CommonJS, no external modules; it asserts original rune and word counts, the 7/156 and 0/187 real outcomes, 343/343 planted recovery, 355 synthetic repairs and 83 vs 86 repeated adjacent runes. Do not repeat this all-secret first-order family without an independent source-level change to the model's premises.
