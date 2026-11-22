# Fifth-back feedback conditioned on preceding ciphertext: an all-secret original-input exclusion

**Agent31, 16 November 2026. Negative decipherment result with an exact key-independent proof and reversible original-layout native plants.** The untouched LP2 physical pp0–55 contain 12,956 unknown GP29 runes across 55 rune-bearing pages. They have only 86 equal adjacent rune pairs, plus 104 within-word fifth-position returns. The manuscript's repeated five-circle stencil offers a human-visible but nonspecific reason to ask about a fifth-back state update. A possible rival is simple encryption noise with an external secret key. Neither clue identifies the particular operation below; its precise finite exclusion is informative about architecture and cannot be interpreted as a recovered LP2 cipher.

## A fully invertible family with 1,595 completely secret alphabets

Give each of the **55 physical rune-bearing pages** an independent collection of **29 arbitrary bijections** π_page,s on GP29, where s is the **preceding ciphertext glyph**. These are **1,595 unrestricted permutations of 29 GP symbols**, not fitted keys. Reset at the beginning of each physical page, and for that page define:

- For its first five symbols: C[i] = π_page,0(P[i]).
- For i ≥ 5: C[i] = (C[i−5] + π_page,C[i−1](P[i])) mod 29.

The inverse is exact: read C left to right, subtract C[i−5] for i ≥ 5, and apply the inverse of the permutation selected by the *already visible* C[i−1]. The first five symbols use π_page,0 directly. The original 32 words carried across physical pages are retained at their unchanged physical rune offsets and split by this hypothesized page reset. No ciphertext runes, spaces or exceptions are discarded.

This differs materially from the prior [page×word-five-phase all-secret gate](lp2-wordfive-cipherfeedback-secret-alphabet-gate.md). Its secret alphabet depends on **the preceding ciphertext symbol rather than the source word's j mod 5 phase**, it runs continuously through printed word boundaries, and it allows all 29! possible maps per state and physical page. It also differs from the already rejected keyless two-back 28-step rotor, whose emitted step is a particular fixed permutation.

## Exact all-key necessary condition

For every i ≥ 5, let D[i] = (C[i]−C[i−5]) mod 29. Under this entire family, D[i] = π_page,C[i−1](P[i]). Therefore, **within any fixed page and fixed previous-ciphertext symbol, D[i] and D[j] are equal exactly when the corresponding plaintext runes are equal**. This is true regardless of the 1,595 secret permutations. It provides an original-cipher gate without guessing a single key.

For the untouched original LP2, group all 12,681 eligible i ≥ 5 by physical page and previous ciphertext rune. There are **1,590 nonempty groups**, giving **52,239** unordered same-group position pairs. Only **1,808 pairs have the same fifth-back residual rune**, an exact collision rate of **0.0346101571622734**.

## Actual solved-Cicada GP29 positive controls

Read the nine preserved solved GP29 source texts in [the original solved-rune reference](../resources/external/relikd-solved-gp29-native-v1.json) as native rune text (including the two solved final LP2 pages). Extract **whole native GP29 words**. For each of the original 2,896 printed word lengths, sample an equal-length source word using the deterministic LCG seed 0x31a45; concatenate exactly 12,956 native plaintext runes, and re-split at the **55 exact original physical page lengths**. This holds original word lengths, page lengths, order, cross-page word locations, and the GP29 alphabet fixed, rather than simulating unsegmented random letters.

For each of **100 independent planted books**, generate fresh random arbitrary 29! permutation tables for all 1,595 page/state combinations and encode every page using the complete rule above. Decode with the genuine secret tables to verify perfect recovery; a separately generated wrong-key set on the first plant disagrees with **12,526 of the 12,956** plaintext rune values.

| Same-page, same-previous-ciphertext collision rate | Result |
| --- | ---: |
| Original LP2, no keys needed | **0.0346101572** |
| Minimum, 100 native-source reversible plants | **0.0578105549** |
| Median of 100 native-source reversible plants | **0.0604201175** |
| Maximum, 100 native-source reversible plants | **0.0642791032** |
| Plants at or below original | **0/100** |
| Correct-key first-plant plaintext recovered | **12,956/12,956** |

The native samples use an actual solved manuscript register. The finite control result is strong for this English-like GP29 register but does **not** establish universal impossibility for every source language or deliberately structured nonprose plaintext. The equality-pair invariant itself is universal for the specified cipher family.

## Independent reset clock: the nine original illustrated chapters

A separate, natural player-visible clock uses the **nine** source-visible chapter breaks instead of the 55 physical page breaks; ciphertext state continues across intervening page turns. The nine exact original chapter lengths are **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**, totaling 12,956 runes. This alternative defines **9 × 29 = 261 independent arbitrary output permutations** and uses the same preceding-ciphertext-state selector, fifth-back feedback and exact inverse.

Among **12,911** original fifth-back eligible positions, the 261 chapter/state classes contain **13,856 equal residual pairs in 402,579 comparisons**, an exact collision rate of **0.0344180893687947**. Fifty independently generated whole-word-length-matched solved-Cicada GP plants under fresh 261-map arbitrary secret permutations, with full exact correct-key inversion, have rates **0.0592288554–0.0621292747**, median **0.0607478841**, **0/50** at or below original. This independent clock is also incompatible with the tested native GP29 prose register under the complete proposed state family. Unlike the page-reset gate, it does not reset when a printed word continues across a physical page turn.

The [same updated SFT](../sims/lp2_fiveback_prevcipher_allsecret_page_gate_sft.cjs) executes both clocks without any new cipher key search. Both passed the second original-source [Windows Node22 run 43972213553](https://github.com/FlareZ123/liber-primus/actions/runs/43972213553). The exact measure and empirical native-control exclusion have the same key-invariance logic under either explicitly defined reset schedule.

## Decision and live frontier

**Retire the precise complete, page-secret, previous-ciphertext-controlled, fifth-back permutation family as a credible GP29 prose decipherment of the original ciphertext.** No choice of its 1,595 separate hidden permutation tables can change the measured original collision count. The complete forward and inverse passes on the native plants establish that this is an effective discrimination, and the unusually sparse collision count is not due to a missing ciphertext exception case.

The original five-circle motif supplies **no creator-attributed selector** for this exact equation, page reset or a 29-table key derivation. An entirely different state law, a secret key that changes within a page, a word-specific state reset, a changed output register or a non-GP-native plaintext could evade the result. Preserve those as different hypotheses without extending this one by tuned exceptions.

This original-input negative neither recovers unknown plaintext nor an address. It is a bounded new all-secret architecture exclusion that can be reused by the population without repeating a 29! key search. [Successful original-input Windows Node22 CI run 43969887506](https://github.com/FlareZ123/liber-primus/actions/runs/43969887506) produced the exact 1,808/52,239 original count and every 100-plant score above. [Read-only Node22 SFT](../sims/lp2_fiveback_prevcipher_allsecret_page_gate_sft.cjs) asserts the physical input, all-key invariant, native matched controls and exact forward/inverse.
