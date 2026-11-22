# Previous ciphertext word's GP-prime sum does not select the unknown-page zero successor

**18 November 2026, Agent 1.** Exact original-cipher finite rejection of a particular causal, changing exception. No recovered LP2 plaintext or authenticated author key. [Original-input Windows Node22 success](https://github.com/FlareZ123/liber-primus/actions/runs/44213261135) and [reproduction CJS](../sims/lp2_previous_cipherword_prime_zero_exception_sft.cjs).

## Proposed source-causal mechanism

The signed 2016 Cicada sentence about words, their numbers, and their direction motivates examining word-derived state. The strongest missing ingredient of earlier constant-exception attacks is a changing exceptional rune. Here select it from **only already-visible ciphertext**, never from unknown future plaintext:

For every printed GP29 word w after the first, define r_w = (sum of GP **prime values** of the runes in preceding printed *ciphertext* word w−1) modulo29. Each position j≥1 of word w has a fresh arbitrary keyed GP29 bijection f_wj from the 29 current plaintext runes into ciphertext successor differences, subject only to f_wj(r_w)=0. The cipher emits C_wj = C_w,j−1 + f_wj(P_wj) modulo29. Word-first symbols can carry arbitrary independent IVs. Thus C_wj equals C_w,j−1 if and only if current plaintext P_wj is the known source-computed r_w. The other 28 mapping values can be rekeyed freely **at every position**. The operation is invertible given a key and allows both disjoint p27 doublets. A complete synthetic causal encryption and inversion exactly recovers clear original p57's 95 runes across 20 words.

No first-party instruction specifies this use of *preceding ciphertext word*, prime summation, reduction or zero-successor semantics. This is a specifically declared experiment, not a discovered Cicada algorithm.

## Source-exact whole-book test

The SFT parses the original source into **2,896** words, **12,956** rune ordinals and **32** words crossing actual physical pages, matching the independent corpus rune for rune. Lines and pages carry words; printed punctuation terminates them. Drop all word-initial positions, the seven eligible interior positions in the first word (no predecessor), and physical page-crossing transitions. The remaining **10,021** same-page within-word sites contain exactly **63** original ciphertext equalities.

All 2,895 previous-ciphertext-word prime sums are computable directly from the original source before any plaintext scoring. The exceptional rune for the original p27 12-rune word at global word1476 becomes GP **C** (index5); under the script's frozen **29,060 distinct GP spellings** derived from preexisting TextBlob English wordfreq, the sole 12-rune word satisfying both repeated pairs with sentinel C is HYDROCHLORIC. This is a pattern-compatible native word, not recovered text. On 2,863 completely page-contained eligible words, 2,861 have at least one dictionary candidate; the two 4-rune incompatible words lie at original global word indices1024 (p19, r=J) and1597 (p29, r=EO). Isolated word shape provides little proof on its own.

The decisive original-input event-density gate freezes each preceding source-word marker r_w, *every actual original word length*, and the exact page-carry masks. At each source word position independently draw a true native GP-English word of equal rune length from the existing combined preselected literary controls: Gibran (15,733 source words, 62,492 GP runes), Shakespeare (55,407 words, 217,106 runes) and Emerson (77,932 words, 321,327 runes). At every eligible position count whether the independent native plaintext rune equals its original predecessor-ciphertext-derived sentinel r_w. This is the exact event a repeated ciphertext rune would require, under any secret changing bijections for the remaining 28 symbols.

| Event statistic | Original | 10,000 source-word-matched synthetic texts |
| --- | ---: | ---: |
| Eligible same-page interior sites | 10,021 | 10,021 |
| Equal ciphertext successors / forced plain sentinel | **63** | **mean 345.2423** |
| Minimum | | **284** |
| First percentile | | **306** |
| Median | | **345** |
| Ninety-ninth percentile | | **386** |
| Maximum | | **404** |
| At or below original 63 | | **0 / 10,000** |

The exact xorshift32 seed is 0x3301. Real controls are sampled by native GP rune-word length with replacement. The empirical null is conditional on intact source word segmentation, ordinary native GP-English, the selected source-derived rule, and actual original markers. It is not a discovery-wide p-value, and it does not include non-English plaintext or resegmented intermediate codes.

## Conclusion and dependency

This precise previous-*ciphertext*-word prime-sum zero-exception architecture fails the original event density by a large margin under genuine source-native English, even after granting arbitrary secret 28-way substitutions at every rune. Nothing in source selects this exact operation. Do not search its remaining key space.

This rules out a *specific within-chapter-changing* sentinel route beyond the separately excluded [chapter-stationary current plaintext sentinel](lp2-current-rune-exception-p27-chapter-gate.md) and Agent2's fixed previous-*plaintext*-difference marker gates. A prior **plaintext** word sum, a different source-authored operation, another intermediate representation, or changed token boundaries remain possible and require independent motivation.
