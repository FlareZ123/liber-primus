# Unknown-tableau recovery is possible with an oracle key path; LP2 key-state inference remains open

**Agent4, 17 November 2026. Director [#1342](https://github.com/FlareZ123/liber-primus/issues/1342). Classification:** controlled cryptanalytic algorithm on source-native planted messages, with two distinct decoder calibrations. A strong GP29 bigram/tableau optimizer correctly recovers **97.2368%** of the planted manuscript-length plaintext **when supplied the true secret per-rune key/tableau-row history**. The original LP2 provides no such row history; **no authentic unknown-page plaintext, key, tableau, or continuation has been recovered.**

## Actual first-party clue and strictly external calibration

Four visible apostrophes in the untouched LP2 original appear after zero-based global unknown-runic indices **1110** (p4), **5138** (p21), **8515** (p35) and **10089** (p41). The complete ciphertext word shapes are respectively **3+1, 2+1, 2+1, 3+1**. Original solved LP1 `I RWN'B → I DON'T`, with five known GP29 Vigenère shifts `FIRFU`, proves the same physical glyph can preserve English contracted punctuation without adding a rune or consuming a key symbol. The corresponding LP2 words' actual plaintext remains unknown.

Using the genuinely solved p56 cipher as a source-derived *key-stream family*, define row labels `K_j = (prime[j]−1) mod29` for successive ordinary primes starting from 2. An H2 candidate encoder contains **29 independent secret permutations** of the 29-symbol Gematria Primus alphabet: `C_i = T[K_{j_i}][P_i]`. If a proposed output equals the preceding ciphertext rune, the encoder skips to the next key row and redraws with probability **q=0.81**. This published skip model approximates the original book's 86 adjacent duplicate runes but is **hypothetical**; the original full-runic text does not independently authenticate this cipher.

The calibration uses **eight** reproducible random 12,956-rune source-native English windows from Gibran (*The Prophet*) for the strong decoder and **100** such windows for its weaker baseline, with completely random 29×29 permutation tableaux and authentic successively generated prime-totient row labels. The four exact original global apostrophe offsets receive length-preserving planted plaintext `DON'T / IT'S / HE'S / CAN'T`, respectively. These are **test-only fake cribs**, not proposed original LP2 solutions. The actual rows and encoded ciphertext at every position remain hidden from both decoders' optimization.

**Critical privilege:** both decoders are explicitly **given the entire true per-rune row history `K_{j_i}`**, including every position where the true encryptor discarded a repeated proposed ciphertext glyph and advanced the key. This is an *oracle control*, not information present in the original unknown LP2. The true secret per-row permutations and all other plaintext glyphs are withheld from the optimizers. With the true permutations plus row history, every 12,956-rune plant roundtrips exactly; the 100 baseline trials have mean 88.23 ciphertext doublets versus original 86.

## Unigram-only baseline: underpowered, initially mistaken for a terminal exclusion

The initial decoder was an optimistic **unigram maximum-likelihood assignment**. It first fixed the seven true GP29 training rune correspondences from the first two planted contractions. For each of the 29 secret key rows, it then matched the remaining ciphertext symbols in descending frequency order to an independent Shakespeare GP29 frequency table, enforcing one-to-one mappings. It had access to *all* 12,956 ciphertext glyph counts and the correct true row at each position.

| Across 100 deterministic 12,956-rune plants | Complete withheld two words, 7 runes | Withheld contiguous 150-rune passage |
|---|---:|---:|
| Secret inverse entries **proved by the seven true crib glyphs alone**, mean | **0.21 / 7** (zero in 81/100) | **2.31 / 150** |
| True-row **unigram ML with two correct cribs**, mean correct glyphs | **1.79 / 7** | **42.23 / 150** |
| Same unigram ML **without cribs**, mean correct glyphs | **1.58 / 7** | **40.37 / 150** |
| Same unigram ML with **deliberately wrong cribs**, mean correct glyphs | **1.75 / 7** | **40.12 / 150** |

The unigram-only decoder recovers both withheld words in **0/100** trials, and the entire withheld 150-rune window in **0/100**. It identifies no usable source tableau. This **does not establish global identifiability limits** once plaintext-adjacency constraints are exploited; the follow-up bigram decoder below overturns any broader interpretation of this negative. The [100-plant unigram SFT](../sims/lp2_h2_apostrophe_oracle_recoverability_sft.cjs) asserts all numbers and the source punctuation/p56 cipher controls.

## New positive: reversible hidden-tableau recovery via bigram likelihood and Hungarian assignment

**Method, independent of original plaintext:** train GP29 bigram log-probabilities once from the separate Shakespeare reference. Initialize each inverse row by unigram frequency matching while fixing the same seven planted crib correspondences. Hold all other rows fixed, then for every candidate inverse of a given row compute the sum of log-probabilities of the candidate's preceding and following plaintext rune neighbors throughout all 12,956 positions assigned to that row. Solve the entire row as a **29×29 maximum-weight bipartite matching problem** using the exact Hungarian algorithm. Cycle once through all 29 key rows, alternating forward and reverse row order, **12 complete sweeps**. This algorithm never reads the planted true plaintext during optimization; `truth` is referenced solely after each sweep to assess recovery. All row mappings remain permutation-valid and respect the seven known cribs.

Under the **same** H2 prime-totient, q=0.81 repeat-rejection simulation, all eight independently planted 12,956-rune messages decrypt to coherent native GP29 English under the correct supplied row histories. Mean correctly recovered glyphs at the fixed 12th sweep: **12,598 / 12,956 = 97.2368%** (individual range **11,719–12,852**). Mean withheld two-word glyph recovery **6.75 / 7**; mean withheld 150-rune passage recovery **145.5 / 150**. Six out of eight trials recover *all seven* withheld contraction glyphs; each trial recovers at least six. A genuinely independent forward/reverse check with the *true hidden inverse table* recovers exactly **12,956/12,956** before any training or optimization, confirming synthetic ciphertext generation.

| Trial (seed `0x3301abcd + trial×1013904223`) | Correct of 12,956 | Held-out 7 runes | Held-out 150 runes |
|---:|---:|---:|---:|
| 0 | 12,815 | 7 | 148 |
| 1 | 12,110 | 6 | 141 |
| 2 | 12,789 | 7 | 150 |
| 3 | 12,819 | 6 | 149 |
| 4 | 11,719 | 7 | 134 |
| 5 | 12,843 | 7 | 144 |
| 6 | 12,837 | 7 | 148 |
| 7 | 12,852 | 7 | 150 |

The 97% figure is **conditional on the supplied true per-position row path** and was measured on synthetic English text. A random 29×29 tableau thus is *learnable* from manuscript-length contiguous language **when the key-state trajectory is known**; the original calibration's apparent obstacle is the **unknown drift/skip trajectory**. It remains to determine whether the two short apostrophe cribs materially improve this bigram solver relative to no cribs; such incremental comparison is not established by the strong positive. No original unknown text was passed to this decoder because an actual row path was neither identified from first-party clues nor recovered without an oracle.

The stand-alone [eight-plant Windows Node22 CJS](../sims/lp2_h2_oracle_bigram_hungarian_sft.cjs) reproduces the full-source original punctuation positions, inverse secret-table controls, exact per-trial results, likelihood-matched 29×29 permutations and independent heldout ranges. A second [100-plant unigram control](../sims/lp2_h2_apostrophe_oracle_recoverability_sft.cjs) preserves the original weak result. The seeded source-native calibration does not imply that real LP2 uses the hypothetical H2 generator.

## Causal next decision

**This is a substantive algorithmic positive on controlled ciphertext, not a manuscript decryption.** Instead of additional freely chosen ciphers, prioritize a **blinded recovery of the true key-row trajectory** from planted H2 q=0.81 ciphertext without revealing skip positions. Freeze the successful bigram/Hungarian table optimizer and try finite, source-derived pointer trajectories with a key-path inference algorithm that can survive early uncertain skips. Demand heldout plaintext recovery against independent true-path/no-path controls *before* testing untouched LP2 pages. An immediately source-selected physical clue pinning a full key pointer (or sufficiently long genuine plaintext crib) would also make an original-cipher inversion informative. The existing cross-page lag-six anomaly and missing source-level H2 selector remain serious rival evidence against taking this artificial cipher as the author's construction.
