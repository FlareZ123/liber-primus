# LP2 opening: exact 13×12 word grid and direct-row decryption boundary

**Agent27, 17 November 2026. Evidence class: original-source layout plus a bounded all-secret decoder exclusion.** The first original LP2 chapter provides an exact 13×12 grid of complete printed *black-body words* after its 13-rune red heading. This is a feasible physical reformatting operation for a human solver, with a concrete title-length and totient rationale. The original source does **not** prescribe a grid reading order, a row cipher, or a title-key interpretation. No unknown-page plaintext or authentic key was recovered.

## Exact source construction and competing premise

Canonical inputs are [original transcription](../resources/liber-primus/lp2-transcription.txt), [GP29 original indices](../resources/liber-primus/lp2-corpus.json), and the byte-pinned LP2 photographs `17.jpg`–`19.jpg`. Original physical p0–p2 contain 729 runes = 27², previously investigated as a 27×27 *rune* grid. This test constructs a **distinct, word-based geometry** without guessing ciphertext:

- Physical p0 red title comprises the actual eight-rune word `S H E O G M IA F` and five-rune word `S Y E NG C`, exactly 13 GP runes. The following 13-dot marker visibly separates title from body. Euler φ(13)=12 supplies a natural possible second dimension, although no author instruction confirms it.
- The complete p0–p2 transcription, keeping the 32-rune across-page word-continuation conventions intact, contains exactly **158 printed words**. Removing the two title words leaves **156 words = 13×12** and **716 body runes = 729−13**.
- Partition the 156 original consecutive whole words into 13 consecutive rows of 12. The exact body row lengths in runes are **[60,44,56,48,66,47,42,64,46,45,63,68,67]**. Concatenation of these parsed words reproduces all 716 canonical original source indices exactly.

An apparently attractive first decoding interpretation uses one red title rune per 12-word row, with a rowwise additive GP29 offset. The **more permissive** model grants the attacker *any* unknown 29-symbol bijection for each of the 13 rows and allows arbitrary rearrangement of complete words **inside** each row. If this can yield ordinary GP-native English, the within-row equal-rune pair total is unchanged under the entire secret family.

## Complete original-input test

For each row with `n` rune positions, sum `n(n−1)` ordered pairs and the count `Σ_s count(s)(count(s)−1)` of positions holding the same rune, over all 13 rows. For a secret row permutation `π_r`, `C_i=C_j` iff `π_r(C_i)=π_r(C_j)`; the equality statistic is therefore **key-independent**. A within-row word rearrangement leaves symbol multiplicities unchanged.

| 13×12 word-grid register | Ordered within-row pairs | Equal-rune pairs | Equal-rune fraction |
|---|---:|---:|---:|
| **Original p0–p2 black body** | **39,908** | **1,428** | **0.03578229928836323** |
| Solved-Cicada native GP29 source, 2,264 consecutive 716-rune windows with identical row-length partition | 39,908 each | at least 2,116 | **minimum 0.053021950486118075**, median 0.06094016237345896, maximum 0.06730480104239751 |

The controls use the **2,979 genuine solved native-GP runes** from `resources/external/relikd-solved-gp29-native-v1.json`. All 2,264 possible contiguous 716-rune control windows were counted, keeping *exactly the thirteen original row rune lengths*. **Zero controls are at or below the original value**. The overlapping control windows are dependent, so this is an empirical source-register separation and not a discovery-adjusted significance claim.

As a source-key illustration, subtracting the literal original red-title rune index once per 12-word row gives first two words `TAELI`, `XAEW`; adding gives `BYNGJ`, `SYH`. Neither is meaningful direct GP prose. Both operations exactly re-encrypt all 716 original runes. More importantly, the rigorous all-secret equality obstruction does not depend on those two specific rotations.

A separately constructed full-length **716-rune native GP positive** was encrypted under 13 independently shuffled, arbitrary hidden 29-symbol row alphabets, with exactly the same row-length partition. Its exact inverse recovers **716/716** runes and preserves the full collision profile, demonstrating the power and correctness of this model-family test.

## What this changes

The visible 13×12 **word geometry is worth retaining as a possible human-oriented cipher layout**. Its tempting simplest consumer, a bijective alphabet fixed across each 12-word row, cannot reproduce the within-row collision profile of the actual solved Cicada GP register, even with thirteen completely secret alphabets and free within-row word order. A simple rowwise key derived from the 13 red title glyphs therefore has no direct ordinary-GP-prose route. A separately motivated transform that changes row-level letter collision statistics, an inter-row transposition, a changing word-internal state, or an alternative linguistic register remains possible. Do not promote the 13×12 cardinality to a discovered original cipher or plaintext without a decisive nonsemantic source-selected continuation.

The complete [standalone, read-only CommonJS SFT](../sims/lp2_p0_red13_wordgrid13x12_allsecret_sft.cjs) asserts original source integrity, all counts and control extremes, literal red-key forward reversibility, and full synthetic 13-secret-alphabet recovery.
