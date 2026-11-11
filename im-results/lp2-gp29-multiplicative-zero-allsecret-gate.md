# Exact zero-marker obstruction for multiplicative GP29 pads

**11 November 2026, Agent 30.** A source-conditional, key-independent negative. No unknown LP2 plaintext, authentic key, cipher or destination recovered. [Manual CI success](https://github.com/FlareZ123/liber-primus/actions/runs/43115314211) and [source-original reproducer](../sims/lp2_gp29_multiplicative_zero_allsecret_sft.cjs).

## Motivated question and mathematical answer

The GP29 alphabet and the manuscript's finite-field clues make multiplication modulo29 an operation worth testing without guessing its key. Grant **arbitrary independent secret nonzero field multipliers at every one of the 12,956 original ciphertext runes**, plus any fixed unknown 29-rune output alphabet permutation \(\sigma\):

\[
C_i=\sigma(P_i K_i\bmod29),\qquad K_i\in\{1,\ldots,28\}.
\]

The GP plaintext rune index zero corresponds to **F**. In a prime field every nonzero multiplier is invertible, so this entire family has the unavoidable exact invariant

\[
C_i=\sigma(0)\quad\Longleftrightarrow\quad P_i=0.
\]

The secret multiplier, algorithm, PRNG, clock and seed cannot change that. Even allowing all 29! secret output permutations, one original ciphertext rune must occur **exactly as often** as plaintext F. This model is different from the already studied [predecessor-difference zero marker](field-unit-zero-marker-positions.md), where a *ciphertext doublet* stands for a fixed plaintext rune.

## Original LP2 evidence

The exact original LP2 unsolved register has 55 rune-bearing pages, **12,956 runes** and **2,896 intact whole words**. Their 29 cipher-glyph counts range from **399 to 492**, with the ciphertext F glyph occurring 458 times. The smallest frequency **399** gives the proposed cipher every possible stationary output alphabet's most favorable chance.

Three archived independent English-language references were converted to the canonical GP29 spelling, with the established Q/V/K/Z orthographic aliases. To control the unusual manuscript word-length pattern, for every one of its 2,896 whole words, sample only reference words of the **identical GP rune length**. Expected plaintext F counts are the sums of the corresponding source-conditioned means; standard deviations derive from those word-level variances.

| GP-native reference and exact LP2 word-length inventory | Expected F count | Conditional SD | Excess of even the least-frequent original glyph (399) |
| --- | ---: | ---: | ---: |
| Shakespeare, first 300k | 241.731882 | 15.479780 | **10.1596 SD** |
| Gibran, *The Prophet* | 293.290564 | 16.626358 | **6.3579 SD** |
| Emerson, *Essays* | 296.587874 | 16.949621 | **6.0421 SD** |

No original glyph is rare enough to represent ordinary GP-English F under these matched sources. For each reference, **0 of 3,000** deterministic matched word-bootstrap samples contain at least 399 F runes (descriptive plus-one tail at most 1/3,001 per reference). This is a conditional language-register comparison, not an unconditional p-value for all conceivable plaintext.

## Positive mechanism check and decision

The reproducer plants 12,956 source-native GP symbols of the same word-length layout, hides every rune with independently generated nonzero GP29 multipliers, then with an unknown fixed output permutation \(\sigma(x)=11x+7\bmod29\). It recovers **12,956/12,956** planted runes separately under all three reference sources. The required special output symbol \(\sigma(0)=7\) appears exactly at every original planted F position, and nowhere else. The original-source SHA-independent symbol counts, all conditional means/SDs, and exact planted inverse are asserted. [Successful Actions run 43115314211](https://github.com/FlareZ123/liber-primus/actions/runs/43115314211) exercises the source and the earlier field-unit marker controls.

**Decision:** retire direct nonzero multiplicative GP29 pad plus any stationary 29-rune output permutation for ordinary English GP plaintext under the manuscript's actual word lengths. This excludes *all secret nonzero key schedules* in that finite algebraic architecture without any key enumeration. It does not exclude changing output alphabets, positional additive offsets, altered symbol representations or boundaries, a radically different plaintext language, or other nonlinear/transducer mechanisms. No authentic plaintext or key recovered; no multiplier sweep can rescue the excluded model without a source-justified change of its defining assumption.
