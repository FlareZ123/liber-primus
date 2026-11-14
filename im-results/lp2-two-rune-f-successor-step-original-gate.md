# Original LP2 two-rune predecessor-step gate: word-final F

**Agent32, 14 November 2026. Status: bounded original-cipher negative; no recovered unknown plaintext, historical key or decoder.**

## Causal hypothesis and original-source decision

The original 55 rune-bearing unknown LP2 pages contain 86 same-physical-page adjacent doublets among 12,901 possible pairs. A human solver who notices this unusually low repeat rate might try a predecessor-step transport, where each ciphertext rune is obtained by adding a transformed plaintext symbol to the preceding ciphertext rune. The historical solved-page special treatment of GP rune **F** (the rare literal-F bypass) makes one natural, explicit experiment: can zero or one other fixed difference encode plaintext F, so that the repeated-rune deficit comes from the rarity of F in prose?

Test the **entire unknown-key, chapter-independent bijection family**

\[
C_{w,j}=C_{w,j-1}+\pi_s(P_{w,j})\pmod {29},\qquad j\ge1,
\]

where \(s\) is one of the nine original-image visual chapters and each \(\pi_s\) is **any** secret permutation of all 29 GP symbols. Each printed word may have an arbitrary first ciphertext rune, so the test does not assume a word-start IV or key. One globally shared permutation is nested in this family. The geometry and word segmentation are frozen from the original artifact. This is intentionally distinct from the earlier long-word **word-reset, independently secret** predecessor-chain gate: here one key is reused across many printed words per chapter, and **only the short-word F position** supplies an all-key invariant.

**Invariant:** Authentic source-native English **OF** and **IF** have two GP runes and both end with plaintext F. For every two-rune word under the model, the sole within-word ciphertext difference must equal \(\pi_s(F)\). Every OF or IF in the same chapter must therefore land in **one identical difference bin**, regardless of the secret 29-symbol permutation. A fixed nonzero step would keep those Fs from yielding doublets; fixing the F step to zero requires equal adjacent ciphertext runes in all such words.

## Exact original input and finite results

The first 55 blocks of [repository original-source transcription](../resources/lp2-transcription.txt) give **2,896 genuine printed words, 12,956 runes and 448 two-rune words**, with the 32 physical-page word carries joined. No two-rune word crosses a page. The global within-word difference histogram in GP-index order is:

```text
1,13,14,15,15,17,20,17,15,18,13,15,16,10,14,9,23,18,20,12,20,11,16,20,20,16,18,21,11
```

The zero-step bin contains **1/448**. The **largest possible single** difference bin contains **23/448**; this is the maximum number of original two-rune plaintext words ending in F if one unknown static predecessor-step permutation covers the entire unknown corpus.

Grant independent unrestricted \(\pi_s\) keys for the nine separately visible chapters, each chosen in the original's favor:

| Original visual chapter | Two-rune words | Largest single difference bin |
| ---: | ---: | ---: |
| 1 | 28 | 3 |
| 2 | 32 | 4 |
| 3 | 56 | 4 |
| 4 | 74 | 6 |
| 5 | 33 | 4 |
| 6 | 51 | 6 |
| 7 | 62 | 5 |
| 8 | 101 | 9 |
| 9 | 11 | 1 |
| **Total** | **448** | **42** |

This **42/448 = 9.375% ceiling** is independent of all nine complete 29-symbol key permutations and their F images. It is a *necessary bound* even if every original rune outside the second position of these words is ignored.

Two independent fixed, pre-2014 native-English source controls provide a meaningful register check. In <i>The Prophet</i>, there are **600 OF/IF among 2,607 two-letter words**; in Emerson's <i>Essays</i>, **3,573 among 15,550**. Across **every contiguous window of 448 two-letter words** in the respective full pinned texts, the minimum number of OF/IF words is **75** in Gibran and **63** in Emerson. Both are strictly greater than the original all-secret, nine-chapter maximum 42. Their first such 448-word windows contain **96** and **94**. This comparison tests the short-word F distribution on original source texts with the same two-letter GP spelling, without fitting language weights to the LP2 output.

A separate **positive planted chapter-bijection** driven by the first 448 genuine Gibran two-letter words uses \(\pi_s(x)=7x+3+s\pmod {29}\). It retains all **96** planted word-final Fs in their selected chapter-specific ciphertext-difference bins. Thus the all-secret bin upper bound recognizes an actual valid source-native construction when it is present.

## Interpretation and limitations

For the two pinned authentic literary registers, **no contiguous original passage with unchanged two-rune word boundaries** could have produced the observed source ciphertext under any global or nine-chapter independently secret bijective predecessor-step mapping. This is a key-independent impossibility for those exact source registers, under that precisely specified cipher model. The strong contradiction does not rely on the few doublet sites: every possible image of F among all 29 step values is granted.

It is reasonable to expect frequent OF/IF in ordinary English, but **the unknown LP2 plaintext has not been established to be any tested text register or to preserve this short-word spelling**. The result does not rule out changing keys per word, stateful mapping dependent on previous plaintext or ciphertext beyond the one-step difference, transparent F escapes with a separate channel, deletions or insertions, word repartition, a different language, or a manuscript written to avoid OF/IF. It is no license to infer the actual plaintext. Exact forward inversion of a wrong secret permutation would not select the historical key.

**Research decision:** Retire the tempting zero-step=F and static chapterwise successor-step explanations when combined with preserved ordinary-English OF/IF usage. Do not widen the same unfixed shift-permutation menu. A useful successor needs original-source evidence selecting a different state transition or authentic external key and should predict actual unknown plaintext.

**Reproducer:** [CommonJS original-input SFT and 448-word source-positive plant](../sims/lp2_two_rune_f_successor_step_sft.cjs); its existing [manual-only native-source workflow](../.github/workflows/lp2-wordlength-frozen-source-retrieval-manual.yml) runs this test alongside earlier independent word-length retrieval. Repository source paths and nine visual-chapter word counts are pinned; external network access is unnecessary.
